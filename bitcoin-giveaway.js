// Bitcoin Giveaway Container Component
function createBitcoinGiveaway() {
    const giveawayHTML = `
    <!-- Bitcoin Giveaway Container - Reduzido em 50% -->
    <div id="bitcoin-giveaway" style="
        background: linear-gradient(135deg, #f7931a 0%, #ff9500 100%);
        padding: 4px 6px;
        margin: 5px auto;
        max-width: 160px;
        border-radius: 6px;
        box-shadow: 0 1px 5px rgba(247, 147, 26, 0.3);
        text-align: center;
        position: relative;
        overflow: hidden;
        animation: pulseGlow 3s infinite;
    ">
        <!-- Background Bitcoin Icon - Reduzido -->
        <div style="
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            opacity: 0.1;
            font-size: 30px;
            z-index: 0;
        ">₿</div>
        
        <!-- Content -->
        <div style="position: relative; z-index: 1;">
            <p id="main-title" style="
                color: white;
                font-size: 10px;
                margin: 0 0 4px 0;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
            ">🎰 Concorra para ganhar 1 Bitcoin inteiro 🎰</p>
            
            <!-- Slot Machine Style Display - Reduzido com imagens temáticas -->
            <div style="
                display: flex;
                justify-content: center;
                gap: 2px;
                margin: 5px 0;
            ">
                <div class="slot-box">
                    <div class="slot-number" id="slot1" style="font-size: 12px;">₿</div>
                </div>
                <div class="slot-box">
                    <div class="slot-number" id="slot2" style="font-size: 12px;">💎</div>
                </div>
                <div class="slot-box">
                    <div class="slot-number" id="slot3" style="font-size: 12px;">👁</div>
                </div>
                <div class="slot-box">
                    <div class="slot-number" id="slot4" style="font-size: 12px;">🚀</div>
                </div>
            </div>
            
            <!-- Lever Button para jogar -->
            <div id="lever-container" style="display: none; margin: 5px auto;">
                <button onclick="pullLever()" style="
                    background: linear-gradient(180deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%);
                    border: 2px solid #B8860B;
                    border-radius: 10px 10px 20px 20px;
                    padding: 8px 6px;
                    font-size: 10px;
                    font-weight: bold;
                    color: #333;
                    cursor: pointer;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    transition: all 0.3s;
                    width: 60px;
                " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                    🎰 JOGAR
                </button>
            </div>
            
            <!-- Entry Form - Reduzido -->
            <div id="entry-form" style="margin: 5px 0;">
                <input type="email" id="giveaway-email" placeholder="E-mail" style="
                    width: 70px;
                    padding: 3px 4px;
                    border: 1px solid #fff;
                    border-radius: 3px;
                    font-size: 9px;
                    margin-right: 2px;
                    background: rgba(255,255,255,0.9);
                ">
                
                <button onclick="enterGiveaway()" style="
                    background: white;
                    color: #f7931a;
                    border: none;
                    padding: 3px 6px;
                    border-radius: 3px;
                    font-size: 9px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: all 0.3s;
                    text-transform: uppercase;
                " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    Participar
                </button>
            </div>
        </div>
    </div>
    
    <style>
        @keyframes pulseGlow {
            0% { box-shadow: 0 2px 10px rgba(247, 147, 26, 0.3); }
            50% { box-shadow: 0 2px 15px rgba(247, 147, 26, 0.6); }
            100% { box-shadow: 0 2px 10px rgba(247, 147, 26, 0.3); }
        }
        
        @keyframes spin {
            0% { transform: translateY(0); }
            100% { transform: translateY(-100%); }
        }
        
        .slot-box {
            background: rgba(0,0,0,0.8);
            border: 1px solid #fff;
            padding: 4px 3px;
            border-radius: 3px;
            min-width: 18px;
            box-shadow: inset 0 1px 3px rgba(0,0,0,0.5);
        }
        
        .slot-number {
            color: #00ff00;
            font-size: 10px;
            font-weight: bold;
            font-family: 'Courier New', monospace;
            text-shadow: 0 0 5px #00ff00;
            animation: slotAnimation 0.5s infinite alternate;
        }
        
        @keyframes slotAnimation {
            0% { opacity: 0.8; }
            100% { opacity: 1; }
        }
        
        @keyframes jackpotWin {
            0% { 
                color: #00ff00;
                transform: scale(1);
            }
            100% { 
                color: #ffff00;
                transform: scale(1.2);
                text-shadow: 0 0 20px #ffff00;
            }
        }
        
        #bitcoin-giveaway input:focus {
            outline: none;
            border-color: #f7931a;
        }
    </style>
    `;
    
    return giveawayHTML;
}

