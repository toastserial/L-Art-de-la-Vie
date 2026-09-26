import { httpError } from "./validation.js";

const clean = (value, maximum = 160) => String(value ?? "").replace(/\s+/g, " ").trim().slice(0, maximum);
const fold = (value) => clean(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const productTypes = [
  ["Botella térmica", ["vacuum flask", "insulated bottle", "thermos"]],
  ["Perfume", ["eau de parfum", "eau de toilette", "fragrance", "perfume", "cologne"]],
  ["Botella", ["water bottle", "sports bottle", "drink bottle", "bottle"]],
  ["Cartera", ["handbag", "purse", "wallet", "tote bag"]],
  ["Florero", ["flower vase", "vase"]],
  ["Vela", ["scented candle", "candle"]],
  ["Lámpara", ["floor lamp", "table lamp", "lamp"]],
  ["Espejo", ["wall mirror", "floor mirror", "mirror"]],
  ["Juguete", ["toy", "doll", "action figure"]],
  ["Taza", ["coffee mug", "mug"]],
  ["Vaso", ["tumbler", "drinking glass"]]
];

const categorySuggestions = new Map([
  ["Botella térmica", "Botellas"], ["Botella", "Botellas"], ["Perfume", "Perfumes"],
  ["Cartera", "Carteras"], ["Florero", "Floreros"], ["Vela", "Velas"],
  ["Lámpara", "Lámparas"], ["Espejo", "Espejos"], ["Juguete", "Juguetes"],
  ["Taza", "Tazas y vasos"], ["Vaso", "Tazas y vasos"]
]);

const findProductType = (terms) => {
  const haystack = terms.map(fold);
  return productTypes.find(([, hints]) => hints.some((hint) => haystack.some((term) => term.includes(hint))))?.[0] ?? "";
};

const findMaterial = (terms) => {
  const options = [
    ["Acero inoxidable", ["stainless steel", "steel water bottle", "steel bottle", "vacuum insulated", "double wall steel"]],
    ["Aluminio", ["aluminum bottle", "aluminium bottle"]], ["Metal", ["metal bottle", "metallic body"]],
    ["Plástico", ["plastic water bottle", "plastic bottle", "acrylic product", "bpa free plastic"]],
    ["Cuero", ["genuine leather", "leather"]], ["Vidrio", ["glassware", "glass vase", "glass bottle"]],
    ["Madera", ["solid wood", "wooden furniture"]], ["Tela", ["textile", "cotton fabric", "linen fabric"]],
    ["Cerámica", ["ceramic", "pottery", "porcelain"]]
  ];
  const haystack = terms.map(fold);
  return options.find(([, words]) => words.some((word) => haystack.some((term) => term.includes(word))))?.[0] ?? "";
};

const namedColors = [
  ["Blanco", ["white", "blanco"]], ["Negro", ["black", "negro"]], ["Beige", ["beige", "cream", "crema"]],
  ["Gris", ["gray", "grey", "gris"]], ["Plateado", ["silver", "plateado"]], ["Dorado", ["gold", "dorado"]],
  ["Rojo", ["red", "rojo"]], ["Rosado", ["pink", "rosado", "rosa"]], ["Naranja", ["orange", "naranja"]],
  ["Amarillo", ["yellow", "amarillo"]], ["Verde", ["green", "verde"]], ["Azul", ["blue", "azul"]],
  ["Morado", ["purple", "violet", "morado"]], ["Café", ["brown", "café", "coffee color"]]
];

const colorFromRgb = ({ red = 0, green = 0, blue = 0 }) => {
  const maximum = Math.max(red, green, blue), minimum = Math.min(red, green, blue);
  const brightness = (red + green + blue) / 3;
  if (maximum - minimum < 18) return brightness > 220 ? "Blanco" : brightness < 45 ? "Negro" : "Gris";
  if (red > 175 && green > 150 && blue > 105 && red - blue < 75) return "Beige";
  if (red > green * 1.35 && red > blue * 1.35) return green > 110 ? "Naranja" : "Rojo";
  if (blue > red * 1.2 && blue > green * 1.08) return "Azul";
  if (green > red * 1.12 && green > blue * 1.08) return "Verde";
  if (red > 130 && blue > 110 && green < Math.min(red, blue) * 0.9) return red > blue * 1.15 ? "Rosado" : "Morado";
  if (red > 150 && green > 125 && blue < 100) return "Dorado";
  return brightness < 105 ? "Café" : "Gris";
};

const findColor = (terms, result) => {
  const haystack = ` ${terms.map(fold).join(" ")} `;
  const named = namedColors.find(([, words]) => words.some((word) => new RegExp(`(^|[^a-z])${fold(word)}([^a-z]|$)`).test(haystack)))?.[0];
  if (named) return named;
  const colors = result?.imagePropertiesAnnotation?.dominantColors?.colors ?? [];
  const usable = colors.filter((item) => Number(item.pixelFraction ?? 0) >= 0.03);
  const selected = (usable.length ? usable : colors).reduce((best, item) => {
    const rgb = item.color ?? {};
    const brightness = ((rgb.red ?? 0) + (rgb.green ?? 0) + (rgb.blue ?? 0)) / 3;
    const weight = Number(item.pixelFraction ?? 0.05) * Number(item.score ?? 1) * (0.55 + brightness / 255);
    return weight > best.weight ? { color: rgb, weight } : best;
  }, { color: null, weight: -1 });
  return selected.color ? colorFromRgb(selected.color) : "";
};

const chooseCategory = (categories, terms, productType) => {
  const haystack = terms.map(fold).join(" ");
  const exact = categories.find((category) => haystack.includes(fold(category)));
  if (exact) return exact;
  const rules = [
    [["Perfume"], ["perfume"]], [["Cartera"], ["cartera", "bolso"]], [["Juguete"], ["juguete"]],
    [["Botella", "Botella térmica", "Taza", "Vaso"], ["cocina"]],
    [["Florero", "Vela", "Lámpara", "Espejo"], ["decoracion"]]
  ];
  for (const [types, categoryHints] of rules) {
    if (types.includes(productType)) {
      const found = categories.find((category) => categoryHints.some((hint) => fold(category).includes(hint)));
      if (found) return found;
    }
  }
  return categories.find((category) => fold(category) === "varios") ?? categories[0] ?? "Varios";
};

const visibleBrand = (result, logo) => {
  if (!logo) return "";
  const lines = String(result.fullTextAnnotation?.text ?? "").split(/\r?\n/).map((line) => clean(line, 60)).filter(Boolean);
  const matchingLine = lines.find((line) => {
    const normalized = fold(line);
    return normalized.length >= 3 && (fold(logo).includes(normalized) || normalized.includes(fold(logo)));
  });
  return matchingLine || logo;
};

const uniqueName = (productType, brand, result, terms) => {
  if (productType && brand) return clean(`${productType} ${brand}`, 160);
  if (productType) return productType;
  const textLine = String(result.fullTextAnnotation?.text ?? "").split(/\r?\n/).map((line) => clean(line, 80))
    .find((line) => /[a-záéíóúñ]/i.test(line) && line.length >= 3);
  const guess = clean(result.webDetection?.bestGuessLabels?.[0]?.label, 80);
  return brand || textLine || guess || clean(terms[0], 80);
};

const categoryChoice = (categories, terms, productType) => {
  const proposal = categorySuggestions.get(productType) ?? "";
  const existingProposal = proposal && categories.find((category) => fold(category) === fold(proposal));
  return {
    category: existingProposal || chooseCategory(categories, terms, productType),
    suggestedCategory: existingProposal ? "" : proposal
  };
};

export function interpretVisionResult(result, categories) {
  const labels = (result?.labelAnnotations ?? []).map((item) => clean(item.description)).filter(Boolean);
  const objects = (result?.localizedObjectAnnotations ?? []).map((item) => clean(item.name)).filter(Boolean);
  const webTerms = [
    ...(result?.webDetection?.bestGuessLabels ?? []).map((item) => clean(item.label)),
    ...(result?.webDetection?.webEntities ?? []).map((item) => clean(item.description))
  ].filter(Boolean);
  const logoAnnotation = clean(result?.logoAnnotations?.[0]?.description, 60);
  const brand = visibleBrand(result ?? {}, logoAnnotation);
  const terms = [brand, ...objects, ...labels, ...webTerms].filter(Boolean);
  const productType = findProductType(terms);
  const material = findMaterial(terms);
  const color = findColor(terms, result);
  const { category, suggestedCategory } = categoryChoice(categories, terms, productType);
  const name = uniqueName(productType, brand, result ?? {}, terms);
  const specifications = Object.fromEntries([
    ["Marca", brand], ["Color", color], ["Material", material], ["Tipo", productType]
  ].filter(([, value]) => value));
  const details = [color && `en color ${color.toLowerCase()}`, material && `fabricado en ${material.toLowerCase()}`].filter(Boolean);
  const description = productType ? `${productType}${brand ? ` marca ${brand}` : ""}${details.length ? `, ${details.join(" y ")}` : ""}, ideal para uso diario.` : "";
  const scores = [...(result?.labelAnnotations ?? []), ...(result?.localizedObjectAnnotations ?? [])]
    .map((item) => Number(item.score ?? 0)).filter(Number.isFinite);
  return {
    name, category, suggestedCategory, description, specifications,
    visibleText: clean(result?.fullTextAnnotation?.text, 500),
    confidence: scores.length ? Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100) : null
  };
}

