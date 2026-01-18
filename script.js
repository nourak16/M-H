
/* --- Configuration --- */
const OWNER_PHONE = "15550123456"; 
const DELIVERY_FEES = {
    "Beirut": 5.00,
    "Mount Lebanon": 6.00,
    "North": 8.00,
    "South": 8.00,
    "Bekaa": 8.00
};

const ROUTES = {
    HOME: 'home',
    ABOUT: 'about'
};

const ICONS = {
    cartOutline: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`,
    cartFilled: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 2L3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6L18 2H6Z" fill="currentColor"/><path d="M16 10A4 4 0 0 1 8 10" stroke="var(--bg-body)" stroke-width="2" stroke-linecap="round"/></svg>`,
    heartOutline: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`,
    heartFilled: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor"></path></svg>`
};

/* --- State Variables --- */
let cart = [];
let favorites = [];
let activeCategory = 'All';
let searchQuery = '';
let currentSort = 'default';
let previousQty = 0; 
let toastTimeout;

let modalState = {
    id: null,
    size: 'M',
    qty: 1
};

// Elements cache
let els = {};

/* --- Load Persistent State --- */
try {
    cart = JSON.parse(localStorage.getItem('mt_cart')) || [];
    favorites = JSON.parse(localStorage.getItem('mt_favorites')) || [];
} catch(e) {
    console.warn("Storage not available");
}

/* --- Initialization Guard --- */
if (window.APP_INITIALIZED) {
    console.warn("App already initialized");
} else {
    window.APP_INITIALIZED = true;
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }
}

/* --- Scroll Animation Observer --- */
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            entry.target.classList.add('is-visible');
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

/* --- Main Initialization Function --- */
function initApp() {
    console.log("M&H App Initializing...");
    
    // Cache DOM elements
    els = {
        grid: document.getElementById('product-grid'),
        items: document.getElementById('cart-items'),
        headerCount: document.getElementById('header-count'),
        cartIconBtn: document.getElementById('cart-icon-btn'),
        favIconBtn: document.getElementById('fav-icon-btn'),
        cartTotal: document.getElementById('cart-total'),
        whatsappBtn: document.getElementById('whatsapp-btn'),
        header: document.getElementById('header'),
        modal: document.getElementById('product-modal'),
        modalImg: document.getElementById('modal-img'),
        modalTitle: document.getElementById('modal-title'),
        modalPrice: document.getElementById('modal-price'),
        modalDesc: document.getElementById('modal-desc'),
        modalCat: document.getElementById('modal-category'),
        modalSizes: document.getElementById('modal-sizes'),
        modalQtyVal: document.getElementById('modal-qty-val'),
        navLinks: document.querySelectorAll('.nav-link'),
        collectionTitle: document.getElementById('collection-title'),
        checkoutModal: document.getElementById('checkout-modal'),
        checkoutTotalDisplay: document.getElementById('checkout-total-display'),
        checkoutDeliveryDisplay: document.getElementById('checkout-delivery-display'),
        checkoutArea: document.getElementById('cust-area'),
        themeToggle: document.querySelector('.theme-toggle'),
        navWrapper: document.getElementById('nav-wrapper'),
        productsDropdownLi: document.getElementById('products-dropdown-li'),
        searchOverlay: document.getElementById('search-overlay'),
        searchInput: document.getElementById('search-input'),
        productCount: document.getElementById('product-count'),
        toast: document.getElementById('toast'),
        toastMessage: document.getElementById('toast-message'),
        homeView: document.getElementById('home-view'),
        aboutView: document.getElementById('about-view'),
        navHome: document.getElementById('nav-home'),
        navAbout: document.getElementById('nav-about'),
        favoritesModal: document.getElementById('favorites-modal'),
        favoritesGrid: document.getElementById('favorites-grid'),
        favoritesCountBubble: document.getElementById('favorites-count-bubble'),
        mcContent: document.getElementById('mc-content'),
        chipBtns: document.querySelectorAll('.category-chip'),
        recGrid: document.getElementById('rec-grid')
    };

    // Theme Init
    try {
        const savedTheme = localStorage.getItem('mt_theme');
        if (savedTheme) {
            document.body.setAttribute('data-theme', savedTheme);
            updateThemeIcon(savedTheme);
        }
    } catch(e) {}
    
    // Initialize Router
    initRouter();

    // Check for Deep Link (Hash)
    setTimeout(() => {
        handleHashChange();
    }, 600);
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);

    // Initial Render Skeleton
    if (els.grid) renderSkeleton();
    
    // Simulate data fetching and render
    setTimeout(() => {
        renderGrid();
        updateUI();
        
        previousQty = cart.reduce((sum, i) => sum + i.quantity, 0);

        document.querySelectorAll('.reveal-on-scroll').forEach(el => scrollObserver.observe(el));
    }, 600);
    
    window.addEventListener('scroll', () => {
        const isSticky = window.scrollY > 50;
        if(els.header) els.header.classList.toggle('sticky', isSticky);
    });
}

