import { useRef, useState } from "react";
import { CarDrawing, ObjectDrawing, Star } from "../Art";
import { colors } from "../data";
import { usePlay, useTick, useKeys, useAnnounce } from "../play";
import {
  Control,
  Primary,
  Hint,
  Stage,
  StageSvg,
  SvgPicture,
  Undo,
  Progress,
} from "../ui";
import { audio } from "../audio";
type State = {
  phase: number;
  vehicle: number;
  zone: number;
  progress: number[];
  hold: boolean;
  color: number;
  stickers: number[];
  history: { color: number; stickers: number[] }[];
  elapsed: number;
  drying: boolean;
};
const initial: State = {
  phase: -1,
  vehicle: 0,
  zone: 0,
  progress: [0, 0, 0],
  hold: false,
  color: 0,
  stickers: [],
  history: [],
  elapsed: 0,
  drying: false,
};
const phases = ["みず", "あわ", "ブラシ", "すすぎ", "かぜ", "かざり"];
export function CarWashGame() {
  const [s, setS] = useState(initial),
    [sticker, setSticker] = useState(0);
  const { finish } = usePlay();
  const pointerPhase = useRef(-99);
  const hint =
    s.phase === -1
      ? "どの くるまを ぴかぴかにする？"
      : s.phase === 5
        ? "すきな いろと シールで おめかししよう！"
        : s.phase === 6
          ? "ありがとう！ また くるね！"
          : `${phases[s.phase]}で ぴかぴか！ ばしょも えらべるよ。`;
  useAnnounce(hint);
  const select = (vehicle: number) => {
    audio.sound("pop");
    setS({ ...initial, phase: 0, vehicle });
  };
  const tool = (amount = 0.25) =>
    setS((a) => {
      if (a.phase < 0 || a.phase > 4) return a;
      if (a.phase === 4)
        return a.drying ? a : { ...a, drying: true, hold: false, elapsed: 0 };
      const p = [...a.progress];
      p[a.zone] = Math.min(1, p[a.zone] + amount);
      if (p.every((v) => v >= 1)) {
        audio.sound("success");
        return {
          ...a,
          phase: a.phase + 1,
          zone: 0,
          progress: [0, 0, 0],
          hold: false,
          elapsed: 0,
        };
      }
      return { ...a, progress: p };
    });
  useTick((dt) => {
    if (s.hold && s.phase >= 0 && s.phase < 4) tool(dt / 1.5);
    if (s.phase === 4 && s.drying) {
      setS((a) => ({ ...a, elapsed: a.elapsed + dt }));
      if (s.elapsed >= 2.5)
        setS((a) => ({ ...a, phase: 5, drying: false, elapsed: 0 }));
    }
    if (s.phase === 6) {
      setS((a) => ({ ...a, elapsed: a.elapsed + dt }));
      if (s.elapsed >= 5) finish();
    }
  });
  const hold = (down: boolean) => {
    setS((a) => ({ ...a, hold: down && a.phase >= 0 && a.phase < 4 }));
    if (down) {
      audio.sound("water");
      tool(0.15);
    }
  };
  const zone = (n: number) => setS((a) => ({ ...a, zone: (n + 3) % 3 }));
  const decorate = (color?: number) =>
    setS((a) => ({
      ...a,
      history: [
        ...a.history.slice(-29),
        { color: a.color, stickers: [...a.stickers] },
      ],
      color: color ?? a.color,
      stickers:
        color === undefined
          ? [...a.stickers, sticker + 1].slice(-3)
          : a.stickers,
    }));
  const undo = () =>
    setS((a) => {
      const prev = a.history.at(-1);
      return prev ? { ...a, ...prev, history: a.history.slice(0, -1) } : a;
    });
  const depart = () => {
    if (s.phase === 5) {
      audio.sound("success");
      setS((a) => ({ ...a, phase: 6, elapsed: 0 }));
    }
  };
  useKeys(
    (k, down) => {
      if (!down) {
        if (k === "Space") hold(false);
        return;
      }
      if (s.phase === -1 && /^[1-3]$/.test(k)) select(Number(k) - 1);
      else if (s.phase < 5) {
        if (k === "Space") hold(true);
        if (k === "ArrowLeft") zone(s.zone - 1);
        if (k === "ArrowRight") zone(s.zone + 1);
      } else if (s.phase === 5) {
        if (/^[1-4]$/.test(k)) decorate(Number(k) - 1);
        if (k === "ArrowLeft") setSticker((sticker + 5) % 6);
        if (k === "ArrowRight") setSticker((sticker + 1) % 6);
        if (k === "Space") {
          decorate();
          audio.sound("pop");
        }
        if (k === "Enter") depart();
        if (k === "Backspace") undo();
      }
    },
    ["Space"],
  );
  const washRatio = (z: number) =>
    s.phase > 3
      ? 1
      : s.phase === 0
        ? s.progress[z] * 0.35
        : s.phase === 3
          ? 0.7 + s.progress[z] * 0.3
          : 0.35;
  return (
    <>
      <Stage className="cool-stage" label="車を洗う洗車場">
        {s.phase >= 0 && <Progress total={5} current={Math.min(s.phase, 5)} />}
        <StageSvg label={hint}>
          <path d="M0 310H900V420H0Z" fill="#b8d4cd" />
          <path d="M0 324H900" stroke="#98b9b1" strokeWidth="3" />
          {s.phase === -1 ? (
            [0, 1, 2].map((i) => (
              <g key={i} transform={`translate(${30 + i * 290} 85) scale(.88)`}>
                <CarDrawing
                  kind={i}
                  color={["#ed8c8d", "#f5ce6c", "#a7cee0"][i]}
                />
                <text x="150" y="240" textAnchor="middle" fontSize="18">
                  {i + 1}
                </text>
              </g>
            ))
          ) : (
            <g
              transform={`translate(${s.phase === 6 ? 210 + s.elapsed * 70 : 210} 30) scale(1.6)`}
            >
              <CarDrawing kind={s.vehicle} color={colors[s.color]} />
              {s.stickers.map((v, i) => (
                <g
                  key={i}
                  transform={`translate(${66 + i * 53} 139) scale(.43)`}
                >
                  {v % 3 === 0 ? (
                    <circle
                      r="21"
                      fill={colors[v % 5]}
                      stroke="#fff7df"
                      strokeWidth="4"
                    />
                  ) : v % 3 === 1 ? (
                    <Star fill={colors[v % 5]} />
                  ) : (
                    <path
                      d="M0 19S-32 1-19-14Q-7-27 0-10Q11-28 23-12Q32 4 0 19Z"
                      fill={colors[v % 5]}
                      stroke="#fff7df"
                      strokeWidth="3"
                    />
                  )}
                </g>
              ))}
              {s.phase < 4 &&
                [0, 1, 2].map((z) => (
                  <g key={z}>
                    {[0, 1, 2, 3, 4].map((j) => (
                      <ellipse
                        key={j}
                        cx={45 + z * 76 + ((j * 19) % 65)}
                        cy={98 + ((j * 17) % 58)}
                        rx={14 + (j % 2) * 9}
                        ry={9 + (j % 3) * 5}
                        fill="#a7876e"
                        opacity={(1 - washRatio(z)) * 0.8}
                      />
                    ))}
                    {(s.phase === 1 || s.phase === 2 || s.phase === 3) &&
                      Array.from({ length: 7 }, (_, j) => (
                        <circle
                          key={j}
                          cx={42 + z * 76 + ((j * 19) % 65)}
                          cy={91 + ((j * 17) % 68)}
                          r={8 + (j % 4) * 4}
                          fill="#fffdf0"
                          stroke="#c9e3e1"
                          strokeWidth="1"
                          opacity={
                            s.phase === 1
                              ? s.progress[z]
                              : s.phase === 3
                                ? 1 - s.progress[z]
                                : 1
                          }
                        />
                      ))}
                  </g>
                ))}
              {s.phase === 2 && (
                <g
                  transform={`translate(${40 + s.zone * 75} ${96 + Math.sin(s.elapsed * 10) * 4})`}
                >
                  <rect
                    width="50"
                    height="17"
                    rx="7"
                    fill="#f6c280"
                    stroke="#b58a6b"
                    strokeWidth="2"
                  />
                  <path
                    d="M4 17v16m9-16v16m9-16v16m9-16v16m9-16v16"
                    stroke="#ddaa77"
                    strokeWidth="4"
                  />
                </g>
              )}
              {s.hold && (s.phase === 0 || s.phase === 3) && (
                <g stroke="#a5e2eb" strokeWidth="4" opacity=".9">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <path
                      key={i}
                      d={`M${35 + s.zone * 76} 33l${i * 7 - 14} 70`}
                    />
                  ))}
                </g>
              )}
              {s.phase >= 4 &&
                [0, 1, 2].map((i) => (
                  <g
                    key={i}
                    transform={`translate(${62 + i * 75} ${73 + (i % 2) * 23}) scale(.35)`}
                  >
                    <Star fill="#fff3b5" />
                  </g>
                ))}
            </g>
          )}
          {s.phase === 6 && (
            <>
              <path
                d="M700 80q45-80 90-8"
                stroke="#f1b4c3"
                strokeWidth="15"
                fill="none"
              />
              <path
                d="M710 82q35-60 72-8"
                stroke="#f5d67f"
                strokeWidth="12"
                fill="none"
              />
            </>
          )}
        </StageSvg>
        {s.phase >= 0 && s.phase < 4 && (
          <div className="zone-selectors">
            {["うしろ", "まんなか", "まえ"].map((n, i) => (
              <button
                key={n}
                className={s.zone === i ? "selected" : ""}
                onClick={() => zone(i)}
              >
                {s.progress[i] >= 1 ? "✓ " : ""}
                {n}
              </button>
            ))}
          </div>
        )}
        {s.phase === 5 && (
          <div className="inline-tools">
            <Undo onClick={undo} disabled={!s.history.length} />
          </div>
        )}
      </Stage>
      <Hint>{hint}</Hint>
      <div className="control-deck">
        {s.phase === -1 ? (
          ["しょうぼうしゃ", "ショベルカー", "アイスの くるま"].map((n, i) => (
            <Control
              key={n}
              label={n}
              keyName={String(i + 1)}
              onClick={() => select(i)}
            >
              <SvgPicture>
                <CarDrawing kind={i} />
              </SvgPicture>
            </Control>
          ))
        ) : s.phase === 5 ? (
          <>
            {colors.slice(0, 4).map((c, i) => (
              <Control
                key={c}
                label={["ピンク", "きいろ", "みどり", "むらさき"][i]}
                keyName={String(i + 1)}
                active={s.color === i}
                onClick={() => decorate(i)}
              >
                <span className="color-dot" style={{ background: c }} />
              </Control>
            ))}
            <Control
              label="シールを かえる"
              keyName="← →"
              onClick={() => setSticker((sticker + 1) % 6)}
            >
              <SvgPicture>
                <g transform="translate(150 125) scale(3)">
                  <Star fill={colors[sticker % 5]} />
                </g>
              </SvgPicture>
            </Control>
            <Control
              label="シールを はる"
              keyName="Space"
              onClick={() => {
                decorate();
                audio.sound("pop");
              }}
            />
            <Primary keyName="Enter" onClick={depart}>
              しゅっぱつ！
            </Primary>
          </>
        ) : s.phase === 6 ? (
          <Primary disabled onClick={() => {}}>
            いってらっしゃい！
          </Primary>
        ) : (
          <>
            <Control
              label="ひだりの ばしょ"
              keyName="←"
              onClick={() => zone(s.zone - 1)}
            />
            <button
              className={`primary hold-button ${s.hold ? "holding" : ""}`}
              disabled={s.drying}
              onPointerDown={(e) => {
                pointerPhase.current = s.phase;
                e.currentTarget.setPointerCapture(e.pointerId);
                hold(true);
              }}
              onPointerUp={() => hold(false)}
              onPointerCancel={() => hold(false)}
              onClick={() => {
                if (
                  pointerPhase.current === s.phase ||
                  pointerPhase.current === -99
                )
                  tool(0.35);
                pointerPhase.current = -99;
              }}
            >
              {s.phase === 4
                ? s.drying
                  ? "ふわ〜っと かわかしているよ"
                  : "かぜで かわかす"
                : `${phases[s.phase]}を つかう`}
              <kbd>スペース</kbd>
            </button>
            <Control
              label="みぎの ばしょ"
              keyName="→"
              onClick={() => zone(s.zone + 1)}
            />
          </>
        )}
      </div>
    </>
  );
}
