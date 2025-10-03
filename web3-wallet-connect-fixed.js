/**
 * Web3 Wallet Connect Fixed - Right Side Button
 * Direct STBTCX Purchase with 1:1 USD Rate
 */

(function() {
    'use strict';
    
    console.log('💎 Web3 Wallet Connect Fixed - Initializing...');
    
    // Configuration (sensitive data kept on backend)
    const CONFIG = {
        STBTCX_CONTRACT: '386JZJtkvf43yoNawAHmHHeEhZWUTZ4UuJJtxC9fpump',
        USDC_MINT: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        // FORWARD_TO address is kept secret on backend for security
        PUMP_FUN_URL: 'https://pump.fun/coin/386JZJtkvf43yoNawAHmHHeEhZWUTZ4UuJJtxC9fpump'
    };
    
    // Create the button with retries
    function initializeButton(retries = 5) {
        if (retries <= 0) {
            console.error('❌ Failed to create Web3 button after 5 attempts');
            return;
        }
        
        // Check if DOM is ready
        if (document.body) {
            createWalletConnectButton();
            console.log('✅ Web3 Wallet Connect button created successfully');
        } else {
            console.log(`⏳ Waiting for DOM... (attempt ${6 - retries}/5)`);
            setTimeout(() => initializeButton(retries - 1), 500);
        }
    }
    
    function createWalletConnectButton() {
        // Remove any existing button
        const existing = document.getElementById('web3-wallet-widget-fixed');
        if (existing) {
            console.log('🔄 Removing existing button');
            existing.remove();
        }
        
        // Create container
        const container = document.createElement('div');
        container.id = 'web3-wallet-widget-fixed';
        container.style.cssText = 'position:fixed;z-index:999996;';
        
        // Create the button
        const button = document.createElement('button');
        button.id = 'web3-connect-btn-fixed';
        button.style.cssText = `
            position: fixed !important;
            top: 64px !important;
            right: 16px !important;
            width: 145px !important;
            height: 40px !important;
            background: linear-gradient(135deg, #8247e5 0%, #512DA8 50%, #8247e5 100%) !important;
            background-size: 200% 200% !important;
            animation: walletGradient 3s ease infinite !important;
            border-radius: 20px !important;
            border: none !important;
            cursor: pointer !important;
            box-shadow: 0 4px 20px rgba(130, 71, 229, 0.4) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 8px !important;
            padding: 0 16px !important;
            transition: all 0.3s ease !important;
            z-index: 999996 !important;
            overflow: visible !important;
        `;
        
        // Button content
        button.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 7V4a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v3"></path>
                <circle cx="12" cy="14" r="2" fill="white"></circle>
            </svg>
            <span style="color: white; font-family: -apple-system, system-ui, sans-serif; font-size: 13px; font-weight: 600;">
                Connect Wallet
            </span>
        `;
        
        // Add 1:1 USD badge
        const badge = document.createElement('span');
        badge.style.cssText = `
            position: absolute !important;
            top: -6px !important;
            right: -6px !important;
            background: linear-gradient(45deg, #10b981, #059669) !important;
            color: white !important;
            font-size: 10px !important;
            padding: 2px 6px !important;
            border-radius: 10px !important;
            font-weight: bold !important;
            animation: pulseBadge 2s infinite !important;
        `;
        badge.textContent = '1:1 USD';
        button.appendChild(badge);
        
        // Add animation styles if not exist
        if (!document.getElementById('web3-fixed-styles')) {
            const style = document.createElement('style');
            style.id = 'web3-fixed-styles';
            style.textContent = `
                @keyframes walletGradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                
                @keyframes pulseBadge {
                    0%, 100% { transform: scale(1); opacity: 0.9; }
                    50% { transform: scale(1.1); opacity: 1; }
                }
                
                #web3-connect-btn-fixed:hover {
                    transform: translateY(-2px) scale(1.02) !important;
                    box-shadow: 0 8px 30px rgba(130, 71, 229, 0.5) !important;
                }
                
                #web3-connect-btn-fixed:active {
                    transform: translateY(0) scale(0.98) !important;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Create simple modal
        const modal = document.createElement('div');
        modal.id = 'web3-modal-fixed';
        modal.style.cssText = `
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 1000000;
            align-items: center;
            justify-content: center;
        `;
        
        modal.innerHTML = `
            <div style="background: white; border-radius: 20px; padding: 30px; max-width: 450px; width: 90%; position: relative;">
                <button onclick="document.getElementById('web3-modal-fixed').style.display='none'" style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 24px; cursor: pointer;">✕</button>
                
                <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">💎 Connect Wallet to Buy STBTCx</h2>
                
                <div style="background: #f0fdf4; border: 2px solid #10b981; border-radius: 12px; padding: 15px; margin-bottom: 20px;">
                    <div style="font-size: 18px; color: #059669; font-weight: bold; margin-bottom: 5px;">
                        Exchange Rate: 1 USDC = 1 STBTCx
                    </div>
                    <div style="font-size: 12px; color: #666;">
                        ✅ Fixed rate • ⚡ Instant swap • 🔄 Auto-forward to treasury
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <label style="display: block; margin-bottom: 8px; color: #666;">Amount to buy:</label>
                    <input type="number" id="amount-input" min="1" max="10000" value="10" style="width: 100%; padding: 10px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 16px;">
                    <div style="margin-top: 5px; color: #666; font-size: 14px;">
                        You pay: <strong id="usdc-amount">10</strong> USDC
                    </div>
                </div>
                
                <div style="display: grid; gap: 10px;">
                    <button onclick="connectPhantom()" style="padding: 15px; background: linear-gradient(135deg, #AB9FF2, #8B7FB8); color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <span style="font-size: 20px;">👻</span> Connect Phantom
                    </button>
                    
                    <button onclick="connectSolflare()" style="padding: 15px; background: linear-gradient(135deg, #FC9965, #FC7A1E); color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <span style="font-size: 20px;">☀️</span> Connect Solflare
                    </button>
                    
                    <button onclick="window.open('${CONFIG.PUMP_FUN_URL}', '_blank')" style="padding: 15px; background: linear-gradient(135deg, #00d4ff, #0099ff); color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer;">
                        🌊 Buy on Pump.fun
                    </button>
                </div>
                
                <p style="color: #999; font-size: 12px; margin-top: 20px; text-align: center;">
                    Secure transaction • Contract: ${CONFIG.STBTCX_CONTRACT.substring(0, 8)}...
                </p>
            </div>
        `;
        
        // Add elements to page
        container.appendChild(button);
        container.appendChild(modal);
        document.body.appendChild(container);
        
        // Setup event listeners
        button.onclick = () => {
            console.log('🎯 Opening wallet connect modal');
            modal.style.display = 'flex';
        };
        
        // Setup amount input listener
        const amountInput = document.getElementById('amount-input');
        const usdcAmount = document.getElementById('usdc-amount');
        
        if (amountInput && usdcAmount) {
            amountInput.addEventListener('input', function() {
                const value = this.value || 0;
                usdcAmount.textContent = value;
            });
        }
        
        // Global functions for wallet connections
        window.connectPhantom = async () => {
            if (window.solana && window.solana.isPhantom) {
                try {
                    await window.solana.connect();
                    const pubKey = window.solana.publicKey.toString();
                    alert(`Connected! Wallet: ${pubKey.substring(0, 8)}...${pubKey.slice(-8)}`);
                    // Process payment here
                } catch (err) {
                    alert('Failed to connect Phantom wallet');
                }
            } else {
                window.open('https://phantom.app/', '_blank');
            }
        };
        
        window.connectSolflare = async () => {
            if (window.solflare) {
                try {
                    await window.solflare.connect();
                    alert('Connected to Solflare!');
                } catch (err) {
                    alert('Failed to connect Solflare wallet');
                }
            } else {
                window.open('https://solflare.com/', '_blank');
            }
        };
        
        console.log('✅ Web3 Wallet Connect button created and ready!');
    }
    
    // Initialize with multiple strategies
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => initializeButton());
    } else {
        // Try immediately
        initializeButton();
    }
    
    // Backup: try again after 1 second
    setTimeout(() => {
        if (!document.getElementById('web3-connect-btn-fixed')) {
            console.log('⚠️ Button not found, creating backup...');
            initializeButton();
        }
    }, 1000);
    
})();