function renderSkeleton() {
    if(!els.grid) return;
    const skeletonHTML = `
        <div class="skeleton-card">
            <div class="skeleton sk-img"></div>
            <div class="skeleton sk-text"></div>
            <div class="skeleton sk-text-sm"></div>
        </div>
    `.repeat(6);
    els.grid.innerHTML = `<div class="skeleton-grid">${skeletonHTML}</div>`;
}

/* --- Deep Linking --- */
function handleHashChange() {
    const hash = window.location.hash;
    if (hash.startsWith('#product-')) {
        const id = parseInt(hash.replace('#product-', ''));
        if (!isNaN(id)) {
            openModal(id, true); // true = allow hash update (already set), just open logic
        }
    } else if (hash === '') {
        closeModal(null, false);
    }
}

/* --- Navigation & Router Functions --- */

function toggleMobileMenu() {
    if(els.navWrapper) els.navWrapper.classList.toggle('active');
}

function closeMobileMenu() {
    if(els.navWrapper) els.navWrapper.classList.remove('active');
}

function toggleMobileDropdown(e) {
    if (window.innerWidth <= 1024) {
        if(els.productsDropdownLi) els.productsDropdownLi.classList.toggle('active');
    }
}

function initRouter() {
    window.addEventListener('popstate', (event) => {
        const state = event.state;
        if (state && state.view) {
            renderView(state.view, false);
        } else {
            handleInitialRoute();
        }
    });
    handleInitialRoute();
}

function handleInitialRoute() {
    const path = window.location.pathname;
    if (path.endsWith('/about')) {
        renderView(ROUTES.ABOUT, false, true);
    } else {
        renderView(ROUTES.HOME, false, true);
    }
}

function renderView(view, pushState = true, isInitial = false, skipScroll = false) {
    if (pushState) {
        try {
            if (view === ROUTES.HOME) {
                history.pushState({ view: ROUTES.HOME }, '', '/');
            } else if (view === ROUTES.ABOUT) {
                history.pushState({ view: ROUTES.ABOUT }, '', '/about');
            }
        } catch (e) {
            console.log("Navigation updated (History API restricted)");
        }
    }

    if (view === ROUTES.HOME) {
        if(els.homeView) els.homeView.style.display = 'block';
        if(els.aboutView) els.aboutView.style.display = 'none';
        if(els.navHome) els.navHome.classList.add('active');
        if(els.navAbout) els.navAbout.classList.remove('active');
        if (!isInitial && !skipScroll) window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === ROUTES.ABOUT) {
        if(els.homeView) els.homeView.style.display = 'none';
        if(els.aboutView) els.aboutView.style.display = 'block';
        if(els.navHome) els.navHome.classList.remove('active');
        if(els.navAbout) els.navAbout.classList.add('active');
        if (!isInitial) window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    closeMobileMenu();
    
    // Refresh animations
    setTimeout(() => {
        document.querySelectorAll('.reveal-on-scroll').forEach(el => scrollObserver.observe(el));
    }, 50);
}

// Exposed Global Wrappers
window.showHome = function(skipScroll = false) { renderView(ROUTES.HOME, true, false, skipScroll); }
window.showAbout = function() { renderView(ROUTES.ABOUT, true); }
window.goHome = function() {
    filterProducts('All');
    showHome();
}

/* --- Toast --- */
function showToast(message) {
    if(!els.toast || !els.toastMessage) return;
    els.toastMessage.innerText = message;
    els.toast.classList.add('show');
    if(toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        els.toast.classList.remove('show');
    }, 3000);
}

