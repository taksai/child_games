type Settings = {
  muted: boolean;
  voice: boolean;
  volume: number;
  motion: boolean;
};
export const readSettings = (): Settings => {
  try {
    return {
      ...{
        muted: false,
        voice: true,
        volume: 0.35,
        motion: !matchMedia("(prefers-reduced-motion: reduce)").matches,
      },
      ...JSON.parse(localStorage.getItem("pop-play-settings") || "{}"),
    };
  } catch {
    return { muted: false, voice: true, volume: 0.35, motion: true };
  }
};
class PlaygroundAudio {
  context: AudioContext | null = null;
  master: GainNode | null = null;
  settings = readSettings();
  activeBand: number[] = [];
  timer: ReturnType<typeof setInterval> | null = null;
  beat = 0;
  nextBeat = 0;
  suspended = false;
  async start() {
    try {
      if (!this.context) {
        this.context = new AudioContext();
        this.master = this.context.createGain();
        this.master.connect(this.context.destination);
        this.apply();
      }
      if (this.context.state === "suspended") await this.context.resume();
      this.suspended = false;
    } catch {
      /* Visual play remains available when audio is blocked. */
    }
  }
  apply() {
    if (this.master)
      this.master.gain.value = this.settings.muted
        ? 0
        : this.settings.volume * 0.55;
    try {
      localStorage.setItem("pop-play-settings", JSON.stringify(this.settings));
    } catch {}
  }
  tone(
    freq = 440,
    duration = 0.16,
    type: OscillatorType = "sine",
    at?: number,
    volume = 0.5,
  ) {
    const c = this.context;
    if (!c || !this.master || this.suspended) return;
    const t = at ?? c.currentTime;
    const o = c.createOscillator(),
      g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.002, volume), t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.001, t + duration);
    o.connect(g);
    g.connect(this.master);
    o.start(t);
    o.stop(t + duration + 0.02);
    o.onended = () => {
      o.disconnect();
      g.disconnect();
    };
  }
  sound(kind = "pop") {
    const map: Record<string, number[]> = {
      pop: [620, 850],
      success: [523, 659, 784],
      complete: [523, 659, 784, 1046],
      water: [330, 430],
      dig: [150, 110],
      bell: [1046, 1318],
      magic: [659, 988],
      soft: [300],
      jump: [260, 520],
      click: [500],
    };
    (map[kind] || map.pop).forEach((n, i) =>
      this.tone(
        n,
        0.13,
        "sine",
        (this.context?.currentTime || 0) + i * 0.065,
        0.27,
      ),
    );
  }
  say(text: string) {
    if (
      this.settings.muted ||
      !this.settings.voice ||
      this.suspended ||
      !("speechSynthesis" in window)
    )
      return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP";
    u.rate = 0.88;
    u.pitch = 1.12;
    u.volume = this.settings.volume;
    const voice = speechSynthesis
      .getVoices()
      .find((v) => v.lang.startsWith("ja"));
    if (voice) u.voice = voice;
    speechSynthesis.speak(u);
  }
  band(members: number[]) {
    this.activeBand = members;
    if (!this.timer && this.context) {
      this.nextBeat = this.context.currentTime + 0.05;
      this.beat = 0;
      this.timer = setInterval(() => this.schedule(), 25);
    }
  }
  schedule() {
    const c = this.context;
    if (!c || this.suspended) return;
    if (this.nextBeat < c.currentTime - 0.2)
      this.nextBeat = c.currentTime + 0.04;
    const notes = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 392];
    while (this.nextBeat < c.currentTime + 0.12) {
      const b = this.beat,
        t = this.nextBeat,
        n = notes[Math.floor(b / 2) % notes.length];
      for (const id of this.activeBand) {
        if (id === 0)
          this.tone(b % 2 === 0 ? 90 : 180, 0.13, "triangle", t, 0.6);
        if (id === 1 && b % 2 === 0)
          this.tone(n / 2, 0.38, "triangle", t, 0.35);
        if (id === 2 && b % 2 === 1) {
          this.tone(n, 0.18, "triangle", t, 0.2);
          this.tone(n * 1.5, 0.17, "sine", t + 0.015, 0.12);
        }
        if (id === 3 && b % 4 === 0)
          this.tone(n * 2, 0.45, "triangle", t, 0.25);
        if (id === 4 && b % 2 === 0) this.tone(n * 4, 0.3, "sine", t, 0.22);
      }
      this.beat++;
      this.nextBeat += 0.625;
    }
  }
  pause() {
    this.suspended = true;
    this.context?.suspend().catch(() => {});
    if ("speechSynthesis" in window) speechSynthesis.cancel();
  }
  async resume() {
    await this.start();
  }
  stop() {
    this.activeBand = [];
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if ("speechSynthesis" in window) speechSynthesis.cancel();
  }
}
export const audio = new PlaygroundAudio();
