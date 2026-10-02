/* ==========================================================================
   PL MENS WEAR — UTILITIES
   Icons, shared helpers, reveal-on-scroll, toast, back-to-top, sticky header,
   promo bar rotation, accordions, newsletter validation.
   Exposes window.PLMWUI
   ========================================================================== */

(function (window, document) {
  'use strict';

  /* ---------- Inline SVG icon set ---------- */
  var ICONS = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c1.8-3.4 4.6-5 8-5s6.2 1.6 8 5"/></svg>',
    heart: '<svg class="heart-line" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 20.5C7 16.5 3.5 13.3 3.5 9.6 3.5 7 5.5 5 8 5c1.6 0 3.1.8 4 2.1C12.9 5.8 14.4 5 16 5c2.5 0 4.5 2 4.5 4.6 0 3.7-3.5 6.9-8.5 10.9Z"/></svg><svg class="heart-fill" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20.5C7 16.5 3.5 13.3 3.5 9.6 3.5 7 5.5 5 8 5c1.6 0 3.1.8 4 2.1C12.9 5.8 14.4 5 16 5c2.5 0 4.5 2 4.5 4.6 0 3.7-3.5 6.9-8.5 10.9Z"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 8h14l-1 13H6L5 8Z"/><path d="M8.5 8V6.5a3.5 3.5 0 0 1 7 0V8"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 6.5h18M3 12h18M3 17.5h18"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg>',
    caret: '<svg class="caret" width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M1 1l4 4 4-4"/></svg>',
    arrow: '<span class="arrow" aria-hidden="true">&rarr;</span>',
    chevronLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
    chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
    chevronDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 9l7 7 7-7"/></svg>',
    arrowUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
    fabric: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M4 4v16M8 4v16M12 4v16M16 4v16M20 4v16M4 4c2.5 2 5.5 2 8 0M4 20c2.5-2 5.5-2 8 0M12 4c2.5 2 5.5 2 8 0M12 20c2.5-2 5.5-2 8 0"/></svg>',
    fit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M9 3h6v4l2 2v12H7V9l2-2V3Z"/><path d="M12 3v6"/></svg>',
    stitch: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M3 12h3M9 12h3M15 12h3M21 12h0"/><circle cx="12" cy="12" r="9" stroke-dasharray="3 2.5"/></svg>',
    comfort: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M12 3c3 3.5 6 6.2 6 10a6 6 0 1 1-12 0c0-3.8 3-6.5 6-10Z"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 12.5l5 5L20 6.5"/></svg>'
  };

  function icon(name) { return ICONS[name] || ''; }

  function stars(rating) {
    var full = Math.round(rating);
    var out = '';
    for (var i = 1; i <= 5; i++) { out += i <= full ? '★' : '☆'; }
    return '<span class="stars" aria-hidden="true">' + out + '</span>' +
      '<span class="visually-hidden">' + rating + ' out of 5 stars</span>';
  }

  function ratingHtml(p) {
    return '<span class="rating">' + stars(p.rating) +
      '<span class="count">(' + p.reviews + ')</span></span>';
  }

  /* ---------- DOM helpers ---------- */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  function onScrollHeader() {
    var header = $('.site-header');
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function backToTop() {
    var btn = $('.back-to-top');
    if (!btn) return;
    var onScroll = function () {
      btn.classList.toggle('is-visible', window.scrollY > 700);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    onScroll();
  }

  function revealInit() {
    var els = $all('.reveal, .reveal--img');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Toast ---------- */
  var toastTimer = null;
  function toast(message) {
    var el = $('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-visible'); }, 2600);
  }

  /* ---------- Promo bar rotation ---------- */
  function promoBar() {
    var msgs = $all('.promo-bar__msg');
    if (msgs.length < 2) return;
    var idx = 0;
    setInterval(function () {
      msgs[idx].classList.remove('is-active');
      idx = (idx + 1) % msgs.length;
      msgs[idx].classList.add('is-active');
    }, 4200);
  }

  /* ---------- Accordions (PDP + FAQ) ---------- */
  function accordions() {
    $all('.acc__btn, .filters__btn').forEach(function (btn) {
      if (btn.dataset.accBound) return;
      btn.dataset.accBound = '1';
      btn.addEventListener('click', function () {
        var expanded = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!expanded));
      });
    });
  }

  /* ---------- Newsletter validation (club + footer) ---------- */
  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
  }

  function newsletterForms() {
    var forms = $all('.club-form, .footer-form');
    forms.forEach(function (form) {
      var input = $('input[type="email"]', form);
      var msg = form.parentElement.querySelector('.club-msg, .footer-form-msg');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!input) return;
        if (!validEmail(input.value)) {
          if (msg) { msg.textContent = 'Please enter a valid email address.'; msg.style.color = '#C98A7D'; }
          input.setAttribute('aria-invalid', 'true');
          input.focus();
          return;
        }
        input.removeAttribute('aria-invalid');
        if (msg) { msg.textContent = 'Welcome to the club. Your first look arrives soon.'; msg.style.color = ''; }
        form.reset();
        toast('Welcome to the club');
      });
    });
  }

  /* ---------- Contact form (contact page) ---------- */
  function contactForm() {
    var form = $('.contact-form');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      $all('[required]', form).forEach(function (field) {
        var wrap = field.closest('.form-field');
        var bad = !field.value.trim() ||
          (field.type === 'email' && !validEmail(field.value));
        if (wrap) wrap.classList.toggle('has-error', bad);
        if (bad) { ok = false; }
      });
      if (!ok) return;
      var note = $('.form-success', form.parentElement) || null;
      if (note) { note.textContent = 'Thank you — our client care team will reply within one working day.'; }
      form.reset();
      toast('Message sent');
    });
    $all('input, textarea, select', form).forEach(function (field) {
      field.addEventListener('input', function () {
        var wrap = field.closest('.form-field');
        if (wrap) wrap.classList.remove('has-error');
      });
    });
  }

  window.PLMWUI = {
    icon: icon, stars: stars, ratingHtml: ratingHtml,
    $: $, $all: $all,
    onScrollHeader: onScrollHeader,
    backToTop: backToTop,
    revealInit: revealInit,
    toast: toast,
    promoBar: promoBar,
    accordions: accordions,
    newsletterForms: newsletterForms,
    contactForm: contactForm,
    validEmail: validEmail
  };
})(window, document);
