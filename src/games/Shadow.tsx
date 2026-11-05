import { useState } from "react";
import { AnimalDrawing, ObjectDrawing, PlantDrawing, Star } from "../Art";
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
import { makeQuestions, SHADOW_OBJECTS } from "../logic.mjs";
const objects = [
  "かさ",
  "ぼうし",
  "スプーン",
  "じょうろ",
  "かぎ",
  "ベル",
  "ラッパ",
  "ほしの つえ",
  "ボール",
  "めがね",
  "てぶくろ",
  "たいこ",
];
const stories = [
  "あめの おと、ぽつん ぽつん！",
  "かぜに のって、ぼうしで ポーズ！",
  "あまい プリン、いただきます！",
  "おはなが ひらいたよ！",
  "おうちの あかりが ついたよ！",
  "ベルを ならして、おみせを あけよう！",
  "すてきな おとが ひびくよ！",
  "どんぐりが おほしさまに！",
  "くるくる、ボールの サーカス！",
  "えほんの おはなが うごいたよ！",
  "ゆきだるまを つくったよ！",
  "はっぱも いっしょに ダンス！",
];
export function ShadowGame() {
  const [questions] = useState(() => makeQuestions(true)),
    [index, setIndex] = useState(0),
    [phase, setPhase] = useState("question"),
    [hint, setHint] = useState(0),
    [elapsed, setElapsed] = useState(0),
    [solved, setSolved] = useState<number[]>([]),
    [reaction, setReaction] = useState(-1);
  const { finish } = usePlay();
  const q = questions[Math.min(index, 4)],
    target = q.target!;
  const text =
    phase === "question"
      ? "おなじ かたちは どれかな？"
      : phase === "wrong"
        ? "かたちを みてみよう。ゆっくりで いいよ。"
        : phase === "story"
          ? stories[target]
          : "みんなに とどいたね！ ありがとう！";
  useAnnounce(text);
  const choose = (i: number) => {
    if (phase !== "question" || q.options[i] === undefined) return;
    if (q.options[i] === target) {
      audio.sound("success");
      setSolved([...solved, target]);
      setPhase("story");
      setElapsed(0);
    } else {
      audio.sound("soft");
      setPhase("wrong");
      setElapsed(0);
      setHint((h) => Math.min(3, h + 1));
    }
  };
  const next = () => {
    if (index === 4) {
      setPhase("complete");
    } else {
      setIndex((i) => i + 1);
      setHint(0);
      setPhase("question");
    }
    setElapsed(0);
  };
  useTick((dt) => {
    if (phase === "wrong" || phase === "story") {
      setElapsed((t) => t + dt);
      if (phase === "wrong" && elapsed >= 0.65) setPhase("question");
      if (phase === "story" && elapsed >= 5) next();
    }
  });
  useKeys((k) => {
    if (phase === "question") {
      if (/^[1-3]$/.test(k)) choose(Number(k) - 1);
      if (k === "Space") setHint((h) => Math.min(3, h + 1));
    }
    if (phase === "story" && k === "Enter" && elapsed > 2) next();
    if (phase === "complete") {
      if (k === "Enter") finish();
      if (/^[1-5]$/.test(k)) {
        setReaction(Number(k) - 1);
        audio.sound("pop");
      }
    }
  });
  return (
    <>
      <Stage label="どうぶつの忘れ物を探すお店" className="shadow-stage">
        <Progress total={5} current={solved.length} />
        {phase === "question" || phase === "wrong" ? (
          <div className="shadow-layout">
            <div className="shadow-guest">
              <svg viewBox="0 0 300 240" aria-hidden="true">
                <AnimalDrawing kind={target === 0 ? 4 : target % 12} />
              </svg>
            </div>
            <div
              className={`shadow-target ${phase === "wrong" ? "object-wiggle" : ""}`}
            >
              <svg
                viewBox="0 0 300 240"
                className="shadow-silhouette"
                aria-label="忘れ物の影"
              >
                <ObjectDrawing kind={SHADOW_OBJECTS[target]} />
              </svg>
              {hint >= 1 && (
                <svg viewBox="0 0 300 240" className="shadow-outline">
                  <ObjectDrawing kind={SHADOW_OBJECTS[target]} />
                </svg>
              )}
              {hint >= 2 && (
                <svg
                  viewBox="0 0 300 240"
                  style={{ opacity: hint === 2 ? 0.35 : 0.85 }}
                >
                  <ObjectDrawing kind={SHADOW_OBJECTS[target]} />
                </svg>
              )}
              <span className="pot-label">この かたち！</span>
            </div>
          </div>
        ) : (
          <StageSvg label={text}>
            <path d="M0 0H900V420H0Z" fill="#fff0d4" />
            <path d="M0 0H900V40H0Z" fill="#efb7ad" />
            {Array.from({ length: 9 }, (_, i) => (
              <path
                key={i}
                d={`M${i * 100} 0h50v43q-25 24-50 0Z`}
                fill="#fff3df"
              />
            ))}
            <path d="M0 330H900V420H0Z" fill="#decaa7" />
            {phase === "complete" ? (
              <>
                {solved.map((t, i) => (
                  <g
                    key={t}
                    transform={`translate(${10 + i * 177} 127) scale(.58)`}
                  >
                    <g
                      className={reaction === i ? "celebrate-art" : ""}
                      key={`${i}-${reaction}`}
                    >
                      <AnimalDrawing kind={t === 0 ? 4 : t % 12} />
                      <g transform="translate(170 89) scale(.42)">
                        <ObjectDrawing kind={SHADOW_OBJECTS[t]} />
                      </g>
                    </g>
                  </g>
                ))}
                <text x="450" y="95" textAnchor="middle" fontSize="25">
                  ありがとう！
                </text>
              </>
            ) : (
              <>
                <g transform="translate(170 84) scale(1.1)">
                  <g className="gentle-float">
                    <AnimalDrawing kind={target === 0 ? 4 : target % 12} />
                  </g>
                </g>
                <g
                  transform={`translate(${target === 8 ? 470 + Math.sin(elapsed * 3) * 20 : 460} ${target === 1 ? 18 + Math.sin(elapsed * 2) * 20 : 70}) scale(.92)`}
                >
                  <g
                    className={
                      target === 11 ? "playing-instrument" : "gentle-float"
                    }
                  >
                    <ObjectDrawing kind={SHADOW_OBJECTS[target]} />
                  </g>
                </g>
                {target === 0 &&
                  Array.from({ length: 9 }, (_, i) => (
                    <path
                      key={i}
                      className="water-drop"
                      style={{ animationDelay: `${i * 0.09}s` }}
                      d={`M${540 + i * 23} 35v14`}
                      stroke="#86c5da"
                      strokeWidth="5"
                      strokeLinecap="round"
                    />
                  ))}
                {[3, 9].includes(target) && (
                  <g transform="translate(615 185) scale(.65)">
                    <PlantDrawing />
                  </g>
                )}
                {target === 2 && (
                  <g transform="translate(675 263)">
                    <ellipse cy="26" rx="49" ry="12" fill="#fffaf1" />
                    <path d="m-35 17 10-44h50l10 44Z" fill="#efcf7e" />
                    <path d="m-25-27 8-10h35l7 10Z" fill="#b58a68" />
                  </g>
                )}
                {target === 4 && (
                  <g transform="translate(710 159)">
                    <path d="m-48 19 48-50 48 50v119h-96Z" fill="#b9e2e7" />
                    <rect
                      x="-18"
                      y="52"
                      width="38"
                      height="64"
                      rx="8"
                      fill={elapsed > 2 ? "#ffe49c" : "#91b7c2"}
                    />
                  </g>
                )}
                {target === 10 && (
                  <g transform="translate(704 241)">
                    <circle cy="54" r="41" fill="#fff9ed" />
                    <circle r="28" fill="#fff9ed" />
                    <path d="m7-1 25 7-25 4" fill="#edb27b" />
                    <circle cx="-8" cy="-3" r="3" fill="#655365" />
                  </g>
                )}
                {[5, 6, 7, 11].includes(target) &&
                  [0, 1, 2].map((i) => (
                    <g
                      key={i}
                      className="gentle-float"
                      transform={`translate(${660 + i * 50} ${100 + (i % 2) * 60}) scale(.6)`}
                    >
                      <Star fill={i % 2 ? "#b7a5db" : "#ffdb7c"} />
                    </g>
                  ))}
              </>
            )}
          </StageSvg>
        )}
      </Stage>
      <Hint>{text}</Hint>
      {phase === "question" || phase === "wrong" ? (
        <div className="control-deck shadow-options">
          {q.options.map((object, i) => (
            <Control
              key={object}
              label={`${i + 1}の え`}
              keyName={String(i + 1)}
              disabled={phase !== "question"}
              onClick={() => choose(i)}
            >
              <SvgPicture>
                <ObjectDrawing kind={SHADOW_OBJECTS[object]} />
              </SvgPicture>
            </Control>
          ))}
          <Control
            label="ヒント"
            keyName="Space"
            onClick={() => setHint((h) => Math.min(3, h + 1))}
          />
        </div>
      ) : phase === "story" ? (
        <div className="control-deck">
          <span className="pill-note">{objects[target]}が みつかった！</span>
          <Primary keyName="Enter" onClick={next} disabled={elapsed < 2}>
            つぎの おきゃくさん
          </Primary>
        </div>
      ) : (
        <div className="control-deck">
          {solved.map((t, i) => (
            <Control
              key={t}
              label={`${i + 1}の なかま`}
              keyName={String(i + 1)}
              onClick={() => {
                setReaction(i);
                audio.sound("pop");
              }}
            >
              <SvgPicture>
                <AnimalDrawing kind={t === 0 ? 4 : t % 12} />
              </SvgPicture>
            </Control>
          ))}
          <Primary keyName="Enter" onClick={finish}>
            みんなに とどいた！
          </Primary>
        </div>
      )}
    </>
  );
}
