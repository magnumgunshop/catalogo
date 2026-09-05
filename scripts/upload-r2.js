#!/usr/bin/env node
/* ============================================================
   Sube las imágenes de producto a Cloudflare R2 (compatible S3)
   ------------------------------------------------------------
   Requiere credenciales por variables de entorno:

     R2_ACCOUNT_ID          (el Account ID de Cloudflare)
     R2_ACCESS_KEY_ID       (Access Key ID de la API de R2)
     R2_SECRET_ACCESS_KEY   (Secret Access Key de R2)
     R2_BUCKET              (nombre del bucket)
     R2_PREFIX              (opcional, por defecto "productos")

   Uso (PowerShell):
     $env:R2_ACCOUNT_ID="..."; $env:R2_ACCESS_KEY_ID="...";
     $env:R2_SECRET_ACCESS_KEY="..."; $env:R2_BUCKET="...";
     node scripts/upload-r2.js
   ============================================================ */

const { S3Client, PutObjectCommand, ListBucketsCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY = process.env.R2_ACCESS_KEY_ID;
const SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY;
let BUCKET = process.env.R2_BUCKET;
const PREFIX = process.env.R2_PREFIX || 'productos';

const SOURCE_DIR = path.resolve(process.cwd(), 'assets', 'img', 'productos');

function mime(ext) {
  return {
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml'
  }[ext.toLowerCase()] || 'application/octet-stream';
}

async function main() {
  const missing = [];
  if (!ACCOUNT_ID) missing.push('R2_ACCOUNT_ID');
  if (!ACCESS_KEY) missing.push('R2_ACCESS_KEY_ID');
  if (!SECRET_KEY) missing.push('R2_SECRET_ACCESS_KEY');
  if (missing.length) {
    console.error('Faltan variables de entorno: ' + missing.join(', '));
    console.error('Defínelas y vuelve a ejecutar:  node scripts/upload-r2.js');
    process.exit(1);
  }

  if (!fs.existsSync(SOURCE_DIR)) {
    console.error('No existe la carpeta de imágenes: ' + SOURCE_DIR);
    console.error('Ejecuta primero:  node scripts/import-productos.js productos.csv');
    process.exit(1);
  }

  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY }
  });

  // Descubrir el bucket si no se indicó
  if (!BUCKET) {
    const list = await client.send(new ListBucketsCommand({}));
    const buckets = (list.Buckets || []).map(b => b.Name);
    if (!buckets.length) {
      console.error('No se encontraron buckets con estas credenciales. Revisa el alcance del API token.');
      process.exit(1);
    }
    if (buckets.length === 1) {
      BUCKET = buckets[0];
      console.log('✔ Bucket detectado: ' + BUCKET);
    } else {
      console.error('Hay varios buckets. Indica cuál con R2_BUCKET. Disponibles: ' + buckets.join(', '));
      process.exit(1);
    }
  }

  const files = fs.readdirSync(SOURCE_DIR).filter(f => fs.statSync(path.join(SOURCE_DIR, f)).isFile());
  let ok = 0, fail = 0;
  for (const f of files) {
    const body = fs.readFileSync(path.join(SOURCE_DIR, f));
    try {
      await client.send(new PutObjectCommand({
        Bucket: BUCKET, Key: `${PREFIX}/${f}`, Body: body, ContentType: mime(path.extname(f))
      }));
      ok++;
    } catch (e) {
      fail++;
      console.error('✖ ' + f + ' → ' + e.message);
    }
  }

  console.log(`✔ ${ok} imágenes subidas, ${fail} fallos → bucket "${BUCKET}" prefijo "${PREFIX}/"`);
  console.log('');
  console.log('Ahora en data/products.js cambia la base por la URL pública de tu bucket, por ejemplo:');
  console.log(`  window.MAGNUM_IMG_BASE = 'https://TU-BUCKET.r2.dev/';`);
  console.log('  (o tu dominio personalizado, asumiendo que subiste con prefijo "productos/")');
}

main().catch(e => { console.error(e); process.exit(1); });
