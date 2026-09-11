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
    images: ["assets/image-placeholder.svg", "assets/banner-800.jpg"],
    colors: ["Maroon", "Olive"],
    sizes: ["S", "M", "L"],
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
    sizeMeasurements: { L: { en: "Bust: 38in, Waist: 32in", bn: "বুক: 38in, কোমর: 32in" } },
    description: { en: "Elegant kurti crafted for comfort and daily luxury.", bn: "দৈনন্দিন মার্জিত লুকের জন্য বিশেষ ভাবে তৈরি কুর্তি।" },
    details: ["Pure cotton weave", "Handicraft detailing"]
  }
];

window.productsData.forEach((product) => { product.id = String(product.id); });

window.getRelatedProducts = function(currentProduct, limit = 4) {
    if (!currentProduct) return [];
    const catalog = (Array.isArray(window.firestoreProducts) && window.firestoreProducts.length > 0)
        ? window.firestoreProducts
        : window.productsData;
    if (!Array.isArray(catalog) || catalog.length === 0) return [];

    const currentId = String(currentProduct.id);
    const available = catalog.filter((product) => String(product.id) !== currentId);
    return [
        ...available.filter((product) => product.category === currentProduct.category),
        ...available.filter((product) => product.category !== currentProduct.category)
    ].slice(0, limit);
};

window.renderRelatedProducts = function(currentProduct, targetContainerId = 'relatedProductsGrid') {
    const container = document.getElementById(targetContainerId);
    if (!container) return;

    const items = window.getRelatedProducts(currentProduct);
    if (items.length === 0) {
        const section = container.closest('.related-products-section');
        if (section) section.style.display = 'none';
        return;
    }

    const lang = window.currentLang || 'en';
    container.innerHTML = items.map((product) => {
        const title = typeof product.title === 'string' ? product.title : (product.title?.[lang] || product.title?.en || '');
        const image = product.images?.[0] || 'assets/image-placeholder.svg';
        return `<div class="product-card" data-id="${String(product.id)}">
            <a href="product.html?id=${encodeURIComponent(product.id)}" class="card-img-link" aria-label="${title}">
                <div class="card-media"><img src="${image}" alt="${title}" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='assets/image-placeholder.svg';"><span class="card-cat">${(product.category || '').replace('-', ' ')}</span></div>
            </a>
            <div class="card-body"><h3 class="card-title"><a href="product.html?id=${encodeURIComponent(product.id)}">${title}</a></h3>
            <div class="card-price">৳ ${Number(product.price) || 0}</div>
            <a href="product.html?id=${encodeURIComponent(product.id)}" class="card-cta">VIEW DETAILS</a></div>
        </div>`;
    }).join('');
};
