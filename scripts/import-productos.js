#!/usr/bin/env node
/* ============================================================
   MAGNUM GUNS & AMMO SHOP — Importador WooCommerce
   ------------------------------------------------------------
   Lee productos.csv (export de WordPress/WooCommerce), descarga
   las imágenes localmente y genera data/products.js.

   Uso:  node scripts/import-productos.js [archivo.csv]

   Por defecto usa ./productos.csv
   ============================================================ */

const fs = require('fs');
const path = require('path');

const CSV_PATH = process.argv[2] || 'productos.csv';
const IMG_DIR = path.resolve(process.cwd(), 'assets', 'img', 'productos');

const CATEGORY_MAP = {
  'pistola': 'pistolas', 'pistolas': 'pistolas',
  'escopeta': 'escopetas', 'escopetas': 'escopetas',
  'rifle': 'rifles', 'rifles': 'rifles',
  'fusil semiautomatico': 'fusiles-semiautomaticos', 'fusil semiautomático': 'fusiles-semiautomaticos', 'fusiles semiautomaticos': 'fusiles-semiautomaticos',
  'municion': 'municiones', 'municiones': 'municiones'
};
const CATEGORY_LABELS = {
  'pistolas': 'Pistolas', 'escopetas': 'Escopetas', 'rifles': 'Rifles',
  'fusiles-semiautomaticos': 'Fusiles Semiautomáticos', 'municiones': 'Municiones'
};

// Reglas de marca (keyword -> marca). Se evalúan en orden.
const BRAND_RULES = [
  ['glock', 'Glock'],
  ['canik', 'Canik'],
  ['mete', 'Canik'],
  ['tp9', 'Canik'],
  ['sfx', 'Canik'],
  ['rival', 'Canik'],
  ['tti combat', 'Canik'],
  ['elite combat', 'Canik'],
  ['sub mete', 'Canik'],
  ['mossberg', 'Mossberg'],
  ['maverick', 'Mossberg'],
  ['mc2', 'Mossberg'],
  ['mc-2', 'Mossberg'],
  ['590m', 'Mossberg'],
  ['500 ati', 'Mossberg'],
  ['940', 'Mossberg'],
  ['blaze', 'Mossberg'],
  ['plinkster', 'Mossberg'],
  ['smith & wesson', 'Smith & Wesson'],
  ['m&p', 'Smith & Wesson'],
  ['sd9', 'Smith & Wesson'],
  ['bodyguard', 'Smith & Wesson'],
  ['shield', 'Smith & Wesson'],
  ['csx', 'Smith & Wesson'],
  ['competitor', 'Smith & Wesson'],
  ['m2.0', 'Smith & Wesson'],
  ['subcompact', 'Smith & Wesson'],
  ['franchi', 'Franchi'],
  ['affinity', 'Franchi'],
  ['benelli', 'Benelli'],
  ['m2 max', 'Benelli'],
  ['scorpion', 'CZ'],
  ['spec ops', 'Spec Ops'],
  ['volunteer', 'Volunteer']
];

const CALIBER_ORDER = ['CA 12', 'Cal. 5.56/223', 'Calibre 22', 'Calibre 22LR', 'Calibre 380', 'Calibre 5.7', 'Calibre 9 mm'];

