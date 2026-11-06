import { useEffect, useRef, useState } from "react";
import { AnimalDrawing, ObjectDrawing, Star } from "../Art";
import { useMashInput, MashGuide } from "../mash";
import type { MashHit } from "../mash";
import { keyInfo, paintColors } from "../mashLogic.mjs";
import { MashAudio } from "../mashAudio";
import { audio } from "../audio";
import { useAnnounce, useTick } from "../play";
const names = ["たいこ", "ベル", "もっきん", "ラッパ", "シンバル"];
const codes = ["Digit1", "KeyQ", "KeyA", "KeyZ", "Space"];
const animals = [0, 4, 1, 3, 2];
export function ToyDrumGame() {
  const sound = useRef(new MashAudio()),
    clock = useRef(0),
    last = useRef(-10),
    beat = useRef(0),
    heldAt = useRef(0);
  const [hits, setHits] = useState([0, 0, 0, 0, 0]),
    [notes, setNotes] = useState<
      { id: number; x: number; y: number; color: string; life: number }[]
    >([]),
    [burst, setBurst] = useState(0),
    [energy, setEnergy] = useState(false);
  const serial = useRef(0);
  useAnnounce("どこを おしても おとがでるよ");
  const strike = (group: number, index: number, rich = false) => {
    last.current = clock.current;
    sound.current.play(group, index, group === 3 ? 0.24 : 0.16);
    setHits((h) => h.map((v, i) => (i === group ? clock.current + 0.22 : v)));
    setNotes((n) => [
      ...n.slice(-59),
      {
        id: serial.current++,
        x: 90 + group * 178 + ((index % 3) - 1) * 15,
        y: 110,
        color: paintColors[group],
        life: 1,
      },
    ]);
    if (rich) setEnergy(true);
  };
  const hit = (e: MashHit) => {
    strike(e.group, e.index, e.energetic);
    if (e.burst) setBurst(clock.current + 0.45);
  };
  const input = useMashInput(
    hit,
    (held) => {
      if (!held.length) {
        heldAt.current = 0;
        return;
      }
      if (clock.current >= heldAt.current) {
        held.slice(0, 2).forEach((c) => {
          const k = keyInfo(c)!;
          strike(k.group, k.index);
        });
        heldAt.current = clock.current + 1 / 6;
      }
    },
    () => {
      sound.current.stop();
      last.current = -10;
      heldAt.current = 0;
    },
  );
  useEffect(() => () => sound.current.stop(), []);
  useTick((dt) => {
    clock.current += dt;
    setNotes((n) =>
      n.filter((x) => x.life > dt).map((x) => ({ ...x, life: x.life - dt })),
    );
    if (clock.current - last.current > 0.8) setEnergy(false);
    if (clock.current - last.current < 1.5 && clock.current >= beat.current) {
      sound.current.play(2, Math.floor(clock.current / 0.625) % 5, 0.08);
      beat.current = clock.current + 0.625;
    }
  });
  const moving = audio.settings.motion;
  return (
    <div className="mash-game drum-game">
      <div
        ref={input.stage}
        {...input.stageProps}
        className="mash-stage drum-stage"
        aria-label="おもちゃドラムの舞台。好きなキーで演奏"
        data-hits={input.input.current.count}
      >
        <div className="mash-stage-label">
          <span>♪ FREE PLAY</span>
          <strong>
            {energy ? "ガシャガシャ！ おまつりだ！" : "きみの おとを ならそう"}
          </strong>
        </div>
        <svg viewBox="0 0 900 420" aria-hidden="true">
          <defs>
            <pattern
              id="drum-dots"
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="4" cy="4" r="2" fill="#e4d6f3" />
            </pattern>
          </defs>
          <rect width="900" height="420" fill="#f3edfb" />
          <rect width="900" height="420" fill="url(#drum-dots)" />
          <path d="M0 0h900v32Q450 120 0 32" fill="#d6c1ed" />
          <path d="M0 330Q450 280 900 330v90H0" fill="#e5c9ad" />
          {names.map((name, i) => {
            const active = hits[i] > clock.current;
            const jump = moving && (active || burst > clock.current) ? -12 : 0;
            return (
              <g
                key={name}
                transform={`translate(${i * 177 + 8} ${100 + jump}) scale(.56)`}
              >
                <ellipse
                  cx="150"
                  cy="300"
                  rx="130"
                  ry="22"
                  fill={paintColors[i]}
                  opacity=".3"
                />
                <AnimalDrawing kind={animals[i]} />
                <g transform="translate(76 145) scale(.5)">
                  {i === 2 ? (
                    <g>
                      <rect
                        x="0"
                        y="35"
                        width="250"
                        height="75"
                        rx="12"
                        fill="#cfa080"
                      />
                      {[0, 1, 2, 3, 4].map((k) => (
                        <rect
                          key={k}
                          x={k * 48}
                          y={k * 5}
                          width="43"
                          height={110 - k * 10}
                          rx="8"
                          fill={paintColors[k]}
                          stroke="#fff"
                          strokeWidth="3"
                        />
                      ))}
                    </g>
                  ) : i === 4 ? (
                    <g>
                      <ellipse
                        cx="130"
                        cy="70"
                        rx="115"
                        ry="40"
                        fill="#ffcf52"
                        stroke="#cc9d41"
                        strokeWidth="6"
                      />
                      <ellipse
                        cx="130"
                        cy="70"
                        rx="42"
                        ry="16"
                        fill="#ffe995"
                      />
                    </g>
                  ) : (
                    <ObjectDrawing
                      kind={i === 0 ? "drum" : i === 1 ? "bell" : "trumpet"}
                    />
                  )}
                </g>
                <text
                  x="150"
                  y="355"
                  textAnchor="middle"
                  fill="#67506c"
                  fontSize="24"
                >
                  {name}
                </text>
                {active && (
                  <circle
                    cx="150"
                    cy="145"
                    r="148"
                    fill="none"
                    stroke={paintColors[i]}
                    strokeWidth="8"
                    opacity=".5"
                  />
                )}
              </g>
            );
          })}
          {moving &&
            notes.map((n) => (
              <g
                key={n.id}
                transform={`translate(${n.x} ${n.y - (1 - n.life) * 85}) scale(${0.12 + n.life * 0.12})`}
                opacity={n.life}
              >
                <Star fill={n.color} />
              </g>
            ))}
          {burst > clock.current && (
            <text
              x="450"
              y="100"
              textAnchor="middle"
              fontSize="36"
              fill="#9f74c9"
            >
              みんなで ジャーン！
            </text>
          )}
        </svg>
      </div>
      <MashGuide>ポン！ チリン！ ガシャガシャ！</MashGuide>
      <div className="mash-pads">
        {names.map((name, i) => (
          <button
            key={name}
            {...input.pad(codes[i])}
            style={{ "--pad": paintColors[i] } as React.CSSProperties}
            aria-label={name}
          >
            <span aria-hidden="true">{["●", "✧", "▤", "♫", "◎"][i]}</span>
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
