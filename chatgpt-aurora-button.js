/**
 * ChatGPT Aurora Button - Beautiful Aurora Borealis Design
 * Positioned near header as a small, elegant badge
 */

(function() {
    'use strict';
    
    console.log('🌌 ChatGPT Aurora Button v5 Loading - Left Side Position...');
    
    function createAuroraButton() {
        // Remove existing button if any
        const existing = document.getElementById('aurora-chatgpt-widget');
        if (existing) existing.remove();
        
        // Create container
        const widget = document.createElement('div');
        widget.id = 'aurora-chatgpt-widget';
        widget.style.cssText = 'position:fixed;z-index:999999;';
        
        // Create button with aurora borealis effect
        const button = document.createElement('button');
        button.id = 'aurora-chatgpt-btn';
        button.style.cssText = `
            position: fixed !important;
            top: 16px !important;
            left: 20px !important;
            width: 160px !important;
            height: 38px !important;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%) !important;
            background-size: 300% 300% !important;
            animation: auroraShift 4s ease infinite !important;
            border-radius: 18px !important;
            border: none !important;
            cursor: pointer !important;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 8px !important;
            padding: 0 12px !important;
            transition: transform 0.3s, box-shadow 0.3s !important;
            z-index: 999999 !important;
            overflow: hidden !important;
        `;
        
        // Add aurora animation keyframes
        if (!document.getElementById('aurora-styles')) {
            const style = document.createElement('style');
            style.id = 'aurora-styles';
            style.textContent = `
                @keyframes auroraShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 0.8; }
                    50% { opacity: 1; }
                }
                
                #aurora-chatgpt-btn::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                    animation: shimmer 3s infinite;
                }
                
                #aurora-chatgpt-btn:hover {
                    transform: scale(1.05) !important;
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6) !important;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Button content
        button.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" style="filter: drop-shadow(0 0 3px rgba(255,255,255,0.5));">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97-1.138a3.638 3.638 0 00-1.925-.54 3.638 3.638 0 00-1.925.54l-1.97 1.138a3.638 3.638 0 00-1.385 1.385 3.638 3.638 0 000 2.77l1.97 1.138a3.638 3.638 0 001.925.54 3.638 3.638 0 001.925-.54l1.97-1.138a3.638 3.638 0 001.385-1.385 3.638 3.638 0 000-2.77 3.638 3.638 0 00-1.385-1.385z"/>
            </svg>
            <span style="color: white; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; font-weight: 500; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">
                ChatGPT Buy
            </span>
        `;
        
        // Small beta badge
        const badge = document.createElement('span');
        badge.style.cssText = `
            position: absolute !important;
            top: -5px !important;
            right: -5px !important;
            background: linear-gradient(45deg, #ff6b6b, #ff4757) !important;
            color: white !important;
            font-size: 9px !important;
            padding: 2px 5px !important;
            border-radius: 6px !important;
            font-weight: bold !important;
            font-family: sans-serif !important;
            animation: pulse 2s infinite !important;
            text-transform: uppercase !important;
            letter-spacing: 0.5px !important;
        `;
        badge.textContent = 'BETA';
        button.appendChild(badge);
        
        // Modal (simpler and more elegant)
        const modal = document.createElement('div');
        modal.id = 'aurora-modal';
        modal.style.cssText = `
            display: none;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: rgba(0,0,0,0.85) !important;
            backdrop-filter: blur(5px) !important;
            z-index: 1000000 !important;
            align-items: center !important;
            justify-content: center !important;
        `;
        
        modal.innerHTML = `
            <div id="aurora-modal-content" style="background: linear-gradient(135deg, #1e1e2e 0%, #2d2d44 100%); border-radius: 12px; max-width: 360px; width: 90%; max-height: 70vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.5); border: 1px solid rgba(102, 126, 234, 0.3); margin: 10px;">
                <div style="background: linear-gradient(135deg, #667eea, #764ba2); padding: 12px 16px; border-radius: 12px 12px 0 0; position: sticky; top: 0; z-index: 1;">
                    <h3 style="margin: 0; color: white; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, sans-serif; font-weight: 600;">
                        ⚠️ Beta Notice / Aviso
                    </h3>
                </div>
                <div style="padding: 16px; color: #e0e0e0; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
                    <div style="background: rgba(255,193,7,0.1); border: 1px solid rgba(255,193,7,0.3); border-radius: 6px; padding: 8px; margin-bottom: 12px;">
                        <p style="margin: 0; font-size: 11px; line-height: 1.4;">
                            🚨 Experimental / Experimental
                        </p>
                    </div>
                    <ul style="font-size: 11px; line-height: 1.6; margin: 12px 0; padding-left: 16px; color: #b0b0b0;">
                        <li>At your own risk / Seu risco</li>
                        <li>No refunds / Sem reembolso</li>
                        <li>Volatile / Volátil</li>
                        <li>18+ only / +18 anos</li>
                    </ul>
                    <label style="display: flex; align-items: center; gap: 8px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 6px; cursor: pointer; margin-top: 12px;">
                        <input type="checkbox" id="aurora-accept" style="width: 16px; height: 16px; cursor: pointer; flex-shrink: 0;">
                        <span style="font-size: 11px; color: #d0d0d0;">I agree / Concordo</span>
                    </label>
                </div>
                <div style="display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <button id="aurora-cancel" style="padding: 8px 12px; border: 1px solid rgba(255,255,255,0.2); background: transparent; color: #b0b0b0; border-radius: 6px; font-size: 12px; cursor: pointer; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
                        Cancel
                    </button>
                    <button id="aurora-proceed" disabled style="padding: 8px 12px; border: none; border-radius: 6px; font-size: 12px; cursor: not-allowed; background: rgba(102, 126, 234, 0.3); color: rgba(255,255,255,0.5); flex: 1; font-family: -apple-system, BlinkMacSystemFont, sans-serif; transition: all 0.3s;">
                        Proceed
                    </button>
                </div>
            </div>
        `;
        
        // Add elements
        widget.appendChild(button);
        widget.appendChild(modal);
        document.body.appendChild(widget);
        
        // Event handlers
        button.onclick = () => {
            modal.style.display = 'flex';
        };
        
        const cancelBtn = document.getElementById('aurora-cancel');
        const proceedBtn = document.getElementById('aurora-proceed');
        const acceptCheck = document.getElementById('aurora-accept');
        
        cancelBtn.onclick = () => {
            modal.style.display = 'none';
            acceptCheck.checked = false;
            proceedBtn.disabled = true;
            proceedBtn.style.background = 'rgba(102, 126, 234, 0.3)';
            proceedBtn.style.color = 'rgba(255,255,255,0.5)';
            proceedBtn.style.cursor = 'not-allowed';
        };
        
        acceptCheck.onchange = function() {
            proceedBtn.disabled = !this.checked;
            if (this.checked) {
                proceedBtn.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
                proceedBtn.style.color = 'white';
                proceedBtn.style.cursor = 'pointer';
            } else {
                proceedBtn.style.background = 'rgba(102, 126, 234, 0.3)';
                proceedBtn.style.color = 'rgba(255,255,255,0.5)';
                proceedBtn.style.cursor = 'not-allowed';
            }
        };
        
        proceedBtn.onclick = () => {
            if (acceptCheck.checked) {
                modal.style.display = 'none';
                
                // Show wallet input modal
                showWalletModal();
            }
        };
        
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                acceptCheck.checked = false;
                proceedBtn.disabled = true;
                proceedBtn.style.background = 'rgba(102, 126, 234, 0.3)';
                proceedBtn.style.color = 'rgba(255,255,255,0.5)';
                proceedBtn.style.cursor = 'not-allowed';
            }
        };
        
        console.log('✨ Aurora Button v5 Ready! Position: LEFT SIDE');
        
        // Wallet Modal Function (moved inside createAuroraButton scope)
        window.showWalletModal = function showWalletModal() {
        // Create wallet modal
        const walletModal = document.createElement('div');
        walletModal.id = 'stbtcx-wallet-modal';
        walletModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(5px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000001;
            animation: fadeIn 0.3s;
        `;
        
        walletModal.innerHTML = `
            <div style="background: linear-gradient(135deg, #1e1e2e, #2d2d44); padding: 25px; border-radius: 16px; width: 90%; max-width: 420px; max-height: 90vh; overflow-y: auto; text-align: center; position: relative; box-shadow: 0 20px 60px rgba(102, 126, 234, 0.4); border: 1px solid rgba(102, 126, 234, 0.3); margin: 20px;">
                <button onclick="document.getElementById('stbtcx-wallet-modal').remove()" style="position: absolute; top: 15px; right: 20px; border: none; background: transparent; font-size: 24px; color: #999; cursor: pointer; z-index: 1;">✕</button>
                
                <h2 style="margin: 0 0 15px 0; color: white; font-size: 24px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
                    🧠 Comprar STBTCX no ChatGPT
                </h2>
                
                <p style="font-size: 14px; color: #b0b0b0; margin-bottom: 25px; line-height: 1.5;">
                    Digite sua carteira Solana para receber os tokens automaticamente após o pagamento:
                </p>
                
                <input id="stbtcx-wallet-input" type="text" placeholder="Ex: CR7hfdG28qq5N9T4FyqsZjUY3ZFh7mA9BdiH8pmHvzx7" 
                    style="width: 100%; padding: 14px; border: 2px solid rgba(102, 126, 234, 0.3); border-radius: 8px; background: rgba(255, 255, 255, 0.05); color: white; font-size: 14px; margin-bottom: 20px; font-family: monospace;">
                
                <button id="phantom-connect-btn" style="width: 100%; padding: 12px; margin-bottom: 15px; background: linear-gradient(135deg, #512DA8, #673AB7); color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDI0QzE4LjYyNzQgMjQgMjQgMTguNjI3NCAyNCAxMkMyNCA1LjM3MjU4IDE4LjYyNzQgMCAxMiAwQzUuMzcyNTggMCAwIDUuMzcyNTggMCAxMkMwIDE4LjYyNzQgNS4zNzI1OCAyNCAxMiAyNFoiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcikiLz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhciIgeDE9IjEyIiB5MT0iMCIgeDI9IjEyIiB5Mj0iMjQiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iI0FCOUZGMiIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM1MzM4QTgiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4=" width="20" height="20">
                    Conectar Phantom Wallet
                </button>
                
                <button id="launch-gpt-btn" style="width: 100%; padding: 14px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: bold; cursor: pointer; transition: all 0.3s;">
                    ➤ Ir para ChatGPT
                </button>
                
                <p style="margin-top: 15px; font-size: 11px; color: #888;">
                    Tokens STBTCX serão enviados automaticamente após o pagamento no ChatGPT
                </p>
            </div>
        `;
        
        document.body.appendChild(walletModal);
        
        // Phantom wallet detection and connection
        const phantomBtn = document.getElementById('phantom-connect-btn');
        const walletInput = document.getElementById('stbtcx-wallet-input');
        const launchBtn = document.getElementById('launch-gpt-btn');
        
        // Check if Phantom is installed
        if (window.solana && window.solana.isPhantom) {
            phantomBtn.onclick = async () => {
                try {
                    const resp = await window.solana.connect();
                    walletInput.value = resp.publicKey.toString();
                    phantomBtn.textContent = '✓ Wallet Conectada';
                    phantomBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45A049)';
                } catch (err) {
                    console.error('Phantom connection error:', err);
                }
            };
            
            // Try auto-connect if already trusted
            window.solana.connect({ onlyIfTrusted: true })
                .then(({ publicKey }) => {
                    if (publicKey) {
                        walletInput.value = publicKey.toString();
                        phantomBtn.textContent = '✓ Wallet Conectada';
                        phantomBtn.style.background = 'linear-gradient(135deg, #4CAF50, #45A049)';
                    }
                })
                .catch(() => {});
        } else {
            phantomBtn.textContent = '⚠️ Instale Phantom Wallet';
            phantomBtn.style.opacity = '0.5';
            phantomBtn.style.cursor = 'not-allowed';
            phantomBtn.onclick = () => {
                window.open('https://phantom.app/', '_blank');
            };
        }
        
        // Launch GPT with wallet
        launchBtn.onclick = () => {
            const wallet = walletInput.value.trim();
            
            if (!wallet || wallet.length < 32) {
                walletInput.style.borderColor = '#ff4444';
                walletInput.placeholder = '⚠️ Digite um endereço Solana válido';
                return;
            }
            
            // Build GPT URL with wallet
            const prompt = encodeURIComponent(`Hi! I want to buy STBTCX tokens. My wallet is ${wallet}`);
            const gptLink = `https://chatgpt.com/g/g-68dd62ad6ec08191bb36217bd282e771-stbtcx-solana-shop?prompt=${prompt}`;
            
            // Open GPT
            window.open(gptLink, '_blank');
            
            // Close modal
            walletModal.remove();
            
            console.log('✅ Opening STBTCX Solana Shop GPT with wallet:', wallet);
        };
        
        // Enter key support
        walletInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                launchBtn.click();
            }
        });
        } // Close showWalletModal function
    } // Close createAuroraButton function
    
    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createAuroraButton);
    } else {
        setTimeout(createAuroraButton, 100);
    }
})();