import { useEffect, useState } from "react";
import { AnimalDrawing, ObjectDrawing, Star } from "../Art";
import { usePlay, useTick, useKeys, useAnnounce } from "../play";
import { Control, Primary, Hint, Stage, StageSvg, SvgPicture } from "../ui";
import { audio } from "../audio";
const names = [
  "ゾウの たいこ",
  "クマの ベース",
  "サルの ギター",
  "ペンギンの ラッパ",
  "ウサギの ベル",
];
export function BandGame() {
  const [members, setMembers] = useState<number[]>([]),
    [parade, setParade] = useState(false),
    [elapsed, setElapsed] = useState(0),
    [jump, setJump] = useState(0);
  const { finish, started, paused } = usePlay();
  useAnnounce(
    parade
      ? "きみの バンドの パレードだよ！"
      : "どうぶつの キーを おしてみよう！",
  );
  useEffect(() => {
    if (started && !paused) audio.band(members);
    else audio.activeBand = [];
    return () => {
      audio.activeBand = [];
    };
  }, [members, started, paused]);
  useTick((dt) => {
    if (parade) {
      setElapsed((t) => t + dt);
      if (elapsed >= 12) finish();
    }
  });
  const toggle = (i: number) => {
    if (parade) return;
    audio.sound("soft");
    setMembers((m) => (m.includes(i) ? m.filter((x) => x !== i) : [...m, i]));
  };
  const accent = () => {
    if (jump > Date.now() - 650) return;
    setJump(Date.now());
    audio.sound("jump");
  };
  const go = () => {
    if (!parade) {
      setParade(true);
      setElapsed(0);
      audio.sound("success");
    }
  };
  useKeys((k) => {
    if (/^[1-5]$/.test(k)) toggle(Number(k) - 1);
    if (k === "Space") accent();
    if (k === "Enter") go();
  });
  return (
    <>
      <Stage label="5頭のどうぶつが演奏するステージ" className="band-stage">
        <StageSvg
          label={
            parade ? "どうぶつバンドのパレード" : "動物を呼んでバンドを作ろう"
          }
        >
          <path d="M0 0H900V420H0Z" fill="#e9e1f7" />
          <path
            d="M0 0h70v245Q17 215 0 264m900-264h-70v245q53-30 70 19"
            fill="#c7b1e2"
          />
          <path d="M0 320H900V420H0Z" fill="#cdb29e" />
          <path d="M0 332H900m-900 45H900" stroke="#b69b89" strokeWidth="3" />
          {Array.from({ length: 11 }, (_, i) => (
            <g key={i} transform={`translate(${35 + i * 83} 34) scale(.3)`}>
              <Star fill={i % 2 ? "#fff3bf" : "#f4bdc9"} />
            </g>
          ))}
          {names.map((_, i) => (
            <g
              key={i}
              transform={`translate(${5 + i * 176 + (parade ? Math.sin(elapsed * 0.8) * 12 : 0)} ${65 + (jump > Date.now() - 450 ? -12 : 0)}) scale(.6)`}
              opacity={members.includes(i) ? 1 : 0.45}
            >
              <AnimalDrawing kind={i} playing={members.includes(i)} />
              <g
                transform="translate(95 129) scale(.42)"
                className={members.includes(i) ? "playing-instrument" : ""}
              >
                <ObjectDrawing
                  kind={
                    i === 0
                      ? "drum"
                      : i === 3
                        ? "trumpet"
                        : i === 4
                          ? "bell"
                          : i === 1
                            ? "bass"
                            : "guitar"
                  }
                />
              </g>
              <text x="150" y="277" textAnchor="middle" fontSize="19">
                {members.includes(i) ? "えんそうちゅう" : "おやすみ"}
              </text>
            </g>
          ))}
          {(members.length >= 3 || parade) &&
            [85, 245, 405, 565, 725].map((x, i) => (
              <g key={i} transform={`translate(${x} 357) scale(.22)`}>
                <AnimalDrawing kind={i + 4} playing />
              </g>
            ))}
          {parade && (
            <>
              <path
                d="M327 55h246v53H327Z"
                fill="#fff0c7"
                stroke="#baa1c3"
                strokeWidth="2"
              />
              <text x="450" y="89" textAnchor="middle" fontSize="20">
                きみの バンド！
              </text>
            </>
          )}
        </StageSvg>
        <div className="float-card">
          {members.length
            ? `${members.length}にんの おんがく！`
            : "ひとりから はじめよう"}
        </div>
      </Stage>
      <Hint>
        {parade
          ? "みんなが きみの おんがくを きいているよ！"
          : "おすと なかまに。もういちどで ひとやすみ。"}
      </Hint>
      <div className="control-deck">
        {names.map((n, i) => (
          <Control
            key={n}
            label={n}
            keyName={String(i + 1)}
            active={members.includes(i)}
            disabled={parade}
            onClick={() => toggle(i)}
          >
            <SvgPicture>
              <AnimalDrawing kind={i} />
            </SvgPicture>
          </Control>
        ))}
        <Control label="ジャンプ！" keyName="Space" onClick={accent} />
        <Primary keyName="Enter" onClick={go} disabled={parade}>
          {parade ? "パレードちゅう" : "パレード！"}
        </Primary>
      </div>
    </>
  );
}
