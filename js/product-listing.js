// Product Listing JavaScript - Handle product listing, filtering, and search
document.addEventListener('DOMContentLoaded', async () => {
    const productGrid = document.getElementById('product-grid');
    const searchInput = document.getElementById('search-input');
    const categoryFilter = document.getElementById('category-filter');
    const sortSelect = document.getElementById('sort-select');
    const priceRange = document.getElementById('price-range');
    let products = [];
    let filteredProducts = [];

    // Fetch all products
    async function fetchProducts() {
        try {
            const response = await fetch('/products');
            if (!response.ok) throw new Error('Failed to fetch products');
            products = await response.json();
            filteredProducts = [...products];
            await fetchCategories();
            applyFilters();
        } catch (error) {
            console.error('Error fetching products:', error);
            showError('Failed to load products');
        }
    }

    // Fetch categories for filter
    async function fetchCategories() {
        try {
            const response = await fetch('/categories');
            const categories = await response.json();
            populateCategoryFilter(categories);
        } catch (error) {
            console.error('Error fetching categories:', error);
            showError('Failed to load categories');
        }
    }

    // Populate category filter dropdown
    function populateCategoryFilter(categories) {
        categoryFilter.innerHTML = `
            <option value="">All Categories</option>
            ${categories.map(category => `
                <option value="${category.id}">${category.name}</option>
            `).join('')}
        `;
    }

    // Render product grid
    function renderProducts() {
        if (!productGrid) return;

        if (filteredProducts.length === 0) {
            productGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <p>No products found matching your criteria</p>
                </div>
            `;
            return;
        }

        productGrid.innerHTML = filteredProducts.map(product => `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${product.image_url || 'img/placeholder.jpg'}" alt="${product.name}">
                    ${product.original_price ? `
                        <span class="discount-badge">
                            ${calculateDiscount(product.price, product.original_price)}% OFF
                        </span>
                    ` : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${product.name}</h3>
                    <p class="artist-name">By ${product.artist_name}</p>
                    <div class="product-meta">
                        <span class="category">${product.category_name}</span>
                        ${product.rating ? `
                            <div class="rating">
                                ${generateStarRating(product.rating)}
                                <span class="rating-count">(${product.review_count})</span>
                            </div>
                        ` : ''}
                    </div>
                    <div class="price-section">
                        <span class="current-price">$${product.price}</span>
                        ${product.original_price ? `
                            <span class="original-price">$${product.original_price}</span>
                        ` : ''}
                    </div>
                    <div class="product-actions">
                        <button class="view-details" onclick="window.location.href='product-details.html?id=${product.id}'">
                            View Details
                        </button>
                        <button class="quick-add" onclick="quickAddToCart(${product.id})">
                            <i class="fas fa-cart-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Apply all filters and sort
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const categoryId = categoryFilter.value;
        const sortBy = sortSelect.value;
        const maxPrice = parseInt(priceRange.value);

        filteredProducts = products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                                product.description.toLowerCase().includes(searchTerm) ||
                                product.artist_name.toLowerCase().includes(searchTerm);
            const matchesCategory = !categoryId || product.category_id === parseInt(categoryId);
            const matchesPrice = !maxPrice || product.price <= maxPrice;

            return matchesSearch && matchesCategory && matchesPrice;
        });

        // Apply sorting
        switch (sortBy) {
            case 'price-asc':
                filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                filteredProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;
            case 'newest':
                filteredProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
        }

        renderProducts();
    }

    // Quick add to cart
    window.quickAddToCart = async function(productId) {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        try {
            const button = event.target.closest('.quick-add');
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

            const response = await fetch('/cart/items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: 1
                })
            });

            if (response.ok) {
                showSuccess('Added to cart!');
                updateCartCount();
            } else {
                throw new Error('Failed to add to cart');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            showError('Failed to add to cart');
        } finally {
            const button = event.target.closest('.quick-add');
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-cart-plus"></i>';
        }
    };

    // Calculate discount percentage
    function calculateDiscount(currentPrice, originalPrice) {
        return Math.round((1 - currentPrice / originalPrice) * 100);
    }

    // Generate star rating HTML
    function generateStarRating(rating) {
        return `
            <div class="star-rating">
                ${[1, 2, 3, 4, 5].map(star => `
                    <i class="fas fa-star${star <= rating ? ' filled' : ''}"></i>
                `).join('')}
            </div>
        `;
    }

    // Show error message
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger';
        errorDiv.textContent = message;
        productGrid.parentElement.prepend(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }

    // Show success message
    function showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'alert alert-success';
        successDiv.textContent = message;
        productGrid.parentElement.prepend(successDiv);
        setTimeout(() => successDiv.remove(), 3000);
    }

    // Update cart count in navbar
    async function updateCartCount() {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch('/cart', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const cart = await response.json();
            const cartCount = document.querySelector('.cart-count');
            if (cartCount) {
                cartCount.textContent = cart.items.length;
            }
        } catch (error) {
            console.error('Error updating cart count:', error);
        }
    }

    // Event listeners
    searchInput?.addEventListener('input', debounce(applyFilters, 300));
    categoryFilter?.addEventListener('change', applyFilters);
    sortSelect?.addEventListener('change', applyFilters);
    priceRange?.addEventListener('input', debounce(applyFilters, 300));

    // Debounce function for search input
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Initialize
    fetchProducts();
});

