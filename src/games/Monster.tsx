import { useState } from "react";
import { MonsterDrawing, defaultLook, Icon, Star } from "../Art";
import type { Look } from "../Art";
import { colors } from "../data";
import { usePlay, useTick, useKeys, useAnnounce } from "../play";
import { Control, Primary, Hint, Stage, StageSvg, Undo } from "../ui";
import { audio } from "../audio";
const categories: (keyof Look)[] = [
  "eyes",
  "mouth",
  "horns",
  "hair",
  "outfit",
  "pattern",
];
const names = ["め", "くち", "つの", "かみ", "ふく", "もよう"];
export function MonsterGame() {
  const [look, setLook] = useState<Look>({ ...defaultLook }),
    [history, setHistory] = useState<Look[]>([]),
    [elapsed, setElapsed] = useState(0),
    [walking, setWalking] = useState(false),
    [reaction, setReaction] = useState(0);
  const { finish } = usePlay();
  useAnnounce(
    walking
      ? "きみの モンスターの ファッションショー！"
      : "キーを おすと、へんしん！ すきな すがたに しよう。",
  );
  const change = (next: Look) => {
    if (walking) return;
    setHistory((h) => [...h.slice(-29), { ...look }]);
    setLook(next);
    audio.sound("pop");
    setReaction(Date.now());
  };
  const cycle = (i: number) =>
    change({ ...look, [categories[i]]: (look[categories[i]] + 1) % 4 });
  const undo = () => {
    if (history.length) {
      setLook(history.at(-1)!);
      setHistory((h) => h.slice(0, -1));
      audio.sound("soft");
    }
  };
  const random = () => {
    const next: Look = { ...look };
    for (const key of categories) next[key] = Math.floor(Math.random() * 4);
    next.color = (look.color + 1 + Math.floor(Math.random() * 4)) % 5;
    change(next);
  };
  const go = () => {
    if (!walking) {
      setWalking(true);
      setElapsed(0);
      audio.sound("success");
    }
  };
  useTick((dt) => {
    if (walking) {
      setElapsed((x) => x + dt);
      if (elapsed >= 11) finish();
    }
  });
  useKeys((k) => {
    if (walking) return;
    if (/^[1-6]$/.test(k)) cycle(Number(k) - 1);
    if (k === "ArrowLeft") change({ ...look, color: (look.color + 4) % 5 });
    if (k === "ArrowRight") change({ ...look, color: (look.color + 1) % 5 });
    if (k === "0") random();
    if (k === "Space") {
      setReaction(Date.now());
      audio.sound("magic");
    }
    if (k === "Enter") go();
    if (k === "Backspace") undo();
  });
  return (
    <>
      <Stage label="モンスターの着替え部屋">
        <StageSvg
          label={
            walking
              ? "選んだ姿でランウェイを歩くモンスター"
              : "キーで目や口、服を変えられるモンスター"
          }
        >
          <path d="M0 0H900V420H0Z" fill="#f9e1ec" />
          <path d="M0 325H900V420H0Z" fill="#e5c5cf" />
          {!walking ? (
            <>
              <rect
                x="240"
                y="18"
                width="420"
                height="324"
                rx="150"
                fill="#fff4ed"
                stroke="#dca9bd"
                strokeWidth="12"
              />
              <path
                d="M288 65q35-26 55-25"
                stroke="white"
                strokeWidth="14"
                strokeLinecap="round"
              />
            </>
          ) : (
            <>
              <path d="M0 283H900V420H0Z" fill="#bca0c9" />
              <path d="M280 420 368 260h168l88 160" fill="#fbe9dc" />
              {[150, 750].map((x) => (
                <g key={x} transform={`translate(${x} 75)`}>
                  <Star fill="#ffdd85" />
                </g>
              ))}
            </>
          )}
          <g
            transform={`translate(${walking ? 180 + Math.sin(elapsed * 0.65) * 140 : 240} ${walking ? 38 : 13}) scale(1.4)`}
          >
            <g
              className={
                walking
                  ? "gentle-float"
                  : reaction > Date.now() - 900
                    ? "celebrate-art"
                    : ""
              }
              style={{ transformOrigin: "150px 150px" }}
              key={reaction}
            >
              <MonsterDrawing look={look} />
            </g>
          </g>
          {walking &&
            Array.from({ length: 7 }, (_, i) => (
              <g key={i} transform={`translate(${75 + i * 125} 366) scale(.2)`}>
                <MonsterDrawing
                  look={{ ...defaultLook, color: i % 5, horns: i % 3 }}
                />
              </g>
            ))}
        </StageSvg>
        {!walking && (
          <div className="inline-tools">
            <Undo onClick={undo} disabled={!history.length} />
            <Undo
              label="はじめの すがた"
              onClick={() => change({ ...defaultLook })}
            />
          </div>
        )}
      </Stage>
      <Hint>
        {walking
          ? "どんな すがたも、とびきり すてき！"
          : "おすたび へんしん。スペースで いっしょに あそぼう！"}
      </Hint>
      <div className="control-deck">
        {names.map((n, i) => (
          <Control
            label={n}
            keyName={String(i + 1)}
            key={n}
            disabled={walking}
            onClick={() => cycle(i)}
          >
            <span style={{ fontSize: 24 }}>
              {["◉", "◡", "⋏", "〰", "▧", "✦"][i]}
            </span>
          </Control>
        ))}
        <Control
          label="いろ"
          keyName="← →"
          disabled={walking}
          onClick={() => change({ ...look, color: (look.color + 1) % 5 })}
        >
          <span
            className="color-dot"
            style={{ background: colors[look.color] }}
          />
        </Control>
        <Control
          label="おまかせ"
          keyName="0"
          disabled={walking}
          onClick={random}
        >
          <Icon name="sparkle" size={24} />
        </Control>
        <Control
          label="あそぼう"
          keyName="Space"
          disabled={walking}
          onClick={() => {
            setReaction(Date.now());
            audio.sound("magic");
          }}
        />
        <Primary keyName="Enter" onClick={go} disabled={walking}>
          {walking ? "ショーの とちゅう" : "おひろめ！"}
        </Primary>
      </div>
    </>
  );
}
