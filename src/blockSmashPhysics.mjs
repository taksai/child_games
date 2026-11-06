import { paintColors, keyInfo } from "./mashLogic.mjs";
export function makeTower(layout = 0) {
  const blocks = [];
  const put = (x, y, w = 62, h = 40) =>
    blocks.push({
      id: blocks.length,
      x,
      y,
      ox: x,
      oy: y,
      w,
      h,
      vx: 0,
      vy: 0,
      color: paintColors[blocks.length % 6],
      collapsed: false,
    });
  if (layout % 3 === 0) {
    for (let row = 0; row < 6; row++)
      for (let col = 0; col < 3; col++) put(350 + col * 64, 370 - row * 40);
  }
  if (layout % 3 === 1) {
    for (let row = 0; row < 4; row++)
      for (const x of [270, 334, 526, 590]) put(x, 370 - row * 40);
    put(430, 210, 446, 40);
    for (let col = 0; col < 6; col++) put(270 + col * 64, 170);
  }
  if (layout % 3 === 2) {
    for (let row = 0; row < 5; row++)
      for (let col = 0; col < 5; col++)
        if (row < 3 || col === 0 || col === 4 || col === 2)
          put(286 + col * 64, 370 - row * 40);
  }
  return blocks;
}
export function stepBlocks(blocks, dt, wind = 0) {
  for (const b of blocks) {
    b.vx = Math.max(-650, Math.min(650, b.vx + wind * dt));
    b.vy = Math.min(650, b.vy + 650 * dt);
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.x < b.w / 2) {
      b.x = b.w / 2;
      b.vx = Math.abs(b.vx) * 0.35;
    }
    if (b.x > 900 - b.w / 2) {
      b.x = 900 - b.w / 2;
      b.vx = -Math.abs(b.vx) * 0.35;
    }
    if (b.y > 390 - b.h / 2) {
      b.y = 390 - b.h / 2;
      b.vy = b.vy > 70 ? -b.vy * 0.18 : 0;
      b.vx *= Math.pow(0.08, dt);
    }
  }
  for (let pass = 0; pass < 4; pass++) {
    const sorted = [...blocks].sort((a, b) => b.y - a.y);
    for (let i = 0; i < sorted.length; i++)
      for (let j = i + 1; j < sorted.length; j++) {
        const a = sorted[i],
          b = sorted[j];
        const dx = b.x - a.x,
          dy = b.y - a.y,
          px = (a.w + b.w) / 2 - Math.abs(dx),
          py = (a.h + b.h) / 2 - Math.abs(dy);
        if (px <= 0 || py <= 0) continue;
        if (py < px) {
          b.y = a.y - (a.h + b.h) / 2;
          b.vy = Math.min(0, b.vy);
          b.vx *= 0.985;
        } else {
          const sign = dx >= 0 ? 1 : -1;
          b.x += sign * px * 0.55;
          a.x -= sign * px * 0.45;
          const v = (a.vx + b.vx) * 0.3;
          a.vx = v - sign * 4;
          b.vx = v + sign * 4;
        }
      }
  }
  for (const b of blocks) {
    if (!Number.isFinite(b.x + b.y + b.vx + b.vy)) {
      b.x = 450;
      b.y = 370;
      b.vx = b.vy = 0;
      b.collapsed = true;
    }
    if (Math.hypot(b.x - b.ox, b.y - b.oy) >= b.h) b.collapsed = true;
  }
}
export function hitBlocks(blocks, side = 1, strong = false) {
  const standing = blocks
    .filter((b) => !b.collapsed)
    .sort((a, b) => b.oy - a.oy);
  const target = standing[0] || blocks[0];
  if (!target) return null;
  const affected = strong
    ? blocks
    : blocks.filter((b) => Math.hypot(b.x - target.x, b.y - target.y) < 90);
  for (const b of affected) {
    b.vx = side * (strong ? 370 : 440) + ((b.id % 3) - 1) * 60;
    b.vy = strong ? -260 : -180;
    b.x += side * 18;
  }
  return { x: target.x, y: target.y };
}

// Random simultaneous keys should strengthen a gust, never cancel it out.
export function windForKeys(codes) {
  if (!codes.length) return 0;
  const last = keyInfo(codes[codes.length - 1]);
  if (!last) return 0;
  return (
    (last.index % 2 ? 1 : -1) * Math.min(300, 190 + (codes.length - 1) * 55)
  );
}
