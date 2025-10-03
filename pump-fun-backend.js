/**
 * Pump.fun Backend Integration for STBTCX Token Sales
 * This handles the real token purchase flow on Solana
 */

// Configuration
const PUMP_FUN_CONFIG = {
    contractAddress: '386JZJtkvf43yoNawAHmHHeEhZWUTZ4UuJJtxC9fpump',
    network: 'Solana',
    marketplace: 'https://pump.fun',
    tokenSymbol: 'STBTCX',
    tokenName: 'Standard Bitcoin X',
    packages: [
        {
            amount: 100,
            price: 10,
            description: 'Starter Package'
        },
        {
            amount: 1000,
            price: 90,
            description: 'Standard Package'
        },
        {
            amount: 10000,
            price: 750,
            description: 'Premium Package'
        }
    ]
};

/**
 * Initialize Pump.fun Integration
 * This function is called when the ChatGPT Buy button is clicked
 */
function initPumpFunPurchase(packageIndex = 1) {
    const package = PUMP_FUN_CONFIG.packages[packageIndex];
    const purchaseUrl = `${PUMP_FUN_CONFIG.marketplace}/coin/${PUMP_FUN_CONFIG.contractAddress}`;
    
    // Prepare purchase data
    const purchaseData = {
        token: PUMP_FUN_CONFIG.tokenSymbol,
        contract: PUMP_FUN_CONFIG.contractAddress,
        amount: package.amount,
        price_usd: package.price,
        network: PUMP_FUN_CONFIG.network,
        timestamp: Date.now()
    };
    
    // Store in session for tracking
    sessionStorage.setItem('pump_fun_purchase', JSON.stringify(purchaseData));
    
    // Open Pump.fun for direct purchase
    window.open(purchaseUrl, '_blank');
    
    // Track event
    console.log('🚀 Pump.fun purchase initiated:', purchaseData);
    
    return purchaseData;
}

/**
 * Get real-time token price from Pump.fun
 */
async function getTokenPrice() {
    try {
        // In production, this would call Pump.fun API
        // For now, return static price
        return {
            price: 0.001,
            change_24h: '+15.3%',
            market_cap: '$1.2M',
            volume_24h: '$45K'
        };
    } catch (error) {
        console.error('Error fetching price:', error);
        return null;
    }
}

/**
 * Verify transaction on Solana
 */
