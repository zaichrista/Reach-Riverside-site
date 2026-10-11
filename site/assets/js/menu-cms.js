/* Loads the menu from the Wix CMS (one collection, "menu": a row per dish or drink) and hands it to
   menus.js to draw. The restaurant edits it in the Wix dashboard (Content Manager > Menu).
   - Rows are grouped by their Menu column (a tab) and then by their Section column (a heading).
   - A row with HIDE ticked is left out; a menu with no visible rows has no tab.
   - Order: the optional Order number; rows without one follow in the order they were added.
     Menus and sections are ordered by their lowest-numbered row.
   - With data-menu="<slug>" on #menu-root a page draws just that menu (the Christmas page);
     otherwise every menu is listed, as tabs when there is more than one.
   The last good copy is kept in localStorage so repeat visits paint instantly. */
import { queryItems } from "../../js/wix/items.js";

var root = document.getElementById("menu-root");
var CACHE = "reach-menu-cache-v4";
var only = root && root.getAttribute("data-menu");

function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

async function all(collectionId, query) {
  var out = [], skip = 0, page;
  do {
    page = await queryItems(collectionId, Object.assign({}, query, { limit: 100, skip: skip }));
    out = out.concat(page.items);
    skip += 100;
  } while (page.hasNext && skip < 2000);
  return out;
}

async function fetchAll() {
  return { rows: await all("menu", { sort: [{ field: "sortOrder" }] }) };
}

function slug(t) { return String(t || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function num(v) { return typeof v === "number" ? v : Infinity; }
function byOrder(a, b) {
  return num(a.sortOrder) - num(b.sortOrder) || String(a._createdDate).localeCompare(String(b._createdDate));
}

/* rows -> [{ slug, title, sections: [{ id, title, note, wine, head, items }] }], in display order */
function group(d) {
  var menus = {}, list = [];
  d.rows.filter(function (r) { return !r.hide && r.menu && r.section && r.name; }).sort(byOrder).forEach(function (r) {
    var mk = slug(r.menu), m = menus[mk];
    if (!m) { m = menus[mk] = { slug: mk, title: String(r.menu).trim(), order: num(r.sortOrder), sections: {}, list: [] }; list.push(m); }
    var sk = slug(r.section), s = m.sections[sk];
    if (!s) { s = m.sections[sk] = { id: sk, title: String(r.section).trim(), group: "", note: "", items: [] }; m.list.push(s); }
    if (r.sectionNote && !s.note) s.note = r.sectionNote;
    if (r.isSubheading) s.items.push("#" + r.name);
    else if (r.glassPrice || r.bottlePrice) {
      s.wine = true;
      if (!s.head) s.head = [r.glassSize || "Glass", "Bottle"];
      s.items.push([r.name, r.description || "", r.glassPrice || "", r.bottlePrice || ""]);
    } else s.items.push([r.name, r.price || "", r.description || "", r.dietary || ""]);
  });
  return list.map(function (m) { return { slug: m.slug, title: m.title, sections: m.list.map(function (s) { if (!s.note) delete s.note; return s; }) }; });
}

var tabs = document.createElement("nav");
tabs.className = "menu-tabs";
tabs.setAttribute("aria-label", "Choose a menu");
var intro = document.createElement("p");
intro.className = "menu-intro";
root.parentNode.insertBefore(tabs, root);
root.parentNode.insertBefore(intro, root);
tabs.hidden = intro.hidden = true;

var drawn = "", live = [], data = null;

/* deep link to a menu: menus.html#m-<slug> (query strings are not reliable on the static host) */
function wanted() { var h = location.hash; return h.indexOf("#m-") === 0 ? decodeURIComponent(h.slice(3)) : ""; }
window.addEventListener("hashchange", function () { var w = wanted(); if (w && data && !only) show(w); });

function show(slug, fromClick) {
  var menu = live.filter(function (m) { return m.slug === slug; })[0] || live[0];
  if (!menu) return;
  tabs.innerHTML = live.length > 1 ? live.map(function (m) {
    return '<button type="button" class="menu-tab" data-slug="' + esc(m.slug) + '" aria-pressed="' + (m === menu) + '">' + esc(m.title) + "</button>";
  }).join("") : "";
  tabs.hidden = live.length < 2;
  intro.hidden = true;
  window.ReachMenu.render(menu.sections);
  if (fromClick && history.replaceState) {
    history.replaceState(null, "", menu === live[0] ? location.pathname : "#m-" + encodeURIComponent(menu.slug));
  }
}

function draw(d) {
  data = d;
  var key = JSON.stringify(d);
  if (key === drawn) return;
  drawn = key;
  var all = group(d);
  live = only ? all.filter(function (m) { return m.slug === only; }) : all;
  if (!live.length) { root.innerHTML = '<p class="menu-note">Our menus are being updated. Please call us on <a href="tel:02081677999">020 8167 7999</a>.</p>'; tabs.hidden = intro.hidden = true; return; }
  show(wanted() || live[0].slug);
}

tabs.addEventListener("click", function (e) {
  var b = e.target.closest(".menu-tab");
  if (b) show(b.getAttribute("data-slug"), true);
});

var cached = null;
try { cached = JSON.parse(localStorage.getItem(CACHE)); } catch (e) {}
if (cached && cached.rows) draw(cached);
else root.innerHTML = '<p class="menu-note" aria-live="polite">Loading the menu…</p>';

fetchAll().then(function (d) {
  draw(d);
  try { localStorage.setItem(CACHE, JSON.stringify(d)); } catch (e) {}
}).catch(function () {
  if (!cached) root.innerHTML = '<p class="menu-note">We couldn\'t load the menu just now. Please refresh, or call us on <a href="tel:02081677999">020 8167 7999</a>.</p>';
});
