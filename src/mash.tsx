import { useEffect, useRef } from "react";
import type { KeyboardEvent, PointerEvent, ReactNode } from "react";
import { usePlay, useTick } from "./play";
import { MashInput, keyInfo } from "./mashLogic.mjs";
export type MashHit = NonNullable<ReturnType<MashInput["press"]>>;
export function useMashInput(
  hit: (event: MashHit) => void,
  hold: (codes: string[], dt: number) => void,
  clear?: () => void,
) {
  const stage = useRef<HTMLDivElement>(null),
    input = useRef(new MashInput());
  const callbacks = useRef({ hit, hold, clear });
  callbacks.current = { hit, hold, clear };
  const { started, paused } = usePlay();
  const reset = () => {
    input.current.clear();
    callbacks.current.clear?.();
  };
  useEffect(() => {
    reset();
    if (started && !paused) stage.current?.focus({ preventScroll: true });
    return reset;
  }, [started, paused]);
  useEffect(() => {
    const up = (e: globalThis.KeyboardEvent) => input.current.release(e.code);
    const cancel = () => reset();
    window.addEventListener("keyup", up);
    window.addEventListener("blur", cancel);
    return () => {
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", cancel);
    };
  }, []);
  const press = (id: string, code: string) => {
    if (!started || paused) return;
    const event = input.current.press(id, code, performance.now());
    if (event) callbacks.current.hit(event);
  };
  useTick((dt) =>
    callbacks.current.hold(input.current.long(performance.now()), dt),
  );
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== stage.current || !started || paused) return;
    if (e.key === "Escape" || e.code === "Escape") {
      e.preventDefault();
      reset();
      window.dispatchEvent(new Event("blur"));
      return;
    }
    if (e.nativeEvent.isComposing || e.ctrlKey || e.metaKey || e.altKey) {
      reset();
      return;
    }
    if (!keyInfo(e.code)) return;
    e.preventDefault();
    if (!e.repeat) press(e.code, e.code);
  };
  const pad = (code: string) => ({
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      if (e.button !== 0) return;
      e.preventDefault();
      stage.current?.focus({ preventScroll: true });
      e.currentTarget.setPointerCapture?.(e.pointerId);
      press(`pointer:${e.pointerId}`, code);
    },
    onPointerUp: (e: PointerEvent<HTMLElement>) =>
      input.current.release(`pointer:${e.pointerId}`),
    onPointerCancel: (e: PointerEvent<HTMLElement>) =>
      input.current.release(`pointer:${e.pointerId}`),
    onLostPointerCapture: (e: PointerEvent<HTMLElement>) =>
      input.current.release(`pointer:${e.pointerId}`),
    onClick: (e: React.MouseEvent<HTMLElement>) => {
      if (e.detail === 0) {
        press("accessible", code);
        input.current.release("accessible");
      }
    },
  });
  return {
    stage,
    input,
    press,
    reset,
    pad,
    stageProps: {
      onKeyDown,
      onBlur: reset,
      tabIndex: 0,
      role: "group",
      onPointerDown: () => stage.current?.focus({ preventScroll: true }),
    },
  };
}
export function MashGuide({ children }: { children: ReactNode }) {
  return (
    <div className="mash-guide">
      <span className="mash-keyboard" aria-hidden="true">
        ▦
      </span>
      <div>
        <strong>どこを おしても、だいじょうぶ。</strong>
        <span>{children}</span>
      </div>
      <span className="mash-small">ながく おしても あそべるよ</span>
    </div>
  );
}
