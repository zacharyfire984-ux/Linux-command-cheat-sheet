/**
 * Web Audio Rhythmic Study Beats Engine
 * Synthesizes mellow, low basic beats with rhythmic pulses for focused studying.
 * 100% offline, zero latency, pure Web Audio API synthesis.
 */

export interface BeatPreset {
  id: string;
  name: string;
  bpm: number;
  description: string;
}

export const BEAT_PRESETS: BeatPreset[] = [
  {
    id: 'lofi-chill',
    name: 'Lo-Fi Study Groove',
    bpm: 76,
    description: 'Relaxed kick, warm rimshot, swinging hats and mellow sub-bass.',
  },
  {
    id: 'deep-focus',
    name: 'Deep Focus Pulse',
    bpm: 68,
    description: 'Slow hypnotic kick and steady heartbeat rhythm for long reading sessions.',
  },
  {
    id: 'midnight-terminal',
    name: 'Midnight Terminal',
    bpm: 84,
    description: 'Syncopated cyber beat with tight hats and rhythmic 808 sub-bass.',
  },
  {
    id: 'cyber-downtempo',
    name: 'Cyberpunk Downtempo',
    bpm: 90,
    description: 'Steady driving pulse that keeps alertness high during security labs.',
  },
];

class StudyBeatsEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentStep = 0;
  private intervalId: number | null = null;
  private bpm = 76;
  private volume = 0.5;
  private masterGain: GainNode | null = null;
  private vinylGain: GainNode | null = null;
  private vinylSource: AudioBufferSourceNode | null = null;

  public drumsEnabled = true;
  public bassEnabled = true;
  public vinylEnabled = true;
  public currentPresetId = 'lofi-chill';
  public onStepCallback: ((step: number) => void) | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Generate continuous soft vinyl crackle / tape noise buffer
  private createVinylNoise(): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext missing');
    const bufferSize = this.ctx.sampleRate * 3; // 3 second loop
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Brown noise filter for deep mellow warmth
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 0.15;
      // Occasional faint dust pop
      if (Math.random() < 0.0008) {
        data[i] += (Math.random() * 2 - 1) * 0.4;
      }
    }
    return buffer;
  }

  // Synthesize soft lo-fi kick drum
  private playKick(time: number) {
    if (!this.ctx || !this.masterGain || !this.drumsEnabled) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Deep pitch drop from 110Hz to 40Hz
    osc.frequency.setValueAtTime(110, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.12);

    gain.gain.setValueAtTime(0.75, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.3);
  }

  // Synthesize soft rimshot / lo-fi snare
  private playSnare(time: number) {
    if (!this.ctx || !this.masterGain || !this.drumsEnabled) return;

    // 1. Noise component (filtered)
    const bufferSize = this.ctx.sampleRate * 0.15;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, time);
    filter.Q.setValueAtTime(1.8, time);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, time);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    whiteNoise.start(time);
    whiteNoise.stop(time + 0.15);

    // 2. Body pop tone
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);
    osc.frequency.exponentialRampToValueAtTime(80, time + 0.08);

    oscGain.gain.setValueAtTime(0.28, time);
    oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.09);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.1);
  }

  // Synthesize closed hi-hat with subtle swing
  private playHat(time: number, velocity = 0.25) {
    if (!this.ctx || !this.masterGain || !this.drumsEnabled) return;

    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7000, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(velocity, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    source.start(time);
    source.stop(time + 0.05);
  }

  // Synthesize mellow warm sub-bass note
  private playBass(time: number, noteFreq: number, duration: number) {
    if (!this.ctx || !this.masterGain || !this.bassEnabled) return;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(noteFreq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(220, time);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.35, time + 0.03);
    gain.gain.setValueAtTime(0.35, time + duration * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration + 0.05);
  }

  // Step trigger in 16-step rhythm pattern
  private triggerStep() {
    if (!this.ctx) return;
    const time = this.ctx.currentTime + 0.02;
    const step = this.currentStep % 16;
    const bar = Math.floor(this.currentStep / 16) % 4;

    // Chord progression bass roots: D2 (73.42Hz), Bb1 (58.27Hz), F1 (43.65Hz), C2 (65.41Hz)
    const bassNotes = [73.42, 58.27, 43.65, 65.41];
    const currentBass = bassNotes[bar];

    if (this.currentPresetId === 'lofi-chill') {
      // 16-step Lo-Fi Beat
      // Kick on 0, 7, 10
      if (step === 0 || step === 7 || step === 10) {
        this.playKick(time);
      }
      // Snare on 4, 12
      if (step === 4 || step === 12) {
        this.playSnare(time);
      }
      // Hi-hats on every even step with accent variations
      if (step % 2 === 0) {
        const vel = step % 4 === 0 ? 0.25 : 0.15;
        this.playHat(time, vel);
      } else if (step === 11 || step === 15) {
        // Ghost offbeat tap
        this.playHat(time, 0.1);
      }
      // Bass on 0 and 8
      if (step === 0) {
        this.playBass(time, currentBass, 0.5);
      } else if (step === 6) {
        this.playBass(time, currentBass * 1.5, 0.35); // fifth
      } else if (step === 10) {
        this.playBass(time, currentBass, 0.4);
      }
    } else if (this.currentPresetId === 'deep-focus') {
      // Slow hypnotic heartbeat
      if (step === 0 || step === 2) {
        this.playKick(time);
      }
      if (step === 8) {
        this.playSnare(time);
      }
      if (step % 4 === 0) {
        this.playHat(time, 0.12);
      }
      if (step === 0) {
        this.playBass(time, currentBass, 0.9);
      }
    } else if (this.currentPresetId === 'midnight-terminal') {
      // Midnight Terminal
      if (step === 0 || step === 6 || step === 10) {
        this.playKick(time);
      }
      if (step === 4 || step === 12) {
        this.playSnare(time);
      }
      if (step % 2 === 0 || step === 7 || step === 15) {
        this.playHat(time, 0.2);
      }
      if (step === 0 || step === 6) {
        this.playBass(time, currentBass, 0.45);
      }
    } else {
      // Cyberpunk Downtempo
      if (step === 0 || step === 4 || step === 8 || step === 12) {
        this.playKick(time);
      }
      if (step === 4 || step === 12) {
        this.playSnare(time);
      }
      if (step % 2 === 0) {
        this.playHat(time, 0.22);
      }
      if (step === 0 || step === 8) {
        this.playBass(time, currentBass, 0.6);
      }
    }

    if (this.onStepCallback) {
      this.onStepCallback(step);
    }

    this.currentStep = (this.currentStep + 1) % 64;
  }

  public start() {
    this.initContext();
    if (this.isPlaying) return;
    this.isPlaying = true;

    // Start vinyl warmth
    if (this.ctx && this.masterGain && this.vinylEnabled) {
      const vinylBuffer = this.createVinylNoise();
      this.vinylSource = this.ctx.createBufferSource();
      this.vinylSource.buffer = vinylBuffer;
      this.vinylSource.loop = true;

      this.vinylGain = this.ctx.createGain();
      this.vinylGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      this.vinylSource.connect(this.vinylGain);
      this.vinylGain.connect(this.masterGain);
      this.vinylSource.start();
    }

    // Calculate step interval based on 16th notes: (60 / BPM) / 4 * 1000 ms
    const stepDurationMs = ((60 / this.bpm) / 4) * 1000;
    this.intervalId = window.setInterval(() => {
      this.triggerStep();
    }, stepDurationMs);
  }

  public stop() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.vinylSource) {
      try {
        this.vinylSource.stop();
        this.vinylSource.disconnect();
      } catch {
        // Ignore if already stopped
      }
      this.vinylSource = null;
    }
    this.isPlaying = false;
    this.currentStep = 0;
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
    return this.isPlaying;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setBpm(val: number) {
    this.bpm = Math.max(50, Math.min(120, val));
    if (this.isPlaying) {
      // Restart interval with new BPM
      if (this.intervalId !== null) {
        clearInterval(this.intervalId);
      }
      const stepDurationMs = ((60 / this.bpm) / 4) * 1000;
      this.intervalId = window.setInterval(() => {
        this.triggerStep();
      }, stepDurationMs);
    }
  }

  public getBpm(): number {
    return this.bpm;
  }

  public setPreset(presetId: string) {
    const found = BEAT_PRESETS.find((p) => p.id === presetId);
    if (found) {
      this.currentPresetId = found.id;
      this.setBpm(found.bpm);
    }
  }
}

export const studyBeatsEngine = new StudyBeatsEngine();
