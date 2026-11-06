import test from "node:test";
import assert from "node:assert/strict";
import { MashInput, keyInfo, mashCodes } from "../src/mashLogic.mjs";
import { makeTower, stepBlocks, hitBlocks } from "../src/blockSmashPhysics.mjs";

test("Mash keys include typing keys without swallowing navigation or modifiers", () => {
  for (const code of [
    "KeyA",
    "Digit9",
    "Numpad2",
    "Space",
    "Enter",
    "Backspace",
    "IntlYen",
  ])
    assert(keyInfo(code));
  for (const code of ["Tab", "Escape", "ShiftLeft", "MetaLeft", "F5"])
    assert.equal(keyInfo(code), null);
  assert.equal(new Set(mashCodes).size, mashCodes.length);
});
test("One press is immediate, repeat is ignored, hold starts at 300ms and release stops it", () => {
  const m = new MashInput();
  assert(m.press("KeyA", "KeyA", 0));
  assert.equal(m.press("KeyA", "KeyA", 30), null);
  assert.deepEqual(m.long(299), []);
  assert.deepEqual(m.long(300), ["KeyA"]);
  m.release("KeyA");
  assert.deepEqual(m.long(1000), []);
});
test("Three different rapid keys produce one burst with a one-second cooldown", () => {
  const m = new MashInput();
  assert(!m.press("a", "KeyA", 0).burst);
  assert(!m.press("s", "KeyS", 30).burst);
  assert(m.press("d", "KeyD", 60).burst);
  assert(!m.press("f", "KeyF", 70).burst);
  assert(!m.press("g", "KeyG", 80).burst);
  assert(!m.press("h", "KeyH", 90).burst);
  m.press("j", "KeyJ", 1100);
  m.press("k", "KeyK", 1120);
  assert(m.press("l", "KeyL", 1140).burst);
});
test("Same-key mashing does not create a chord; reset removes held input and history", () => {
  const m = new MashInput();
  for (let i = 0; i < 1000; i++) {
    assert(!m.press("a", "KeyA", i * 10).burst);
    m.release("a");
  }
  assert(m.recent.length <= 30);
  m.press("a", "KeyA", 10000);
  m.clear();
  assert.deepEqual(m.long(11000), []);
  assert.equal(m.recent.length, 0);
});
for (let layout = 0; layout < 3; layout++) {
  test(`Tower ${layout}: stays standing for 30 seconds without input`, () => {
    const b = makeTower(layout);
    for (let i = 0; i < 1800; i++) stepBlocks(b, 1 / 60);
    assert.equal(b.filter((x) => x.collapsed).length, 0);
    assert(b.length <= 36);
  });
  test(`Tower ${layout}: repeating the same key can collapse at least 80 percent`, () => {
    const b = makeTower(layout);
    for (let hit = 0; hit < 12; hit++) {
      hitBlocks(b, -1);
      for (let i = 0; i < 60; i++) stepBlocks(b, 1 / 60);
    }
    assert(b.filter((x) => x.collapsed).length >= b.length * 0.8);
  });
}
test("Five minutes of wind and impacts keep physics finite and block count bounded", () => {
  const b = makeTower(1);
  for (let i = 0; i < 18000; i++) {
    if (i % 20 === 0) hitBlocks(b, i % 40 ? 1 : -1, i % 100 === 0);
    stepBlocks(b, 1 / 60, i % 120 < 60 ? 300 : -300);
  }
  assert.equal(b.length, 23);
  for (const x of b) assert(Number.isFinite(x.x + x.y + x.vx + x.vy));
});
