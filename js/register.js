// Registration Page JavaScript - Handle Form Validation
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Simple validation
        if (!username || !email || !password) {
            alert('Please fill in all fields!');
            return;
        }

        // Mock registration process (for demo)
        alert(`Welcome, ${username}! Registration successful.`);

        // Redirect to login or home page after successful registration
        window.location.href = 'login.html'; 
    });
});
