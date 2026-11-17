// Synthesized Web Audio API sound design system
// Respects browser autoplay rules and user preference toggle in localStorage

class SoundSystem {
  private ctx: AudioContext | null = null;

  private isEnabled(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const stored = window.localStorage.getItem('mediconnect_sound_enabled');
      return stored === null ? true : stored === 'true';
    } catch {
      return false;
    }
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.isEnabled()) return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.04, delay = 0) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

      gain.gain.setValueAtTime(0.0001, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(volume, ctx.currentTime + delay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration + 0.01);
    } catch {
      // Ignore audio errors
    }
  }

  click() {
    this.playTone(580, 0.045, 'sine', 0.03);
  }

  toggle(on = true) {
    this.playTone(on ? 480 : 600, 0.04, 'triangle', 0.03);
    this.playTone(on ? 640 : 460, 0.05, 'triangle', 0.025, 0.035);
  }

  notify() {
    this.playTone(523.25, 0.12, 'sine', 0.04); // C5
    this.playTone(659.25, 0.16, 'sine', 0.04, 0.09); // E5
  }

  confirm() {
    // Soft luxury triad chime (C5 - E5 - G5 - C6)
    this.playTone(523.25, 0.14, 'sine', 0.045, 0);
    this.playTone(659.25, 0.14, 'sine', 0.045, 0.08);
    this.playTone(783.99, 0.16, 'sine', 0.045, 0.16);
    this.playTone(1046.5, 0.28, 'sine', 0.05, 0.24);
  }

  success() {
    this.playTone(587.33, 0.1, 'sine', 0.04, 0);
    this.playTone(880, 0.18, 'sine', 0.045, 0.08);
  }

  error() {
    this.playTone(260, 0.12, 'sawtooth', 0.025, 0);
    this.playTone(210, 0.16, 'sawtooth', 0.025, 0.09);
  }
}

export const sounds = new SoundSystem();
