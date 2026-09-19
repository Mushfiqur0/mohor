// ==========================================================================
// MOHOR CLOTHINGS — products.js
// Static fallback product catalog & recommendation engine helpers.
// Used only when Firestore is empty/unreachable. Keep structure compatible
// with documents created from the Admin dashboard.
// ==========================================================================

window.productsData = [
  {
    id: "sample-1",
    title: { en: "Sample Three-Piece Set", bn: "নমুনা থ্রি-পিস" },
    category: "three-piece",
    regularPrice: 2200,
    salePrice: 1850,
    price: 1850,
    onSale: true,
    images: ["assets/image-placeholder.svg", "assets/banner-800.webp"],
    colors: ["Maroon", "Olive"],
    sizes: ["S", "M", "L"],
    sizeQuantities: { S: 2, M: 4, L: 5 },
    sizeMeasurements: { M: { en: "Bust: 36in, Waist: 30in", bn: "বুক: 36in, কোমর: 30in" } },
    description: { en: "A sample fallback product used when Firestore is unavailable.", bn: "ফায়ারস্টোর অনুপলভ্য হলে ব্যবহারের জন্য নমুনা পণ্য।" },
    details: ["Hand-finished embroidery", "Machine-wash gentle"]
  },
  {
    id: "sample-2",
    title: { en: "Luxury Kurti Collection", bn: "লাক্সারি কুর্তি কালেকশন" },
    category: "kurti",
    regularPrice: 1500,
    salePrice: 1250,
    price: 1250,
    onSale: true,
    images: ["assets/image-placeholder.svg"],
    colors: ["Navy", "Blush Pink"],
    sizes: ["M", "L", "XL"],
    sizeQuantities: { M: 3, L: 5, XL: 0 },
    sizeMeasurements: { L: { en: "Bust: 38in, Waist: 32in", bn: "বুক: 38in, কোমর: 32in" } },
    description: { en: "Elegant kurti crafted for comfort and daily luxury.", bn: "দৈনন্দিন মার্জিত লুকের জন্য বিশেষ ভাবে তৈরি কুর্তি।" },
    details: ["Pure cotton weave", "Handicraft detailing"]
  }
];

// Ensure fallback product IDs are normalized to strings
if (Array.isArray(window.productsData)) {
    window.productsData.forEach(p => p.id = String(p.id));
}

/**
 * Related Products Recommendation Generator
 * Smart Category Matching: Primary-sorts items in the same category.
 * Dynamic Fallback Logic: Backfills remaining slots with top items from other categories.
 */
window.getRelatedProducts = function(currentProduct, limit = 4) {
    if (!currentProduct) return [];
    
    const catalog = (Array.isArray(window.firestoreProducts) && window.firestoreProducts.length > 0)
        ? window.firestoreProducts
        : (window.productsData || []);

    if (!Array.isArray(catalog) || catalog.length === 0) return [];

    const currentId = String(currentProduct.id);
    const currentCat = currentProduct.category;

    // Filter out the current item
    const available = catalog.filter(p => String(p.id) !== currentId);

    // Primary sort: Same category items
    const sameCategoryItems = available.filter(p => p.category === currentCat);

    // Secondary sort: Fallback items from other categories
    const otherCategoryItems = available.filter(p => p.category !== currentCat);

    // Combine: Same category first, then fill remaining limit with fallback
    return [...sameCategoryItems, ...otherCategoryItems].slice(0, limit);
};

/**
 * Render Related Products grid cards into a target container
 */
window.renderRelatedProducts = function(currentProduct, targetContainerId = 'relatedProductsGrid') {
    const container = document.getElementById(targetContainerId);
    if (!container) return;

    const items = window.getRelatedProducts(currentProduct, 4);
    if (items.length === 0) {
        const sec = container.closest('.related-products-section');
        if (sec) sec.style.display = 'none';
        return;
    }

    const lang = window.currentLang || 'en';
    container.innerHTML = items.map(prod => {
        const titleStr = typeof prod.title === 'string' ? prod.title : (prod.title?.[lang] || prod.title?.en || '');
        const images = (prod.images && prod.images.length > 0) ? prod.images : ['assets/image-placeholder.svg'];
        const regPrice = prod.originalPrice || prod.regularPrice || prod.price;
        const salePrice = (prod.price && Number(prod.price) < Number(regPrice)) ? prod.price : (prod.salePrice || null);
        const isSale = salePrice && Number(salePrice) < Number(regPrice);

        let priceMarkup = `৳ ${regPrice}`;
        let badgeMarkup = '';

        if (isSale) {
            const discountPct = Math.round(((regPrice - salePrice) / regPrice) * 100);
            priceMarkup = `<span class="price-original">৳ ${regPrice}</span><span class="price-sale">৳ ${salePrice}</span>`;
            badgeMarkup = `<span class="sale-badge">-${discountPct}% OFF</span>`;
        }

        return `
            <div class="product-card" data-id="${prod.id}">
                <a href="/product/?id=${prod.id}" class="card-img-link" aria-label="${titleStr}">
                    <div class="card-media">
                        <img src="${images[0]}" alt="${titleStr}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='assets/image-placeholder.svg';">
                        ${badgeMarkup}
                        <span class="card-cat">${(prod.category || '').replace('-', ' ')}</span>
                    </div>
                </a>
                <div class="card-body">
                    <h3 class="card-title"><a href="/product/?id=${prod.id}">${titleStr}</a></h3>
                    <div class="card-price">${priceMarkup}</div>
                    <a href="/product/?id=${prod.id}" class="card-cta">VIEW DETAILS</a>
                </div>
            </div>
        `;
    }).join('');
};
