/* Loads the menus from the Wix CMS (collections: menus, menuSections, menuItems) and hands them to
   menus.js to draw. The restaurant edits these in the Wix dashboard (Content Manager).
   A menu shows on the Menus page while its "Show on website" box is ticked (tick it to publish a seasonal
   menu, untick it to take it down). With data-menu="<slug>" on #menu-root a page draws just that menu,
   whatever the box says (the Christmas page); without it every ticked menu is listed, with tabs when
   there is more than one. The last good copy is kept in localStorage so repeat visits paint instantly. */
import { queryItems } from "../../js/wix/items.js";

var root = document.getElementById("menu-root");
var CACHE = "reach-menu-cache-v3";
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
  var menus = await all("menus", { sort: [{ field: "sortOrder" }] });
  var sections = await all("menuSections", { sort: [{ field: "sortOrder" }] });
  var items = await all("menuItems", { sort: [{ field: "sortOrder" }] });
  return { menus: menus, sections: sections, items: items };
}

/* sections of one menu in the shape menus.js draws */
function build(data, menu) {
  var secs = data.sections.filter(function (s) { return s.menu === menu._id; });
  return secs.map(function (s) {
    var items = data.items.filter(function (i) { return i.section === s._id; }).map(function (i) {
      if (i.isSubheading) return "#" + (i.name || "");
      if (s.wineStyle) return [i.name || "", i.description || "", i.glassPrice || "", i.bottlePrice || ""];
      return [i.name || "", i.price || "", i.description || "", i.dietary || ""];
    });
    var o = { id: s.sectionKey || s._id, group: s.group || "", title: s.title || "", items: items };
    if (s.note) o.note = s.note;
    if (s.wineStyle) { o.wine = true; o.head = [s.columnOne || "", s.columnTwo || ""]; }
    return o;
  });
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

function show(slug, fromClick) {
  var menu = live.filter(function (m) { return m.slug === slug; })[0] || live[0];
  if (!menu) return;
  tabs.innerHTML = live.length > 1 ? live.map(function (m) {
    return '<button type="button" class="menu-tab" data-slug="' + esc(m.slug) + '" aria-pressed="' + (m === menu) + '">' + esc(m.title) + "</button>";
  }).join("") : "";
  tabs.hidden = live.length < 2;
  intro.textContent = menu.intro || "";
  intro.hidden = !menu.intro;
  window.ReachMenu.render(build(data, menu));
  if (fromClick && history.replaceState) {
    history.replaceState(null, "", menu === live[0] ? location.pathname : "?menu=" + encodeURIComponent(menu.slug));
  }
}

function draw(d) {
  data = d;
  live = d.menus.filter(function (m) { return only ? m.slug === only : m.showOnWebsite; });
  var key = JSON.stringify([d, live.map(function (m) { return m._id; })]);
  if (key === drawn) return;
  drawn = key;
  if (!live.length) { root.innerHTML = '<p class="menu-note">Our menus are being updated. Please call us on <a href="tel:02081677999">020 8167 7999</a>.</p>'; tabs.hidden = intro.hidden = true; return; }
  show(new URLSearchParams(location.search).get("menu") || (live[0] && live[0].slug));
}

tabs.addEventListener("click", function (e) {
  var b = e.target.closest(".menu-tab");
  if (b) show(b.getAttribute("data-slug"), true);
});

var cached = null;
try { cached = JSON.parse(localStorage.getItem(CACHE)); } catch (e) {}
if (cached && cached.menus) draw(cached);
else root.innerHTML = '<p class="menu-note" aria-live="polite">Loading the menu…</p>';

fetchAll().then(function (d) {
  draw(d);
  try { localStorage.setItem(CACHE, JSON.stringify(d)); } catch (e) {}
}).catch(function () {
  if (!cached) root.innerHTML = '<p class="menu-note">We couldn\'t load the menu just now. Please refresh, or call us on <a href="tel:02081677999">020 8167 7999</a>.</p>';
});
