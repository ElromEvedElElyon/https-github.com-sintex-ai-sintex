/**
 * ChatGPT Integration for STBTCX Token Purchase
 * Sintex.AI - Direct integration with OpenAI's ChatGPT Plugin
 */

class ChatGPTIntegration {
    constructor() {
        this.apiEndpoint = 'https://api.sintex.ai/v1';
        this.pluginId = 'stbtcx_purchase';
        this.sessionId = this.generateSessionId();
        this.isModalOpen = false;
        this.init();
    }

    init() {
        // Attach event listeners
        const buyButton = document.getElementById('chatgpt-buy-btn');
        const acceptCheckbox = document.getElementById('accept-terms');
        const proceedButton = document.getElementById('proceed-btn');

        if (buyButton) {
            buyButton.addEventListener('click', () => this.showLegalModal());
        }

        if (acceptCheckbox) {
            acceptCheckbox.addEventListener('change', (e) => {
                if (proceedButton) {
                    proceedButton.disabled = !e.target.checked;
                }
            });
        }

        // Check if ChatGPT plugin is available
        this.checkPluginAvailability();
        
        // Update node counter
        this.updateNodeCounter();
    }

    generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + Date.now();
    }

    showLegalModal() {
        const modal = document.getElementById('legal-modal');
        if (modal) {
            modal.classList.remove('hidden');
            this.isModalOpen = true;
            document.body.style.overflow = 'hidden';
            
            // Track modal opening
            this.trackEvent('legal_modal_opened');
        }
    }

    closeLegalModal() {
        const modal = document.getElementById('legal-modal');
        const checkbox = document.getElementById('accept-terms');
        const proceedButton = document.getElementById('proceed-btn');
        
        if (modal) {
            modal.classList.add('hidden');
            this.isModalOpen = false;
            document.body.style.overflow = '';
            
            // Reset checkbox and button
            if (checkbox) checkbox.checked = false;
            if (proceedButton) proceedButton.disabled = true;
            
            // Track modal closing
            this.trackEvent('legal_modal_closed');
        }
    }

    async proceedToChatGPT() {
        const checkbox = document.getElementById('accept-terms');
        
        if (!checkbox || !checkbox.checked) {
            this.showNotification('Por favor, aceite os termos antes de prosseguir.', 'error');
            return;
        }

        // Track acceptance
        this.trackEvent('terms_accepted');
        
        // Close modal
        this.closeLegalModal();

        // Show loading state
        this.showLoading();

        try {
            // Check if user has ChatGPT access
            const hasAccess = await this.checkChatGPTAccess();
            
            if (hasAccess) {
                // Initialize purchase flow
                await this.initiatePurchaseFlow();
            } else {
                // Redirect to ChatGPT with plugin
                this.redirectToChatGPT();
            }
        } catch (error) {
            console.error('Error proceeding to ChatGPT:', error);
            this.showNotification('Erro ao conectar com ChatGPT. Tente novamente.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async checkPluginAvailability() {
        try {
            const response = await fetch(`${this.apiEndpoint}/plugin/status`);
            const data = await response.json();
            
            if (data.available) {
                this.updateButtonStatus(true);
            } else {
                this.updateButtonStatus(false);
            }
        } catch (error) {
            console.error('Error checking plugin availability:', error);
            this.updateButtonStatus(false);
        }
    }

    updateButtonStatus(isAvailable) {
        const button = document.getElementById('chatgpt-buy-btn');
        if (button) {
            if (isAvailable) {
                button.classList.remove('disabled');
                button.title = 'Comprar STBTCX através do ChatGPT';
            } else {
                button.title = 'Integração ChatGPT em manutenção';
            }
        }
    }

    async checkChatGPTAccess() {
        // Check if user is logged into ChatGPT
        try {
            const response = await fetch('https://chat.openai.com/api/auth/session', {
                credentials: 'include',
                mode: 'no-cors'
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    async initiatePurchaseFlow() {
        try {
            // Create purchase session
            const response = await fetch(`${this.apiEndpoint}/chatgpt/initiate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_id: this.sessionId,
                    source: 'sintex_website',
                    timestamp: new Date().toISOString()
                })
            });

            const data = await response.json();
            
            if (data.success) {
                // Open ChatGPT with purchase context
                this.openChatGPTWithContext(data.context);
            } else {
                throw new Error(data.message || 'Failed to initiate purchase');
            }
        } catch (error) {
            console.error('Purchase flow error:', error);
            throw error;
        }
    }

    openChatGPTWithContext(context) {
        // Construct ChatGPT URL with plugin and context
        const chatGPTUrl = new URL('https://chat.openai.com');
        
        // Add plugin context
        const params = new URLSearchParams({
            model: 'gpt-4',
            plugin: this.pluginId,
            context: encodeURIComponent(JSON.stringify({
                action: 'purchase_stbtcx',
                session_id: this.sessionId,
                source: 'sintex.ai',
                ...context
            }))
        });

        // Open ChatGPT in new tab
        const chatWindow = window.open(
            `${chatGPTUrl}?${params}`,
            '_blank',
            'width=600,height=800,left=200,top=100'
        );

        // Monitor purchase status
        this.monitorPurchaseStatus(chatWindow);
    }

    redirectToChatGPT() {
        // Prepare the message for ChatGPT
        const message = encodeURIComponent(
            "I want to buy STBTCX tokens using the Sintex.AI plugin. Please help me complete the purchase."
        );
        
        // Construct ChatGPT URL with the plugin
        const chatGPTUrl = `https://chat.openai.com/chat?plugin=${this.pluginId}&message=${message}`;
        
        // Open in new tab
        window.open(chatGPTUrl, '_blank');
        
        // Show information
        this.showNotification(
            'Redirecionando para ChatGPT. Complete a compra na conversa.',
            'info'
        );
    }

    monitorPurchaseStatus(chatWindow) {
        // Set up message listener for cross-window communication
        const messageHandler = async (event) => {
            if (event.origin !== 'https://chat.openai.com') return;
            
            if (event.data.type === 'STBTCX_PURCHASE_COMPLETE') {
                // Purchase completed
                this.handlePurchaseComplete(event.data);
                window.removeEventListener('message', messageHandler);
            } else if (event.data.type === 'STBTCX_PURCHASE_CANCELLED') {
                // Purchase cancelled
                this.handlePurchaseCancelled(event.data);
                window.removeEventListener('message', messageHandler);
            }
        };
        
        window.addEventListener('message', messageHandler);
        
        // Check if window is closed
        const checkInterval = setInterval(() => {
            if (chatWindow.closed) {
                clearInterval(checkInterval);
                window.removeEventListener('message', messageHandler);
                this.checkPurchaseStatus();
            }
        }, 1000);
    }

    async checkPurchaseStatus() {
        try {
            const response = await fetch(`${this.apiEndpoint}/purchase/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_id: this.sessionId
                })
            });

            const data = await response.json();
            
            if (data.completed) {
                this.handlePurchaseComplete(data);
            } else if (data.cancelled) {
                this.handlePurchaseCancelled(data);
            }
        } catch (error) {
            console.error('Error checking purchase status:', error);
        }
    }

    handlePurchaseComplete(data) {
        // Show success message
        this.showNotification(
            `✅ Compra concluída! ${data.amount} STBTCX foram enviados para sua carteira.`,
            'success'
        );
        
        // Track successful purchase
        this.trackEvent('purchase_completed', {
            amount: data.amount,
            transaction_id: data.transaction_id
        });
        
        // Show transaction details
        if (data.transaction_hash) {
            this.showTransactionDetails(data);
        }
    }

    handlePurchaseCancelled(data) {
        this.showNotification(
            'Compra cancelada. Nenhuma cobrança foi realizada.',
            'warning'
        );
        
        // Track cancellation
        this.trackEvent('purchase_cancelled');
    }

    showTransactionDetails(data) {
        const detailsHTML = `
            <div class="transaction-details">
                <h3>Detalhes da Transação</h3>
                <p><strong>ID:</strong> ${data.transaction_id}</p>
                <p><strong>Quantidade:</strong> ${data.amount} STBTCX</p>
                <p><strong>Hash:</strong> <a href="https://solscan.io/tx/${data.transaction_hash}" target="_blank">${data.transaction_hash.substr(0, 20)}...</a></p>
                <button onclick="copyToClipboard('${data.transaction_hash}')">Copiar Hash</button>
            </div>
        `;
        
        this.showModal('Compra Concluída', detailsHTML);
    }

    showLoading() {
        const loader = document.createElement('div');
        loader.id = 'chatgpt-loader';
        loader.className = 'loader';
        loader.innerHTML = `
            <div class="spinner"></div>
            <p>Conectando com ChatGPT...</p>
        `;
        document.body.appendChild(loader);
    }

    hideLoading() {
        const loader = document.getElementById('chatgpt-loader');
        if (loader) {
            loader.remove();
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    showModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'custom-modal';
        modal.innerHTML = `
            <div class="custom-modal-content">
                <div class="custom-modal-header">
                    <h2>${title}</h2>
                    <button onclick="this.closest('.custom-modal').remove()">×</button>
                </div>
                <div class="custom-modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    updateNodeCounter() {
        const counter = document.getElementById('node-count');
        if (counter) {
            // Simulate dynamic node count
            setInterval(() => {
                const currentCount = parseInt(counter.textContent.replace(/,/g, ''));
                const variation = Math.floor(Math.random() * 100) - 50;
                const newCount = Math.max(19000, Math.min(21000, currentCount + variation));
                counter.textContent = newCount.toLocaleString();
            }, 3000);
        }
    }

    trackEvent(eventName, data = {}) {
        // Analytics tracking
        console.log('Track event:', eventName, data);
        
        // Send to analytics endpoint
        fetch(`${this.apiEndpoint}/analytics/track`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event: eventName,
                session_id: this.sessionId,
                timestamp: new Date().toISOString(),
                ...data
            })
        }).catch(console.error);
    }
}

// Global functions for HTML onclick handlers
window.closeLegalModal = function() {
    if (window.chatGPTIntegration) {
        window.chatGPTIntegration.closeLegalModal();
    }
};

window.proceedToChatGPT = function() {
    if (window.chatGPTIntegration) {
        window.chatGPTIntegration.proceedToChatGPT();
    }
};

window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(() => {
        if (window.chatGPTIntegration) {
            window.chatGPTIntegration.showNotification('Hash copiado!', 'success');
        }
    });
};

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.chatGPTIntegration = new ChatGPTIntegration();
});