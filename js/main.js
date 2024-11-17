// Main JavaScript file for AbhiRang E-commerce

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadFeaturedArtworks();
    setupEventListeners();
    initializeCart();
});

// Initialize the application
function initializeApp() {
    // Show loading state
    showLoadingState();
    
    // Initialize components
    initializeSearch();
    initializeNewsletter();
    
    // Hide loading state
    hideLoadingState();
}

// Loading state management
function showLoadingState() {
    const loader = document.createElement('div');
    loader.className = 'loader';
    loader.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loader);
}

function hideLoadingState() {
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.remove();
    }
}

// Featured Artworks
async function loadFeaturedArtworks() {
    try {
        const response = await fetch('/api/artworks');
        const artworks = await response.json();
        
        const artworksContainer = document.getElementById('featured-artworks');
        if (!artworksContainer) return;

        artworksContainer.innerHTML = '';
        
        artworks.forEach(artwork => {
            const artworkCard = createArtworkCard(artwork);
            artworksContainer.appendChild(artworkCard);
        });
    } catch (error) {
        console.error('Error loading artworks:', error);
        showErrorMessage('Failed to load artworks. Please try again later.');
    }
}

// Create artwork card
function createArtworkCard(artwork) {
    const card = document.createElement('div');
    card.className = 'col-md-4 mb-4';
    card.innerHTML = `
        <div class="artwork-card" data-aos="fade-up">
            <img src="${artwork.image}" alt="${artwork.title}" class="img-fluid">
            <div class="card-body">
                <h5 class="card-title">${artwork.title}</h5>
                <p class="card-text">by ${artwork.artist}</p>
                <div class="d-flex justify-content-between align-items-center">
                    <span class="price">$${artwork.price}</span>
                    <button class="btn btn-primary btn-sm add-to-cart" data-id="${artwork.id}">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
    return card;
}

// Shopping Cart
function initializeCart() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartCount(cart.length);

    // Add to cart button click handler
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('add-to-cart')) {
            const artworkId = e.target.dataset.id;
            addToCart(artworkId);
        }
    });
}

async function addToCart(artworkId) {
    try {
        const response = await fetch(`/api/artworks/${artworkId}`);
        const artwork = await response.json();
        
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.push(artwork);
        localStorage.setItem('cart', JSON.stringify(cart));
        
        updateCartCount(cart.length);
        showSuccessMessage('Added to cart successfully!');
    } catch (error) {
        console.error('Error adding to cart:', error);
        showErrorMessage('Failed to add item to cart. Please try again.');
    }
}

function updateCartCount(count) {
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = count;
    }
}

// Search functionality
function initializeSearch() {
    const searchForm = document.querySelector('.search-form');
    if (!searchForm) return;

    searchForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const searchInput = this.querySelector('input[type="search"]');
        const query = searchInput.value.trim();
        
        if (query) {
            try {
                const response = await fetch(`/api/artworks/search?q=${encodeURIComponent(query)}`);
                const results = await response.json();
                displaySearchResults(results);
            } catch (error) {
                console.error('Error searching:', error);
                showErrorMessage('Search failed. Please try again.');
            }
        }
    });
}

function displaySearchResults(results) {
    const resultsContainer = document.getElementById('featured-artworks');
    if (!resultsContainer) return;

    resultsContainer.innerHTML = '';
    
    if (results.length === 0) {
        resultsContainer.innerHTML = '<div class="col-12 text-center"><p>No results found</p></div>';
        return;
    }

    results.forEach(artwork => {
        const artworkCard = createArtworkCard(artwork);
        resultsContainer.appendChild(artworkCard);
    });
}

// Newsletter subscription
function initializeNewsletter() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (!newsletterForm) return;

    newsletterForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const emailInput = this.querySelector('input[type="email"]');
        const email = emailInput.value.trim();
        
        if (validateEmail(email)) {
            try {
                const response = await fetch('/api/newsletter/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                });
                
                if (response.ok) {
                    showSuccessMessage('Thank you for subscribing!');
                    emailInput.value = '';
                } else {
                    throw new Error('Subscription failed');
                }
            } catch (error) {
                console.error('Error subscribing:', error);
                showErrorMessage('Subscription failed. Please try again.');
            }
        } else {
            showErrorMessage('Please enter a valid email address.');
        }
    });
}

// Utility functions
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showSuccessMessage(message) {
    showToast(message, 'success');
}

function showErrorMessage(message) {
    showToast(message, 'error');
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Trigger reflow
    toast.offsetHeight;
    
    // Add visible class
    toast.classList.add('visible');
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Event listeners setup
function setupEventListeners() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Mobile menu toggle
    const menuToggle = document.querySelector('.navbar-toggler');
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            document.body.classList.toggle('menu-open');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        if (document.body.classList.contains('menu-open') && 
            !e.target.closest('.navbar')) {
            document.body.classList.remove('menu-open');
        }
    });
}
