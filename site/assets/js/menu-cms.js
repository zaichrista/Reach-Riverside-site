/* Loads a menu from the Wix CMS and hands it to menus.js to draw. The restaurant edits it in the Wix
   dashboard (Content Manager). Two tables use this one script, chosen by data-collection on #menu-root:
   - "menu" (default): the everyday menus. Rows are grouped by their Menu column (a divider heading) and then by Section.
   - One table per seasonal menu (christmasMenu, easterMenu, ...), named by data-collection and flagged with
     data-seasonal on #menu-root: the same columns plus "MENU IS LIVE". A seasonal menu is on the website
     only while at least one of its lines has that ticked.
   A row with HIDE ticked is left out; a menu with no visible rows is not shown. Order: the optional Order
   number; rows without one follow in the order they were added; menus and sections are ordered by their
   lowest-numbered row.
   With data-menu="<slug>" on #menu-root a page draws just that menu; otherwise every menu is listed one after
   another in one long list. When a seasonal page's menu is not live the section around #menu-root is
   hidden. The last good copy is kept in localStorage so repeat visits paint instantly. */
import { queryItems } from "../../js/wix/items.js";

var root = document.getElementById("menu-root");
var COLLECTION = (root && root.getAttribute("data-collection")) || "menu";
var SEASONAL = !!(root && root.hasAttribute("data-seasonal"));
var CACHE = "reach-menu-cache-v5-" + COLLECTION;
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
  return { rows: await all(COLLECTION, { sort: [{ field: "sortOrder" }] }) };
}

function slug(t) { return String(t || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
function num(v) { return typeof v === "number" ? v : Infinity; }
function byOrder(a, b) {
  return num(a.sortOrder) - num(b.sortOrder) || String(a._createdDate).localeCompare(String(b._createdDate));
}

/* rows -> [{ slug, title, sections: [{ id, title, note, wine, head, items }] }], in display order */
function group(d) {
  var menus = {}, list = [];
  var liveMenus = {};
  if (SEASONAL) d.rows.forEach(function (r) { if (r.live && r.menu) liveMenus[slug(r.menu)] = true; });
  d.rows.filter(function (r) { return !r.hide && r.menu && r.section && r.name && (!SEASONAL || liveMenus[slug(r.menu)]); }).sort(byOrder).forEach(function (r) {
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

var drawn = "", live = [];

/* All live menus go on the page as one long list of sections under three dividers: Food, Drinks, Wines.
   A menu's divider comes from its name below; any menu not named here is Food. Section ids are the hash
   targets, e.g. menus.html#brunch. A single-menu page (e.g. Christmas) is drawn without a divider. */
var GROUPS = ["Food", "Drinks", "Wines"];
var GROUP_OF = { cocktails: "Drinks", drinks: "Drinks", wines: "Wines", wine: "Wines" };
function show() {
  var secs = [];
  GROUPS.forEach(function (g) {
    live.forEach(function (m) {
      if ((GROUP_OF[m.slug] || "Food") !== g) return;
      m.sections.forEach(function (s) { if (live.length > 1) s.group = g; secs.push(s); });
    });
  });
  tabs.hidden = intro.hidden = true;
  window.ReachMenu.render(secs);
}

function draw(d) {
  var key = JSON.stringify(d);
  if (key === drawn) return;
  drawn = key;
  var all = group(d);
  live = only ? all.filter(function (m) { return m.slug === only; }) : all;
  if (!live.length && SEASONAL) {
    var wrap = root.closest("section");
    if (wrap) wrap.style.display = "none"; else root.innerHTML = "";
    tabs.hidden = intro.hidden = true;
    return;
  }
  if (SEASONAL) { var w = root.closest("section"); if (w) w.style.display = ""; }
  if (!live.length) { root.innerHTML = '<p class="menu-note">Our menus are being updated. Please call us on <a href="tel:02081677999">020 8167 7999</a>.</p>'; tabs.hidden = intro.hidden = true; return; }
  show();
}

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
