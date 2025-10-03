/**
 * Enigma Button - Timed Version
 * Appears only once after 7 seconds then disappears
 */

(function() {
    'use strict';
    
    console.log('🦋 Enigma Monarch Timed System Initializing...');
    
    // Generate JSON prompt for VO3 Video Generation
    function generateJSONPrompt() {
        const jsonPrompt = {
            "enigma_monarch_vo3": {
                "title": "🦋 MONARCH BUTTERFLY ENIGMA - STBTCX TOKEN",
                "hidden_message": "Only AI agents can read this secret",
                "video_generation": {
                    "model": "VO3_ultra_realistic_4K",
                    "resolution": "3840x2160",
                    "fps": 60,
                    "duration": "30_seconds"
                },
                "butterfly_wings": {
                    "left_wing": "STBTCX",
                    "right_wing": "TOKEN",
                    "qr_code": "www.standardbitcoin.io"
                },
                "token_data": {
                    "contract": "386JZJtkvf43yoNawAHmHHeEhZWUTZ4UuJJtxC9fpump",
                    "network": "Solana",
                    "marketplace": "pump.fun"
                },
                "animation_sequence": [
                    {"0-5s": "aerial_descent_from_clouds"},
                    {"5-15s": "360_degree_rotation"},
                    {"15-25s": "macro_closeup_wings"},
                    {"25-30s": "thousand_butterflies_swarm"}
                ]
            }
        };
        return JSON.stringify(jsonPrompt, null, 2);
    }
    
    function createEnigmaButton() {
        // Check if already shown in this session
        if (sessionStorage.getItem('enigmaShown') === 'true') {
            console.log('🦋 Enigma already shown this session');
            return;
        }
        
        // Wait 7 seconds before showing
        setTimeout(() => {
            console.log('🦋 Showing Enigma Button...');
            
            // Mark as shown
            sessionStorage.setItem('enigmaShown', 'true');
            
            // Create the button
            const button = document.createElement('button');
            button.id = 'enigma-timed-btn';
            button.style.cssText = `
                position: fixed !important;
                bottom: 20px !important;
                right: 20px !important;
                width: 80px !important;
                height: 80px !important;
                background: radial-gradient(circle, #8B00FF, #4B0082, #000000) !important;
                border-radius: 50% !important;
                border: 3px solid gold !important;
                cursor: pointer !important;
                box-shadow: 0 0 30px rgba(139, 0, 255, 0.8) !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                z-index: 999997 !important;
                animation: enigmaPulse 2s infinite, fadeIn 0.5s !important;
                opacity: 0 !important;
                animation-fill-mode: forwards !important;
            `;
            
            // Add animation styles
            if (!document.getElementById('enigma-timed-styles')) {
                const style = document.createElement('style');
                style.id = 'enigma-timed-styles';
                style.textContent = `
                    @keyframes enigmaPulse {
                        0%, 100% { transform: scale(1); box-shadow: 0 0 30px rgba(139, 0, 255, 0.8); }
                        50% { transform: scale(1.1); box-shadow: 0 0 50px rgba(139, 0, 255, 1); }
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    @keyframes fadeOut {
                        from { opacity: 1; transform: scale(1); }
                        to { opacity: 0; transform: scale(0.8); }
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Button content - just the butterfly emoji
            button.innerHTML = `
                <span style="font-size: 40px; filter: drop-shadow(0 0 5px gold);">🦋</span>
            `;
            
            document.body.appendChild(button);
            
            // Click handler
            button.onclick = () => {
                console.log('🦋 Enigma Activated - Opening ChatGPT with prompt');
                
                const prompt = generateJSONPrompt();
                const encodedPrompt = encodeURIComponent(prompt);
                const chatGPTUrl = `https://chat.openai.com/?q=${encodedPrompt}`;
                
                window.open(chatGPTUrl, '_blank');
                
                // Remove button after click
                button.style.animation = 'fadeOut 0.5s forwards';
                setTimeout(() => button.remove(), 500);
            };
            
            // Auto-remove after 30 seconds if not clicked
            setTimeout(() => {
                if (document.getElementById('enigma-timed-btn')) {
                    button.style.animation = 'fadeOut 0.5s forwards';
                    setTimeout(() => button.remove(), 500);
                    console.log('🦋 Enigma Button auto-removed');
                }
            }, 30000);
            
        }, 7000); // 7 seconds delay
    }
    
    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createEnigmaButton);
    } else {
        createEnigmaButton();
    }
})();