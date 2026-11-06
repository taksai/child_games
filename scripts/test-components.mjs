import fs from "node:fs/promises";
import { build } from "esbuild";
import { createRequire } from "node:module";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

// This is a DOM component test, not a browser/visual/playability test.
const dom = new JSDOM(
  '<!doctype html><html><body><div id="root"></div></body></html>',
  { url: "https://playground.test/", pretendToBeVisual: true },
);
let now = 0,
  nextId = 1;
const frames = new Map();
for (const name of [
  "window",
  "document",
  "navigator",
  "location",
  "history",
  "localStorage",
  "HTMLElement",
  "Element",
  "Node",
  "Event",
  "KeyboardEvent",
])
  Object.defineProperty(globalThis, name, {
    value: dom.window[name],
    configurable: true,
    writable: true,
  });
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.matchMedia = () => ({
  matches: false,
  addEventListener() {},
  removeEventListener() {},
});
globalThis.requestAnimationFrame = (fn) => {
  const id = nextId++;
  frames.set(id, fn);
  return id;
};
globalThis.cancelAnimationFrame = (id) => frames.delete(id);
Object.defineProperty(globalThis, "performance", {
  value: { now: () => now },
  configurable: true,
});
const speech = {
  cancel() {},
  speak() {},
  getVoices() {
    return [];
  },
};
globalThis.speechSynthesis = speech;
dom.window.speechSynthesis = speech;
globalThis.SpeechSynthesisUtterance = class {
  constructor(text) {
    this.text = text;
  }
};
dom.window.scrollTo = () => {};
const gain = () => ({
  value: 1,
  setValueAtTime() {},
  exponentialRampToValueAtTime() {},
});
globalThis.AudioContext = class {
  state = "running";
  get currentTime() {
    return now / 1000;
  }
  createGain() {
    return { gain: gain(), connect() {}, disconnect() {} };
  }
  createOscillator() {
    return {
      frequency: gain(),
      connect() {},
      disconnect() {},
      start() {},
      stop() {},
    };
  }
  async resume() {
    this.state = "running";
  }
  async suspend() {
    this.state = "suspended";
  }
};
// Canvas is mocked only for control/lifecycle tests; rendering is checked in a real browser.
dom.window.HTMLCanvasElement.prototype.getContext = () =>
  new Proxy(
    {},
    {
      get: (_target, key) =>
        key === "measureText" ? () => ({ width: 20 }) : () => {},
      set: () => true,
    },
  );
dom.window.HTMLCanvasElement.prototype.toDataURL = () =>
  "data:image/png;base64,";
const React = await import("react");
const { act } = React;
const { createRoot } = await import("react-dom/client");
await fs.mkdir("artifacts", { recursive: true });
await build({
  entryPoints: ["src/App.tsx"],
  bundle: true,
  platform: "node",
  format: "cjs",
  jsx: "automatic",
  outfile: "artifacts/test-app.cjs",
  external: ["react", "react-dom"],
  logLevel: "silent",
});
const require = createRequire(import.meta.url);
const App = require("../artifacts/test-app.cjs").default;
const root = createRoot(document.getElementById("root"));
await act(async () => root.render(React.createElement(App)));
const compact = (s) => (s || "").replace(/\s+/g, "");
const text = () => document.body.textContent;
const button = (name) =>
  [...document.querySelectorAll("button")].find(
    (b) =>
      compact(b.getAttribute("aria-label") || b.textContent) ===
        compact(name) || compact(b.textContent).startsWith(compact(name)),
  );
const click = async (name) => {
  const b = typeof name === "string" ? button(name) : name;
  assert(b, `Button not found: ${name}; visible: ${text().slice(-700)}`);
  assert(!b.disabled, `Disabled: ${name}`);
  await act(async () => {
    b.focus();
    b.click();
  });
};
const key = async (code, down = true) => {
  await act(async () => {
    (document.activeElement || document.body).dispatchEvent(
      new dom.window.KeyboardEvent(down ? "keydown" : "keyup", {
        code,
        key: code,
        bubbles: true,
        cancelable: true,
      }),
    );
  });
};
const tap = async (code) => {
  await key(code);
  await key(code, false);
};
const advance = async (seconds) => {
  for (let i = 0; i < Math.ceil(seconds / 0.05); i++) {
    await act(async () => {
      now += 50;
      const callbacks = [...frames.values()];
      frames.clear();
      for (const cb of callbacks) cb(now);
    });
  }
};
const done = () =>
  assert(
    document.querySelector(".completion-bar"),
    "Expected completed screen",
  );
