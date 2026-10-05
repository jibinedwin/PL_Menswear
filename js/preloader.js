/**
 * ÉLAN — The Art of Dressing
 * Animations Module: IntersectionObserver Scroll Triggers, Parallax & Preloader Sequence
 */

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initScrollAnimations();
  initHeroParallax();
});

/**
 * PL Preloader
 * Controls logo loading, progress animation,
 * page readiness, and hero reveal.
 */

function initPreloader() {
  const preloader = document.getElementById('preloader');
  const progressBar = document.querySelector('.preloader__progress-bar');
  const heroSection = document.getElementById('hero');

  if (!preloader) return;

  // Stop page scrolling while preloader is visible
  document.body.style.overflow = 'hidden';

  let progress = 0;

  const loading = setInterval(() => {

    progress += 2;

    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }

    if (progress >= 100) {

      clearInterval(loading);

      setTimeout(() => {
        
        const enterBtn = document.getElementById('preloader-enter-btn');
        if (enterBtn) {
          enterBtn.style.display = 'block';
          // Trigger reflow to ensure transition works
          void enterBtn.offsetWidth;
          enterBtn.style.opacity = '1';

          enterBtn.addEventListener('click', () => {
            // Hide preloader
            preloader.classList.add('preloader--hidden');

            // Enable scrolling
            document.body.style.overflow = '';

            // Start hero animation
            if (heroSection) {
              heroSection.classList.add('is-loaded');
            }
            
            // Start music AFTER click
            if (typeof startSiteMusic === 'function') {
                startSiteMusic();
            }

            // Remove preloader after fade-out
            setTimeout(() => {
              preloader.remove();
            }, 800);
          }, { once: true });
        }

      }, 300);
    }

  }, 30);
}

/**
 * IntersectionObserver for high-performance scroll-triggered reveals
 */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll, .reveal-left, .reveal-right, .reveal-clip');

  if (!('IntersectionObserver' in window)) {
    // Fallback for browsers without observer
    revealElements.forEach(el => el.classList.add('is-revealed'));
    return;
  }

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -8% 0px',
    threshold: 0.15
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target); // Reveal once
      }
    });
  }, observerOptions);

  revealElements.forEach(el => revealObserver.observe(el));
}

/**
 * Gentle parallax effect on hero & editorial banner (respecting prefers-reduced-motion)
 */
function initHeroParallax() {
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (mediaQuery.matches) return;

  const heroBg = document.querySelector('.hero__bg-img');
  const editorialBg = document.querySelector('.editorial-split__img');

  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    if (heroBg && scrollY < window.innerHeight) {
      heroBg.style.transform = `translate3d(0, ${scrollY * 0.22}px, 0) scale(${heroBg.closest('#hero').classList.contains('is-loaded') ? 1 : 1.12})`;
    }

    if (editorialBg) {
      const rect = editorialBg.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const offset = (window.innerHeight - rect.top) * 0.05;
        editorialBg.style.transform = `translate3d(0, ${offset}px, 0)`;
      }
    }
  }, { passive: true });
}
