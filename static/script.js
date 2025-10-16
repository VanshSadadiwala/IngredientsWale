/**
 * IngredientWale - Frontend JavaScript
 * Handles image upload, dish prediction requests, and dynamic UI updates
 */

// Point this to your deployed backend (e.g., Cloud Run/Railway URL)
const API_BASE = (typeof window !== 'undefined' && window.INGREDIENTWALE_API_BASE) || '';

class IngredientWaleApp {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.loadDishMenu();
        this.setupMobileNavigation();
    }

    initializeElements() {
        // Upload elements
        this.uploadArea = document.getElementById('upload-area');
        this.fileInput = document.getElementById('file-input');
        this.imagePreview = document.getElementById('image-preview');
        this.previewImg = document.getElementById('preview-img');
        this.removeImage = document.getElementById('remove-image');
        this.predictButton = document.getElementById('predict-button');
        
        // No custom camera UI; rely on native file input capture
        
        // Results elements
        this.resultsSection = document.getElementById('results-section');
        this.dishResults = document.getElementById('dish-results');
        this.loadingSpinner = document.getElementById('loading-spinner');
        this.errorMessage = document.getElementById('error-message');
        this.errorText = document.getElementById('error-text');
        
        // Navigation elements
        this.dishMenu = document.getElementById('dish-menu');
        this.hamburger = document.getElementById('hamburger');
        this.navMenu = document.getElementById('nav-menu');
        
        // State
        this.selectedFile = null;
        this.isUploading = false;
    }

    bindEvents() {
        // File upload events
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        
        // Image preview events
        this.removeImage.addEventListener('click', () => this.removeSelectedImage());
        this.predictButton.addEventListener('click', () => this.predictDish());

        // No custom camera events
        
        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => this.handleSmoothScroll(e));
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => this.handleOutsideClick(e));
    }

    setupMobileNavigation() {
        if (this.hamburger) {
            this.hamburger.addEventListener('click', () => this.toggleMobileMenu());
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    processFile(file) {
        // Validate file type
        if (!this.isValidImageFile(file)) {
            this.showError('Please select a valid image file (PNG, JPG, JPEG, GIF, BMP)');
            return;
        }

        // Validate file size (max 16MB)
        if (file.size > 16 * 1024 * 1024) {
            this.showError('File size too large. Please select an image smaller than 16MB.');
            return;
        }

        this.selectedFile = file;
        this.hideError();
        this.displayImagePreview(file);
    }

    isValidImageFile(file) {
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp'];
        return validTypes.includes(file.type);
    }

    displayImagePreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.previewImg.src = e.target.result;
            this.uploadArea.style.display = 'none';
            this.imagePreview.style.display = 'block';
            
            // Animate the preview appearance
            this.imagePreview.style.opacity = '0';
            this.imagePreview.style.transform = 'translateY(20px)';
            
            requestAnimationFrame(() => {
                this.imagePreview.style.transition = 'all 0.5s ease-out';
                this.imagePreview.style.opacity = '1';
                this.imagePreview.style.transform = 'translateY(0)';
            });
        };
        reader.readAsDataURL(file);
    }

    removeSelectedImage() {
        this.selectedFile = null;
        this.fileInput.value = '';
        this.imagePreview.style.display = 'none';
        this.uploadArea.style.display = 'block';
        this.resultsSection.style.display = 'none';
        this.hideError();
        
        // Reset upload area
        this.uploadArea.classList.remove('dragover');

        // Nothing else to reset
    }

    async predictDish() {
        if (!this.selectedFile) {
            this.showError('Please select an image first');
            return;
        }

        if (this.isUploading) {
            return;
        }

        this.isUploading = true;
        this.showLoading();
        this.hideError();
        this.hideResults();

        try {
            const formData = new FormData();
            formData.append('image', this.selectedFile);

            const response = await fetch(`${API_BASE}/predict`, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Prediction failed');
            }

            this.displayResults(result.predictions);
            
        } catch (error) {
            console.error('Prediction error:', error);
            this.showError(error.message || 'Failed to analyze dish. Please try again.');
        } finally {
            this.isUploading = false;
            this.hideLoading();
        }
    }

    // Removed custom camera implementation

    displayResults(predictions) {
        if (!predictions || predictions.length === 0) {
            this.showError('No dish or ingredients detected in the image');
            return;
        }

        this.dishResults.innerHTML = '';
        
        // Sort predictions by confidence
        predictions.sort((a, b) => b.confidence - a.confidence);

        // Create dish prediction card (highest confidence)
        const dishCard = this.createDishCard(predictions[0], 0);
        this.dishResults.appendChild(dishCard);

        // Create ingredients section if there are more predictions
        if (predictions.length > 1) {
            const ingredientsSection = this.createIngredientsSection(predictions.slice(1));
            this.dishResults.appendChild(ingredientsSection);
        }

        this.resultsSection.style.display = 'block';
        
        // Animate results appearance
        this.resultsSection.style.opacity = '0';
        this.resultsSection.style.transform = 'translateY(30px)';
        
        requestAnimationFrame(() => {
            this.resultsSection.style.transition = 'all 0.6s ease-out';
            this.resultsSection.style.opacity = '1';
            this.resultsSection.style.transform = 'translateY(0)';
        });

        // Scroll to results
        this.resultsSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    createDishCard(prediction, index) {
        const card = document.createElement('div');
        card.className = 'dish-card';
        card.style.animationDelay = `${index * 0.1}s`;

        const confidence = Math.round(prediction.confidence * 100);
        const dishName = prediction.ingredient.replace(/_/g, ' ');

        // Create ingredients section if available
        let ingredientsSection = '';
        if (prediction.ingredients && prediction.ingredients.length > 0) {
            const ingredientCards = prediction.ingredients.map(ingredient => 
                `<div class="ingredient-chip">${ingredient}</div>`
            ).join('');
            
            ingredientsSection = `
                <div class="dish-ingredients">
                    <div class="ingredients-label">
                        <i class="fas fa-list"></i> Ingredients:
                    </div>
                    <div class="ingredients-chips">
                        ${ingredientCards}
                    </div>
                </div>
            `;
        }

        card.innerHTML = `
            <div class="dish-icon">
                <i class="fas fa-utensils"></i>
            </div>
            <div class="dish-content">
                <div class="dish-name">${dishName}</div>
                <div class="dish-label">Predicted Dish</div>
                <div class="confidence-bar">
                    <div class="confidence-fill" style="width: ${confidence}%"></div>
                </div>
                <div class="confidence-text">${confidence}% confidence</div>
                ${ingredientsSection}
            </div>
        `;

        return card;
    }

    createIngredientsSection(ingredients) {
        const section = document.createElement('div');
        section.className = 'ingredients-section';
        
        const header = document.createElement('div');
        header.className = 'ingredients-header';
        header.innerHTML = `
            <h4><i class="fas fa-list"></i> Possible Ingredients</h4>
        `;
        section.appendChild(header);

        const grid = document.createElement('div');
        grid.className = 'ingredients-grid';

        ingredients.forEach((prediction, index) => {
            const ingredientCard = this.createIngredientCard(prediction, index + 1);
            grid.appendChild(ingredientCard);
        });

        section.appendChild(grid);
        return section;
    }

    createIngredientCard(prediction, index) {
        const card = document.createElement('div');
        card.className = 'ingredient-card';
        card.style.animationDelay = `${index * 0.1}s`;

        const confidence = Math.round(prediction.confidence * 100);
        const ingredientName = prediction.ingredient.replace(/_/g, ' ');

        card.innerHTML = `
            <div class="ingredient-name">${ingredientName}</div>
            <div class="confidence-bar">
                <div class="confidence-fill" style="width: ${confidence}%"></div>
            </div>
            <div class="confidence-text">${confidence}% confidence</div>
        `;

        return card;
    }

    async loadDishMenu() {
        try {
            const response = await fetch(`${API_BASE}/menu`);
            const result = await response.json();

            if (result.ingredients) {
                this.displayDishMenu(result.ingredients);
            }
        } catch (error) {
            console.error('Failed to load dish menu:', error);
            this.displayDishMenu([]);
        }
    }

    displayDishMenu(dishes) {
        if (!dishes || dishes.length === 0) {
            this.dishMenu.innerHTML = '<div class="loading">No dishes available</div>';
            return;
        }

        // Sort dishes alphabetically
        dishes.sort();

        // Group dishes by first letter
        const grouped = dishes.reduce((groups, dish) => {
            const firstLetter = dish.charAt(0).toUpperCase();
            if (!groups[firstLetter]) {
                groups[firstLetter] = [];
            }
            groups[firstLetter].push(dish);
            return groups;
        }, {});

        let menuHTML = '';
        Object.keys(grouped).sort().forEach(letter => {
            menuHTML += `<div class="menu-section">
                <div class="menu-header">${letter}</div>
                ${grouped[letter].map(dish => 
                    `<div class="dish-item">${dish.replace(/_/g, ' ')}</div>`
                ).join('')}
            </div>`;
        });

        this.dishMenu.innerHTML = menuHTML;
    }

    showLoading() {
        this.loadingSpinner.style.display = 'block';
        this.predictButton.disabled = true;
        this.predictButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Predicting...';
    }

    hideLoading() {
        this.loadingSpinner.style.display = 'none';
        this.predictButton.disabled = false;
        this.predictButton.innerHTML = '<i class="fas fa-magic"></i> Analyze Dish & Ingredients';
    }

    showError(message) {
        this.errorText.textContent = message;
        this.errorMessage.style.display = 'flex';
        
        // Auto-hide error after 5 seconds
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    hideError() {
        this.errorMessage.style.display = 'none';
    }

    hideResults() {
        this.resultsSection.style.display = 'none';
    }

    handleSmoothScroll(e) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    handleOutsideClick(e) {
        const dropdown = document.querySelector('.dropdown');
        if (dropdown && !dropdown.contains(e.target)) {
            // Dropdown will close automatically via CSS :hover
        }
    }

    toggleMobileMenu() {
        this.navMenu.classList.toggle('active');
        this.hamburger.classList.toggle('active');
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new IngredientWaleApp();
    
    // Add scroll effect to navbar
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;
    
    const handleScroll = throttle(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            navbar.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    }, 100);
    
    window.addEventListener('scroll', handleScroll);
    
    // Add parallax effect to hero section
    const hero = document.querySelector('.hero');
    const heroContent = document.querySelector('.hero-content');
    
    const handleParallax = throttle(() => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        if (heroContent) {
            heroContent.style.transform = `translateY(${rate}px)`;
        }
    }, 16);
    
    window.addEventListener('scroll', handleParallax);
    
    // Add loading animation to feature cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
                entry.target.style.animationDelay = `${Array.from(entry.target.parentNode.children).indexOf(entry.target) * 0.1}s`;
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.feature-card').forEach(card => {
        observer.observe(card);
    });
});

// Handle page visibility changes for better performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden, reduce animations
        document.body.classList.add('page-hidden');
    } else {
        // Page is visible, restore animations
        document.body.classList.remove('page-hidden');
    }
});

// Add keyboard navigation support
document.addEventListener('keydown', (e) => {
    // ESC key to close modals or clear selections
    if (e.key === 'Escape') {
        const errorMessage = document.getElementById('error-message');
        if (errorMessage && errorMessage.style.display !== 'none') {
            errorMessage.style.display = 'none';
        }
    }
    
    // Enter key to trigger prediction when button is focused
    if (e.key === 'Enter' && document.activeElement.id === 'predict-button') {
        document.activeElement.click();
    }
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IngredientWaleApp;
}

