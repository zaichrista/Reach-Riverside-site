// Builds The-Reach-website-copy.xlsx from the live files in ../site
import fs from 'node:fs'; import path from 'node:path'; import vm from 'node:vm';
import ExcelJS from 'exceljs';
import { PAGES, MENUS, extractHtml, typeOf, whereOf, loadMenu } from './lib.mjs';

const SITE = path.resolve(import.meta.dirname, '../site');
const OUT = path.resolve(import.meta.dirname, 'The-Reach-website-copy.xlsx');
const wb = new ExcelJS.Workbook();
const FILL_NEW = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3B0' } };
const FILL_HEAD = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F2A44' } };
const FILL_CUR = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
const wrap = { vertical: 'top', wrapText: true };

function style(ws, newCols, widths, hiddenCols = []) {
  ws.columns.forEach((c, k) => { c.width = widths[k] || 20; c.alignment = wrap; });
  const h = ws.getRow(1); h.font = { bold: true, color: { argb: 'FFFFFFFF' } }; h.fill = FILL_HEAD; h.alignment = { vertical: 'middle', wrapText: true }; h.height = 30;
  ws.views = [{ state: 'frozen', ySplit: 1 }];
  ws.eachRow((r, n) => { if (n === 1) return; newCols.forEach(c => { r.getCell(c).fill = FILL_NEW; }); });
  hiddenCols.forEach(c => { ws.getColumn(c).hidden = true; });
}
const read = f => fs.readFileSync(path.join(SITE, f), 'utf8');

// ---------- README
const rd = wb.addWorksheet('READ ME FIRST');
[
  ['The Reach Riverside: website copy sheet'],
  [''],
  ['HOW TO USE'],
  ['1. Edit ONLY the yellow "NEW copy" columns. Leave a yellow cell blank to keep the current wording.'],
  ['2. Grey "Current copy" columns show what is live now. Do not change them, and do not rename tabs, delete rows, or unhide/edit the hidden columns on the right (they are how Claude finds each line again).'],
  ['3. Line breaks inside a cell (Alt+Enter in Excel, Ctrl+Enter in Google Sheets) become line breaks on the page. The "Group and / Celebrations" heading is an example.'],
  ['4. Use the "Your notes" column for anything you want to tell Claude about a row. It is never published.'],
  ['5. Save and send the file back. Claude writes the changes into the site files, checks each line matched what it expected, and reports anything it skipped.'],
  [''],
  ['TABS'],
  ['Keyword Bank: your target phrases and which page each one belongs on. Starter ideas are filled in; none have been checked against real search volume.'],
  ['SEO Meta: the browser/Google title and meta description for every page. These are the highest-impact SEO fields. The social share (og) text follows them automatically.'],
  ['Shared: header, burger menu and footer text that appears on every page. One edit here updates every page.'],
  ['Home, About, Menus page, Private Dining, What\'s On, Christmas, Contact, 404 page: every heading, paragraph, button and image description on that page, in page order.'],
  ['Menu items / Christmas menu items: every dish and drink (name and description). Prices and dietary tags are shown for reference only and are not changed by the import.'],
  [''],
  ['SEO TIPS FOR THE COPY'],
  ['Page titles: aim for 50-60 characters, with the main phrase near the front. Meta descriptions: 120-155 characters. The SEO Meta tab counts these for you.'],
  ['Every page should have one clear H1 that names what the page is and where (e.g. "Riverside restaurant in Fulham Reach"). Use the phrases from the Keyword Bank naturally in headings and the first paragraph. Do not repeat them unnaturally.'],
  ['Image alt text should describe the picture in plain words, and can include place or dish names where it is true. It is also read aloud to blind visitors, so keep it accurate.'],
  ['Do not change prices or opening times unless they actually change.'],
  [''],
  ['NOT IN THIS SHEET'],
  ['The enquiry form wording (labels and thank-you message) lives in the Wix dashboard, not in the site files. The text inside logos and the Christmas banner images is part of the picture and cannot be edited as text.'],
].forEach(r => rd.addRow(r));
rd.getColumn(1).width = 130; rd.getColumn(1).alignment = wrap;
[1, 3, 10, 17, 23].forEach(n => { rd.getRow(n).font = { bold: true, size: n === 1 ? 16 : 12 }; });

