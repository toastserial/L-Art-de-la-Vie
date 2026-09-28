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

const colorHexes = new Map([
  ["blanco", "#F5F5F2"], ["negro", "#1C1C1C"], ["gris", "#7C8580"],
  ["plateado", "#B8BDC4"], ["beige", "#D8C3A5"], ["cafe", "#795548"],
  ["dorado", "#C9A227"], ["rojo", "#D64545"], ["rosado", "#E88AAA"],
  ["naranja", "#F28C28"], ["amarillo", "#F2C94C"], ["verde", "#2E7D4F"],
  ["azul", "#2F64B5"], ["morado", "#7D4E9E"]
]);

const normalizeColorHex = (value, colorName = "") => {
  const candidate = clean(value, 16).toUpperCase();
  const full = candidate.match(/^#?([0-9A-F]{6})$/)?.[1];
  if (full) return `#${full}`;
  const short = candidate.match(/^#?([0-9A-F]{3})$/)?.[1];
  if (short) return `#${short.split("").map((part) => part.repeat(2)).join("")}`;
  const normalizedName = fold(colorName);
  return [...colorHexes].find(([name]) => normalizedName.includes(name))?.[1] ?? "";
};

const rgbToHex = ({ red = 0, green = 0, blue = 0 } = {}) => `#${[red, green, blue]
  .map((channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, "0"))
  .join("").toUpperCase()}`;

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
  const dominantRgb = result?.imagePropertiesAnnotation?.dominantColors?.colors?.[0]?.color;
  const colorHex = dominantRgb ? rgbToHex(dominantRgb) : normalizeColorHex("", color);
  const { category, suggestedCategory } = categoryChoice(categories, terms, productType);
  const name = uniqueName(productType, brand, result ?? {}, terms);
  const specifications = Object.fromEntries([
    ["Marca", brand], ["Color", color], ["Color HEX", colorHex], ["Material", material], ["Tipo", productType]
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
    name: { type: "string", description: "Nombre comercial preciso en español: tipo de producto, marca y variante visibles, sin repetir palabras ni copiar un eslogan." },
    category: { type: "string", enum: categories.length ? categories : ["Varios"] },
    suggestedCategory: { type: "string", description: "Categoría plural, reutilizable y breve que convendría crear; vacía si una categoría existente ya es precisa." },
    description: { type: "string", description: "Una frase objetiva que explique qué es, para qué sirve y la variante visible, sin inventar beneficios." },
    brand: { type: "string", description: "Marca o fabricante realmente visible; vacío si no se puede leer." },
    color: { type: "string", description: "Color o combinación de colores del producto o su empaque principal, no del fondo." },
    colorHex: { type: "string", description: "Código HEX aproximado del color principal en formato #RRGGBB; vacío solo si no hay color identificable." },
    material: { type: "string", description: "Material del objeto; para consumibles indica estado del contenido y material del envase, por ejemplo Líquido en envase de plástico." },
    productType: { type: "string", description: "Tipo concreto del producto en español." },
    visibleText: { type: "string", description: "Transcripción de las palabras útiles de marca, línea, variante, uso y cantidad que realmente se alcanzan a leer." },
    confidence: { type: "integer", minimum: 0, maximum: 100, description: "Confianza global; reduce el valor si el nombre exacto depende de una suposición." }
  },
  required: ["name", "category", "suggestedCategory", "description", "brand", "color", "colorHex", "material", "productType", "visibleText", "confidence"]
});

const semanticPrompt = (categories) => `Eres un catalogador visual experto de productos de tienda. Analiza únicamente el producto principal centrado en la fotografía y responde en español.

RAZONA EN ESTE ORDEN:
1. Lee cuidadosamente el logotipo y todas las palabras visibles del frente: marca, línea, variante, uso, aroma, modelo y cantidad. No confundas un eslogan con el tipo de producto.
2. Combina el texto con la forma y el empaque para determinar qué producto es. Prioriza evidencia visible; usa conocimiento general solo para interpretar esa evidencia.
3. Forma name como: tipo comercial específico + marca + línea o variante claramente visible. Evita nombres genéricos como producto, botella, packaged goods o solamente una palabra del rótulo.
4. Determina color y material del producto principal. Devuelve también colorHex como la aproximación visual #RRGGBB del color principal. Para líquidos, cremas, alimentos u otros consumibles, material debe describir el contenido y el envase, por ejemplo "Líquido en envase de plástico". Para objetos sólidos, indica el material del objeto, no el de la mano, fondo o accesorio secundario.
5. Si no puedes sostener un dato visualmente, usa "No identificado" o deja brand vacío; nunca inventes una marca, variante o composición.

EJEMPLOS DEL CRITERIO, NO REGLAS PARA UN PRODUCTO ESPECÍFICO:
- Una etiqueta que muestra "Dawn", "Ultra" y "Removes Grease" en un envase de detergente debe producir un nombre como "Jabón líquido lavaplatos Dawn Ultra", no "botella azul" ni el eslogan completo.
- Una botella reutilizable con el logotipo Columbia debe producir "Botella térmica Columbia" si su construcción lo sostiene, no perfume ni packaged goods.
- Una placa que dice "Help Yourself" debe identificarse por su forma como letrero decorativo; la frase es texto visible, no por sí sola el tipo del producto.
- En ropa, cosméticos, electrónicos, juguetes y decoración aplica el mismo proceso: tipo específico primero, luego marca/modelo/variante solamente si se leen.

La descripción debe ser breve, objetiva y sin precio. Elige exactamente una categoría existente de esta lista: ${categories.join(", ") || "Varios"}. Si ninguna es suficientemente precisa, conserva la mejor categoría existente y propón en suggestedCategory una categoría nueva, breve, plural y reutilizable. Nunca uses una marca o modelo como categoría.`;

const jsonOnlyInstruction = "Devuelve exclusivamente un objeto JSON válido con estas claves exactas: name, category, suggestedCategory, description, brand, color, colorHex, material, productType, visibleText, confidence. No uses Markdown ni agregues explicación fuera del JSON.";

const parseJsonResponse = (value) => {
  if (value && typeof value === "object") return value;
  const text = String(value ?? "").trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  const candidates = [text];
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) candidates.push(text.slice(firstBrace, lastBrace + 1));
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (typeof parsed === "string") return JSON.parse(parsed);
      return parsed;
    } catch {
      try { return JSON.parse(candidate.replace(/,\s*([}\]])/g, "$1")); } catch { /* prueba el siguiente candidato */ }
    }
  }
  const error = new Error("El proveedor devolvió texto sin un JSON utilizable");
  error.providerReason = "invalid_json";
  throw error;
};