/* --- Theme --- */
function toggleTheme() {
    const current = document.body.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', next);
    localStorage.setItem('mt_theme', next);
    updateThemeIcon(next);
}

function updateThemeIcon(theme) {
    const btn = document.querySelector('.theme-toggle');
    if (!btn) return;
    if (theme === 'dark') {
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
    } else {
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    }
}

/* --- Misc Helpers --- */
function scrollToFooter() {
    const footer = document.getElementById('footer');
    if (footer) footer.scrollIntoView({ behavior: 'smooth' });
}

window.scrollToGrid = function() {
    if(els.homeView && els.homeView.style.display === 'none') {
        showHome(true); 
        setTimeout(() => {
            const section = document.getElementById('shop-section');
            if(section) section.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    } else {
        const section = document.getElementById('shop-section');
        if(section) section.scrollIntoView({ behavior: 'smooth' });
    }
}

/* --- Search --- */
function toggleSearch() {
    if(els.searchOverlay) {
        els.searchOverlay.classList.toggle('active');
        if (els.searchOverlay.classList.contains('active')) {
            setTimeout(() => {
                if(els.searchInput) els.searchInput.focus();
            }, 100);
        }
    }
}

function handleSearch(query) {
    searchQuery = query.toLowerCase().trim();
    if(els.grid) {
        if(els.homeView && els.homeView.style.display === 'none') {
            showHome();
        }
        renderGrid();
    }
    if(window.scrollY < 200 && searchQuery.length > 0) {
        window.scrollToGrid();
    }
}

/* --- Filtering & Sorting --- */
function filterProducts(category) {
    activeCategory = category;
    searchQuery = '';
    if(els.searchInput) els.searchInput.value = '';
    
    if(els.collectionTitle) els.collectionTitle.innerText = category === 'All' ? 'New Arrivals' : category;
    
    // Update active chip state
    if (els.chipBtns) {
        els.chipBtns.forEach(btn => {
            if(btn.textContent.trim() === category) btn.classList.add('active');
            else btn.classList.remove('active');
        });
    }

    if (els.grid) renderSkeleton();
    setTimeout(renderGrid, 400);
}

function handleSort(value) {
    currentSort = value;
    renderGrid();
}

/* --- Rendering --- */
function renderGrid() {
    if(!els.grid) return;
    const productsData = window.PRODUCTS;
    
    if (typeof productsData === 'undefined') {
        renderSkeleton();
        setTimeout(renderGrid, 500);
        return;
    }

    let filtered = productsData.slice();

    if (searchQuery.length > 0) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchQuery) || 
            p.description.toLowerCase().includes(searchQuery) ||
            p.category.toLowerCase().includes(searchQuery)
        );
        if(els.collectionTitle) els.collectionTitle.innerText = `Search results for "${searchQuery}"`;
    } else {
        if(els.collectionTitle) els.collectionTitle.innerText = activeCategory === 'All' ? 'New Arrivals' : activeCategory;
        
        if (activeCategory === 'Sale') {
            filtered = filtered.filter(p => p.originalPrice);
        } else if (activeCategory !== 'All') {
            filtered = filtered.filter(p => p.category === activeCategory);
        }
    }

    if (currentSort === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
    }
    
    if(els.productCount) {
        els.productCount.innerText = `${filtered.length} products`;
    }

    if (filtered.length === 0) {
        els.grid.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <p>No products found matching your criteria.</p>
                <button onclick="filterProducts('All')" class="btn-empty-action">View All Products</button>
            </div>`;
        return;
    }

    els.grid.innerHTML = filtered.map((p, index) => {
        const isFav = favorites.includes(p.id);
        const priceDisplay = p.originalPrice 
            ? `<span class="original-price">$${p.originalPrice.toFixed(2)}</span><span class="sale-price">$${p.price.toFixed(2)}</span>`
            : `<span class="product-price">$${p.price.toFixed(2)}</span>`;
        
        let badgeDisplay = '';
        if(p.originalPrice) {
            const discount = Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100);
            badgeDisplay = `<span class="sale-badge">-${discount}%</span>`;
        }

        // Lazy load images
        return `
        <div class="product-card reveal-on-scroll" onclick="openModal(${p.id})" style="transition-delay: ${index * 0.1}s">
            <div class="product-image-wrapper">
                ${badgeDisplay}
                <img src="${p.image}" alt="${p.name}" class="product-img" id="img-${p.id}" loading="lazy">
                <button class="btn-fav ${isFav ? 'active' : ''}" data-id="${p.id}" onclick="event.stopPropagation(); toggleFavorite(${p.id}, this)">
                    <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </button>
                <button class="quick-add-btn" onclick="event.stopPropagation(); addToCart(${p.id}, 'M', 1, event)">
                    Quick Add (M) - $${p.price}
                </button>
            </div>
            <div class="product-meta">
                <div>
                    <span class="product-name">${p.name}</span>
                    <span class="product-category">${p.category}</span>
                </div>
                <div style="text-align: right;">
                    ${priceDisplay}
                </div>
            </div>
        </div>
    `}).join('');

    document.querySelectorAll('.reveal-on-scroll').forEach(el => scrollObserver.observe(el));
}

function renderCartItems() {
    if(!els.items) return;
    
    if (cart.length === 0) {
        els.items.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
                <p>Your bag is empty</p>
                <button onclick="toggleCart()" class="btn-empty-action">Start Shopping</button>
            </div>`;
        return;
    }

    els.items.innerHTML = cart.map((item, index) => `
        <div class="cart-item" style="animation-delay: ${index * 0.05}s">
            <img src="${item.image}" alt="${item.name}">
            <div class="item-info">
                <h5>${item.name}</h5>
                <span class="item-variant">Size: ${item.size}</span>
                <span class="item-price">$${item.price}</span>
                <div class="qty-controls">
                    <button class="qty-btn" onclick="updateQty(${index}, -1)">−</button>
                    <span class="qty-val">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>
                </div>
            </div>
            <button class="remove-item" onclick="removeItem(${index})">Remove</button>
        </div>
    `).join('');
}

