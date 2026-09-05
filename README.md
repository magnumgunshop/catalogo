# Magnum Guns & Ammo Shop — Sitio Web

Sitio de **Magnum Guns & Ammo Shop** (venta de armas en Chiriquí). HTML + CSS + JS (vanilla), animaciones **GSAP + ScrollTrigger**, tipografía **Montserrat**, desplegado en **Vercel**, imágenes en **Cloudflare R2** y contenido editable en **Supabase** (panel `/admin/` con login).

## Rutas (slugs)

| Página | Ruta |
|---|---|
| Inicio | `/` |
| Nosotros | `/sobre-nosotros/` |
| Catálogo | `/catalogo/` |
| Detalle de producto | `/producto/?slug=...` |
| Paquetes de Tiro | `/paquetes-de-tiro/` |
| Catálogo Digital | `/catalogo-digital/` |
| Campo de Tiro | `/campo-de-tiro/` |
| Polígono Cerrado | `/poligono-cerrado/` |
| Permiso de Armas | `/tramites-permiso-de-armas-en-panama/` |
| Contacto | `/contacto/` |
| Admin | `/admin/` |

## Estructura

```
├── index.html  +  carpetas por página (sobre-nosotros/, catalogo/, ...)
├── admin/index.html              (panel: productos + paquetes + slider, con login)
├── vercel.json
├── assets/
│   ├── css/style.css
│   ├── js/partials.js            (header + footer + menú)
│   ├── js/supabase-config.js     (URL y anon key de Supabase — EDITAR)
│   ├── js/data.js                (lee Supabase; si no, usa data/*.js locales)
│   ├── js/main.js                (GSAP, slider, catálogo, producto, paquetes)
│   ├── img/productos/            (imágenes locales de respaldo)
│   └── pdf/                      (catálogos PDF)
├── data/products.js · paquetes.js · slider.js   (datos locales de respaldo)
├── supabase/schema.sql           (tablas + RLS + datos semilla)
└── scripts/ (import-productos, upload-r2, generate-supabase-sql, serve)
```

## Configuración de Supabase (panel con login)

1. Crea un proyecto en **supabase.com** (plan gratis).
2. En **SQL Editor**, pega y ejecuta todo el contenido de `supabase/schema.sql`. Esto crea las tablas `products`, `paquetes` y `slides`, con políticas de lectura pública y escritura solo para autenticados, y carga los datos iniciales.
3. Crea el usuario administrador: **Authentication → Users → Add user** (email + contraseña). Ese será tu login del panel.
   - *(Opcional: en Authentication → Providers, desactiva "Email sign-up" para que nadie más se registre.)*
4. En **Project Settings → API**, copia `Project URL` y `anon public key`.
5. Pégalas en `assets/js/supabase-config.js`:
   ```js
   window.SUPABASE_URL = "https://TU-PROYECTO.supabase.co";
   window.SUPABASE_ANON_KEY = "TU-ANON-KEY";
   ```
6. Entra a `/admin/`, inicia sesión y edita **Productos**, **Paquetes de Tiro** y **Slider del Home**. Los cambios se guardan en vivo.

> El sitio público lee de Supabase en runtime. Si `supabase-config.js` está vacío, usa automáticamente los datos locales (`data/*.js`), así nunca se rompe.

## Imágenes (Cloudflare R2)

La base de imágenes de producto está en `data/products.js`:
```js
window.MAGNUM_IMG_BASE = 'https://pub-xxxxx.r2.dev/';
```
Cada producto guarda su imagen como ruta relativa a esa base (ej. `productos/canik-mete-mc9.webp`).

- Subir imágenes: `node scripts/upload-r2.js` (variables `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`).
- Re-importar desde CSV (WordPress): `node scripts/import-productos.js productos.csv`. Para que apunte a R2: `$env:MAGNUM_IMG_BASE="https://...r2.dev/"` antes de correrlo.

## Previsualizar localmente

```bash
node scripts/serve.js     # http://127.0.0.1:8080
```

## Despliegue en Vercel

1. Sube el repo a Vercel (framework *Other*, sin build).
2. `vercel.json` ya configura `trailingSlash` y la ruta de detalle `/producto/:slug`.
