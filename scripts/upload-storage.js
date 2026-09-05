#!/usr/bin/env node
/* Sube las imágenes locales a Supabase Storage (bucket "media", carpeta "productos/").
   Uso:
     $env:SUPABASE_URL="https://...supabase.co"
     $env:SUPABASE_SERVICE_KEY="...service_role..."
     node scripts/upload-storage.js
*/
const fs = require('fs');
const path = require('path');

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY;
const BUCKET = 'media';
const PREFIX = 'productos';
const SOURCE = path.resolve(process.cwd(), 'assets', 'img', 'productos');

const MIME = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml'
};

async function main() {
  if (!URL || !KEY) { console.error('Faltan SUPABASE_URL / SUPABASE_SERVICE_KEY'); process.exit(1); }
  if (!fs.existsSync(SOURCE)) { console.error('No existe ' + SOURCE); process.exit(1); }
  const files = fs.readdirSync(SOURCE).filter(f => fs.statSync(path.join(SOURCE, f)).isFile());
  let ok = 0, fail = 0;
  for (const f of files) {
    const body = fs.readFileSync(path.join(SOURCE, f));
    const res = await fetch(`${URL}/storage/v1/object/${BUCKET}/${PREFIX}/${f}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream', 'x-upsert': 'true' },
      body
    });
    if (res.ok) ok++;
    else { fail++; console.error('✖ ' + f + ' → ' + res.status + ' ' + (await res.text()).slice(0, 120)); }
  }
  console.log(`✔ ${ok} imágenes subidas, ${fail} fallos → ${BUCKET}/${PREFIX}/`);
}

main().catch(e => { console.error(e); process.exit(1); });