/* --- Cart & Modal Logic --- */
function toggleCart(forceOpen = false) {
    const body = document.body;
    if (forceOpen) body.classList.add('cart-open');
    else body.classList.toggle('cart-open');
}

/* --- Fly To Cart Animation --- */
function animateAddToCart(sourceElement) {
    if (!sourceElement) return;

    // Clone the source element
    const clone = sourceElement.cloneNode(true);
    const rect = sourceElement.getBoundingClientRect();
    
    // Style clone to match starting position
    clone.classList.add('fly-item');
    clone.style.left = rect.left + 'px';
    clone.style.top = rect.top + 'px';
    clone.style.width = rect.width + 'px';
    clone.style.height = rect.height + 'px';
    
    document.body.appendChild(clone);

    // Target: Cart Icon
    const target = els.cartIconBtn;
    if (target) {
        const targetRect = target.getBoundingClientRect();
        
        // Trigger reflow
        void clone.offsetWidth;
        
        // Animate
        clone.style.left = (targetRect.left + 10) + 'px';
        clone.style.top = (targetRect.top + 10) + 'px';
        clone.style.width = '20px';
        clone.style.height = '20px';
        clone.style.opacity = '0';
    }

    // Cleanup
    setTimeout(() => {
        if(clone.parentNode) clone.parentNode.removeChild(clone);
    }, 800);
}

function addToCart(id, size, qty, event) {
    if (!window.PRODUCTS) return;
    const product = window.PRODUCTS.find(p => p.id === id);
    const existing = cart.find(i => i.id === id && i.size === size);
    
    if (existing) {
        existing.quantity += qty;
    } else {
        cart.push({ ...product, quantity: qty, size: size });
    }
    
    saveAndUpdate();
    showToast(`Added ${product.name} (${size}) to cart`);

    // Animation trigger
    // Try to find image based on event or ID
    let imgSource = null;
    
    if (event && event.target) {
        // If event came from Quick Add button, look for sibling image-wrapper > img
        const wrapper = event.target.closest('.product-image-wrapper');
        if (wrapper) {
            imgSource = wrapper.querySelector('img');
        }
    } 
    
    // Fallback if added from modal or event structure differs
    if (!imgSource) {
        imgSource = document.getElementById(`img-${id}`);
    }
    // Fallback if modal image is source (when added from modal)
    if (!imgSource && els.modalImg && els.modal.classList.contains('open')) {
        imgSource = els.modalImg;
    }

    if (imgSource) animateAddToCart(imgSource);
}

