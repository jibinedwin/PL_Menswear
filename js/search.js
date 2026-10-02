/* ==========================================================================
   PL MENS WEAR — SEARCH
   Full-screen search overlay with trending chips + live results
   Exposes window.PLMWSearch
   ========================================================================== */

(function (window, document) {
  'use strict';

  var UI = window.PLMWUI, Data = window.PLMW, Nav = window.PLMWNav;
  var $ = UI.$;

  var els = {};

  function ensureOverlay() {
    if (els.overlay) return;
    els.overlay = document.querySelector('.search-overlay');
    if (!els.overlay) {
      var d = document.createElement('div');
      d.className = 'search-overlay';
      d.setAttribute('role', 'dialog');
      d.setAttribute('aria-modal', 'true');
      d.setAttribute('aria-label', 'Search');
      d.innerHTML =
        '<div class="search-overlay__inner">' +
        '  <button class="search-overlay__close icon-btn" data-search-close aria-label="Close search">' + UI.icon('close') + '</button>' +
        '  <form class="search-form" role="search">' +
        '    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>' +
        '    <input id="plmw-search-input" type="search" placeholder="Search for shirts, trousers, polos..." autocomplete="off" aria-label="Search products">' +
        '  </form>' +
        '  <p class="search-hint">Press Esc to close</p>' +
        '  <div class="search-trending">' +
        '    <h3>Trending searches</h3>' +
        '    <ul data-trending></ul>' +
        '  </div>' +
        '  <div class="search-results" data-results aria-live="polite"></div>' +
        '</div>';
      document.body.appendChild(d);
      els.overlay = d;
    }
    els.input = $('.search-form input', els.overlay);
    els.trending = $('[data-trending]', els.overlay);
    els.results = $('[data-results]', els.overlay);

    els.overlay.addEventListener('click', function (e) {
      if (e.target.closest('[data-search-close]')) { close(); }
    });
    els.input.addEventListener('input', run);
    els.overlay.addEventListener('click', function (e) {
      var chip = e.target.closest('[data-term]');
      if (chip) { els.input.value = chip.getAttribute('data-term'); run(); els.input.focus(); }
    });
  }

  function fillTrending() {
    var terms = Data.getConfig().trendingSearches || [];
    els.trending.innerHTML = terms.map(function (t) {
      return '<li><button type="button" data-term="' + t + '">' + t + '</button></li>';
    }).join('');
  }

  function run() {
    var q = els.input.value.trim().toLowerCase();
    if (q.length < 2) {
      els.results.classList.remove('is-active');
      els.results.innerHTML = '';
      return;
    }
    var list = Data.getProducts().filter(function (p) {
      var hay = (p.name + ' ' + p.category + ' ' + p.collection + ' ' + (p.colors || []).join(' ') + ' ' + (p.fabric || '')).toLowerCase();
      return q.split(/\s+/).every(function (word) { return hay.indexOf(word) !== -1; });
    });
    var html = '<p class="search-results__head">' + list.length + ' result' + (list.length === 1 ? '' : 's') + ' for “' + escapeHtml(q) + '”</p>';
    if (!list.length) {
      html += '<p class="search-empty is-active">No pieces match that search — try “linen”, “polo” or “jeans”.</p>';
    } else {
      html += list.slice(0, 8).map(function (p) {
        return '<a class="search-hit" href="' + Data.base() + 'pages/product.html?id=' + p.id + '">' +
          '<img src="' + Data.productImage(p.id, 'a') + '" alt="' + p.name + '" loading="lazy">' +
          '<span><span class="search-hit__name">' + p.name + '</span><br>' +
          '<span class="search-hit__meta">' + p.category + ' · ' + p.collection + '</span></span>' +
          '<span class="search-hit__price">' + Data.formatPrice(p.price) + '</span>' +
          '</a>';
      }).join('');
      if (list.length > 8) {
        html += '<a class="btn btn--block" style="margin-top:18px" href="' + Data.base() + 'pages/shop.html?q=' + encodeURIComponent(q) + '">View all results</a>';
      }
    }
    els.results.innerHTML = html;
    els.results.classList.add('is-active');
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function open() {
    ensureOverlay();
    fillTrending();
    els.overlay.classList.add('is-open');
    Nav.lockScroll();
    document.addEventListener('keydown', esc);
    setTimeout(function () { els.input.focus(); }, 60);
  }
  function close() {
    if (!els.overlay) return;
    els.overlay.classList.remove('is-open');
    Nav.unlockScroll();
    document.removeEventListener('keydown', esc);
  }
  function esc(e) { if (e.key === 'Escape') { close(); } }

  function init() {
    document.addEventListener('click', function (e) {
      if (e.target.closest('[data-search-open]')) { e.preventDefault(); open(); }
    });
  }

  window.PLMWSearch = { open: open, close: close };
  init();
})(window, document);
