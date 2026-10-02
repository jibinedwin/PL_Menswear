# PL Mens Wear — Premium Menswear E-commerce Website

A premium, editorial-style men's fashion website built with **pure HTML5, CSS3 and vanilla JavaScript** — no frameworks, no build step, no dependencies.

## Run it

Open `index.html` directly in a browser, or serve the folder (recommended so the Fetch API loads JSON cleanly on all browsers):

```bash
npx http-server -p 8080
# then visit http://localhost:8080
```

## Structure

```
├── index.html              Homepage (hero, occasions, categories, rails, story, reviews, club)
├── pages/
│   ├── shop.html           Product listing page (filters, sort, grid/list views)
│   ├── product.html        Product details page (?id=<product-id>)
│   ├── collection.html     Collection / occasion listing (?collection=<slug>)
│   ├── about.html          Brand story
│   ├── contact.html        Contact form + FAQ
│   └── lookbook.html       Masonry lookbook with lightbox
├── css/                    base · header · hero · products · sections · footer · responsive
├── js/
│   ├── data.js             Fetch API loader (data/*.json) + JS fallback + path base helper
│   ├── products.js         Card factory, PLP filter/sort/view, PDP, quick view, wishlist modal, lightbox
│   ├── cart.js             Cart drawer, quantities, free-shipping progress (localStorage)
│   ├── wishlist.js         Wishlist state + header badge (localStorage)
│   ├── search.js           Full-screen search overlay with live results
│   ├── navigation.js       Mega menu, mobile nav, scroll locking
│   ├── utils.js            Icons, reveal-on-scroll, toast, promo bar, accordions, form validation
│   └── main.js             Shared chrome bootstrap
├── data/
│   ├── products.json       22-product catalog (edit products/prices here)
│   └── site-config.json    Promo bar messages, trending searches, occasions, collections
├── assets/images/          Original generated SVG placeholder photography
│   ├── hero/  occasions/  categories/  products/  collections/  lookbook/  lifestyle/
└── tools/
    ├── generate-images.js  Regenerates all placeholder SVGs:  node tools/generate-images.js
    └── audit-links.js      Link/asset integrity audit:        node tools/audit-links.js
```

## Editing content

- **Products** — edit `data/products.json` (name, price, mrp, colors, sizes, fit, fabric, collection, occasion, badge). Fallback data in `js/data.js` is only used if JSON fetch fails.
- **Promo bar / trending searches / collections** — edit `data/site-config.json`.
- **Imagery** — replace SVGs in `assets/images/**` with real photography (keep the same file names, ~4:5 aspect for products).

## Notes

- Cart, wishlist and promo messages persist via `localStorage`.
- Reviews are placeholder content — replace with real data before production.
- Checkout is a demo stub; wire a payment provider where `data-cart-checkout` is handled.
- `node tools/audit-links.js` verifies every internal link, CSS `url()`, JS path literal and product image resolves — useful before deploying.