function updateQty(index, change) {
    const item = cart[index];
    if (!item) return;
    
    item.quantity += change;
    if (item.quantity <= 0) cart.splice(index, 1);
    saveAndUpdate();
}

function removeItem(index) {
    cart.splice(index, 1);
    saveAndUpdate();
}

function saveAndUpdate() {
    try { localStorage.setItem('mt_cart', JSON.stringify(cart)); } catch(e){}
    updateUI();
}

function updateUI() {
    renderCartItems();
    
    const totalQty = cart.reduce((sum, i) => sum + i.quantity, 0);
    const totalVal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const fmtTotal = '$' + totalVal.toFixed(2);

    // Animation trigger on counter
    if (totalQty > previousQty) {
        if(els.headerCount) {
            els.headerCount.classList.remove('cart-animating');
            void els.headerCount.offsetWidth;
            els.headerCount.classList.add('cart-animating');
        }
    }
    previousQty = totalQty;

    // Update Cart Counter Badge
    if(els.headerCount) {
        els.headerCount.textContent = totalQty;
        if (totalQty > 0) els.headerCount.classList.add('active');
        else els.headerCount.classList.remove('active');
    }

    // Dynamic Icon States: Cart
    if (els.cartIconBtn) {
        const svg = els.cartIconBtn.querySelector('svg');
        if (svg) {
            const newIcon = totalQty > 0 ? ICONS.cartFilled : ICONS.cartOutline;
            // Create a temp element to parse string
            const temp = document.createElement('div');
            temp.innerHTML = newIcon;
            if (temp.firstChild) svg.replaceWith(temp.firstChild);
        }
    }

    // Dynamic Icon States: Favorites
    if (els.favIconBtn) {
        const svg = els.favIconBtn.querySelector('svg');
        if (svg) {
            const newIcon = favorites.length > 0 ? ICONS.heartFilled : ICONS.heartOutline;
            const temp = document.createElement('div');
            temp.innerHTML = newIcon;
            if (temp.firstChild) svg.replaceWith(temp.firstChild);
        }
    }

    if(els.cartTotal) els.cartTotal.textContent = fmtTotal;
    
    if(els.whatsappBtn) els.whatsappBtn.disabled = cart.length === 0;

    // Update Favorites Badge (Red Dot)
    if(els.favoritesCountBubble) {
        const favCount = favorites.length;
        // Dot style: remove text content, just toggle active
        els.favoritesCountBubble.textContent = ''; 
        if(favCount > 0) els.favoritesCountBubble.classList.add('active');
        else els.favoritesCountBubble.classList.remove('active');
    }

    // Update Mini Cart Preview
    if (els.mcContent) {
        if (cart.length === 0) {
            els.mcContent.innerHTML = `<p style="color: var(--secondary); font-size: 0.9rem;">Your bag is empty.</p>`;
        } else {
            // Show last added item (last in array)
            const lastItem = cart[cart.length - 1];
            els.mcContent.innerHTML = `
                <div class="mc-item">
                    <img src="${lastItem.image}" alt="">
                    <div class="mc-info">
                        <h6>${lastItem.name}</h6>
                        <span>${lastItem.quantity} x $${lastItem.price}</span>
                    </div>
                </div>
                <div class="mc-total">
                    <span>Subtotal:</span>
                    <span>${fmtTotal}</span>
                </div>
                <button class="btn-mc-checkout" onclick="toggleCart(true)">Checkout</button>
            `;
        }
    }
}

