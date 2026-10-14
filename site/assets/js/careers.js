/* Open roles from the Wix CMS "Jobs" table. The restaurant adds, edits and hides roles in the Wix
   dashboard (Content Manager > Jobs): title, department, location, a short description for the card and a
   full description (rich text) for the Learn more popup. A row with HIDE ticked is left out. Order: the
   optional Order number; rows without one follow in the order they were added.
   "Apply for this role" in a popup closes it, scrolls to the form and pre-selects the role (enquiry.js). */
import { queryItems } from "../../js/wix/items.js";

var root = document.getElementById("jobs-root");
var dialog = document.getElementById("job-dialog");
if (root) {
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var num = function (v) { return typeof v === "number" ? v : Infinity; };
  var section = root.closest("section");
  var jobs = [];

  /* the full description is owner-edited rich text: keep only simple formatting, drop everything else */
  var KEEP = { P: "p", UL: "ul", OL: "ol", LI: "li", H1: "h4", H2: "h4", H3: "h4", H4: "h4", H5: "h4", H6: "h4", STRONG: "strong", B: "strong", EM: "em", I: "em", BR: "br", A: "a" };
  function clean(src, into) {
    Array.prototype.forEach.call(src.childNodes, function (n) {
      if (n.nodeType === 3) { into.appendChild(document.createTextNode(n.nodeValue)); return; }
      if (n.nodeType !== 1) return;
      var tag = KEEP[n.tagName];
      if (!tag) { clean(n, into); return; }
      var out = document.createElement(tag);
      if (tag === "a") {
        var href = n.getAttribute("href") || "";
        if (/^(https?:|mailto:)/i.test(href)) { out.setAttribute("href", href); out.setAttribute("rel", "noopener"); if (/^https?:/i.test(href)) out.setAttribute("target", "_blank"); }
      }
      if (tag !== "br") clean(n, out);
      into.appendChild(out);
    });
    return into;
  }

  function open(job, trigger) {
    if (!dialog || !dialog.showModal) { location.hash = "apply"; return; }
    var body = dialog.querySelector(".jd-body");
    var meta = [job.department, job.location].filter(Boolean).map(esc).join(" · ");
    dialog.querySelector(".jd-title").textContent = job.title;
    dialog.querySelector(".jd-meta").innerHTML = meta;
    body.replaceChildren();
    if (job.details) clean(new DOMParser().parseFromString(job.details, "text/html").body, body);
    else if (job.description) { var p = document.createElement("p"); p.textContent = job.description; body.appendChild(p); }
    dialog.querySelector(".jd-apply").onclick = function () {
      dialog.close();
      document.dispatchEvent(new CustomEvent("careers:role", { detail: job.title }));
      var form = document.getElementById("apply");
      if (form) form.scrollIntoView({ behavior: "smooth" });
    };
    dialog.scrollTop = 0;
    dialog.showModal();
  }

  if (dialog) {
    dialog.querySelector(".jd-close").addEventListener("click", function () { dialog.close(); });
    dialog.addEventListener("click", function (e) { if (e.target === dialog) dialog.close(); });
  }

  root.addEventListener("click", function (e) {
    var b = e.target.closest("[data-job]");
    if (b) open(jobs[+b.getAttribute("data-job")], b);
  });

  queryItems("jobs", { sort: [{ field: "sortOrder" }], limit: 100 }).then(function (page) {
    jobs = page.items.filter(function (j) { return !j.hide && j.title; }).sort(function (a, b) {
      return num(a.sortOrder) - num(b.sortOrder) || String(a._createdDate).localeCompare(String(b._createdDate));
    });
    if (!jobs.length) {
      root.innerHTML = '<p class="jobs-none">We have no open roles listed right now, but we are always glad to hear from people who love hospitality. Send us your details below.</p>';
      return;
    }
    root.innerHTML = jobs.map(function (j, i) {
      return '<article class="card"><span class="tag">' + esc(j.department || "Now hiring") + "</span><h3>" + esc(j.title) + "</h3>" +
        (j.description ? "<p>" + esc(j.description) + "</p>" : "") +
        '<div class="part-actions"><button type="button" class="pill" data-job="' + i + '" aria-haspopup="dialog">Learn more</button></div></article>';
    }).join("");
  }).catch(function () {
    if (section) section.hidden = true;
  });
}
