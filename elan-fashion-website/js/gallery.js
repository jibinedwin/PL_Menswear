/**
 * ÉLAN — The Art of Dressing
 * Gallery Module: Filtering, Modal Lightbox, Keyboard Accessibility & Touch-friendly controls
 */

document.addEventListener('DOMContentLoaded', () => {
  initGallery();
});

function initGallery() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const lightbox = document.getElementById('gallery-lightbox');
  
  if (!lightbox) return;

  const lightboxImg = lightbox.querySelector('.lightbox__img');
  const lightboxTitle = lightbox.querySelector('.lightbox__title');
  const lightboxCategory = lightbox.querySelector('.lightbox__category');
  const closeBtn = lightbox.querySelector('.lightbox__close');
  const prevBtn = lightbox.querySelector('.lightbox__prev');
  const nextBtn = lightbox.querySelector('.lightbox__next');

  let activeIndex = 0;
  let visibleItems = Array.from(galleryItems);

  // Filter interaction
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const itemCat = item.getAttribute('data-category');
        if (filterValue === 'all' || itemCat === filterValue) {
          item.style.display = 'block';
          item.style.opacity = '1';
        } else {
          item.style.display = 'none';
          item.style.opacity = '0';
        }
      });

      // Update currently visible items list for lightbox navigation
      visibleItems = Array.from(galleryItems).filter(item => item.style.display !== 'none');
    });
  });

  // Open Lightbox on item click
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const currentFilteredIndex = visibleItems.indexOf(item);
      if (currentFilteredIndex !== -1) {
        openLightbox(currentFilteredIndex);
      }
    });

    // Keyboard enter support
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const currentFilteredIndex = visibleItems.indexOf(item);
        if (currentFilteredIndex !== -1) {
          openLightbox(currentFilteredIndex);
        }
      }
    });
  });

  function openLightbox(index) {
    activeIndex = index;
    updateLightboxContent();
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (visibleItems[activeIndex]) {
      visibleItems[activeIndex].focus();
    }
  }

  function updateLightboxContent() {
    const item = visibleItems[activeIndex];
    if (!item) return;

    const img = item.querySelector('img');
    const title = item.querySelector('.gallery-item__title')?.textContent || 'ÉLAN Editorial';
    const category = item.querySelector('.gallery-item__category')?.textContent || 'Collection';

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || title;
    lightboxTitle.textContent = title;
    lightboxCategory.textContent = category;
  }

  function showNext() {
    activeIndex = (activeIndex + 1) % visibleItems.length;
    updateLightboxContent();
  }

  function showPrev() {
    activeIndex = (activeIndex - 1 + visibleItems.length) % visibleItems.length;
    updateLightboxContent();
  }

  // Event Listeners
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (nextBtn) nextBtn.addEventListener('click', showNext);
  if (prevBtn) prevBtn.addEventListener('click', showPrev);

  // Close when clicking backdrop
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Global Keyboard Navigation (Escape, ArrowLeft, ArrowRight)
  window.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;

    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowRight') {
      showNext();
    } else if (e.key === 'ArrowLeft') {
      showPrev();
    }
  });
}
