import { useRef, useEffect, useState } from "react";
import { useMashInput, MashGuide } from "../mash";
import type { MashHit } from "../mash";
import { paintColors, keyInfo } from "../mashLogic.mjs";
import { MashAudio } from "../mashAudio";
import { useAnnounce, useTick } from "../play";
import { audio } from "../audio";
const W = 900,
  H = 420;
function stamp(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  shape: number,
  angle: number,
) {
  c.save();
  c.translate(x, y);
  c.rotate(angle);
  c.fillStyle = color;
  c.strokeStyle = "#fff9eb";
  c.lineWidth = 4;
  c.beginPath();
  if (shape % 4 === 0) c.arc(0, 0, size, 0, Math.PI * 2);
  else if (shape % 4 === 1) {
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI) / 5 - Math.PI / 2,
        r = i % 2 ? size * 0.48 : size;
      c.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
  } else if (shape % 4 === 2) {
    for (let i = 0; i < 24; i++) {
      const a = (i * Math.PI) / 12,
        r = size * (i % 2 ? 0.55 : 1);
      c.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
  } else {
    c.lineWidth = size * 0.4;
    c.strokeStyle = color;
    for (let i = 0; i < 60; i++) {
      const a = i * 0.2,
        r = (size * i) / 60;
      c.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    c.stroke();
    c.restore();
    return;
  }
  c.closePath();
  c.fill();
  c.stroke();
  c.restore();
}
export function RainbowPaintGame() {
  const canvas = useRef<HTMLCanvasElement>(null),
    previous = useRef<HTMLCanvasElement | null>(null),
    sound = useRef(new MashAudio());
  const count = useRef(0),
    clock = useRef(0),
    nextHold = useRef(0),
    lastGuest = useRef(-12),
    lastInput = useRef(-10),
    guestNo = useRef(0);
  const [hasPrevious, setHasPrevious] = useState(false),
    [paper, setPaper] = useState(1),
    [guest, setGuest] = useState<{
      url: string;
      kind: number;
      end: number;
    } | null>(null),
    [pulse, setPulse] = useState(0);
  const [marks, setMarks] = useState(0);
  const strokes = useRef(
    new Map<string, { x: number; y: number; angle: number }>(),
  );
  const ctx = () => canvas.current?.getContext("2d");
  useEffect(() => {
    const c = ctx();
    if (c) {
      c.fillStyle = "#fffdf7";
      c.fillRect(0, 0, W, H);
    }
    return () => {
      sound.current.stop();
      previous.current = null;
    };
  }, []);
  useAnnounce("どこを おしても ぺんきがでるよ");
  const draw = (e: MashHit, point?: { x: number; y: number }) => {
    const c = ctx();
    if (!c) return;
    const n = count.current++;
    const x =
        point?.x ?? Math.max(45, Math.min(855, e.x + Math.sin(n * 2.4) * 65)),
      y = point?.y ?? Math.max(45, Math.min(375, e.y + Math.cos(n * 1.7) * 45));
    stamp(
      c,
      x,
      y,
      e.energetic ? 36 : 28,
      paintColors[e.color],
      e.index % 4,
      n * 0.7,
    );
    if (e.energetic)
      for (let j = 0; j < 4; j++)
        stamp(
          c,
          x + Math.cos(j * 2 + n) * 50,
          y + Math.sin(j * 2 + n) * 50,
          7,
          paintColors[(e.color + j) % 6],
          0,
          0,
        );
    if (e.burst) {
      for (let j = 0; j < 3; j++)
        stamp(c, 390 + j * 65, 210, 65, paintColors[(e.color + j) % 6], 2, j);
      setPulse(clock.current + 0.35);
    }
    strokes.current.set(e.code, { x, y, angle: n * 0.7 });
    if (strokes.current.size > 3)
      strokes.current.delete(strokes.current.keys().next().value!);
    setMarks(count.current);
    sound.current.play(0, e.index, 0.1);
    lastInput.current = clock.current;
  };
  const input = useMashInput(
    (e) => draw(e),
    (held) => {
      if (clock.current < nextHold.current || !held.length) return;
      const c = ctx();
      if (!c) return;
      nextHold.current = clock.current + (audio.settings.motion ? 0.1 : 1 / 3);
      held.slice(0, 3).forEach((code) => {
        const k = keyInfo(code)!;
        let s = strokes.current.get(code);
        if (!s) {
          s = { x: k.x, y: k.y, angle: k.index };
          strokes.current.set(code, s);
        }
        s.angle += 0.17;
        let x = s.x + Math.cos(s.angle) * 19,
          y = s.y + Math.sin(s.angle) * 19;
        if (x < 30 || x > 870 || y < 30 || y > 390) {
          s.angle += Math.PI * 0.65;
          x = Math.max(30, Math.min(870, x));
          y = Math.max(30, Math.min(390, y));
        }
        if (audio.settings.motion) {
          c.beginPath();
          c.moveTo(s.x, s.y);
          c.lineTo(x, y);
          c.strokeStyle = paintColors[k.color];
          c.lineWidth = 22;
          c.lineCap = "round";
          c.stroke();
        } else stamp(c, x, y, 17, paintColors[k.color], k.index, 0);
        s.x = x;
        s.y = y;
        count.current++;
      });
      setMarks(count.current);
      sound.current.play(2, held.length, 0.08);
      lastInput.current = clock.current;
    },
    () => {
      strokes.current.clear();
      sound.current.stop();
    },
  );
  useTick((dt) => {
    clock.current += dt;
    if (guest && clock.current > guest.end) setGuest(null);
    if (
      count.current >= 12 &&
      clock.current >= 8 &&
      clock.current - lastGuest.current >= 20 &&
      clock.current - lastInput.current < 3 &&
      !guest
    ) {
      const c = canvas.current;
      if (c) {
        const thumb = document.createElement("canvas");
        thumb.width = 240;
        thumb.height = 112;
        thumb.getContext("2d")?.drawImage(c, 0, 0, 240, 112);
        setGuest({
          url: thumb.toDataURL(),
          kind: guestNo.current++ % 2,
          end: clock.current + 5,
        });
        lastGuest.current = clock.current;
      }
    }
  });
  const changePaper = (restore = false) => {
    const c = ctx();
    if (!c || !canvas.current) return;
    input.reset();
    const copy = document.createElement("canvas");
    copy.width = W;
    copy.height = H;
    copy.getContext("2d")?.drawImage(canvas.current, 0, 0);
    c.fillStyle = "#fffdf7";
    c.fillRect(0, 0, W, H);
    if (restore && previous.current) c.drawImage(previous.current, 0, 0);
    previous.current = copy;
    setHasPrevious(true);
    setPaper((p) => p + 1);
    input.stage.current?.focus();
  };
  return (
    <div className="mash-game paint-game">
      <div className="paint-toolbar">
        <span>いろが まざる、かたちが うまれる。</span>
        <div>
          <button onClick={() => changePaper(true)} disabled={!hasPrevious}>
            ▧ まえの かみ
          </button>
          <button onClick={() => changePaper()}>＋ まっさら</button>
        </div>
      </div>
      <div
        ref={input.stage}
        {...input.stageProps}
        className={`mash-stage paint-stage ${pulse > clock.current ? "paint-splash" : ""}`}
        aria-label="にじいろペンキの紙。好きなキーで描く"
        data-marks={marks}
        data-paper={paper}
      >
        <canvas
          ref={canvas}
          width={W}
          height={H}
          aria-label="キーで描いたにじいろの絵"
          {...input.pad("KeyA")}
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            e.preventDefault();
            input.stage.current?.focus();
            e.currentTarget.setPointerCapture?.(e.pointerId);
            const r = e.currentTarget.getBoundingClientRect();
            const info = input.input.current.press(
              `pointer:${e.pointerId}`,
              "KeyA",
              performance.now(),
            );
            if (info)
              draw(info, {
                x: ((e.clientX - r.left) * W) / r.width,
                y: ((e.clientY - r.top) * H) / r.height,
              });
          }}
        />
        {marks === 0 && (
          <div className="paint-invitation" aria-hidden="true">
            <span>✺</span>なにいろが でるかな？
          </div>
        )}
      </div>
      <div className="paint-parade" aria-label="模様をもらうお客さん">
        {guest ? (
          <div className={`paint-guest guest-${guest.kind}`}>
            <span
              className="guest-body"
              style={{ backgroundImage: `url(${guest.url})` }}
            >
              <i>• •</i>
              {guest.kind === 0 ? (
                <>
                  <b className="wheel left" />
                  <b className="wheel right" />
                </>
              ) : (
                <>
                  <b className="dino-neck" />
                  <b className="dino-tail" />
                  <b className="dino-leg left" />
                  <b className="dino-leg right" />
                </>
              )}
            </span>
            <strong>すてきな もよう、ありがとう！</strong>
          </div>
        ) : (
          <span>きみの もようを、だれかが もらいに くるよ。</span>
        )}
      </div>
      <MashGuide>べちゃっ！ おしっぱなしで にょろにょろ。</MashGuide>
      <div className="mash-pads">
        {["まる", "ほし", "しぶき", "うずまき"].map((n, i) => (
          <button
            key={n}
            {...input.pad(["KeyA", "KeyS", "KeyD", "KeyF"][i])}
            style={{ "--pad": paintColors[i] } as React.CSSProperties}
          >
            <span aria-hidden="true">{["●", "★", "✺", "◎"][i]}</span>
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
