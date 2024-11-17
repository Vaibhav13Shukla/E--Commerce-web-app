// 404 Page JavaScript - Handle 404 behavior
document.addEventListener('DOMContentLoaded', () => {
    const notFoundMessage = document.getElementById('not-found-message');
    notFoundMessage.innerHTML = `
        <h2>Oops! Page not found.</h2>
        <p>Sorry, the page you are looking for might have been moved or deleted.</p>
        <button onclick="window.location.href='index.html'">Go Back to Home</button>
    `;
});
