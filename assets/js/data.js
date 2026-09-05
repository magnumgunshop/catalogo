/* ============================================================
   MAGNUM — Capa de datos (Supabase con respaldo local)
   ------------------------------------------------------------
   Si Supabase está configurado (SUPABASE_URL + KEY), los datos
   de productos, paquetes y slider se leen de las tablas.
   Si no, se usan los datos locales (data/*.js).
   ============================================================ */

(function () {
  'use strict';

  const url = window.SUPABASE_URL;
  const key = window.SUPABASE_ANON_KEY;
  let sb = null;

  if (url && key && window.supabase && window.supabase.createClient) {
    sb = window.supabase.createClient(url, key);
  }

  function normProduct(p) {
    return {
      id: p.id, name: p.name, slug: p.slug, brand: p.brand,
      category: p.category, caliber: p.caliber, image: p.image,
      gallery: p.gallery || [], desc: p.short_desc || '',
      fullDesc: p.full_desc || p.short_desc || ''
    };
  }

  async function getProducts() {
    if (sb) {
      try {
        const { data, error } = await sb.from('products').select('*').order('id', { ascending: true });
        if (!error && data) return data.map(normProduct);
      } catch (e) { /* caer a local */ }
    }
    return window.MAGNUM_PRODUCTS || [];
  }

  async function getPaquetes() {
    if (sb) {
      try {
        const { data, error } = await sb.from('paquetes').select('*').order('sort_order', { ascending: true });
        if (!error && data) return data.map(p => ({
          id: p.id, title: p.title, price: p.price,
          items: p.items || [], featured: !!p.featured, sort_order: p.sort_order
        }));
      } catch (e) {}
    }
    return window.MAGNUM_PAQUETES || [];
  }

  async function getSlides() {
    if (sb) {
      try {
        const { data, error } = await sb.from('slides').select('*').order('sort_order', { ascending: true });
        if (!error && data) return data.filter(s => s.active !== false).map(s => ({
          id: s.id, kicker: s.kicker, title: s.title, accent: s.accent,
          text: s.body || '', image: s.image,
          btn1_text: s.btn1_text, btn1_url: s.btn1_url,
          btn2_text: s.btn2_text, btn2_url: s.btn2_url,
          sort_order: s.sort_order, active: s.active
        }));
      } catch (e) {}
    }
    return window.MAGNUM_SLIDES || [];
  }

  window.MAGNUM_DATA = {
    supabase: sb,
    isSupabase: !!sb,
    getProducts: getProducts,
    getPaquetes: getPaquetes,
    getSlides: getSlides
  };

  // Cargar y publicar los datos antes de que main.js renderice
  (async function load() {
    try {
      const [products, paquetes, slides] = await Promise.all([getProducts(), getPaquetes(), getSlides()]);
      window.MAGNUM_PRODUCTS = products;
      window.MAGNUM_PAQUETES = paquetes;
      window.MAGNUM_SLIDES = slides;
    } catch (e) {}
    window.MAGNUM_READY = true;
    document.dispatchEvent(new Event('magnum:data'));
  })();
})();
