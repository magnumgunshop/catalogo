/* ============================================================
   MAGNUM GUNS & AMMO SHOP — Header + Footer (compartidos)
   Se inyectan una vez aquí y se usan en todas las páginas.
   Rutas base: relativas a la raíz (Vercel).
   ============================================================ */

window.MAGNUM = window.MAGNUM || {};
window.MAGNUM.WA_RESERVE = "https://wa.me/+50767449433/?text=Hola%20MagnunGunShop%2C%20quiero%20reservar";
window.MAGNUM.WA_INFO = "https://wa.me/+50767449433/?text=Hola%20MagnunGunShop%2C%20necesito%20m%C3%A1s%20informaci%C3%B3n";
window.MAGNUM.WA_CONSULT = "https://wa.me/+50767449433/?text=Hola%20MagnunGunShop%2C%20me%20interesa%20este%20producto";
window.MAGNUM.IG = "https://www.instagram.com/magnumgunshop/";
window.MAGNUM.PHONE = "+507 6744-9433";

const ICONS = {
  wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20Zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.6-1.3.1-.2 0-.4 0-.5l-.8-1.9c-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.1s.9 2.5 1 2.6c.1.2 1.8 2.8 4.4 3.9.6.3 1.1.4 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.4-.6 1.6-1.1.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.5-.3Z"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.6 2.7a2 2 0 0 1-.4 2.1L8 9.9a16 16 0 0 0 6 6l1.4-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.5 2.7.6a2 2 0 0 1 1.8 2.1Z"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
  ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
};

function currentSlug() {
  const seg = location.pathname.split('/').filter(Boolean);
  if (!seg.length) return 'home';
  const last = seg[seg.length - 1];
  if (last === 'index.html') return seg[seg.length - 2] || 'home';
  return seg[0];
}

