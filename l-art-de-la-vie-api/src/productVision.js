import { httpError } from "./validation.js";

const clean = (value, maximum = 160) => String(value ?? "").replace(/\s+/g, " ").trim().slice(0, maximum);
const fold = (value) => clean(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const colorNames = [
  ["Negro", 24, 24, 24], ["Blanco", 238, 238, 232], ["Gris", 128, 128, 128],
  ["Beige", 210, 190, 150], ["Café", 112, 72, 45], ["Rojo", 190, 40, 45],
  ["Naranja", 225, 125, 35], ["Amarillo", 225, 195, 50], ["Verde", 60, 130, 75],
  ["Azul", 55, 95, 165], ["Morado", 115, 70, 145], ["Rosado", 220, 145, 165],
  ["Dorado", 190, 155, 65], ["Plateado", 170, 175, 180]
];

const closestColor = (color) => {
  if (!color) return "";
  const { red = 0, green = 0, blue = 0 } = color;
  return colorNames.reduce((best, candidate) => {
    const distance = (red - candidate[1]) ** 2 + (green - candidate[2]) ** 2 + (blue - candidate[3]) ** 2;
    return distance < best.distance ? { name: candidate[0], distance } : best;
  }, { name: "", distance: Number.POSITIVE_INFINITY }).name;
};

const findMaterial = (terms) => {
  const options = [
    ["Cuero", ["leather", "cuero"]], ["Vidrio", ["glass", "crystal", "vidrio", "cristal"]],
    ["Madera", ["wood", "wooden", "madera"]], ["Metal", ["metal", "steel", "iron", "aluminum"]],
    ["Tela", ["fabric", "textile", "cloth", "cotton", "linen"]],
    ["Cerámica", ["ceramic", "pottery", "porcelain"]], ["Plástico", ["plastic", "acrylic"]]
  ];
  const haystack = terms.map(fold);
  return options.find(([, words]) => words.some((word) => haystack.some((term) => term.includes(word))))?.[0] ?? "";
};

const chooseCategory = (categories, terms) => {
  const haystack = terms.map(fold).join(" ");
  const exact = categories.find((category) => haystack.includes(fold(category)));
  if (exact) return exact;
  const rules = [
    [["perfume", "fragrance", "cosmetic", "scent", "bottle"], ["perfume"]],
    [["handbag", "bag", "purse", "wallet", "tote"], ["cartera", "bolso"]],
    [["decor", "vase", "candle", "furniture", "home", "flower", "frame", "ornament"], ["decoracion"]]
  ];
  for (const [hints, categoryHints] of rules) {
    if (hints.some((hint) => haystack.includes(hint))) {
      const found = categories.find((category) => categoryHints.some((hint) => fold(category).includes(hint)));
      if (found) return found;
    }
  }
  return categories.find((category) => fold(category) === "varios") ?? categories[0] ?? "Varios";
};

const suggestedName = (result, terms) => {
  const textLines = String(result.fullTextAnnotation?.text ?? "").split(/\r?\n/).map((line) => clean(line, 80)).filter(Boolean);
  const logo = clean(result.logoAnnotations?.[0]?.description, 60);
  const guess = clean(result.webDetection?.bestGuessLabels?.[0]?.label, 80);
  const candidate = textLines.find((line) => /[a-záéíóúñ]/i.test(line) && line.length >= 3) || guess || logo || clean(terms[0], 80);
  return clean(logo && candidate && !fold(candidate).includes(fold(logo)) ? `${logo} ${candidate}` : candidate, 160);
};

export async function analyzeProductPhoto(apiKey, buffer, categories) {
  const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requests: [{
      image: { content: buffer.toString("base64") },
      features: [
        { type: "LABEL_DETECTION", maxResults: 12 },
        { type: "TEXT_DETECTION", maxResults: 5 },
        { type: "LOGO_DETECTION", maxResults: 3 },
        { type: "IMAGE_PROPERTIES", maxResults: 5 },
        { type: "OBJECT_LOCALIZATION", maxResults: 8 },
        { type: "WEB_DETECTION", maxResults: 8 }
      ]
    }] })
  });
  const body = await response.json().catch(() => ({}));
  const result = body.responses?.[0];
  if (!response.ok || result?.error) {
    const status = result?.error?.code ?? response.status;
    if ([429, 8].includes(status)) throw httpError(429, "Se alcanzó el límite de análisis. Puedes completar el producto manualmente.", "VISION_QUOTA_REACHED");
    throw httpError(502, "Google no pudo analizar esta foto. Puedes completar el producto manualmente.", "VISION_UNAVAILABLE");
  }

  const labels = (result?.labelAnnotations ?? []).map((item) => clean(item.description)).filter(Boolean);
  const objects = (result?.localizedObjectAnnotations ?? []).map((item) => clean(item.name)).filter(Boolean);
  const webTerms = (result?.webDetection?.webEntities ?? []).map((item) => clean(item.description)).filter(Boolean);
  const logos = (result?.logoAnnotations ?? []).map((item) => clean(item.description)).filter(Boolean);
  const terms = [...logos, ...objects, ...labels, ...webTerms];
  const color = closestColor(result?.imagePropertiesAnnotation?.dominantColors?.colors?.[0]?.color);
  const material = findMaterial(terms);
  const category = chooseCategory(categories, terms);
  const name = suggestedName(result ?? {}, terms);
  const type = objects[0] || labels[0] || "";
  const specifications = Object.fromEntries([
    ["Marca", logos[0] || ""], ["Color", color], ["Material", material], ["Tipo", type]
  ].filter(([, value]) => value));
  const descriptionParts = [type && `Producto tipo ${type.toLowerCase()}`, color && `en color ${color.toLowerCase()}`, material && `con apariencia de ${material.toLowerCase()}`].filter(Boolean);
  const scores = [...(result?.labelAnnotations ?? []), ...(result?.localizedObjectAnnotations ?? [])]
    .map((item) => Number(item.score ?? 0)).filter(Number.isFinite);

  return {
    name,
    category,
    description: descriptionParts.length ? `${descriptionParts.join(" ")}. Revisa y ajusta esta descripción antes de guardar.` : "",
    specifications,
    visibleText: clean(result?.fullTextAnnotation?.text, 500),
    confidence: scores.length ? Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100) : null
  };
}