// State management
const state = {
    products: [],
    filteredProducts: [],
    currentPage: 1,
    itemsPerPage: 12,
    filters: {
        categories: [],
        priceRange: [0, 10000],
        artists: [],
        styles: [],
        sortBy: 'featured'
    },
    view: 'grid'
};

// Initialize price range slider
function initializePriceSlider() {
    const slider = document.getElementById('price-slider');
    if (!slider) return;

    noUiSlider.create(slider, {
        start: [0, 10000],
        connect: true,
        range: {
            'min': 0,
            'max': 10000
        },
        format: {
            to: value => Math.round(value),
            from: value => parseInt(value)
        }
    });

    // Update price labels and filter products
    slider.noUiSlider.on('update', (values) => {
        document.getElementById('price-min').textContent = `₹${values[0]}`;
        document.getElementById('price-max').textContent = `₹${values[1]}`;
        state.filters.priceRange = values;
        filterProducts();
    });
}

// Initialize filters
function initializeFilters() {
    // Category filters
    document.querySelectorAll('.filter-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateFilters();
            filterProducts();
        });
    });

    // Sort options
    const sortSelect = document.getElementById('sort-options');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            state.filters.sortBy = e.target.value;
            filterProducts();
        });
    }

    // View options
    document.querySelectorAll('[data-view]').forEach(button => {
        button.addEventListener('click', (e) => {
            const view = e.target.closest('button').dataset.view;
            changeView(view);
        });
    });

    // Clear filters
    document.getElementById('clear-filters')?.addEventListener('click', clearFilters);
}

// Initialize product grid
function initializeProductGrid() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    // Infinite scroll
    window.addEventListener('scroll', () => {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 1000) {
            loadMoreProducts();
        }
    });
}

// Load products from API
async function loadProducts() {
    showLoading();
    try {
        const response = await fetch('/api/artworks');
        if (!response.ok) throw new Error('Failed to fetch products');
        
        state.products = await response.json();
        state.filteredProducts = [...state.products];
        
        filterProducts();
        hideLoading();
    } catch (error) {
        console.error('Error loading products:', error);
        showError('Failed to load products. Please try again later.');
        hideLoading();
    }
}

// Filter products based on current state
function filterProducts() {
    showLoading();
    
    let filtered = [...state.products];

    // Apply category filters
    const selectedCategories = Array.from(document.querySelectorAll('.filter-checkbox:checked'))
        .map(cb => cb.id);
    if (selectedCategories.length > 0) {
        filtered = filtered.filter(product => selectedCategories.includes(product.category));
    }

    // Apply price filter
    filtered = filtered.filter(product => {
        return product.price >= state.filters.priceRange[0] && 
               product.price <= state.filters.priceRange[1];
    });

    // Apply artist filters
    if (state.filters.artists.length > 0) {
        filtered = filtered.filter(product => 
            state.filters.artists.includes(product.artist_id)
        );
    }

    // Apply style filters
    if (state.filters.styles.length > 0) {
        filtered = filtered.filter(product => 
            state.filters.styles.includes(product.style)
        );
    }

    // Apply sorting
    switch (state.filters.sortBy) {
        case 'price-low':
            filtered.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filtered.sort((a, b) => b.price - a.price);
            break;
        case 'newest':
            filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'popular':
            filtered.sort((a, b) => b.popularity - a.popularity);
            break;
    }

    state.filteredProducts = filtered;
    state.currentPage = 1;
    
    updateProductGrid();
    updateResultsCount();
    hideLoading();
}

