/* ==========================================================================
   IN MY BIRTHDAY ERA - JAVASCRIPT ENGINE (SHANMATHI EDITION)
   Audio Engine (Real MP3 Songs & Fallback Synth), Confetti Physics, Easter Egg Tracker
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------------
     1. CONFIGURATION & SHANMATHI'S 5 REAL SONGS IN ASSETS
     ------------------------------------------------------------------------ */
  const CONFIG = {
    recipientName: "Shanmathi Bhavani V",
    shortName: "Shanmathi",
    birthDate: "August 14, 2003",
    totalEasterEggStars: 13,
    strand1Text: "SHANMATHI BHAVANI V",
    strand2Text: "AUGUST 14 ✦ IN HER BIRTHDAY ERA",
    eraThemes: ['fearless', 'red', '1989', 'reputation', 'lover', 'folklore', 'midnights', 'ttpd'],
    favoriteSongs: [
      { title: "August", album: "folklore", file: "./assets/audio/august.mp3", freq: 440.00 },
      { title: "All Too Well", album: "Red (TV)", file: "./assets/audio/all_too_well.mp3", freq: 523.25 },
      { title: "Daylight", album: "Lover", file: "./assets/audio/daylight.mp3", freq: 392.00 },
      { title: "Paper Rings", album: "Lover", file: "./assets/audio/paper_rings.mp3", freq: 698.46 },
      { title: "Enchanted", album: "Speak Now", file: "./assets/audio/enchanted.mp3", freq: 523.25 }
    ]
  };

  // State management
  let audioContext = null;
  let isAudioPlaying = false;
  let isMuted = false;
  let currentTrackIndex = 0;
  let starsFoundCount = 0;
  let candlesLitCount = 13;
  let synthInterval = null;

  const bgAudio = document.getElementById('bgAudio');


  /* ------------------------------------------------------------------------
     2. FRIENDSHIP BRACELET BUILDER (DOUBLE STRAND)
     ------------------------------------------------------------------------ */
  function renderStrand(containerId, text) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    const letters = text.split('');
    letters.forEach(char => {
      if (char === ' ') {
        const spacer = document.createElement('div');
        spacer.className = 'bead-spacer';
        container.appendChild(spacer);
      } else {
        const bead = document.createElement('div');
        bead.className = 'bead';
        bead.textContent = char;
        bead.addEventListener('click', (e) => {
          playBeadSound();
          createParticleBurst(e.clientX, e.clientY, 5, ['#ffd700', '#ff69b4', '#74b9ff']);
        });
        container.appendChild(bead);
      }
    });
  }

  renderStrand('braceletStrand1', CONFIG.strand1Text);
  renderStrand('braceletStrand2', CONFIG.strand2Text);


  /* ------------------------------------------------------------------------
     3. STICKY TOP ERAS THEME SWITCHER
     ------------------------------------------------------------------------ */
  const eraPills = document.querySelectorAll('.era-pill');
  eraPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const targetEra = pill.getAttribute('data-era-target');
      document.documentElement.setAttribute('data-era', targetEra);

      eraPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      playTone(440, 'sine', 0.1);
    });
  });


  /* ------------------------------------------------------------------------
     4. REAL MP3 AUDIO PLAYER & SYNTH FALLBACK ENGINE
     ------------------------------------------------------------------------ */
  function initAudioContext() {
    if (!audioContext) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioContext = new AudioCtx();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.2, volume = 0.15) {
    if (isMuted || !audioContext) return;
    try {
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioContext.currentTime);

      gain.gain.setValueAtTime(volume, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioContext.destination);

      osc.start();
      osc.stop(audioContext.currentTime + duration);
    } catch (e) {
      console.log('Audio tone error:', e);
    }
  }

  function playBeadSound() {
    initAudioContext();
    const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00];
    const note = notes[Math.floor(Math.random() * notes.length)];
    playTone(note, 'triangle', 0.15, 0.2);
  }

  const playAudioBtn = document.getElementById('playAudioBtn');
  const muteAudioBtn = document.getElementById('muteAudioBtn');
  const prevTrackBtn = document.getElementById('prevTrackBtn');
  const nextTrackBtn = document.getElementById('nextTrackBtn');

  const vinylDisc = document.getElementById('vinylDisc');
  const trackTitle = document.getElementById('trackTitle');
  const trackStatus = document.getElementById('trackStatus');

  function loadTrack(index) {
    const track = CONFIG.favoriteSongs[index];
    if (bgAudio) {
      bgAudio.src = track.file;
    }
    trackTitle.textContent = track.title;
    trackStatus.textContent = `${track.album} • Shanmathi's Fav`;
  }

  loadTrack(currentTrackIndex);

  playAudioBtn.addEventListener('click', toggleAudio);
  muteAudioBtn.addEventListener('click', toggleMute);

  prevTrackBtn.addEventListener('click', () => {
    currentTrackIndex = (currentTrackIndex - 1 + CONFIG.favoriteSongs.length) % CONFIG.favoriteSongs.length;
    loadTrack(currentTrackIndex);
    if (isAudioPlaying && bgAudio) {
      bgAudio.play().catch(() => startSwiftieSynthMusic());
    }
  });

  nextTrackBtn.addEventListener('click', () => {
    currentTrackIndex = (currentTrackIndex + 1) % CONFIG.favoriteSongs.length;
    loadTrack(currentTrackIndex);
    if (isAudioPlaying && bgAudio) {
      bgAudio.play().catch(() => startSwiftieSynthMusic());
    }
  });

  if (bgAudio) {
    bgAudio.addEventListener('ended', () => {
      currentTrackIndex = (currentTrackIndex + 1) % CONFIG.favoriteSongs.length;
      loadTrack(currentTrackIndex);
      bgAudio.play().catch(() => {});
    });
  }

  function toggleAudio() {
    initAudioContext();

    if (!isAudioPlaying) {
      if (bgAudio && bgAudio.src) {
        bgAudio.play().then(() => {
          isAudioPlaying = true;
          document.getElementById('playIcon').className = 'fa-solid fa-pause';
          vinylDisc.classList.add('spinning');
          if (synthInterval) clearInterval(synthInterval);
        }).catch(err => {
          console.log("MP3 autoplay blocked or failed, using fallback synth:", err);
          isAudioPlaying = true;
          document.getElementById('playIcon').className = 'fa-solid fa-pause';
          vinylDisc.classList.add('spinning');
          startSwiftieSynthMusic();
        });
      } else {
        isAudioPlaying = true;
        document.getElementById('playIcon').className = 'fa-solid fa-pause';
        vinylDisc.classList.add('spinning');
        startSwiftieSynthMusic();
      }
    } else {
      isAudioPlaying = false;
      if (bgAudio) bgAudio.pause();
      if (synthInterval) clearInterval(synthInterval);
      document.getElementById('playIcon').className = 'fa-solid fa-play';
      vinylDisc.classList.remove('spinning');
    }
  }

  function toggleMute() {
    isMuted = !isMuted;
    if (bgAudio) bgAudio.muted = isMuted;
    document.getElementById('muteIcon').className = isMuted ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
  }

  function startSwiftieSynthMusic() {
    if (synthInterval) clearInterval(synthInterval);
    const currentTrack = CONFIG.favoriteSongs[currentTrackIndex];
    const baseFreq = currentTrack.freq || 440;

    const melody = [
      baseFreq,
      baseFreq * 1.25,
      baseFreq * 1.5,
      baseFreq * 2.0,
      baseFreq * 1.5,
      baseFreq * 1.25
    ];

    let noteIndex = 0;
    synthInterval = setInterval(() => {
      if (isAudioPlaying && !isMuted) {
        const freq = melody[noteIndex % melody.length];
        playTone(freq, 'sine', 0.28, 0.08);
        
        if (noteIndex % 3 === 0) {
          playTone(freq * 1.5, 'triangle', 0.18, 0.04);
        }
        noteIndex++;
      }
    }, 300);
  }


  /* ------------------------------------------------------------------------
     5. STEP 1: UNLOCK THE VAULT
     ------------------------------------------------------------------------ */
  const unlockVaultBtn = document.getElementById('unlockVaultBtn');
  const stepVault = document.getElementById('step-vault');
  const mainExperience = document.getElementById('mainExperience');

  unlockVaultBtn.addEventListener('click', () => {
    if (!isAudioPlaying) {
      toggleAudio();
    }

    stepVault.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    stepVault.style.opacity = '0';
    stepVault.style.transform = 'scale(0.95)';

    setTimeout(() => {
      stepVault.classList.remove('active');
      stepVault.style.display = 'none';
      mainExperience.classList.remove('hidden');

      window.scrollTo({ top: 0, behavior: 'smooth' });
      launchConfettiBurst(80);
    }, 600);
  });


  /* ------------------------------------------------------------------------
     6. CARDIGAN WAX-SEALED LETTER (CLICK TO TOGGLE OPEN & CLOSE)
     ------------------------------------------------------------------------ */
  const waxEnvelope = document.getElementById('waxEnvelope');

  if (waxEnvelope) {
    waxEnvelope.addEventListener('click', () => {
      waxEnvelope.classList.toggle('open');
      playTone(600, 'sine', 0.2);
    });
  }


  /* ------------------------------------------------------------------------
     7. 1989 POLAROID MEMORY GALLERY & LIGHTBOX
     ------------------------------------------------------------------------ */
  const polaroids = document.querySelectorAll('.polaroid-card');
  const lightboxModal = document.getElementById('lightboxModal');
  const modalBody = document.getElementById('modalBody');
  const closeModalBtn = document.getElementById('closeModalBtn');

  polaroids.forEach(card => {
    card.addEventListener('click', () => {
      const imgSrc = card.querySelector('img').src;
      const caption = card.querySelector('.polaroid-caption').innerHTML;

      modalBody.innerHTML = `
        <div style="text-align: center; background: #ffffff; padding: 20px; border-radius: 8px; color: #111111;">
          <img src="${imgSrc}" style="max-width: 100%; max-height: 60vh; border-radius: 4px; object-fit: contain;">
          <div style="margin-top: 16px; font-family: 'Dancing Script', cursive; font-size: 1.8rem; color: #111;">
            ${caption}
          </div>
          <p style="font-family: 'Outfit', sans-serif; font-size: 0.95rem; color: #555555; margin-top: 8px;">
            Shanmathi's Eras Memory ✨
          </p>
        </div>
      `;
      lightboxModal.showModal();
      playTone(550, 'triangle', 0.15);
    });
  });

  closeModalBtn.addEventListener('click', () => {
    lightboxModal.close();
  });

  lightboxModal.addEventListener('click', (e) => {
    if (e.target === lightboxModal) {
      lightboxModal.close();
    }
  });


  /* ------------------------------------------------------------------------
     8. INTERACTIVE 13-CANDLE CAKE & CANDLE BLOWING
     ------------------------------------------------------------------------ */
  const candlesRow = document.getElementById('candlesRow');
  const blowCandlesBtn = document.getElementById('blowCandlesBtn');
  const wishStatus = document.getElementById('wishStatus');

  candlesRow.innerHTML = '';
  for (let i = 0; i < 13; i++) {
    const candle = document.createElement('div');
    candle.className = 'candle';
    candle.id = `candle-${i}`;

    const flame = document.createElement('div');
    flame.className = 'candle-flame';

    const smoke = document.createElement('div');
    smoke.className = 'candle-smoke';

    candle.appendChild(flame);
    candle.appendChild(smoke);

    candle.addEventListener('click', (e) => {
      e.stopPropagation();
      extinguishCandle(candle);
    });

    candlesRow.appendChild(candle);
  }

  function extinguishCandle(candle) {
    if (candle && !candle.classList.contains('extinguished')) {
      candle.classList.add('extinguished');
      candlesLitCount--;
      playTone(700 - candlesLitCount * 25, 'sine', 0.15);

      if (candlesLitCount <= 0) {
        onAllCandlesBlown();
      } else {
        wishStatus.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> ${candlesLitCount} Candles remaining! Keep blowing...`;
      }
    }
  }

  blowCandlesBtn.addEventListener('click', () => {
    const allCandles = document.querySelectorAll('.candle');
    allCandles.forEach((c, index) => {
      setTimeout(() => extinguishCandle(c), index * 90);
    });
  });

  function onAllCandlesBlown() {
    wishStatus.innerHTML = `🎉 SHANMATHI'S BIRTHDAY WISH IS SENT TO THE UNIVERSE! HAPPY 23rd BIRTHDAY! 🎉`;
    launchConfettiBurst(160);
    playVictoryChime();
  }

  function playVictoryChime() {
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      setTimeout(() => playTone(freq, 'sine', 0.4, 0.25), idx * 120);
    });
  }


  /* ------------------------------------------------------------------------
     9. SWIFTIE LYRIC CARDS FLIP GAME
     ------------------------------------------------------------------------ */
  const lyricCards = document.querySelectorAll('.lyric-card');
  lyricCards.forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
      playTone(500, 'sine', 0.15);
    });
  });





  /* ------------------------------------------------------------------------
     11. CANVAS CONFETTI & SPARKLE RENDERER
     ------------------------------------------------------------------------ */
  const confettiCanvas = document.getElementById('confetti-canvas');
  const ctx = confettiCanvas.getContext('2d');
  let confettiParticles = [];

  function resizeCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function launchConfettiBurst(count = 100) {
    const colors = ['#ffd700', '#ff69b4', '#74b9ff', '#00e676', '#a8bba2', '#b8c0ff', '#ffffff'];
    for (let i = 0; i < count; i++) {
      confettiParticles.push({
        x: Math.random() * confettiCanvas.width,
        y: -20,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 4,
        vy: Math.random() * 3 + 2,
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 10
      });
    }
  }

  function createParticleBurst(x, y, count = 10, colors = ['#ffd700']) {
    for (let i = 0; i < count; i++) {
      confettiParticles.push({
        x: x,
        y: y,
        size: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 15
      });
    }
  }

  function renderConfetti() {
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    for (let i = confettiParticles.length - 1; i >= 0; i--) {
      const p = confettiParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.vr;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      ctx.restore();

      if (p.y > confettiCanvas.height + 20) {
        confettiParticles.splice(i, 1);
      }
    }

    requestAnimationFrame(renderConfetti);
  }
  renderConfetti();

});
