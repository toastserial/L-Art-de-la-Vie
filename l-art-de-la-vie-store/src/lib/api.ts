import type { Product, Category } from "@/types/product";
import { CATEGORIES } from "@/types/product";
import { config } from "./config";

function isValidCategory(x: unknown): x is Category {
  return typeof x === "string" && (CATEGORIES as string[]).includes(x);
}

function normalize(raw: unknown): Product | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = typeof r.id === "string" ? r.id : null;
  const name = typeof r.name === "string" ? r.name : null;
  const price = typeof r.price === "number" ? r.price : Number(r.price);
  const stock = typeof r.stock === "number" ? r.stock : Number(r.stock);
  const image = typeof r.image === "string" ? r.image : null;
  const category = isValidCategory(r.category) ? r.category : "Varios";
  if (!id || !name || !Number.isFinite(price) || !Number.isFinite(stock)) {
    return null;
  }
  return {
    id,
    name,
    price,
    stock: Math.max(0, Math.floor(stock)),
    image: image ?? "",
    category,
  };
}

export async function fetchCatalog(signal?: AbortSignal): Promise<Product[]> {
  const res = await fetch(`${config.apiUrl}/catalog`, { signal });
  if (!res.ok) {
    throw new Error(`No se pudo cargar el catálogo (${res.status})`);
  }
  const data = (await res.json()) as { products?: unknown[] };
  const list = Array.isArray(data.products) ? data.products : [];
  return list.map(normalize).filter((p): p is Product => p !== null);
}
