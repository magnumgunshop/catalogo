#!/usr/bin/env node
/* Servidor estático mínimo para previsualizar el sitio.
   Uso:  node scripts/serve.js  [puerto]  (por defecto 8080) */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.argv[2], 10) || 8080;
const ROOT = path.resolve(__dirname, '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.pdf': 'application/pdf',
  '.csv': 'text/csv; charset=utf-8',
  '.ico': 'image/x-icon'
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  // Rutas limpias de producto: /producto/<slug>/ → /producto/index.html
  if (/^\/producto\/.+/.test(urlPath) && urlPath !== '/producto/index.html') {
    urlPath = '/producto/index.html';
  }
  let filePath = path.join(ROOT, urlPath);

  // Evitar path traversal
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end('Forbidden'); }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isDirectory()) {
      // Resolver index.html de la carpeta (como Vercel)
      filePath = path.join(filePath, 'index.html');
      return fs.stat(filePath, (e2, s2) => {
        if (e2 || !s2.isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('404 Not Found: ' + urlPath); }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return fs.createReadStream(filePath).pipe(res);
      });
    }
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found: ' + urlPath);
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
}).listen(PORT, '127.0.0.1', () => {
  console.log('Magnum Gun Shop sirviendo en http://127.0.0.1:' + PORT);
});
