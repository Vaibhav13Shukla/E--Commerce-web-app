document.addEventListener('DOMContentLoaded', () => {
    const navSlide = () => {
        const burger = document.querySelector('.burger');
        const nav = document.querySelector('.nav-links');
        const navLinks = document.querySelectorAll('.nav-links li');

        burger.addEventListener('click', () => {
            // Toggle Nav
            nav.classList.toggle('nav-active');

            // Animate Links
            navLinks.forEach((link, index) => {
                if (link.style.animation) {
                    link.style.animation = '';
                } else {
                    link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
                }
            });

            // Burger Animation
            burger.classList.toggle('toggle');
        });
    };

    navSlide();

    // Modal functionality
    const modal = document.getElementById('authModal');
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const closeBtn = document.getElementsByClassName('close')[0];
    const loginTabBtn = document.getElementById('loginTabBtn');
    const signupTabBtn = document.getElementById('signupTabBtn');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    loginBtn.onclick = () => {
        modal.style.display = 'block';
        loginTabBtn.click();
    };

    signupBtn.onclick = () => {
        modal.style.display = 'block';
        signupTabBtn.click();
    };

    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    loginTabBtn.onclick = () => {
        loginForm.style.display = 'flex';
        signupForm.style.display = 'none';
        loginTabBtn.classList.add('active');
        signupTabBtn.classList.remove('active');
    };

    signupTabBtn.onclick = () => {
        loginForm.style.display = 'none';
        signupForm.style.display = 'flex';
        loginTabBtn.classList.remove('active');
        signupTabBtn.classList.add('active');
    };

    // Form submission (for demonstration purposes)
    loginForm.onsubmit = (e) => {
        e.preventDefault();
        alert('Login functionality would be implemented here.');
    };

    signupForm.onsubmit = (e) => {
        e.preventDefault();
        alert('Sign up functionality would be implemented here.');
    };

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});