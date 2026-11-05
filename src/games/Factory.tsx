import { useState } from "react";
import { ModuleDrawing, ObjectDrawing, Face, Star } from "../Art";
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
} from "../ui";
import { audio } from "../audio";
import { modulePoint, factoryArtwork } from "../logic.mjs";
type Config = { modules: number[]; color: number };
function Artwork({ modules, color }: { modules: number[]; color: number }) {
  return (
    <g>
      <rect
        x="-79"
        y="-59"
        width="158"
        height="118"
        rx="12"
        fill="#fff9ed"
        stroke="#d5bfa7"
        strokeWidth="3"
      />
      {factoryArtwork(modules, color).map(
        ({ kind, slot }: { kind: number; slot: number }) => (
          <g
            key={slot}
            transform={`translate(${(slot - 1) * 37} ${(slot % 2) * 20 - 7})`}
          >
            {kind === 0 ? (
              <path
                d="M-18-25q36 25 0 50"
                fill="none"
                stroke={colors[color]}
                strokeWidth="9"
                strokeLinecap="round"
              />
            ) : kind === 1 ? (
              <g transform="scale(.7)">
                <Star fill={["#edc66c", "#a8c9ae", "#b6a1db"][slot]} />
              </g>
            ) : (
              Array.from({ length: 8 }, (_, i) => (
                <rect
                  key={i}
                  x={-25 + (i % 4) * 15}
                  y={-22 + Math.floor(i / 4) * 25}
                  width="7"
                  height="13"
                  rx="2"
                  fill={colors[(i + slot) % 5]}
                  transform={`rotate(${i * 19})`}
                />
              ))
            )}
          </g>
        ),
      )}
    </g>
  );
}
export function FactoryGame() {
  const [config, setConfig] = useState<Config>({
      modules: [0, 0, 0],
      color: 0,
    }),
    [selected, setSelected] = useState(1),
    [history, setHistory] = useState<Config[]>([]),
    [phase, setPhase] = useState("building"),
    [elapsed, setElapsed] = useState(0),
    [previous, setPrevious] = useState<Config | null>(null),
    [result, setResult] = useState<Config | null>(null),
    [fired, setFired] = useState<number[]>([]);
  const { finish } = usePlay();
  const hint =
    phase === "building"
      ? "ここを かえたら、どうなる？ えらんで ころがそう！"
      : phase === "running"
        ? "ころころ… どんな えが できるかな？"
        : "まえの えと くらべてみよう！";
  useAnnounce(hint);
  const change = (kind: number) => {
    if (phase !== "building" || config.modules[selected] === kind) return;
    setHistory((h) => [
      ...h.slice(-29),
      { modules: [...config.modules], color: config.color },
    ]);
    setConfig((c) => ({
      ...c,
      modules: c.modules.map((x, i) => (i === selected ? kind : x)),
    }));
    audio.sound("pop");
  };
  const color = () => {
    if (phase !== "building") return;
    setHistory((h) => [
      ...h.slice(-29),
      { modules: [...config.modules], color: config.color },
    ]);
    setConfig((c) => ({ ...c, color: (c.color + 1) % 3 }));
    audio.sound("soft");
  };
  const undo = () => {
    const h = history.at(-1);
    if (h) {
      setConfig(h);
      setHistory((x) => x.slice(0, -1));
    }
  };
  const go = () => {
    if (phase !== "building") return;
    setPrevious(result);
    setResult({ modules: [...config.modules], color: config.color });
    setElapsed(0);
    setFired([]);
    setPhase("running");
    audio.sound("soft");
  };
  useTick((dt) => {
    if (phase !== "running") return;
    setElapsed((t) => t + dt);
    const slot = Math.floor(elapsed / 2.8);
    if (slot < 3 && elapsed % 2.8 > 1.45 && !fired.includes(slot)) {
      setFired((f) => [...f, slot]);
      audio.sound(
        config.modules[slot] === 2
          ? "bell"
          : config.modules[slot] === 1
            ? "magic"
            : "water",
      );
    }
    if (elapsed >= 9) {
      setPhase("result");
      audio.sound("success");
    }
  });
  useKeys((k) => {
    if (phase === "building") {
      if (k === "ArrowLeft") setSelected((selected + 2) % 3);
      if (k === "ArrowRight") setSelected((selected + 1) % 3);
      if (/^[1-3]$/.test(k)) change(Number(k) - 1);
      if (k === "4") color();
      if (k === "Space") go();
      if (k === "Backspace") undo();
    } else if (phase === "result") {
      if (k === "Space") setPhase("building");
      if (k === "Enter") finish();
    }
  });
  const slot = Math.min(2, Math.floor(elapsed / 2.8)),
    local = modulePoint(
      config.modules[slot],
      Math.min(1, (elapsed - slot * 2.8) / 2.8),
    );
  const ballX = 65 + slot * 260 + local.x,
    ballY = 115 + local.y;
  return (
    <>
      <Stage className="ball-stage" label="仕掛けを変えてボールを転がす工場">
        <StageSvg label={hint}>
          <path d="M0 345H900V420H0Z" fill="#dcbda1" />
          <path
            d="M45 275H850"
            stroke="#a98d7b"
            strokeWidth="12"
            strokeLinecap="round"
          />
          {config.modules.map((kind, i) => (
            <g key={i} transform={`translate(${65 + i * 260} 115)`}>
              <rect
                x="-8"
                y="-35"
                width="254"
                height="217"
                rx="26"
                fill={
                  selected === i && phase === "building"
                    ? "#fff6d8"
                    : "#ffffff35"
                }
                stroke={
                  selected === i && phase === "building" ? "#b095c5" : "#d8baa3"
                }
                strokeWidth={selected === i && phase === "building" ? 4 : 2}
                strokeDasharray={phase === "building" ? "9 6" : undefined}
              />
              <g transform="translate(-20 -7) scale(.9)">
                <ModuleDrawing kind={kind} />
              </g>
              {kind === 2 && (
                <g
                  transform={`translate(123 ${fired.includes(i) ? -45 : -48}) scale(.25)`}
                >
                  <ObjectDrawing kind="bell" />
                </g>
              )}
              <text x="119" y="199" textAnchor="middle" fontSize="14">
                {i + 1}ばんの しかけ
              </text>
              {fired.includes(i) && (
                <g transform="translate(220 4) scale(.55)">
                  <Star fill="#ffe38c" />
                </g>
              )}
            </g>
          ))}
          {phase === "running" && !local.hidden && elapsed < 8.4 && (
            <g transform={`translate(${ballX} ${ballY})`}>
              <circle
                r="23"
                fill={colors[config.color]}
                stroke="#795d6e"
                strokeWidth="3"
              />
              <Face x={0} y={-2} scale={0.42} />
            </g>
          )}
          {phase === "building" && (
            <g transform="translate(58 207)">
              <circle
                r="23"
                fill={colors[config.color]}
                stroke="#795d6e"
                strokeWidth="3"
              />
              <Face x={0} y={-2} scale={0.42} />
            </g>
          )}
          {phase === "result" && result && (
            <g transform="translate(450 185) scale(1.9)">
              <Artwork modules={result.modules} color={result.color} />
            </g>
          )}
          {previous && phase === "result" && (
            <g transform="translate(120 87) scale(.75)">
              <Artwork modules={previous.modules} color={previous.color} />
              <text textAnchor="middle" y="84" fontSize="15">
                まえの え
              </text>
            </g>
          )}
        </StageSvg>
        {phase === "building" && (
          <div className="zone-selectors">
            {[0, 1, 2].map((i) => (
              <button
                key={i}
                className={selected === i ? "selected" : ""}
                onClick={() => setSelected(i)}
              >
                {i + 1}ばんを かえる
              </button>
            ))}
          </div>
        )}
        {phase === "building" && (
          <div className="inline-tools">
            <Undo onClick={undo} disabled={!history.length} />
          </div>
        )}
      </Stage>
      <Hint>{hint}</Hint>
      <div className="control-deck">
        {phase === "building" ? (
          <>
            {["さか", "トンネル", "トランポリン"].map((n, i) => (
              <Control
                key={n}
                label={n}
                keyName={String(i + 1)}
                active={config.modules[selected] === i}
                onClick={() => change(i)}
              >
                <SvgPicture>
                  <ModuleDrawing kind={i} />
                </SvgPicture>
              </Control>
            ))}
            <Control label="ボールの いろ" keyName="4" onClick={color}>
              <span
                className="color-dot"
                style={{ background: colors[config.color] }}
              />
            </Control>
            <Primary onClick={go}>ころがす！</Primary>
          </>
        ) : phase === "running" ? (
          <Primary onClick={() => {}} disabled>
            ころころ じっけんちゅう
          </Primary>
        ) : (
          <>
            <Control
              label="しかけを かえる"
              keyName="Space"
              onClick={() => setPhase("building")}
            />
            <Primary keyName="Enter" onClick={finish}>
              こうじょう できた！
            </Primary>
          </>
        )}
      </div>
    </>
  );
}