/* --- Favorites --- */
function toggleFavorite(id, btn) {
    const index = favorites.indexOf(id);
    let isFav = false;

    if (index === -1) {
        favorites.push(id);
        isFav = true;
        showToast("Added to favorites");
    } else {
        favorites.splice(index, 1);
        isFav = false;
        showToast("Removed from favorites");
    }
    
    try { localStorage.setItem('mt_favorites', JSON.stringify(favorites)); } catch(e){}
    
    const buttons = document.querySelectorAll(`.btn-fav[data-id="${id}"]`);
    buttons.forEach(b => {
        if(isFav) b.classList.add('active');
        else b.classList.remove('active');
    });
    
    updateUI();
    
    if (els.favoritesModal && els.favoritesModal.classList.contains('open')) {
        renderFavoritesList();
    }
}

function openFavoritesModal() {
    if(els.favoritesModal) {
        renderFavoritesList();
        els.favoritesModal.classList.add('open');
        document.body.style.overflow = 'hidden'; 
    }
}

function closeFavoritesModal(e) {
    if (e && e.target !== els.favoritesModal && !e.target.classList.contains('modal-close')) return;
    if(els.favoritesModal) els.favoritesModal.classList.remove('open');
    document.body.style.overflow = '';
}

function renderFavoritesList() {
    if (!els.favoritesGrid) return;
    
    if (favorites.length === 0) {
        els.favoritesGrid.innerHTML = `
            <div class="empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <p>No favorites yet</p>
                <button onclick="closeFavoritesModal()" class="btn-empty-action">Discover Items</button>
            </div>`;
        return;
    }

    const productsData = window.PRODUCTS;
    if (!productsData) return;

    const favProducts = productsData.filter(p => favorites.includes(p.id));

    els.favoritesGrid.innerHTML = favProducts.map(p => `
        <div class="fav-item">
            <img src="${p.image}" alt="${p.name}" onclick="openModal(${p.id})">
            <h5>${p.name}</h5>
            <span class="price">$${p.price}</span>
            <div class="fav-actions">
                <button class="btn-fav-add" onclick="addToCart(${p.id}, 'M', 1, event)">Add to Cart</button>
                <button class="btn-fav-remove" onclick="toggleFavorite(${p.id})">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        </div>
    `).join('');
}

/* --- Product Modal --- */
function openModal(id, skipPushState = false) {
    if (!window.PRODUCTS) return;
    const product = window.PRODUCTS.find(p => p.id === id);
    if (!product) return;

    if (modalState.id === id) {
    } else {
        modalState = { id: id, size: 'M', qty: 1 };
    }

    if(els.modalImg) els.modalImg.src = product.image;
    if(els.modalTitle) els.modalTitle.textContent = product.name;
    if(els.modalCat) els.modalCat.textContent = product.category;
    
    if(product.originalPrice) {
        els.modalPrice.innerHTML = `<span class="original-price" style="font-size: 1.1rem;">$${product.originalPrice.toFixed(2)}</span> <span class="sale-price">$${product.price.toFixed(2)}</span>`;
    } else {
        els.modalPrice.innerHTML = `<span class="product-price">$${product.price.toFixed(2)}</span>`;
    }
    
    if(els.modalDesc) els.modalDesc.textContent = product.description;

    renderModalSizes();
    if(els.modalQtyVal) els.modalQtyVal.textContent = modalState.qty;

    // Render recommendations
    renderRecommendations(product);

    if(els.modal) {
        els.modal.classList.add('open');
        document.body.style.overflow = 'hidden'; 
    }

    // Update URL Hash if needed
    if (!skipPushState) {
        history.pushState(null, null, `#product-${id}`);
    }
}

function renderRecommendations(currentProduct) {
    if(!els.recGrid) return;
    const allProducts = window.PRODUCTS || [];
    
    // Filter similar category, excluding current
    let similar = allProducts.filter(p => p.category === currentProduct.category && p.id !== currentProduct.id);
    
    // If not enough similar, grab random others
    if (similar.length < 2) {
        const others = allProducts.filter(p => p.id !== currentProduct.id && !similar.includes(p));
        similar = similar.concat(others);
    }
    
    // Shuffle and pick 2
    similar.sort(() => 0.5 - Math.random());
    const picks = similar.slice(0, 2);
    
    els.recGrid.innerHTML = picks.map(p => `
        <div class="rec-card" onclick="openModal(${p.id})">
            <img src="${p.image}" class="rec-img" loading="lazy">
            <span class="rec-name">${p.name}</span>
            <span class="rec-price">$${p.price}</span>
        </div>
    `).join('');
}

