/* ==========================================================================
   PL MENS WEAR — WISHLIST
   localStorage-backed wishlist with header count + toast feedback
   Exposes window.PLMWWishlist
   ========================================================================== */

(function (window) {
  'use strict';

  var KEY = 'plmw-wishlist';
  var listeners = [];

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; }
    catch (e) { return []; }
  }
  function write(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* private mode */ }
    listeners.forEach(function (fn) { fn(list); });
  }

  function has(id) { return read().indexOf(id) !== -1; }
  function count() { return read().length; }

  function toggle(id) {
    var list = read();
    var i = list.indexOf(id);
    if (i === -1) { list.push(id); write(list); return true; }
    list.splice(i, 1); write(list); return false;
  }
  function add(id) {
    if (has(id)) return false;
    var list = read(); list.push(id); write(list); return true;
  }
  function remove(id) {
    var list = read();
    var i = list.indexOf(id);
    if (i !== -1) { list.splice(i, 1); write(list); return true; }
    return false;
  }

  function updateBadges() {
    document.querySelectorAll('[data-wishlist-count]').forEach(function (el) {
      var n = count();
      el.textContent = String(n);
      el.style.display = n > 0 ? '' : 'none';
    });
  }

  document.addEventListener('DOMContentLoaded', updateBadges);

  window.PLMWWishlist = {
    has: has, count: count, toggle: toggle, add: add, remove: remove,
    updateBadges: updateBadges,
    onChange: function (fn) { listeners.push(fn); }
  };
})(window);
