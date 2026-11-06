import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { games } from "./data";
import type { GameInfo } from "./data";
import { Icon, Illustration } from "./Art";
import { audio } from "./audio";
import { PlayContext } from "./play";
import { Confetti } from "./ui";
import { PancakeGame } from "./games/Pancake";
import { BandGame } from "./games/Band";
import { CarWashGame } from "./games/CarWash";
import { DinosaurGame } from "./games/Dinosaur";
import { MonsterGame } from "./games/Monster";
import { SpaceGame } from "./games/Space";
import { GardenGame } from "./games/Garden";
import { TownGame } from "./games/Town";
import { FishingGame } from "./games/Fishing";
import { ShadowGame } from "./games/Shadow";
import { FactoryGame } from "./games/Factory";

import { ToyDrumGame } from "./games/ToyDrum";
import { RainbowPaintGame } from "./games/RainbowPaint";
import { BlockSmashGame } from "./games/BlockSmash";
const components: Record<string, () => ReactNode> = {
  "toy-drum": ToyDrumGame,
  "rainbow-paint": RainbowPaintGame,
  "block-smash": BlockSmashGame,
  pancake: PancakeGame,
  "animal-band": BandGame,
  "car-wash": CarWashGame,
  "dinosaur-dig": DinosaurGame,
  "monster-dressup": MonsterGame,
  "space-walk": SpaceGame,
  "magic-garden": GardenGame,
  "block-town": TownGame,
  "fishing-pond": FishingGame,
  "shadow-lost-found": ShadowGame,
  "ball-factory": FactoryGame,
};
const currentPath = () =>
  location.protocol === "file:"
    ? location.hash.slice(1) || "/"
    : location.pathname;
