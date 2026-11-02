/**
 * High-fidelity Procedural Horror Web Audio Engine
 * Zero external audio assets (100% procedural Web Audio API synthesis)
 * Optimized for mobile Android and Desktop.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;

  // Active ambient loops
  private droneOsc1: OscillatorNode | null = null;
  private droneOsc2: OscillatorNode | null = null;
  private subDroneOsc: OscillatorNode | null = null;
  private noiseNode: AudioNode | null = null;
  private heartbeatTimer: number | null = null;

  private isMuted: boolean = false;
  private masterVol: number = 0.8;
  private sfxVol: number = 0.9;
  private musicVol: number = 0.6;

  private heartbeatBpm: number = 60;
  private isHeartbeatPlaying: boolean = false;
  private isAmbiencePlaying: boolean = false;

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVol, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVol, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVol, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(this.musicVol * 0.75, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  public ensureContext() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public updateVolumes(master: number, sfx: number, music: number) {
    this.masterVol = master;
    this.sfxVol = sfx;
    this.musicVol = music;

    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.masterGain) this.masterGain.gain.setTargetAtTime(master, now, 0.05);
    if (this.sfxGain) this.sfxGain.gain.setTargetAtTime(sfx, now, 0.05);
    if (this.musicGain) this.musicGain.gain.setTargetAtTime(music, now, 0.05);
    if (this.ambientGain) this.ambientGain.gain.setTargetAtTime(music * 0.75, now, 0.05);
  }

  // --- AMBIENT SOUNDTRACK ---
  public startDarkAmbience() {
    this.ensureContext();
    if (!this.ctx || !this.ambientGain || this.isAmbiencePlaying) return;
    this.isAmbiencePlaying = true;

    const t = this.ctx.currentTime;

    // Sub-bass rumble (40Hz detuned)
    this.subDroneOsc = this.ctx.createOscillator();
    this.subDroneOsc.type = 'sine';
    this.subDroneOsc.frequency.setValueAtTime(42, t);

    const subFilter = this.ctx.createBiquadFilter();
    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(80, t);

    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.001, t);
    subGain.gain.exponentialRampToValueAtTime(0.35, t + 4);

    this.subDroneOsc.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(this.ambientGain);
    this.subDroneOsc.start();

    // Dissonant creepy harmonic drone (sawtooth through resonant lowpass filter)
    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc1.type = 'sawtooth';
    this.droneOsc1.frequency.setValueAtTime(65.41, t); // C2

    const droneFilter1 = this.ctx.createBiquadFilter();
    droneFilter1.type = 'lowpass';
    droneFilter1.frequency.setValueAtTime(260, t);
    droneFilter1.Q.setValueAtTime(4, t);

    // Subtle LFO modulation for breathing drone
    const lfo = this.ctx.createOscillator();
    lfo.frequency.setValueAtTime(0.15, t);
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(100, t);
    lfo.connect(lfoGain);
    lfoGain.connect(droneFilter1.frequency);
    lfo.start();

    const droneGain1 = this.ctx.createGain();
    droneGain1.gain.setValueAtTime(0.001, t);
    droneGain1.gain.exponentialRampToValueAtTime(0.12, t + 3);

    this.droneOsc1.connect(droneFilter1);
    droneFilter1.connect(droneGain1);
    droneGain1.connect(this.ambientGain);
    this.droneOsc1.start();

    // Secondary tension chord (F# / dissonant tritone)
    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc2.type = 'triangle';
    this.droneOsc2.frequency.setValueAtTime(92.5, t); // F#2 tritone

    const droneGain2 = this.ctx.createGain();
    droneGain2.gain.setValueAtTime(0.001, t);
    droneGain2.gain.exponentialRampToValueAtTime(0.08, t + 5);

    this.droneOsc2.connect(droneGain2);
    droneGain2.connect(this.ambientGain);
    this.droneOsc2.start();

    // Start subtle rain/wind noise bed
    this.createRainBed();
  }

  private createRainBed() {
    if (!this.ctx || !this.ambientGain) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.05; // soft pink noise
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, this.ctx.currentTime);

    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.09, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(this.ambientGain);
    whiteNoise.start();
    this.noiseNode = whiteNoise;
  }

  public stopDarkAmbience() {
    if (!this.ctx) return;
    try {
      this.droneOsc1?.stop();
      this.droneOsc2?.stop();
      this.subDroneOsc?.stop();
      (this.noiseNode as AudioBufferSourceNode)?.stop();
    } catch {}
    this.isAmbiencePlaying = false;
  }

  // --- HEARTBEAT & SANITY SYSTEM ---
  public updateSanityHeartbeat(sanity: number, monsterProximity: number) {
    this.ensureContext();
    // Proximity 0 to 1 (1 = right behind you)
    // Sanity 100 to 0 (0 = full panic)
    const panicLevel = Math.max((100 - sanity) / 100, monsterProximity);

    if (panicLevel > 0.25) {
      this.heartbeatBpm = 65 + panicLevel * 105; // 65 to 170 BPM!
      if (!this.isHeartbeatPlaying) {
        this.isHeartbeatPlaying = true;
        this.scheduleHeartbeatTick();
      }
    } else {
      this.isHeartbeatPlaying = false;
      if (this.heartbeatTimer) {
        window.clearTimeout(this.heartbeatTimer);
        this.heartbeatTimer = null;
      }
    }
  }

  private scheduleHeartbeatTick() {
    if (!this.isHeartbeatPlaying || !this.ctx) return;
    this.playHeartbeatSound();
    const intervalMs = (60 / this.heartbeatBpm) * 1000;
    this.heartbeatTimer = window.setTimeout(() => {
      this.scheduleHeartbeatTick();
    }, intervalMs);
  }

  private playHeartbeatSound() {
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // "Lub-dub" double pulse
    [0, 0.12].forEach((offset, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(idx === 0 ? 55 : 45, t + offset);
      osc.frequency.exponentialRampToValueAtTime(30, t + offset + 0.15);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(110, t + offset);

      gain.gain.setValueAtTime(idx === 0 ? 0.35 : 0.22, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + offset);
      osc.stop(t + offset + 0.2);
    });
  }

  // --- SOUND EFFECTS ---

  public playFootstep(isSprinting: boolean = false, surface: 'tile' | 'puddle' | 'grate' = 'tile') {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    if (surface === 'tile') {
      osc.type = 'triangle';
      const baseFreq = isSprinting ? 90 + Math.random() * 20 : 70 + Math.random() * 15;
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.08);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, t);

      const vol = isSprinting ? 0.28 : 0.15;
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    } else {
      // Puddle splash / grate
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.12);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.12);
  }

  public playFlashlightClick(turnOn: boolean) {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(turnOn ? 1800 : 1200, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.03);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.04);
  }

  public playDoorCreak(isUnlocking: boolean = false) {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    if (isUnlocking) {
      // Metallic latch mechanism
      const clickOsc = this.ctx.createOscillator();
      clickOsc.type = 'sawtooth';
      clickOsc.frequency.setValueAtTime(880, t);
      clickOsc.frequency.exponentialRampToValueAtTime(220, t + 0.15);

      const clickGain = this.ctx.createGain();
      clickGain.gain.setValueAtTime(0.35, t);
      clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      clickOsc.connect(clickGain);
      clickGain.connect(this.sfxGain);
      clickOsc.start(t);
      clickOsc.stop(t + 0.2);
    }

    // Heavy wooden/metal door groaning open
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t + 0.1);
    osc.frequency.exponentialRampToValueAtTime(65, t + 0.7);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, t);
    filter.Q.setValueAtTime(6, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.25, t + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.75);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t + 0.1);
    osc.stop(t + 0.8);
  }

  public playDoorLocked() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    [0, 0.08].forEach((offset) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, t + offset);
      osc.frequency.exponentialRampToValueAtTime(110, t + offset + 0.06);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, t + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.07);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + offset);
      osc.stop(t + offset + 0.08);
    });
  }

  public playPickup() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, t); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.5, t + 0.12); // C6

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  public playThunderclap() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Sub rumble
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 1.8);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(250, t);
    filter.frequency.exponentialRampToValueAtTime(60, t + 2.0);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 2.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 2.3);
  }

  public playMonsterGrowl(distanceFactor: number = 0.5) {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;
    const vol = Math.max(0.1, 0.6 * (1 - distanceFactor));

    // Throat guttural growl
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(55, t);
    osc.frequency.linearRampToValueAtTime(75, t + 0.4);
    osc.frequency.exponentialRampToValueAtTime(40, t + 1.2);

    // Filter with high resonance
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(320, t);
    filter.Q.setValueAtTime(7, t);

    // Distortion
    const shaper = this.ctx.createWaveShaper();
    shaper.curve = this.makeDistortionCurve(50);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.3);

    osc.connect(shaper);
    shaper.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 1.4);
  }

  public playMonsterScreech() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Screeching high-pitch terror shriek
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(450, t);
    osc1.frequency.exponentialRampToValueAtTime(1400, t + 0.25);
    osc1.frequency.exponentialRampToValueAtTime(300, t + 1.1);

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(475, t); // detuned
    osc2.frequency.exponentialRampToValueAtTime(1380, t + 0.25);
    osc2.frequency.exponentialRampToValueAtTime(320, t + 1.1);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(400, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.05, t);
    gain.gain.linearRampToValueAtTime(0.65, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 1.25);
    osc2.stop(t + 1.25);
  }

  public playJumpscareStinger() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Sudden cluster dissonance (Horror stinger)
    const freqs = [110, 155.5, 220, 311.1, 440, 622.2, 880];
    freqs.forEach((freq) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, t + 0.9);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 1.1);
    });
  }

  public playBreakerSwitch() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Heavy mechanical clunk + electrical spark
    const osc = this.ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.15);

    // Spark buzz
    const buzz = this.ctx.createOscillator();
    buzz.type = 'sawtooth';
    buzz.frequency.setValueAtTime(120, t + 0.05);

    const buzzGain = this.ctx.createGain();
    buzzGain.gain.setValueAtTime(0.15, t + 0.05);
    buzzGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    buzz.connect(buzzGain);
    buzzGain.connect(this.sfxGain);
    buzz.start(t + 0.05);
    buzz.stop(t + 0.26);
  }

  public playLockerEnter(isEntering: boolean) {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    // Sheet metal rattling / thud
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.45);
  }

  public playRadioStatic() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.5);
  }

  private makeDistortionCurve(amount: number) {
    const k = typeof amount === 'number' ? amount : 50;
    const n_samples = 44100;
    const curve = new Float32Array(n_samples);
    const deg = Math.PI / 180;
    for (let i = 0; i < n_samples; ++i) {
      const x = (i * 2) / n_samples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }
}

export const sound = new SoundEngine();
