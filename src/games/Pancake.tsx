import { useState } from "react";
import { PancakeDrawing, ToppingDrawing, Star } from "../Art";
import { usePlay, useTick, useKeys, useAnnounce } from "../play";
import {
  Control,
  Primary,
  Hint,
  Stage,
  StageSvg,
  Undo,
  SvgPicture,
  Progress,
} from "../ui";
import { audio } from "../audio";
import { toppingPosition } from "../logic.mjs";
type Top = { x: number; y: number; kind: number; id: number };
type State = { phase: string; elapsed: number; tops: Top[]; next: number };
const initial: State = { phase: "pour", elapsed: 0, tops: [], next: 0 };
const names = [
  "クリーム",
  "いちご",
  "バナナ",
  "ブルーベリー",
  "チョコ",
  "スプレー",
];
export function PancakeGame() {
  const [s, setS] = useState(initial);
  const { finish } = usePlay();
  const hints: Record<string, string> = {
    pour: "ボタンか スペースで きじを ながそう！",
    pouring: "とろ〜り、まあるく なあれ。",
    cookFront: "ぷくぷく あわが でてきたよ。",
    flipReady: "いい いろ！ ボタンか スペースで ひっくりかえそう！",
    flipping: "くるんっ！",
    cookBack: "うらも じっくり やこう。",
    plateReady: "やけたよ！ おさらに のせよう。",
    plating: "ふんわり、ぽんっ。",
    decorate: "すきな えを おして、かざろう！",
  };
  useAnnounce(hints[s.phase]);
  useTick((dt) =>
    setS((a) => {
      const duration: Record<string, number> = {
        pouring: 1.1,
        cookFront: 8,
        flipping: 0.85,
        cookBack: 8,
        plating: 0.7,
      };
      const next: Record<string, string> = {
        pouring: "cookFront",
        cookFront: "flipReady",
        flipping: "cookBack",
        cookBack: "plateReady",
        plating: "decorate",
      };
      if (!duration[a.phase]) return a;
      const elapsed = a.elapsed + dt;
      return elapsed >= duration[a.phase]
        ? { ...a, phase: next[a.phase], elapsed: 0 }
        : { ...a, elapsed };
    }),
  );
  const action = () => {
    const transitions: Record<string, string> = {
      pour: "pouring",
      flipReady: "flipping",
      plateReady: "plating",
    };
    if (transitions[s.phase]) {
      audio.sound(s.phase === "flipReady" ? "jump" : "soft");
      setS({ ...s, phase: transitions[s.phase], elapsed: 0 });
    }
  };
  const add = (kind: number) => {
    if (s.phase !== "decorate" || s.tops.length >= 60) return;
    audio.sound("pop");
    setS((a) => ({
      ...a,
      tops: [...a.tops, toppingPosition(a.next, kind)],
      next: a.next + 1,
    }));
  };
  const undo = () => setS((a) => ({ ...a, tops: a.tops.slice(0, -1) }));
  useKeys((k) => {
    if (k === "Space") action();
    if (k === "Enter" && s.phase === "decorate") finish();
    if (/^[1-6]$/.test(k)) add(Number(k) - 1);
    if (k === "Backspace" && s.phase === "decorate") undo();
  });
  const decorate = s.phase === "decorate";
  const cooking = ["cookFront", "cookBack"].includes(s.phase);
  const flipping = s.phase === "flipping";
  const bake =
    s.phase === "pouring"
      ? 0
      : s.phase === "cookFront"
        ? s.elapsed / 8
        : ["pour"].includes(s.phase)
          ? 0
          : 1;
  return (
    <>
      <Stage
        className="warm-stage"
        label="パンケーキを焼いてトッピングするキッチン"
      >
        <Progress
          total={3}
          current={
            decorate
              ? 3
              : s.phase === "cookBack" || s.phase === "plateReady"
                ? 2
                : s.phase === "pour"
                  ? 0
                  : 1
          }
        />
        {decorate && (
          <div className="inline-tools">
            <Undo onClick={undo} disabled={!s.tops.length} />
            <Undo
              label="かざりなおす"
              onClick={() => setS((a) => ({ ...a, tops: [] }))}
              disabled={!s.tops.length}
            />
          </div>
        )}
        <StageSvg
          label={
            decorate ? "焼きあがったパンケーキとトッピング" : hints[s.phase]
          }
        >
          <path d="M0 310H900V420H0Z" fill="#e5c9a8" />
          <path d="M0 322H900" stroke="#cfaf8c" strokeWidth="3" />
          {!decorate ? (
            <>
              <ellipse
                cx="450"
                cy="312"
                rx="255"
                ry="35"
                fill="#b18e75"
                opacity=".2"
              />
              <path
                d="m663 263 155 15q28 6 23 26-4 15-26 12l-156-23"
                fill="#6b6270"
                stroke="#51445b"
                strokeWidth="4"
              />
              <ellipse
                cx="450"
                cy="272"
                rx="248"
                ry="101"
                fill="#514c59"
                stroke="#3e3847"
                strokeWidth="5"
              />
              <ellipse cx="450" cy="264" rx="226" ry="84" fill="#756876" />
              {s.phase === "pour" && (
                <>
                  <g transform="translate(65 45) rotate(-13)">
                    <path
                      d="M30 85q0 90 130 83Q277 161 265 85Z"
                      fill="#f0b1bc"
                      stroke="#8f677c"
                      strokeWidth="3"
                    />
                    <ellipse
                      cx="147"
                      cy="85"
                      rx="118"
                      ry="32"
                      fill="#ffe7b6"
                      stroke="#8f677c"
                      strokeWidth="3"
                    />
                  </g>
                  <text
                    x="455"
                    y="260"
                    textAnchor="middle"
                    fontSize="22"
                    fill="#fff3d8"
                  >
                    ここに ながそう
                  </text>
                </>
              )}
            </>
          ) : (
            <>
              <ellipse
                cx="450"
                cy="301"
                rx="265"
                ry="94"
                fill="#a47f64"
                opacity=".15"
              />
              <ellipse
                cx="450"
                cy="283"
                rx="260"
                ry="90"
                fill="#fffdf2"
                stroke="#d7c8ae"
                strokeWidth="4"
              />
              <ellipse
                cx="450"
                cy="277"
                rx="224"
                ry="69"
                fill="none"
                stroke="#e8dac0"
                strokeWidth="4"
              />
            </>
          )}
          {s.phase !== "pour" && (
            <g transform={`translate(210 ${decorate ? 38 : 40}) scale(1.6)`}>
              <g
                className={flipping ? "pancake-flip" : ""}
                style={{ transformOrigin: "150px 120px" }}
              >
                <PancakeDrawing bake={bake} face={decorate} />
              </g>
            </g>
          )}
          {cooking &&
            Array.from({ length: 7 }, (_, i) => (
              <circle
                key={i}
                cx={330 + ((i * 47) % 240)}
                cy={205 + ((i * 21) % 72)}
                r={2 + ((s.elapsed * 3 + i) % 5)}
                fill="#fff0bc"
                opacity=".8"
              />
            ))}
          {(cooking || s.phase === "flipReady") &&
            [360, 450, 540].map((x, i) => (
              <path
                key={i}
                className="steam"
                style={{ animationDelay: `${i * 0.4}s` }}
                d={`M${x} 162q-14-16 0-32t0-30`}
                stroke="#fff8df"
                strokeWidth="7"
                fill="none"
                strokeLinecap="round"
              />
            ))}
          {s.tops.map((top) => (
            <g
              key={top.id}
              transform={`translate(${top.x} ${top.y - 22}) scale(${top.kind === 4 ? 1.2 : 0.9})`}
            >
              <g className="new-topping">
                <ToppingDrawing kind={top.kind} />
              </g>
            </g>
          ))}
          {["flipReady", "plateReady"].includes(s.phase) && (
            <g transform="translate(735 105)">
              <Star />
              <text x="0" y="47" fontSize="13" textAnchor="middle">
                いいかんじ！
              </text>
            </g>
          )}
        </StageSvg>
        {cooking && (
          <div className="stage-callout">
            {s.elapsed < 3 ? "じゅわ〜…" : "ぷくぷく… もうすこし！"}{" "}
            <progress aria-label="やけるまで" max={8} value={s.elapsed} />
          </div>
        )}
      </Stage>
      <Hint>{hints[s.phase]}</Hint>
      <div className="control-deck">
        {decorate ? (
          <>
            {names.map((n, i) => (
              <Control
                key={n}
                label={n}
                keyName={String(i + 1)}
                onClick={() => add(i)}
                disabled={s.tops.length >= 60}
              >
                <SvgPicture>
                  <g transform="translate(150 150) scale(2.6)">
                    <ToppingDrawing kind={i} />
                  </g>
                </SvgPicture>
              </Control>
            ))}
            <Primary keyName="Enter" onClick={finish}>
              できあがり！
            </Primary>
          </>
        ) : (
          <Primary
            onClick={action}
            disabled={!["pour", "flipReady", "plateReady"].includes(s.phase)}
          >
            {s.phase === "pour"
              ? "きじを ながす"
              : s.phase === "flipReady"
                ? "ひっくりかえす"
                : s.phase === "plateReady"
                  ? "おさらに のせる"
                  : "やいているよ…"}
          </Primary>
        )}
      </div>
    </>
  );
}
