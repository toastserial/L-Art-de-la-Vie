export function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export function text(value, field) {
  if (typeof value !== "string" || !value.trim()) throw httpError(400, `${field} es obligatorio`);
  return value.trim();
}

export function number(value, field, minimum = 0) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < minimum) throw httpError(400, `${field} debe ser un número mayor o igual a ${minimum}`);
  return parsed;
}
