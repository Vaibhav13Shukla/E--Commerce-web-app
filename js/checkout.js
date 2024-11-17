// Checkout process functionality

class CheckoutProcess {
    constructor() {
        this.cart = new ShoppingCart();
        this.initializeListeners();
    }

    // Initialize event listeners
    initializeListeners() {
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => this.handleCheckout(e));
        }

        // Add input validation listeners
        const inputs = document.querySelectorAll('#checkout-form input');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateInput(input));
        });
    }

    // Validate individual input fields
    validateInput(input) {
        const value = input.value.trim();
        const type = input.getAttribute('data-type') || input.type;
        let isValid = true;
        let errorMessage = '';

        switch (type) {
            case 'email':
                isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                errorMessage = 'Please enter a valid email address';
                break;
            case 'card':
                isValid = /^\d{16}$/.test(value.replace(/\s/g, ''));
                errorMessage = 'Please enter a valid 16-digit card number';
                break;
            case 'cvv':
                isValid = /^\d{3,4}$/.test(value);
                errorMessage = 'Please enter a valid CVV';
                break;
            case 'expiry':
                isValid = /^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(value);
                errorMessage = 'Please enter a valid expiry date (MM/YY)';
                break;
            default:
                isValid = value.length > 0;
                errorMessage = 'This field is required';
        }

        this.showInputError(input, isValid ? '' : errorMessage);
        return isValid;
    }

    // Show input validation errors
    showInputError(input, message) {
        const errorElement = input.parentElement.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message;
            input.classList.toggle('invalid', message !== '');
        }
    }

    // Handle the checkout process
    async handleCheckout(event) {
        event.preventDefault();

        if (!this.validateForm()) {
            return;
        }

        const formData = new FormData(event.target);
        const orderData = {
            items: this.cart.items,
            customer: {
                name: formData.get('name'),
                email: formData.get('email'),
                address: formData.get('address'),
                city: formData.get('city'),
                country: formData.get('country'),
                zipCode: formData.get('zipCode')
            },
            payment: {
                cardNumber: formData.get('cardNumber'),
                cardHolder: formData.get('cardHolder'),
                expiry: formData.get('expiry'),
                cvv: formData.get('cvv')
            },
            total: this.cart.calculateTotal()
        };

        try {
            const response = await this.processOrder(orderData);
            if (response.success) {
                this.handleSuccessfulCheckout(response.orderId);
            } else {
                this.showError('Payment processing failed. Please try again.');
            }
        } catch (error) {
            this.showError('An error occurred during checkout. Please try again.');
        }
    }

    // Validate the entire form
    validateForm() {
        const inputs = document.querySelectorAll('#checkout-form input');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateInput(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    // Process the order
    async processOrder(orderData) {
        try {
            const response = await fetch('/api/process-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(orderData)
            });

            return await response.json();
        } catch (error) {
            throw new Error('Order processing failed');
        }
    }

    // Handle successful checkout
    handleSuccessfulCheckout(orderId) {
        this.cart.clearCart();
        localStorage.setItem('lastOrderId', orderId);
        window.location.href = 'order-confirmation.html';
    }

    // Show error message
    showError(message) {
        const errorDiv = document.getElementById('checkout-error');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }
}

// Initialize checkout process
document.addEventListener('DOMContentLoaded', () => {
    const checkout = new CheckoutProcess();
});
