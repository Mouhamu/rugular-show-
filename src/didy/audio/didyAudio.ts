/**
 * DIDY CUP - High-Energy Electronic Sound & Music Engine
 * Built with Web Audio API for 100% offline, zero-latency, high-octane cartoon audio.
 * Features an energetic electronic soundtrack inspired by the driving intensity of 'PROPIONATE - HELLBLADE'
 */

export class DidyAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private voiceGain: GainNode | null = null;

  private isMuted: boolean = false;
  private currentTrack: 'NONE' | 'MENU' | 'DROP' | 'MATCH' = 'NONE';
  private musicInterval: number | null = null;
  private step: number = 0;

  constructor() {
    // Lazy initialized on user click/interaction
  }

  private init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.voiceGain = this.ctx.createGain();

      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.voiceGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.musicGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.sfxGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.voiceGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
    } catch {
      // AudioContext unavailable
    }
  }

  public resume() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolumes(master: number, music: number, sfx: number, voice: number, muted: boolean = false) {
    this.init();
    if (!this.ctx || !this.masterGain || !this.musicGain || !this.sfxGain || !this.voiceGain) return;
    this.isMuted = muted;
    const now = this.ctx.currentTime;
    const targetMaster = muted ? 0 : Math.max(0, Math.min(1, master));
    this.masterGain.gain.setTargetAtTime(targetMaster, now, 0.05);
    this.musicGain.gain.setTargetAtTime(Math.max(0, Math.min(1, music)), now, 0.05);
    this.sfxGain.gain.setTargetAtTime(Math.max(0, Math.min(1, sfx)), now, 0.05);
    this.voiceGain.gain.setTargetAtTime(Math.max(0, Math.min(1, voice)), now, 0.05);
  }

  // --- MUSIC TRACKS ---
  public playTrack(track: 'MENU' | 'DROP' | 'MATCH') {
    if (this.currentTrack === track && this.musicInterval) return;
    this.stopTrack();
    this.currentTrack = track;
    this.resume();
    if (!this.ctx) return;

    this.step = 0;
    const bpm = track === 'MATCH' ? 140 : track === 'DROP' ? 132 : 124;
    const stepInterval = (60 / bpm / 4) * 1000; // 16th notes

    // Bass notes progression for energetic electronic drive (Hellblade style synth arpeggios & kick)
    const matchBassProg = [55, 55, 65.4, 55, 73.4, 55, 65.4, 82.4]; // A1, C2, D2, E2
    const dropBassProg = [65.4, 65.4, 73.4, 87.3, 98.0, 87.3, 73.4, 65.4];
    const menuBassProg = [43.6, 43.6, 51.9, 58.3, 43.6, 51.9, 65.4, 58.3]; // Funky F

    this.musicInterval = window.setInterval(() => {
      if (!this.ctx || !this.musicGain || this.isMuted) return;
      const now = this.ctx.currentTime;
      const beat = this.step % 16;

      // 1. PUNCHY DRIVING KICK (Beats 0, 4, 8, 12)
      if (beat % 4 === 0) {
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(140, now);
        kickOsc.frequency.exponentialRampToValueAtTime(38, now + 0.09);
        kickGain.gain.setValueAtTime(0.55, now);
        kickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        kickOsc.connect(kickGain);
        kickGain.connect(this.musicGain);
        kickOsc.start(now);
        kickOsc.stop(now + 0.11);
      }

      // 2. CRISP CLAP / SNARE (Beats 4, 12)
      if (beat === 4 || beat === 12) {
        const snareNoise = this.createNoiseBuffer(0.12);
        if (snareNoise) {
          const src = this.ctx.createBufferSource();
          src.buffer = snareNoise;
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.setValueAtTime(1200, now);
          const snareGain = this.ctx.createGain();
          snareGain.gain.setValueAtTime(0.3, now);
          snareGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
          src.connect(filter);
          filter.connect(snareGain);
          snareGain.connect(this.musicGain);
          src.start(now);
        }
      }

      // 3. SYNTH HI-HAT (every odd 16th note)
      if (beat % 2 === 1) {
        const hatOsc = this.ctx.createOscillator();
        const hatGain = this.ctx.createGain();
        hatOsc.type = 'sawtooth';
        hatOsc.frequency.setValueAtTime(4500, now);
        hatGain.gain.setValueAtTime(0.08, now);
        hatGain.gain.exponentialRampToValueAtTime(0.005, now + 0.04);
        hatOsc.connect(hatGain);
        hatGain.connect(this.musicGain);
        hatOsc.start(now);
        hatOsc.stop(now + 0.05);
      }

      // 4. ROLLING ENERGETIC SYNTH BASSLINE (Hellblade / Regular Show electric energy)
      if (beat % 2 === 0) {
        const prog = track === 'MATCH' ? matchBassProg : track === 'DROP' ? dropBassProg : menuBassProg;
        const note = prog[(this.step / 2) % prog.length];
        const bassOsc = this.ctx.createOscillator();
        const bassFilter = this.ctx.createBiquadFilter();
        const bassGain = this.ctx.createGain();

        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(note, now);

        bassFilter.type = 'lowpass';
        bassFilter.frequency.setValueAtTime(track === 'MATCH' ? 850 : 650, now);
        bassFilter.frequency.exponentialRampToValueAtTime(180, now + 0.12);

        bassGain.gain.setValueAtTime(0.28, now);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        bassOsc.connect(bassFilter);
        bassFilter.connect(bassGain);
        bassGain.connect(this.musicGain);

        bassOsc.start(now);
        bassOsc.stop(now + 0.13);
      }

      // 5. CARTOON ARPEGGIO CHIME (high register spark)
      if (this.step % 4 === 2) {
        const arpOsc = this.ctx.createOscillator();
        const arpGain = this.ctx.createGain();
        arpOsc.type = 'triangle';
        const chord = [440, 554.37, 659.25, 880, 1108.73];
        const freq = chord[(this.step % chord.length)];
        arpOsc.frequency.setValueAtTime(freq, now);
        arpGain.gain.setValueAtTime(0.12, now);
        arpGain.gain.exponentialRampToValueAtTime(0.005, now + 0.08);

        arpOsc.connect(arpGain);
        arpGain.connect(this.musicGain);
        arpOsc.start(now);
        arpOsc.stop(now + 0.09);
      }

      this.step++;
    }, stepInterval);
  }

  public stopTrack() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.currentTrack = 'NONE';
  }

  // --- SOUND EFFECTS ---

  public playJump() {
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(580, now + 0.16);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.17);
  }

  public playBouncePad() {
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.28);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.29);
  }

  public playCollectMedal() {
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Pleasant double bell chime
    [987.77, 1318.51].forEach((freq, i) => {
      const t = now + i * 0.07;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + 0.21);
    });
  }

  public playHighFive() {
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Slap sound + high bell
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.1);
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  public playGliderDeploy() {
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const noise = this.createNoiseBuffer(0.25);
    if (!noise) return;
    const src = this.ctx.createBufferSource();
    src.buffer = noise;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(1200, now + 0.2);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);
    src.start(now);
  }

  public playLanding() {
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.14);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  public playVictoryFanfare() {
    this.stopTrack();
    this.resume();
    if (!this.ctx || !this.musicGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Triumphant cartoon brass fanfare (C major to high G)
    const melody = [523.25, 659.25, 783.99, 1046.5];
    melody.forEach((freq, idx) => {
      const t = now + idx * 0.16;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + (idx === melody.length - 1 ? 0.9 : 0.22));

      osc.connect(gain);
      gain.connect(this.musicGain!);
      osc.start(t);
      osc.stop(t + (idx === melody.length - 1 ? 0.95 : 0.25));
    });
  }

  public playDefeatCue() {
    this.stopTrack();
    this.resume();
    if (!this.ctx || !this.musicGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Sad trombone slide
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.linearRampToValueAtTime(190, now + 0.7);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.7);

    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(now);
    osc.stop(now + 0.75);
  }

  public playButtonClick() {
    this.resume();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(1100, now + 0.05);
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.06);
  }

  private createNoiseBuffer(durationSeconds: number): AudioBuffer | null {
    if (!this.ctx) return null;
    const size = Math.floor(this.ctx.sampleRate * durationSeconds);
    const buf = this.ctx.createBuffer(1, size, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < size; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buf;
  }
}

export const didyAudio = new DidyAudioEngine();
