/* ==========================================================================
   PL MENS WEAR — PRODUCTS
   Card factory + homepage sections + quick view + PLP + PDP + lookbook
   Exposes window.PLMWProducts
   ========================================================================== */

(function (window, document) {
  'use strict';

  var UI = window.PLMWUI, Data = window.PLMW, Wishlist = window.PLMWWishlist,
      Cart = window.PLMWCart, Nav = window.PLMWNav;
  var $ = UI.$, $all = UI.$all;

  /* ========================================================================
     CARD FACTORY
     ======================================================================== */
  function card(p, opts) {
    opts = opts || {};
    var off = Data.discountPercent(p);
    var wished = Wishlist.has(p.id);
    var imgA = Data.productImage(p.id, 'a');
    var imgB = Data.productImage(p.id, 'b');
    return (
      '<article class="pcard reveal' + (opts.delay ? ' reveal-delay-' + opts.delay : '') + '">' +
      '  <div class="pcard__media">' +
      '    <span class="pill pcard__badge">' + (p.badge || '') + '</span>' +
      '    <button class="pcard__wish' + (wished ? ' is-active' : '') + '" data-wish="' + p.id + '" aria-label="' + (wished ? 'Remove from' : 'Add to') + ' wishlist" aria-pressed="' + wished + '">' + UI.icon('heart') + '</button>' +
      '    <img class="img-a" src="' + imgA + '" alt="' + p.name + ' — ' + p.colors[0] + '" loading="lazy" decoding="async" width="1000" height="1250">' +
      '    <img class="img-b" src="' + imgB + '" alt="" aria-hidden="true" loading="lazy" decoding="async" width="1000" height="1250">' +
      '    <div class="pcard__actions">' +
      '      <button class="pcard__add" data-add="' + p.id + '">Add to bag</button>' +
      '      <button class="pcard__view" data-quickview="' + p.id + '" aria-label="Quick view ' + p.name + '">' + UI.icon('eye') + '</button>' +
      '    </div>' +
      '  </div>' +
      '  <div class="pcard__info">' +
      '    <span class="pcard__cat">' + p.category + ' · ' + p.collection + '</span>' +
      '    <h3 class="pcard__name"><a href="#collections" data-quickview="' + p.id + '">' + p.name + '</a></h3>' +
      '    <div class="pcard__row">' +
      '      <span class="pcard__price">' + Data.formatPrice(p.price) + '</span>' +
      (off > 0 ? '<span class="pcard__mrp">' + Data.formatPrice(p.mrp) + '</span><span class="pcard__off">' + off + '% off</span>' : '') +
      '    </div>' +
      '    <div class="pcard__colors" aria-label="Available colours">' +
      p.colors.map(function (c, i) { return '<span class="swatch" style="background:' + p.colorValues[i] + '"></span>'; }).join('') +
      '    </div>' +
      (opts.rating ? '<div class="pcard__rating">' + UI.ratingHtml(p) + '</div>' : '') +
      '  </div>' +
      '</article>'
    );
  }

  /* ========================================================================
     HOMEPAGE
     ======================================================================== */
  function renderRail(el, list, opts) {
    el.innerHTML = list.map(function (p, i) { return card(p, { rating: opts && opts.rating, delay: (i % 4) + 1 }); }).join('');
    initRevealIn(el);
  }

  function initRevealIn(el) {
    var els = el.classList.contains('reveal') ? [el] : [];
    UI.$all('.reveal, .reveal--img', el).forEach(function (x) { els.push(x); });
    if (!('IntersectionObserver' in window)) { els.forEach(function (x) { x.classList.add('is-visible'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -4% 0px' });
    els.forEach(function (x) { io.observe(x); });
  }

  function initRailArrows() {
    $all('[data-rail-prev], [data-rail-next]').forEach(function (btn) {
      if (btn.dataset.railBound) return;
      btn.dataset.railBound = '1';
      btn.addEventListener('click', function () {
        var section = btn.closest('.section, section, .rail-wrap') || document;
        var rail = $('.rail', section) || $('[data-rail]');
        if (!rail) return;
        var step = rail.clientWidth * 0.8 * (btn.hasAttribute('data-rail-next') ? 1 : -1);
        rail.scrollBy({ left: step, behavior: 'smooth' });
      });
    });
  }

  function home() {
    var railNew = $('[data-rail="new"]');
    if (railNew) {
      var newIn = Data.getProducts().filter(function (p) { return p.badge === 'New'; });
      if (newIn.length < 4) { newIn = Data.getProducts().slice(0, 8); }
      renderRail(railNew, newIn.slice(0, 8));
    }
    var railBest = $('[data-rail="best"]');
    if (railBest) {
      var best = Data.getProducts().slice().sort(function (a, b) { return b.reviews - a.reviews; }).slice(0, 8);
      renderRail(railBest, best, { rating: true });
    }
    initRailArrows();
    var strip = $('[data-showcase]');
    if (strip) {
      var picks = ['relaxed-linen-shirt', '4-way-stretch-trouser', 'motion-polo', 'quilted-travel-jacket', 'straight-fit-jeans', 'merino-polo'];
      var html = '';
      picks.forEach(function (id) {
        var p = Data.getProductById(id);
        if (!p) return;
        html +=
          '<a class="mtile" href="#collections" data-quickview="' + p.id + '">' +
          '  <img src="' + Data.productImage(p.id, 'b') + '" alt="Model wearing the ' + p.name + '" loading="lazy" decoding="async">' +
          '  <div class="mtile__overlay">' +
          '    <span class="label">' + p.category + '</span>' +
          '    <span class="mtile__name">' + p.name + '</span>' +
          '    <span class="mtile__price">' + Data.formatPrice(p.price) + '</span>' +
          '    <span class="text-link">Shop now ' + UI.icon('arrow') + '</span>' +
          '  </div>' +
          '</a>';
      });
      strip.innerHTML = html;
    }
  }

  /* ========================================================================
     QUICK VIEW
     ======================================================================== */
  var qv = null;

  function ensureQuickView() {
    if (qv) return;
    qv = document.createElement('div');
    qv.className = 'modal';
    qv.setAttribute('role', 'dialog');
    qv.setAttribute('aria-modal', 'true');
    qv.setAttribute('aria-label', 'Quick view');
    qv.innerHTML = '<div class="modal__backdrop" data-qv-close></div><div class="modal__panel"></div>';
    document.body.appendChild(qv);
    qv.addEventListener('click', function (e) {
      if (e.target.closest('[data-qv-close]')) { closeQuickView(); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && qv.classList.contains('is-open')) { closeQuickView(); }
    });
  }

  function openQuickView(id) {
    ensureQuickView();
    var p = Data.getProductById(id);
    if (!p) return;
    var off = Data.discountPercent(p);
    var wished = Wishlist.has(p.id);
    $('.modal__panel', qv).innerHTML =
      '<button class="modal__close" data-qv-close aria-label="Close quick view">' + UI.icon('close') + '</button>' +
      '<div class="modal__media"><img src="' + Data.productImage(p.id, 'a') + '" alt="' + p.name + '"></div>' +
      '<div class="modal__info">' +
      '  <span class="pcard__cat">' + p.category + ' · ' + p.collection + '</span>' +
      '  <h2 class="h-sub" style="margin-top:8px">' + p.name + '</h2>' +
      '  <p class="muted" style="margin-top:8px;font-size:14px;line-height:1.5">' + p.description + '</p>' +
      '  <div class="pdp-pricing" style="margin-top:12px"><span class="pdp-price">' + Data.formatPrice(p.price) + '</span>' +
      (off > 0 ? '<span class="pdp-mrp">' + Data.formatPrice(p.mrp) + '</span><span class="pdp-save">Save ' + Data.formatPrice(p.mrp - p.price) + '</span>' : '') +
      '  </div>' +
      '  <div class="pdp-block"><span class="label">Colour</span><div class="swatch-row">' +
      p.colors.map(function (c, i) { return '<button type="button" class="swatch-btn is-active" style="background:' + p.colorValues[i] + '" aria-label="' + c + '"></button>'; }).join('') +
      '  </div></div>' +
      '  <div class="pdp-block"><span class="label">Size</span><div class="size-row">' +
      p.sizes.map(function (s, i) { return '<button type="button" class="size-btn' + (i === Math.floor(p.sizes.length / 2) ? ' is-active' : '') + '">' + s + '</button>'; }).join('') +
      '  </div></div>' +
      '  <div class="pdp-cta" style="grid-template-columns:1fr;margin-top:18px"><button class="btn btn--solid" data-add="' + p.id + '">Add to bag</button></div>' +
      '</div>';
    qv.classList.add('is-open');
    Nav.lockScroll();
    wireVariantToggles($('.modal__panel', qv), p);
  }

  function closeQuickView() {
    if (!qv) return;
    qv.classList.remove('is-open');
    Nav.unlockScroll();
  }

  function openWishlist() {
    ensureQuickView();
    var ids = Wishlist.count() ? wishlistIds() : [];
    var html;
    if (!ids.length) {
      html =
        '<button class="modal__close" data-qv-close aria-label="Close wishlist">' + UI.icon('close') + '</button>' +
        '<div class="modal__info" style="grid-column:1/-1;text-align:center;padding-block:60px">' +
        '  <h2 class="h-sub">Your wishlist is empty</h2>' +
        '  <p class="muted" style="margin-top:10px">Tap the heart on any piece to save it here.</p>' +
        '  <a class="btn btn--solid" style="margin-top:24px" href="#collections" data-qv-close>Explore collections</a>' +
        '</div>';
    } else {
      html =
        '<button class="modal__close" data-qv-close aria-label="Close wishlist">' + UI.icon('close') + '</button>' +
        '<div class="modal__info" style="grid-column:1/-1">' +
        '  <h2 class="h-sub">Your wishlist</h2>' +
        '  <div style="margin-top:18px">' +
        ids.map(function (p) {
          return '<div class="cart-line" data-wishline="' + p.id + '">' +
            '  <a href="#collections" data-quickview="' + p.id + '"><img src="' + Data.productImage(p.id) + '" alt="' + p.name + '" loading="lazy"></a>' +
            '  <div>' +
            '    <div class="cart-line__name">' + p.name + '</div>' +
            '    <div class="cart-line__meta">' + p.category + '</div>' +
            '    <div class="cart-line__controls">' +
            '      <button class="pcard__add" style="min-height:38px;padding:8px 14px" data-add="' + p.id + '">Add to bag</button>' +
            '      <button class="cart-line__remove" data-wish="' + p.id + '">Remove</button>' +
            '    </div>' +
            '  </div>' +
            '  <span class="cart-line__price">' + Data.formatPrice(p.price) + '</span>' +
            '</div>';
        }).join('') +
        '  </div>' +
        '</div>';
    }
    $('.modal__panel', qv).innerHTML = html;
    qv.classList.add('is-open');
    Nav.lockScroll();
  }

  function wishlistIds() {
    try {
      var raw = localStorage.getItem('plmw-wishlist');
      var ids = raw ? JSON.parse(raw) : [];
      return ids.map(function (id) { return Data.getProductById(id); }).filter(Boolean);
    } catch (e) { return []; }
  }

  function wireVariantToggles(root, p) {
    $all('.size-btn', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        $all('.size-btn', root).forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var addBtn = $('[data-add]', root);
        if (addBtn) { addBtn.setAttribute('data-size', btn.textContent.trim()); }
      });
    });
  }

  /* ========================================================================
     PLP (shop / collection pages)
     ======================================================================== */
  var plpState = { category: [], size: [], color: [], fit: [], fabric: [], collection: [], price: [], availability: [], sort: 'featured', view: 'grid', q: '', preset: null };

  function initPLP() {
    var grid = $('[data-plp-grid]');
    if (!grid) return;

    /* URL-driven state */
    var params = new URLSearchParams(location.search);
    /* collection-page hero image follows the selected collection */
    var collHero = $('[data-coll-hero]');
    if (collHero) {
      var slug = params.get('collection');
      var cfg0 = Data.getConfig();
      var collMatch = (cfg0.collections || []).filter(function (c) { return c.slug === slug; })[0];
      if (collMatch && collMatch.image) {
        collHero.setAttribute('src', Data.base() + collMatch.image);
        collHero.setAttribute('alt', collMatch.name + ' campaign imagery');
      }
    }
    var cat = params.get('category');
    if (cat) {
      if (cat === 'T-Shirts & Polos') {
        plpState.category = ['T-Shirts', 'Polos'];
        setPageTitle('T-Shirts & Polos');
      } else if (cat === 'Jackets & Outerwears') {
        plpState.category = ['Jackets'];
        setPageTitle('Jackets & Outerwears');
      } else if (cat === 'Denim') {
        plpState.category = ['Jeans'];
        setPageTitle('Denim Collection');
      } else if (cat === 'Occassion wear' || cat === 'Occasion wear') {
        plpState.preset = 'occasion:Festive';
        setPageTitle('Occasion Wear');
      } else if (cat === 'Accessories') {
        plpState.category = ['Accessories'];
        setPageTitle('Accessories');
      } else {
        plpState.category = [cat];
        setPageTitle(cat + "'s Edit");
      }
    }
    var coll = params.get('collection');
    if (coll) {
      var cfg = Data.getConfig();
      var match = (cfg.collections || []).filter(function (c) { return c.slug === coll; })[0];
      var occasions = (cfg.occasions || []).filter(function (o) { return o.slug === coll; })[0];
      if (match) {
        plpState.collection = [match.name];
        setPageTitle(match.name);
        var desc = document.querySelector('[data-plp-desc]');
        if (desc) { desc.textContent = match.description; }
      } else if (occasions) {
        plpState.preset = 'occasion:' + occasions.name;
        setPageTitle(occasions.name + ' Edit');
      } else if (coll === 'new-arrivals') {
        plpState.preset = 'new';
        plpState.sort = 'newest';
        setPageTitle('New arrivals');
      } else if (coll === 'best-sellers') {
        plpState.preset = 'best';
        setPageTitle('Best sellers');
      }
    }
    plpState.q = params.get('q') || '';
    var sortParam = params.get('sort');
    if (sortParam) { plpState.sort = sortParam; }

    buildFilters();
    bindToolbar();
    renderPLP();
  }

  function setPageTitle(text) {
    var t = document.querySelector('[data-plp-title]');
    if (t) { t.textContent = text; }
    var bc = document.querySelector('[data-breadcrumb-current]');
    if (bc) { bc.textContent = text; }
    document.title = text + ' | PL Mens Wear';
  }

  function buildFilters() {
    var wrap = $('[data-filters-groups]') || $('[data-filters]');
    if (!wrap) return;
    var products = Data.getProducts();
    var uniq = function (arr) {
      var seen = {}, out = [];
      arr.forEach(function (v) { if (!seen[v]) { seen[v] = 1; out.push(v); } });
      return out;
    };

    function group(key, title, values, renderRow) {
      return '<div class="filters__group">' +
        '<button class="filters__btn" aria-expanded="true" aria-controls="flt-' + key + '">' + title + UI.icon('chevronDown') + '</button>' +
        '<div class="filters__panel" id="flt-' + key + '">' +
        values.map(renderRow).join('') +
        '</div></div>';
    }

    var colors = uniq(products.reduce(function (a, p) { return a.concat(p.colors); }, []));
    var colorVals = {};
    products.forEach(function (p) {
      p.colors.forEach(function (c, i) { if (!colorVals[c]) { colorVals[c] = p.colorValues[i]; } });
    });

    var html = '';
    html += group('category', 'Category', uniq(products.map(function (p) { return p.category; })), function (v) {
      return check('category', v, v);
    });
    html += group('size', 'Size', ['S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', '36', '38'], function (v) {
      return check('size', v, v);
    });
    html += group('color', 'Colour', colors, function (v) {
      return '<label class="swatch-label"><input type="checkbox" data-f="color" value="' + v + '"' + (plpState.color.indexOf(v) !== -1 ? ' checked' : '') + '><span class="swatch" style="background:' + (colorVals[v] || '#ccc') + '"></span>' + v + '</label>';
    });
    html += '<div class="filters__group">' +
      '<button class="filters__btn" aria-expanded="true" aria-controls="flt-price">Price' + UI.icon('chevronDown') + '</button>' +
      '<div class="filters__panel" id="flt-price">' +
      [['lt1500', 'Under ₹1,500'], ['1500-2500', '₹1,500 – ₹2,500'], ['2500-3500', '₹2,500 – ₹3,500'], ['gt3500', 'Above ₹3,500']].map(function (b) {
        return check('price', b[0], b[1]);
      }).join('') + '</div></div>';

    html += group('fit', 'Fit', uniq(products.map(function (p) { return p.fit; })), function (v) { return check('fit', v, v); });
    html += group('fabric', 'Fabric', uniq(products.map(function (p) { return p.fabric; })), function (v) { return check('fabric', v, v); });
    html += group('collection', 'Collection', uniq(products.map(function (p) { return p.collection; })), function (v) {
      return check('collection', v, v);
    });
    html += group('availability', 'Availability', ['In stock'], function () {
      return '<label><input type="checkbox" data-f="availability" value="instock">In stock only</label>';
    });

    wrap.innerHTML = html;

    /* restore URL-driven checks */
    wrap.querySelectorAll('input[data-f]').forEach(function (input) {
      var f = input.getAttribute('data-f'), v = input.value;
      if (plpState[f] && plpState[f].indexOf(v) !== -1) { input.checked = true; }
    });

    wrap.addEventListener('change', function (e) {
      var input = e.target.closest('input[data-f]');
      if (!input) return;
      var f = input.getAttribute('data-f'), v = input.value;
      if (!plpState[f]) { plpState[f] = []; }
      if (input.checked) {
        if (plpState[f].indexOf(v) === -1) { plpState[f].push(v); }
      } else {
        plpState[f] = plpState[f].filter(function (x) { return x !== v; });
      }
      renderPLP();
    });

    var clear = $('[data-filters-clear]');
    if (clear) {
      clear.addEventListener('click', function () {
        Object.keys(plpState).forEach(function (k) { if (Array.isArray(plpState[k])) { plpState[k] = []; } });
        wrap.querySelectorAll('input[data-f]').forEach(function (i) { i.checked = false; });
        renderPLP();
      });
    }
  }

  function check(name, value, label) {
    var on = plpState[name] && plpState[name].indexOf(value) !== -1;
    return '<label><input type="checkbox" data-f="' + name + '" value="' + value + '"' + (on ? ' checked' : '') + '>' + label + '</label>';
  }

  function bindToolbar() {
    var sortSel = $('[data-sort]');
    if (sortSel) {
      sortSel.value = plpState.sort;
      sortSel.addEventListener('change', function () { plpState.sort = sortSel.value; renderPLP(); });
    }
    $all('[data-view]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        plpState.view = btn.getAttribute('data-view');
        $all('[data-view]').forEach(function (b) { b.classList.toggle('is-active', b === btn); });
        renderPLP();
      });
    });
    var ft = $('[data-filter-toggle]');
    if (ft) {
      ft.addEventListener('click', function () {
        var f = $('[data-filters]');
        f.classList.add('is-open');
        Nav.lockScroll();
      });
    }
    var fc = $('[data-filters-close]');
    if (fc) {
      fc.addEventListener('click', function () {
        var f = $('[data-filters]');
        f.classList.remove('is-open');
        Nav.unlockScroll();
      });
    }
  }

  function applyFilters() {
    var s = plpState;
    var list = Data.getProducts().filter(function (p) {
      if (s.q && (p.name + ' ' + p.category + ' ' + p.collection).toLowerCase().indexOf(s.q.toLowerCase()) === -1) return false;
      if (s.category.length && s.category.indexOf(p.category) === -1) return false;
      if (s.collection.length && s.collection.indexOf(p.collection) === -1) return false;
      if (s.fit.length && s.fit.indexOf(p.fit) === -1) return false;
      if (s.fabric.length && s.fabric.indexOf(p.fabric) === -1) return false;
      if (s.size.length && !s.size.some(function (v) { return p.sizes.indexOf(v) !== -1; })) return false;
      if (s.color.length && !s.color.some(function (v) { return p.colors.indexOf(v) !== -1; })) return false;
      if (s.preset === 'new' && p.badge !== 'New') return false;
      if (s.preset && s.preset.indexOf('occasion:') === 0) {
        var occ = s.preset.split(':')[1];
        if (!p.occasion || p.occasion.indexOf(occ) === -1) return false;
      }
      if (s.price && s.price.length) {
        var inBand = s.price.some(function (b) {
          if (b === 'lt1500') return p.price < 1500;
          if (b === '1500-2500') return p.price >= 1500 && p.price <= 2500;
          if (b === '2500-3500') return p.price > 2500 && p.price <= 3500;
          if (b === 'gt3500') return p.price > 3500;
          return false;
        });
        if (!inBand) return false;
      }
      return true;
    });
    switch (s.sort) {
      case 'price-asc': list.sort(function (a, b) { return a.price - b.price; }); break;
      case 'price-desc': list.sort(function (a, b) { return b.price - a.price; }); break;
      case 'rating': list.sort(function (a, b) { return b.rating - a.rating; }); break;
      case 'newest': list.sort(function (a, b) { return (b.badge === 'New') - (a.badge === 'New'); }); break;
      default: list.sort(function (a, b) { return b.reviews - a.reviews; }); break;
    }
    if (s.preset === 'best') { list = list.slice().sort(function (a, b) { return b.reviews - a.reviews; }).slice(0, 8); }
    return list;
  }

  function renderPLP() {
    var grid = $('[data-plp-grid]');
    if (!grid) return;
    var list = applyFilters();
    var countEl = $('[data-plp-count]');
    if (countEl) { countEl.textContent = list.length + ' product' + (list.length === 1 ? '' : 's'); }
    if (!list.length) {
      grid.innerHTML = '<div class="plp-empty"><strong>Nothing matches those filters</strong><p>Try removing a filter or two.</p></div>';
      return;
    }
    grid.innerHTML = list.map(function (p) { return card(p, {}); }).join('');
    grid.classList.toggle('plist', plpState.view === 'list');
    initRevealIn(grid);
  }

  /* ========================================================================
     PDP
     ======================================================================== */
  function initPDP() {
    var root = $('[data-pdp]');
    if (!root) return;
    var params = new URLSearchParams(location.search);
    var id = params.get('id') || 'relaxed-linen-shirt';
    var p = Data.getProductById(id) || Data.getProductById('relaxed-linen-shirt');
    if (!p) return;

    document.title = p.name + ' | PL Mens Wear';
    var crumb = $('[data-pdp-crumb]');
    if (crumb) { crumb.textContent = p.name; }
    var stickyName = $('[data-sticky-name]');
    if (stickyName) { stickyName.textContent = p.name; }
    var off = Data.discountPercent(p);
    var wished = Wishlist.has(p.id);

    var gallery = $('[data-pdp-gallery]');
    var images = [
      { src: Data.productImage(p.id, 'a'), alt: p.name + ' in ' + p.colors[0] },
      { src: Data.productImage(p.id, 'b'), alt: p.name + ' styled on model' },
      { src: Data.base() + 'assets/images/lifestyle/story-side.svg', alt: p.name + ' — fabric detail' },
      { src: Data.base() + 'assets/images/lookbook/look-02.svg', alt: p.name + ' — seasonal look' }
    ];
    gallery.innerHTML =
      '<div class="pdp-main"><img id="pdp-main-img" src="' + images[0].src + '" alt="' + images[0].alt + '" width="1000" height="1250"></div>' +
      '<div class="pdp-thumbs">' +
      images.map(function (im, i) {
        return '<button class="pdp-thumb' + (i === 0 ? ' is-active' : '') + '" data-thumb="' + i + '" aria-label="View image ' + (i + 1) + '"><img src="' + im.src + '" alt=""></button>';
      }).join('') +
      '</div>';

    var info = $('[data-pdp-info]');
    info.innerHTML =
      '<span class="pdp-info__cat">' + p.category + ' · ' + p.collection + '</span>' +
      '<h1>' + p.name + '</h1>' +
      '<div class="rating" style="margin-top:12px">' + UI.stars(p.rating) + '<span class="count">' + p.rating + ' · ' + p.reviews + ' reviews</span></div>' +
      '<div class="pdp-pricing">' +
      '  <span class="pdp-price">' + Data.formatPrice(p.price) + '</span>' +
      (off > 0 ? '<span class="pdp-mrp">MRP ' + Data.formatPrice(p.mrp) + '</span><span class="pdp-save">You save ' + Data.formatPrice(p.mrp - p.price) + '</span>' : '') +
      '</div>' +
      '<p class="pdp-tax">Inclusive of all taxes</p>' +
      '<div class="pdp-block"><span class="label">Colour — <span data-selected-color>' + p.colors[0] + '</span></span>' +
      '  <div class="swatch-row">' +
      p.colors.map(function (c, i) {
        return '<button type="button" class="swatch-btn' + (i === 0 ? ' is-active' : '') + '" style="background:' + p.colorValues[i] + '" data-color-btn="' + c + '" aria-label="Colour ' + c + '"></button>';
      }).join('') +
      '  </div></div>' +
      '<div class="pdp-block"><span class="label">Size</span>' +
      '  <div style="display:flex;align-items:center"><div class="size-row" style="flex:1">' +
      p.sizes.map(function (s, i) {
        return '<button type="button" class="size-btn' + (i === Math.floor(p.sizes.length / 2) ? ' is-active' : '') + '" data-size-btn>' + s + '</button>';
      }).join('') +
      '  </div><button type="button" class="size-guide-link" data-sizeguide>Size guide</button></div>' +
      '</div>' +
      '<div class="pdp-qty-row">' +
      '  <span class="qty"><button data-qty-pdp="-1" aria-label="Decrease quantity">−</button><span class="qty-value" data-qty-value>1</span><button data-qty-pdp="1" aria-label="Increase quantity">+</button></span>' +
      '  <span class="small muted" data-qty-hint>Quantity</span>' +
      '</div>' +
      '<div class="pdp-cta">' +
      '  <button class="btn btn--solid" data-pdp-add>Add to bag</button>' +
      '  <button class="btn" data-pdp-buy>Buy now</button>' +
      '</div>' +
      '<div class="pdp-wish-row"><button class="pdp-wish' + (wished ? ' is-active' : '') + '" data-pdp-wish="' + p.id + '">' + UI.icon('heart') + '<span>' + (wished ? 'In your wishlist' : 'Add to wishlist') + '</span></button></div>' +
      '<div class="accordions">' +
      acc('Description', '<p>' + p.description + '</p><p style="margin-top:10px">Part of the ' + p.collection + ', cut for ' + p.fit.toLowerCase() + ' comfort and finished to move between occasions without effort.</p>', true) +
      acc('Fabric &amp; care', '<ul><li>Fabric: ' + p.fabric + '</li><li>Machine wash cold with like colours</li><li>Do not bleach · Warm iron if needed</li><li>Dry flat or line dry in shade</li></ul>') +
      acc('Fit &amp; sizing', '<p>' + p.fit + ' fit. The model is 6\\u20192" / 188 cm and wears size M.</p><p style="margin-top:8px">Between sizes? We recommend sizing up for a relaxed drape.</p>') +
      acc('Delivery &amp; returns', '<ul><li>Free shipping on orders above ₹1,999</li><li>Dispatched in 1–2 working days from Mumbai</li><li>7-day easy returns, no questions asked</li></ul>') +
      acc('Product details', '<ul><li>Style code: PL-' + p.id.toUpperCase().replace(/-/g, '') + '</li><li>Country of origin: India</li><li>Manufactured with responsibly sourced yarns</li></ul>') +
      '</div>';

    /* gallery behaviour */
    var mainImg = $('#pdp-main-img', root);
    $all('.pdp-thumb', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var i = parseInt(btn.getAttribute('data-thumb'), 10);
        $all('.pdp-thumb', root).forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        mainImg.classList.add('is-switching');
        setTimeout(function () {
          mainImg.src = images[i].src;
          mainImg.alt = images[i].alt;
          mainImg.classList.remove('is-switching');
        }, 180);
      });
    });

    /* variants */
    var state = { size: p.sizes[Math.floor(p.sizes.length / 2)], color: p.colors[0], qty: 1 };
    $all('[data-color-btn]', info).forEach(function (btn) {
      btn.addEventListener('click', function () {
        $all('[data-color-btn]', info).forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        state.color = btn.getAttribute('data-color-btn');
        $('[data-selected-color]', info).textContent = state.color;
      });
    });
    $all('[data-size-btn]', info).forEach(function (btn) {
      btn.addEventListener('click', function () {
        $all('[data-size-btn]', info).forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        state.size = btn.textContent.trim();
      });
    });
    $all('[data-qty-pdp]', info).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var d = parseInt(btn.getAttribute('data-qty-pdp'), 10);
        state.qty = Math.max(1, Math.min(9, state.qty + d));
        $('[data-qty-value]', info).textContent = String(state.qty);
      });
    });

    /* size guide modal (reuses quick-view modal shell) */
    var sg = $('[data-sizeguide]', info);
    if (sg) {
      sg.addEventListener('click', function () {
        ensureQuickView();
        $('.modal__panel', qv).innerHTML =
          '<button class="modal__close" data-qv-close aria-label="Close size guide">' + UI.icon('close') + '</button>' +
          '<div class="modal__info" style="grid-column:1/-1">' +
          '  <h2 class="h-sub">Size guide</h2>' +
          '  <table class="size-table" style="margin-top:20px">' +
          '    <tr><th>Size</th><th>Chest (in)</th><th>Waist (in)</th><th>Length (in)</th></tr>' +
          '    <tr><td>S</td><td>38</td><td>32</td><td>27</td></tr>' +
          '    <tr><td>M</td><td>40</td><td>34</td><td>28</td></tr>' +
          '    <tr><td>L</td><td>42</td><td>36</td><td>29</td></tr>' +
          '    <tr><td>XL</td><td>44</td><td>38</td><td>30</td></tr>' +
          '    <tr><td>XXL</td><td>46</td><td>40</td><td>31</td></tr>' +
          '  </table>' +
          '</div>';
        qv.classList.add('is-open');
        Nav.lockScroll();
      });
    }

    /* add / buy / wish */
    $('[data-pdp-add]', info).addEventListener('click', function () {
      Cart.add(p.id, state.size, state.qty);
    });
    $('[data-pdp-buy]', info).addEventListener('click', function () {
      Cart.add(p.id, state.size, state.qty);
      UI.toast('Checkout is a demo — connect your payment provider here');
    });
    var wishBtn = $('[data-pdp-wish]', info);
    wishBtn.addEventListener('click', function () {
      var added = Wishlist.toggle(p.id);
      wishBtn.classList.toggle('is-active', added);
      $('span', wishBtn).textContent = added ? 'In your wishlist' : 'Add to wishlist';
      UI.toast(added ? 'Saved to wishlist' : 'Removed from wishlist');
    });

    /* You may also like */
    var related = $('[data-rail="related"]');
    if (related) {
      var rel = Data.getProducts().filter(function (x) { return x.category === p.category && x.id !== p.id; });
      if (rel.length < 4) {
        Data.getProducts().forEach(function (x) {
          if (x.id !== p.id && rel.indexOf(x) === -1 && rel.length < 8) { rel.push(x); }
        });
      }
      renderRail(related, rel.slice(0, 8));
      initRailArrows();
    }

    /* sticky ATC sync */
    var sticky = $('.pdp-sticky-atc');
    if (sticky) {
      var sp = $('[data-sticky-price]', sticky);
      if (sp) { sp.textContent = Data.formatPrice(p.price); }
      var sa = $('[data-sticky-add]', sticky);
      if (sa) {
        sa.setAttribute('data-add', p.id);
        sa.setAttribute('data-size', state.size);
        $all('[data-size-btn]', info).forEach(function (btn) {
          if (btn.classList.contains('is-active')) { sa.setAttribute('data-size', btn.textContent.trim()); }
        });
      }
      var mq = window.matchMedia('(max-width: 760px)');
      var onScroll = function () {
        var infoBottom = info.getBoundingClientRect().top < 0;
        sticky.classList.toggle('is-visible', mq.matches && infoBottom);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    /* structured data */
    try {
      var ld = document.createElement('script');
      ld.type = 'application/ld+json';
      ld.textContent = JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Product',
        name: p.name, description: p.description,
        image: location.origin + '/' + Data.productImage(p.id, 'a'),
        brand: { '@type': 'Brand', name: 'PL Mens Wear' },
        aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.reviews },
        offers: { '@type': 'Offer', priceCurrency: 'INR', price: p.price, availability: 'https://schema.org/InStock' }
      });
      document.head.appendChild(ld);
    } catch (e) { /* no-op */ }
  }

  function acc(title, body, open) {
    return '<div class="acc">' +
      '<button class="acc__btn" aria-expanded="' + (open ? 'true' : 'false') + '">' + title + UI.icon('chevronDown') + '</button>' +
      '<div class="acc__panel">' + body + '</div>' +
      '</div>';
  }

  /* ========================================================================
     LOOKBOOK LIGHTBOX
     ======================================================================== */
  function initLookbook() {
    var grid = $('[data-lookbook]');
    if (!grid) return;
    var items = $all('.masonry__item', grid);
    var srcs = items.map(function (it) { return $('img', it).getAttribute('src'); });
    var caps = items.map(function (it) {
      var l = $('.masonry__cap .label', it);
      return l ? l.textContent : '';
    });

    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', 'Lookbook image');
    box.innerHTML =
      '<button class="lightbox__close icon-btn" data-lb-close aria-label="Close">' + UI.icon('close') + '</button>' +
      '<button class="lightbox__nav lightbox__nav--prev" data-lb-prev aria-label="Previous image">' + UI.icon('chevronLeft') + '</button>' +
      '<img src="" alt="">' +
      '<button class="lightbox__nav lightbox__nav--next" data-lb-next aria-label="Next image">' + UI.icon('chevronRight') + '</button>' +
      '<p class="lightbox__caption"></p>';
    document.body.appendChild(box);

    var idx = 0;
    function show(i) {
      idx = (i + items.length) % items.length;
      $('img', box).src = srcs[idx];
      $('.lightbox__caption', box).textContent = caps[idx];
    }
    function openBox(i) { show(i); box.classList.add('is-open'); Nav.lockScroll(); document.addEventListener('keydown', keys); }
    function closeBox() { box.classList.remove('is-open'); Nav.unlockScroll(); document.removeEventListener('keydown', keys); }
    function keys(e) {
      if (e.key === 'Escape') closeBox();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    }
    items.forEach(function (it, i) {
      it.addEventListener('click', function () { openBox(i); });
      it.setAttribute('tabindex', '0');
      it.setAttribute('role', 'button');
      it.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openBox(i); }
      });
    });
    box.addEventListener('click', function (e) {
      if (e.target.closest('[data-lb-close]')) closeBox();
      if (e.target.closest('[data-lb-prev]')) show(idx - 1);
      if (e.target.closest('[data-lb-next]')) show(idx + 1);
    });
  }

  /* ========================================================================
     GLOBAL EVENTS + BOOT
     ======================================================================== */
  function boot() {
    Data.ready(function () {
      home();
      initPLP();
      initPDP();
      initLookbook();
    });
    document.addEventListener('click', function (e) {
      var w = e.target.closest('[data-wish]');
      if (w) {
        e.preventDefault();
        var id = w.getAttribute('data-wish');
        var added = Wishlist.toggle(id);
        $all('[data-wish="' + id + '"]').forEach(function (btn) {
          btn.classList.toggle('is-active', added);
          btn.setAttribute('aria-pressed', String(added));
        });
        UI.toast(added ? 'Saved to wishlist' : 'Removed from wishlist');
        return;
      }
      var q = e.target.closest('[data-quickview]');
      if (q) { e.preventDefault(); openQuickView(q.getAttribute('data-quickview')); return; }
      var wopen = e.target.closest('[data-wishlist-open]');
      if (wopen) { e.preventDefault(); openWishlist(); }
    });
  }

  window.PLMWProducts = {
    card: card,
    renderRail: renderRail,
    openQuickView: openQuickView,
    closeQuickView: closeQuickView
  };

  boot();
})(window, document);
