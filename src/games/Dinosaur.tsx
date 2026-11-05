import { useState } from "react";
import { DinosaurDrawing, Star } from "../Art";
import { usePlay, useTick, useKeys, useAnnounce } from "../play";
import {
  Control,
  Primary,
  Hint,
  Stage,
  StageSvg,
  SvgPicture,
  Progress,
} from "../ui";
import { audio } from "../audio";
import { shuffle, candidateSlots } from "../logic.mjs";
const slotPositions = [
  [598, 187],
  [462, 235],
  [320, 250],
  [521, 306],
  [420, 306],
  [552, 210],
];
const partNames = [
  "あたま",
  "からだ",
  "しっぽ",
  "まえあし",
  "うしろあし",
  "くび",
];
function Bone({ kind }: { kind: number }) {
  const stroke = "#b6a68c";
  return (
    <g
      fill="#fff6df"
      stroke={stroke}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {kind === 0 ? (
        <>
          <path d="M-38-22Q5-39 43-15L49 12 18 28-36 15Z" />
          <ellipse cx="17" cy="-4" rx="10" ry="12" fill="#c9bca2" />
          <path d="M-22 13h46m-5 0v9m-15-9v10" fill="none" />
        </>
      ) : kind === 1 ? (
        <>
          <path d="M-60 0H60" strokeWidth="12" />
          {[-38, -13, 13, 38].map((x) => (
            <path
              key={x}
              d={`M${x} -20q-17 21 0 45`}
              fill="none"
              strokeWidth="8"
            />
          ))}
        </>
      ) : kind === 2 ? (
        <path
          d="M-58 12Q-17 30 47-16M-25 17l-4-16m29 12L1-6m29 8 1-15"
          fill="none"
          strokeWidth="10"
        />
      ) : kind === 5 ? (
        <path
          d="M-31 19 28-22M-18 8l-13-12m29-1L3-20"
          fill="none"
          strokeWidth="12"
        />
      ) : kind === 3 ? (
        <>
          <path d="M-5-30V31H24" fill="none" strokeWidth="10" />
          <circle cx="-5" cy="-30" r="8" />
          <circle cx="-5" cy="0" r="8" />
        </>
      ) : (
        <>
          <path d="M-7-31 4 8-9 35 26 35" fill="none" strokeWidth="13" />
          <circle cx="-7" cy="-32" r="10" />
          <circle cx="4" cy="9" r="10" />
        </>
      )}
    </g>
  );
}
type State = {
  phase: string;
  site: number;
  spot: number;
  depths: number[];
  order: number[];
  found: number[];
  clean: number;
  hold: boolean;
  elapsed: number;
  attached: number[];
  choices: number[];
  miss: number;
};
const initial: State = {
  phase: "select",
  site: 0,
  spot: 0,
  depths: [0, 0, 0, 0, 0, 0],
  order: [2, 0, 1, 3, 4, 5],
  found: [],
  clean: 0,
  hold: false,
  elapsed: 0,
  attached: [],
  choices: [],
  miss: 0,
};
export function DinosaurGame() {
  const [s, setS] = useState(initial);
  const { finish } = usePlay();
  const currentPart = s.order[s.spot],
    assemblyPart = s.found[s.attached.length];
  const positions = slotPositions.map((point, part) =>
    s.site === 2 && part === 0
      ? [580, 69]
      : s.site === 2 && part === 5
        ? [555, 153]
        : point,
  );
  const hint =
    s.phase === "select"
      ? "どこを ほってみよう？"
      : s.phase === "dig"
        ? "ばしょを えらんで、スペースで ほろう！"
        : s.phase === "brush"
          ? "ブラシで やさしく はらおう。"
          : s.phase === "assemble"
            ? "この ほね、どこに つくかな？"
            : s.phase === "reveal"
              ? "だれだったか わかるかな…？"
              : "みつけたね！ きみの きょうりゅう！";
  useAnnounce(hint);
  const select = (site: number) => {
    audio.sound("pop");
    setS({
      ...initial,
      phase: "dig",
      site,
      order: [
        site === 0 ? 0 : 2,
        ...shuffle(
          [0, 1, 2, 3, 4, 5].filter((i) => i !== (site === 0 ? 0 : 2)),
        ),
      ],
    });
  };
  const dig = () => {
    if (s.phase !== "dig" || s.found.includes(currentPart)) return;
    audio.sound("dig");
    const depths = [...s.depths];
    depths[s.spot] = Math.min(3, depths[s.spot] + 1);
    setS({
      ...s,
      depths,
      phase: depths[s.spot] >= 3 ? "brush" : "dig",
      clean: 0,
      hold: false,
    });
  };
  const brush = (amount: number) =>
    setS((a) => {
      if (a.phase !== "brush") return a;
      const clean = Math.min(1, a.clean + amount);
      if (clean >= 1) {
        const found = [...a.found, a.order[a.spot]];
        const nextSpot = a.order.findIndex((p) => !found.includes(p));
        audio.sound("success");
        return {
          ...a,
          found,
          clean: 0,
          hold: false,
          spot: nextSpot >= 0 ? nextSpot : a.spot,
          phase: found.length === 6 ? "assemble" : "dig",
          choices: found.length === 6 ? candidateSlots(found[0], []) : [],
        };
      }
      return { ...a, clean };
    });
  const choose = (i: number) => {
    if (s.phase !== "assemble" || s.choices[i] === undefined) return;
    if (s.choices[i] === assemblyPart) {
      audio.sound("success");
      const attached = [...s.attached, assemblyPart];
      setS({
        ...s,
        attached,
        miss: 0,
        choices:
          attached.length < 6
            ? candidateSlots(s.found[attached.length], attached)
            : [],
        phase: attached.length === 6 ? "reveal" : "assemble",
        elapsed: 0,
      });
    } else {
      audio.sound("soft");
      setS({ ...s, miss: s.miss + 1 });
    }
  };
  useTick((dt) => {
    if (s.phase === "brush" && s.hold) brush(dt / 1.8);
    if (s.phase === "reveal") {
      setS((a) => ({ ...a, elapsed: a.elapsed + dt }));
      if (s.elapsed >= 4) setS((a) => ({ ...a, phase: "complete" }));
    }
  });
  useKeys(
    (k, down) => {
      if (!down) {
        if (k === "Space") setS((a) => ({ ...a, hold: false }));
        return;
      }
      if (s.phase === "select" && /^[1-3]$/.test(k)) select(Number(k) - 1);
      if (s.phase === "dig") {
        if (k === "Space") dig();
        if (k === "ArrowLeft") setS({ ...s, spot: (s.spot + 5) % 6 });
        if (k === "ArrowRight") setS({ ...s, spot: (s.spot + 1) % 6 });
      }
      if (s.phase === "brush" && k === "Space") {
        brush(0.25);
        setS((a) => ({ ...a, hold: a.phase === "brush" }));
      }
      if (s.phase === "assemble" && /^[1-3]$/.test(k)) choose(Number(k) - 1);
      if (s.phase === "complete") {
        if (k === "Enter") finish();
        if (k === "Space") audio.sound("magic");
      }
    },
    ["Space"],
  );
  return (
    <>
      <Stage className="dig-stage" label="恐竜の骨を発掘して組み立てる場所">
        <Progress
          total={6}
          current={s.phase === "assemble" ? s.attached.length : s.found.length}
        />
        <StageSvg label={hint}>
          <path
            d="M0 0H900V420H0Z"
            fill={s.phase === "assemble" ? "#f2eddd" : "#edf0d6"}
          />
          <path
            d="M0 135H900V420H0Z"
            fill={s.phase === "assemble" ? "#e4ddc7" : "#d8b996"}
          />
          {s.phase === "select" ? (
            [0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${65 + i * 285} 100)`}>
                <rect
                  width="200"
                  height="181"
                  rx="30"
                  fill={["#a8c49a", "#e4b38e", "#9ecbd1"][i]}
                  stroke="#b6a687"
                  strokeWidth="3"
                />
                <path
                  d="M20 124 74 49 125 114 169 76l20 83H20Z"
                  fill="#fff7dd"
                  opacity=".5"
                />
                <text x="100" y="215" textAnchor="middle" fontSize="20">
                  {["もり", "あかつち", "かわべ"][i]}
                </text>
              </g>
            ))
          ) : s.phase === "dig" ? (
            <>
              {s.depths.map((d, i) => (
                <g
                  key={i}
                  transform={`translate(${235 + (i % 3) * 215} ${135 + Math.floor(i / 3) * 160})`}
                >
                  <ellipse
                    rx="82"
                    ry="51"
                    fill={s.found.includes(s.order[i]) ? "#b59a7e" : "#c5a582"}
                    stroke={s.spot === i ? "#9376b0" : "#ae8b69"}
                    strokeWidth={s.spot === i ? 5 : 2}
                  />
                  {d > 0 && !s.found.includes(s.order[i]) && (
                    <g
                      transform={`scale(${0.3 + d * 0.14})`}
                      opacity={d / 3 + 0.2}
                    >
                      <Bone kind={s.order[i]} />
                    </g>
                  )}
                  {s.found.includes(s.order[i]) ? (
                    <>
                      <path
                        d="M0-4v-44h32l-8 11 8 11H0"
                        fill="#f7d679"
                        stroke="#967d65"
                        strokeWidth="3"
                      />
                    </>
                  ) : (
                    <text y="7" textAnchor="middle" fontSize="16">
                      {i + 1}
                    </text>
                  )}
                </g>
              ))}
            </>
          ) : s.phase === "brush" ? (
            <>
              <ellipse cx="450" cy="243" rx="220" ry="103" fill="#f2e6cb" />
              <g transform="translate(450 217) scale(2.5)">
                <Bone kind={currentPart} />
              </g>
              {Array.from({ length: 14 }, (_, i) => (
                <ellipse
                  key={i}
                  cx={330 + ((i * 47) % 240)}
                  cy={177 + ((i * 31) % 93)}
                  rx={14 + (i % 3) * 8}
                  ry="12"
                  fill="#b59a7f"
                  opacity={(1 - s.clean) * 0.8}
                />
              ))}
              <g
                transform={`translate(${530 + Math.sin(s.clean * 20) * 50} 105) rotate(25)`}
              >
                <rect width="82" height="22" rx="8" fill="#e7b581" />
                <path
                  d="M5 24v25m12-25v25m12-25v25m12-25v25m12-25v25m12-25v25"
                  stroke="#f0cf9f"
                  strokeWidth="8"
                />
                <rect
                  x="32"
                  y="-48"
                  width="20"
                  height="50"
                  rx="7"
                  fill="#aa836b"
                />
              </g>
            </>
          ) : s.phase === "assemble" ? (
            <>
              <g transform="translate(240 0) scale(1.6)" opacity=".16">
                <DinosaurDrawing kind={s.site} bones />
              </g>
              {s.attached.map((p) => (
                <g
                  key={p}
                  transform={`translate(${positions[p][0]} ${positions[p][1]})`}
                >
                  <Bone kind={p} />
                </g>
              ))}
              {s.choices.map((p, i) => (
                <g
                  key={p}
                  transform={`translate(${positions[p][0]} ${positions[p][1]})`}
                >
                  <ellipse
                    rx="65"
                    ry="43"
                    fill={
                      s.miss >= 2 && p === assemblyPart
                        ? "#fff1a8"
                        : "#ffffff91"
                    }
                    stroke="#aa91b3"
                    strokeWidth="3"
                    strokeDasharray="7 5"
                  />
                  <text textAnchor="middle" y="7" fontSize="23">
                    {i + 1}
                  </text>
                </g>
              ))}
              <g transform="translate(110 295) scale(1.1)">
                <Bone kind={assemblyPart} />
              </g>
              <text x="110" y="369" fontSize="14" textAnchor="middle">
                {partNames[assemblyPart]}の ほね
              </text>
            </>
          ) : (
            <>
              <g transform="translate(210 0) scale(1.6)">
                <DinosaurDrawing kind={s.site} />
              </g>
              <g transform="translate(735 89)">
                <Star />
              </g>
              <text x="450" y="385" textAnchor="middle" fontSize="22">
                {
                  [
                    "つのが かっこいい！",
                    "せなかが すてき！",
                    "くびが ながいね！",
                  ][s.site]
                }
              </text>
            </>
          )}
        </StageSvg>
      </Stage>
      <Hint>
        {hint}
        {s.phase === "assemble" && s.miss >= 2
          ? " ぴかっとした かたちを みてね。"
          : ""}
      </Hint>
      <div className="control-deck">
        {s.phase === "select" ? (
          ["もりを ほる", "あかつちを ほる", "かわべを ほる"].map((n, i) => (
            <Control
              key={n}
              label={n}
              keyName={String(i + 1)}
              onClick={() => select(i)}
            />
          ))
        ) : s.phase === "dig" ? (
          <>
            <Control
              label="まえの ばしょ"
              keyName="←"
              onClick={() => setS({ ...s, spot: (s.spot + 5) % 6 })}
            />
            <Primary onClick={dig}>ほってみる！</Primary>
            <Control
              label="つぎの ばしょ"
              keyName="→"
              onClick={() => setS({ ...s, spot: (s.spot + 1) % 6 })}
            />
          </>
        ) : s.phase === "brush" ? (
          <button
            className="primary hold-button"
            onPointerDown={() => setS((a) => ({ ...a, hold: true }))}
            onPointerUp={() => setS((a) => ({ ...a, hold: false }))}
            onPointerLeave={() => setS((a) => ({ ...a, hold: false }))}
            onPointerCancel={() => setS((a) => ({ ...a, hold: false }))}
            onClick={() => brush(0.3)}
          >
            ブラシで はらう <kbd>スペース</kbd>
          </button>
        ) : s.phase === "assemble" ? (
          s.choices.map((p, i) => (
            <Control
              key={p}
              label={`${i + 1}の ばしょ`}
              keyName={String(i + 1)}
              onClick={() => choose(i)}
            >
              <SvgPicture>
                <g transform="translate(150 120) scale(2)">
                  <Bone kind={p} />
                </g>
              </SvgPicture>
            </Control>
          ))
        ) : s.phase === "reveal" ? (
          <Primary disabled onClick={() => {}}>
            わくわく…！
          </Primary>
        ) : (
          <>
            <Control
              label="ごあいさつ"
              keyName="Space"
              onClick={() => audio.sound("magic")}
            />
            <Primary keyName="Enter" onClick={finish}>
              できた！
            </Primary>
          </>
        )}
      </div>
    </>
  );
}
