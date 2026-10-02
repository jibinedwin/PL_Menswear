/* ==========================================================================
   PL MENS WEAR — MAIN
   Shared chrome bootstrap: promo bar, header, nav, reveal, toasts, footer.
   Exposes window.PLMWMain
   ========================================================================== */

(function (window, document) {
  'use strict';

  var UI = window.PLMWUI, Data = window.PLMW, Nav = window.PLMWNav,
      Wishlist = window.PLMWWishlist, Cart = window.PLMWCart;

  /* ---------- Chrome (mega menu) ---------- */
  function initChrome() {
    Nav.megaMenu();
  }

  /* ---------- Renders config-driven bits of chrome ---------- */
  function renderDynamicChrome() {
    Data.ready(function () {
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
