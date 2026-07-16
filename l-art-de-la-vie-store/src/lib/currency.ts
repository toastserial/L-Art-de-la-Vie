const fmt = new Intl.NumberFormat("es-HN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatL(n: number): string {
  return `L ${fmt.format(Number.isFinite(n) ? n : 0)}`;
}