// ---------- Keyword bank
const kb = wb.addWorksheet('Keyword Bank');
kb.addRow(['Target phrase (edit freely)', 'Best page for it', 'Where to use it', 'Why / note']);
[
  ['riverside restaurant Fulham', 'Home', 'H1, first paragraph, page title', 'Starter idea. Core "what and where" phrase.'],
  ['restaurant Fulham Reach', 'Home / About', 'H1 or H2, meta description', 'Starter idea. Matches the neighbourhood name used on the site.'],
  ['bar and lounge Fulham Reach', 'Home', 'Subheading, alt text', 'Starter idea.'],
  ['Sunday roast Fulham', 'What\'s On / Menus', 'H2, intro line, meta description', 'Starter idea. Sunday roast is a strong local search.'],
  ['brunch Fulham', 'Home / Menus', 'Brunch section heading and body', 'Starter idea.'],
  ['cocktail bar Fulham', 'Home / Menus', 'Dinner & cocktails section', 'Starter idea.'],
  ['Christmas party venue Fulham', 'Christmas', 'H1/H2, page title', 'Starter idea. Check seasonal timing.'],
  ['Christmas lunch riverside London', 'Christmas', 'Intro paragraph, meta description', 'Starter idea.'],
  ['private dining Fulham', 'Private Dining', 'H1, page title', 'Starter idea.'],
  ['group bookings / birthday dinner Fulham', 'Private Dining', 'Intro paragraph', 'Starter idea.'],
  ['restaurant near Fulham Football Club / Craven Cottage / Hammersmith', 'About / Contact', 'Getting here paragraph', 'Only use landmarks and distances you have confirmed.'],
  ['Mediterranean sharing plates London', 'Home / Menus', 'Lunch & small plates section', 'Only if it matches how you want to be found.'],
  ['', '', '', ''], ['', '', '', ''], ['', '', '', ''],
].forEach(r => kb.addRow(r));
style(kb, [1, 2, 3, 4], [48, 22, 36, 60]);

// ---------- SEO meta
const seo = wb.addWorksheet('SEO Meta');
seo.addRow(['Page', 'URL', 'Current title', 'NEW title', 'Title chars (aim 50-60)', 'Current meta description', 'NEW meta description', 'Description chars (aim 120-155)', 'Main keyword for this page', 'Your notes', 'loc_title', 'loc_desc', 'orig_title', 'orig_desc']);
const pageItems = {};
for (const p of PAGES) {
  const items = extractHtml(read(p.file)); pageItems[p.file] = items;
  const idx = k => items.map((it, n) => ({ it, n })).filter(x => x.it.kind === k);
  const t = idx('title')[0], d = idx('desc')[0], ot = idx('ogtitle')[0], od = idx('ogdesc')[0];
  const locT = [t, ot].filter(Boolean).map(x => [p.file, x.n, x.it.raw]);
  const locD = [d, od].filter(Boolean).map(x => [p.file, x.n, x.it.raw]);
  const r = seo.addRow([p.tab, p.url, t?.it.shown || '', '', null, d?.it.shown || '', '', null, '', '', JSON.stringify(locT), JSON.stringify(locD), '', '']);
  const n = r.number;
  r.getCell(5).value = { formula: `LEN(IF(D${n}<>"",D${n},C${n}))` };
  r.getCell(8).value = { formula: `IF(AND(F${n}="",G${n}=""),"",LEN(IF(G${n}<>"",G${n},F${n})))` };
  if (!d) r.getCell(6).value = '(none yet. Add one in the yellow cell)';
}
style(seo, [4, 7, 9, 10], [16, 22, 44, 44, 12, 52, 52, 14, 28, 30, 10, 10, 10, 10], [11, 12, 13, 14]);