function buildHeader() {
  const slug = currentSlug();
  const is = (s) => slug === s ? ' active' : '';
  const enlacesActive = ['catalogo-digital', 'campo-de-tiro', 'poligono-cerrado', 'tramites-permiso-de-armas-en-panama'].includes(slug) ? ' active' : '';
  const catActive = (slug === 'catalogo' || slug === 'producto') ? ' active' : '';

  const glock = `<img src="https://hzdojgoositcefkfklly.supabase.co/storage/v1/object/public/media/logos/glock.png" alt="GLOCK">`;

  const nav = `
  <header class="site-header" id="siteHeader">
    <div class="topbar"><div class="container topbar-inner"><span>Distribuidores Oficiales de GLOCK</span>${glock}</div></div>
    <div class="container header-inner">
      <a href="/" class="brand" aria-label="Magnum Guns &amp; Ammo Shop">
        <img src="/assets/img/logo.webp" alt="Magnum Gun Shop logo">
        <span class="brand-text"><strong>Magnum Guns</strong><span>&amp; Ammo Shop</span></span>
      </a>

      <nav class="nav" aria-label="Menú principal">
        <ul class="main-menu">
          <li><a href="/" class="${is('home').trim()}">Inicio</a></li>
          <li><a href="/sobre-nosotros/" class="${is('sobre-nosotros').trim()}">Nosotros</a></li>
          <li>
            <a href="/catalogo/" class="${catActive.trim()}">Catálogo <span class="caret"></span></a>
            <div class="submenu">
              <a href="/catalogo/?cat=pistolas">Pistolas</a>
              <a href="/catalogo/?cat=escopetas">Escopetas</a>
              <a href="/catalogo/?cat=rifles">Rifles</a>
              <a href="/catalogo/?cat=fusiles-semiautomaticos">Fusiles Semiautomáticos</a>
              <a href="/catalogo/?cat=municiones">Municiones</a>
            </div>
          </li>
          <li><a href="/paquetes-de-tiro/" class="${is('paquetes-de-tiro').trim()}">Paquetes de Tiro</a></li>
          <li>
            <a href="#" class="${enlacesActive.trim()}">Enlaces <span class="caret"></span></a>
            <div class="submenu">
              <a href="/catalogo-digital/">Catálogo Digital</a>
              <a href="/campo-de-tiro/">Campo de Tiro</a>
              <a href="/poligono-cerrado/">Polígono Cerrado</a>
              <a href="/tramites-permiso-de-armas-en-panama/">Permiso de Armas en Panamá</a>
            </div>
          </li>
          <li><a href="/contacto/" class="${is('contacto').trim()}">Contacto</a></li>
        </ul>
      </nav>

      <div class="header-cta">
        <a href="${window.MAGNUM.WA_INFO}" target="_blank" rel="noopener" class="btn btn-whatsapp btn-sm btn-header">
          ${ICONS.wa} Escríbenos
        </a>
        <button class="burger" id="burger" aria-label="Abrir menú" aria-expanded="false"><span></span></button>
      </div>
    </div>
  </header>

  <div class="mobile-menu" id="mobileMenu">
    <nav class="mm-nav">
      <a href="/" class="${is('home').trim()}">Inicio</a>
      <a href="/sobre-nosotros/" class="${is('sobre-nosotros').trim()}">Nosotros</a>

      <button class="mm-toggle" data-mm-toggle><span>Catálogo</span><span class="mm-ic">+</span></button>
      <div class="mm-panel">
        <a href="/catalogo/">Ver todo el catálogo</a>
        <a href="/catalogo/?cat=pistolas">Pistolas</a>
        <a href="/catalogo/?cat=escopetas">Escopetas</a>
        <a href="/catalogo/?cat=rifles">Rifles</a>
        <a href="/catalogo/?cat=fusiles-semiautomaticos">Fusiles Semiautomáticos</a>
        <a href="/catalogo/?cat=municiones">Municiones</a>
      </div>

      <a href="/paquetes-de-tiro/" class="${is('paquetes-de-tiro').trim()}">Paquetes de Tiro</a>

      <button class="mm-toggle" data-mm-toggle><span>Enlaces</span><span class="mm-ic">+</span></button>
      <div class="mm-panel">
        <a href="/catalogo-digital/">Catálogo Digital</a>
        <a href="/campo-de-tiro/">Campo de Tiro</a>
        <a href="/poligono-cerrado/">Polígono Cerrado</a>
        <a href="/tramites-permiso-de-armas-en-panama/">Permiso de Armas en Panamá</a>
      </div>

      <a href="/contacto/" class="${is('contacto').trim()}">Contacto</a>

      <div class="mm-distribuidor"><span>Distribuidores Oficiales de GLOCK</span>${glock}</div>
    </nav>
  </div>
  `;

  const host = document.getElementById('site-header');
  if (host) host.innerHTML = nav;

  const header = document.getElementById('siteHeader');
  const onScroll = () => header && header.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = document.getElementById('burger');
  const mm = document.getElementById('mobileMenu');
  if (burger && mm) {
    const toggleMenu = (open) => {
      mm.classList.toggle('open', open);
      document.body.classList.toggle('menu-open', open);
      burger.classList.toggle('active', open);
      burger.setAttribute('aria-expanded', String(open));
    };
    burger.addEventListener('click', () => toggleMenu(!mm.classList.contains('open')));
    mm.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));
    mm.querySelectorAll('[data-mm-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const panel = btn.nextElementSibling;
        const open = panel.classList.toggle('open');
        btn.classList.toggle('open', open);
        btn.querySelector('.mm-ic').textContent = open ? '−' : '+';
        panel.style.maxHeight = open ? panel.scrollHeight + 'px' : null;
      });
    });
  }
}

