// script.js

// Theme toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const themeToggleButton = document.getElementById('theme-toggle');
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const icon = themeToggleButton.querySelector('i');
            icon.classList.toggle('fa-moon');
            icon.classList.toggle('fa-sun');
        });
    }

    // Hamburger menu for mobile
    const hamburger = document.querySelector('.hamburger');
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            document.querySelector('.mobile-menu').classList.toggle('hidden');
        });
    }
});
fetch('/api/products')
    .then(response => {
        console.log('Response:', response); // Log the response
        return response.json();
    })
    .then(products => {
        console.log('Products:', products); // Log the products
        const productList = document.getElementById('product-list');
        products.forEach(product => {
            const productCard = `
                <div class="product bg-white p-4 rounded shadow hover:shadow-lg transition transform hover:scale-105">
                    <img alt="${product.name}" class="w-full h-48 object-cover rounded" src="${product.image_url}"/>
                    <h3 class="text-lg font-semibold mt-2">${product.name}</h3>
                    <p class="text-gray-700">$${product.price}</p>
                    <a href="product-details.html?id=${product.id}" class="mt-2 w-full bg-gray-800 text-white p-2 rounded hover:bg-gray-700 transition">View Details</a>
                </div>
            `;
            productList.insertAdjacentHTML('beforeend', productCard);
        });
    })
    .catch(error => console.error('Error fetching products:', error));