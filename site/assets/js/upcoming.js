/* "Coming up" from Wix Events: a panel on the homepage hero image and a card band on What's On.
   Add or edit events in the Wix dashboard (Events); both hide themselves when nothing is scheduled. */
import { fetchEvents } from "../../js/wix/events.js";

const strip = document.getElementById("up-strip"), band = document.getElementById("up-band");
if (strip || band) {
  const BOOK = "https://restaurant-1779620176.resos.com/booking";
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const fmt = (iso, tz, o) => { try { return new Intl.DateTimeFormat("en-GB", Object.assign({ timeZone: tz || "Europe/London" }, o)).format(new Date(iso)); } catch (e) { return ""; } };
  const day = e => fmt(e.startDateIso, e.timeZoneId, { weekday: "short", day: "numeric", month: "short" });
  const when = e => day(e) + ", " + fmt(e.startDateIso, e.timeZoneId, { hour: "numeric", minute: "2-digit", hour12: true }).replace(" ", "").toLowerCase();

  /* the "more to come" card: always shown, after any scheduled events */
  const MORE = '<article class="up-card"><span class="tag">New dates announced soon</span><h3>more to come</h3><p>Live nights and special events will appear here as soon as they are announced.</p><a class="pill" href="private-dining.html">Plan your event</a></article>';
  function showDefaults() {
    if (strip) { strip.innerHTML = '<b>Coming up</b><ul><li><span>New dates announced soon</span>More to come</li></ul><u>What&rsquo;s on</u>'; strip.hidden = false; }
    if (band) { band.innerHTML = '<h2>Coming up</h2><div class="up-grid">' + MORE + '</div>'; band.hidden = false; }
  }

  fetchEvents({ limit: 6 }).then(all => {
    const events = all.filter(e => e.startDateIso);
    if (!events.length) return showDefaults();
    if (strip) {
      strip.innerHTML = '<b>Coming up</b><ul>' + events.slice(0, 3).map(e => '<li><span>' + esc(day(e)) + "</span>" + esc(e.title) + "</li>").join("") + '</ul><u>What&rsquo;s on</u>';
      strip.hidden = false;
    }
    if (band) {
      band.innerHTML = '<h2>Coming up</h2><div class="up-grid">' + events.slice(0, 4).map(e =>
        '<article class="up-card">' + (e.imageUrl ? '<img src="' + esc(e.imageUrl) + '" alt="" loading="lazy">' : "") +
        '<span class="tag">' + esc(when(e)) + (e.locationName ? " · " + esc(e.locationName) : "") + "</span><h3>" + esc(e.title) + "</h3>" +
        (e.shortDescription ? "<p>" + esc(e.shortDescription) + "</p>" : "") +
        '<a class="pill pill--solid" href="' + BOOK + '" target="_blank" rel="noopener">Book your table</a></article>').join("") + MORE + "</div>";
      band.hidden = false;
    }
  }).catch(showDefaults);
}