const progress = () =>
  document.querySelectorAll(".progress-dots .filled").length;
const home = async () => {
  const b = [...document.querySelectorAll(".site-header button")].find(
    (b) => compact(b.textContent) === "ホーム",
  );
  await click(b);
};
const open = async (id) => {
  const link = document.querySelector(`a[href="/games/${id}"]`);
  assert(link, `Missing card ${id}`);
  await act(async () => link.click());
  await click(document.querySelector(".intro-card button"));
};
const result = [];
async function scenario(name, fn) {
  await fn();
  result.push({ name, status: "passed" });
  console.log("PASS", name);
}
try {
  await scenario("Home: 14 games and working category filters", async () => {
    assert.equal(document.querySelectorAll(".game-card").length, 14);
    const filters = [...document.querySelectorAll(".filters button")];
    await click(filters.find((b) => b.textContent === "おんがく"));
    assert.equal(document.querySelectorAll(".game-card").length, 1);
    await click(filters[0]);
    assert.equal(document.querySelectorAll(".game-card").length, 14);
  });
  await scenario(
    "Pancake: pause, both sides, 6 toppings, undo, Enter after clicking, replay",
    async () => {
      await open("pancake");
      await tap("Space");
      await advance(1.2);
      await advance(2);
      await act(async () =>
        dom.window.dispatchEvent(new dom.window.Event("blur")),
      );
      assert(text().includes("ひとやすみ"));
      await advance(20);
      await click("つづきから あそぶ");
      assert(text().includes("ぷくぷく"));
      await advance(6.1);
      await tap("Space");
      await advance(1);
      await advance(8.2);
      await tap("Space");
      await advance(0.9);
      for (let i = 1; i <= 6; i++) await tap("Digit" + i);
      assert.equal(document.querySelectorAll(".new-topping").length, 6);
      await tap("Backspace");
      assert.equal(document.querySelectorAll(".new-topping").length, 5);
      await click("いちご");
      await tap("Enter");
      done();
      await click("もういっかい");
      assert.equal(document.querySelectorAll(".new-topping").length, 0);
      await home();
    },
  );
  await scenario(
    "Band: add/remove members and complete the parade",
    async () => {
      await open("animal-band");
      assert(button("パレード！").disabled, "Choose a member before a parade");
      await tap("Enter");
      assert(!text().includes("パレードちゅう"));
      for (const n of [1, 3, 5, 3]) await tap("Digit" + n);
      assert.equal(
        document.querySelectorAll('.control[aria-pressed="true"]').length,
        2,
      );
      await tap("Space");
      const performers = () =>
        [...document.querySelectorAll(".stage-svg > g")].filter((g) =>
          g.querySelector(".animal"),
        );
      assert(performers()[0].getAttribute("transform").includes(" 53)"));
      await advance(0.8);
      assert(
        performers()[0].getAttribute("transform").includes(" 65)"),
        "Jump lands without another input",
      );
      await tap("Enter");
      await advance(12.3);
      done();
      await home();
    },
  );
  await scenario(
    "Car wash: all 4 tools, all 3 zones, drying, decoration and departure",
    async () => {
      await open("car-wash");
      await tap("Digit1");
      for (let stage = 0; stage < 4; stage++) {
        for (let zone = 0; zone < 3; zone++) {
          await key("Space");
          await advance(1.7);
          await key("Space", false);
        }
      }
      await tap("Space");
      await advance(2.7);
      assert(text().includes("すきな いろ"));
      await tap("Digit2");
      for (let i = 0; i < 3; i++) {
        await tap("Space");
        await tap("ArrowRight");
      }
      await tap("Enter");
      await advance(5.3);
      done();
      await home();
    },
  );
  await scenario(
    "Dinosaur: 6 excavations, brushing, assembly, reveal and completion",
    async () => {
      await open("dinosaur-dig");
      await tap("Digit1");
      for (let i = 0; i < 6; i++) {
        for (let d = 0; d < 3; d++) await tap("Space");
        await key("Space");
        await advance(2);
        await key("Space", false);
      }
      assert(text().includes("どこに つくかな"));
      for (
        let attempt = 0;
        attempt < 25 &&
        document.querySelector(".game-hint").textContent.includes("どこに");
        attempt++
      ) {
        const options = [
          ...document.querySelectorAll(".control-deck .control"),
        ];
        const shapes = options.map((b) => b.querySelector("svg").innerHTML);
        assert.equal(
          new Set(shapes).size,
          shapes.length,
          "Bone choices must be visually distinct",
        );
        await click(options[attempt % options.length]);
      }
      await advance(4.3);
      assert(text().includes("きみの きょうりゅう"));
      await tap("Enter");
      done();
      await home();
    },
  );
  await scenario(
    "Monster: 6 categories, color, random, undo and runway",
    async () => {
      await open("monster-dressup");
      const before = document.querySelector(".stage").innerHTML;
      for (let i = 1; i <= 6; i++) await tap("Digit" + i);
      assert.notEqual(document.querySelector(".stage").innerHTML, before);
      await tap("ArrowRight");
      await tap("Digit0");
      await tap("Backspace");
      await tap("Space");
      await tap("Enter");
      await advance(11.3);
      done();
      await home();
    },
  );
  await scenario(
    "Space: visit and greet all 3 planets, journal and return",
    async () => {
      await open("space-walk");
      for (let i = 1; i <= 3; i++) {
        await tap("Digit" + i);
        await advance(8);
        await tap("Space");
        await advance(3.7);
      }
      assert.equal(progress(), 3);
      await tap("Enter");
      assert(text().includes("えにっき"));
      await tap("Enter");
      done();
      await home();
    },
  );
  await scenario(
    "Garden: two different care recipes, two pots and celebration",
    async () => {
      await open("magic-garden");
      await tap("Space");
      await tap("Digit1");
      for (let i = 0; i < 3; i++) {
        await tap("Digit2");
        await advance(2.1);
      }
      assert.equal(progress(), 1);
      await tap("ArrowRight");
      await tap("Digit1");
      for (let i = 0; i < 3; i++) {
        await tap("Digit1");
        await advance(2.1);
      }
      assert.equal(progress(), 2);
      await tap("Enter");
      await advance(5.3);
      done();
      await home();
    },
  );
  await scenario(
    "Town: place, overwrite, undo, simulate and finish",
    async () => {
      await open("block-town");
      await tap("Digit1");
      await tap("Space");
      await tap("ArrowRight");
      await tap("Digit2");
      await tap("Space");
      await tap("Digit4");
      await tap("Space");
      await tap("Backspace");
      assert(text().includes("おうち"));
      await tap("Enter");
      await advance(15.3);
      await tap("Enter");
      done();
      await home();
    },
  );
  await scenario(
    "Fishing: missed bite recovers, 8 catches, aquarium and completion",
    async () => {
      await open("fishing-pond");
      await tap("Space");
      await advance(2.5);
      assert(text().includes("いまだよ"));
      await advance(4.2);
      assert.equal(progress(), 0);
      await advance(2.5);
      for (let i = 0; i < 8; i++) {
        if (i) {
          await tap("Space");
          await advance(2.5);
        }
        await tap("Space");
        await advance(3.8);
      }
      assert(text().includes("きみの すいそう"));
      assert.equal(progress(), 8);
      for (let i = 1; i <= 3; i++) await tap("Digit" + i);
      await tap("Space");
      await tap("Enter");
      done();
      await home();
    },
  );
  await scenario(
    "Shadow: wrong answer, hint, 5 correct visual matches and stories",
    async () => {
      await open("shadow-lost-found");
      for (let i = 0; i < 5; i++) {
        const target = document.querySelector(".shadow-silhouette").innerHTML;
        let options = [
          ...document.querySelectorAll(".shadow-options .control"),
        ].filter((b) => b.querySelector(".control-art svg"));
        if (i === 0) {
          await click(
            options.find((b) => b.querySelector("svg").innerHTML !== target),
          );
          await advance(0.8);
          await tap("Space");
        }
        options = [
          ...document.querySelectorAll(".shadow-options .control"),
        ].filter((b) => b.querySelector(".control-art svg"));
        await click(
          options.find((b) => b.querySelector("svg").innerHTML === target),
        );
        await advance(5.3);
      }
      assert.equal(progress(), 5);
      await tap("Enter");
      done();
      await home();
    },
  );
  await scenario(
    "Factory: change modules, test twice, compare artworks and finish",
    async () => {
      await open("ball-factory");
      await tap("Digit3");
      await tap("Space");
      await advance(9.3);
      await tap("Space");
      await tap("ArrowRight");
      await tap("Digit2");
      await tap("Space");
      await advance(9.3);
      assert(text().includes("まえの え"));
      await tap("Enter");
      done();
      await home();
    },
  );
  await scenario(
    "Click-only Pancake: pour, flip, plate, toppings and completion",
    async () => {
      await open("pancake");
      await click("きじを ながす");
      await advance(9.5);
      await click("ひっくりかえす");
      await advance(9.1);
      await click("おさらに のせる");
      await advance(0.9);
      await click("クリーム");
      await click("いちご");
      await click("スプレー");
      await click("できあがり！");
      done();
      await home();
    },
  );
  await scenario(
    "Click-only Band: instruments, accent and parade",
    async () => {
      await open("animal-band");
      await click("ゾウの たいこ");
      await click("サルの ギター");
      await click("ウサギの ベル");
      await click("ジャンプ！");
      await click("パレード！");
      await advance(12.3);
      done();
      await home();
    },
  );
  await scenario(
    "Click-only Car wash: every zone and tool without a held key",
    async () => {
      await open("car-wash");
      await click("アイスの くるま");
      for (let stage = 0; stage < 4; stage++) {
        for (let zone = 0; zone < 3; zone++) {
          await click(
            document.querySelectorAll(".zone-selectors button")[zone],
          );
          for (let j = 0; j < 3; j++)
            await click(document.querySelector(".hold-button"));
        }
      }
      await click("かぜで かわかす");
      await advance(2.7);
      await click("みどり");
      await click("シールを はる");
      assert.equal(
        document.querySelector(
          '.stage-svg g[transform="translate(66 139) scale(.43)"]',
        ).innerHTML,
        document.querySelector('button[aria-label="シールを かえる"] svg > g')
          .innerHTML,
        "Sticker preview must match the applied sticker",
      );
      await click("シールを かえる");
      await click("シールを はる");
      await click("しゅっぱつ！");
      await advance(5.3);
      done();
      await home();
    },
  );
  await scenario("Click-only Dinosaur: dig, brush and assemble", async () => {
    await open("dinosaur-dig");
    await click("あかつちを ほる");
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 3; j++) await click("ほってみる！");
      for (let j = 0; j < 4; j++) await click("ブラシで はらう");
    }
    for (
      let a = 0;
      a < 25 &&
      document.querySelector(".game-hint").textContent.includes("どこに");
      a++
    ) {
      const options = [...document.querySelectorAll(".control-deck .control")];
      await click(options[a % options.length]);
    }
    await advance(4.3);
    await click("できた！");
    done();
    await home();
  });
  await scenario("Click-only Monster: parts, undo and runway", async () => {
    await open("monster-dressup");
    await click("め");
    await click("つの");
    await click("ふく");
    await click("いろ");
    await click("ひとつもどす");
    await click("あそぼう");
    await click("おひろめ！");
    await advance(11.3);
    done();
    await home();
  });
  await scenario(
    "Click-only Space: automatic flight, greeting and journal",
    async () => {
      await open("space-walk");
      for (const n of ["はなのほし", "くものほし", "おとのほし"]) {
        await click(n);
        await advance(8);
        await click("ごあいさつ");
        await advance(3.7);
      }
      await click("かえる");
      await click("ただいま！");
      done();
      await home();
    },
  );
  await scenario(
    "Click-only Garden: pot, seed, care and celebration",
    async () => {
      await open("magic-garden");
      await click(document.querySelectorAll(".pot-button")[0]);
      await click("きのこの たね");
      for (let i = 0; i < 3; i++) {
        await click("まほう");
        await advance(2.1);
      }
      await click("いっしょに あそぶ");
      await click("おひろめ！");
      await advance(5.3);
      done();
      await home();
    },
  );
  await scenario("Click-only Town: board placement and live town", async () => {
    await open("block-town");
    await click("おうち");
    await click(document.querySelectorAll(".town-cell")[14]);
    await click("パンや");
    await click(document.querySelectorAll(".town-cell")[15]);
    await click("いけ");
    await click(document.querySelectorAll(".town-cell")[20]);
    await click("うごかす！");
    await advance(15.3);
    await click("できあがり！");
    done();
    await home();
  });
  await scenario(
    "Click-only Fishing: catch, aquarium, decoration and finish",
    async () => {
      await open("fishing-pond");
      for (let i = 0; i < 3; i++) {
        await click("つりいとを なげる");
        await advance(2.5);
        await click("ひいてみる！");
        await advance(3.8);
      }
      await click("すいそうへ");
      await click("すな");
      await click("みずくさ");
      await click("あわを だす");
      await click("すいそう できた！");
      done();
      await home();
    },
  );
  await scenario(
    "Click-only Shadow: hints, matches and five stories",
    async () => {
      await open("shadow-lost-found");
      for (let i = 0; i < 5; i++) {
        await click("ヒント");
        const target = document.querySelector(".shadow-silhouette").innerHTML;
        const options = [
          ...document.querySelectorAll(".shadow-options .control"),
        ].filter((b) => b.querySelector(".control-art svg"));
        await click(
          options.find((b) => b.querySelector("svg").innerHTML === target),
        );
        await advance(5.3);
      }
      await click("みんなに とどいた！");
      done();
      await home();
    },
  );
  await scenario(
    "Click-only Factory: choose a slot, change a module and test",
    async () => {
      await open("ball-factory");
      await click("1ばんを かえる");
      await click("トンネル");
      await click("ボールの いろ");
      await click("ころがす！");
      await advance(9.3);
      await click("こうじょう できた！");
      done();
      await home();
    },
  );
  for (const id of ["toy-drum", "rainbow-paint", "block-smash"]) {
    await scenario(
      `${id}: mash, hold, pause, resume, Enter stays in free play`,
      async () => {
        await open(id);
        const stage = document.querySelector(".mash-stage");
        assert.equal(document.activeElement, stage);
        const attr = id === "rainbow-paint" ? "data-marks" : "data-hits";
        const before = Number(stage.getAttribute(attr));
        await tap("KeyA");
        await tap("Enter");
        await tap("Backspace");
        assert.equal(Number(stage.getAttribute(attr)), before + 3);
        await act(async () =>
          stage.dispatchEvent(
            new KeyboardEvent("keydown", {
              code: "KeyB",
              ctrlKey: true,
              bubbles: true,
            }),
          ),
        );
        assert.equal(Number(stage.getAttribute(attr)), before + 3);
        await key("KeyS");
        await advance(1);
        if (id === "rainbow-paint")
          assert(Number(stage.getAttribute(attr)) > before + 4);
        await tap("Escape");
        assert(text().includes("ひとやすみ"));
        const pausedCount = stage.getAttribute(attr);
        await advance(2);
        await tap("KeyA");
        assert.equal(stage.getAttribute(attr), pausedCount);
        await click("つづきから あそぶ");
        await advance(0.3);
        assert.equal(
          stage.getAttribute(attr),
          pausedCount,
          "Held input must not survive resume",
        );
        await tap("Enter");
        assert(!document.querySelector(".completion-bar"));
        if (id === "rainbow-paint") {
          await click("＋ まっさら");
          await click("▧ まえの かみ");
          assert.equal(stage.getAttribute("data-paper"), "3");
        }
        if (id === "block-smash") {
          for (let i = 0; i < 12; i++) {
            await tap("KeyA");
            await advance(0.8);
          }
          assert(
            Number(stage.getAttribute("data-cycle")) > 0,
            "Tower must rebuild",
          );
        }
        await home();
      },
    );
  }
} finally {
  await act(async () => root.unmount());
  await fs.writeFile(
    "artifacts/component-results.json",
    JSON.stringify(
      {
        type: "DOM component interaction tests — not browser playtesting",
        results: result,
      },
      null,
      2,
    ) + "\n",
  );
  dom.window.close();
}
console.log(`${result.length} component scenarios passed.`);
