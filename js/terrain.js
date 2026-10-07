/* ==========================================================================
   PL MENS WEAR — EVERY TERRAIN
   <plmw-terrain> custom element.
   Pins a full-viewport stage over a long scroll runway; the wordmark
   "EVERY Terrain" splits apart, a wedge of imagery grows between the words,
   flies into the featured card while the remaining occasion cards assemble
   outward from centre, and the giant ruler wordmark fades in behind.
   Progress-driven (scroll position -> rAF), not time-driven.
   ========================================================================== */

(() => {
  'use strict';

  if (customElements.get('plmw-terrain')) return;

  const mobileQuery = window.matchMedia('(max-width: 919px)');

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const easeOut = (value) => 1 - Math.pow(1 - value, 3);
  const smoothstep = (value) => value * value * (3 - 2 * value);
  const lerp = (from, to, progress) => from + (to - from) * progress;

  class PlmwTerrain extends HTMLElement {
    connectedCallback() {
      if (this.connected) return;
      this.connected = true;

      this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

      this.pinObserver = new ResizeObserver(() => this.requestMeasure());
      this.onScroll = this.requestFrame.bind(this);
      this.onResize = () => {
        /* skip height-only resizes on mobile (URL bar show/hide) */
        if (mobileQuery.matches && this.layoutWidth === window.innerWidth) return;
        this.requestMeasure();
      };
      this.onLayoutChange = () => this.requestMeasure();

      window.addEventListener('resize', this.onResize, { passive: true });
      this.motionQuery.addEventListener('change', this.onLayoutChange);
      mobileQuery.addEventListener('change', this.onLayoutChange);
      document.addEventListener('scroll', this.onScroll, { passive: true });

      requestAnimationFrame(() => {
        if (this.isConnected) this.refresh();
      });
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => { if (this.isConnected) this.measure(); });
      }
    }

    disconnectedCallback() {
      this.connected = false;
      document.removeEventListener('scroll', this.onScroll);
      window.removeEventListener('resize', this.onResize);
      this.motionQuery.removeEventListener('change', this.onLayoutChange);
      mobileQuery.removeEventListener('change', this.onLayoutChange);
      this.pinObserver.disconnect();
      if (this.frameRequest) cancelAnimationFrame(this.frameRequest);
      if (this.measureRequest) cancelAnimationFrame(this.measureRequest);
      this.frameRequest = 0;
      this.measureRequest = 0;
      this.sectionWrapper.removeAttribute('data-terrain-sticky');
    }

    refresh() {
      this.pin = this.querySelector('[data-terrain-pin]');
      this.pinObserver.disconnect();
      if (this.pin) this.pinObserver.observe(this.pin);

      this.firstWord = this.querySelector('[data-terrain-first]');
      this.secondWord = this.querySelector('[data-terrain-second]');
      this.introMedia = this.querySelector('[data-terrain-intro-media]');
      this.rulerFirst = this.querySelector('[data-terrain-ruler-first]');
      this.rulerSecond = this.querySelector('[data-terrain-ruler-second]');
      this.rail = this.querySelector('.terrain__rail');
      this.sectionWrapper = this.closest('.terrain-section') || this.parentElement;

      this.cards = Array.prototype.slice.call(this.querySelectorAll('[data-terrain-card]'));
      this.labels = this.cards.map((card) => card.querySelector('.terrain__label'));

      this.cards.forEach((card) => card.removeAttribute('data-featured'));
      this.featuredCard = this.cards[Math.floor(this.cards.length / 2)];
      if (this.featuredCard) this.featuredCard.setAttribute('data-featured', 'true');
      this.featuredImage = this.featuredCard
        ? this.featuredCard.querySelector('.terrain__image')
        : null;

      this.ensureIntroImage();
      this.requestMeasure();
    }

    ensureIntroImage() {
      if (!this.introMedia || !this.featuredImage) return;
      const configured = this.introMedia.querySelector('.terrain__intro-image');
      if (configured) { this.introImage = configured; return; }
      const clone = this.featuredImage.cloneNode(true);
      clone.removeAttribute('id');
      clone.removeAttribute('loading');
      clone.alt = '';
      clone.setAttribute('aria-hidden', 'true');
      this.introMedia.replaceChildren(clone);
      this.introImage = clone;
    }

    unavailableReason() {
      if (this.dataset.enableAnimation !== 'true') return 'sticky-disabled';
      if (this.motionQuery.matches) return 'reduced-motion';
      if (!this.cards.length) return 'no-cards';
      if (!this.featuredCard || !this.featuredImage) return 'no-featured-image';
      return '';
    }

    reset() {
      this.removeAttribute('data-motion-ready');
      this.removeAttribute('data-done');
      this.removeAttribute('data-measuring');
      if (this.sectionWrapper) this.sectionWrapper.removeAttribute('data-terrain-sticky');
      this.setInteractive(true);
      this.measurements = null;
      this.lastProgress = null;
      [this.firstWord, this.secondWord].forEach((word) => {
        if (word) word.style.cssText = '';
      });
      if (this.introMedia) this.introMedia.style.cssText = '';
      (this.cards || []).forEach((card) => {
        card.style.opacity = '';
        card.style.transform = '';
        card.style.visibility = '';
      });
      (this.labels || []).forEach((label) => {
        if (label) label.style.opacity = '';
      });
    }

    setInteractive(interactive) {
      this.toggleAttribute('data-cards-interactive', interactive);
      if (!this.rail) return;
      if (interactive) {
        this.rail.removeAttribute('inert');
        this.rail.removeAttribute('aria-hidden');
      } else {
        this.rail.setAttribute('inert', '');
        this.rail.setAttribute('aria-hidden', 'true');
      }
    }

    requestMeasure() {
      if (this.measureRequest) return;
      this.measureRequest = requestAnimationFrame(() => {
        this.measureRequest = 0;
        if (this.isConnected) this.measure();
      });
    }

    measure() {
      if (!this.pin || !this.firstWord || !this.secondWord || !this.introMedia ||
          !this.rulerFirst || !this.rulerSecond) return;

      const unavailable = this.unavailableReason();
      if (unavailable) {
        this.reset();
        this.dataset.motionState = unavailable;
        return;
      }
      this.dataset.motionState = 'ready';
      this.layoutWidth = window.innerWidth;

      this.setAttribute('data-measuring', '');
      this.setAttribute('data-motion-ready', '');
      if (this.sectionWrapper && this.dataset.stickySection === 'true') {
        this.sectionWrapper.setAttribute('data-terrain-sticky', '');
      }
      this.setInteractive(false);
      this.cards.forEach((card) => { card.style.transform = ''; });

      const pinRect = this.pin.getBoundingClientRect();
      this.viewport = pinRect.height;

      const relativeRect = (element) => {
        const rect = element.getBoundingClientRect();
        return {
          left: rect.left - pinRect.left,
          top: rect.top - pinRect.top,
          width: rect.width,
          height: rect.height
        };
      };

      [this.firstWord, this.secondWord].forEach((word) => {
        word.style.position = '';
        word.style.left = '';
        word.style.top = '';
        word.style.transform = '';
        word.style.visibility = '';
        word.style.opacity = '';
      });
      this.introMedia.style.cssText = '';
      this.introMedia.style.width = '0px';

      const startWidth = mobileQuery.matches ? 96 : 150;
      const startHeight = mobileQuery.matches ? 122 : 190;
      this.introMedia.style.height = startHeight + 'px';

      const firstStart = relativeRect(this.firstWord);
      const secondStart = relativeRect(this.secondWord);
      const centre = (firstStart.left + firstStart.width + secondStart.left) / 2;

      this.measurements = {
        firstStart: firstStart,
        secondStart: secondStart,
        imageStart: {
          left: centre,
          top: firstStart.top + firstStart.height / 2 - startHeight / 2,
          width: startWidth,
          height: startHeight
        },
        firstEnd: relativeRect(this.rulerFirst),
        secondEnd: relativeRect(this.rulerSecond),
        imageEnd: relativeRect(this.featuredImage)
      };

      [[this.firstWord, firstStart], [this.secondWord, secondStart]].forEach((pair) => {
        const word = pair[0], rect = pair[1];
        word.style.position = 'absolute';
        word.style.left = rect.left + 'px';
        word.style.top = rect.top + 'px';
      });
      this.introMedia.style.position = 'absolute';
      this.introMedia.style.left = this.measurements.imageStart.left + 'px';
      this.introMedia.style.top = this.measurements.imageStart.top + 'px';

      this.lastProgress = null;
      this.render();
      this.removeAttribute('data-measuring');
    }

    requestFrame() {
      if (this.frameRequest || !this.measurements) return;
      this.frameRequest = requestAnimationFrame(() => {
        this.frameRequest = 0;
        this.render();
      });
    }

    placeWord(element, start, end, initialOffset, progress) {
      const scale = lerp(1, end.width / Math.max(start.width, 1), progress);
      const x = lerp(initialOffset, end.left - start.left, progress);
      const y = lerp(0, end.top - start.top, progress);
      element.style.transform =
        'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) scale(' + scale.toFixed(4) + ')';
    }

    /* outward from the featured card: left/right neighbours by distance */
    orderedCards() {
      const featuredIndex = Math.max(0, this.cards.indexOf(this.featuredCard));
      const output = [];
      for (let distance = 1; output.length < this.cards.length - 1; distance += 1) {
        const left = this.cards[featuredIndex - distance];
        const right = this.cards[featuredIndex + distance];
        if (left) output.push({ card: left, direction: -1, distance: distance });
        if (right) output.push({ card: right, direction: 1, distance: distance });
        if (!left && !right) break;
      }
      return output;
    }

    render() {
      if (!this.measurements) return;

      const bounds = this.getBoundingClientRect();
      const viewportTop = 0; /* document.scrollingElement */
      const hold = this.viewport;
      const run = Math.max(bounds.height - this.viewport - hold, 1);
      const progress = clamp((viewportTop - bounds.top) / run);
      if (progress === this.lastProgress) return;
      this.lastProgress = progress;

      /* phase 1 — wedge widens between the words */
      const widenProgress = easeOut(clamp(progress / 0.3));
      const wedgeWidth = this.measurements.imageStart.width * widenProgress;
      const wordPush = (wedgeWidth + 32 * widenProgress) / 2;

      /* phase 2 — words + wedge fly to their final positions */
      const flightProgress = smoothstep(clamp((progress - 0.38) / 0.48));

      this.placeWord(this.firstWord, this.measurements.firstStart,
        this.measurements.firstEnd, -wordPush, flightProgress);
      this.placeWord(this.secondWord, this.measurements.secondStart,
        this.measurements.secondEnd, wordPush, flightProgress);

      const wordOpacity = 1 - 0.9 * smoothstep(clamp((progress - 0.52) / 0.32));
      this.firstWord.style.opacity = wordOpacity.toFixed(3);
      this.secondWord.style.opacity = wordOpacity.toFixed(3);

      const imageStart = this.measurements.imageStart;
      const imageEnd = this.measurements.imageEnd;
      this.introMedia.style.left =
        lerp(imageStart.left - wedgeWidth / 2, imageEnd.left, flightProgress).toFixed(2) + 'px';
      this.introMedia.style.top =
        lerp(imageStart.top, imageEnd.top, flightProgress).toFixed(2) + 'px';
      this.introMedia.style.width =
        lerp(wedgeWidth, imageEnd.width, flightProgress).toFixed(2) + 'px';
      this.introMedia.style.height =
        lerp(imageStart.height, imageEnd.height, flightProgress).toFixed(2) + 'px';

      const done = flightProgress >= 0.985;
      this.toggleAttribute('data-done', done);
      this.setInteractive(progress >= 0.99);

      const visibility = done ? 'hidden' : 'visible';
      this.introMedia.style.visibility = visibility;
      this.firstWord.style.visibility = visibility;
      this.secondWord.style.visibility = visibility;

      /* labels: featured first, then outward */
      const featuredIndex = this.cards.indexOf(this.featuredCard);
      [featuredIndex, featuredIndex - 1, featuredIndex + 1, featuredIndex - 2, featuredIndex + 2]
        .filter((index) => index >= 0 && index < this.labels.length)
        .forEach((labelIndex, orderIndex) => {
          const label = this.labels[labelIndex];
          if (!label) return;
          label.style.opacity =
            smoothstep(clamp((progress - (0.62 + orderIndex * 0.045)) / 0.14)).toFixed(3);
        });

      /* cards: featured holds, neighbours slide in from outside */
      this.featuredCard.style.opacity = '1';
      this.featuredCard.style.visibility = progress > 0.62 ? 'visible' : 'hidden';
      this.orderedCards().forEach((entry, orderIndex) => {
        const card = entry.card, direction = entry.direction, distance = entry.distance;
        const reveal = smoothstep(clamp((progress - (0.66 + orderIndex * 0.05)) / 0.16));
        card.style.opacity = reveal.toFixed(3);
        card.style.visibility = reveal > 0 ? 'visible' : 'hidden';
        card.style.transform = done ? '' :
          'translate3d(' +
          lerp(direction * (distance === 1 ? 34 : 56), 0, reveal).toFixed(2) + 'px,0,0)';
      });
    }
  }

  customElements.define('plmw-terrain', PlmwTerrain);
})();
