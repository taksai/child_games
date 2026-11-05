import { useState } from "react";
import { FishDrawing, Star } from "../Art";
import { usePlay, useTick, useKeys, useAnnounce } from "../play";
import { Control, Primary, Hint, Stage, StageSvg, Progress } from "../ui";
import { audio } from "../audio";
import { makeCatchBag } from "../logic.mjs";
export function FishingGame() {
  const [bag] = useState(() => makeCatchBag()),
    [caught, setCaught] = useState<number[]>([]),
    [phase, setPhase] = useState("idle"),
    [elapsed, setElapsed] = useState(0),
    [styles, setStyles] = useState([0, 0, 0]),
    [bubbles, setBubbles] = useState(0);
  const { finish } = usePlay();
  const aquarium = phase === "aquarium";
  const hint = aquarium
    ? "きみの すいそう！ スペースで あわを だそう。"
    : phase === "waiting"
      ? "ぷかぷか… うきが おおきく しずむまで まとう。"
      : phase === "bite"
        ? "いまだよ！ スペースで ひいてみよう！"
        : phase === "reveal"
          ? caught.at(-1) === 6
            ? "ながぐつが はなの はちに なったよ！"
            : caught.at(-1) === 7
              ? "たからばこ！ おさかなの おうちに しよう。"
              : "つれたね！ すいそうに ごしょうたい。"
          : "スペースで つりいとを なげよう！";
  useAnnounce(hint);
  const action = () => {
    if (aquarium) {
      setBubbles((b) => b + 1);
      audio.sound("water");
      return;
    }
    if (phase === "idle" && caught.length < 8) {
      setPhase("waiting");
      setElapsed(0);
      audio.sound("water");
    } else if (phase === "bite") {
      setCaught([...caught, bag[caught.length]]);
      setPhase("reveal");
      setElapsed(0);
      audio.sound("success");
    } else if (phase === "reveal" && elapsed > 1.5) {
      setPhase(caught.length === 8 ? "aquarium" : "idle");
      setElapsed(0);
    } else if (phase === "waiting") audio.sound("soft");
  };
  const tank = () => {
    setPhase("aquarium");
    setElapsed(0);
    audio.sound("soft");
  };
  useTick((dt) => {
    if (["waiting", "bite", "reveal"].includes(phase)) {
      setElapsed((t) => t + dt);
      if (phase === "waiting" && elapsed > 2.3) {
        setPhase("bite");
        setElapsed(0);
        audio.sound("bell");
      }
      if (phase === "bite" && elapsed > 4) {
        setPhase("waiting");
        setElapsed(0);
      }
      if (phase === "reveal" && elapsed > 3.5) {
        setPhase(caught.length === 8 ? "aquarium" : "idle");
        setElapsed(0);
      }
    }
  });
  useKeys((k) => {
    if (k === "Space") action();
    if (k === "Enter") {
      if (aquarium) finish();
      else tank();
    }
    if (aquarium && /^[1-3]$/.test(k)) {
      const index = Number(k) - 1;
      setStyles((a) => a.map((x, i) => (i === index ? (x + 1) % 3 : x)));
      audio.sound("pop");
    }
  });
  return (
    <>
      <Stage
        className={aquarium ? "aquarium-stage" : "pond-stage"}
        label={aquarium ? "釣った魚の水槽" : "浮きを見ながら魚を釣る池"}
      >
        <Progress total={8} current={caught.length} />
        <StageSvg label={hint}>
          {aquarium ? (
            <>
              <path
                d="M0 0H900V420H0Z"
                fill={["#b4e0e6", "#b9deeb", "#c8e4d4"][styles[0]]}
              />
              <path
                d="M0 337q300-33 900 0v83H0Z"
                fill={["#f0d6a8", "#e7ceb9", "#e9e0ac"][styles[0]]}
              />
              {[90, 780, 645].map((x, i) => (
                <g key={i} transform={`translate(${x} 363)`}>
                  <path
                    d={`M0 0Q${-30 + styles[1] * 15} -80 0 -150M6 0q55-80 25-111M-5 0q-55-55-35-90`}
                    fill="none"
                    stroke={["#82b6a0", "#8fb695", "#a1b481"][styles[1]]}
                    strokeWidth="15"
                    strokeLinecap="round"
                  />
                </g>
              ))}
              {caught
                .filter((i) => i < 6)
                .map((kind, i) => (
                  <g
                    key={kind}
                    transform={`translate(${80 + (i % 3) * 235} ${55 + Math.floor(i / 3) * 127}) scale(.58)`}
                  >
                    <g
                      className="fish-swim"
                      style={{ animationDelay: `-${i * 1.3}s` }}
                    >
                      <FishDrawing kind={kind} />
                    </g>
                  </g>
                ))}
              {caught.includes(6) && (
                <g
                  transform={`translate(${styles[2] === 1 ? 600 : 35} 245) scale(.57)`}
                >
                  <FishDrawing kind={6} />
                </g>
              )}
              {caught.includes(7) && (
                <g
                  transform={`translate(${styles[2] === 2 ? 280 : 555} 254) scale(.62)`}
                >
                  <FishDrawing kind={7} />
                </g>
              )}
              {!caught.includes(6) && !caught.includes(7) && (
                <ellipse cx="450" cy="352" rx="65" ry="23" fill="#b5b4a8" />
              )}
              {bubbles > 0 &&
                Array.from({ length: 12 }, (_, i) => (
                  <circle
                    key={`${bubbles}-${i}`}
                    className="bubble-rise"
                    style={{ animationDelay: `${i * 0.07}s` }}
                    cx={390 + ((i * 31) % 160)}
                    cy={315 + ((i * 13) % 60)}
                    r={6 + (i % 4) * 3}
                    stroke="#f7ffff"
                    strokeWidth="2"
                    fill="#ffffff22"
                  />
                ))}
            </>
          ) : (
            <>
              <path
                d="M0 294q400-40 900-4"
                fill="none"
                stroke="#caeef1"
                strokeWidth="6"
              />
              {[0, 1, 2].map((i) => (
                <path
                  key={i}
                  d={`M${100 + i * 260} ${170 + i * 40}q40-14 80 0`}
                  stroke="#d3f1ed"
                  strokeWidth="4"
                  fill="none"
                />
              ))}
              <path
                d="M40 389 213 48q21-36 58-19l156 48"
                fill="none"
                stroke="#a9826d"
                strokeWidth="10"
                strokeLinecap="round"
              />
              <path
                d={`M425 77Q477 114 478 ${phase === "bite" ? 278 : 229}`}
                stroke="#807680"
                strokeWidth="2"
                fill="none"
              />
              {phase !== "reveal" && (
                <g
                  transform={`translate(478 ${phase === "bite" ? 280 : 230 + Math.sin(elapsed * 3) * 4})`}
                >
                  <ellipse
                    cy="18"
                    rx="45"
                    ry="10"
                    fill="none"
                    stroke="#c9eef2"
                    strokeWidth="3"
                  />
                  <path d="M0-27V8" stroke="#8b6c7e" strokeWidth="5" />
                  <ellipse
                    cy="0"
                    rx="14"
                    ry="21"
                    fill="#f39aa5"
                    stroke="#a47382"
                    strokeWidth="2"
                  />
                  <path d="M-13 0h26" stroke="#fff1d1" strokeWidth="6" />
                </g>
              )}
              {phase === "bite" && (
                <g transform="translate(615 173)">
                  <Star />
                  <text y="57" x="0" textAnchor="middle" fontSize="22">
                    いまだよ！
                  </text>
                </g>
              )}
              {phase === "reveal" && caught.length > 0 && (
                <g transform="translate(300 50) scale(1.1)">
                  <g className="celebrate-art">
                    <FishDrawing kind={caught.at(-1)!} />
                  </g>
                </g>
              )}
              <path d="M0 356q122-27 255 0v64H0Z" fill="#d0b18b" />
              <path
                d="M5 376h230m-212 22h204"
                stroke="#b49678"
                strokeWidth="3"
              />
            </>
          )}
        </StageSvg>
        {caught.length >= 3 && !aquarium && (
          <div className="float-card">すいそうにも あいにいこう！</div>
        )}
      </Stage>
      <Hint>{hint}</Hint>
      <div className="control-deck">
        {aquarium ? (
          <>
            <Control
              label="すな"
              keyName="1"
              onClick={() => setStyles((a) => [(a[0] + 1) % 3, a[1], a[2]])}
            />
            <Control
              label="みずくさ"
              keyName="2"
              onClick={() => setStyles((a) => [a[0], (a[1] + 1) % 3, a[2]])}
            />
            <Control
              label="かざり"
              keyName="3"
              onClick={() => setStyles((a) => [a[0], a[1], (a[2] + 1) % 3])}
            />
            <Control label="あわを だす" keyName="Space" onClick={action} />
            {caught.length < 8 && (
              <Control label="もっと つる" onClick={() => setPhase("idle")} />
            )}
            <Primary keyName="Enter" onClick={finish}>
              すいそう できた！
            </Primary>
          </>
        ) : (
          <>
            <Primary
              onClick={action}
              disabled={phase === "reveal" && elapsed < 1.5}
            >
              {phase === "bite"
                ? "ひいてみる！"
                : phase === "waiting"
                  ? "うきを みてみよう"
                  : phase === "reveal"
                    ? "もういっかい"
                    : "つりいとを なげる"}
            </Primary>
            <Control label="すいそうへ" keyName="Enter" onClick={tank} />
          </>
        )}
      </div>
    </>
  );
}
