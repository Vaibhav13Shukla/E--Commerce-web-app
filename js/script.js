document.addEventListener('DOMContentLoaded', function() {
    loadArtworks();
});

function loadArtworks() {
    fetch('/api/artworks')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const artworksSection = document.getElementById('featured-artworks');
            data.forEach(artwork => {
                const artworkElement = document.createElement('div');
                artworkElement.className = 'col-md-4 artwork-card';
                artworkElement.innerHTML = `
                    <a href="product-details.html?id=${artwork.id}">
                        <img src="${artwork.image_url}" class="img-fluid" alt="${artwork.title}">
                        <h5>${artwork.title}</h5>
                        <p>by ${artwork.artist}</p>
                        <p>$${artwork.price.toFixed(2)}</p>
                    </a>
                `;
                artworksSection.appendChild(artworkElement);
            });
        })
        .catch(error => console.error('Error fetching artworks:', error));
}