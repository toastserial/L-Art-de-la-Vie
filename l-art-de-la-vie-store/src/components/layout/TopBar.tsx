const messages = Array.from({ length: 6 }, (_, index) => (
  <span key={index} className="flex shrink-0 items-center gap-6 pr-6 sm:gap-10 sm:pr-10">
    <span>Hacemos envíos a todo Honduras</span>
    <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--gold)]" aria-hidden />
  </span>
));

export function TopBar() {
  return (
    <div
      className="overflow-hidden border-b border-black/10 bg-white text-[color:var(--ink)]"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <span className="sr-only">Hacemos envíos a todo Honduras</span>
      <div
        className="shipping-marquee flex w-max py-2 text-[0.7rem] font-extrabold uppercase tracking-[0.08em] sm:py-2.5 sm:text-xs sm:tracking-[0.1em]"
        aria-hidden="true"
      >
        <div className="flex shrink-0">{messages}</div>
        <div className="flex shrink-0">{messages}</div>
      </div>
    </div>
  );
}
