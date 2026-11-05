import type { ReactNode } from "react";
import { Icon } from "./Art";
export function KeyCap({ children }: { children: ReactNode }) {
  return <kbd>{children}</kbd>;
}
export function Control({
  label,
  keyName,
  children,
  onClick,
  active = false,
  disabled = false,
  className = "",
  testId,
}: {
  label: string;
  keyName?: string;
  children?: ReactNode;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  testId?: string;
}) {
  return (
    <button
      type="button"
      className={`control ${active ? "selected" : ""} ${className}`}
      aria-label={label}
      aria-pressed={active || undefined}
      disabled={disabled}
      onClick={onClick}
      data-testid={testId}
    >
      {children && <span className="control-art">{children}</span>}
      <span>{label}</span>
      {keyName && <KeyCap>{keyName}</KeyCap>}
    </button>
  );
}
export function Primary({
  children,
  onClick,
  keyName = "Space",
  disabled = false,
}: {
  children: ReactNode;
  onClick: () => void;
  keyName?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="primary action"
      onClick={onClick}
      disabled={disabled}
    >
      {children}
      <KeyCap>{keyName === "Space" ? "スペース" : keyName}</KeyCap>
    </button>
  );
}
export function Hint({ children }: { children: ReactNode }) {
  return (
    <p className="game-hint" role="status" aria-live="polite">
      {children}
    </p>
  );
}
export function Stage({
  children,
  className = "",
  label,
}: {
  children: ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <div className={`stage ${className}`} aria-label={label}>
      {children}
    </div>
  );
}
export function StageSvg({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <svg
      viewBox="0 0 900 420"
      className="stage-svg"
      role="img"
      aria-label={label}
    >
      {children}
    </svg>
  );
}
export function Progress({
  total,
  current,
}: {
  total: number;
  current: number;
}) {
  return (
    <div
      className="progress-dots"
      aria-label={`${total}このうち ${current}こ できた`}
    >
      {Array.from({ length: total }, (_, i) => (
        <span className={i < current ? "filled" : ""} key={i}>
          {i < current ? <Icon name="check" size={16} /> : null}
        </span>
      ))}
    </div>
  );
}
export function Undo({
  onClick,
  disabled = false,
  label = "ひとつもどす",
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      className="quiet-button"
      onClick={onClick}
      disabled={disabled}
    >
      <Icon name="back" size={19} />
      {label}
    </button>
  );
}
export function SvgPicture({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 300 240" aria-hidden="true">
      {children}
    </svg>
  );
}
export function Confetti() {
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: 30 }, (_, i) => (
        <i
          key={i}
          style={{
            left: `${i * 3.4}%`,
            background: ["#f9c85d", "#f29eb8", "#93ccb5", "#b7a4e6"][i % 4],
            animationDelay: `${(i % 7) * 0.12}s`,
            transform: `rotate(${i * 27}deg)`,
          }}
        />
      ))}
    </div>
  );
}
