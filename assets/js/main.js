/* ============================================================
   MAGNUM GUNS & AMMO SHOP — Interacciones y animaciones
   GSAP + ScrollTrigger · Slider · Catálogo · Producto · Paquetes · FAQ
   ============================================================ */

(function () {
  'use strict';

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function imgBase() { return window.MAGNUM_IMG_BASE || ''; }
  function imgSrc(p) { return imgBase() + (p.image || 'placeholder-product.svg'); }
  function catLabel(slug) { const c = (window.MAGNUM_CATEGORIES || []).find(x => x.slug === slug); return c ? c.label : slug; }

  /* Espera a que data.js publique los datos (Supabase o locales) */
  function whenDataReady(fn) {
    if (window.MAGNUM_READY) { fn(); return; }
    let done = false;
    const run = () => { if (done) return; done = true; fn(); };
    document.addEventListener('magnum:data', run, { once: true });
    setTimeout(run, 3000); // respaldo: si no hay data.js, usa datos locales
  }

  /* ---------- 1. Animaciones de aparición (ScrollTrigger) ---------- */
  function initReveals() {
    if (!gsap || !ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('[data-reveal]').forEach((el) => {
      const dir = el.getAttribute('data-reveal') || 'up';
      const delay = parseFloat(el.getAttribute('data-delay') || '0');
      let from = { y: 40, autoAlpha: 0 };
      if (dir === 'left') from = { x: -50, autoAlpha: 0 };
      if (dir === 'right') from = { x: 50, autoAlpha: 0 };
      if (dir === 'fade') from = { autoAlpha: 0 };
      if (dir === 'scale') from = { scale: 0.9, autoAlpha: 0 };
      gsap.fromTo(el, from, {
        x: 0, y: 0, scale: 1, autoAlpha: 1, duration: 0.9, delay: delay, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 86%', once: true }
      });
    });
    gsap.utils.toArray('[data-reveal-stagger]').forEach((group) => {
      gsap.fromTo(group.children, { y: 30, autoAlpha: 0 }, {
        y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.12, ease: 'power3.out',
        scrollTrigger: { trigger: group, start: 'top 86%', once: true }
      });
    });
  }

  /* ---------- 2. Hero Slider (dinámico, desde MAGNUM_SLIDES) ---------- */
  function initHeroSlider() {
    const slider = document.querySelector('[data-hero-slider]');
    if (!slider) return;
    const slidesData = window.MAGNUM_SLIDES || [];
    if (!slidesData.length) return;

    const html = slidesData.map((s, i) => `
      <div class="hero-slide${i === 0 ? ' active' : ''}" style="background-image:url('${esc(s.image)}')">
        <div class="slide-inner">
          <div class="kicker center">${esc(s.kicker || '')}</div>
          <h2 class="slide-title">${esc(s.title)}${s.accent ? ' <em>' + esc(s.accent) + '</em>' : ''}</h2>
          <p>${esc(s.text || '')}</p>
          <div class="slide-actions">
            ${s.btn1_text ? `<a href="${esc(s.btn1_url || '#')}" class="btn btn-primary">${esc(s.btn1_text)}</a>` : ''}
            ${s.btn2_text ? `<a href="${esc(s.btn2_url || '#')}" class="btn btn-ghost">${esc(s.btn2_text)}</a>` : ''}
          </div>
        </div>
      </div>`).join('');

    const controls = slider.querySelector('.slider-controls');
    if (controls) controls.insertAdjacentHTML('beforebegin', html);
    else slider.insertAdjacentHTML('afterbegin', html);

    const slides = slider.querySelectorAll('.hero-slide');
    const dotsWrap = slider.querySelector('.slider-dots');
    const prev = slider.querySelector('[data-slider-prev]');
    const next = slider.querySelector('[data-slider-next]');
    let current = 0, timer = null;
    if (!slides.length || !dotsWrap) return;

    slides.forEach((s, i) => {
      const b = document.createElement('button');
      b.setAttribute('aria-label', 'Ir a la diapositiva ' + (i + 1));
      if (i === 0) b.classList.add('active');
      b.addEventListener('click', () => goTo(i, true));
      dotsWrap.appendChild(b);
    });
    const dots = dotsWrap.querySelectorAll('button');

    function goTo(i, manual) {
      slides[current].classList.remove('active');
      dots[current].classList.remove('active');
      current = (i + slides.length) % slides.length;
      slides[current].classList.add('active');
      dots[current].classList.add('active');
      if (gsap) {
        const inner = slides[current].querySelector('.slide-inner');
        gsap.fromTo(inner ? inner.children : [], { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.14, ease: 'power3.out' });
      }
      if (manual) resetTimer();
    }
    function resetTimer() { if (timer) clearInterval(timer); timer = setInterval(() => goTo(current + 1), 6500); }
    if (prev) prev.addEventListener('click', () => goTo(current - 1, true));
    if (next) next.addEventListener('click', () => goTo(current + 1, true));
    resetTimer();
    slider.addEventListener('mouseenter', () => clearInterval(timer));
    slider.addEventListener('mouseleave', resetTimer);
    let touchX = 0;
    slider.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', (e) => { const dx = e.changedTouches[0].clientX - touchX; if (Math.abs(dx) > 50) goTo(current + (dx < 0 ? 1 : -1), true); }, { passive: true });
  }

  /* ---------- 3. Tarjeta de producto (HTML) ---------- */
  function productCard(p) {
    const cat = catLabel(p.category);
    const brand = p.brand ? `<div class="pc-brand">${esc(p.brand)}</div>` : '';
    return `
    <article class="product-card">
      <a class="pc-link" href="/producto/${encodeURIComponent(p.slug)}" aria-label="${esc(p.name)}">
        <div class="pc-media">
          <span class="pc-badge">${esc(cat)}</span>
          <img src="${esc(imgSrc(p))}" alt="${esc(p.name)}" loading="lazy">
        </div>
      </a>
      <div class="pc-body">
        ${brand}
        <h3><a href="/producto/${encodeURIComponent(p.slug)}">${esc(p.name)}</a></h3>
        ${p.caliber ? `<span class="pc-cal">${esc(p.caliber)}</span>` : ''}
      </div>
    </article>`;
  }

  /* ---------- 4. Catálogo en home (vista previa) ---------- */
  function renderHomeCatalog() {
    const grid = document.getElementById('homeCatalog');
    if (!grid) return;
    const products = (window.MAGNUM_PRODUCTS || []).slice(0, 8);
    grid.innerHTML = products.map(productCard).join('');
  }

  /* ---------- 5. Catálogo con filtros (sidebar) ---------- */
  function renderCatalog() {
    const grid = document.getElementById('catalogGrid');
    if (!grid) return;

    const products = window.MAGNUM_PRODUCTS || [];
    const categories = window.MAGNUM_CATEGORIES || [];
    const brandSet = new Set(window.MAGNUM_BRANDS || []);
    const calSet = new Set(window.MAGNUM_CALIBERS || []);
    products.forEach(p => { if (p.brand) brandSet.add(p.brand); if (p.caliber) calSet.add(p.caliber); });
    const brands = Array.from(brandSet).sort();
    const calibers = Array.from(calSet);

    const params = new URLSearchParams(location.search);
    const state = { cat: params.get('cat') || 'todos', brand: 'todos', cal: 'todos' };

    function buildGroup(containerId, items, key) {
      const wrap = document.getElementById(containerId);
      if (!wrap) return;
      wrap.innerHTML = '';
      const mk = (val, label, count) => {
        const b = document.createElement('button');
        b.dataset[key] = val;
        b.className = state[key] === val ? 'active' : '';
        b.innerHTML = `${esc(label)} <span class="cnt">${count}</span>`;
        return b;
      };
      wrap.appendChild(mk('todos', 'Todos', products.length));
      items.forEach(item => {
        const val = typeof item === 'object' ? item.slug : item;
        const label = typeof item === 'object' ? item.label : item;
        const count = products.filter(p => (key === 'cat' ? p.category === val : key === 'brand' ? p.brand === val : p.caliber === val)).length;
        if (count > 0) wrap.appendChild(mk(val, label, count));
      });
    }

    buildGroup('catFilters', categories, 'cat');
    buildGroup('brandFilters', brands, 'brand');
    buildGroup('calFilters', calibers, 'cal');

    const countEl = document.getElementById('catalogCount');

    function apply() {
      const filtered = products.filter(p =>
        (state.cat === 'todos' || p.category === state.cat) &&
        (state.brand === 'todos' || p.brand === state.brand) &&
        (state.cal === 'todos' || p.caliber === state.cal)
      );
      if (countEl) countEl.textContent = filtered.length + (filtered.length === 1 ? ' producto' : ' productos');
      if (!filtered.length) {
        grid.innerHTML = '<div class="catalog-empty">No encontramos productos con esos filtros. <a href="/contacto/" style="color:var(--accent)">Contáctanos</a> para consultar disponibilidad.</div>';
        return;
      }
      grid.innerHTML = filtered.map(productCard).join('');
      if (gsap) gsap.fromTo(grid.querySelectorAll('.product-card'), { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.05, ease: 'power2.out' });
    }

    ['catFilters', 'brandFilters', 'calFilters'].forEach(id => {
      const wrap = document.getElementById(id);
      if (!wrap) return;
      wrap.addEventListener('click', (e) => {
        const btn = e.target.closest('button'); if (!btn) return;
        const key = Object.keys(btn.dataset)[0];
        state[key] = btn.dataset[key];
        wrap.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === btn));
        apply();
      });
    });

    const clear = document.getElementById('clearFilters');
    if (clear) clear.addEventListener('click', () => {
      state.cat = state.brand = state.cal = 'todos';
      ['catFilters', 'brandFilters', 'calFilters'].forEach(id => {
        const w = document.getElementById(id);
        if (w) w.querySelectorAll('button').forEach(b => b.classList.toggle('active', b.dataset[Object.keys(b.dataset)[0]] === 'todos'));
      });
      apply();
    });

    apply();
  }

  /* ---------- 6. Página de producto individual ---------- */
  function renderProductDetail() {
    const root = document.getElementById('productDetail');
    if (!root) return;
    const products = window.MAGNUM_PRODUCTS || [];
    const params = new URLSearchParams(location.search);
    let slug = params.get('slug');
    const id = params.get('id');
    if (!slug) {
      const m = location.pathname.match(/\/producto\/([^/]+)/);
      if (m) slug = decodeURIComponent(m[1]);
    }
    const p = products.find(x => (slug && x.slug === slug) || (id && String(x.id) === id));

    if (!p) {
      root.innerHTML = `<div class="catalog-empty" style="padding:80px 20px;">
        <h2 style="margin-bottom:14px;">Producto no encontrado</h2>
        <p class="muted">El producto que buscas no está disponible.</p>
        <a href="/catalogo/" class="btn btn-primary mt-2">Ver Catálogo</a>
      </div>`;
      return;
    }

    document.title = p.name + ' — Magnum Guns & Ammo Shop';
    const cat = catLabel(p.category);
    const gallery = [p.image].concat(p.gallery || []).filter(Boolean);
    const specBrand = p.brand ? `<div class="spec"><b>Marca</b><span>${esc(p.brand)}</span></div>` : '';
    const shortDesc = (p.desc || '').trim();
    const fullDesc = (p.fullDesc || '').trim();
    const showFullDesc = fullDesc && fullDesc !== shortDesc;

    root.innerHTML = `
    <nav class="crumbs" aria-label="Migas de pan"><a href="/">Inicio</a><span class="sep">/</span><a href="/catalogo/">Catálogo</a><span class="sep">/</span><span>${esc(p.name)}</span></nav>

    <div class="pd-layout">
      <div class="pd-gallery">
        <div class="pd-main"><img id="pdMainImg" src="${esc(imgBase() + gallery[0])}" alt="${esc(p.name)}"></div>
        ${gallery.length > 1 ? `<div class="pd-thumbs">` + gallery.map((g, i) => `<button class="${i === 0 ? 'active' : ''}" data-img="${esc(imgBase() + g)}"><img src="${esc(imgBase() + g)}" alt="${esc(p.name)} ${i + 1}"></button>`).join('') + `</div>` : ''}
      </div>
      <div class="pd-info">
        <div class="pd-cat">${esc(cat)}</div>
        <h1>${esc(p.name)}</h1>
        <div class="pd-brand">${p.brand ? esc(p.brand) : '&nbsp;'}</div>
        <div class="pd-specs">
          ${specBrand}
          ${p.caliber ? `<div class="spec"><b>Calibre</b><span>${esc(p.caliber)}</span></div>` : ''}
          <div class="spec"><b>Categoría</b><span>${esc(cat)}</span></div>
        </div>
        ${shortDesc ? `<div class="pd-desc">${esc(shortDesc)}</div>` : ''}
        <div class="pd-cta">
          <a href="https://wa.me/+50767449433/?text=${encodeURIComponent('Hola MagnunGunShop, me interesa: ' + p.name)}" target="_blank" rel="noopener" class="btn btn-primary">Consultar por WhatsApp</a>
          <a href="/catalogo/" class="btn btn-ghost">Volver al Catálogo</a>
        </div>
        <p class="pd-note">Las compras de armas de fuego se completan en tienda, cumpliendo los requisitos legales de Panamá.</p>
      </div>
    </div>
    ${showFullDesc ? `<div class="pd-full"><h3>Descripción completa</h3><div class="pd-desc">${esc(fullDesc)}</div></div>` : ''}`;

    const mainImg = document.getElementById('pdMainImg');
    root.querySelectorAll('.pd-thumbs button').forEach(btn => {
      btn.addEventListener('click', () => {
        mainImg.src = btn.dataset.img;
        root.querySelectorAll('.pd-thumbs button').forEach(b => b.classList.toggle('active', b === btn));
      });
    });
  }

  /* ---------- 6b. Paquetes de tiro (dinámico, desde MAGNUM_PAQUETES) ---------- */
  function renderPackages() {
    const grid = document.getElementById('packagesGrid');
    if (!grid) return;
    const pkgs = window.MAGNUM_PAQUETES || [];
    grid.innerHTML = pkgs.map(p => `
      <article class="package${p.featured ? ' featured' : ''}">
        <div class="p-head"><div class="p-title">${esc(p.title)}</div><div class="p-price">${esc(p.price)}</div></div>
        <ul class="p-items">${(p.items || []).map(it => `<li>${esc(it)}</li>`).join('')}</ul>
        <a href="https://wa.me/+50767449433/?text=Hola%20MagnunGunShop%2C%20quiero%20reservar" target="_blank" rel="noopener" class="btn btn-primary">Seleccionar</a>
      </article>`).join('');
  }

  /* ---------- 6c. Botones "Seleccionar" → WhatsApp con info del paquete ---------- */
  function initPackageLinks() {
    document.querySelectorAll('.package').forEach(card => {
      const btn = card.querySelector('a.btn-primary');
      if (!btn) return;
      const title = (card.querySelector('.p-title') ? card.querySelector('.p-title').textContent : '').trim();
      const price = (card.querySelector('.p-price') ? card.querySelector('.p-price').textContent : '').trim();
      const items = Array.from(card.querySelectorAll('.p-items li')).map(li => li.textContent.trim()).filter(Boolean).join(', ');
      const msg = `Hola MagnunGunShop, quiero reservar el ${title} (${price})${items ? ': ' + items : ''}`;
      btn.href = 'https://wa.me/+50767449433/?text=' + encodeURIComponent(msg);
    });
  }

  /* ---------- 7. FAQ accordion ---------- */
  function initFaq() {
    document.querySelectorAll('.faq-item').forEach((item) => {
      const q = item.querySelector('.faq-q');
      if (!q) return;
      q.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item.open').forEach(o => { o.classList.remove('open'); o.querySelector('.faq-a').style.maxHeight = null; });
        if (!isOpen) { item.classList.add('open'); const a = item.querySelector('.faq-a'); a.style.maxHeight = a.scrollHeight + 'px'; }
      });
    });
  }

  /* ---------- 8. Marquee (texto e imágenes) ---------- */
  function initMarquee() {
    document.querySelectorAll('.marquee-track, .clients-marquee').forEach(track => {
      if (track.dataset.dup) return;
      track.dataset.dup = '1';
      track.innerHTML += track.innerHTML;
    });
  }

  /* ---------- 9. Contadores animados ---------- */
  function initCounters() {
    if (!gsap || !ScrollTrigger) return;
    gsap.utils.toArray('[data-count]').forEach((el) => {
      const target = parseFloat(el.getAttribute('data-count'));
      const suffix = el.getAttribute('data-suffix') || '';
      const obj = { v: 0 };
      gsap.to(obj, {
        v: target, duration: 1.8, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onUpdate: () => { el.textContent = Math.floor(obj.v) + suffix; }
      });
    });
  }

  /* ---------- 10. Botón para abrir filtros en móvil (catálogo) ---------- */
  function initFiltersToggle() {
    const btn = document.getElementById('filtersToggle');
    const sidebar = document.querySelector('.catalog-sidebar');
    if (!btn || !sidebar) return;
    btn.addEventListener('click', () => {
      const open = sidebar.classList.toggle('open');
      btn.textContent = open ? 'Cerrar filtros' : 'Filtros';
      btn.setAttribute('aria-expanded', String(open));
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initReveals();
    initFaq();
    initMarquee();
    initCounters();
    initFiltersToggle();
    whenDataReady(() => {
      initHeroSlider();
      renderHomeCatalog();
      renderCatalog();
      renderProductDetail();
      renderPackages();
      initPackageLinks();
    });
  });
})();
