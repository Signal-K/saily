import type { ReactNode } from "react";

export function Kicker({ children }: { children: ReactNode }) {
  return <p className="tx-kicker">{children}</p>;
}

export function StatusPill({ children, href }: { children: ReactNode; href?: string }) {
  const content = (
    <>
      <span className="tx-dot" aria-hidden />
      {children}
    </>
  );

  if (href) {
    return (
      <a className="tx-status" href={href}>
        {content}
      </a>
    );
  }

  return <span className="tx-status">{content}</span>;
}

export function InterestSuccessNote({ children }: { children: ReactNode }) {
  return (
    <div className="tx-interest-success">
      <p>
        <strong>You&apos;re on the list.</strong> {children}
      </p>
    </div>
  );
}

export function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button type="button" className={`tx-chip ${active ? "is-active" : ""}`} aria-pressed={active} onClick={onClick}>
      <span aria-hidden>{active ? "[x]" : "[ ]"}</span>
      {label}
    </button>
  );
}