async function verifyTransaction(txHash) {
    try {
        // This would connect to Solana RPC to verify
        // For now, return mock verification
        return {
            success: true,
            txHash: txHash,
            confirmations: 1,
            timestamp: Date.now()
        };
    } catch (error) {
        console.error('Transaction verification error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Handle direct purchase flow
 */
function handleDirectPurchase(amount) {
    // Find matching package
    const package = PUMP_FUN_CONFIG.packages.find(p => p.amount === amount);
    if (!package) {
        console.error('Invalid package amount');
        return;
    }
    
    // Create purchase URL with pre-filled amount
    const baseUrl = `${PUMP_FUN_CONFIG.marketplace}/coin/${PUMP_FUN_CONFIG.contractAddress}`;
    const params = new URLSearchParams({
        action: 'buy',
        amount: amount,
        token: PUMP_FUN_CONFIG.tokenSymbol
    });
    
    const purchaseUrl = `${baseUrl}?${params.toString()}`;
    
    // Log purchase attempt
    console.log(`🛒 Direct purchase: ${amount} ${PUMP_FUN_CONFIG.tokenSymbol} for $${package.price}`);
    
    // Open purchase URL
    window.open(purchaseUrl, '_blank');
}

/**
 * Enhanced ChatGPT Buy button handler
 * DISABLED - Not interfering with ChatGPT button anymore
 */
function enhanceChatGPTBuyButton() {
    // DISABLED - This was overriding the ChatGPT button behavior
    // The ChatGPT button should open ChatGPT, not Pump.fun
    return;
    
    /* Original code disabled
    const originalButton = document.getElementById('aurora-chatgpt-btn');
    if (!originalButton) return;
    
    // Find the proceed button in modal
    const checkInterval = setInterval(() => {
        const proceedBtn = document.getElementById('aurora-proceed');
        if (proceedBtn) {
            clearInterval(checkInterval);
            
            // Store original click handler
            const originalClick = proceedBtn.onclick;
            
            // Replace with enhanced handler
            proceedBtn.onclick = () => {
                const acceptCheck = document.getElementById('aurora-accept');
                if (acceptCheck && acceptCheck.checked) {
                    // Close modal
                    const modal = document.getElementById('aurora-modal');
                    if (modal) modal.style.display = 'none';
                    
                    // Show purchase options
                    showPurchaseOptions();
                }
            };
        }
    }, 100);
    */
}

/**
 * Show purchase options overlay
 */
function showPurchaseOptions() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'pump-fun-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 2000000;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.3s;
    `;
    
    // Create options container
    const container = document.createElement('div');
    container.style.cssText = `
        background: linear-gradient(135deg, #1e1e2e, #2d2d44);
        border-radius: 20px;
        padding: 40px;
        max-width: 600px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(102, 126, 234, 0.3);
        border: 1px solid rgba(102, 126, 234, 0.5);
    `;
    
    container.innerHTML = `
        <h2 style="color: white; margin: 0 0 30px 0; text-align: center; font-size: 28px;">
            🚀 Buy STBTCX Tokens on Solana
        </h2>
        
        <div style="display: grid; gap: 20px;">
            ${PUMP_FUN_CONFIG.packages.map((pkg, index) => `
                <div style="
                    background: rgba(255, 255, 255, 0.05);
                    border: 2px solid rgba(102, 126, 234, 0.3);
                    border-radius: 12px;
                    padding: 20px;
                    cursor: pointer;
                    transition: all 0.3s;
                " onmouseover="this.style.borderColor='rgba(102, 126, 234, 0.8)'; this.style.transform='scale(1.02)'" 
                   onmouseout="this.style.borderColor='rgba(102, 126, 234, 0.3)'; this.style.transform='scale(1)'"
                   onclick="handleDirectPurchase(${pkg.amount})">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h3 style="color: #667eea; margin: 0 0 8px 0;">
                                ${pkg.amount.toLocaleString()} STBTCX
                            </h3>
                            <p style="color: #999; margin: 0; font-size: 14px;">
                                ${pkg.description}
                            </p>
                        </div>
                        <div style="text-align: right;">
                            <div style="color: #4ade80; font-size: 24px; font-weight: bold;">
                                $${pkg.price}
                            </div>
                            <div style="color: #666; font-size: 12px;">
                                $${(pkg.price / pkg.amount).toFixed(4)}/token
                            </div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1); text-align: center;">
            <p style="color: #999; font-size: 12px; margin: 0 0 10px 0;">
                Contract: ${PUMP_FUN_CONFIG.contractAddress.substring(0, 8)}...${PUMP_FUN_CONFIG.contractAddress.slice(-6)}
            </p>
            <p style="color: #999; font-size: 12px; margin: 0;">
                All purchases are executed on Pump.fun marketplace
            </p>
        </div>
        
        <button onclick="document.getElementById('pump-fun-overlay').remove()" style="
            position: absolute;
            top: 20px;
            right: 20px;
            background: transparent;
            border: none;
            color: #999;
            font-size: 24px;
            cursor: pointer;
        ">✕</button>
    `;
    
    overlay.appendChild(container);
    document.body.appendChild(overlay);
    
    // Close on background click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
}

/**
 * Initialize on page load
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceChatGPTBuyButton);
} else {
    setTimeout(enhanceChatGPTBuyButton, 100);
}

// Export for use in other scripts
window.PumpFunIntegration = {
    initPurchase: initPumpFunPurchase,
    getPrice: getTokenPrice,
    verifyTx: verifyTransaction,
    handlePurchase: handleDirectPurchase,
    config: PUMP_FUN_CONFIG
};