/* ---------- utilidades ---------- */
function stripBOM(s) { return s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s; }
function slugify(s) {
  return String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[®™©'".,]/g, ' ')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
function unescapeNewlines(s) { return String(s == null ? '' : s).replace(/\\n/g, '\n').replace(/\\r/g, ''); }
function normCat(v) {
  if (!v) return 'pistolas';
  const n = v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  if (CATEGORY_MAP[n]) return CATEGORY_MAP[n];
  const key = Object.keys(CATEGORY_MAP).find(k => n.includes(k) || k.includes(n));
  return key ? CATEGORY_MAP[key] : n.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
function deriveBrand(name, desc) {
  const hay = (name + ' ' + (desc || '')).toLowerCase();
  for (const [kw, brand] of BRAND_RULES) if (hay.includes(kw)) return brand;
  return '';
}
function calFromValue(v) {
  if (/\.?22\s*-?\s*lr/i.test(v)) return 'Calibre 22LR';
  if (/380/.test(v)) return 'Calibre 380';
  if (/5\.56|\b223\b/.test(v)) return 'Cal. 5.56/223';
  if (/5\.7|5,7/.test(v)) return 'Calibre 5.7';
  if (/9\s*mm|9mm|luger|9\s*x/.test(v)) return 'Calibre 9 mm';
  if (/^\s*12\b|12\s*(ga|gauge)/.test(v)) return 'CA 12';
  return '';
}
function deriveCaliber(name, shortDesc, desc, category) {
  const nameT = name.toLowerCase();
  // Overrides por nombre (modelos donde el nombre ya indica calibre)
  if (/5\.7|5,7/.test(nameT)) return 'Calibre 5.7';
  if (/glock/.test(nameT)) return 'Calibre 9 mm';
  if (/\bsd9\b|\bcsx\b|\bcompetitor\b|\bsubcompact\b|\bspec ops\b|\bscorpion\b/.test(nameT)) return 'Calibre 9 mm';
  if (/15-22|\bplinkster\b|\bblaze\b/.test(nameT)) return 'Calibre 22LR';
  if (/\.?22\s*-?\s*lr/.test(nameT)) return 'Calibre 22LR';

  const text = ((shortDesc || '') + ' ' + (desc || '')).toLowerCase();
  // Campo explícito "Calibre / Caliber / Gauge: X"
  const m = text.match(/(?:calibre|caliber|gauge|cal)\s*:?\s*([^\n,;|]+)/);
  if (m) {
    const got = calFromValue(m[1]);
    if (got) return got;
  }
  // Texto libre
  if (/\.?22\s*-?\s*lr/.test(text)) return 'Calibre 22LR';
  if (/\b380\b/.test(text)) return 'Calibre 380';
  if (/5\.56|\b223\b/.test(text)) return 'Cal. 5.56/223';
  if (/9\s*mm|9mm|luger/.test(text)) return 'Calibre 9 mm';
  if (/gauge:?\s*12|12\s*gauge/.test(text)) return 'CA 12';
  if (category === 'escopetas') return 'CA 12';
  return '';
}

/* ---------- CSV (un producto por línea, comillas y "" escapadas) ---------- */
function parseCSVLine(line) {
  const out = []; let cur = '', inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQ) {
      if (ch === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else inQ = false; }
      else cur += ch;
    } else {
      if (ch === '"') inQ = true;
      else if (ch === ',') { out.push(cur); cur = ''; }
      else cur += ch;
    }
  }
  out.push(cur);
  return out;
}

/* ---------- descarga de imagen ---------- */
async function downloadImage(url, dest) {
  if (fs.existsSync(dest)) return true;
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) return false;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 100) return false;
  fs.writeFileSync(dest, buf);
  return true;
}

function extFromUrl(u) {
  try { const p = new URL(u).pathname; const e = path.extname(p).toLowerCase(); if (/^\.(jpg|jpeg|png|webp|gif)$/.test(e)) return e; } catch (_) {}
  return '.jpg';
}