// Update product grid with filtered products
function updateProductGrid() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    const startIndex = 0;
    const endIndex = state.currentPage * state.itemsPerPage;
    const productsToShow = state.filteredProducts.slice(startIndex, endIndex);

    if (productsToShow.length === 0) {
        grid.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="no-results">
                    <i class="fas fa-search fa-3x mb-3"></i>
                    <h3>No Products Found</h3>
                    <p>Try adjusting your filters or search criteria</p>
                    <button class="btn btn-primary mt-3" onclick="clearFilters()">
                        Clear All Filters
                    </button>
                </div>
            </div>
        `;
        return;
    }

    grid.innerHTML = productsToShow.map(product => createProductCard(product)).join('');
}

// Create product card HTML
function createProductCard(product) {
    return `
        <div class="col-md-4 mb-4">
            <div class="artwork-card" data-aos="fade-up">
                <div class="artwork-image">
                    <img src="${product.image_url}" alt="${product.title}" class="img-fluid">
                    ${product.discount ? `
                        <span class="discount-badge">${product.discount}% OFF</span>
                    ` : ''}
                    <div class="artwork-overlay">
                        <button class="btn btn-light btn-sm quick-view" data-id="${product.id}">
                            Quick View
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <h5 class="card-title">${product.title}</h5>
                    <p class="artist-name">by ${product.artist}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="price-wrapper">
                            <span class="current-price">₹${product.price}</span>
                            ${product.original_price ? `
                                <span class="original-price">₹${product.original_price}</span>
                            ` : ''}
                        </div>
                        <button class="btn btn-primary btn-sm add-to-cart" data-id="${product.id}">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Load more products (infinite scroll)
function loadMoreProducts() {
    if (state.currentPage * state.itemsPerPage >= state.filteredProducts.length) return;
    
    state.currentPage++;
    updateProductGrid();
}

// Change view mode (grid/list)
function changeView(view) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    state.view = view;
    document.querySelectorAll('[data-view]').forEach(button => {
        button.classList.toggle('active', button.dataset.view === view);
    });

    grid.classList.remove('grid-view', 'list-view');
    grid.classList.add(`${view}-view`);
}

// Clear all filters
function clearFilters() {
    // Reset checkboxes
    document.querySelectorAll('.filter-checkbox').forEach(cb => cb.checked = false);

    // Reset price slider
    const slider = document.getElementById('price-slider');
    if (slider && slider.noUiSlider) {
        slider.noUiSlider.set([0, 10000]);
    }

    // Reset sort
    const sortSelect = document.getElementById('sort-options');
    if (sortSelect) sortSelect.value = 'featured';

    // Reset state
    state.filters = {
        categories: [],
        priceRange: [0, 10000],
        artists: [],
        styles: [],
        sortBy: 'featured'
    };

    filterProducts();
}

// Update results count
function updateResultsCount() {
    const countElement = document.getElementById('results-count');
    if (countElement) {
        countElement.textContent = state.filteredProducts.length;
    }
}

// Loading state management
function showLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.classList.remove('d-none');
}

function hideLoading() {
    const spinner = document.getElementById('loading-spinner');
    if (spinner) spinner.classList.add('d-none');
}

// Error handling
function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-error';
    toast.innerHTML = `
        <div class="toast-header">
            <i class="fas fa-exclamation-circle text-danger me-2"></i>
            <strong class="me-auto">Error</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">${message}</div>
    `;
    
    document.body.appendChild(toast);
    new bootstrap.Toast(toast).show();
}

// Success message
function showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-success';
    toast.innerHTML = `
        <div class="toast-header">
            <i class="fas fa-check-circle text-success me-2"></i>
            <strong class="me-auto">Success</strong>
            <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
        </div>
        <div class="toast-body">${message}</div>
    `;
    
    document.body.appendChild(toast);
    new bootstrap.Toast(toast).show();
}

// Quick view modal
function showQuickView(productId) {
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const modal = new bootstrap.Modal(document.getElementById('quick-view-modal'));
    document.getElementById('quick-view-content').innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <img src="${product.image_url}" alt="${product.title}" class="img-fluid">
            </div>
            <div class="col-md-6">
                <h3>${product.title}</h3>
                <p class="artist-name">by ${product.artist}</p>
                <p class="description">${product.description}</p>
                <div class="price-wrapper mb-3">
                    <span class="current-price">₹${product.price}</span>
                    ${product.original_price ? `
                        <span class="original-price">₹${product.original_price}</span>
                    ` : ''}
                </div>
                <button class="btn btn-primary add-to-cart" data-id="${product.id}">
                    Add to Cart
                </button>
            </div>
        </div>
    `;
    modal.show();
}

// Initialize event listeners for dynamic content
document.addEventListener('click', function(e) {
    // Quick view button
    if (e.target.closest('.quick-view')) {
        const productId = e.target.closest('.quick-view').dataset.id;
        showQuickView(productId);
    }
    
    // Add to cart button
    if (e.target.closest('.add-to-cart')) {
        const productId = e.target.closest('.add-to-cart').dataset.id;
        addToCart(productId);
    }
});

// Add to cart functionality
async function addToCart(productId) {
    try {
        const response = await fetch('/api/cart/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId, quantity: 1 })
        });

        if (!response.ok) throw new Error('Failed to add to cart');

        showSuccess('Product added to cart successfully!');
        updateCartCount();
    } catch (error) {
        console.error('Error adding to cart:', error);
        showError('Failed to add product to cart. Please try again.');
    }
}

// Update cart count in header
async function updateCartCount() {
    try {
        const response = await fetch('/api/cart/count');
        if (!response.ok) throw new Error('Failed to get cart count');
        
        const { count } = await response.json();
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) cartCount.textContent = count;
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}