// Slot Machine Animation
function startSlotMachine() {
    // Símbolos temáticos Bitcoin: Bitcoin, Satoshi, Diamante, Laser Eyes, Michael Saylor, Rocket
    const symbols = ['₿', '🧑', '💎', '👁', '🚀', '💰', '⚡', '🔥'];
    const slots = ['slot1', 'slot2', 'slot3', 'slot4'];
    
    function spinSlot(slotId) {
        const slot = document.getElementById(slotId);
        if (!slot) return;
        
        // Random spin effect
        let spins = 0;
        const maxSpins = Math.floor(Math.random() * 10) + 10;
        
        const spinInterval = setInterval(() => {
            slot.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            spins++;
            
            if (spins >= maxSpins) {
                clearInterval(spinInterval);
                // Final symbol
                const finalSymbol = Math.random() < 0.1 ? '₿' : symbols[Math.floor(Math.random() * symbols.length)];
                slot.textContent = finalSymbol;
                
                // Check for jackpot (all ₿)
                checkJackpot();
            }
        }, 100);
    }
    
    function animateSlots() {
        slots.forEach((slotId, index) => {
            setTimeout(() => {
                spinSlot(slotId);
            }, index * 200); // Staggered animation
        });
    }
    
    function checkJackpot() {
        const slot1 = document.getElementById('slot1');
        const slot2 = document.getElementById('slot2');
        const slot3 = document.getElementById('slot3');
        const slot4 = document.getElementById('slot4');
        
        if (slot1 && slot2 && slot3 && slot4) {
            if (slot1.textContent === '₿' && 
                slot2.textContent === '₿' && 
                slot3.textContent === '₿' && 
                slot4.textContent === '₿') {
                // Jackpot animation
                slots.forEach(slotId => {
                    const slot = document.getElementById(slotId);
                    if (slot) {
                        slot.style.animation = 'jackpotWin 0.5s infinite alternate';
                    }
                });
                
                setTimeout(() => {
                    slots.forEach(slotId => {
                        const slot = document.getElementById(slotId);
                        if (slot) {
                            slot.style.animation = 'slotAnimation 0.5s infinite alternate';
                        }
                    });
                }, 3000);
            }
        }
    }
    
    // Initial animation
    animateSlots();
    
    // Periodic spin
    setInterval(animateSlots, 15000); // Spin every 15 seconds
}

// Pull Lever function
function pullLever() {
    const slots = ['slot1', 'slot2', 'slot3', 'slot4'];
    const symbols = ['₿', '🧑', '💎', '👁', '🚀', '💰', '⚡', '🔥'];
    
    // Animate each slot
    slots.forEach((slotId, index) => {
        setTimeout(() => {
            const slot = document.getElementById(slotId);
            if (slot) {
                // Rapid spinning animation
                let spins = 0;
                const spinInterval = setInterval(() => {
                    slot.textContent = symbols[Math.floor(Math.random() * symbols.length)];
                    slot.style.fontSize = '12px';
                    spins++;
                    
                    if (spins >= 10) {
                        clearInterval(spinInterval);
                        // Final symbol
                        const finalSymbol = symbols[Math.floor(Math.random() * symbols.length)];
                        slot.textContent = finalSymbol;
                        
                        // Check result after last slot
                        if (index === 3) {
                            setTimeout(checkResult, 500);
                        }
                    }
                }, 100);
            }
        }, index * 200);
    });
}

