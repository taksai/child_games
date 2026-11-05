import { useState } from "react";
import { BuildingDrawing, CarDrawing, Star } from "../Art";
import { usePlay, useTick, useKeys, useAnnounce } from "../play";
import { Control, Primary, Hint, Stage, SvgPicture, Undo } from "../ui";
import { audio } from "../audio";
import { roadTour, roadMask } from "../logic.mjs";
const initialGrid: number[] = Array.from({ length: 24 }, (_, i) =>
  i === 12 ? 7 : i === 13 ? 1 : 0,
);
const names = ["みち", "おうち", "き", "パンや", "いけ", "けす"];
function Road({ mask }: { mask: boolean[] }) {
  const ends = [
    [50, 0],
    [100, 50],
    [50, 100],
    [0, 50],
  ];
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <rect x="29" y="29" width="42" height="42" rx="9" fill="#b4ada3" />
      {mask.map(
        (v, i) =>
          v && (
            <g key={i}>
              <path
                d={`M50 50L${ends[i][0]} ${ends[i][1]}`}
                stroke="#b4ada3"
                strokeWidth="42"
              />
              <path
                d={`M50 50L${ends[i][0]} ${ends[i][1]}`}
                className="road-line"
              />
            </g>
          ),
      )}
    </svg>
  );
}
export function TownGame() {
  const [grid, setGrid] = useState(initialGrid),
    [variants, setVariants] = useState(Array(24).fill(0)),
    [cursor, setCursor] = useState(14),
    [tool, setTool] = useState(1),
    [history, setHistory] = useState<{ grid: number[]; variants: number[] }[]>(
      [],
    ),
    [phase, setPhase] = useState("building"),
    [elapsed, setElapsed] = useState(0),
    [last, setLast] = useState(-1),
    [confirm, setConfirm] = useState(false);
  const { finish } = usePlay();
  const hint =
    phase === "building"
      ? "すきな ものを えらんで、おいてみよう！"
      : phase === "living"
        ? "きみの まちが うごきだしたよ！"
        : "つづきを つくる？ それとも できあがり？";
  useAnnounce(hint);
  const place = (index = cursor) => {
    if (phase !== "building") return;
    setCursor(index);
    if (index === 12 || index === 13) {
      audio.sound("bell");
      return;
    }
    if (grid[index] === tool && tool !== 2) return;
    setHistory((h) => [
      ...h.slice(-49),
      { grid: [...grid], variants: [...variants] },
    ]);
    const next = [...grid],
      v = [...variants];
    if (tool === 6) {
      next[index] = 0;
      v[index] = 0;
    } else {
      v[index] = grid[index] === 2 && tool === 2 ? (v[index] + 1) % 3 : 0;
      next[index] = tool;
    }
    setGrid(next);
    setVariants(v);
    setLast(index);
    audio.sound(tool === 5 ? "water" : "pop");
  };
  const undo = () => {
    const h = history.at(-1);
    if (h) {
      setGrid(h.grid);
      setVariants(h.variants);
      setHistory((x) => x.slice(0, -1));
      audio.sound("soft");
    }
  };
  const go = () => {
    if (phase === "building") {
      setPhase("living");
      setElapsed(0);
      audio.sound("success");
    }
  };
  useTick((dt) => {
    if (phase === "living") {
      setElapsed((t) => t + dt);
      if (elapsed >= 15) setPhase("postcard");
    }
  });
  useKeys((k) => {
    if (phase === "building") {
      if (/^[1-6]$/.test(k)) setTool(Number(k));
      if (k === "Space") place();
      if (k === "ArrowLeft") setCursor((c) => (c % 6 > 0 ? c - 1 : c));
      if (k === "ArrowRight") setCursor((c) => (c % 6 < 5 ? c + 1 : c));
      if (k === "ArrowUp") setCursor((c) => (c >= 6 ? c - 6 : c));
      if (k === "ArrowDown") setCursor((c) => (c < 18 ? c + 6 : c));
      if (k === "Backspace") undo();
      if (k === "Enter") go();
    } else if (phase === "living") {
      if (k === "Space") audio.sound("bell");
      if (k === "Enter") setPhase("postcard");
    } else {
      if (k === "Space") setPhase("building");
      if (k === "Enter") finish();
    }
  });
  const route = roadTour(grid);
  const step = (elapsed / 0.8) % route.length;
  const current = route[Math.floor(step)],
    next = route[(Math.floor(step) + 1) % route.length];
  const frac = step % 1;
  const bx =
      (((current % 6) + ((next % 6) - (current % 6)) * frac + 0.5) / 6) * 100,
    by =
      ((Math.floor(current / 6) +
        (Math.floor(next / 6) - Math.floor(current / 6)) * frac +
        0.5) /
        4) *
      100;
  return (
    <>
      <Stage label="積み木で作る町" className="garden-stage">
        <div
          className={`town-grid ${phase !== "building" ? "running" : ""}`}
          role="group"
          aria-label="6かける4の まちの マス"
        >
          {grid.map((kind, i) => (
            <button
              key={i}
              className={`town-cell ${cursor === i && phase === "building" ? "cursor" : ""}`}
              aria-label={`${Math.floor(i / 6) + 1}だん ${(i % 6) + 1}れつ ${kind === 7 ? "バスしゃこ" : kind ? names[kind - 1] : "からっぽ"}`}
              onClick={() =>
                phase === "building" ? place(i) : audio.sound("soft")
              }
              style={{
                animation:
                  phase === "living" && kind > 1 && kind < 6
                    ? `float ${2 + (i % 3)}s ease-in-out infinite`
                    : undefined,
              }}
            >
              {kind === 1 ? (
                <Road mask={roadMask(grid, i)} />
              ) : kind ? (
                <svg viewBox="0 0 300 240" aria-hidden="true">
                  <BuildingDrawing kind={kind} variant={variants[i]} />
                </svg>
              ) : null}
              {last === i && phase === "building" && (
                <span
                  style={{
                    position: "absolute",
                    right: 3,
                    top: 0,
                    fontSize: 13,
                    color: "#9c75bd",
                  }}
                >
                  ✦
                </span>
              )}
            </button>
          ))}
          {phase !== "building" && (
            <div
              className="town-bus"
              style={{
                left: `calc(${bx}% - 28px)`,
                top: `calc(${by}% - 22px)`,
              }}
            >
              <svg viewBox="0 0 300 240" aria-hidden="true">
                <CarDrawing kind={2} color="#f4d172" />
              </svg>
            </div>
          )}
        </div>
        <div className="inline-tools">
          {phase === "building" && (
            <>
              <Undo onClick={undo} disabled={!history.length} />
              <Undo
                label={confirm ? "ほんとうに つくりなおす？" : "つくりなおす"}
                onClick={() => {
                  if (!confirm) {
                    setConfirm(true);
                    return;
                  }
                  setHistory((h) => [
                    ...h,
                    { grid: [...grid], variants: [...variants] },
                  ]);
                  setGrid([...initialGrid]);
                  setVariants(Array(24).fill(0));
                  setConfirm(false);
                }}
              />
            </>
          )}
        </div>
        {phase === "postcard" && (
          <div className="stage-callout">すてきな まちが できたね！</div>
        )}
      </Stage>
      <Hint>{hint}</Hint>
      <div className="control-deck">
        {phase === "building" ? (
          <>
            {names.map((n, i) => (
              <Control
                key={n}
                label={n}
                keyName={String(i + 1)}
                active={tool === i + 1}
                onClick={() => setTool(i + 1)}
              >
                {i === 0 ? (
                  <SvgPicture>
                    <path d="M30 150H270" stroke="#b4ada3" strokeWidth="70" />
                    <path
                      d="M30 150H270"
                      stroke="#fff1d2"
                      strokeWidth="8"
                      strokeDasharray="20 14"
                    />
                  </SvgPicture>
                ) : i < 5 ? (
                  <SvgPicture>
                    <BuildingDrawing kind={i + 1} />
                  </SvgPicture>
                ) : (
                  <span style={{ fontSize: 26 }}>×</span>
                )}
              </Control>
            ))}
            <Primary onClick={() => place()}>ここに おく</Primary>
            <Primary keyName="Enter" onClick={go}>
              うごかす！
            </Primary>
          </>
        ) : phase === "living" ? (
          <>
            <Control
              label="ベルを ならす"
              keyName="Space"
              onClick={() => audio.sound("bell")}
            />
            <Primary keyName="Enter" onClick={() => setPhase("postcard")}>
              しゃしんを とる
            </Primary>
          </>
        ) : (
          <>
            <Control
              label="つづきを つくる"
              keyName="Space"
              onClick={() => setPhase("building")}
            />
            <Primary keyName="Enter" onClick={finish}>
              できあがり！
            </Primary>
          </>
        )}
      </div>
    </>
  );
}
