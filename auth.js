// Authentication related functions

// Function to handle user login
async function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Add loading state
    submitButton.classList.add('btn-loading');
    submitButton.disabled = true;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('userName', data.name);
            
            // Show success message before redirect
            showMessage('Login successful!', 'success');
            setTimeout(() => {
                window.location.href = 'user-profile.html';
            }, 1000);
        } else {
            const errorData = await response.json();
            showError(errorData.message || 'Invalid credentials');
        }
    } catch (error) {
        showError('Login failed. Please try again.');
    } finally {
        // Remove loading state
        submitButton.classList.remove('btn-loading');
        submitButton.disabled = false;
    }
}

// Function to handle user registration
async function handleRegister(event) {
    event.preventDefault();
    const form = event.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    // Add loading state
    submitButton.classList.add('btn-loading');
    submitButton.disabled = true;

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password, role })
        });

        if (response.ok) {
            showMessage('Registration successful! Redirecting to login...', 'success');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        } else {
            const errorData = await response.json();
            showError(errorData.message || 'Registration failed. Please try again.');
        }
    } catch (error) {
        showError('Registration failed. Please try again.');
    } finally {
        // Remove loading state
        submitButton.classList.remove('btn-loading');
        submitButton.disabled = false;
    }
}

// Function to handle social login
async function handleSocialLogin(provider) {
    const button = document.querySelector(`.btn-${provider.toLowerCase()}`);
    button.classList.add('btn-loading');
    button.disabled = true;

    try {
        // Implement social login logic here
        const response = await fetch(`/api/auth/${provider.toLowerCase()}`, {
            method: 'POST'
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('userName', data.name);
            
            window.location.href = 'user-profile.html';
        } else {
            showError(`${provider} login failed. Please try again.`);
        }
    } catch (error) {
        showError(`${provider} login failed. Please try again.`);
    } finally {
        button.classList.remove('btn-loading');
        button.disabled = false;
    }
}

// Function to check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem('token') !== null;
}

// Function to get user role
function getUserRole() {
    return localStorage.getItem('userRole');
}

// Function to get user name
function getUserName() {
    return localStorage.getItem('userName');
}

// Function to logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    window.location.href = 'index.html';
}

// Function to show error messages
function showError(message) {
    showMessage(message, 'error');
}

// Function to show messages (error or success)
function showMessage(message, type = 'error') {
    const messageContainer = document.querySelector('.message-container') || createMessageContainer();
    const messageElement = document.createElement('div');
    messageElement.className = `message message-${type}`;
    messageElement.textContent = message;

    messageContainer.appendChild(messageElement);

    // Remove message after 5 seconds
    setTimeout(() => {
        messageElement.remove();
        if (messageContainer.children.length === 0) {
            messageContainer.remove();
        }
    }, 5000);
}

// Function to create message container
function createMessageContainer() {
    const container = document.createElement('div');
    container.className = 'message-container';
    document.body.appendChild(container);
    return container;
}

// Function to toggle password visibility
function togglePassword(button) {
    const input = button.closest('.input-group').querySelector('input');
    const icon = button.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Login form handler
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Registration form handler
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Social login buttons
    const googleBtn = document.querySelector('.btn-google');
    if (googleBtn) {
        googleBtn.addEventListener('click', () => handleSocialLogin('Google'));
    }

    const facebookBtn = document.querySelector('.btn-facebook');
    if (facebookBtn) {
        facebookBtn.addEventListener('click', () => handleSocialLogin('Facebook'));
    }

    // Password toggle buttons
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', () => togglePassword(btn));
    });

    // Protect routes that require authentication
    const protectedPages = ['user-profile.html', 'checkout.html', 'orders.html'];
    const currentPage = window.location.pathname.split('/').pop();

    if (protectedPages.includes(currentPage) && !isAuthenticated()) {
        window.location.href = 'login.html';
    }
});
