// Usage: node import.mjs <edited.xlsx> [siteDir]   (siteDir defaults to ../site; use --dry to preview only)
import fs from 'node:fs'; import path from 'node:path';
import ExcelJS from 'exceljs';
import { extractHtml, encodeText, encodeAttr, display, loadMenu, serializeMenu } from './lib.mjs';

const args = process.argv.slice(2); const dry = args.includes('--dry');
const [xlsx, siteArg] = args.filter(a => a !== '--dry');
const SITE = path.resolve(siteArg || path.join(import.meta.dirname, '../site'));
const wb = new ExcelJS.Workbook(); await wb.xlsx.readFile(xlsx);
const cellText = c => { const v = c.value; if (v == null) return ''; if (typeof v === 'object') return String(v.richText ? v.richText.map(t => t.text).join('') : v.result ?? v.text ?? ''); return String(v); };
const norm = s => s.replace(/\r\n/g, '\n').split('\n').map(p => p.replace(/\s+/g, ' ').trim()).join('\n').trim();
const edits = {};   // file -> [{idx, raw, text}]
const menuEdits = []; const report = { applied: 0, skipped: [], unchanged: 0 };
const addEdit = (file, idx, raw, text, label) => (edits[file] ||= []).push({ idx, raw, text, label });

for (const ws of wb.worksheets) {
  const head = {}; ws.getRow(1).eachCell((c, n) => { head[cellText(c)] = n; });
  if (ws.name === 'SEO Meta') {
    ws.eachRow((row, n) => {
      if (n === 1) return;
      for (const [newCol, curCol, locCol] of [['NEW title', 'Current title', 'loc_title'], ['NEW meta description', 'Current meta description', 'loc_desc']]) {
        const nt = norm(cellText(row.getCell(head[newCol]))); if (!nt) continue;
        if (nt === norm(cellText(row.getCell(head[curCol])))) { report.unchanged++; continue; }
        for (const [file, idx, raw] of JSON.parse(cellText(row.getCell(head[locCol])) || '[]')) addEdit(file, idx, raw, nt, `${ws.name} row ${n}`);
        if (!JSON.parse(cellText(row.getCell(head[locCol])) || '[]').length) report.skipped.push(`${ws.name} row ${n}: page has no ${newCol.slice(4)} tag in the file yet, so there is nothing to replace. Ask Claude to add one.`);
      }
    });
  } else if (head['locations'] && head['NEW copy']) {
    ws.eachRow((row, n) => {
      if (n === 1) return;
      const nt = norm(cellText(row.getCell(head['NEW copy']))); if (!nt) return;
      if (nt === norm(cellText(row.getCell(head['Current copy'])))) { report.unchanged++; return; }
      for (const [file, idx, raw] of JSON.parse(cellText(row.getCell(head['locations'])))) addEdit(file, idx, raw, nt, `${ws.name} ${cellText(row.getCell(1))}`);
    });
  } else if (head['locations'] && head['NEW name']) {
    ws.eachRow((row, n) => {
      if (n === 1) return;
      const loc = JSON.parse(cellText(row.getCell(head['locations'])));
      const nn = norm(cellText(row.getCell(head['NEW name']))), nd = norm(cellText(row.getCell(head['NEW description'])));
      if (nn || nd) menuEdits.push({ loc, nn, nd, label: `${ws.name} ${cellText(row.getCell(1))}`, curN: norm(cellText(row.getCell(head['Current name']))), curD: norm(cellText(row.getCell(head['Current description']))) });
    });
  }
}

// ---- HTML edits
for (const [file, list] of Object.entries(edits)) {
  const fp = path.join(SITE, file); let src = fs.readFileSync(fp, 'utf8');
  const items = extractHtml(src); const todo = [];
  for (const e of list) {
    const it = items[e.idx];
    if (!it || it.raw !== e.raw) { report.skipped.push(`${e.label}: the page has changed since the sheet was made (expected "${display(e.raw, false).slice(0, 40)}"). Re-export the sheet.`); continue; }
    todo.push({ it, e });
  }
  todo.sort((a, b) => b.it.start - a.it.start);
  for (const { it, e } of todo) {
    const attr = ['alt', 'desc', 'ogtitle', 'ogdesc', 'iframe-title'].includes(it.kind);
    src = src.slice(0, it.start) + (attr ? encodeAttr(e.text) : encodeText(e.text)) + src.slice(it.end);
    report.applied++;
  }
  if (!dry) fs.writeFileSync(fp, src);
}

// ---- Menu edits
const byFile = {};
for (const m of menuEdits) (byFile[m.loc.file] ||= []).push(m);
for (const [file, list] of Object.entries(byFile)) {
  const fp = path.join(SITE, file); const src = fs.readFileSync(fp, 'utf8'); const { menu, start, end } = loadMenu(src);
  for (const m of list) {
    const s = menu[m.loc.s]; if (!s) { report.skipped.push(`${m.label}: section not found`); continue; }
    let changed = false;
    if (m.loc.t === 'section') {
      if (m.nn && m.nn !== s.title) { s.title = m.nn; changed = true; }
      if (m.nd && m.nd !== (s.note || '')) { s.note = m.nd; changed = true; }
    } else {
      const it = s.items[m.loc.i];
      if (it === undefined) { report.skipped.push(`${m.label}: item not found`); continue; }
      if (m.loc.t === 'sub') { if (m.nn && '#' + m.nn !== it) { s.items[m.loc.i] = '#' + m.nn; changed = true; } }
      else {
        const di = m.loc.t === 'wine' ? 1 : 2;
        if (m.nn && m.nn !== it[0]) { it[0] = m.nn; changed = true; }
        if (m.nd && m.nd !== (it[di] || '')) { while (it.length < di) it.push(''); it[di] = m.nd; changed = true; }
      }
    }
    if (changed) report.applied++; else report.unchanged++;
  }
  if (!dry) fs.writeFileSync(fp, src.slice(0, start) + serializeMenu(menu) + src.slice(end));
}
console.log(`${dry ? '[dry run] ' : ''}applied ${report.applied}, unchanged ${report.unchanged}, skipped ${report.skipped.length}`);
report.skipped.forEach(s => console.log('SKIPPED:', s));