const productSchema = (categories) => ({
  type: "object",
  properties: {
    name: { type: "string", description: "Nombre breve y natural en español, sin repetir la marca." },
    category: { type: "string", enum: categories.length ? categories : ["Varios"] },
    suggestedCategory: { type: "string", description: "Categoría plural, reutilizable y breve que convendría crear; vacía si una categoría existente ya es precisa." },
    description: { type: "string", description: "Una frase comercial breve y objetiva en español." },
    brand: { type: "string" }, color: { type: "string" }, material: { type: "string" },
    productType: { type: "string", description: "Tipo concreto del producto en español." },
    visibleText: { type: "string" }, confidence: { type: "integer", minimum: 0, maximum: 100 }
  },
  required: ["name", "category", "suggestedCategory", "description", "brand", "color", "material", "productType", "visibleText", "confidence"]
});

async function analyzeWithGemini(apiKey, buffer, categories, mimeType) {
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [{ parts: [
        { text: `Analiza únicamente el producto principal centrado en la foto para un catálogo de tienda. Ignora la mano, el fondo, la tapa y la mano al determinar el color y material del cuerpo principal. Responde en español. Identifica el color principal con un nombre común y el material más probable (por ejemplo acero inoxidable, vidrio, plástico, madera, cerámica, tela o cuero); si visualmente no se puede sostener, devuelve "No identificado" en ese campo en vez de inventar. El nombre debe empezar por el tipo de producto y luego incluir marca o modelo sin palabras duplicadas. Evita etiquetas genéricas como packaged goods, jarred goods, bottle o product; tradúcelas a un tipo comercial específico. Elige exactamente una categoría existente de esta lista: ${categories.join(", ") || "Varios"}. Si ninguna es suficientemente precisa, conserva la mejor categoría existente y propón en suggestedCategory una categoría nueva, breve, plural y reutilizable; nunca uses una marca o modelo como categoría.` },
        { inlineData: { mimeType, data: buffer.toString("base64") } }
      ] }],
      generationConfig: { temperature: 0.1, responseMimeType: "application/json", responseSchema: productSchema(categories) }
    })
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`Gemini ${response.status}`);
  const text = body.candidates?.[0]?.content?.parts?.find((part) => part.text)?.text;
  const result = JSON.parse(text || "{}");
  const category = categories.includes(result.category) ? result.category : (categories.find((item) => fold(item) === "varios") ?? categories[0] ?? "Varios");
  const rawSuggestion = clean(result.suggestedCategory, 60);
  const existingSuggestion = rawSuggestion && categories.find((item) => fold(item) === fold(rawSuggestion));
  const suggestedCategory = existingSuggestion ? "" : rawSuggestion;
  const specifications = Object.fromEntries([
    ["Marca", clean(result.brand, 60)], ["Color", clean(result.color, 40)],
    ["Material", clean(result.material, 60)], ["Tipo", clean(result.productType, 80)]
  ].filter(([, value]) => value));
  return {
    name: clean(result.name, 160), category: existingSuggestion || category, suggestedCategory,
    description: clean(result.description, 1000), specifications,
    visibleText: clean(result.visibleText, 500),
    confidence: Number.isFinite(result.confidence) ? Math.max(0, Math.min(100, Math.round(result.confidence))) : null
  };
}

