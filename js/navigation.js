/* ==========================================================================
   PL MENS WEAR — NAVIGATION
   Mega menu, mobile nav, drawer/overlay open-close plumbing
   Exposes window.PLMWNav
   ========================================================================== */

(function (window, document) {
  'use strict';

  var $ = window.PLMWUI.$, $all = window.PLMWUI.$all;
  var openCount = 0;

  /* ---------- Overlay plumbing ---------- */
  function lockScroll() {
    openCount += 1;
    document.body.classList.add('nav-locked');
  }
  function unlockScroll() {
    openCount = Math.max(0, openCount - 1);
    if (openCount === 0) { document.body.classList.remove('nav-locked'); }
  }

  /* ---------- Mega menu (hover on desktop, click toggle too) ---------- */
  function megaMenu() {
    $all('.has-mega').forEach(function (item) {
      var link = $('.nav-link', item);
      if (!link) return;
      item.addEventListener('mouseenter', function () { item.classList.add('is-open'); link.setAttribute('aria-expanded', 'true'); });
      item.addEventListener('mouseleave', function () { item.classList.remove('is-open'); link.setAttribute('aria-expanded', 'false'); });
      link.addEventListener('click', function (e) {
        // Let the link navigate; hovering handles the menu on desktop.
        if (window.matchMedia('(min-width: 1081px)').matches) {
          e.preventDefault();
          var open = item.classList.toggle('is-open');
          link.setAttribute('aria-expanded', String(open));
        }
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && item.classList.contains('is-open')) {
          item.classList.remove('is-open');
          link.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }

  /* ---------- Mobile navigation ---------- */
  function mobileNav() {
    var nav = $('.mobile-nav');
    var scrim = $('.scrim');
    var openBtn = $('.hamburger');
    if (!nav || !openBtn) return;

    function close() {
      nav.classList.remove('is-open');
      nav.setAttribute('aria-hidden', 'true');
      openBtn.setAttribute('aria-expanded', 'false');
      scrim.classList.remove('is-visible');
      unlockScroll();
    }
    function open() {
      nav.classList.add('is-open');
      nav.setAttribute('aria-hidden', 'false');
      openBtn.setAttribute('aria-expanded', 'true');
      scrim.classList.add('is-visible');
      lockScroll();
      var first = $('.mobile-nav__close', nav) || nav;
      if (first && first.focus) { first.focus(); }
    }

    openBtn.addEventListener('click', open);
    $('.mobile-nav__close', nav).addEventListener('click', close);
    scrim.addEventListener('click', close);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) { close(); }
    });

    $all('.mobile-nav__accordion', nav).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
      });
    });

    return { close: close };
  }

  window.PLMWNav = {
    lockScroll: lockScroll,
    unlockScroll: unlockScroll,
    megaMenu: megaMenu,
    mobileNav: mobileNav
  };
})(window, document);
