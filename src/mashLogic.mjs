const rows = [
  [
    "Digit1",
    "Digit2",
    "Digit3",
    "Digit4",
    "Digit5",
    "Digit6",
    "Digit7",
    "Digit8",
    "Digit9",
    "Digit0",
    "Numpad0",
    "Numpad1",
    "Numpad2",
    "Numpad3",
    "Numpad4",
    "Numpad5",
    "Numpad6",
    "Numpad7",
    "Numpad8",
    "Numpad9",
  ],
  [
    "KeyQ",
    "KeyW",
    "KeyE",
    "KeyR",
    "KeyT",
    "KeyY",
    "KeyU",
    "KeyI",
    "KeyO",
    "KeyP",
    "BracketLeft",
    "BracketRight",
  ],
  [
    "KeyA",
    "KeyS",
    "KeyD",
    "KeyF",
    "KeyG",
    "KeyH",
    "KeyJ",
    "KeyK",
    "KeyL",
    "Semicolon",
    "Quote",
  ],
  [
    "KeyZ",
    "KeyX",
    "KeyC",
    "KeyV",
    "KeyB",
    "KeyN",
    "KeyM",
    "Comma",
    "Period",
    "Slash",
  ],
  [
    "Space",
    "Enter",
    "Backspace",
    "Delete",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Backquote",
    "Minus",
    "Equal",
    "Backslash",
    "IntlBackslash",
    "IntlRo",
    "IntlYen",
    "NumpadEnter",
    "NumpadAdd",
    "NumpadSubtract",
    "NumpadMultiply",
    "NumpadDivide",
    "NumpadDecimal",
  ],
];
export const mashCodes = rows.flat();
export function keyInfo(code) {
  const group = rows.findIndex((row) => row.includes(code));
  if (group < 0) return null;
  const index = rows[group].indexOf(code);
  return {
    group,
    index,
    color: (group + index) % 6,
    x: 100 + (index % 8) * 95,
    y: 90 + (group % 3) * 95,
  };
}
export class MashInput {
  held = new Map();
  recent = [];
  chord = [];
  lastChord = -Infinity;
  count = 0;
  press(id, code, now) {
    const info = keyInfo(code);
    if (!info || this.held.has(id)) return null;
    this.held.set(id, { code, since: now });
    this.count++;
    this.recent = this.recent.filter((t) => now - t <= 600);
    this.recent.push(now);
    this.recent = this.recent.slice(-30);
    this.chord = this.chord.filter((x) => now - x.time <= 80);
    this.chord.push({ code, time: now });
    const burst =
      new Set(this.chord.map((x) => x.code)).size >= 3 &&
      now - this.lastChord >= 1000;
    if (burst) {
      this.lastChord = now;
      this.chord = [];
    }
    return { ...info, code, burst, energetic: this.recent.length >= 5 };
  }
  release(id) {
    this.held.delete(id);
  }
  long(now) {
    return [
      ...new Set(
        [...this.held.values()]
          .filter((x) => now - x.since >= 300)
          .map((x) => x.code),
      ),
    ];
  }
  clear() {
    this.held.clear();
    this.recent = [];
    this.chord = [];
    this.lastChord = -Infinity;
  }
}
export const paintColors = [
  "#f17ca2",
  "#ffc745",
  "#58c8ae",
  "#64b5eb",
  "#a38be5",
  "#ff9b64",
];
