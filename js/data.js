/* ==========================================================================
   PL Mens Wear — Data module
   Loads catalog + site config via Fetch API, with a built-in fallback so the
   site still works when opened from the filesystem (file://) without a server.
   Exposes: window.PLMW.getProducts(), window.PLMW.getConfig(), helpers.
   ========================================================================== */

(function (window) {
  'use strict';

  var FALLBACK_PRODUCTS = [
    { id: 'relaxed-linen-shirt', name: 'Relaxed Linen Shirt', category: 'Shirts', collection: 'Linen Edit', occasion: ['Weekend', 'Travel'], price: 2499, mrp: 2999, colors: ['Ivory', 'Sand', 'Olive'], colorValues: ['#efe7d8', '#cbb391', '#6b6f4e'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], fit: 'Relaxed', fabric: 'Pure Linen', rating: 4.6, reviews: 182, badge: 'New', description: 'A relaxed linen shirt cut from breathable pure linen.' },
    { id: 'oxford-stretch-shirt', name: 'Oxford Stretch Shirt', category: 'Shirts', collection: 'Essential Collection', occasion: ['Work'], price: 2199, mrp: 2799, colors: ['White', 'Muted Navy'], colorValues: ['#f5f2ec', '#39485e'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], fit: 'Slim', fabric: 'Cotton Oxford', rating: 4.7, reviews: 264, badge: 'Bestseller', description: 'The desk-to-dinner shirt in breathable oxford cotton.' },
    { id: 'no-iron-travel-shirt', name: 'No-Iron Travel Shirt', category: 'Shirts', collection: 'Travel', occasion: ['Travel', 'Work'], price: 2699, mrp: 3199, colors: ['Sky', 'Stone Grey'], colorValues: ['#aebfca', '#8d8a83'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], fit: 'Regular', fabric: 'Tech Cotton Poplin', rating: 4.5, reviews: 143, description: 'Packs flat, lands crisp. Wrinkle-resistant poplin.' },
    { id: 'brushed-twill-shirt', name: 'Brushed Twill Overshirt', category: 'Shirts', collection: 'Weekend Collection', occasion: ['Weekend', 'Evening'], price: 2999, mrp: 3499, colors: ['Dark Brown', 'Charcoal'], colorValues: ['#4a3a2e', '#33342f'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], fit: 'Regular', fabric: 'Brushed Cotton Twill', rating: 4.8, reviews: 207, description: 'Half shirt, half light jacket in brushed twill.' },
    { id: 'festive-textured-shirt', name: 'Festive Textured Shirt', category: 'Shirts', collection: 'Festive Edit', occasion: ['Festive', 'Evening'], price: 2899, mrp: 3599, colors: ['Ivory', 'Burgundy'], colorValues: ['#efe7d8', '#5c2530'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], fit: 'Slim', fabric: 'Self-Textured Cotton', rating: 4.4, reviews: 96, badge: 'New', description: 'Subtle self-texture, quiet sheen, festive without the noise.' },
    { id: 'featherweight-tee', name: 'Featherweight Crew Tee', category: 'T-Shirts', collection: 'Essential Collection', occasion: ['Weekend'], price: 999, mrp: 1299, colors: ['White', 'Charcoal', 'Olive'], colorValues: ['#f5f2ec', '#33342f', '#6b6f4e'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], fit: 'Regular', fabric: 'Supima Cotton', rating: 4.7, reviews: 421, badge: 'Bestseller', description: 'The perfect-weight tee in long-staple Supima cotton.' },
    { id: 'heavyweight-pocket-tee', name: 'Heavyweight Pocket Tee', category: 'T-Shirts', collection: 'Weekend Collection', occasion: ['Weekend', 'Travel'], price: 1199, mrp: 1499, colors: ['Sand', 'Dark Brown'], colorValues: ['#cbb391', '#4a3a2e'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], fit: 'Relaxed', fabric: 'Loopback Cotton', rating: 4.5, reviews: 188, description: 'A pocket tee with the presence of a light knit.' },
    { id: 'motion-polo', name: 'Motion Pique Polo', category: 'Polos', collection: 'Essential Collection', occasion: ['Work', 'Weekend'], price: 1699, mrp: 2199, colors: ['Muted Navy', 'Ivory', 'Stone Grey'], colorValues: ['#39485e', '#efe7d8', '#8d8a83'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], fit: 'Slim', fabric: 'Performance Pique', rating: 4.6, reviews: 312, badge: 'Bestseller', description: 'Four-way stretch pique that stays crisp all day.' },
    { id: 'linen-cotton-polo', name: 'Linen-Cotton Polo', category: 'Polos', collection: 'Linen Edit', occasion: ['Weekend', 'Travel'], price: 1899, mrp: 2299, colors: ['Sand', 'Sky'], colorValues: ['#cbb391', '#aebfca'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], fit: 'Regular', fabric: 'Linen-Cotton Blend', rating: 4.4, reviews: 134, description: 'Breathes like a shirt, wears like a favourite.' },
    { id: 'merino-polo', name: 'Fine Merino Knit Polo', category: 'Polos', collection: 'Premium Collection', occasion: ['Evening', 'Work'], price: 3299, mrp: 3999, colors: ['Charcoal', 'Burgundy'], colorValues: ['#33342f', '#5c2530'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], fit: 'Slim', fabric: 'Extra-Fine Merino', rating: 4.8, reviews: 89, badge: 'Premium', description: 'Extra-fine merino knitted into a collared silhouette.' },
    { id: '4-way-stretch-trouser', name: '4-Way Stretch Trouser', category: 'Trousers', collection: 'Essential Collection', occasion: ['Work', 'Travel'], price: 2299, mrp: 2899, colors: ['Charcoal', 'Stone Grey', 'Muted Navy'], colorValues: ['#33342f', '#8d8a83', '#39485e'], sizes: ['30', '32', '34', '36', '38'], fit: 'Tailored', fabric: 'Stretch Cotton Twill', rating: 4.7, reviews: 386, badge: 'Bestseller', description: 'Tailored lines, athleisure bones, hidden comfort waistband.' },
    { id: 'linen-drawstring-trouser', name: 'Linen Drawstring Trouser', category: 'Trousers', collection: 'Linen Edit', occasion: ['Weekend', 'Travel'], price: 2099, mrp: 2599, colors: ['Ivory', 'Olive'], colorValues: ['#efe7d8', '#6b6f4e'], sizes: ['30', '32', '34', '36', '38'], fit: 'Relaxed', fabric: 'Pure Linen', rating: 4.5, reviews: 167, description: 'Dresses like tailoring, feels like a holiday.' },
    { id: 'pleated-formal-trouser', name: 'Single-Pleat Formal Trouser', category: 'Trousers', collection: 'Premium Collection', occasion: ['Work', 'Festive'], price: 2799, mrp: 3399, colors: ['Deep Black', 'Stone Grey'], colorValues: ['#1c1b19', '#8d8a83'], sizes: ['30', '32', '34', '36', '38'], fit: 'Tailored', fabric: 'Wool-Blend Suiting', rating: 4.6, reviews: 112, badge: 'New', description: 'A single forward pleat with a quietly modern drape.' },
    { id: 'straight-fit-jeans', name: 'Straight Fit Jeans', category: 'Jeans', collection: 'Essential Collection', occasion: ['Weekend'], price: 2499, mrp: 2999, colors: ['Mid Indigo', 'Deep Black'], colorValues: ['#46586e', '#1c1b19'], sizes: ['30', '32', '34', '36', '38'], fit: 'Straight', fabric: 'Comfort Denim', rating: 4.6, reviews: 298, description: 'The five-pocket standard, upgraded with two percent stretch.' },
    { id: 'slim-tapered-jeans', name: 'Slim Tapered Jeans', category: 'Jeans', collection: 'Weekend Collection', occasion: ['Weekend', 'Evening'], price: 2699, mrp: 3299, colors: ['Mid Indigo', 'Charcoal'], colorValues: ['#46586e', '#33342f'], sizes: ['30', '32', '34', '36', '38'], fit: 'Slim', fabric: 'Stretch Denim', rating: 4.5, reviews: 241, description: 'Clean through the thigh, tapered to the ankle.' },
    { id: 'relaxed-ecru-jeans', name: 'Relaxed Ecru Jeans', category: 'Jeans', collection: 'Linen Edit', occasion: ['Weekend', 'Travel'], price: 2599, mrp: 3099, colors: ['Ecru'], colorValues: ['#e6ddc9'], sizes: ['30', '32', '34', '36', '38'], fit: 'Relaxed', fabric: 'Rigid Cotton Denim', rating: 4.4, reviews: 78, badge: 'New', description: 'Warm-weather denim in undyed ecru.' },
    { id: 'cotton-chino-short', name: 'Cotton Chino Short', category: 'Shorts', collection: 'Essential Collection', occasion: ['Weekend'], price: 1499, mrp: 1899, colors: ['Sand', 'Olive', 'Muted Navy'], colorValues: ['#cbb391', '#6b6f4e', '#39485e'], sizes: ['30', '32', '34', '36', '38'], fit: 'Regular', fabric: 'Garment-Dyed Cotton', rating: 4.5, reviews: 156, description: 'A 7-inch chino short in garment-dyed cotton.' },
    { id: 'lounge-short', name: 'Terry Lounge Short', category: 'Shorts', collection: 'Weekend Collection', occasion: ['Weekend'], price: 1299, mrp: 1699, colors: ['Stone Grey', 'Charcoal'], colorValues: ['#8d8a83', '#33342f'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], fit: 'Relaxed', fabric: 'Loopback Terry', rating: 4.6, reviews: 132, description: 'Hotel-towel softness, cut to be seen in.' },
    { id: 'linen-blouson-jacket', name: 'Linen-Blend Blouson', category: 'Jackets', collection: 'Linen Edit', occasion: ['Evening', 'Travel'], price: 3999, mrp: 4999, colors: ['Stone Grey', 'Olive'], colorValues: ['#8d8a83', '#6b6f4e'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], fit: 'Regular', fabric: 'Linen-Cotton Blend', rating: 4.7, reviews: 91, badge: 'Premium', description: 'The lightest way to finish an outfit.' },
    { id: 'quilted-travel-jacket', name: 'Quilted Travel Jacket', category: 'Jackets', collection: 'Travel', occasion: ['Travel', 'Work'], price: 4499, mrp: 5499, colors: ['Dark Brown', 'Deep Black'], colorValues: ['#4a3a2e', '#1c1b19'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], fit: 'Regular', fabric: 'Recycled Quilted Nylon', rating: 4.8, reviews: 118, badge: 'Premium', description: 'Packable warmth with hidden travel pockets.' },
    { id: 'wool-blend-blazer', name: 'Unstructured Wool Blazer', category: 'Jackets', collection: 'Premium Collection', occasion: ['Work', 'Festive', 'Evening'], price: 5999, mrp: 7499, colors: ['Charcoal', 'Muted Navy'], colorValues: ['#33342f', '#39485e'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], fit: 'Tailored', fabric: 'Wool-Blend Twill', rating: 4.9, reviews: 74, badge: 'Premium', description: 'Shoulder-soft tailoring for offices without ties.' },
    { id: 'knit-overshirt', name: 'Textured Knit Overshirt', category: 'Jackets', collection: 'Weekend Collection', occasion: ['Weekend', 'Evening'], price: 3199, mrp: 3799, colors: ['Sand', 'Burgundy'], colorValues: ['#cbb391', '#5c2530'], sizes: ['S', 'M', 'L', 'XL', 'XXL'], fit: 'Regular', fabric: 'Textured Cotton Knit', rating: 4.5, reviews: 87, description: 'The third piece, perfected.' }
  ];

  var FALLBACK_CONFIG = {
    brand: 'PL Mens Wear',
    promoBar: { messages: ['FREE SHIPPING ABOVE ₹1999', '7-DAY EASY RETURNS', 'NEW SEASON — NOW LIVE'] },
    trendingSearches: ['Linen Shirts', 'Polos', 'Trousers', 'New Arrivals', 'Best Sellers'],
    occasions: [
      { name: 'Work', slug: 'work', image: 'assets/images/occasions/occasion-work.svg', description: 'Sharp shirting and tailored comfort for the nine-to-nine.' },
      { name: 'Weekend', slug: 'weekend', image: 'assets/images/occasions/occasion-weekend.svg', description: 'Easy pieces that still look considered.' },
      { name: 'Travel', slug: 'travel', image: 'assets/images/occasions/occasion-travel.svg', description: 'Wrinkle-proof fabrics for the long way there.' },
      { name: 'Festive', slug: 'festive', image: 'assets/images/occasions/occasion-festive.svg', description: 'Texture and quiet sheen for the season’s evenings.' },
      { name: 'Evening', slug: 'evening', image: 'assets/images/occasions/occasion-evening.svg', description: 'Dress for dinner without dressing up too much.' }
    ],
    collections: [
      { name: 'The Linen Edit', slug: 'linen', image: 'assets/images/collections/collection-linen.svg', description: 'Lightweight textures and effortless silhouettes designed for warm days.', story: 'Linen that is spun for breathability, cut for movement, and finished to feel broken-in from the first wear.' },
      { name: 'Essential Collection', slug: 'essentials', image: 'assets/images/collections/collection-essentials.svg', description: 'The core wardrobe, perfected one piece at a time.', story: 'Every essential is wear-tested for months before it earns a place in the line.' },
      { name: 'Premium Collection', slug: 'premium', image: 'assets/images/collections/collection-premium.svg', description: 'Fine merino, wool suiting and considered finishing.', story: 'Fewer, better pieces — made with premium yarns and quieter details.' },
      { name: 'Weekend Collection', slug: 'weekend', image: 'assets/images/collections/collection-weekend.svg', description: 'Relaxed fits for the days that belong to you.', story: 'Comfort-first fabrics that still photograph like tailoring.' },
      { name: 'Festive Edit', slug: 'festive', image: 'assets/images/collections/collection-festive.svg', description: 'Celebration-ready textures in a warm, festive palette.', story: 'Designed for the season’s long evenings and family photographs.' },
      { name: 'Travel', slug: 'travel', image: 'assets/images/collections/collection-travel.svg', description: 'Wrinkle-resistant, packable pieces built for movement.', story: 'Tested on red-eye flights and long drives before it reaches the rack.' }
    ]
  };

  var state = { products: null, config: null, pending: [] };

  /* Root-relative base: pages inside /pages/ need to step up one level */
  var BASE = window.location.pathname.indexOf('/pages/') !== -1 ? '../' : '';

  function ready(fn) {
    if (state.products && state.config) { fn(); return; }
    state.pending.push(fn);
    if (state.pending.length === 1) { loadAll(); }
  }

  function loadAll() {
    var remaining = 2;
    function done() {
      remaining -= 1;
      if (remaining === 0) {
        var fns = state.pending.slice();
        state.pending = [];
        fns.forEach(function (fn) { fn(); });
      }
    }
    fetchJSON(BASE + 'data/products.json', function (data) { state.products = data; done(); });
    fetchJSON(BASE + 'data/site-config.json', function (data) { state.config = data; done(); });
  }

  function fetchJSON(url, cb) {
    if (window.fetch) {
      fetch(url).then(function (r) { if (!r.ok) { throw new Error(r.status); } return r.json(); })
        .then(function (data) { cb(data); })
        .catch(function () { cb(null); });
    } else {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onload = function () { cb(xhr.status === 200 ? parse(xhr.responseText) : null); };
      xhr.onerror = function () { cb(null); };
      xhr.send();
    }
  }

  function parse(text) { try { return JSON.parse(text); } catch (e) { return null; } }

  /* ---------- Public helpers ---------- */

  function getProducts() { return (state.products && state.products.products) || FALLBACK_PRODUCTS; }

  function getConfig() { return (state.config && state.config.brand) ? state.config : FALLBACK_CONFIG; }

  function getProductById(id) {
    var list = getProducts();
    for (var i = 0; i < list.length; i++) { if (list[i].id === id) { return list[i]; } }
    return null;
  }

  function formatPrice(value) {
    return '₹' + Number(value).toLocaleString('en-IN');
  }

  function discountPercent(p) {
    return Math.round(((p.mrp - p.price) / p.mrp) * 100);
  }

  function productImage(id, n, lifestyle) {
    return BASE + 'assets/images/products/' + id + '-' + (lifestyle ? 'b' : 'a') + '.svg';
  }

  function base() { return BASE; }

  window.PLMW = {
    ready: ready,
    getProducts: getProducts,
    getConfig: getConfig,
    getProductById: getProductById,
    formatPrice: formatPrice,
    discountPercent: discountPercent,
    productImage: productImage,
    base: base
  };
})(window);
