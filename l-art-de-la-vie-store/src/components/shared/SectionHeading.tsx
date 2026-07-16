import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  onDark = false,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  onDark?: boolean;
}) {
  const alignCls = align === "center" ? "text-center mx-auto" : "text-left";
  const eyebrowCls = onDark ? "text-[color:var(--gold)]" : "text-[color:var(--forest-2)]";
  const titleCls = onDark ? "text-[color:var(--cream)]" : "text-[color:var(--ink)]";
  const descCls = onDark ? "text-white/70" : "text-[color:var(--ink-muted)]";
  return (
    <div className={`${alignCls} max-w-2xl`}>
      {eyebrow ? (
        <div className={`mb-3 text-xs uppercase tracking-[0.28em] ${eyebrowCls}`}>{eyebrow}</div>
      ) : null}
      <h2 className={`font-serif text-3xl leading-[1.1] sm:text-4xl md:text-[2.75rem] ${titleCls}`}>
        {title}
      </h2>
      {description ? (
        <p className={`mt-4 text-base leading-relaxed ${descCls}`}>{description}</p>
      ) : null}
    </div>
  );
}