async function analyzeWithCloudVision(apiKey, buffer, categories) {
  const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(apiKey)}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requests: [{ image: { content: buffer.toString("base64") }, features: [
      { type: "LABEL_DETECTION", maxResults: 12 }, { type: "TEXT_DETECTION", maxResults: 5 },
      { type: "LOGO_DETECTION", maxResults: 3 }, { type: "OBJECT_LOCALIZATION", maxResults: 8 },
      { type: "WEB_DETECTION", maxResults: 8 }, { type: "IMAGE_PROPERTIES", maxResults: 10 }
    ] }] })
  });
  const body = await response.json().catch(() => ({}));
  const result = body.responses?.[0];
  if (!response.ok || result?.error) {
    const status = result?.error?.code ?? response.status;
    if ([429, 8].includes(status)) throw httpError(429, "Se alcanzó el límite de análisis. Puedes completar el producto manualmente.", "VISION_QUOTA_REACHED");
    throw httpError(502, "Google no pudo analizar esta foto. Puedes completar el producto manualmente.", "VISION_UNAVAILABLE");
  }
  return interpretVisionResult(result ?? {}, categories);
}

export async function analyzeProductPhoto(apiKey, buffer, categories, mimeType = "image/jpeg") {
  const geminiKey = process.env.GEMINI_API_KEY?.trim() || apiKey;
  try {
    return { ...(await analyzeWithGemini(geminiKey, buffer, categories, mimeType)), analysisMode: "semantic" };
  } catch (error) {
    console.warn({ event: "gemini_product_analysis_fallback", message: error instanceof Error ? error.message : "unknown" });
  }
  return { ...(await analyzeWithCloudVision(apiKey, buffer, categories)), analysisMode: "basic" };
}
