import { DEFAULT_SETTINGS, GameSettings, WeaponId } from '../types/game';
import { pickHindiLine } from './hindiDialogues';

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
  private lastRadioChatterAt = 0;
  private lastPhoneRingAt = 0;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private voicesHooked = false;
  private speechSeq = 0;
  private activeSpeaking = false;
  private activeSpeechPriority: 'high' | 'normal' | 'low' = 'low';
  private speechTimerId: number | null = null;
  private speechMaxTimeoutId: number | null = null;
  private keepAliveId: number | null = null;
  private minSubtitleHoldUntil = 0;

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

  public isSpeaking(): boolean {
    if (this.activeSpeaking) return true;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) return true;
      } catch {
        // ignore
      }
    }
    return performance.now() < this.minSubtitleHoldUntil;
  }

  public stopAll(): void {
    this.sirenShouldPlay = false;
    this.chopperShouldPlay = false;
    this.syncSirenGain();
    this.stopPoliceVoice();
  }

  public playPoliceRadioChatter(): void {
    const nowMs = performance.now();
    if (nowMs - this.lastRadioChatterAt < 4500) return;
    this.lastRadioChatterAt = nowMs;

    const ctx = this.ensureContext();
    const vol = this.effectiveSfxGain();
    if (!ctx || vol <= 0.01) return;

    const now = ctx.currentTime;
    if (this.noiseBuffer) {
      const sq = ctx.createBufferSource();
      sq.buffer = this.noiseBuffer;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(1650, now);
      bp.Q.value = 2.4;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.09 * vol, now + 0.015);
      g.gain.setValueAtTime(0.075 * vol, now + 0.14);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      sq.connect(bp);
      bp.connect(g);
      g.connect(ctx.destination);
      sq.start(now);
      sq.stop(now + 0.25);

      const sqEnd = ctx.createBufferSource();
      sqEnd.buffer = this.noiseBuffer;
      const bp2 = ctx.createBiquadFilter();
      bp2.type = 'bandpass';
      bp2.frequency.setValueAtTime(1900, now + 0.32);
      bp2.Q.value = 3.0;
      const g2 = ctx.createGain();
      g2.gain.setValueAtTime(0.001, now + 0.32);
      g2.gain.linearRampToValueAtTime(0.08 * vol, now + 0.335);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 0.43);
      sqEnd.connect(bp2);
      bp2.connect(g2);
      g2.connect(ctx.destination);
      sqEnd.start(now + 0.32);
      sqEnd.stop(now + 0.44);
    }

    // Dual-tone police wireless roger beep
    [1320, 1760].forEach((freq, idx) => {
      const t = now + 0.23 + idx * 0.045;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      const og = ctx.createGain();
      og.gain.setValueAtTime(0.001, t);
      og.gain.linearRampToValueAtTime(0.07 * vol, t + 0.006);
      og.gain.exponentialRampToValueAtTime(0.001, t + 0.045);
      osc.connect(og);
      og.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.05);
    });
  }

  public playThanaPhoneRing(): void {
    const nowMs = performance.now();
    if (nowMs - this.lastPhoneRingAt < 6500) return;
    this.lastPhoneRingAt = nowMs;

    const ctx = this.ensureContext();
    const vol = this.effectiveSfxGain();
    if (!ctx || vol <= 0.01) return;

    const now = ctx.currentTime;
    // Classic Indian landline double ring: ring-ring ... pause ... ring-ring
    [0, 0.36].forEach((offset) => {
      [420, 468].forEach((freq) => {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + offset);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.001, now + offset);
        g.gain.linearRampToValueAtTime(0.065 * vol, now + offset + 0.02);
        g.gain.setValueAtTime(0.065 * vol, now + offset + 0.22);
        g.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.27);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.28);
      });
    });
  }

  public playMobileRingtone(): void {
    const ctx = this.ensureContext();
    const vol = Math.max(0.18, this.effectiveSfxGain());
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [659.25, 783.99, 987.77, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.11;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.13 * vol, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    });
  }

  public playOutgoingRingback(): void {
    const ctx = this.ensureContext();
    const vol = Math.max(0.16, this.effectiveSfxGain());
    if (!ctx) return;

    const now = ctx.currentTime;
    [440, 480].forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.075 * vol, now + 0.025);
      g.gain.setValueAtTime(0.075 * vol, now + 0.55);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.68);
    });
  }

  public playCallHangupTone(): void {
    const ctx = this.ensureContext();
    const vol = Math.max(0.16, this.effectiveSfxGain());
    if (!ctx) return;

    const now = ctx.currentTime;
    [520, 380].forEach((freq, idx) => {
      const t = now + idx * 0.09;
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.11 * vol, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    });
  }

  public playCarHorn(
    kind:
      | 'rickshaw'
      | 'bike'
      | 'car'
      | 'sedan'
      | 'muscle'
      | 'police'
      | 'swat_van'
      | 'army_truck'
      | 'armored_apc'
      | 'chopper' = 'car',
    volumeScale = 1.0,
  ): void {
    const ctx = this.ensureContext();
    const vol = this.effectiveSfxGain() * Math.max(0.05, Math.min(1.1, volumeScale));
    if (!ctx || vol <= 0.01) return;

    const now = ctx.currentTime;
    if (kind === 'chopper') {
      // Helicopter twin-klaxon warning chirp
      [0, 0.14].forEach((offset) => {
        const osc = ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(680, now + offset);
        osc.frequency.exponentialRampToValueAtTime(510, now + offset + 0.11);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.001, now + offset);
        g.gain.linearRampToValueAtTime(0.14 * vol, now + offset + 0.015);
        g.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);
        osc.connect(g);
        g.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.13);
      });
      return;
    }

    const freqs =
      kind === 'rickshaw'
        ? [440, 554] // Classic cheerful auto-rickshaw dual horn
        : kind === 'bike'
          ? [535] // Crisp motorcycle horn
          : kind === 'swat_van' || kind === 'army_truck' || kind === 'armored_apc'
            ? [210, 265] // Heavy commercial / tactical air horn
            : kind === 'police'
              ? [420, 528] // Crisp Bharat Police cruiser horn
              : kind === 'muscle'
                ? [340, 430] // Deep GT dual-tone horn
                : [385, 485]; // Rich civilian sedan horn

    const dur = kind === 'bike' ? 0.24 : kind === 'swat_van' || kind === 'army_truck' ? 0.42 : 0.34;
    freqs.forEach((f) => {
      const osc = ctx.createOscillator();
      osc.type = kind === 'bike' ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(f, now);

      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, now);
      g.gain.linearRampToValueAtTime(0.16 * vol, now + 0.02);
      g.gain.setValueAtTime(0.15 * vol, now + dur * 0.65);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur);

      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + dur + 0.02);
    });
  }

  public playVehicleHorn(kind: 'rickshaw' | 'bike' | 'car' = 'car'): void {
    this.playCarHorn(kind, 1.0);
  }

  public playMedkitHeal(): void {
    const ctx = this.ensureContext();
    const vol = this.effectiveSfxGain();
    if (!ctx || vol <= 0.01) return;
    const now = ctx.currentTime;
    // Warm rising medical recovery chord (C5 -> E5 -> G5 -> C6)
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.065;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(0.15 * vol, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
      osc.connect(g);
      g.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.28);
    });
  }

  public pickPoliceLine(kind: 'kill' | 'warn'): { text: string; tts: string } {
    return pickHindiLine(kind === 'kill' ? 'police_kill' : 'police_warn');
  }

  public speakPoliceLine(
    kind: 'kill' | 'warn',
    customText?: string,
    customTts?: string,
  ): { text: string; tts: string } | null {
    if (!this.settings.policeVoiceEnabled) return null;
    if (kind === 'warn') {
      const now = performance.now();
      if (now - this.lastWarnVoiceAt < 7500) return null;
      this.lastWarnVoiceAt = now;
    }

    const picked = this.pickPoliceLine(kind);
    const displayText = customText ?? picked.text;
    const ttsText = customTts ?? customText ?? picked.tts;
    this.speakNpcLine('officer', Math.floor(Math.random() * 1000) + 10, ttsText, kind === 'kill' ? 'high' : 'normal');
    return { text: displayText, tts: ttsText };
  }

  private clearSpeechTimers(): void {
    if (this.speechTimerId !== null) {
      window.clearTimeout(this.speechTimerId);
      this.speechTimerId = null;
    }
    if (this.speechMaxTimeoutId !== null) {
      window.clearTimeout(this.speechMaxTimeoutId);
      this.speechMaxTimeoutId = null;
    }
    if (this.keepAliveId !== null) {
      window.clearInterval(this.keepAliveId);
      this.keepAliveId = null;
    }
  }

  /**
   * Speaks an NPC or system line prioritizing Hindi AI voices (`hi-IN`, `en-IN`),
   * ensuring distinct male vocal profiles per character role/seed, exact full-sentence
   * completion without cancel() truncation, and priority gating so ambient chatter
   * never interrupts active Judge/Vakil/Inspector/Story dialogue.
   */
  public speakNpcLine(
    role:
      | 'officer'
      | 'inspector'
      | 'enforcer'
      | 'dealer'
      | 'citizen'
      | 'banker'
      | 'narrator'
      | 'judge'
      | 'lawyer'
      | 'warden'
      | 'clerk'
      | 'mom',
    seedId: number,
    textOrDevanagari: string,
    priority: 'high' | 'normal' | 'low' = 'normal',
  ): void {
    if ((role === 'officer' || role === 'warden' || role === 'inspector') && !this.settings.policeVoiceEnabled) return;
    if ((role === 'citizen' || role === 'enforcer' || role === 'dealer' || role === 'clerk') && !this.settings.npcVoiceEnabled) return;
    if ((role === 'banker' || role === 'narrator' || role === 'judge' || role === 'lawyer' || role === 'mom') && !this.settings.gameVoiceEnabled) return;

    const cleanText = textOrDevanagari.trim();
    if (!cleanText) return;

    // Never let low/normal ambient lines interrupt an active higher-priority utterance
    if (this.isSpeaking()) {
      if (priority === 'low' && (this.activeSpeechPriority === 'high' || this.activeSpeechPriority === 'normal')) {
        return;
      }
      if (priority === 'normal' && this.activeSpeechPriority === 'high') {
        return;
      }
    }

    const hash = Math.abs(seedId * 2654435761 + role.charCodeAt(0) * 131) >>> 0;
    let rate = 0.94;
    let pitch = 0.88;
    let blipFreq = 220;
    let blipWave: OscillatorType = 'triangle';
    const isFemaleRole = role === 'lawyer' || role === 'mom';

    if (role === 'judge') {
      rate = 0.92;
      pitch = 0.82; // Authoritative judicial baritone
      blipFreq = 138;
      blipWave = 'triangle';
    } else if (role === 'inspector') {
      rate = 1.05;
      pitch = 0.90; // Crisp commanding Police Inspector
      blipFreq = 158;
      blipWave = 'triangle';
    } else if (role === 'warden') {
      rate = 1.02;
      pitch = 0.88; // Gruff Jail Warden
      blipFreq = 146;
      blipWave = 'sawtooth';
    } else if (role === 'officer') {
      rate = 1.05;
      pitch = 0.88 + (hash % 3) * 0.02; // ~0.90 police squad officers
      blipFreq = 165 + (hash % 3) * 12;
      blipWave = 'triangle';
    } else if (role === 'lawyer') {
      rate = 1.08;
      pitch = 1.05; // Adv. Meera Sharma / articulate Defense Vakil
      blipFreq = 305;
      blipWave = 'sine';
    } else if (role === 'mom') {
      rate = 0.96;
      pitch = 1.08; // Warm family / mother Hindi voice
      blipFreq = 285;
      blipWave = 'sine';
    } else if (role === 'banker') {
      rate = 1.0;
      pitch = 0.97;
      blipFreq = 240;
      blipWave = 'triangle';
    } else if (role === 'narrator') {
      rate = 0.98;
      pitch = 0.95;
      blipFreq = 260;
      blipWave = 'sine';
    } else if (role === 'enforcer') {
      rate = 1.02 + (hash % 3) * 0.03;
      pitch = 0.84 + (hash % 4) * 0.03;
      blipFreq = 128 + (hash % 4) * 14;
      blipWave = 'sawtooth';
    } else if (role === 'dealer') {
      rate = 1.03;
      pitch = 0.96;
      blipFreq = 205;
      blipWave = 'square';
    } else if (role === 'clerk') {
      rate = 1.04 + (hash % 2) * 0.03;
      pitch = 0.98 + (hash % 5) * 0.035; // 0.98..1.12
      blipFreq = 245;
      blipWave = 'square';
    } else {
      // Varied street civilians / inmates across pitches 0.95..1.18
      rate = 0.96 + (hash % 4) * 0.03;
      pitch = 0.95 + (hash % 7) * 0.038;
      blipFreq = 185 + (hash % 6) * 20;
      blipWave = 'triangle';
    }

    const seq = ++this.speechSeq;
    this.clearSpeechTimers();
    this.activeSpeaking = true;
    this.activeSpeechPriority = priority;
    const estDurationMs = Math.max(2200, Math.min(16000, cleanText.length * 85));
    this.minSubtitleHoldUntil = performance.now() + Math.min(4500, Math.max(1500, cleanText.length * 55));

    let hasUsableSpeechVoice = false;
    const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const live = window.speechSynthesis.getVoices();
        if (live && live.length > 0) this.cachedVoices = live;
        const rawVoices = this.cachedVoices;
        // When offline, cloud voices (e.g. Google हिन्दी with localService === false) fail silently;
        // filter strictly to local OS voices when offline so local Hindi/Indian voices can still speak.
        const allVoices = isOffline ? rawVoices.filter((v) => v.localService) : rawVoices;

        const googleHindi = allVoices.find((v) => /google\s*(हिन्दी|hindi)/i.test(v.name));
        const hemantOrMadhur = allVoices.filter((v) => /microsoft.*(hemant|madhur)/i.test(v.name));
        const kalpanaOrSwara = allVoices.filter((v) => /microsoft.*(kalpana|swara)/i.test(v.name));
        const hiAll = allVoices.filter(
          (v) => v.lang.toLowerCase().startsWith('hi') || /hindi|हिन्दी|hemant|kalpana|swara|madhur/i.test(v.name),
        );
        const enInAll = allVoices.filter(
          (v) => v.lang.toLowerCase() === 'en-in' || v.lang.toLowerCase().includes('in'),
        );

        const pickVoice = (): SpeechSynthesisVoice | undefined => {
          if (allVoices.length === 0) return undefined;
          // Female role (Adv. Meera Sharma / mom): prefer Kalpana/Swara -> Google Hindi -> hi-IN -> en-IN
          if (isFemaleRole) {
            if (kalpanaOrSwara.length > 0) return kalpanaOrSwara[hash % kalpanaOrSwara.length];
            if (googleHindi) return googleHindi;
            if (hiAll.length > 0) return hiAll[hash % hiAll.length];
            if (enInAll.length > 0) return enInAll[hash % enInAll.length];
            return undefined;
          }
          if (googleHindi && (role === 'judge' || role === 'narrator' || role === 'banker' || hash % 2 === 0)) {
            return googleHindi;
          }
          if (hemantOrMadhur.length > 0) {
            return hemantOrMadhur[hash % hemantOrMadhur.length];
          }
          if (googleHindi) return googleHindi;
          if (kalpanaOrSwara.length > 0) return kalpanaOrSwara[hash % kalpanaOrSwara.length];
          if (hiAll.length > 0) return hiAll[hash % hiAll.length];
          if (enInAll.length > 0) return enInAll[hash % enInAll.length];
          return undefined;
        };

        const chosenVoice = pickVoice();
        hasUsableSpeechVoice = Boolean(chosenVoice) || (!isOffline && hiAll.length > 0);

        if (!isOffline || chosenVoice) {
          // Cancel cleanly first, then wait 55ms before calling speak() to avoid Chromium mid-sentence drop bug
          window.speechSynthesis.cancel();

          this.speechTimerId = window.setTimeout(() => {
            this.speechTimerId = null;
            if (seq !== this.speechSeq) return;
            try {
              const utter = new SpeechSynthesisUtterance(cleanText);
              if (chosenVoice) {
                utter.voice = chosenVoice;
                utter.lang = chosenVoice.lang?.toLowerCase().startsWith('hi') ? chosenVoice.lang : 'hi-IN';
              } else {
                utter.lang = 'hi-IN';
              }
              utter.rate = rate;
              utter.pitch = pitch;
              utter.volume = Math.max(0.25, Math.min(1, this.settings.masterVolume));

              const finish = () => {
                if (seq !== this.speechSeq) return;
                this.activeSpeaking = false;
                this.clearSpeechTimers();
              };
              utter.onend = finish;
              utter.onerror = () => {
                if (seq === this.speechSeq && !this.settings.retroVoiceBlips) {
                  this.playRetroVoiceBlips(cleanText, blipFreq, blipWave);
                }
                finish();
              };

              // Keep Chromium SpeechSynthesis awake during longer courtroom/cutscene sentences
              this.keepAliveId = window.setInterval(() => {
                if (seq !== this.speechSeq) return;
                try {
                  if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
                    window.speechSynthesis.resume();
                  } else if (!window.speechSynthesis.speaking && !window.speechSynthesis.pending) {
                    finish();
                  }
                } catch {
                  // ignore
                }
              }, 3500);

              this.speechMaxTimeoutId = window.setTimeout(finish, estDurationMs);
              window.speechSynthesis.speak(utter);
            } catch {
              if (seq === this.speechSeq) {
                this.activeSpeaking = false;
                this.clearSpeechTimers();
              }
            }
          }, 55);
        } else {
          this.speechMaxTimeoutId = window.setTimeout(() => {
            if (seq === this.speechSeq) {
              this.activeSpeaking = false;
            }
          }, Math.min(3500, estDurationMs));
        }
      } catch {
        this.activeSpeaking = false;
      }
    } else if (typeof window !== 'undefined') {
      this.speechMaxTimeoutId = Number(
        (window as Window).setTimeout(() => {
          if (seq === this.speechSeq) {
            this.activeSpeaking = false;
          }
        }, estDurationMs),
      );
    } else {
      this.activeSpeaking = false;
    }

    if (this.settings.retroVoiceBlips || !hasUsableSpeechVoice) {
      this.playRetroVoiceBlips(cleanText, blipFreq, blipWave);
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
    this.speechSeq++;
    this.activeSpeaking = false;
    this.minSubtitleHoldUntil = 0;
    this.clearSpeechTimers();
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
