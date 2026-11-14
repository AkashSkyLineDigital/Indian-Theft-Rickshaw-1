import { DEFAULT_SETTINGS, GameSettings, WeaponId } from '../types/game';

const POLICE_KILL_LINES: { text: string; tts: string }[] = [
  {
    text: 'Bhaagne ki koshish kar raha tha? Ab padha reh sadak pe!',
    tts: 'भागने की कोशिश कर रहा था? अब पड़ा रह सड़क पे!',
  },
  {
    text: 'Kanoon se bachega? Tera khel khatam ho gaya!',
    tts: 'कानून से बचेगा? तेरा खेल ख़तम हो गया!',
  },
  {
    text: 'Ruk bola tha na... ab bhugat!',
    tts: 'रुक बोला था ना... अब भुगत!',
  },
  {
    text: 'Police se panga bahut mehenga pad gaya!',
    tts: 'पुलिस से पंगा बहुत महंगा पड़ गया!',
  },
];

const POLICE_WARN_LINES: { text: string; tts: string }[] = [
  {
    text: 'Haath upar kar! Wahin ruk ja!',
    tts: 'हाथ ऊपर कर! वहीं रुक जा!',
  },
  {
    text: 'Pakdo isko! Police se bhaag raha hai!',
    tts: 'पकड़ो इसको! पुलिस से भाग रहा है!',
  },
  {
    text: 'Police! Chup-chaap ruk ja warna goli chalegi!',
    tts: 'पुलिस! चुपचाप रुक जा वरना गोली चलेगी!',
  },
];

class SoundEngine {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private distortionCurve: Float32Array<ArrayBuffer> | null = null;
  private settings: GameSettings = { ...DEFAULT_SETTINGS };

  private sirenOsc: OscillatorNode | null = null;
  private sirenLfo: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private sirenShouldPlay = false;
  private chopperOsc: OscillatorNode | null = null;
  private chopperLfo: OscillatorNode | null = null;
  private chopperGain: GainNode | null = null;
  private chopperShouldPlay = false;
  private isPaused = false;
  private lastWarnVoiceAt = 0;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private voicesHooked = false;

  constructor() {
    this.hookSpeechVoices();
  }

  private hookSpeechVoices(): void {
    if (this.voicesHooked || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.voicesHooked = true;
    const load = () => {
      try {
        const list = window.speechSynthesis.getVoices();
        if (list && list.length > 0) {
          this.cachedVoices = list;
        }
      } catch {
        // ignore
      }
    };
    load();
    try {
      window.speechSynthesis.addEventListener?.('voiceschanged', load);
    } catch {
      // ignore
    }
  }

  public updateSettings(next: GameSettings): void {
    const anyWasEnabled =
      this.settings.policeVoiceEnabled ||
      this.settings.npcVoiceEnabled ||
      this.settings.gameVoiceEnabled;
    this.settings = { ...next };
    const anyNowEnabled =
      next.policeVoiceEnabled || next.npcVoiceEnabled || next.gameVoiceEnabled;
    if (anyWasEnabled && !anyNowEnabled) {
      this.stopPoliceVoice();
    }
    this.syncSirenGain();
  }

  public setPaused(paused: boolean): void {
    this.isPaused = paused;
    this.syncSirenGain();
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume().catch(() => {});
    }
    if (!this.noiseBuffer) {
      const len = this.ctx.sampleRate * 1.2;
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this.noiseBuffer = buf;
    }
    if (!this.distortionCurve) {
      const samples = 256;
      const curve = new Float32Array(new ArrayBuffer(samples * 4));
      const k = 18;
      for (let i = 0; i < samples; i++) {
        const x = (i * 2) / samples - 1;
        curve[i] = ((3 + k) * x * 20 * (Math.PI / 180)) / (Math.PI + k * Math.abs(x));
      }
      this.distortionCurve = curve;
    }
    return this.ctx;
  }

  private effectiveSfxGain(): number {
    return Math.max(0, Math.min(1, this.settings.masterVolume * this.settings.sfxVolume));
  }

  public unlock(): void {
    this.ensureContext();
    this.hookSpeechVoices();
  }