function renderModalSizes() {
    const sizes = ['S', 'M', 'L', 'XL'];
    if (els.modalSizes) {
        els.modalSizes.innerHTML = sizes.map(s => `
            <button class="size-btn ${s === modalState.size ? 'selected' : ''}" onclick="selectSize(this, '${s}')">
                ${s}
            </button>
        `).join('');
    }
}

function closeModal(e, updateHistory = true) {
    if (e && e.target !== els.modal && !e.target.classList.contains('modal-close')) return;
    if(els.modal) els.modal.classList.remove('open');
    document.body.style.overflow = '';
    
    if (updateHistory) {
        // Clear hash without reloading
        history.pushState("", document.title, window.location.pathname + window.location.search);
    }
}

function selectSize(btn, size) {
    modalState.size = size;
    renderModalSizes(); 
}

function updateModalQty(change) {
    const newQty = modalState.qty + change;
    if (newQty >= 1) {
        modalState.qty = newQty;
        if(els.modalQtyVal) els.modalQtyVal.textContent = modalState.qty;
    }
}

function addToCartFromModal() {
    if (modalState.id) {
        addToCart(modalState.id, modalState.size, modalState.qty);
        // We do NOT close modal immediately as per usual e-commerce UX (keep user there unless they want to leave)
        // Or we can close it. Let's keep it open but show toast.
        // Actually for mobile bottom sheet it's better to stay or close?
        // Let's close it to encourage checking out? No, let's keep it.
        // The Sticky bar makes it easy to add multiple.
        closeModal({ target: els.modal });
    }
}

window.showSizeGuide = function() {
    alert("Size Guide:\n\nS: Chest 34-36\" / Waist 28-30\"\nM: Chest 38-40\" / Waist 32-34\"\nL: Chest 42-44\" / Waist 36-38\"\nXL: Chest 46-48\" / Waist 40-42\"");
}

/* --- Checkout Modal --- */
function openCheckoutModal() {
    if (cart.length === 0) return;
    
    const form = document.getElementById('checkout-form');
    if(form) form.reset();
    
    const nameEl = document.getElementById('cust-name');
    const phoneEl = document.getElementById('cust-phone');
    const areaEl = document.getElementById('cust-area');
    
    if(nameEl) nameEl.style.borderColor = '';
    if(phoneEl) phoneEl.style.borderColor = '';
    if(areaEl) areaEl.style.borderColor = '';
    
    if(els.checkoutArea) els.checkoutArea.selectedIndex = 0; 
    
    updateCheckoutTotal();
    
    if(els.checkoutModal) els.checkoutModal.classList.add('open');
}

function closeCheckoutModal(e) {
    if (e && e.target !== els.checkoutModal && !e.target.classList.contains('modal-close')) return;
    if(els.checkoutModal) els.checkoutModal.classList.remove('open');
}

function updateCheckoutTotal() {
    if(!els.checkoutArea) return;
    const selectedArea = els.checkoutArea.value;
    const deliveryFee = DELIVERY_FEES[selectedArea] || 0;
    const cartTotal = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    
    if (deliveryFee > 0) {
        if(els.checkoutDeliveryDisplay) els.checkoutDeliveryDisplay.textContent = '$' + deliveryFee.toFixed(2);
    } else {
        if(els.checkoutDeliveryDisplay) els.checkoutDeliveryDisplay.textContent = '--';
    }
    
    const finalTotal = cartTotal + deliveryFee;
    if(els.checkoutTotalDisplay) els.checkoutTotalDisplay.textContent = '$' + finalTotal.toFixed(2);
}

function validateLebanesePhone(phone) {
    let digits = phone.replace(/[^0-9]/g, '');
    if (digits.startsWith('961')) digits = digits.substring(3);
    if (digits.startsWith('0')) digits = digits.substring(1);
    const isValid = (digits.length === 7 || digits.length === 8);
    return { isValid: isValid, clean: digits };
}