const normalizeSemanticResult = (result, categories) => {
  const category = categories.includes(result.category) ? result.category : (categories.find((item) => fold(item) === "varios") ?? categories[0] ?? "Varios");
  const rawSuggestion = clean(result.suggestedCategory, 60);
  const existingSuggestion = rawSuggestion && categories.find((item) => fold(item) === fold(rawSuggestion));
  const suggestedCategory = existingSuggestion ? "" : rawSuggestion;
  const color = clean(result.color, 40);
  const colorHex = normalizeColorHex(result.colorHex, color);
  const specifications = Object.fromEntries([
    ["Marca", clean(result.brand, 60)], ["Color", color], ["Color HEX", colorHex],
    ["Material", clean(result.material, 60)], ["Tipo", clean(result.productType, 80)]
  ].filter(([, value]) => value));
  const normalized = {
    name: clean(result.name, 160), category: existingSuggestion || category, suggestedCategory,
    description: clean(result.description, 1000), specifications,
    visibleText: clean(result.visibleText, 500),
    confidence: Number.isFinite(Number(result.confidence)) ? Math.max(0, Math.min(100, Math.round(Number(result.confidence)))) : null
  };
  if (!normalized.name || !clean(result.productType, 80)) {
    const error = new Error("El proveedor devolvió una identificación incompleta");
    error.providerReason = "incomplete_result";
    throw error;
  }
  return normalized;
};

async function requestCloudflare(accountId, apiToken, buffer, categories, mimeType, guided) {
  const model = process.env.CLOUDFLARE_AI_MODEL?.trim() || "@cf/meta/llama-4-scout-17b-16e-instruct";
  const schema = productSchema(categories);
  const payload = {
    messages: [
      { role: "system", content: "Identifica productos con precisión a partir de la imagen y su etiqueta. No inventes datos que no sean visibles." },
      { role: "user", content: [
        { type: "image_url", image_url: { url: `data:${mimeType};base64,${buffer.toString("base64")}` } },
        { type: "text", text: `${semanticPrompt(categories)}\n\n${jsonOnlyInstruction}${guided ? "" : `\nEsquema esperado: ${JSON.stringify(schema)}`}` }
      ] }
    ],
    temperature: 0,
    max_tokens: 750,
    ...(guided ? { guided_json: schema } : {})
  };
  let response;
  try {
    response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/ai/run/${model}`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiToken}`, "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(45000)
    });
  } catch (cause) {
    const error = new Error(`No se pudo conectar con Cloudflare: ${cause instanceof Error ? cause.message : "error de red"}`);
    error.providerReason = "network";
    throw error;
  }
  const rawBody = await response.text();
  const body = (() => { try { return JSON.parse(rawBody); } catch { return {}; } })();
  if (!response.ok || body.success === false) {
    const detail = clean(body.errors?.[0]?.message, 240);
    const error = new Error(`Cloudflare ${response.status}${detail ? `: ${detail}` : ""}`);
    error.status = response.status;
    error.providerCode = body.errors?.[0]?.code;
    error.providerReason = "http";
    throw error;
  }
  return normalizeSemanticResult(parseJsonResponse(body.result?.response ?? body.result), categories);
}

