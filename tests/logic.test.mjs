import { test } from "node:test";
import assert from "node:assert/strict";
import {
  gardenVariant,
  roadTour,
  roadMask,
  neighbors,
  makeCatchBag,
  makeQuestions,
  candidateSlots,
  modulePoint,
  factoryArtwork,
  toppingPosition,
} from "../src/logic.mjs";

test("all 27 gardening sequences produce the intended deterministic plant", () => {
  const variants = new Set();
  for (const a of ["water", "sun", "magic"])
    for (const b of ["water", "sun", "magic"])
      for (const c of ["water", "sun", "magic"]) {
        const care = [a, b, c],
          result = gardenVariant(care);
        variants.add(result);
        assert.equal(result, gardenVariant([...care].reverse()));
        const majority = care.find(
          (kind) => care.filter((x) => x === kind).length >= 2,
        );
        assert.equal(result, majority || "rainbow");
      }
  assert.deepEqual([...variants].sort(), ["magic", "rainbow", "sun", "water"]);
  assert.equal(gardenVariant(["water"]), null);
});
test("a dead-end road is traversed and returns to the garage", () => {
  const grid = Array(24).fill(0);
  grid[12] = 7;
  grid[13] = grid[14] = 1;
  assert.deepEqual(roadTour(grid), [12, 13, 14, 13, 12]);
});
test("roads never wrap across the board edge", () => {
  assert(!neighbors(5).includes(6));
  assert(!neighbors(6).includes(5));
});
test("a disconnected road is not reachable by the bus", () => {
  const grid = Array(24).fill(0);
  grid[12] = 7;
  grid[13] = 1;
  grid[23] = 1;
  assert(!roadTour(grid).includes(23));
});
test("branching and loop road routes remain finite with adjacent steps", () => {
  const grid = Array(24).fill(1);
  grid[12] = 7;
  const route = roadTour(grid);
  assert.equal(new Set(route).size, 24);
  assert.equal(route.length, 47);
  for (let i = 1; i < route.length; i++)
    assert(neighbors(route[i - 1]).includes(route[i]));
  assert.deepEqual(roadMask(grid, 0), [false, true, true, false]);
});
test("catch bags always start with fish and contain all 8 discoveries", () => {
  for (let i = 0; i < 100; i++) {
    const bag = makeCatchBag();
    assert(bag[0] < 6);
    assert.equal(bag.length, 8);
    assert.equal(new Set(bag).size, 8);
  }
});
test("shadow sets have 5 unique questions and exactly one correct option", () => {
  for (let i = 0; i < 100; i++) {
    const questions = makeQuestions(i === 0);
    assert.equal(new Set(questions.map((q) => q.target)).size, 5);
    for (const [j, q] of questions.entries()) {
      assert.equal(q.options.filter((x) => x === q.target).length, 1);
      assert.equal(q.options.length, j < 2 ? 2 : 3);
      assert.equal(new Set(q.options).size, q.options.length);
    }
  }
  assert.equal(makeQuestions(true)[0].target, 0);
});
test("every dinosaur piece has a valid slot even near completion", () => {
  const attached = [];
  for (const part of [4, 1, 5, 0, 3, 2]) {
    const candidates = candidateSlots(part, attached);
    assert(candidates.includes(part));
    assert(candidates.every((x) => !attached.includes(x)));
    assert.equal(new Set(candidates).size, candidates.length);
    attached.push(part);
  }
  assert.equal(candidateSlots(2, [0, 1, 3, 4, 5]).length, 1);
});
test("all 27 factory configurations connect without a jump at joins", () => {
  for (let a = 0; a < 3; a++)
    for (let b = 0; b < 3; b++)
      for (let c = 0; c < 3; c++) {
        const modules = [a, b, c];
        for (let i = 0; i < 2; i++) {
          const end = modulePoint(modules[i], 1),
            start = modulePoint(modules[i + 1], 0);
          assert.equal(end.x + i * 260, start.x + (i + 1) * 260);
          assert(Math.abs(end.y - start.y) < 0.00001);
        }
        assert.deepEqual(
          factoryArtwork(modules, 0),
          factoryArtwork(modules, 0),
        );
      }
});
test("factory behavior differs by module while all paths stay inside the scene", () => {
  assert(modulePoint(2, 0.5).y < modulePoint(0, 0.5).y);
  assert(modulePoint(1, 0.5).hidden);
  for (let kind = 0; kind < 3; kind++)
    for (let t = 0; t <= 1; t += 0.02) {
      const p = modulePoint(kind, t);
      assert(p.x >= 0 && p.x <= 260);
      assert(p.y >= 0 && p.y <= 180);
    }
});
test("all 60 topping placements stay on the pancake area", () => {
  for (let i = 0; i < 60; i++) {
    const p = toppingPosition(i, i % 6);
    assert(Math.abs(p.x - 450) <= 120);
    assert(Math.abs(p.y - 260) <= 58);
    assert.equal(p.id, i);
  }
});
