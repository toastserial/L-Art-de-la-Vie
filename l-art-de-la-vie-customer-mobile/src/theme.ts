export const colors = { forest: "#073B20", forest2: "#155C36", gold: "#C3A447", cream: "#FAF8F2", paper: "#FFFFFF", ink: "#17201B", muted: "#68736C", line: "#E5E8E5", danger: "#B42318" };
export const money = (value: number) => `L ${Number(value || 0).toLocaleString("es-HN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
