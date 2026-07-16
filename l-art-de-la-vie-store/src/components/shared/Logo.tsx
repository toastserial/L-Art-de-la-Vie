export function Logo({ size = 40, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src="/lartdela.png"
      alt=""
      className={`inline-block rounded-full object-cover shadow-sm ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}