// Check result function
function checkResult() {
    const slot1 = document.getElementById('slot1');
    const slot2 = document.getElementById('slot2');
    const slot3 = document.getElementById('slot3');
    const slot4 = document.getElementById('slot4');
    
    if (slot1 && slot2 && slot3 && slot4) {
        // Check if all slots are Bitcoin symbol
        if (slot1.textContent === '₿' && 
            slot2.textContent === '₿' && 
            slot3.textContent === '₿' && 
            slot4.textContent === '₿') {
            // All Bitcoin - but never say they won
            alert('🎯 Continue treinando para o futuro desafio real!');
        } else {
            // Different symbols
            alert('❌ Não foi dessa vez! Tente novamente.');
        }
    }
}

// Entry function
function enterGiveaway() {
    const email = document.getElementById('giveaway-email').value;
    
    if (!email) {
        alert('Por favor, insira seu e-mail');
        return;
    }
    
    if (!validateEmail(email)) {
        alert('Por favor, insira um e-mail válido');
        return;
    }
    
    // Save to localStorage to prevent duplicate entries
    const entries = JSON.parse(localStorage.getItem('btc_giveaway_entries') || '[]');
    
    if (entries.includes(email)) {
        alert('Você já está participando! Use a alavanca para jogar!');
        // Show lever button
        const leverContainer = document.getElementById('lever-container');
        if (leverContainer) leverContainer.style.display = 'block';
        return;
    }
    
    entries.push(email);
    localStorage.setItem('btc_giveaway_entries', JSON.stringify(entries));
    
    // Hide form and show lever
    const entryForm = document.getElementById('entry-form');
    const leverContainer = document.getElementById('lever-container');
    const mainTitle = document.getElementById('main-title');
    
    if (entryForm) entryForm.style.display = 'none';
    if (leverContainer) leverContainer.style.display = 'block';
    if (mainTitle) {
        mainTitle.innerHTML = '🎁 Aguarde para uma grande aventura 🎁';
        mainTitle.style.fontSize = '9px';
    }
    
    // Update participants count
    const participantsEl = document.getElementById('participants');
    if (participantsEl) {
        let count = parseInt(participantsEl.textContent.replace(/,/g, ''));
        count += 1;
        participantsEl.textContent = count.toLocaleString();
    }
    
    // Success message
    alert('🎉 Aguarde para uma grande aventura! Use a alavanca para jogar!');
    
    // Optional: Send to backend
    // fetch('/api/giveaway-entry', { 
    //     method: 'POST',
    //     body: JSON.stringify({ email }),
    //     headers: { 'Content-Type': 'application/json' }
    // });
}

// Email validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Update BTC value (optional - fetch real price)
async function updateBTCPrice() {
    try {
        const response = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=BTC');
        const data = await response.json();
        const price = parseFloat(data.data.rates.USD);
        
        const btcValueEl = document.getElementById('btc-value');
        if (btcValueEl) {
            btcValueEl.textContent = `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
        }
    } catch (error) {
        console.log('Using default BTC price');
    }
}

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            startSlotMachine();
            updateBTCPrice();
            
            // Check if user already entered
            const entries = JSON.parse(localStorage.getItem('btc_giveaway_entries') || '[]');
            if (entries.length > 0) {
                // User already registered - show lever
                const entryForm = document.getElementById('entry-form');
                const leverContainer = document.getElementById('lever-container');
                const mainTitle = document.getElementById('main-title');
                
                if (entryForm) entryForm.style.display = 'none';
                if (leverContainer) leverContainer.style.display = 'block';
                if (mainTitle) {
                    mainTitle.innerHTML = '🎁 Aguarde para uma grande aventura 🎁';
                    mainTitle.style.fontSize = '9px';
                }
            }
        }, 100);
    });
}