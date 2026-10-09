// Shared helpers for exporting site copy to a spreadsheet and writing edits back.
// Works on the raw HTML text by position, so formatting, classes and scripts are never touched.
const VOID = new Set(['br','img','meta','link','hr','input','source','area','base','col','embed','track','wbr']);
const ENT = { amp:'&', lt:'<', gt:'>', quot:'"', apos:"'", nbsp:' ', pound:'£', frac12:'½', eacute:'é', middot:'·', ndash:'–', mdash:'—', hellip:'…', rsquo:'’', lsquo:'‘', ldquo:'“', rdquo:'”', copy:'©' };

export function decode(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z0-9]+);/gi, (m, e) => {
    if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    return ENT[e] ?? m;
  });
}
export function encodeText(s) {
  return s.split(/\r?\n/).map(p => p.trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ /g, '&nbsp;')).join('<br>');
}
export function encodeAttr(s) {
  return s.replace(/\s*\r?\n\s*/g, ' ').trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
// raw source text -> what the person sees in the sheet (<br> becomes a line break)
export function display(raw, isAttr) {
  if (isAttr) return decode(raw).replace(/\s+/g, ' ').trim();
  return raw.split(/<br\s*\/?>/i).map(p => decode(p.replace(/\s+/g, ' ').trim())).join('\n');
}

function scanTagEnd(src, i) {
  let q = null;
  for (let j = i + 1; j < src.length; j++) {
    const c = src[j];
    if (q) { if (c === q) q = null; }
    else if (c === '"' || c === "'") q = c;
    else if (c === '>') return j;
  }
  return -1;
}
function parseAttrs(tagSrc, tagStart) {
  const attrs = {}; const re = /([^\s=\/>"']+)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s>]+))?/g;
  const inner = tagSrc.replace(/^<\/?[a-zA-Z][a-zA-Z0-9-]*/, m => ' '.repeat(m.length));
  let m;
  while ((m = re.exec(inner))) {
    if (m[2] === undefined) { attrs[m[1].toLowerCase()] = { value: '', start: -1, end: -1 }; continue; }
    const q = m[2][0] === '"' || m[2][0] === "'";
    const vs = m.index + m[0].length - m[2].length + (q ? 1 : 0);
    const ve = m.index + m[0].length - (q ? 1 : 0);
    attrs[m[1].toLowerCase()] = { value: tagSrc.slice(vs, ve), start: tagStart + vs, end: tagStart + ve };
  }
  return attrs;
}
const hasWord = s => /[\p{L}\p{N}]/u.test(s);

// Returns every editable piece of copy in a page, in document order.
export function extractHtml(src) {
  const items = []; const stack = [];
  let run = null; let pendingBr = false; let lastHeading = ''; let i = 0;
  const regionOf = () => {
    for (const e of stack) {
      if (e.tag === 'header') return 'Header';
      if (e.tag === 'footer') return 'Footer';
      if (/\boverlay\b/.test(e.cls) && e.tag === 'div') return 'Menu overlay';
    }
    return null;
  };
  const sectionOf = () => {
    for (let k = stack.length - 1; k >= 0; k--) {
      const e = stack[k];
      if (['section', 'article', 'header', 'footer', 'nav', 'main'].includes(e.tag) || (e.tag === 'div' && (e.cls || e.id)))
        return e.tag + (e.id ? '#' + e.id : '') + (e.cls ? '.' + e.cls.split(/\s+/)[0] : '');
    }
    return 'page';
  };
  const hidden = () => stack.some(e => /\bvh\b/.test(e.cls));
  const base = (extra) => {
    const top = stack[stack.length - 1] || { tag: '', cls: '' };
    return { tag: top.tag, cls: top.cls, region: regionOf(), section: sectionOf(), heading: lastHeading, hidden: hidden(), ...extra };
  };
  const flush = () => {
    if (!run) return;
    const raw = src.slice(run.start, run.end);
    const shown = display(raw, false);
    if (hasWord(shown)) {
      const it = base({ kind: 'text', start: run.start, end: run.end, raw, shown });
      if (it.tag === 'title') it.kind = 'title';
      items.push(it);
      if (/^h[1-3]$/.test(it.tag)) lastHeading = shown.replace(/\n/g, ' ').slice(0, 40);
    }
    run = null; pendingBr = false;
  };
  while (i < src.length) {
    const lt = src.indexOf('<', i);
    const textEnd = lt === -1 ? src.length : lt;
    if (textEnd > i) {
      const t = src.slice(i, textEnd); const m = t.match(/\S/);
      if (m) {
        const s = i + m.index; const e = i + t.replace(/\s+$/, '').length;
        if (!run) run = { start: s, end: e }; else run.end = e;
        pendingBr = false;
      }
    }
    if (lt === -1) break;
    i = lt;
    if (src.startsWith('<!--', i)) { flush(); const e = src.indexOf('-->', i); i = e === -1 ? src.length : e + 3; continue; }
    if (src[i + 1] === '!' || !/[a-zA-Z\/]/.test(src[i + 1] || '')) { flush(); const e = src.indexOf('>', i); i = e === -1 ? src.length : e + 1; continue; }
    const end = scanTagEnd(src, i); if (end === -1) break;
    const tagSrc = src.slice(i, end + 1);
    const nm = tagSrc.match(/^<(\/?)([a-zA-Z][a-zA-Z0-9-]*)/);
    const closing = nm[1] === '/'; const tag = nm[2].toLowerCase();
    if (tag === 'br' && !closing) { i = end + 1; continue; }   // line break stays inside the surrounding text run
    flush();
    if (!closing) {
      const attrs = parseAttrs(tagSrc, i);
      const cls = attrs.class?.value || ''; const id = attrs.id?.value || '';
      if (tag === 'script' || tag === 'style') { const ce = src.toLowerCase().indexOf('</' + tag, end); i = ce === -1 ? src.length : src.indexOf('>', ce) + 1; continue; }
      // attribute copy
      const pushAttr = (kind, a, extra = {}) => {
        if (!a || a.start < 0) return; const shown = display(a.value, true);
        if (!hasWord(shown)) return;
        stack.push({ tag, cls, id }); items.push(base({ kind, start: a.start, end: a.end, raw: a.value, shown, ...extra })); stack.pop();
      };
      if (tag === 'img') pushAttr('alt', attrs.alt, { img: (attrs.src?.value || '').split('/').pop() });
      if (tag === 'iframe') pushAttr('iframe-title', attrs.title);
      if (tag === 'meta') {
        const nameV = (attrs.name?.value || '').toLowerCase(), propV = (attrs.property?.value || '').toLowerCase();
        if (nameV === 'description') pushAttr('desc', attrs.content);
        else if (propV === 'og:title') pushAttr('ogtitle', attrs.content);
        else if (propV === 'og:description') pushAttr('ogdesc', attrs.content);
      }
      if (!VOID.has(tag) && !tagSrc.endsWith('/>')) stack.push({ tag, cls, id });
    } else {
      for (let k = stack.length - 1; k >= 0; k--) if (stack[k].tag === tag) { stack.length = k; break; }
    }
    i = end + 1;
  }
  flush();
  return items;
}

export function typeOf(it) {
  let t;
  if (it.kind === 'alt') t = 'Image alt text';
  else if (it.kind === 'iframe-title') t = 'Map title';
  else if (it.tag === 'h1') t = 'Heading H1';
  else if (it.tag === 'h2') t = 'Heading H2';
  else if (it.tag === 'h3') t = 'Heading H3';
  else if (it.tag === 'a' && /\bpill\b/.test(it.cls)) t = 'Button';
  else if (it.tag === 'a') t = 'Link text';
  else if (it.tag === 'button') t = 'Button / label';
  else if (it.tag === 'li') t = 'List item';
  else if (it.tag === 'dt') t = 'Label';
  else if (it.tag === 'dd') t = 'Detail';
  else if (it.tag === 'q') t = 'Quote';
  else if (it.tag === 'p' && /part-sub/.test(it.cls)) t = 'Sub-heading';
  else if (it.tag === 'p') t = 'Paragraph';
  else if (it.tag === 'span' && /\btag\b/.test(it.cls)) t = 'Tag label';
  else t = 'Text';
  if (/^\d{3} \d{4} \d{4}$/.test(it.shown)) t = 'Phone number (keep as is)'; else if (/^[£\d]/.test(it.shown) && it.kind === 'text') t = 'Price / figure';
  if (it.hidden) t += ' (hidden visually, still read by Google)';
  return t;
}
export function whereOf(it) {
  const parts = [];
  if (it.heading && !/^h[1-3]$/.test(it.tag)) parts.push(`under "${it.heading}"`);
  parts.push(it.section.replace(/^page$/, 'page body'));
  if (it.img) parts.push(it.img);
  return parts.join(' · ');
}
export const PAGES = [
  { file: 'index.html', tab: 'Home', prefix: 'HOME', url: '/' },
  { file: 'about.html', tab: 'About', prefix: 'ABOUT', url: '/about.html' },
  { file: 'menus.html', tab: 'Menus page', prefix: 'MENUS', url: '/menus.html' },
  { file: 'private-dining.html', tab: 'Private Dining', prefix: 'PRIV', url: '/private-dining.html' },
  { file: 'whats-on.html', tab: "What's On", prefix: 'WHATSON', url: '/whats-on.html' },
  { file: 'christmas.html', tab: 'Christmas', prefix: 'XMAS', url: '/christmas.html' },
  { file: 'contact.html', tab: 'Contact', prefix: 'CONTACT', url: '/contact.html' },
  { file: '404.html', tab: '404 page', prefix: 'E404', url: '/404.html' },
];
export const MENUS = [
  { file: 'assets/js/menu-data.js', tab: 'Menu items', prefix: 'MENU' },
  { file: 'assets/js/christmas-menu.js', tab: 'Christmas menu items', prefix: 'XMENU' },
];

import vm from 'node:vm';
// Finds the `window.MENU = [ ... ];` block in a menu data file (other code in the file is left alone).
export function loadMenu(src) {
  const start = src.indexOf('window.MENU = ['); const close = src.indexOf('\n];', start);
  if (start < 0 || close < 0) throw new Error('window.MENU block not found');
  const end = close + 3; const ctx = { window: {} };
  vm.runInNewContext(src.slice(start, end), ctx);
  return { menu: ctx.window.MENU, start, end };
}
export function serializeMenu(menu) {
  const j = JSON.stringify; let out = 'window.MENU = [\n'; let lastGroup = null;
  menu.forEach((s, k) => {
    if (lastGroup !== null && s.group !== lastGroup) out += '\n';
    lastGroup = s.group;
    let head = `  {id:${j(s.id)}, group:${j(s.group)}, title:${j(s.title)}`;
    if (s.note !== undefined) head += `, note:${j(s.note)}`;
    if (s.wine) head += `, wine:true, head:${j(s.head)}`;
    out += head + ', items:[\n' + s.items.map(it => '    ' + j(it)).join(',\n') + ']}' + (k < menu.length - 1 ? ',' : '') + '\n';
  });
  return out + '];';
}
