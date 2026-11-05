import { useRef, useState } from "react";
import { PlanetDrawing, ShipDrawing, Star, Illustration } from "../Art";
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
import { clamp } from "../logic.mjs";
const planets = [
  { x: 650, y: 420, name: "はなのほし" },
  { x: 1460, y: 230, name: "くものほし" },
  { x: 2080, y: 680, name: "おとのほし" },
];
const stars = [
  [420, 350],
  [870, 470],
  [1160, 300],
  [1610, 400],
  [1850, 580],
  [2160, 800],
];
export function SpaceGame() {
  const [pos, setPos] = useState({ x: 210, y: 420 }),
    [auto, setAuto] = useState<number | null>(null),
    [visited, setVisited] = useState<number[]>([]),
    [found, setFound] = useState<number[]>([]),
    [encounter, setEncounter] = useState<number | null>(null),
    [elapsed, setElapsed] = useState(0),
    [journal, setJournal] = useState(false),
    [signal, setSignal] = useState(false);
  const held = useRef(new Set<string>());
  const { finish } = usePlay();
  const nearby = planets.findIndex(
    (p) => Math.hypot(p.x - pos.x, p.y - pos.y) < 180,
  );
  const hint = journal
    ? "きみの うちゅうの おもいで！"
    : encounter !== null
      ? [
          "はなが ひらいて、ごあいさつ！",
          "くもから ふわふわの なかま！",
          "おとで おへんじしてくれたよ！",
        ][encounter]
      : nearby >= 0
        ? "ちかくに だれかいる！ スペースで ごあいさつ。"
        : "やじるしで おさんぽ。ほしの えでも とんでいけるよ！";
  useAnnounce(hint);
  const fly = (i: number) => {
    if (journal || encounter !== null) return;
    setAuto(i);
    setSignal(false);
    audio.sound("soft");
  };
  const greet = () => {
    if (journal || encounter !== null) return;
    if (nearby >= 0) {
      setEncounter(nearby);
      setElapsed(0);
      setAuto(null);
      if (!visited.includes(nearby)) setVisited([...visited, nearby]);
      audio.sound("magic");
    } else {
      setSignal(true);
      audio.sound("soft");
    }
  };
  const returnHome = () => {
    setJournal(true);
    setAuto(null);
    setEncounter(null);
    held.current.clear();
    audio.sound("success");
  };
  useTick((dt) => {
    if (journal) return;
    if (encounter !== null) {
      setElapsed((t) => t + dt);
      if (elapsed >= 3.5) setEncounter(null);
      return;
    }
    let dx =
        Number(held.current.has("ArrowRight")) -
        Number(held.current.has("ArrowLeft")),
      dy =
        Number(held.current.has("ArrowDown")) -
        Number(held.current.has("ArrowUp"));
    if (dx || dy) {
      if (auto !== null) setAuto(null);
    } else if (auto !== null) {
      dx = planets[auto].x - pos.x;
      dy = planets[auto].y - pos.y;
      if (Math.hypot(dx, dy) < 100) {
        setAuto(null);
        return;
      }
    }
    const length = Math.hypot(dx, dy);
    if (length) {
      const next = {
        x: clamp(pos.x + (dx / length) * 240 * dt, 60, 2340),
        y: clamp(pos.y + (dy / length) * 240 * dt, 70, 930),
      };
      setPos(next);
      const hit = stars.findIndex(
        ([x, y], i) =>
          !found.includes(i) && Math.hypot(x - next.x, y - next.y) < 65,
      );
      if (hit >= 0) {
        setFound([...found, hit]);
        audio.sound("bell");
      }
    }
  });
  useKeys(
    (k, down) => {
      if (k.startsWith("Arrow")) {
        if (down) held.current.add(k);
        else held.current.delete(k);
        return;
      }
      if (!down) return;
      if (/^[1-3]$/.test(k)) fly(Number(k) - 1);
      if (k === "Space") greet();
      if (k === "Enter") {
        if (journal) finish();
        else returnHome();
      }
    },
    ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"],
  );
  const camera = {
    x: clamp(pos.x - 450, 0, 1500),
    y: clamp(pos.y - 210, 0, 580),
  };
  return (
    <>
      <Stage className="space-stage" label="自由に飛べる宇宙">
        <Progress total={3} current={visited.length} />
        <StageSvg label={hint}>
          {Array.from({ length: 45 }, (_, i) => (
            <circle
              key={i}
              cx={(i * 173) % 900}
              cy={(i * 97) % 420}
              r={i % 4 === 0 ? 2.6 : 1.3}
              fill="#f7e9c7"
              opacity={0.3 + (i % 3) * 0.18}
            />
          ))}
          {journal ? (
            <>
              <text
                x="450"
                y="66"
                textAnchor="middle"
                fontSize="25"
                style={{ fill: "#fff0cb" }}
              >
                きみの うちゅうの えにっき
              </text>
              {visited.length ? (
                visited.map((p, i) => (
                  <g
                    key={p}
                    transform={`translate(${95 + i * 240} 100) scale(.8)`}
                  >
                    <PlanetDrawing kind={p} visited />
                  </g>
                ))
              ) : (
                <g transform="translate(300 80)">
                  <ShipDrawing />
                </g>
              )}
              <text
                x="450"
                y="365"
                textAnchor="middle"
                fontSize="18"
                style={{ fill: "#f5e8d4" }}
              >
                {found.length
                  ? `おほしさま ${found.length}こも みつけたね！`
                  : "おさんぽ たのしかったね！"}
              </text>
            </>
          ) : (
            <g transform={`translate(${-camera.x} ${-camera.y})`}>
              {stars.map(
                ([x, y], i) =>
                  !found.includes(i) && (
                    <g key={i} transform={`translate(${x} ${y}) scale(.55)`}>
                      <Star fill="#f9dd84" />
                    </g>
                  ),
              )}
              {planets.map((p, i) => (
                <g
                  key={i}
                  transform={`translate(${p.x - 130} ${p.y - 115}) scale(.9)`}
                >
                  <g className={encounter === i ? "celebrate-art" : ""}>
                    <PlanetDrawing kind={i} visited={visited.includes(i)} />
                  </g>
                  <text
                    x="150"
                    y="245"
                    textAnchor="middle"
                    fontSize="16"
                    style={{ fill: "#f5ebdc" }}
                  >
                    {p.name}
                    {visited.includes(i) ? " ✓" : ""}
                  </text>
                </g>
              ))}
              <g transform={`translate(${pos.x - 74} ${pos.y - 64}) scale(.5)`}>
                <ShipDrawing />
              </g>
              {encounter !== null && (
                <g transform={`translate(${pos.x + 70} ${pos.y - 80})`}>
                  <path
                    d="M0 0h128q18 0 18 18v42q0 18-18 18H15L0 95V78q-18 0-18-18V18Q-18 0 0 0Z"
                    fill="#fff5df"
                  />
                  <text x="64" y="46" fontSize="18" textAnchor="middle">
                    こんにちは！
                  </text>
                </g>
              )}
            </g>
          )}
          {signal && (
            <>
              <path
                d="m770 190 45 20-45 20"
                stroke="#ffdc85"
                strokeWidth="9"
                fill="none"
              />
              <text
                x="450"
                y="385"
                textAnchor="middle"
                fontSize="17"
                style={{ fill: "#fff1c9" }}
              >
                ほしの えを おすと、そこまで とんでいくよ。
              </text>
            </>
          )}
        </StageSvg>
      </Stage>
      <Hint>{hint}</Hint>
      <div className="control-deck">
        {journal ? (
          <>
            <Control label="また おさんぽ" onClick={() => setJournal(false)} />
            <Primary keyName="Enter" onClick={finish}>
              ただいま！
            </Primary>
          </>
        ) : (
          <>
            {planets.map((p, i) => (
              <Control
                key={p.name}
                label={p.name}
                keyName={String(i + 1)}
                active={auto === i}
                disabled={encounter !== null}
                onClick={() => fly(i)}
              >
                <SvgPicture>
                  <PlanetDrawing kind={i} visited={visited.includes(i)} />
                </SvgPicture>
              </Control>
            ))}
            <Primary onClick={greet} disabled={encounter !== null}>
              ごあいさつ
            </Primary>
            <Control label="かえる" keyName="Enter" onClick={returnHome} />
            <span className="key-guide">
              <kbd>↑</kbd>
              <kbd>←</kbd>
              <kbd>↓</kbd>
              <kbd>→</kbd>で おさんぽ
            </span>
          </>
        )}
      </div>
    </>
  );
}