function processCheckout() {
    const nameEl = document.getElementById('cust-name');
    const phoneEl = document.getElementById('cust-phone');
    const areaEl = document.getElementById('cust-area');
    
    if(!nameEl || !phoneEl || !areaEl) return;
    
    nameEl.style.borderColor = '';
    phoneEl.style.borderColor = '';
    areaEl.style.borderColor = '';
    
    const name = nameEl.value.trim();
    const rawPhone = phoneEl.value.trim();
    const area = areaEl.value;
    
    let hasError = false;

    if(!name) {
        nameEl.style.borderColor = '#e74c3c';
        hasError = true;
    }
    if(!area) {
        areaEl.style.borderColor = '#e74c3c';
        hasError = true;
    }
    
    const phoneValidation = validateLebanesePhone(rawPhone);
    if (!phoneValidation.isValid) {
        phoneEl.style.borderColor = '#e74c3c';
        showToast("Please enter a valid phone number");
        hasError = true;
    }

    if(hasError) {
        if (!name || !area) showToast("Please fill in all required fields");
        return;
    }

    const deliveryFee = DELIVERY_FEES[area] || 0;

    let msg = "NEW ORDER - M&H\n";
    msg += "-----------------------------\n";
    msg += `Customer: ${name}\n`;
    msg += `Phone: ${rawPhone}\n`;
    msg += `Area: ${area}\n`;
    msg += "-----------------------------\n";
    cart.forEach(i => {
            msg += `${i.quantity}x ${i.name} [${i.size}] — $${(i.price * i.quantity).toFixed(2)}\n`;
    });
    const subtotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
    const total = subtotal + deliveryFee;
    
    msg += "-----------------------------\n";
    msg += `Subtotal: $${subtotal.toFixed(2)}\n`;
    msg += `Delivery: $${deliveryFee.toFixed(2)}\n`;
    msg += `TOTAL: $${total.toFixed(2)}\n`;
    msg += "-----------------------------\n";
    msg += "Please confirm order details.";

    window.open(`https://wa.me/${OWNER_PHONE}?text=${encodeURIComponent(msg)}`, '_blank');
    closeCheckoutModal();
}

/* --- Info Modals --- */
function openPrivacyModal() {
    const modal = document.getElementById('privacy-modal');
    if(modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden'; 
    }
}

function closePrivacyModal(e) {
    const modal = document.getElementById('privacy-modal');
    if (e && e.target !== modal && !e.target.classList.contains('modal-close')) return;
    if(modal) modal.classList.remove('open');
    document.body.style.overflow = '';
}

function openTermsModal() {
    const modal = document.getElementById('terms-modal');
    if(modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden'; 
    }
}

function closeTermsModal(e) {
    const modal = document.getElementById('terms-modal');
    if (e && e.target !== modal && !e.target.classList.contains('modal-close')) return;
    if(modal) modal.classList.remove('open');
    document.body.style.overflow = '';
}

/* --- Attach Globally --- */
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.toggleMobileDropdown = toggleMobileDropdown;
window.initRouter = initRouter;
window.showToast = showToast;
window.toggleTheme = toggleTheme;
window.scrollToFooter = scrollToFooter;
window.scrollToGrid = scrollToGrid;
window.toggleSearch = toggleSearch;
window.handleSearch = handleSearch;
window.filterProducts = filterProducts;
window.handleSort = handleSort;
window.toggleCart = toggleCart;
window.addToCart = addToCart;
window.updateQty = updateQty;
window.removeItem = removeItem;
window.toggleFavorite = toggleFavorite;
window.openFavoritesModal = openFavoritesModal;
window.closeFavoritesModal = closeFavoritesModal;
window.openModal = openModal;
window.closeModal = closeModal;
window.selectSize = selectSize;
window.updateModalQty = updateModalQty;
window.addToCartFromModal = addToCartFromModal;
window.openCheckoutModal = openCheckoutModal;
window.closeCheckoutModal = closeCheckoutModal;
window.updateCheckoutTotal = updateCheckoutTotal;
window.processCheckout = processCheckout;
window.openPrivacyModal = openPrivacyModal;
window.closePrivacyModal = closePrivacyModal;
window.openTermsModal = openTermsModal;
window.closeTermsModal = closeTermsModal;