// ---------- Shared + page tabs
const COLS = ['ID', 'Location on page', 'Type', 'Current copy', 'NEW copy', 'Your notes', 'locations', 'orig'];
const WID = [11, 38, 22, 62, 62, 28, 10, 10];
function addCopySheet(name, rows, prefix) {
  const ws = wb.addWorksheet(name); ws.addRow(COLS);
  rows.forEach((r, k) => ws.addRow([`${prefix}-${String(k + 1).padStart(3, '0')}`, r.where, r.type, r.shown, '', '', JSON.stringify(r.locs), '']));
  style(ws, [5, 6], WID, [7, 8]);
  ws.eachRow((row, n) => { if (n > 1) row.getCell(4).fill = FILL_CUR; });
  return ws;
}
// shared (header/overlay/footer): dedupe by region+kind+text
const shared = new Map(); const pageRows = {};
for (const p of PAGES) {
  pageRows[p.file] = [];
  pageItems[p.file].forEach((it, n) => {
    if (['title', 'desc', 'ogtitle', 'ogdesc'].includes(it.kind)) return;
    const loc = [p.file, n, it.raw];
    if (it.region) {
      const key = `${it.region}|${it.kind}|${it.tag}|${it.shown}`;
      if (!shared.has(key)) shared.set(key, { where: `${it.region} › ${it.section}${it.img ? ' · ' + it.img : ''}`, type: typeOf(it), shown: it.shown, locs: [], pages: new Set() });
      const s = shared.get(key); s.locs.push(loc); s.pages.add(p.tab);
    } else pageRows[p.file].push({ where: whereOf(it), type: typeOf(it), shown: it.shown, locs: [loc] });
  });
}
const sharedRows = [...shared.values()].map(s => ({ ...s, where: `${s.where} (on ${s.pages.size} pages)` }));
addCopySheet('Shared (header, menu, footer)', sharedRows, 'SHARED');
for (const p of PAGES) addCopySheet(p.tab, pageRows[p.file], p.prefix);

// ---------- Menus
for (const m of MENUS) {
  const src = read(m.file); const ctx = { window: { MENU: loadMenu(src).menu } };
  const ws = wb.addWorksheet(m.tab);
  ws.addRow(['ID', 'Menu / section', 'Type', 'Current name', 'NEW name', 'Current description', 'NEW description', 'Price (reference only)', 'Dietary (reference only)', 'Your notes', 'locations']);
  let n = 0; const id = () => `${m.prefix}-${String(++n).padStart(3, '0')}`;
  ctx.window.MENU.forEach((s, si) => {
    ws.addRow([id(), `${s.group} › ${s.title}`, 'Section heading + note', s.title, '', s.note || '', '', '', '', '', JSON.stringify({ file: m.file, s: si, t: 'section' })]);
    s.items.forEach((it, ii) => {
      if (typeof it === 'string') { ws.addRow([id(), `${s.group} › ${s.title}`, 'Sub-heading', it.slice(1), '', '', '', '', '', '', JSON.stringify({ file: m.file, s: si, i: ii, t: 'sub' })]); return; }
      const wine = !!s.wine;
      ws.addRow([id(), `${s.group} › ${s.title}`, wine ? 'Wine' : 'Dish / drink', it[0], '', wine ? (it[1] || '') : (it[2] || ''), '', wine ? [it[2] && '£' + it[2] + ' ' + (s.head?.[0] || ''), it[3] && '£' + it[3] + ' ' + (s.head?.[1] || '')].filter(Boolean).join(' | ') : String(it[1] || '').split('|').map(x => x.trim() && '£' + x.trim()).filter(Boolean).join(' | '), wine ? '' : (it[3] || ''), '', JSON.stringify({ file: m.file, s: si, i: ii, t: wine ? 'wine' : 'item' })]);
    });
  });
  style(ws, [5, 7, 10], [11, 28, 18, 34, 34, 50, 50, 20, 14, 26, 10], [11]);
  ws.eachRow((row, k) => { if (k > 1) { row.getCell(4).fill = FILL_CUR; row.getCell(6).fill = FILL_CUR; } });
}
// order: put Menu sheets after page tabs (already), README first
await wb.xlsx.writeFile(OUT);
console.log('wrote', OUT, wb.worksheets.map(w => `${w.name}(${w.rowCount - 1})`).join(', '));