export default function App() {
  const [path, setPath] = useState(currentPath),
    [settingsOpen, setSettingsOpen] = useState(false),
    [settings, setSettings] = useState(audio.settings),
    [paused, setPaused] = useState(false);
  const game = games.find((g) => path === `/games/${g.id}`);
  const navigate = useCallback((url: string) => {
    audio.stop();
    history.pushState({}, "", location.protocol === "file:" ? "#" + url : url);
    setPath(url);
    setPaused(false);
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    const pop = () => {
      audio.stop();
      setPath(currentPath());
      setPaused(false);
    };
    window.addEventListener("popstate", pop);
    window.addEventListener("hashchange", pop);
    return () => {
      window.removeEventListener("popstate", pop);
      window.removeEventListener("hashchange", pop);
    };
  }, []);
  useEffect(() => {
    document.title = game
      ? `${game.title} | ぽっぷ！あそびば`
      : "ぽっぷ！あそびば";
  }, [game]);
  useEffect(() => {
    audio.settings = settings;
    audio.apply();
    document.documentElement.dataset.motion = settings.motion ? "on" : "off";
    if (settings.muted && "speechSynthesis" in window) speechSynthesis.cancel();
  }, [settings]);
  useEffect(() => {
    const lose = () => {
      if (game) {
        setPaused(true);
        audio.pause();
      }
    };
    const visibility = () => {
      if (document.hidden) lose();
    };
    window.addEventListener("blur", lose);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      window.removeEventListener("blur", lose);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [game]);
  const resume = () => {
    audio.resume();
    setPaused(false);
  };
  const openSettings = () => {
    if (game) {
      setPaused(true);
      audio.pause();
    }
    setSettingsOpen(true);
  };
  return (
    <div className={`app ${game ? "in-game" : ""}`}>
      <header className="site-header">
        <a
          href="/"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
          aria-label="ぽっぷ！あそびば ホーム"
        >
          <span className="brand-mark">
            <Icon name="sparkle" size={27} />
          </span>
          <span>
            ぽっぷ<span className="brand-bang">！</span>
            <small>あそびば</small>
          </span>
        </a>
        <nav aria-label="共通メニュー">
          {game && (
            <button className="nav-button" onClick={() => navigate("/")}>
              <Icon name="home" />
              ホーム
            </button>
          )}
          <button
            className="nav-button"
            onClick={() => {
              audio.start();
              setSettings({ ...settings, muted: !settings.muted });
            }}
            aria-label={settings.muted ? "おとをつける" : "おとをけす"}
          >
            <Icon name={settings.muted ? "mute" : "sound"} />
            <span>おと</span>
          </button>
          <button
            className="nav-button"
            onClick={openSettings}
            aria-label="保護者の設定"
          >
            <Icon name="gear" />
            <span>せってい</span>
          </button>
        </nav>
      </header>
      {game ? (
        <GameShell
          key={game.id}
          game={game}
          paused={paused || settingsOpen}
          resume={resume}
          navigate={navigate}
        >
          <GameComponent id={game.id} />
        </GameShell>
      ) : (
        <Home navigate={navigate} />
      )}
      {settingsOpen && (
        <div className="modal-backdrop" data-overlay>
          <section
            className="settings-panel"
            role="dialog"
            aria-modal="true"
            aria-label="保護者の設定"
          >
            <button
              className="modal-close"
              aria-label="設定を閉じる"
              onClick={() => setSettingsOpen(false)}
            >
              <Icon name="close" />
            </button>
            <span className="eyebrow">おうちのかたへ</span>
            <h2>あそびの せってい</h2>
            <label>
              おとの おおきさ
              <input
                aria-label="音量"
                type="range"
                min="0"
                max="1"
                step=".05"
                value={settings.volume}
                onChange={(e) =>
                  setSettings({ ...settings, volume: Number(e.target.value) })
                }
              />
            </label>
            <label className="switch-label">
              こえで あんない
              <input
                type="checkbox"
                checked={settings.voice}
                onChange={(e) =>
                  setSettings({ ...settings, voice: e.target.checked })
                }
              />
            </label>
            <label className="switch-label">
              たのしい うごき
              <input
                type="checkbox"
                checked={settings.motion}
                onChange={(e) =>
                  setSettings({ ...settings, motion: e.target.checked })
                }
              />
            </label>
            <p>
              キーボードでも、えをクリックしても
              あそべます。じかんせいげんや、ゲームオーバーは ありません。
            </p>
            <button
              className="primary"
              onClick={() => {
                setSettingsOpen(false);
                resume();
              }}
            >
              これで あそぶ <Icon name="arrow" />
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
function GameComponent({ id }: { id: string }) {
  const Component = components[id];
  return <Component />;
}
function Home({ navigate }: { navigate: (url: string) => void }) {
  const [filter, setFilter] = useState("ぜんぶ");
  return (
    <main className="home-main">
      <section className="home-hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="tiny-star">✦</span> きょうは なにして あそぼう？
          </span>
          <h1>
            ちいさな「できた！」が、
            <br />
            <span>いっぱいの せかい。</span>
          </h1>
          <p>
            やいて、つくって、たんけんして。
            <br />
            きみの「やってみたい！」から はじめよう。
          </p>
          <div className="hero-note">
            <Icon name="key" size={21} />
            <span>キーボードでも、クリックでも！</span>
          </div>
        </div>
        <div className="hero-art">
          <span className="hero-spark spark-one">✦</span>
          <span className="hero-spark spark-two">✧</span>
          <div className="hero-circle" />
          <Illustration kind="pancake" />
          <span className="hero-sticker">
            きみだけの
            <br />
            できあがり！
          </span>
        </div>
      </section>
      <section className="library-section">
        <div className="section-top">
          <div>
            <span className="eyebrow">えらんで、あそぼう</span>
            <h2>
              あそびの たからばこ
              <span className="count-badge">{games.length}</span>
            </h2>
          </div>
          <span className="section-note">
            <Icon name="heart" size={17} /> じぶんの ペースで だいじょうぶ
          </span>
        </div>
        <div className="filters" role="group" aria-label="ゲームの種類">
          {[
            "ぜんぶ",
            "ガシャガシャ",
            "つくる",
            "おんがく",
            "たんけん",
            "かんがえる",
          ].map((f, i) => (
            <button
              key={f}
              className={filter === f ? "active" : ""}
              onClick={() => setFilter(f)}
            >
              <span className={`filter-dot dot-${i}`} />
              {f}
            </button>
          ))}
        </div>
        <div className="game-grid">
          {games
            .filter((g) => filter === "ぜんぶ" || g.category === filter)
            .map((g, i) => (
              <a
                className={`game-card ${g.feature ? "featured" : ""}`}
                href={`/games/${g.id}`}
                style={
                  {
                    "--card-color": g.color,
                    "--card-soft": g.soft,
                    "--card-delay": `${i * 0.03}s`,
                  } as React.CSSProperties
                }
                key={g.id}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/games/${g.id}`);
                }}
              >
                <div className="card-image">
                  <span className="category-label">{g.category}</span>
                  {g.feature && (
                    <span className="recommended">まずは これ！</span>
                  )}
                  <Illustration kind={g.id} />
                  <span className="card-doodle doodle-a">✧</span>
                  <span className="card-doodle doodle-b">✦</span>
                </div>
                <div className="card-info">
                  <h3>{g.title}</h3>
                  <p>{g.tag}</p>
                  <div className="card-bottom">
                    <span>
                      <Icon name="clock" size={15} />
                      {g.time}
                    </span>
                    <span className="card-play">
                      <Icon name="play" size={21} />
                    </span>
                  </div>
                </div>
              </a>
            ))}
        </div>
      </section>
      <footer className="site-footer">
        <span className="brand-mini">ぽっぷ！あそびば</span>
        <p>まちがえても だいじょうぶ。もういっかいが たのしいね。</p>
        <span>ちいさな ひらめきに、おおきな はくしゅ。</span>
      </footer>
    </main>
  );
}
function GameShell({
  game,
  children,
  paused,
  resume,
  navigate,
}: {
  game: GameInfo;
  children: ReactNode;
  paused: boolean;
  resume: () => void;
  navigate: (url: string) => void;
}) {
  const [started, setStarted] = useState(false),
    [done, setDone] = useState(false),
    [version, setVersion] = useState(0);
  const restart = () => {
    audio.stop();
    audio.start();
    setDone(false);
    setStarted(true);
    setVersion((v) => v + 1);
  };
  const finish = () => {
    audio.stop();
    audio.sound("complete");
    audio.say("できたね！すてき！");
    setDone(true);
  };
  useEffect(() => () => audio.stop(), []);
  return (
    <main
      className="game-main"
      style={
        {
          "--game-color": game.color,
          "--game-soft": game.soft,
        } as React.CSSProperties
      }
    >
      <div className="game-heading">
        <div>
          <span className="eyebrow">{game.category}の あそび</span>
          <h1>{game.title}</h1>
        </div>
        <div className="game-heading-side">
          <span>{game.tag}</span>
          <button
            className="icon-button"
            aria-label="いちじていし"
            onClick={() => {
              audio.pause();
              window.dispatchEvent(new Event("blur"));
            }}
          >
            <Icon name="pause" />
          </button>
        </div>
      </div>
      <PlayContext.Provider
        value={{ paused: paused || done, finish, restart, started }}
      >
        <div className={`game-body ${done ? "completed" : ""}`} key={version}>
          {children}
        </div>
      </PlayContext.Provider>
      {!started && (
        <div className="game-intro" data-overlay>
          <section className="intro-card">
            <span className="eyebrow">さあ、やってみよう！</span>
            <Illustration kind={game.id} />
            <h2>{game.title}</h2>
            <p>{game.tag}</p>
            <button
              className="primary"
              onClick={async () => {
                await audio.start();
                setStarted(true);
                resume();
              }}
            >
              <Icon name="play" /> あそぶ
            </button>
            <span className="intro-small">
              <Icon name="key" size={18} />{" "}
              {game.category === "ガシャガシャ"
                ? "すきな キーを おしてみよう"
                : "キーの えが おしえてくれるよ"}
            </span>
          </section>
        </div>
      )}
      {paused && started && !done && (
        <div className="game-pause" data-overlay>
          <section className="pause-card">
            <span className="pause-moon">☾</span>
            <h2>ひとやすみ。</h2>
            <p>つづきから あそべるよ。</p>
            <button className="primary" onClick={resume}>
              <Icon name="play" /> つづきから あそぶ
            </button>
          </section>
        </div>
      )}
      {done && (
        <>
          <Confetti />
          <div className="completion-bar">
            <div>
              <span className="eyebrow">すてきな できあがり！</span>
              <h2>できたね！</h2>
            </div>
            <button className="primary" onClick={restart}>
              <Icon name="back" />
              もういっかい
            </button>
            <button className="secondary" onClick={() => navigate("/")}>
              <Icon name="home" />
              ホーム
            </button>
          </div>
        </>
      )}
      <p className="game-footer-note">
        <Icon name="heart" size={15} /> ゆっくりで だいじょうぶ。すきなだけ
        ためしてね。
      </p>
    </main>
  );
}
