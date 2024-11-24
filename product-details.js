// Product Details JavaScript - Handle product details and cart functionality
document.addEventListener('DOMContentLoaded', async () => {
    const productDetailsContainer = document.getElementById('product-details');
    const reviewsContainer = document.getElementById('product-reviews');
    const reviewForm = document.getElementById('review-form');
    let product = null;

    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        window.location.href = 'product-listing.html';
        return;
    }

    // Fetch product details
    async function fetchProductDetails() {
        try {
            const response = await fetch(`/products/${productId}`);
            if (!response.ok) throw new Error('Product not found');
            
            product = await response.json();
            renderProductDetails();
            fetchProductReviews();
        } catch (error) {
            console.error('Error fetching product details:', error);
            showError('Failed to load product details');
        }
    }

    // Render product details
    function renderProductDetails() {
        productDetailsContainer.innerHTML = `
            <div class="product-images">
                <img src="${product.image_url || 'img/placeholder.jpg'}" alt="${product.name}" class="main-image">
                ${product.additional_images ? `
                    <div class="thumbnail-images">
                        ${product.additional_images.map(img => `
                            <img src="${img}" alt="${product.name}" class="thumbnail" onclick="updateMainImage(this.src)">
                        `).join('')}
                    </div>
                ` : ''}
            </div>
            <div class="product-info">
                <h1>${product.name}</h1>
                <p class="artist">By <a href="artist-profile.html?id=${product.artist_id}">${product.artist_name}</a></p>
                <div class="price-section">
                    <h2 class="price">$${product.price}</h2>
                    ${product.original_price ? `
                        <span class="original-price">$${product.original_price}</span>
                        <span class="discount">${calculateDiscount(product.price, product.original_price)}% OFF</span>
                    ` : ''}
                </div>
                <div class="product-meta">
                    <p><strong>Category:</strong> ${product.category_name}</p>
                    <p><strong>Style:</strong> ${product.style || 'N/A'}</p>
                    <p><strong>Medium:</strong> ${product.medium || 'N/A'}</p>
                    <p><strong>Dimensions:</strong> ${product.dimensions || 'N/A'}</p>
                </div>
                <p class="description">${product.description}</p>
                <div class="product-actions">
                    <div class="quantity-selector">
                        <button onclick="updateQuantity(-1)">-</button>
                        <input type="number" id="quantity" value="1" min="1" max="10">
                        <button onclick="updateQuantity(1)">+</button>
                    </div>
                    <button id="add-to-cart" class="btn btn-primary">Add to Cart</button>
                    <button id="buy-now" class="btn btn-secondary">Buy Now</button>
                </div>
            </div>
        `;

        // Add event listeners
        document.getElementById('add-to-cart').addEventListener('click', handleAddToCart);
        document.getElementById('buy-now').addEventListener('click', handleBuyNow);
    }

    // Fetch product reviews
    async function fetchProductReviews() {
        try {
            const response = await fetch(`/products/${productId}/reviews`);
            const reviews = await response.json();
            renderReviews(reviews);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            showError('Failed to load reviews');
        }
    }

    // Render reviews
    function renderReviews(reviews) {
        if (!reviewsContainer) return;

        const averageRating = calculateAverageRating(reviews);
        reviewsContainer.innerHTML = `
            <div class="reviews-header">
                <h3>Customer Reviews</h3>
                <div class="average-rating">
                    <span class="rating">${averageRating.toFixed(1)}</span>
                    ${generateStarRating(averageRating)}
                    <span class="review-count">(${reviews.length} reviews)</span>
                </div>
            </div>
            <div class="reviews-list">
                ${reviews.map(review => `
                    <div class="review-item">
                        <div class="review-header">
                            <span class="reviewer-name">${review.user_name}</span>
                            <span class="review-date">${formatDate(review.created_at)}</span>
                        </div>
                        ${generateStarRating(review.rating)}
                        <p class="review-text">${review.comment}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Handle Add to Cart
    async function handleAddToCart() {
        const quantity = parseInt(document.getElementById('quantity').value);
        const token = localStorage.getItem('token');
        
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        try {
            const button = document.getElementById('add-to-cart');
            button.disabled = true;
            button.textContent = 'Adding...';

            const response = await fetch('/cart/items', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    product_id: productId,
                    quantity: quantity
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
            const button = document.getElementById('add-to-cart');
            button.disabled = false;
            button.textContent = 'Add to Cart';
        }
    }

    // Handle Buy Now
    function handleBuyNow() {
        handleAddToCart().then(() => {
            window.location.href = 'checkout.html';
        });
    }

    // Update quantity
    window.updateQuantity = function(change) {
        const input = document.getElementById('quantity');
        const newValue = parseInt(input.value) + change;
        if (newValue >= 1 && newValue <= 10) {
            input.value = newValue;
        }
    };

    // Update main image
    window.updateMainImage = function(src) {
        document.querySelector('.main-image').src = src;
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

    // Calculate average rating
    function calculateAverageRating(reviews) {
        if (!reviews.length) return 0;
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return sum / reviews.length;
    }

    // Format date
    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Show error message
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-danger';
        errorDiv.textContent = message;
        productDetailsContainer.prepend(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }

    // Show success message
    function showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'alert alert-success';
        successDiv.textContent = message;
        productDetailsContainer.prepend(successDiv);
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

    // Initialize
    fetchProductDetails();
});