/* ---------- main ---------- */
async function main() {
  const csvPath = path.resolve(process.cwd(), CSV_PATH);
  if (!fs.existsSync(csvPath)) { console.error('No existe ' + csvPath); process.exit(1); }
  const raw = stripBOM(fs.readFileSync(csvPath, 'utf8'));
  const lines = raw.split(/\r?\n/).filter(l => l.trim() !== '');
  if (lines.length < 2) { console.error('CSV vacío'); process.exit(1); }

  const header = parseCSVLine(lines[0]).map(h => h.trim());
  const col = (name) => header.indexOf(name);

  const iName = col('Nombre'); const iShort = col('Descripción corta'); const iDesc = col('Descripción');
  const iCat = col('Categorías'); const iImg = col('Imágenes'); const iBrand = col('Marcas');

  if (iName === -1) { console.error('No se encontró la columna "Nombre".'); process.exit(1); }

  fs.mkdirSync(IMG_DIR, { recursive: true });

  const products = [];
  const usedSlugs = new Set();
  const brandsSet = new Set();
  const calibersSet = new Set();

  for (let n = 1; n < lines.length; n++) {
    const c = parseCSVLine(lines[n]);
    const name = (c[iName] || '').trim();
    if (!name) continue;
    const shortDesc = unescapeNewlines(c[iShort] || '');
    const desc = unescapeNewlines(c[iDesc] || '');
    const category = normCat(c[iCat] || '');
    const brandRaw = c[iBrand] ? c[iBrand].trim() : '';
    const brand = brandRaw || deriveBrand(name, shortDesc || desc);
    const caliber = deriveCaliber(name, shortDesc, desc, category);

    if (brand) brandsSet.add(brand);
    if (caliber) calibersSet.add(caliber);

    // slug único
    let slug = slugify(name) || ('producto-' + n);
    if (usedSlugs.has(slug)) { let k = 2; while (usedSlugs.has(slug + '-' + k)) k++; slug = slug + '-' + k; }
    usedSlugs.add(slug);

    // imágenes
    const urls = (c[iImg] || '').split(',').map(u => u.trim()).filter(Boolean);
    const images = [];
    for (let idx = 0; idx < urls.length; idx++) {
      const ext = extFromUrl(urls[idx]);
      const fname = (idx === 0 ? slug : slug + '-' + (idx + 1)) + ext;
      const dest = path.join(IMG_DIR, fname);
      let ok = false;
      try { ok = await downloadImage(urls[idx], dest); } catch (e) { ok = false; }
      if (ok) images.push('productos/' + fname);
    }

    products.push({
      id: n,
      name,
      slug,
      brand,
      category,
      caliber,
      image: images[0] || 'placeholder-product.svg',
      gallery: images.slice(1),
      desc: shortDesc || desc || '',
      fullDesc: desc || shortDesc || ''
    });
  }

  // calibres ordenados
  const calibers = CALIBER_ORDER.filter(c => calibersSet.has(c));
  calibersSet.forEach(c => { if (!calibers.includes(c)) calibers.push(c); });

  const brands = Array.from(brandsSet).sort();
  const cats = Object.keys(CATEGORY_LABELS).map(c => ({ slug: c, label: CATEGORY_LABELS[c] }));

  const items = products.map(p =>
    '  ' + JSON.stringify(p)
  ).join(',\n');

  const imgBase = process.env.MAGNUM_IMG_BASE || '/assets/img/';
  const out = `/* Catálogo Magnum Guns & Ammo Shop — generado desde productos.csv */\n\nwindow.MAGNUM_IMG_BASE = '${imgBase}';\n\nwindow.MAGNUM_PRODUCTS = [\n${items}\n];\n\nwindow.MAGNUM_CATEGORIES = ${JSON.stringify(cats, null, 2)};\n\nwindow.MAGNUM_BRANDS = ${JSON.stringify(brands, null, 2)};\n\nwindow.MAGNUM_CALIBERS = ${JSON.stringify(calibers, null, 2)};\n`;

  const outPath = path.resolve(process.cwd(), 'data', 'products.js');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, out, 'utf8');

  console.log('✔ Productos importados: ' + products.length);
  console.log('✔ Marcas detectadas: ' + brands.join(', '));
  console.log('✔ Calibres detectados: ' + calibers.join(', '));
  console.log('✔ Imágenes descargadas a assets/img/productos/');
  console.log('✔ Generado: ' + outPath);
}

main().catch(e => { console.error(e); process.exit(1); });
