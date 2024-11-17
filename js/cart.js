// Shopping cart functionality

class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
    }

    // Add item to cart
    addItem(artwork) {
        const existingItem = this.items.find(item => item.id === artwork.id);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                ...artwork,
                quantity: 1
            });
        }
        this.saveCart();
        this.updateCartUI();
    }

    // Remove item from cart
    removeItem(artworkId) {
        this.items = this.items.filter(item => item.id !== artworkId);
        this.saveCart();
        this.updateCartUI();
    }

    // Update item quantity
    updateQuantity(artworkId, quantity) {
        const item = this.items.find(item => item.id === artworkId);
        if (item) {
            item.quantity = parseInt(quantity);
            if (item.quantity <= 0) {
                this.removeItem(artworkId);
            }
        }
        this.saveCart();
        this.updateCartUI();
    }

    // Calculate total price
    calculateTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    // Clear cart
    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartUI();
    }

    // Update cart UI
    updateCartUI() {
        const cartContainer = document.getElementById('cart-items');
        const totalElement = document.getElementById('cart-total');
        
        if (cartContainer) {
            cartContainer.innerHTML = this.items.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.title}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h3>${item.title}</h3>
                        <p>Price: $${item.price}</p>
                        <div class="quantity-controls">
                            <button onclick="cart.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                        </div>
                        <button onclick="cart.removeItem('${item.id}')" class="remove-item">Remove</button>
                    </div>
                </div>
            `).join('');
        }

        if (totalElement) {
            totalElement.textContent = `Total: $${this.calculateTotal().toFixed(2)}`;
        }

        // Update cart icon if exists
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }
}

// Initialize cart
const cart = new ShoppingCart();

// Update cart UI on page load
document.addEventListener('DOMContentLoaded', () => {
    cart.updateCartUI();
});
