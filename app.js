/**
 * Sintex.AI Main Application JavaScript
 */

// Search functionality
function performSearch() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim();
    
    if (!query) {
        showNotification('Please enter a search query', 'warning');
        return;
    }
    
    // Simulate search
    showNotification(`Searching for: ${query}`, 'info');
    
    // Add search animation
    const searchContainer = document.querySelector('.search-container');
    searchContainer.classList.add('searching');
    
    setTimeout(() => {
        searchContainer.classList.remove('searching');
        // Redirect to search results (in production)
        console.log('Search query:', query);
    }, 1000);
}

// I'm Feeling Lucky functionality
function feelingLucky() {
    const sites = [
        'https://yuotube.ai',
        'https://standardbitcoin.io',
        'https://bitcoinbrasil.org'
    ];
    
    const randomSite = sites[Math.floor(Math.random() * sites.length)];
    
    showNotification(`Taking you to ${randomSite}`, 'info');
    
    setTimeout(() => {
        window.open(randomSite, '_blank');
    }, 1000);
}

// Show notification helper
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Search on Enter key
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-input');
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Add search suggestions
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            
            if (query.length > 2) {
                // Show search suggestions (simplified)
                const suggestions = [
                    'STBTCX token price',
                    'How to buy STBTCX',
                    'Elrom Network nodes',
                    'Sintex.AI features',
                    'ChatGPT integration'
                ].filter(s => s.toLowerCase().includes(query));
                
                // In production, this would show a dropdown with suggestions
                console.log('Suggestions:', suggestions);
            }
        });
    }
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Alt + S for search focus
        if (e.altKey && e.key === 's') {
            e.preventDefault();
            searchInput?.focus();
        }
        
        // Alt + L for I'm Feeling Lucky
        if (e.altKey && e.key === 'l') {
            e.preventDefault();
            feelingLucky();
        }
        
        // Alt + B for Buy with ChatGPT
        if (e.altKey && e.key === 'b') {
            e.preventDefault();
            document.getElementById('chatgpt-buy-btn')?.click();
        }
    });
    
    // Add theme switcher
    const themes = ['light', 'dark', 'purple'];
    let currentTheme = 0;
    
    // Theme switch with Ctrl + T
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 't') {
            e.preventDefault();
            currentTheme = (currentTheme + 1) % themes.length;
            document.body.className = `theme-${themes[currentTheme]}`;
            showNotification(`Theme changed to ${themes[currentTheme]}`, 'info');
        }
    });
    
    // Add smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            target?.scrollIntoView({ behavior: 'smooth' });
        });
    });
    
    // Add parallax effect to logo
    const logo = document.querySelector('.logo');
    if (logo) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallax = scrolled * -0.5;
            logo.style.transform = `translateY(${parallax}px)`;
        });
    }
    
    // Easter egg: Konami code
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;
    
    document.addEventListener('keydown', (e) => {
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                activateEasterEgg();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });
});

// Easter egg activation
function activateEasterEgg() {
    document.body.classList.add('easter-egg-active');
    showNotification('🎉 Easter egg activated! You found the secret!', 'success');
    
    // Add special effects
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    document.body.appendChild(confetti);
    
    setTimeout(() => {
        confetti.remove();
        document.body.classList.remove('easter-egg-active');
    }, 5000);
}

// Add CSS for searching animation
const style = document.createElement('style');
style.textContent = `
    .search-container.searching {
        animation: pulse 0.5s ease-in-out;
    }
    
    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }
    
    .theme-dark {
        filter: invert(1) hue-rotate(180deg);
    }
    
    .theme-purple {
        filter: hue-rotate(270deg);
    }
    
    .easter-egg-active {
        animation: rainbow 2s linear infinite;
    }
    
    @keyframes rainbow {
        0% { filter: hue-rotate(0deg); }
        100% { filter: hue-rotate(360deg); }
    }
    
    .confetti {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
        background-image: url('data:image/svg+xml,...');
        animation: confetti-fall 3s linear;
    }
    
    @keyframes confetti-fall {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100%); }
    }
`;
document.head.appendChild(style);