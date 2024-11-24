// User profile management functionality

class UserProfile {
    constructor() {
        this.init();
    }

    // Initialize user profile
    async init() {
        if (!isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }

        await this.loadUserData();
        this.initializeListeners();
        this.updateUI();
    }

    // Load user data from server
    async loadUserData() {
        try {
            const response = await fetch('/api/user-profile', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                this.userData = await response.json();
            } else {
                throw new Error('Failed to load user data');
            }
        } catch (error) {
            this.showError('Failed to load user profile');
        }
    }

    // Initialize event listeners
    initializeListeners() {
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => this.handleProfileUpdate(e));
        }

        const artworkForm = document.getElementById('artwork-form');
        if (artworkForm) {
            artworkForm.addEventListener('submit', (e) => this.handleArtworkSubmission(e));
        }
    }

    // Update UI with user data
    updateUI() {
        if (!this.userData) return;

        // Update profile information
        const profileElements = {
            'profile-name': this.userData.name,
            'profile-email': this.userData.email,
            'profile-bio': this.userData.bio,
            'profile-image': this.userData.profileImage
        };

        for (const [id, value] of Object.entries(profileElements)) {
            const element = document.getElementById(id);
            if (element) {
                if (id === 'profile-image') {
                    element.src = value || 'img/default-profile.jpg';
                } else {
                    element.textContent = value;
                }
            }
        }

        // Update artist-specific elements if user is an artist
        if (this.userData.role === 'artist') {
            this.updateArtistDashboard();
        }

        // Update order history
        this.updateOrderHistory();
    }

    // Handle profile update
    async handleProfileUpdate(event) {
        event.preventDefault();
        const formData = new FormData(event.target);

        try {
            const response = await fetch('/api/update-profile', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (response.ok) {
                await this.loadUserData();
                this.updateUI();
                this.showSuccess('Profile updated successfully');
            } else {
                throw new Error('Failed to update profile');
            }
        } catch (error) {
            this.showError('Failed to update profile');
        }
    }

    // Handle artwork submission (for artists)
    async handleArtworkSubmission(event) {
        event.preventDefault();
        const formData = new FormData(event.target);

        try {
            const response = await fetch('/api/submit-artwork', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (response.ok) {
                this.showSuccess('Artwork submitted successfully');
                this.updateArtistDashboard();
            } else {
                throw new Error('Failed to submit artwork');
            }
        } catch (error) {
            this.showError('Failed to submit artwork');
        }
    }

    // Update artist dashboard
    async updateArtistDashboard() {
        try {
            const response = await fetch('/api/artist-dashboard', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const dashboardData = await response.json();
                this.updateArtworkList(dashboardData.artworks);
                this.updateSalesStats(dashboardData.stats);
            }
        } catch (error) {
            this.showError('Failed to load artist dashboard');
        }
    }

    // Update artwork list in artist dashboard
    updateArtworkList(artworks) {
        const artworkList = document.getElementById('artwork-list');
        if (!artworkList) return;

        artworkList.innerHTML = artworks.map(artwork => `
            <div class="artwork-item">
                <img src="${artwork.image}" alt="${artwork.title}">
                <h3>${artwork.title}</h3>
                <p>Price: $${artwork.price}</p>
                <p>Status: ${artwork.status}</p>
                <button onclick="userProfile.editArtwork('${artwork.id}')" class="edit-btn">Edit</button>
                <button onclick="userProfile.deleteArtwork('${artwork.id}')" class="delete-btn">Delete</button>
            </div>
        `).join('');
    }

    // Update sales statistics
    updateSalesStats(stats) {
        const statsElements = {
            'total-sales': stats.totalSales,
            'total-revenue': stats.totalRevenue,
            'average-rating': stats.averageRating
        };

        for (const [id, value] of Object.entries(statsElements)) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        }
    }

    // Update order history
    async updateOrderHistory() {
        try {
            const response = await fetch('/api/order-history', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const orders = await response.json();
                const orderList = document.getElementById('order-history');
                if (orderList) {
                    orderList.innerHTML = orders.map(order => `
                        <div class="order-item">
                            <h4>Order #${order.id}</h4>
                            <p>Date: ${new Date(order.date).toLocaleDateString()}</p>
                            <p>Total: $${order.total}</p>
                            <p>Status: ${order.status}</p>
                            <button onclick="userProfile.viewOrderDetails('${order.id}')">View Details</button>
                        </div>
                    `).join('');
                }
            }
        } catch (error) {
            this.showError('Failed to load order history');
        }
    }

    // Show success message
    showSuccess(message) {
        const successDiv = document.getElementById('success-message');
        if (successDiv) {
            successDiv.textContent = message;
            successDiv.style.display = 'block';
            setTimeout(() => {
                successDiv.style.display = 'none';
            }, 3000);
        }
    }

    // Show error message
    showError(message) {
        const errorDiv = document.getElementById('error-message');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
            setTimeout(() => {
                errorDiv.style.display = 'none';
            }, 3000);
        }
    }
}

// Initialize user profile
document.addEventListener('DOMContentLoaded', () => {
    const userProfile = new UserProfile();
});

