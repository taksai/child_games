import { createContext, useContext, useEffect, useRef } from "react";
import { audio } from "./audio";
export const PlayContext = createContext({
  paused: false,
  finish: () => {},
  restart: () => {},
  started: false,
});
export const usePlay = () => useContext(PlayContext);
export function useKeys(
  handler: (key: string, down: boolean) => void,
  continuous: string[] = [],
) {
  const { paused, started } = usePlay();
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    if (paused || !started) return;
    const held = new Set<string>();
    let tabNavigation = false;
    const normalized = (e: KeyboardEvent) =>
      e.code.startsWith("Digit") || e.code.startsWith("Numpad")
        ? e.code.replace(/Digit|Numpad/, "")
        : e.code;
    const down = (e: KeyboardEvent) => {
      if (e.code === "Tab") {
        tabNavigation = true;
        return;
      }
      const el = e.target as HTMLElement;
      if (
        el.closest("[data-overlay]") ||
        ["INPUT", "SELECT", "TEXTAREA"].includes(el.tagName) ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      )
        return;
      const k = normalized(e);
      if (
        ![
          "Space",
          "Enter",
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "Backspace",
          ..."0123456789",
        ].includes(k)
      )
        return;
      if (
        (e.code === "Enter" || e.code === "Space") &&
        el.tagName === "BUTTON" &&
        tabNavigation
      )
        return;
      tabNavigation = false;
      e.preventDefault();
      if (e.repeat || held.has(k)) return;
      held.add(k);
      ref.current(k, true);
    };
    const up = (e: KeyboardEvent) => {
      const k = normalized(e);
      held.delete(k);
      if (continuous.includes(k)) ref.current(k, false);
    };
    const clear = () => {
      for (const k of held) if (continuous.includes(k)) ref.current(k, false);
      held.clear();
    };
    const pointer = () => {
      tabNavigation = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    window.addEventListener("pointerdown", pointer);
    return () => {
      clear();
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
      window.removeEventListener("pointerdown", pointer);
    };
  }, [paused, started, continuous.join(",")]);
}
export function useTick(handler: (delta: number) => void) {
  const { paused, started } = usePlay();
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    if (paused || !started) return;
    let id = 0,
      last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.06);
      last = now;
      ref.current(dt);
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [paused, started]);
}
export function useAnnounce(text: string) {
  const { started, paused } = usePlay();
  useEffect(() => {
    if (started && !paused) audio.say(text);
  }, [text, started, paused]);
}
