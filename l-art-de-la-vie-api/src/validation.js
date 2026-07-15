const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function httpError(status, message, code = "REQUEST_ERROR") {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  error.expose = true;
  return error;
}

export function text(value, field, maximum = 300) {
  if (typeof value !== "string" || !value.trim()) throw httpError(400, `${field} es obligatorio`);
  const clean = value.trim();
  if (clean.length > maximum) throw httpError(400, `${field} no puede superar ${maximum} caracteres`);
  return clean;
}

export function optionalText(value, field, maximum = 300) {
  if (value === undefined || value === null || value === "") return null;
  return text(value, field, maximum);
}

export function number(value, field, minimum = 0, maximum = 1_000_000_000) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < minimum || parsed > maximum) {
    throw httpError(400, `${field} debe estar entre ${minimum} y ${maximum}`);
  }
  return parsed;
}

export function integer(value, field, minimum = 0, maximum = 1_000_000) {
  const parsed = number(value, field, minimum, maximum);
  if (!Number.isInteger(parsed)) throw httpError(400, `${field} debe ser un número entero`);
  return parsed;
}

export function uuid(value, field = "Identificador") {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) throw httpError(400, `${field} no es válido`);
  return value;
}
