/**
 * Romantic Ambient Music Engine using Web Audio API
 * Generates an ethereal, warm music-box / acoustic piano arpeggio progression.
 * Safe for mobile browsers since it initiates on user gesture.
 */

class RomanticAudioEngine {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private volume: number = 0.4;
  private gainNode: GainNode | null = null;
  private timerId: number | null = null;
  private customAudio: HTMLAudioElement | null = null;
  private useCustomAudio: boolean = false;

  private notes = [
    // Beautiful romantic progression: Cmaj9 -> Am9 -> Fmaj7 -> Gsus4 -> C
    // Note frequencies in Hz
    261.63, 329.63, 392.0, 493.88, 523.25, // C4, E4, G4, B4, C5
    220.0, 261.63, 329.63, 392.0, 440.0,  // A3, C4, E4, G4, A4
    174.61, 261.63, 329.63, 349.23, 440.0, // F3, C4, E4, F4, A4
    196.0, 261.63, 293.66, 392.0, 493.88  // G3, C4, D4, G4, B4
  ];

  private currentNoteIndex = 0;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public play() {
    if (this.useCustomAudio && this.customAudio) {
      this.customAudio.play().catch(e => console.warn('Custom audio play error', e));
      this.isRunning = true;
      return;
    }

    this.initContext();
    if (!this.ctx || !this.gainNode) return;
    this.isRunning = true;

    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
    }

    // Play next note every 500ms for a gentle soothing music box arpeggio
    this.playNextChime();
    this.timerId = window.setInterval(() => {
      if (this.isRunning) {
        this.playNextChime();
      }
    }, 520);
  }

  private playNextChime() {
    if (!this.ctx || !this.gainNode || !this.isRunning) return;

    const freq = this.notes[this.currentNoteIndex];
    this.currentNoteIndex = (this.currentNoteIndex + 1) % this.notes.length;

    const now = this.ctx.currentTime;

    // Dual oscillator: sine for purity + triangle for warmth like a music box
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, now); // soft high octave overtone

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, now);

    // Warm envelope
    noteGain.gain.setValueAtTime(0, now);
    noteGain.gain.linearRampToValueAtTime(0.18, now + 0.04);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(noteGain);
    noteGain.connect(this.gainNode);

    osc1.start(now);
    osc2.start(now);

    osc1.stop(now + 1.9);
    osc2.stop(now + 1.9);
  }

  private wasPlayingBeforeVideo: boolean = false;

  public pauseForVideo() {
    if (this.isRunning) {
      this.wasPlayingBeforeVideo = true;
      this.stop();
    }
  }

  public resumeAfterVideo() {
    if (this.wasPlayingBeforeVideo) {
      this.wasPlayingBeforeVideo = false;
      this.play();
    }
  }

  public stop() {
    this.isRunning = false;
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
    if (this.customAudio) {
      this.customAudio.pause();
    }
  }

  public toggle(): boolean {
    if (this.isRunning) {
      this.stop();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
    if (this.customAudio) {
      this.customAudio.volume = this.volume;
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getIsPlaying(): boolean {
    return this.isRunning;
  }

  public setCustomAudioUrl(url: string) {
    if (this.customAudio) {
      this.customAudio.pause();
      this.customAudio = null;
    }
    if (url) {
      this.customAudio = new Audio(url);
      this.customAudio.loop = true;
      this.customAudio.volume = this.volume;
      this.useCustomAudio = true;
    } else {
      this.useCustomAudio = false;
    }
  }
}

export const romanticAudio = new RomanticAudioEngine();
