/* ==========================================================================
   PL MENS WEAR — MAIN
   Shared chrome bootstrap: promo bar, header, nav, reveal, toasts, footer.
   Exposes window.PLMWMain
   ========================================================================== */

(function (window, document) {
  'use strict';

  var UI = window.PLMWUI, Data = window.PLMW, Nav = window.PLMWNav,
      Wishlist = window.PLMWWishlist, Cart = window.PLMWCart;

  /* ---------- Chrome (promo bar, mega menu, footer year) ---------- */
  function initChrome() {
    UI.promoBar();
    Nav.megaMenu();
    var year = $('[data-year]');
    if (year) { year.textContent = String(new Date().getFullYear()); }
  }

  /* ---------- Renders config-driven bits of chrome ---------- */
  function renderDynamicChrome() {
    Data.ready(function () {
      /* promo bar messages come from site-config.json when available */
      var bar = $('.promo-bar__track');
      if (bar && !bar.hasAttribute('data-rendered')) {
        var msgs = Data.getConfig().promoBar.messages;
        bar.setAttribute('data-rendered', '1');
        bar.innerHTML = msgs.map(function (m, i) {
          return '<p class="promo-bar__msg' + (i === 0 ? ' is-active' : '') + '">' + m + '</p>';
        }).join('') +
        '<div class="promo-bar__nav">' +
        '  <button data-promo-prev aria-label="Previous message">' + UI.icon('chevronLeft') + '</button>' +
        '  <button data-promo-next aria-label="Next message">' + UI.icon('chevronRight') + '</button>' +
        '</div>';
        /* re-run rotation after re-render */
        UI.promoBar();
        var idx = 0;
        var msgs2 = UI.$all('.promo-bar__msg', bar);
        function show(n) {
          idx = (n + msgs2.length) % msgs2.length;
          msgs2.forEach(function (m, i) { m.classList.toggle('is-active', i === idx); });
        }
        var prev = $('[data-promo-prev]', bar), next = $('[data-promo-next]', bar);
        if (prev) { prev.addEventListener('click', function () { show(idx - 1); }); }
        if (next) { next.addEventListener('click', function () { show(idx + 1); }); }
      }

      /* mega-menu promo tile image from config (first collection) */
      var promoImg = $('[data-mega-promo-img]');
      if (promoImg) {
        var colls = Data.getConfig().collections || [];
        if (colls.length) {
          promoImg.setAttribute('src', Data.base() + colls[0].image);
          promoImg.setAttribute('alt', colls[0].name);
        }
      }
    });
  }

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }

  function init() {
    UI.onScrollHeader();
    UI.backToTop();
    UI.revealInit();
    UI.accordions();
    UI.newsletterForms();
    UI.contactForm();
    initChrome();
    renderDynamicChrome();
    var mnav = Nav.mobileNav();
    if (mnav) {
      /* close mobile nav when a link inside is clicked */
      UI.$all('.mobile-nav a[href]').forEach(function (a) {
        a.addEventListener('click', function () { mnav.close(); });
      });
    }
    Wishlist.onChange(function () { Wishlist.updateBadges(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.PLMWMain = { init: init };
})(window, document);
