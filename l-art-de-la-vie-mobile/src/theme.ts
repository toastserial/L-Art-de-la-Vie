export const colors = {
  forest: "#073B20",
  forestLight: "#155C36",
  forestSoft: "#E7F1EB",
  gold: "#C3A447",
  goldSoft: "#F7F0D9",
  cream: "#FAF8F2",
  white: "#FFFFFF",
  ink: "#17201B",
  muted: "#68736C",
  line: "#E5E8E5",
  danger: "#B42318",
  dangerSoft: "#FDECEA",
  success: "#247A47",
  warning: "#A15C00",
};

export const shadow = {
  shadowColor: "#0B2416",
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.08,
  shadowRadius: 12,
  elevation: 3,
};

export const money = (value: number) => {
  const amount = Number.isFinite(value) ? value : 0;
  const formatted = Math.abs(amount).toLocaleString("es-HN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${amount < 0 ? "-" : ""}L ${formatted}`;
};

export const localDay = (value: string | Date) => new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Tegucigalpa",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date(value));

export const shortDate = (value: string | Date) => new Intl.DateTimeFormat("es-HN", {
  timeZone: "America/Tegucigalpa",
  day: "2-digit",
  month: "short",
  year: "numeric",
}).format(new Date(value));
