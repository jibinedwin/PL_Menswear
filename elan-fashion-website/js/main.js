/**
 * ÉLAN — The Art of Dressing
 * Main Entry Module: Header scroll state, mobile menu drawer, store switcher, search dialog, and smooth navigation
 */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initStoreTabs();
  initSearchModal();
  initBackToTop();
});

/**
 * Sticky Header on scroll & active link state
 */
function initHeader() {
  const header = document.querySelector('.site-header');
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }

    // Scroll spy for active navigation item
    let current = '';
    const scrollPosition = window.pageYOffset + 160;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}

/**
 * Mobile Navigation Drawer Toggle & Accessibility
 */
function initMobileMenu() {
  const hamburgerBtn = document.querySelector('.hamburger-btn');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileLinks = document.querySelectorAll('.mobile-nav__link');

  if (!hamburgerBtn || !mobileNav) return;

  function toggleMenu(open) {
    const isOpen = open !== undefined ? open : !mobileNav.classList.contains('is-open');
    mobileNav.classList.toggle('is-open', isOpen);
    hamburgerBtn.classList.toggle('is-active', isOpen);
    hamburgerBtn.setAttribute('aria-expanded', isOpen.toString());
    mobileNav.setAttribute('aria-hidden', (!isOpen).toString());
    document.body.classList.toggle('modal-open', isOpen);
  }

  hamburgerBtn.addEventListener('click', () => toggleMenu());

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      toggleMenu(false);
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav.classList.contains('is-open')) {
      toggleMenu(false);
      hamburgerBtn.focus();
    }
  });
}

/**
 * Store Location Tabs & Dynamic Map Switching
 */
function initStoreTabs() {
  const tabButtons = document.querySelectorAll('.store-tab-btn');
  const storeCards = document.querySelectorAll('.store-info-card');
  const mapIframe = document.querySelector('.map-iframe');

  const mapUrls = {
    mumbai: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3773.9142750694116!2d72.83151897593257!3d18.935105282240974!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7d1ddb3f07297%3A0xbce5c79294d1f211!2sFort%2C%20Mumbai%2C%20Maharashtra!5e0!3m2!1sen!2sin!4v1714560000000!5m2!1sen!2sin",
    bengaluru: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.0016462725227!2d77.64082727581729!3d12.971787687343603!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae16a7985392d7%3A0xb35a0d3356027a05!2s100%20Feet%20Rd%2C%20Indiranagar%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1714560000000!5m2!1sen!2sin",
    delhi: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3506.183416480521!2d77.18301727620245!3d28.520448188611116!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d1e0413550301%3A0x67dbad97960fc5d4!2sAmbawatta%20One%2C%20Mehrauli%2C%20New%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1714560000000!5m2!1sen!2sin"
  };

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetStore = btn.getAttribute('data-store');

      tabButtons.forEach(b => b.classList.remove('active'));
      storeCards.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const activeCard = document.getElementById(`store-${targetStore}`);
      if (activeCard) activeCard.classList.add('active');

      if (mapIframe && mapUrls[targetStore]) {
        mapIframe.src = mapUrls[targetStore];
      }
    });
  });
}

/**
 * Editorial Search Overlay
 */
function initSearchModal() {
  const searchBtn = document.querySelector('.header-search-btn');
  const searchModal = document.getElementById('search-modal');
  const searchClose = document.querySelector('.search-modal__close');
  const searchInput = document.querySelector('.search-input');
  const searchTags = document.querySelectorAll('.search-tag');

  if (!searchModal) return;

  function openSearch() {
    searchModal.classList.add('is-open');
    searchModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    setTimeout(() => searchInput?.focus(), 150);
  }

  function closeSearch() {
    searchModal.classList.remove('is-open');
    searchModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    searchBtn?.focus();
  }

  searchBtn?.addEventListener('click', openSearch);
  searchClose?.addEventListener('click', closeSearch);

  searchModal.addEventListener('click', (e) => {
    if (e.target === searchModal) closeSearch();
  });

  searchTags.forEach(tag => {
    tag.addEventListener('click', () => {
      if (searchInput) searchInput.value = tag.textContent;
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchModal.classList.contains('is-open')) {
      closeSearch();
    }
  });
}

/**
 * Smooth Back to Top Scroll
 */
function initBackToTop() {
  const backBtn = document.querySelector('.back-to-top-btn');
  backBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}
