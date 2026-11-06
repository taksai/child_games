import { useEffect, useRef, useState } from "react";
import { useMashInput, MashGuide } from "../mash";
import { useAnnounce, useTick } from "../play";
import { MashAudio } from "../mashAudio";
import { audio } from "../audio";
import {
  makeTower,
  stepBlocks,
  hitBlocks,
  windForKeys,
} from "../blockSmashPhysics.mjs";
const layouts = ["つみきタワー", "ながい はし", "おもちゃの おしろ"];
export function BlockSmashGame() {
  const canvas = useRef<HTMLCanvasElement>(null),
    bodies = useRef(makeTower()),
    sound = useRef(new MashAudio()),
    clock = useRef(0),
    wind = useRef(0);
  const round = useRef(0),
    rebuild = useRef(0),
    collapsedTime = useRef(0),
    acc = useRef(0),
    lastSound = useRef(-1);
  const effects = useRef<
      { x: number; y: number; life: number; kind: number }[]
    >([]),
    hits = useRef(0);
  const [status, setStatus] = useState({
      round: 0,
      rebuilding: false,
      hits: 0,
      blocks: 18,
    }),
    [gust, setGust] = useState(false);
  useAnnounce("どこを おしても くずれるよ");
  const strike = (group: number, index: number, burst = false) => {
    hits.current++;
    const target =
      rebuild.current > 0
        ? { x: 450, y: 260 }
        : hitBlocks(bodies.current, index % 2 ? 1 : -1, burst);
    if (target)
      effects.current = [
        ...effects.current.slice(-5),
        { ...target, life: 0.28, kind: burst ? 2 : group === 4 ? 1 : 0 },
      ];
    sound.current.play(group === 4 ? 0 : 4, index, 0.12);
    setStatus({
      round: round.current,
      rebuilding: rebuild.current > 0,
      hits: hits.current,
      blocks: bodies.current.length,
    });
  };
  const input = useMashInput(
    (e) => strike(e.group, e.index, e.burst),
    (held) => {
      wind.current = windForKeys(held);
      setGust(held.length > 0);
    },
    () => {
      wind.current = 0;
      setGust(false);
      sound.current.stop();
    },
  );
  useEffect(() => () => sound.current.stop(), []);
  const draw = () => {
    const c = canvas.current?.getContext("2d");
    if (!c) return;
    c.clearRect(0, 0, 900, 420);
    c.fillStyle = "#eaf5ef";
    c.fillRect(0, 0, 900, 420);
    c.fillStyle = "#d5e8dc";
    c.beginPath();
    c.arc(125, 340, 140, Math.PI, 0);
    c.arc(775, 340, 170, Math.PI, 0);
    c.fill();
    c.fillStyle = "#cfac86";
    c.fillRect(0, 390, 900, 30);
    c.fillStyle = "#e2c9a9";
    c.fillRect(0, 384, 900, 10);
    c.fillStyle = "#bd9d7b";
    c.fillRect(0, 330, 12, 64);
    c.fillRect(888, 330, 12, 64);
    for (const b of bodies.current) {
      let x = b.x,
        y = b.y;
      if (!audio.settings.motion) {
        x = b.collapsed ? 80 + (b.id % 12) * 64 : b.ox;
        y = b.collapsed ? 370 - Math.floor(b.id / 12) * 42 : b.oy;
      }
      if (rebuild.current > 0 && audio.settings.motion) {
        const t = Math.max(0, 1 - rebuild.current / 0.8);
        x = x * (1 - t) + 450 * t;
        y = y * (1 - t) + 395 * t;
      }
      c.save();
      c.translate(x, y);
      if (audio.settings.motion && b.collapsed)
        c.rotate(Math.max(-0.2, Math.min(0.2, b.vx * 0.0008)));
      c.fillStyle = "#74574122";
      c.fillRect(-b.w / 2 + 3, -b.h / 2 + 5, b.w, b.h);
      c.fillStyle = b.color;
      c.beginPath();
      c.roundRect(-b.w / 2, -b.h / 2, b.w - 2, b.h - 2, 7);
      c.fill();
      c.strokeStyle = "#ffffffbb";
      c.lineWidth = 2;
      c.stroke();
      c.fillStyle = "#fff7";
      c.fillRect(-b.w / 2 + 9, -b.h / 2 + 7, b.w - 20, 3);
      c.restore();
    }
    for (const e of effects.current) {
      c.save();
      c.globalAlpha = e.life / 0.28;
      c.strokeStyle = e.kind === 2 ? "#a280d2" : "#ed9762";
      c.lineWidth = 6;
      c.beginPath();
      c.arc(
        e.x,
        e.y,
        (e.kind === 2 ? 70 : 25) + (1 - e.life / 0.28) * 45,
        0,
        Math.PI * 2,
      );
      c.stroke();
      if (e.kind === 1) {
        c.fillStyle = "#b197df";
        c.beginPath();
        c.roundRect(e.x - 43, e.y - 55, 86, 45, 18);
        c.fill();
        c.fillStyle = "#deb27e";
        c.fillRect(e.x - 7, e.y - 10, 14, 55);
      } else if (e.kind === 0) {
        c.fillStyle = "#ffb861";
        c.beginPath();
        c.arc(e.x, e.y, 18, 0, Math.PI * 2);
        c.fill();
        c.strokeStyle = "white";
        c.lineWidth = 3;
        c.stroke();
      }
      c.restore();
    }
    if (wind.current !== 0) {
      c.strokeStyle = "#91bcb4";
      c.lineWidth = 4;
      for (let i = 0; i < 4; i++) {
        const x = audio.settings.motion
          ? (clock.current * 100 + i * 210) % 850
          : 50 + i * 210;
        c.beginPath();
        c.moveTo(x, 90 + i * 55);
        c.bezierCurveTo(
          x + 30,
          70 + i * 55,
          x + 60,
          110 + i * 55,
          x + 100,
          80 + i * 55,
        );
        c.stroke();
      }
    }
  };
  useTick((dt) => {
    clock.current += dt;
    effects.current = effects.current
      .filter((e) => e.life > dt)
      .map((e) => ({ ...e, life: e.life - dt }));
    if (rebuild.current > 0) {
      rebuild.current -= dt;
      if (rebuild.current <= 0) {
        round.current++;
        bodies.current = makeTower(round.current);
        collapsedTime.current = 0;
        setStatus({
          round: round.current,
          rebuilding: false,
          hits: hits.current,
          blocks: bodies.current.length,
        });
      }
    } else {
      acc.current = Math.min(acc.current + dt, 4 / 60);
      while (acc.current >= 1 / 60) {
        stepBlocks(bodies.current, 1 / 60, wind.current);
        acc.current -= 1 / 60;
      }
      const fallen = bodies.current.filter((b) => b.collapsed).length;
      if (fallen >= bodies.current.length * 0.8) collapsedTime.current += dt;
      else collapsedTime.current = 0;
      if (collapsedTime.current >= 0.3) {
        rebuild.current = 0.8;
        setStatus((s) => ({ ...s, rebuilding: true }));
      }
      if (
        bodies.current.some((b) => b.collapsed && Math.abs(b.vx) > 70) &&
        clock.current - lastSound.current > 0.14
      ) {
        sound.current.play(0, 0, 0.07);
        lastSound.current = clock.current;
      }
    }
    draw();
  });
  useEffect(draw, []);
  return (
    <div className="mash-game smash-game">
      <div
        ref={input.stage}
        {...input.stageProps}
        className="mash-stage smash-stage"
        aria-label="つみきタワー。好きなキーでくずす"
        data-cycle={status.round}
        data-wind={wind.current}
        data-hits={status.hits}
        data-blocks={status.blocks}
      >
        <div className="mash-stage-label">
          <span>SMASH & AGAIN</span>
          <strong>
            {status.rebuilding
              ? "もういっかい、あつまれ！"
              : gust
                ? "びゅーっ！ かぜが ふくよ"
                : layouts[status.round % 3]}
          </strong>
        </div>
        <canvas
          ref={canvas}
          width="900"
          height="420"
          aria-label="何度でも崩せるつみき"
          {...input.pad("KeyA")}
        />
      </div>
      <MashGuide>ガラガラ、どっかーん！ また あそぼう。</MashGuide>
      <div className="mash-pads">
        {["ボール", "ハンマー", "かぜ"].map((n, i) => (
          <button
            key={n}
            {...input.pad(["KeyA", "Space", "KeyS"][i])}
            style={
              {
                "--pad": ["#ffbd69", "#baa0e8", "#85cdbc"][i],
              } as React.CSSProperties
            }
          >
            <span aria-hidden="true">{["●", "▰", "≋"][i]}</span>
            {n}
            {i === 2 && <small>ながく おしてね</small>}
          </button>
        ))}
      </div>
    </div>
  );
}
