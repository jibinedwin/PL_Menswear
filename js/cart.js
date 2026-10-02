/* ==========================================================================
   PL MENS WEAR — CART
   localStorage-backed cart, slide-out drawer, quantity controls,
   free-shipping progress, add-to-bag wiring, checkout stub.
   Exposes window.PLMWCart
   ========================================================================== */

(function (window, document) {
  'use strict';

  var UI = window.PLMWUI, Data = window.PLMW, Nav = window.PLMWNav, Wishlist = window.PLMWWishlist;
  var $ = UI.$;
  var KEY = 'plmw-cart';
  var FREE_SHIP = 1999;
  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }
  function write(items) {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) { /* ignore */ }
    renderBadge(); renderDrawer(); renderSticky();
  }

  function items() { return read(); }
  function count() { return read().reduce(function (n, li) { return n + li.qty; }, 0); }
  function subtotal() { return read().reduce(function (n, li) { return n + li.qty * li.price; }, 0); }

  function add(productId, size, qty) {
    var p = Data.getProductById(productId);
    if (!p) return;
    qty = qty || 1;
    var chosenSize = size || (p.sizes && p.sizes.length ? p.sizes[Math.floor(p.sizes.length / 2)] : 'M');
    var color = p.colors && p.colors[0] ? p.colors[0] : '';
    var list = read();
    var key = productId + '|' + chosenSize + '|' + color;
    var existing = null;
    for (var i = 0; i < list.length; i++) { if (list[i].key === key) { existing = list[i]; break; } }
    if (existing) { existing.qty += qty; }
    else {
      list.push({
        key: key, id: productId, name: p.name, size: chosenSize, color: color,
        price: p.price, qty: qty,
        image: 'assets/images/products/' + productId + '-a.svg'
      });
    }
    write(list);
    UI.toast(p.name + ' added to bag');
    openDrawer();
  }

  function updateQty(key, qty) {
    var list = read();
    for (var i = 0; i < list.length; i++) {
      if (list[i].key === key) {
        list[i].qty = qty;
        if (list[i].qty <= 0) { list.splice(i, 1); }
        break;
      }
    }
    write(list);
  }
  function remove(key) {
    write(read().filter(function (li) { return li.key !== key; }));
  }

  /* ---------- Badge ---------- */
  function renderBadge() {
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      var n = count();
      el.textContent = String(n);
      el.style.display = n > 0 ? '' : 'none';
    });
  }

  /* ---------- Drawer ---------- */
  var els = {};

  function ensureDrawer() {
    if (els.drawer) return;
    els.drawer = document.querySelector('.drawer');
    if (!els.drawer) { buildDrawer(); els.drawer = document.querySelector('.drawer'); }
    els.body = $('.drawer__body', els.drawer);
    els.foot = $('.drawer__foot', els.drawer);
    els.drawer.addEventListener('click', function (e) {
      var t = e.target;
      if (t.closest('[data-cart-close]')) { closeDrawer(); }
      if (t.closest('[data-cart-checkout]')) {
        e.preventDefault();
        UI.toast('Checkout is a demo — connect your payment provider here');
      }
      var qbtn = t.closest('[data-qty]');
      if (qbtn) {
        var key = qbtn.getAttribute('data-key');
        var delta = parseInt(qbtn.getAttribute('data-qty'), 10);
        var li = read().filter(function (x) { return x.key === key; })[0];
        if (li) { updateQty(key, li.qty + delta); }
      }
      var rbtn = t.closest('[data-remove]');
      if (rbtn) { remove(rbtn.getAttribute('data-remove')); }
    });
  }

  function buildDrawer() {
    var d = document.createElement('aside');
    d.className = 'drawer';
    d.setAttribute('role', 'dialog');
    d.setAttribute('aria-modal', 'true');
    d.setAttribute('aria-label', 'Shopping bag');
    d.innerHTML =
      '<div class="drawer__head">' +
      '  <span class="drawer__title">Your Bag <span data-cart-count-inline></span></span>' +
      '  <button class="drawer__close" data-cart-close aria-label="Close bag">' + UI.icon('close') + '</button>' +
      '</div>' +
      '<div class="drawer__body"></div>' +
      '<div class="drawer__foot"></div>';
    document.body.appendChild(d);
  }

  function renderDrawer() {
    ensureDrawer();
    if (!els.drawer) return;
    var list = read();
    var inline = document.querySelector('[data-cart-count-inline]');
    if (inline) { inline.textContent = list.length ? '(' + count() + ')' : ''; }

    if (!list.length) {
      els.body.innerHTML =
        '<div class="cart-empty">' +
        '  <strong>Your bag is empty</strong>' +
        '  <p>Pieces you add will appear here.</p>' +
        '</div>';
      els.foot.innerHTML = '<a class="btn btn--solid btn--block" href="' + Data.base() + 'pages/shop.html" data-cart-close-link>Continue shopping</a>';
      var cl = $('[data-cart-close-link]', els.foot);
      if (cl) { cl.addEventListener('click', function () { closeDrawer(); }); }
      return;
    }

    var html = '';
    list.forEach(function (li) {
      html +=
        '<div class="cart-line">' +
        '  <a href="' + Data.base() + 'pages/product.html?id=' + li.id + '"><img src="' + Data.base() + li.image + '" alt="' + li.name + '" loading="lazy"></a>' +
        '  <div>' +
        '    <div class="cart-line__name">' + li.name + '</div>' +
        '    <div class="cart-line__meta">Size ' + li.size + (li.color ? ' · ' + li.color : '') + '</div>' +
        '    <div class="cart-line__controls">' +
        '      <span class="qty">' +
        '        <button data-qty="-1" data-key="' + li.key + '" aria-label="Decrease quantity">−</button>' +
        '        <span class="qty-value">' + li.qty + '</span>' +
        '        <button data-qty="1" data-key="' + li.key + '" aria-label="Increase quantity">+</button>' +
        '      </span>' +
        '      <button class="cart-line__remove" data-remove="' + li.key + '">Remove</button>' +
        '    </div>' +
        '  </div>' +
        '  <span class="cart-line__price">' + Data.formatPrice(li.price * li.qty) + '</span>' +
        '</div>';
    });
    els.body.innerHTML = html;

    var sub = subtotal();
    var remaining = FREE_SHIP - sub;
    var pct = Math.min(100, Math.round((sub / FREE_SHIP) * 100));
    var shipMsg = remaining > 0
      ? 'Add ' + Data.formatPrice(remaining) + ' more to unlock free shipping.'
      : 'Your order ships free.';
    els.foot.innerHTML =
      '<div class="shipping-bar">' +
      '  <p class="shipping-bar__msg">' + shipMsg + '</p>' +
      '  <div class="shipping-bar__track"><span class="shipping-bar__fill" style="width:' + pct + '%"></span></div>' +
      '</div>' +
      '<div class="cart-subtotal"><span class="label">Subtotal</span><strong>' + Data.formatPrice(sub) + '</strong></div>' +
      '<p class="cart-note">Shipping &amp; taxes calculated at checkout. Free shipping above ' + Data.formatPrice(FREE_SHIP) + '.</p>' +
      '<button class="btn btn--solid btn--block" data-cart-checkout>Checkout</button>' +
      '<a class="btn btn--block" href="' + Data.base() + 'pages/shop.html" data-cart-close-link>View cart</a>';
    var cl2 = $('[data-cart-close-link]', els.foot);
    if (cl2) { cl2.addEventListener('click', function () { closeDrawer(); }); }
  }

  /* ---------- Open / close ---------- */
  var closeHandler = null;
  function openDrawer() {
    ensureDrawer();
    renderDrawer();
    els.drawer.classList.add('is-open');
    Nav.lockScroll();
    document.addEventListener('keydown', escClose);
    closeHandler = escClose;
  }
  function closeDrawer() {
    if (!els.drawer) return;
    els.drawer.classList.remove('is-open');
    Nav.unlockScroll();
    document.removeEventListener('keydown', escClose);
  }
  function escClose(e) { if (e.key === 'Escape') { closeDrawer(); } }

  /* ---------- Sticky ATC bar (PDP, mobile) ---------- */
  function renderSticky() {
    var bar = document.querySelector('.pdp-sticky-atc');
    if (!bar) return;
    var priceEl = $('[data-sticky-price]', bar);
    var main = $('.pdp-info');
    if (!main) return;
    if (priceEl && main) {
      /* price is re-rendered by products.js PDP logic; just keep in sync via data attribute */
    }
  }

  /* ---------- Wiring ---------- */
  function init() {
    document.addEventListener('click', function (e) {
      var opener = e.target.closest('[data-cart-open]');
      if (opener) { e.preventDefault(); openDrawer(); return; }
      var addBtn = e.target.closest('[data-add]');
      if (addBtn) {
        e.preventDefault();
        add(addBtn.getAttribute('data-add'), addBtn.getAttribute('data-size') || null,
          parseInt(addBtn.getAttribute('data-qty') || '1', 10));
      }
    });
    document.addEventListener('DOMContentLoaded', function () {
      renderBadge(); renderDrawer();
    });
  }

  window.PLMWCart = {
    add: add, remove: remove, updateQty: updateQty,
    items: items, count: count, subtotal: subtotal,
    openDrawer: openDrawer, closeDrawer: closeDrawer,
    renderBadge: renderBadge
  };

  init();
})(window, document);