  public playPunch(didHit: boolean): void {
    const ctx = this.ensureContext();
    const vol = this.effectiveSfxGain();
    if (!ctx || vol <= 0.01) return;

    const now = ctx.currentTime;

    if (this.noiseBuffer) {
      const whoosh = ctx.createBufferSource();
      whoosh.buffer = this.noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(950, now);
      filter.frequency.exponentialRampToValueAtTime(260, now + 0.085);
      filter.Q.value = 1.8;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.24 * vol, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);

      whoosh.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      whoosh.start(now);
      whoosh.stop(now + 0.1);
    }

    if (!didHit) return;

    const hitAt = now + 0.02;

    const subOsc = ctx.createOscillator();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(165, hitAt);
    subOsc.frequency.exponentialRampToValueAtTime(42, hitAt + 0.11);

    const shaper = ctx.createWaveShaper();
    if (this.distortionCurve) {
      shaper.curve = this.distortionCurve;
    }

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.75 * vol, hitAt);
    subGain.gain.exponentialRampToValueAtTime(0.001, hitAt + 0.14);

    subOsc.connect(shaper);
    shaper.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(hitAt);
    subOsc.stop(hitAt + 0.15);

    if (this.noiseBuffer) {
      const snap = ctx.createBufferSource();
      snap.buffer = this.noiseBuffer;

      const snapFilter = ctx.createBiquadFilter();
      snapFilter.type = 'bandpass';
      snapFilter.frequency.setValueAtTime(1350, hitAt);
      snapFilter.frequency.exponentialRampToValueAtTime(420, hitAt + 0.06);
      snapFilter.Q.value = 1.1;

      const snapGain = ctx.createGain();
      snapGain.gain.setValueAtTime(0.62 * vol, hitAt);
      snapGain.gain.exponentialRampToValueAtTime(0.001, hitAt + 0.065);

      snap.connect(snapFilter);
      snapFilter.connect(snapGain);
      snapGain.connect(ctx.destination);
      snap.start(hitAt);
      snap.stop(hitAt + 0.07);
    }
  }

  public playGunshot(weaponId: WeaponId): void {
    if (weaponId === 'fists') return;
    const ctx = this.ensureContext();
    const vol = this.effectiveSfxGain();
    if (!ctx || vol <= 0.01 || !this.noiseBuffer) return;

    const now = ctx.currentTime;
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';

    const gain = ctx.createGain();

    let dur = 0.16;
    let peak = 0.55 * vol;
    let startFreq = 3200;
    let endFreq = 320;
    let punchFreq = 180;

    if (weaponId === 'pistol') {
      dur = 0.16;
      peak = 0.52 * vol;
      startFreq = 3400;
      endFreq = 360;
      punchFreq = 210;
    } else if (weaponId === 'smg') {
      dur = 0.11;
      peak = 0.42 * vol;
      startFreq = 3800;
      endFreq = 480;
      punchFreq = 240;
    } else if (weaponId === 'shotgun') {
      dur = 0.34;
      peak = 0.8 * vol;
      startFreq = 2400;
      endFreq = 180;
      punchFreq = 125;
    } else if (weaponId === 'rifle') {
      dur = 0.21;
      peak = 0.62 * vol;
      startFreq = 4400;
      endFreq = 290;
      punchFreq = 165;
    }

    filter.frequency.setValueAtTime(startFreq, now);
    filter.frequency.exponentialRampToValueAtTime(endFreq, now + dur);

    gain.gain.setValueAtTime(peak, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + dur + 0.02);

    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(punchFreq, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.35 * vol, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);
    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);

    if (weaponId === 'shotgun') {
      const rackAt = now + 0.28;
      const rack = ctx.createOscillator();
      rack.type = 'square';
      rack.frequency.setValueAtTime(620, rackAt);
      rack.frequency.setValueAtTime(840, rackAt + 0.055);
      const rg = ctx.createGain();
      rg.gain.setValueAtTime(0.08 * vol, rackAt);
      rg.gain.exponentialRampToValueAtTime(0.001, rackAt + 0.11);
      rack.connect(rg);
      rg.connect(ctx.destination);
      rack.start(rackAt);
      rack.stop(rackAt + 0.12);
    }
  }

  /**
   * Multi-layered procedural vehicle explosion blast SFX.
   */
  public playExplosion(): void {
    const ctx = this.ensureContext();
    const vol = this.effectiveSfxGain();
    if (!ctx || vol <= 0.01) return;

    const now = ctx.currentTime;

    // 1. Sub-bass shockwave thump
    const sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(140, now);
    sub.frequency.exponentialRampToValueAtTime(24, now + 0.72);
    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.95 * vol, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    sub.connect(subGain);
    subGain.connect(ctx.destination);
    sub.start(now);
    sub.stop(now + 0.85);

    // 2. Heavy roaring combustion noise burst
    if (this.noiseBuffer) {
      const boom = ctx.createBufferSource();
      boom.buffer = this.noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1900, now);
      filter.frequency.exponentialRampToValueAtTime(140, now + 0.95);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.92 * vol, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.05);

      boom.connect(filter);
      filter.connect(g);
      g.connect(ctx.destination);
      boom.start(now);
      boom.stop(now + 1.1);
    }
  }

  /**
   * Warm harmonic bronze temple bell chime.
   */
  public playTempleBell(): void {
    const ctx = this.ensureContext();
    const vol = this.effectiveSfxGain();
    if (!ctx || vol <= 0.01) return;
    const now = ctx.currentTime;

    [528, 1056, 1584].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      const g = ctx.createGain();
      g.gain.setValueAtTime((0.22 / (i + 1)) * vol, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.4 - i * 0.2);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.5);
    });
  }

  /**
   * Localized gentle Mandir Aarti bells + soft tanpura/shankh resonance.
   * Audible only within a realistic 44m radius around the temple.
   */
  public playMandirAarti(distance: number): void {
    if (this.isPaused || distance > 44) return;
    const ctx = this.ensureContext();
    const vol = this.effectiveSfxGain();
    if (!ctx || vol <= 0.01) return;

    const falloff = Math.pow(Math.max(0, 1 - distance / 44), 1.35);
    if (falloff <= 0.03) return;
    const now = ctx.currentTime;

    // Warm soft shankh/tanpura drone
    [130.81, 196.0].forEach((freq, idx) => {
      const drone = ctx.createOscillator();
      drone.type = 'sine';
      drone.frequency.setValueAtTime(freq, now);
      const dg = ctx.createGain();
      dg.gain.setValueAtTime(0.001, now);
      dg.gain.linearRampToValueAtTime((0.065 / (idx + 1)) * vol * falloff, now + 0.45);
      dg.gain.setValueAtTime((0.055 / (idx + 1)) * vol * falloff, now + 2.4);
      dg.gain.exponentialRampToValueAtTime(0.001, now + 3.4);
      drone.connect(dg);
      dg.connect(ctx.destination);
      drone.start(now);
      drone.stop(now + 3.45);
    });

    // Gentle aarti bell motif (Sa-Ga-Pa-Sa-Pa-Ga-Sa)
    const bellNotes = [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25, 523.25];
    bellNotes.forEach((freq, i) => {
      const t = now + i * 0.42;
      [1, 2].forEach((harm) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq * harm, t);
        const g = ctx.createGain();
        const peak = (0.14 / harm) * vol * falloff;
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(peak, t + 0.015);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.85 / harm);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.9);
      });
    });
  }

  /**
   * Localized, dignified melodic prayer/azaan-inspired call near Noor Masjid.
   * Audible only within a realistic 44m radius around the mosque.
   */
  public playMasjidAzaan(distance: number): void {
    if (this.isPaused || distance > 44) return;
    const ctx = this.ensureContext();
    const vol = this.effectiveSfxGain();
    if (!ctx || vol <= 0.01) return;

    const falloff = Math.pow(Math.max(0, 1 - distance / 44), 1.35);
    if (falloff <= 0.03) return;
    const now = ctx.currentTime;

    // Gentle melodic vocal-formant-filtered phrases with subtle vibrato
    const phrases: { freq: number; start: number; dur: number }[] = [
      { freq: 293.66, start: 0.0, dur: 0.85 },
      { freq: 329.63, start: 0.9, dur: 0.75 },
      { freq: 369.99, start: 1.7, dur: 0.95 },
      { freq: 329.63, start: 2.7, dur: 0.7 },
      { freq: 293.66, start: 3.45, dur: 1.05 },
    ];

    phrases.forEach((ph) => {
      const t = now + ph.start;
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(ph.freq, t);

      const vib = ctx.createOscillator();
      vib.type = 'sine';
      vib.frequency.setValueAtTime(4.8, t);
      const vibGain = ctx.createGain();
      vibGain.gain.setValueAtTime(3.2, t);
      vib.connect(vibGain);
      vibGain.connect(osc.frequency);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(780, t);
      filter.Q.value = 1.6;

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.16 * vol * falloff, t + 0.14);
      g.gain.setValueAtTime(0.14 * vol * falloff, t + ph.dur * 0.68);
      g.gain.exponentialRampToValueAtTime(0.001, t + ph.dur);

      osc.connect(filter);
      filter.connect(g);
      g.connect(ctx.destination);

      osc.start(t);
      vib.start(t);
      osc.stop(t + ph.dur + 0.05);
      vib.stop(t + ph.dur + 0.05);
    });
  }

  public playDryFire(): void {
    const ctx = this.ensureContext();
    const vol = this.effectiveSfxGain();
    if (!ctx || vol <= 0.01) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.03);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.14 * vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  public playCashPickup(): void {
    const ctx = this.ensureContext();
    const vol = this.effectiveSfxGain();
    if (!ctx || vol <= 0.01) return;
    const now = ctx.currentTime;

    [880, 1174.66].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.055);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.16 * vol, now + idx * 0.055);
      g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.055 + 0.14);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now + idx * 0.055);
      osc.stop(now + idx * 0.055 + 0.15);
    });
  }

  public playUiClick(): void {
    const ctx = this.ensureContext();
    const vol = this.effectiveSfxGain();
    if (!ctx || vol <= 0.01) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(340, now + 0.04);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.09 * vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playAtmBeep(): void {
    const ctx = this.ensureContext();
    const vol = this.effectiveSfxGain();
    if (!ctx || vol <= 0.01) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1480, now);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.09 * vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  public playAtmCashDispense(): void {
    const ctx = this.ensureContext();
    const vol = this.effectiveSfxGain();
    if (!ctx || vol <= 0.01) return;
    const now = ctx.currentTime;
    // Rapid mechanical note-counter flutter + chime
    for (let i = 0; i < 4; i++) {
      const t = now + i * 0.065;
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240 + i * 35, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.045);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.11 * vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.055);
    }
    const chime = ctx.createOscillator();
    chime.type = 'sine';
    chime.frequency.setValueAtTime(1046.5, now + 0.28);
    const cg = ctx.createGain();
    cg.gain.setValueAtTime(0.14 * vol, now + 0.28);
    cg.gain.exponentialRampToValueAtTime(0.001, now + 0.52);
    chime.connect(cg);
    cg.connect(ctx.destination);
    chime.start(now + 0.28);
    chime.stop(now + 0.55);
  }

  public playWastedImpact(): void {
    const ctx = this.ensureContext();
    const vol = this.effectiveSfxGain();
    if (!ctx || vol <= 0.01) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(36, now + 0.75);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.45 * vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.9);
  }

  public playCourtGavel(): void {
    const ctx = this.ensureContext();
    const vol = this.effectiveSfxGain();
    if (!ctx || vol <= 0.01) return;
    const now = ctx.currentTime;
    [0, 0.19].forEach((offset) => {
      const t = now + offset;
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(240, t);
      osc.frequency.exponentialRampToValueAtTime(72, t + 0.11);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.55 * vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.15);
    });
  }

  public playJailDoorClang(): void {
    const ctx = this.ensureContext();
    const vol = this.effectiveSfxGain();
    if (!ctx || vol <= 0.01) return;
    const now = ctx.currentTime;
    [185, 292, 430].forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.68, now + 0.36);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.16 * vol, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    });
  }

  public playLockpickClick(): void {
    const ctx = this.ensureContext();
    const vol = this.effectiveSfxGain();
    if (!ctx || vol <= 0.01) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1450, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.045);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.22 * vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  public playJump(): void {
    const ctx = this.ensureContext();
    const vol = this.effectiveSfxGain();
    if (!ctx || vol <= 0.01) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(190, now);
    osc.frequency.exponentialRampToValueAtTime(390, now + 0.11);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.14 * vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  public playCarCrash(intensity = 0.7): void {
    const ctx = this.ensureContext();
    const vol = this.effectiveSfxGain() * Math.max(0.25, Math.min(1, intensity));
    if (!ctx || vol <= 0.01) return;
    const now = ctx.currentTime;

    const thud = ctx.createOscillator();
    thud.type = 'triangle';
    thud.frequency.setValueAtTime(135, now);
    thud.frequency.exponentialRampToValueAtTime(34, now + 0.18);
    const tg = ctx.createGain();
    tg.gain.setValueAtTime(0.65 * vol, now);
    tg.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    thud.connect(tg);
    tg.connect(ctx.destination);
    thud.start(now);
    thud.stop(now + 0.21);

    if (this.noiseBuffer) {
      const crunch = ctx.createBufferSource();
      crunch.buffer = this.noiseBuffer;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(850, now);
      bp.Q.value = 0.9;
      const cg = ctx.createGain();
      cg.gain.setValueAtTime(0.45 * vol, now);
      cg.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      crunch.connect(bp);
      bp.connect(cg);
      cg.connect(ctx.destination);
      crunch.start(now);
      crunch.stop(now + 0.18);
    }
  }

  public playDogBark(seed = 0): void {
    const ctx = this.ensureContext();
    const vol = this.effectiveSfxGain();
    if (!ctx || vol <= 0.01) return;
    const now = ctx.currentTime;
    const base = 310 + (seed % 5) * 35;

    [0, 0.16].forEach((offset, idx) => {
      const t = now + offset;
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(base * (idx === 0 ? 1.0 : 1.12), t);
      osc.frequency.exponentialRampToValueAtTime(base * 0.52, t + 0.1);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(base * 2.1, t);
      filter.Q.value = 2.4;

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.24 * vol, t + 0.018);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.115);

      osc.connect(filter);
      filter.connect(g);
      g.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.125);
    });
  }

  public playMissionSuccess(): void {
    const ctx = this.ensureContext();
    const vol = this.effectiveSfxGain();
    if (!ctx || vol <= 0.01) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];

    notes.forEach((freq, idx) => {
      const t = now + idx * 0.11;
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.24 * vol, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.36);

      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.38);
    });
  }

  public playPoliceWhistle(): void {
    const ctx = this.ensureContext();
    const vol = this.effectiveSfxGain();
    if (!ctx || vol <= 0.01) return;
    const now = ctx.currentTime;

    const oscA = ctx.createOscillator();
    const oscB = ctx.createOscillator();
    oscA.type = 'triangle';
    oscB.type = 'sine';
    oscA.frequency.setValueAtTime(2680, now);
    oscB.frequency.setValueAtTime(2860, now);

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(34, now);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(140, now);
    lfo.connect(lfoGain);
    lfoGain.connect(oscA.frequency);
    lfoGain.connect(oscB.frequency);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(0.22 * vol, now + 0.025);
    g.gain.setValueAtTime(0.22 * vol, now + 0.28);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.44);

    oscA.connect(g);
    oscB.connect(g);
    g.connect(ctx.destination);

    oscA.start(now);
    oscB.start(now);
    lfo.start(now);
    oscA.stop(now + 0.46);
    oscB.stop(now + 0.46);
    lfo.stop(now + 0.46);
  }

  public playPhoneDialBeep(): void {
    const ctx = this.ensureContext();
    const vol = this.effectiveSfxGain();
    if (!ctx || vol <= 0.01) return;
    const now = ctx.currentTime;
    const freqs = [941, 1336, 941];
    freqs.forEach((f, idx) => {
      const t = now + idx * 0.095;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.14 * vol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.075);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.08);
    });
  }

  public playLicenseApproved(): void {
    const ctx = this.ensureContext();
    const vol = this.effectiveSfxGain();
    if (!ctx || vol <= 0.01) return;
    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((freq, idx) => {
      const t = now + idx * 0.085;
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.22 * vol, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.34);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.36);
    });
  }

  public setChopperActive(active: boolean): void {
    this.chopperShouldPlay = active;
    if (active && !this.chopperOsc) {
      const ctx = this.ensureContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = 54;

      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 11.5;

      const lfoMod = ctx.createGain();
      lfoMod.gain.value = 0.05;

      const outGain = ctx.createGain();
      outGain.gain.value = 0;

      osc.connect(outGain);
      lfo.connect(lfoMod);
      lfoMod.connect(outGain.gain);
      outGain.connect(ctx.destination);

      osc.start();
      lfo.start();
      this.chopperOsc = osc;
      this.chopperLfo = lfo;
      this.chopperGain = outGain;
    }
    this.syncSirenGain();
  }

  public setSirenActive(active: boolean): void {
    this.sirenShouldPlay = active;
    if (active && !this.sirenOsc) {
      const ctx = this.ensureContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.value = 660;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 950;
      filter.Q.value = 1.6;

      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 1.45;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 185;

      const outGain = ctx.createGain();
      outGain.gain.value = 0;

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      osc.connect(filter);
      filter.connect(outGain);
      outGain.connect(ctx.destination);

      osc.start();
      lfo.start();
      this.sirenOsc = osc;
      this.sirenLfo = lfo;
      this.sirenGain = outGain;
    }
    this.syncSirenGain();
  }

  private syncSirenGain(): void {
    if (this.sirenGain && this.ctx) {
      const target =
        this.sirenShouldPlay && !this.isPaused
          ? 0.065 * this.effectiveSfxGain()
          : 0;
      this.sirenGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.06);
    }
    if (this.chopperGain && this.ctx) {
      const target =
        this.chopperShouldPlay && !this.isPaused
          ? 0.08 * this.effectiveSfxGain()
          : 0;
      this.chopperGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.1);
    }
  }

  public stopAll(): void {
    this.sirenShouldPlay = false;
    this.chopperShouldPlay = false;
    this.syncSirenGain();
    this.stopPoliceVoice();
  }

  public speakPoliceLine(kind: 'kill' | 'warn', customText?: string, customTts?: string): void {
    if (!this.settings.policeVoiceEnabled) return;
    if (kind === 'warn') {
      const now = performance.now();
      if (now - this.lastWarnVoiceAt < 7500) return;
      this.lastWarnVoiceAt = now;
    }

    const pool = kind === 'kill' ? POLICE_KILL_LINES : POLICE_WARN_LINES;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    const ttsText = customTts ?? customText ?? picked.tts;
    this.speakNpcLine('officer', 0, ttsText);
  }

  /**
   * Speaks an NPC or system line prioritizing Hindi AI voices (`hi-IN`) so Devanagari
   * Hindi pronunciation is natural and crystal clear rather than butchered English TTS.
   * Falls back seamlessly through `hi-IN` -> `hi` -> `en-IN` -> default `hi-IN` utter +
   * retro Web Audio synth cadence so NPCs ALWAYS speak reliably.
   */
  public speakNpcLine(
    role: 'officer' | 'enforcer' | 'dealer' | 'citizen' | 'banker' | 'narrator' | 'judge' | 'lawyer' | 'warden',
    seedId: number,
    textOrDevanagari: string,
  ): void {
    if ((role === 'officer' || role === 'warden') && !this.settings.policeVoiceEnabled) return;
    if ((role === 'citizen' || role === 'enforcer' || role === 'dealer') && !this.settings.npcVoiceEnabled) return;
    if ((role === 'banker' || role === 'narrator' || role === 'judge' || role === 'lawyer') && !this.settings.gameVoiceEnabled) return;

    const hash = Math.abs(seedId * 2654435761) >>> 0;
    let rate = 0.96;
    let pitch = 1.0;
    let blipFreq = 260;
    let blipWave: OscillatorType = 'square';

    if (role === 'officer' || role === 'warden') {
      rate = 0.84;
      pitch = 0.84;
      blipFreq = 165;
      blipWave = 'triangle';
    } else if (role === 'judge') {
      rate = 0.88;
      pitch = 0.78;
      blipFreq = 148;
      blipWave = 'triangle';
    } else if (role === 'lawyer') {
      rate = 1.02;
      pitch = 1.04;
      blipFreq = 290;
      blipWave = 'sine';
    } else if (role === 'banker') {
      rate = 0.94;
      pitch = 1.02;
      blipFreq = 285;
      blipWave = 'triangle';
    } else if (role === 'narrator') {
      rate = 0.96;
      pitch = 0.96;
      blipFreq = 320;
      blipWave = 'sine';
    } else if (role === 'enforcer') {
      rate = 0.92 + (hash % 3) * 0.04;
      pitch = 0.74 + (hash % 4) * 0.05;
      blipFreq = 132 + (hash % 4) * 14;
      blipWave = 'sawtooth';
    } else if (role === 'dealer') {
      rate = 0.96;
      pitch = 0.94;
      blipFreq = 215;
      blipWave = 'square';
    } else {
      rate = 0.9 + (hash % 5) * 0.05;
      pitch = 0.86 + (hash % 6) * 0.06;
      blipFreq = 235 + (hash % 7) * 26;
      blipWave = 'square';
    }

    let spokeTts = false;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const live = window.speechSynthesis.getVoices();
        if (live && live.length > 0) this.cachedVoices = live;
        const allVoices = this.cachedVoices;

        // Strictly prioritize Hindi AI voices first (`hi-IN`, `hi`, Hindi names), then Indian English (`en-IN`), then any voice
        const hiAll = allVoices.filter(
          (v) => v.lang.toLowerCase().startsWith('hi') || /hindi|हिन्दी|hemant|kalpana|swara|madhur/i.test(v.name),
        );
        const hiLocal = hiAll.filter((v) => v.localService);
        const inAll = allVoices.filter((v) => v.lang.toLowerCase().includes('in'));
        const pool =
          hiAll.length > 0
            ? hiAll
            : hiLocal.length > 0
              ? hiLocal
              : inAll.length > 0
                ? inAll
                : allVoices;

        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(textOrDevanagari);
        utter.rate = rate;
        utter.pitch = pitch;
        utter.volume = Math.max(0.2, Math.min(1, this.settings.masterVolume));

        if (pool.length > 0) {
          if (role === 'officer') {
            const baritone = pool.find((v) => /hemant|madhur|prabhat|rishi|male/i.test(v.name));
            utter.voice = baritone ?? pool[0];
          } else {
            utter.voice = pool[hash % pool.length];
          }
          utter.lang = utter.voice?.lang?.toLowerCase().startsWith('hi') ? utter.voice.lang : 'hi-IN';
        } else {
          utter.lang = 'hi-IN';
        }

        window.speechSynthesis.speak(utter);
        spokeTts = hiAll.length > 0;
      } catch {
        // Ignore if speechSynthesis unavailable
      }
    }

    // Play retro voice cadence if enabled OR as expressive audible guarantee when browser lacks Hindi TTS voices
    if (this.settings.retroVoiceBlips || !spokeTts) {
      this.playRetroVoiceBlips(textOrDevanagari, blipFreq, blipWave);
    }
  }

  private playRetroVoiceBlips(text: string, baseFreq: number, wave: OscillatorType): void {
    const ctx = this.ensureContext();
    const vol = this.effectiveSfxGain();
    if (!ctx || vol <= 0.01) return;

    const now = ctx.currentTime;
    const count = Math.min(10, Math.max(3, Math.ceil(text.length / 4)));
    for (let i = 0; i < count; i++) {
      const t = now + i * 0.068;
      const osc = ctx.createOscillator();
      osc.type = wave;
      const jitter = ((text.charCodeAt(i % text.length) % 7) - 3) * 8;
      osc.frequency.setValueAtTime(Math.max(85, baseFreq + jitter), t);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.1 * vol, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.052);

      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.058);
    }
  }

  public stopPoliceVoice(): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  }
}

export const soundEngine = new SoundEngine();
