const messages = Array.from({ length: 8 }, (_, index) => (
  <span key={index} className="flex shrink-0 items-center gap-7 pr-7 sm:gap-10 sm:pr-10">
    <span>Hacemos envíos a todo Honduras</span>
    <span className="shipping-dot" aria-hidden />
  </span>
));

export function TopBar() {
  return (
    <div
      className="shipping-bar overflow-hidden text-[color:var(--cream)]"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <span className="sr-only">Hacemos envíos a todo Honduras</span>
      <div
        className="shipping-marquee flex w-max py-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] sm:py-2.5 sm:text-[0.72rem] sm:tracking-[0.17em]"
        aria-hidden="true"
      >
        <div className="flex shrink-0">{messages}</div>
        <div className="flex shrink-0">{messages}</div>
      </div>
    </div>
  );
}
