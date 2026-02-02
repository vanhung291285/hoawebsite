
class SoundService {
  private ctx: AudioContext | null = null;
  private bgmOscillator: OscillatorNode | null = null;
  private bgmGain: GainNode | null = null;
  private isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.bgmGain) {
      this.bgmGain.gain.setTargetAtTime(muted ? 0 : 0.05, this.ctx!.currentTime, 0.2);
    }
  }

  playCorrect() {
    if (this.isMuted) return;
    this.initCtx();
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, this.ctx!.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.50, this.ctx!.currentTime + 0.3); // C6
    
    gain.gain.setValueAtTime(0.2, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + 0.4);
    
    osc.connect(gain);
    gain.connect(this.ctx!.destination);
    
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.4);
  }

  playWrong() {
    if (this.isMuted) return;
    this.initCtx();
    const osc = this.ctx!.createOscillator();
    const gain = this.ctx!.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, this.ctx!.currentTime); // A3
    osc.frequency.linearRampToValueAtTime(110, this.ctx!.currentTime + 0.3); // A2
    
    gain.gain.setValueAtTime(0.1, this.ctx!.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + 0.4);
    
    osc.connect(gain);
    gain.connect(this.ctx!.destination);
    
    osc.start();
    osc.stop(this.ctx!.currentTime + 0.4);
  }

  startBGM() {
    if (this.bgmOscillator) return;
    this.initCtx();
    this.bgmGain = this.ctx!.createGain();
    this.bgmGain.gain.setValueAtTime(this.isMuted ? 0 : 0.05, this.ctx!.currentTime);
    this.bgmGain.connect(this.ctx!.destination);

    const playNote = (freq: number, time: number) => {
      const osc = this.ctx!.createOscillator();
      const g = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);
      g.gain.setValueAtTime(0.05, time);
      g.gain.exponentialRampToValueAtTime(0.001, time + 1);
      osc.connect(g);
      g.connect(this.bgmGain!);
      osc.start(time);
      osc.stop(time + 1);
    };

    // Một giai điệu đơn giản lặp lại
    const melody = [261.63, 329.63, 392.00, 523.25];
    let nextTime = this.ctx!.currentTime;
    const scheduler = () => {
      if (!this.bgmGain) return;
      for (let i = 0; i < melody.length; i++) {
        playNote(melody[i], nextTime + i * 2);
      }
      nextTime += melody.length * 2;
      setTimeout(scheduler, (melody.length * 2 - 1) * 1000);
    };
    scheduler();
  }
}

export const soundService = new SoundService();
