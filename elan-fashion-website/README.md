# ÉLAN — The Art of Dressing
> **Premium Men's Fashion Website — Modern Animated Frontend**

Inspired by the editorial elegance, restrained luxury, and visual storytelling of heritage menswear icons (such as Louis Philippe, Brunello Cucinelli, and Ralph Lauren Purple Label), **ÉLAN** is a production-grade, responsive single-page experience built with pure **HTML5**, **CSS3**, and **Vanilla JavaScript (ES6+)**.

---

## 🌟 Brand Identity & Visual Direction

* **Brand Name:** ÉLAN — The Art of Dressing
* **Personality:** Sophisticated, Minimal, Elegant, Contemporary, Confident
* **Color Palette:**
  * **Primary Background:** `#101010` (Deep Charcoal Black)
  * **Secondary Background:** `#181818` (Warm Night)
  * **Text Primary:** `#F7F4EE` (Warm Ivory)
  * **Text Secondary:** `#AAA69E` (Muted Sand)
  * **Accent Gold:** `#C6A66B` (Champagne Gold)
  * **Light Section:** `#F2EFE8` (Editorial Linen)
  * **Borders:** `rgba(255, 255, 255, 0.12)`
* **Typography:**
  * **Editorial Headings:** `Cormorant Garamond`
  * **Body & UI Elements:** `Manrope`

---

## 🏛️ Website Architecture & Sections

1. **Preloader Animation:** Clean, typographic reveal of the brand mark "ÉLAN" with gold loading bar and automatic dismiss.
2. **Sticky Navigation Bar:** Transparent atop the 100svh Hero, seamlessly transitioning to frosted translucent glass (`backdrop-filter: blur(14px)`) on scroll. Includes mobile hamburger drawer, keyboard accessibility, and curated search overlay modal.
3. **Cinematic Hero Section:** Full-bleed 100svh photography with subtle slow-zoom from 1.12 to 1.0, staggered line-by-line heading reveal, and animated vertical scroll indicator.
4. **Brand Introduction (Our Philosophy):** Asymmetrical editorial layout with key artisanal metrics (Super 150s Wool, 42+ Handcrafted hours, 3 Metropolises) and atelier imagery.
5. **Featured Collection:** Asymmetrical 12-column editorial grid showcasing four distinct capsules:
   - *The Formal Edit*
   - *Modern Essentials*
   - *Weekend Tailoring*
   - *The Signature Collection*
6. **Fashion Gallery & Lightbox:** Masonry-inspired CSS Grid showcasing 6 diverse aspect-ratio fashion photographs with category filtering and an accessible, keyboard-operable (`Escape`, `ArrowLeft`, `ArrowRight`) modal lightbox.
7. **Brand Experience / Editorial Section:** Split-screen layout highlighting bespoke craftsmanship with gentle parallax.
8. **Store Location with Interactive Map:** Multi-city flagship selector (Mumbai, Bengaluru, New Delhi) with dynamic Google Maps iframe updates and external direction links.
9. **Contact Form:** Real-time validated form supporting Indian mobile telephone patterns (`+91`), inline error states, button loading spinner, and clear instructions for backend connection.
10. **Footer:** Multi-column layout with private dispatch subscription, navigation anchors, social channels, and smooth back-to-top interaction.

---

## 📁 Directory Structure

```text
elan-fashion-website/
│
├── index.html                  # Semantic HTML5 document (all 10 sections)
│
├── css/
│   ├── style.css               # Core styling, typography, variables, layouts
│   ├── animations.css          # Keyframes, IntersectionObserver transitions
│   └── responsive.css          # Mobile-first breakpoints (360px to 1920px)
│
├── js/
│   ├── main.js                 # Header scroll, mobile drawer, search modal, store tabs
│   ├── animations.js           # Preloader, IntersectionObserver, subtle parallax
│   ├── gallery.js              # Filtering, masonry grid, accessible lightbox
│   └── contact.js              # Form validation, Indian phone regex, loading states
│
├── assets/
│   ├── images/
│   │   ├── hero/               # Hero photography
│   │   ├── collections/        # Formal, Shirts, Jackets, Denim, Accessories
│   │   ├── lifestyle/          # Atelier and craftsmanship photos
│   │   └── logo/               # Brand logos
│   ├── videos/                 # Media assets
│   └── icons/
│
└── README.md
```

---

## 🚀 Running the Project Locally

No dependencies or build steps are required. You can preview the website instantly:

1. **Option 1 (Direct in Browser):**
   Double-click `elan-fashion-website/index.html` to open it in Chrome, Edge, Safari, or Firefox.

2. **Option 2 (Local Development Server):**
   Using VS Code Live Server or Node/Python:
   ```bash
   # Using Python 3
   cd elan-fashion-website
   python -m http.server 8000
   ```
   Open `http://localhost:8000` in your web browser.

---

## ♿ Accessibility & Performance Highlights

* **Reduced Motion:** Fully complies with `prefers-reduced-motion: reduce` by disabling transitions and animations for sensitive users.
* **Semantic Hierarchy:** `h1` through `h4`, ARIA landmarks, `skip-to-content` link, and proper labels.
* **Performance:** IntersectionObserver is used for scroll reveals to avoid heavy scroll calculations; images below the fold use `loading="lazy"`.
