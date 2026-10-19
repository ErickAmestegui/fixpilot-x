export type SoundEvent = 'send' | 'success' | 'warning' | 'select' | 'mic-on' | 'mic-off';
/** Original oscillator cues. Construction never creates or starts an AudioContext. */
export class SoundBus {
  context: AudioContext | null = null;
  enabled = false;
  volume = .2;
  last = -Infinity;
  async unlock() {
    if (!this.enabled) return;
    try {
      this.context ??= new AudioContext();
      if (this.context.state === 'suspended') await this.context.resume();
    } catch { /* Optional sound must never prevent an operation. */ }
  }
  play(event: SoundEvent) {
    if (!this.enabled || !this.context || this.context.state !== 'running') return;
    try {
    const now = this.context.currentTime;
    if (now - this.last < .15) return;
    this.last = now;
    const frequencies: Record<SoundEvent, number[]> = {send:[620],success:[540,810],warning:[390,330],select:[740],'mic-on':[500,680],'mic-off':[680,500]};
    frequencies[event].forEach((frequency,index)=>{
      const oscillator=this.context!.createOscillator(), gain=this.context!.createGain();
      const start=now+index*.085;
      oscillator.type='sine'; oscillator.frequency.value=frequency;
      gain.gain.setValueAtTime(0,start);
      gain.gain.linearRampToValueAtTime((Number.isNaN(this.volume)?0:Math.min(.35,Math.max(0,this.volume)))*.16,start+.012);
      gain.gain.exponentialRampToValueAtTime(.0001,start+.12);
      oscillator.connect(gain);gain.connect(this.context!.destination);
      oscillator.start(start);oscillator.stop(start+.14);
      oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
    });
    } catch { /* A blocked or closed audio device cannot cancel an assembly action. */ }
  }
  mute() { this.enabled=false; try { if(this.context?.state==='running') void this.context.suspend().catch(()=>{}); } catch { /* Optional output may be unavailable. */ } }
}
