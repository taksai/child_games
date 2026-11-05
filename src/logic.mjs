export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
export const shuffle = (values, random = Math.random) => {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

export function gardenVariant(care) {
  if (
    care.length !== 3 ||
    care.some((x) => !["water", "sun", "magic"].includes(x))
  )
    return null;
  for (const kind of ["water", "sun", "magic"])
    if (care.filter((x) => x === kind).length >= 2) return kind;
  return "rainbow";
}

export const neighbors = (index, width = 6, height = 4) => {
  const x = index % width,
    y = Math.floor(index / width);
  return [
    [x, y - 1],
    [x + 1, y],
    [x, y + 1],
    [x - 1, y],
  ]
    .filter(([a, b]) => a >= 0 && a < width && b >= 0 && b < height)
    .map(([a, b]) => b * width + a);
};
export function roadTour(grid, start = 12) {
  const seen = new Set(),
    route = [start];
  function visit(i) {
    seen.add(i);
    for (const n of neighbors(i)) {
      if (!seen.has(n) && (grid[n] === 1 || n === start)) {
        route.push(n);
        visit(n);
        route.push(i);
      }
    }
  }
  visit(start);
  return route;
}
export function roadMask(grid, index) {
  const x = index % 6,
    y = Math.floor(index / 6);
  return [
    [x, y - 1],
    [x + 1, y],
    [x, y + 1],
    [x - 1, y],
  ].map(
    ([a, b]) =>
      a >= 0 && a < 6 && b >= 0 && b < 4 && [1, 7].includes(grid[b * 6 + a]),
  );
}

export function makeCatchBag(random = Math.random) {
  const fish = shuffle([0, 1, 2, 3, 4, 5], random);
  return [fish[0], ...shuffle([...fish.slice(1), 6, 7], random)];
}

export const SHADOW_OBJECTS = [
  "umbrella",
  "hat",
  "spoon",
  "watering",
  "key",
  "bell",
  "trumpet",
  "wand",
  "ball",
  "glasses",
  "mitten",
  "drum",
];
export function makeQuestions(first = false, random = Math.random) {
  const easy = shuffle([0, 1, 3, 8], random);
  const firstTwo = first ? [0, easy.find((i) => i !== 0)] : easy.slice(0, 2);
  const order = [
    ...firstTwo,
    ...shuffle(
      Array.from({ length: 12 }, (_, i) => i).filter(
        (i) => !firstTwo.includes(i),
      ),
      random,
    ).slice(0, 3),
  ];
  return order.map((target, i) => ({
    target,
    options: shuffle(
      [
        target,
        ...shuffle(
          Array.from({ length: 12 }, (_, j) => j).filter((j) => j !== target),
          random,
        ).slice(0, i < 2 ? 1 : 2),
      ],
      random,
    ),
  }));
}

export function factoryArtwork(modules, color) {
  return modules.map((kind, slot) => ({
    kind,
    slot,
    color,
    stamp: ["star", "circle", "wave"][slot],
  }));
}
export function modulePoint(kind, t) {
  const p = clamp(t, 0, 1);
  const x = p * 260;
  const y =
    kind === 2
      ? 145 - Math.sin(Math.PI * p) * 112
      : kind === 1
        ? 145
        : 145 + Math.sin(Math.PI * p) * 20;
  return { x, y, hidden: kind === 1 && p > 0.35 && p < 0.61 };
}

export function candidateSlots(part, attached, random = Math.random) {
  return shuffle(
    [
      part,
      ...shuffle(
        [0, 1, 2, 3, 4, 5].filter((x) => x !== part && !attached.includes(x)),
        random,
      ).slice(0, 2),
    ],
    random,
  );
}
export function toppingPosition(index, kind) {
  const angle = index * 2.399963229728653;
  const radius = 22 + ((index * 31) % 98);
  return {
    x: 450 + Math.cos(angle) * radius,
    y: 260 + Math.sin(angle) * radius * 0.48,
    kind,
    id: index,
  };
}
