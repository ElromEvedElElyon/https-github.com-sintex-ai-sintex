/* SintexOS Voice Communication Module */
(function () {
  const I = SOS.ICO;
  let audioCtx, analyser, micStream, animFrame, callActive = false, callContact = null;

  // Expose voice namespace
  SOS.voice = {
    call(contactId) { startCall(contactId); },
    hangup() { endCall(); },
    isActive() { return callActive; }
  };

  function startCall(contactId) {
    if (callActive) return;
    callActive = true;
    callContact = contactId;
    SOS.sound('call');
    showCallOverlay(contactId);
    initMicrophone();
  }

  function endCall() {
    callActive = false;
    callContact = null;
    if (micStream) { micStream.getTracks().forEach(t => t.stop()); micStream = null; }
    if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
    if (audioCtx && audioCtx.state !== 'closed') audioCtx.close();
    audioCtx = null; analyser = null;
    const overlay = SOS.$('#voice-overlay');
    if (overlay) { overlay.classList.add('closing'); setTimeout(() => overlay.remove(), 300); }
    SOS.sound('click');
  }

  async function initMicrophone() {
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(micStream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      drawWaveform();
    } catch (e) {
      SOS.toast('Microphone access denied');
      // Continue call without mic (TTS only)
      drawFakeWaveform();
    }
  }

  function drawWaveform() {
    const canvas = SOS.$('#voice-waveform');
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext('2d');
    const bufLen = analyser.frequencyBinCount;
    const data = new Uint8Array(bufLen);
    const W = canvas.width, H = canvas.height;

    const draw = () => {
      if (!callActive) return;
      animFrame = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(data);

      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(0, 0, W, H);

      const barW = (W / bufLen) * 2.5;
      let x = 0;
      for (let i = 0; i < bufLen; i++) {
        const v = data[i] / 255;
        const barH = v * H * 0.8;
        const hue = 190 + v * 40;
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${0.6 + v * 0.4})`;
        ctx.fillRect(x, H - barH, barW - 1, barH);
        // Mirror on top
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${0.2 + v * 0.2})`;
        ctx.fillRect(x, 0, barW - 1, barH * 0.3);
        x += barW;
      }
    };
    draw();
  }

  function drawFakeWaveform() {
    const canvas = SOS.$('#voice-waveform');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    let t = 0;

    const draw = () => {
      if (!callActive) return;
      animFrame = requestAnimationFrame(draw);
      t += 0.03;
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(0, 0, W, H);
      const bars = 64;
      const barW = W / bars;
      for (let i = 0; i < bars; i++) {
        const v = (Math.sin(t * 2 + i * 0.3) * 0.3 + 0.35) * (0.5 + Math.sin(t * 0.5) * 0.2);
        const barH = v * H;
        ctx.fillStyle = `hsla(200, 80%, 60%, ${0.3 + v * 0.5})`;
        ctx.fillRect(i * barW, H / 2 - barH / 2, barW - 1, barH);
      }
    };
    draw();
  }

  function showCallOverlay(contactId) {
    let overlay = SOS.$('#voice-overlay');
    if (overlay) overlay.remove();

    const contacts = {
      jarvis: { name: 'JARVIS', color: '#60CDFF' },
      bitnet: { name: 'BitNet Engine', color: '#00ff88' },
      picoclaw: { name: 'PicoClaw', color: '#ff9500' },
      skynet: { name: 'Skynet', color: '#ff4444' },
      deepseek: { name: 'DeepSeek V3', color: '#a855f7' },
    };
    const c = contacts[contactId] || { name: contactId, color: '#60CDFF' };

    overlay = SOS.h('div', { id: 'voice-overlay', className: 'voice-overlay' });
    overlay.innerHTML = `
      <div class="vo-content">
        <div class="vo-avatar" style="border-color:${c.color}">
          <div class="vo-avatar-inner" style="background:${c.color}">${c.name[0]}</div>
          <div class="vo-pulse" style="border-color:${c.color}"></div>
        </div>
        <div class="vo-name">${c.name}</div>
        <div class="vo-status" id="vo-call-status">Connecting...</div>
        <div class="vo-timer" id="vo-timer">00:00</div>
        <canvas id="voice-waveform" width="500" height="120"></canvas>
        <div class="vo-controls">
          <button class="vo-btn vo-mute" id="vo-mute" title="Mute">
            ${I.voice}
          </button>
          <button class="vo-btn vo-hangup" id="vo-hangup" title="Hang up">
            ${I.phone}
          </button>
          <button class="vo-btn vo-speak" id="vo-speak" title="Push to Speak">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
          </button>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    // Timer
    let seconds = 0;
    const timerEl = overlay.querySelector('#vo-timer');
    const statusEl = overlay.querySelector('#vo-call-status');

    setTimeout(() => {
      statusEl.textContent = 'Connected';
      SOS.sound('connect');
      const ti = setInterval(() => {
        if (!callActive) { clearInterval(ti); return; }
        seconds++;
        const m = String(Math.floor(seconds / 60)).padStart(2, '0');
        const s = String(seconds % 60).padStart(2, '0');
        timerEl.textContent = `${m}:${s}`;
      }, 1000);

      // Auto TTS greeting after 2s
      setTimeout(() => {
        if (!callActive) return;
        speakTTS(`${c.name} online. How can I assist you?`, contactId);
      }, 2000);
    }, 1500);

    // Controls
    overlay.querySelector('#vo-hangup').onclick = () => endCall();
    overlay.querySelector('#vo-mute').onclick = (e) => {
      const btn = e.currentTarget;
      btn.classList.toggle('active');
      if (micStream) {
        micStream.getAudioTracks().forEach(t => t.enabled = !t.enabled);
      }
    };

    // Push to speak - sends what user says to AI and gets TTS response
    const speakBtn = overlay.querySelector('#vo-speak');
    speakBtn.onclick = async () => {
      speakBtn.classList.add('active');
      statusEl.textContent = 'Listening...';
      // Use SpeechRecognition if available
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SR();
        recognition.lang = 'en-US';
        recognition.onresult = async (event) => {
          const text = event.results[0][0].transcript;
          statusEl.textContent = `You said: "${text}"`;
          speakBtn.classList.remove('active');
          // Get AI response
          try {
            const res = await fetch('/api/ws-relay', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ agent: contactId, message: text })
            });
            const data = await res.json();
            if (data.content && callActive) {
              speakTTS(data.content, contactId);
            }
          } catch { statusEl.textContent = 'Connected'; }
        };
        recognition.onerror = () => {
          speakBtn.classList.remove('active');
          statusEl.textContent = 'Connected';
        };
        recognition.start();
      } else {
        statusEl.textContent = 'Speech recognition not available';
        speakBtn.classList.remove('active');
        setTimeout(() => { if (callActive) statusEl.textContent = 'Connected'; }, 2000);
      }
    };
  }

  function speakTTS(text, contactId) {
    if (!('speechSynthesis' in window)) return;
    // Cancel any ongoing speech
    speechSynthesis.cancel();
    const clean = text.replace(/[#*_`\[\]()]/g, '').slice(0, 500);
    const utterance = new SpeechSynthesisUtterance(clean);
    // Different voice settings per agent
    const voiceSettings = {
      jarvis: { rate: 1.0, pitch: 0.9 },
      bitnet: { rate: 1.1, pitch: 1.2 },
      picoclaw: { rate: 1.2, pitch: 1.0 },
      skynet: { rate: 0.8, pitch: 0.7 },
      deepseek: { rate: 0.95, pitch: 0.85 },
    };
    const vs = voiceSettings[contactId] || { rate: 1.0, pitch: 1.0 };
    utterance.rate = vs.rate;
    utterance.pitch = vs.pitch;
    utterance.volume = 0.8;

    // Try to pick a good voice
    const voices = speechSynthesis.getVoices();
    const english = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google')) ||
                    voices.find(v => v.lang.startsWith('en'));
    if (english) utterance.voice = english;

    const statusEl = SOS.$('#vo-call-status');
    utterance.onstart = () => { if (statusEl) statusEl.textContent = 'Speaking...'; };
    utterance.onend = () => { if (statusEl && callActive) statusEl.textContent = 'Connected'; };
    speechSynthesis.speak(utterance);
  }

  // No app registration — voice is a module used by messenger and other apps
  // It creates an overlay, not a windowed app
})();
