import { audio } from "./audio";
export class MashAudio {
  voices: { osc: OscillatorNode; gain: GainNode }[] = [];
  recent: number[] = [];
  lastByGroup = new Map<number, number>();
  play(group: number, pitch = 0, duration = 0.18) {
    const c = audio.context,
      m = audio.master;
    if (!c || !m || audio.suspended || audio.settings.muted) return;
    this.recent = this.recent.filter((t) => c.currentTime - t < 1);
    if (
      this.recent.length >= 12 ||
      c.currentTime - (this.lastByGroup.get(group) ?? -Infinity) < 0.035
    )
      return;
    this.recent.push(c.currentTime);
    this.lastByGroup.set(group, c.currentTime);
    if (this.voices.length >= 8) this.remove(this.voices[0]);
    const osc = c.createOscillator(),
      gain = c.createGain();
    const notes = [261.63, 293.66, 329.63, 392, 440];
    osc.type = (
      ["sine", "sine", "triangle", "triangle", "square"] as OscillatorType[]
    )[group % 5];
    const freq =
      group === 0
        ? 110
        : group === 4
          ? 180
          : notes[pitch % 5] * (group === 1 ? 2 : 1);
    osc.frequency.setValueAtTime(freq, c.currentTime);
    if (group === 0 || group === 4)
      osc.frequency.exponentialRampToValueAtTime(
        freq * 0.45,
        c.currentTime + 0.12,
      );
    gain.gain.setValueAtTime(0.001, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      group === 4 ? 0.035 : 0.12,
      c.currentTime + 0.008,
    );
    gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(m);
    const voice = { osc, gain };
    this.voices.push(voice);
    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
      this.voices = this.voices.filter((v) => v !== voice);
    };
    osc.start();
    osc.stop(c.currentTime + duration + 0.01);
  }
  remove(v: { osc: OscillatorNode; gain: GainNode }) {
    try {
      v.osc.stop();
    } catch {}
    v.osc.disconnect();
    v.gain.disconnect();
    this.voices = this.voices.filter((x) => x !== v);
  }
  stop() {
    for (const v of [...this.voices]) this.remove(v);
    this.recent = [];
    this.lastByGroup.clear();
  }
}