function buildFooter() {
  const year = new Date().getFullYear();
  const footer = `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="f-brand">
          <img src="/assets/img/logo-white.webp" alt="Magnum Guns &amp; Ammo Shop">
          <p>Magnum Guns &amp; Ammo Shop. Tienda de confianza en David, Chiriquí, para la compra de armas, municiones y equipos de seguridad.</p>
        </div>
        <div>
          <h4>Navegación</h4>
          <ul class="f-links">
            <li><a href="/">Inicio</a></li>
            <li><a href="/sobre-nosotros/">Nosotros</a></li>
            <li><a href="/catalogo/">Catálogo</a></li>
            <li><a href="/paquetes-de-tiro/">Paquetes de Tiro</a></li>
            <li><a href="/tramites-permiso-de-armas-en-panama/">Permiso de Armas</a></li>
            <li><a href="/contacto/">Contacto</a></li>
          </ul>
        </div>
        <div>
          <h4>Servicios</h4>
          <ul class="f-links">
            <li><a href="/catalogo-digital/">Catálogo Digital</a></li>
            <li><a href="/campo-de-tiro/">Campo de Tiro</a></li>
            <li><a href="/poligono-cerrado/">Polígono Cerrado</a></li>
            <li><a href="/tramites-permiso-de-armas-en-panama/">Trámites de Permisos</a></li>
            <li><a href="/paquetes-de-tiro/">Reservar Sesión</a></li>
          </ul>
        </div>
        <div>
          <h4>Contacto</h4>
          <ul class="f-contact">
            <li>${ICONS.pin}<span>Avenida Red Gray,<br>David, Chiriquí</span></li>
            <li>${ICONS.ig}<a href="${window.MAGNUM.IG}" target="_blank" rel="noopener">Instagram: @magnumgunshop</a></li>
            <li>${ICONS.phone}<a href="tel:+50767449433">Teléfono: ${window.MAGNUM.PHONE}</a></li>
            <li>${ICONS.wa}<a href="${window.MAGNUM.WA_INFO}" target="_blank" rel="noopener">WhatsApp: ${window.MAGNUM.PHONE}</a></li>
          </ul>
          <div class="f-social">
            <a href="${window.MAGNUM.IG}" target="_blank" rel="noopener" aria-label="Instagram">${ICONS.ig}</a>
            <a href="${window.MAGNUM.WA_INFO}" target="_blank" rel="noopener" aria-label="WhatsApp">${ICONS.wa}</a>
            <a href="tel:+50767449433" aria-label="Teléfono">${ICONS.phone}</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>Magnum Guns &amp; Ammo Shop. ${year}. Todos los derechos reservados.</p>
        <p>Creado por <a href="${window.MAGNUM.IG}" target="_blank" rel="noopener">Beard Click Design</a></p>
      </div>
    </div>
  </footer>
  `;
  const host = document.getElementById('site-footer');
  if (host) host.innerHTML = footer;
}

function buildAgeGate() {
  if (currentSlug() === 'admin') return; // sin verificación en el panel
  if (localStorage.getItem('magnum_age_ok') === '1') return; // ya verificó

  const html = `
  <div class="age-gate" id="ageGate">
    <div class="age-gate-box">
      <img src="/assets/img/logo.webp" alt="Magnum Gun Shop">
      <h2>Sitio Restringido</h2>
      <p>Debes ser mayor de 18 años para ver este sitio. Por favor verifique para poder entrar.</p>
      <div class="age-actions">
        <button class="btn btn-primary" id="ageYes">Soy mayor de 18 años</button>
        <button class="btn btn-ghost" id="ageNo">Soy menor de 18 años</button>
      </div>
    </div>
  </div>
  <div class="age-denied" id="ageDenied" style="display:none;">
    <div class="age-gate-box">
      <h2>Acceso denegado</h2>
      <p>Acceso restringido por la edad.</p>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  document.body.classList.add('age-locked');

  document.getElementById('ageYes').addEventListener('click', () => {
    localStorage.setItem('magnum_age_ok', '1');
    document.getElementById('ageGate').remove();
    const denied = document.getElementById('ageDenied');
    if (denied) denied.remove();
    document.body.classList.remove('age-locked');
  });
  document.getElementById('ageNo').addEventListener('click', () => {
    document.getElementById('ageGate').style.display = 'none';
    const denied = document.getElementById('ageDenied');
    if (denied) denied.style.display = 'flex';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  buildHeader();
  buildFooter();
  buildAgeGate();
  document.documentElement.classList.remove('no-js');
});