async function analyzeWithCloudflare(accountId, apiToken, buffer, categories, mimeType) {
  try {
    return await requestCloudflare(accountId, apiToken, buffer, categories, mimeType, true);
  } catch (firstError) {
    const status = Number(firstError?.status ?? 0);
    const canRetry = ![401, 403, 404, 429].includes(status);
    if (!canRetry) throw firstError;
    console.warn({
      event: "cloudflare_product_analysis_retry",
      status: status || undefined,
      reason: firstError?.providerReason ?? "unknown",
      message: firstError instanceof Error ? firstError.message : "unknown"
    });
    return requestCloudflare(accountId, apiToken, buffer, categories, mimeType, false);
  }
}

const semanticProviderError = (provider, error) => {
  const status = Number(error?.status ?? 0);
  if (provider === "Cloudflare") {
    if ([401, 403].includes(status)) return `Cloudflare no autorizó la solicitud (${status}). Revisa CLOUDFLARE_ACCOUNT_ID, el token y sus permisos de Workers AI.`;
    if (status === 429) return "Cloudflare alcanzó el límite gratuito diario o su capacidad temporal (429). Intenta más tarde.";
    if (status === 404) return "Cloudflare no encontró la cuenta o el modelo configurado (404). Revisa CLOUDFLARE_ACCOUNT_ID y CLOUDFLARE_AI_MODEL.";
    if (error?.providerReason === "network") return "No se pudo conectar con Cloudflare después de reintentar. Revisa la conexión e intenta de nuevo.";
    if (["invalid_json", "incomplete_result"].includes(error?.providerReason)) return "Cloudflare no devolvió una identificación utilizable después de reintentar.";
    return `Cloudflare no respondió correctamente${status ? ` (${status})` : ""}.`;
  }
  if ([401, 403].includes(status)) return `Gemini no autorizó la clave (${status}). Revisa GEMINI_API_KEY y sus permisos.`;
  if (status === 429) return "Gemini alcanzó su cuota temporal (429). Revisa el uso y la facturación en Google AI Studio.";
  if (status === 404) return "El modelo de Gemini no está disponible para esta clave (404).";
  if (status === 400) return "Gemini rechazó la solicitud (400). Revisa que la clave pertenezca a Gemini API.";
  return `Gemini no respondió correctamente${status ? ` (${status})` : ""}.`;
};

async function analyzeWithGemini(apiKey, buffer, categories, mimeType) {
  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({
      contents: [{ parts: [
        { text: semanticPrompt(categories) },
        { inlineData: { mimeType, data: buffer.toString("base64") } }
      ] }],
      generationConfig: { temperature: 0.1, responseMimeType: "application/json", responseSchema: productSchema(categories) }
    })
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(`Gemini ${response.status}`);
    error.status = response.status;
    throw error;
  }
  const text = body.candidates?.[0]?.content?.parts?.find((part) => part.text)?.text;
  return normalizeSemanticResult(parseJsonResponse(text), categories);
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
  const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
  const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN?.trim();
  const geminiKey = process.env.GEMINI_API_KEY?.trim() || apiKey;
  let semanticError = "";

  if (cloudflareAccountId && cloudflareApiToken) {
    try {
      return {
        ...(await analyzeWithCloudflare(cloudflareAccountId, cloudflareApiToken, buffer, categories, mimeType)),
        analysisMode: "semantic",
        analysisProvider: "cloudflare"
      };
    } catch (error) {
      console.warn({ event: "cloudflare_product_analysis_fallback", message: error instanceof Error ? error.message : "unknown" });
      semanticError = semanticProviderError("Cloudflare", error);
    }
  } else if (cloudflareAccountId || cloudflareApiToken) {
    semanticError = "La configuración de Cloudflare está incompleta. Agrega CLOUDFLARE_ACCOUNT_ID y CLOUDFLARE_API_TOKEN.";
  }

  if (geminiKey) {
    try {
      return {
        ...(await analyzeWithGemini(geminiKey, buffer, categories, mimeType)),
        analysisMode: "semantic",
        analysisProvider: "gemini"
      };
    } catch (error) {
      console.warn({ event: "gemini_product_analysis_fallback", message: error instanceof Error ? error.message : "unknown" });
      semanticError ||= semanticProviderError("Gemini", error);
    }
  }

  if (apiKey) {
    return {
      ...(await analyzeWithCloudVision(apiKey, buffer, categories)),
      analysisMode: "basic",
      analysisProvider: "cloud-vision",
      semanticError: semanticError || "No hay un motor semántico disponible. Configura Cloudflare Workers AI."
    };
  }

  throw httpError(502, semanticError || "No se pudo usar el análisis semántico. Revisa la configuración de Cloudflare Workers AI.", "SEMANTIC_ANALYSIS_UNAVAILABLE");
}
