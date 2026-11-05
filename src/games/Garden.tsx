import { useState } from "react";
import { PlantDrawing, ObjectDrawing, Star } from "../Art";
import { usePlay, useTick, useKeys, useAnnounce } from "../play";
import {
  Control,
  Primary,
  Hint,
  Stage,
  StageSvg,
  SvgPicture,
  Undo,
  Progress,
} from "../ui";
import { audio } from "../audio";
import { gardenVariant } from "../logic.mjs";
type Plant = { seed: number; care: string[] };
const seedNames = ["おはな", "き", "きのこ"];
const careNames = ["おみず", "おひさま", "まほう"];
const kinds = ["water", "sun", "magic"];
export function GardenGame() {
  const [pots, setPots] = useState<(Plant | null)[]>([null, null, null]),
    [selected, setSelected] = useState(0),
    [phase, setPhase] = useState("garden"),
    [elapsed, setElapsed] = useState(0),
    [reaction, setReaction] = useState(0),
    [confirm, setConfirm] = useState(false);
  const { finish } = usePlay();
  const plant = pots[selected];
  const growing = phase === "growing";
  const count = pots.filter((p) => p && p.care.length === 3).length;
  const hint =
    phase === "seed"
      ? "どんな たねを うえよう？"
      : phase === "care"
        ? "どれを あげる？ そだちかたが かわるよ。"
        : growing
          ? "むくむく… おおきくなあれ！"
          : phase === "celebrate"
            ? "きみの おにわに、なかまが きたよ！"
            : plant?.care.length === 3
              ? "そだったね！ スペースで あそんでみよう。"
              : "はちを えらんで、たねを うえよう！";
  useAnnounce(hint);
  const choosePot = (i: number) => {
    if (growing || phase === "celebrate") return;
    setSelected(i);
    setConfirm(false);
    const p = pots[i];
    setPhase(!p ? "seed" : p.care.length < 3 ? "care" : "garden");
    audio.sound("soft");
  };
  const seed = (i: number) => {
    const next = [...pots];
    next[selected] = { seed: i, care: [] };
    setPots(next);
    setPhase("care");
    audio.sound("pop");
  };
  const care = (i: number) => {
    if (phase !== "care" || !plant || plant.care.length >= 3) return;
    const next = [...pots];
    next[selected] = { ...plant, care: [...plant.care, kinds[i]] };
    setPots(next);
    setPhase("growing");
    setElapsed(0);
    audio.sound(i === 0 ? "water" : i === 1 ? "bell" : "magic");
  };
  const undo = () => {
    if (!plant?.care.length || growing) return;
    const next = [...pots];
    next[selected] = { ...plant, care: plant.care.slice(0, -1) };
    setPots(next);
    setPhase("care");
    audio.sound("soft");
  };
  const action = () => {
    if (!plant) {
      setPhase("seed");
    } else if (plant.care.length === 3) {
      setReaction(Date.now());
      audio.sound(plant.care.includes("magic") ? "magic" : "water");
    } else if (!growing) setPhase("care");
  };
  const celebrate = () => {
    if (count > 0 && !growing) {
      setPhase("celebrate");
      setElapsed(0);
      audio.sound("success");
    }
  };
  useTick((dt) => {
    if (growing || phase === "celebrate") {
      setElapsed((t) => t + dt);
      if (growing && elapsed >= 1.9)
        setPhase(plant?.care.length === 3 ? "garden" : "care");
      if (phase === "celebrate" && elapsed >= 5) finish();
    }
  });
  useKeys((k) => {
    if (growing || phase === "celebrate") return;
    if (k === "ArrowLeft") choosePot((selected + 2) % 3);
    if (k === "ArrowRight") choosePot((selected + 1) % 3);
    if (/^[1-3]$/.test(k)) {
      if (phase === "seed") seed(Number(k) - 1);
      else if (phase === "care") care(Number(k) - 1);
    }
    if (k === "Space") action();
    if (k === "Enter") celebrate();
    if (k === "Backspace") undo();
  });
  return (
    <>
      <Stage className="garden-stage" label="3つの鉢で植物を育てる庭">
        <Progress total={3} current={count} />
        <div className="plant-pots">
          {pots.map((p, i) => (
            <button
              key={i}
              className={`pot-button ${selected === i ? "selected" : ""}`}
              disabled={growing || phase === "celebrate"}
              aria-label={`${i + 1}ばんの はち${p ? ` ${seedNames[p.seed]}` : " からっぽ"}`}
              onClick={() => choosePot(i)}
            >
              <svg viewBox="0 0 300 240" aria-hidden="true">
                <g
                  className={
                    reaction > Date.now() - 1000 && selected === i
                      ? "celebrate-art"
                      : ""
                  }
                  key={selected === i ? reaction : 0}
                >
                  <PlantDrawing
                    seed={p?.seed || 0}
                    stage={
                      p
                        ? Math.min(
                            3,
                            p.care.length + (p.care.length === 0 ? 1 : 0),
                          )
                        : 0
                    }
                    variant={
                      p && p.care.length === 3
                        ? gardenVariant(p.care)
                        : p?.care.at(-1) || "sun"
                    }
                  />
                </g>
                {growing && selected === i && (
                  <g className="gentle-float" transform="translate(240 60)">
                    <Star fill="#ffdf85" />
                  </g>
                )}
                {phase === "celebrate" && p?.care.length === 3 && (
                  <g className="gentle-float">
                    <path
                      d="M72 41q-24-24-24 0t24 0q24-24 24 0t-24 0"
                      fill={i === 1 ? "#a1cde0" : "#f3b2c6"}
                    />
                    <path d="M72 30v23" stroke="#9b7c90" strokeWidth="3" />
                  </g>
                )}
              </svg>
              <span className="pot-label">
                {p
                  ? `${seedNames[p.seed]} ${p.care.map((c) => (c === "water" ? "●" : c === "sun" ? "☀" : "✦")).join(" ")}`
                  : "たねを うえよう"}
              </span>
            </button>
          ))}
        </div>
        {plant && plant.care.length === 3 && phase !== "celebrate" && (
          <div className="inline-tools">
            <Undo onClick={undo} />
            <Undo
              label={confirm ? "このはちを うえなおす？" : "うえなおす"}
              onClick={() => {
                if (!confirm) {
                  setConfirm(true);
                  return;
                }
                const next = [...pots];
                next[selected] = null;
                setPots(next);
                setPhase("seed");
                setConfirm(false);
              }}
            />
          </div>
        )}
      </Stage>
      <Hint>{hint}</Hint>
      <div className="control-deck">
        {phase === "seed" ? (
          seedNames.map((n, i) => (
            <Control
              key={n}
              label={n + "の たね"}
              keyName={String(i + 1)}
              onClick={() => seed(i)}
            >
              <SvgPicture>
                <PlantDrawing seed={i} variant="sun" />
              </SvgPicture>
            </Control>
          ))
        ) : phase === "care" || growing ? (
          <>
            {careNames.map((n, i) => (
              <Control
                key={n}
                label={n}
                keyName={String(i + 1)}
                disabled={growing}
                onClick={() => care(i)}
              >
                <SvgPicture>
                  {i === 0 ? (
                    <ObjectDrawing kind="watering" />
                  ) : (
                    <g transform="translate(150 120) scale(3)">
                      <Star fill={i === 1 ? "#ffdb75" : "#bfa0e5"} />
                    </g>
                  )}
                </SvgPicture>
              </Control>
            ))}
            <Undo onClick={undo} disabled={growing || !plant?.care.length} />
          </>
        ) : phase === "celebrate" ? (
          <Primary disabled onClick={() => {}}>
            おにわの おひろめ
          </Primary>
        ) : (
          <>
            <Control
              label="まえの はち"
              keyName="←"
              onClick={() => choosePot((selected + 2) % 3)}
            />
            <Primary onClick={action}>
              {plant ? "いっしょに あそぶ" : "たねを うえる"}
            </Primary>
            <Control
              label="つぎの はち"
              keyName="→"
              onClick={() => choosePot((selected + 1) % 3)}
            />
            <Primary keyName="Enter" onClick={celebrate} disabled={!count}>
              おひろめ！
            </Primary>
          </>
        )}
      </div>
    </>
  );
}
