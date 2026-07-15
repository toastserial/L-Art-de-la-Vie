import cors from "cors";
import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { fileTypeFromBuffer } from "file-type";
import multer from "multer";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import swaggerUi from "swagger-ui-express";
import YAML from "yaml";
import { closeFromDb, expenseFromDb, movementFromDb, openingFromDb, productFromDb, saleFromDb } from "./mappers.js";
import { storeId, supabase, unwrap } from "./supabase.js";
import { httpError, integer, number, optionalText, text, uuid } from "./validation.js";
import { requireAuth, requireRole } from "./auth.js";

const categories = ["Decoración", "Perfumes", "Carteras", "Varios"];
const paymentMethods = ["efectivo", "tarjeta", "transferencia"];
const openApiDocument = YAML.parse(readFileSync(new URL("../docs/openapi.yaml", import.meta.url), "utf8"));
const imageBaseUrl = `${(process.env.SUPABASE_URL ?? "").replace(/\/$/, "")}/storage/v1/object/public/product-images/${storeId}/`;
const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 120, standardHeaders: "draft-8", legacyHeaders: false,
  skip: (req) => ["GET", "HEAD", "OPTIONS"].includes(req.method),
  message: { message: "Demasiadas operaciones. Espera unos minutos e intenta nuevamente." }
});
const imageLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, limit: 30, standardHeaders: "draft-8", legacyHeaders: false,
  message: { message: "Se alcanzó el límite de fotografías por hora." }
});
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 6 * 1024 * 1024, files: 1 },
  fileFilter(_req, file, callback) {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
    callback(allowed.includes(file.mimetype) ? null : httpError(400, "Formato de imagen no permitido"), allowed.includes(file.mimetype));
  }
});

const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
const firstRow = (value) => Array.isArray(value) ? value[0] : value;
const productImage = (value) => {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || value.length > 600 || !value.startsWith(imageBaseUrl)) {
    throw httpError(400, "La URL de la fotografía no es válida");
  }
  return value;
};
const productValues = (body) => {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw httpError(400, "Datos de producto inválidos");
  if (!categories.includes(body.category)) throw httpError(400, "Categoría inválida");
  return {
    name: text(body.name, "Nombre", 160), category: body.category,
    price: number(body.price, "Precio", 0, 100_000_000), stock: integer(body.stock, "Stock"),
    min_stock: integer(body.minStock, "Stock mínimo"), image_url: productImage(body.image)
  };
};
const saleItems = (value) => {
  if (!Array.isArray(value) || value.length === 0) throw httpError(400, "El carrito está vacío");
  if (value.length > 100) throw httpError(400, "Una venta no puede superar 100 productos diferentes");
  const seen = new Set();
  return value.map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) throw httpError(400, "Producto de venta inválido");
    const productId = uuid(item.productId, "Producto");
    if (seen.has(productId)) throw httpError(400, "El carrito contiene productos duplicados");
    seen.add(productId);
    return { productId, quantity: integer(item.quantity, "Cantidad", 1, 10_000) };
  });
};
const dateInTimezone = (value, timezone) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit"
  }).formatToParts(new Date(value));
  const part = (type) => parts.find((item) => item.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
};

async function loadSale(id) {
  return saleFromDb(unwrap(await supabase.from("sales").select("*, sale_items(*)").eq("id", id).single()));
}

async function loadClose(id) {
  return closeFromDb(unwrap(await supabase.from("cash_closes").select("*, cash_close_expenses(expenses(*))").eq("id", id).single()));
}

export function createApp() {
  const app = express();
  const allowedOrigins = (process.env.FRONTEND_ORIGIN ?? "http://localhost:8080")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""));
  app.set("trust proxy", 1);
  app.disable("x-powered-by");
  app.disable("etag");
  app.use(helmet());
  app.use((req, res, next) => {
    req.requestId = randomUUID();
    res.set("X-Request-Id", req.requestId);
    next();
  });
  app.use((req, res, next) => {
    const shouldLog = (req.path === "/api" || req.path.startsWith("/api/"))
      && req.path !== "/api/health"
      && req.method !== "OPTIONS";
    if (!shouldLog) return next();

    const startedAt = process.hrtime.bigint();
    res.once("finish", () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
      const entry = JSON.stringify({
        level: res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warning" : "info",
        event: "api_request",
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        status: res.statusCode,
        durationMs: Math.round(durationMs * 100) / 100,
        userId: req.auth?.userId ?? null,
        userName: req.auth?.fullName ?? null,
        role: req.auth?.role ?? null
      });
      if (res.statusCode >= 500) console.error(entry);
      else if (res.statusCode >= 400) console.warn(entry);
      else console.info(entry);
    });
    next();
  });
  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) return callback(null, true);
      return callback(httpError(403, "Origen no permitido por CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
    maxAge: 86400
  }));
  app.use(express.json({ limit: "100kb" }));
  app.use("/api", (req, _res, next) => {
    const needsJson = ["POST", "PUT", "PATCH"].includes(req.method) && req.path !== "/product-images";
    if (needsJson && !req.is("application/json")) return next(httpError(415, "La solicitud debe usar application/json"));
    if (needsJson && (!req.body || typeof req.body !== "object" || Array.isArray(req.body))) {
      return next(httpError(400, "El cuerpo de la solicitud no es válido"));
    }
    next();
  });
  app.use("/api", (_req, res, next) => {
    res.set("Cache-Control", "no-store, max-age=0");
    res.set("Pragma", "no-cache");
    next();
  });
  app.use("/api", rateLimit({
    windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: "draft-8", legacyHeaders: false,
    skip: (req) => req.method === "OPTIONS",
    message: { message: "Demasiadas solicitudes. Espera unos minutos e intenta nuevamente." }
  }));
  app.use("/api", writeLimiter);

  app.get("/api-docs.json", (_req, res) => res.json(openApiDocument));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument, {
    customSiteTitle: "L'Art de la Vie API",
    swaggerOptions: { persistAuthorization: true, displayRequestDuration: true }
  }));

  app.get("/", (_req, res) => res.json({
    name: "L'Art de la Vie API",
    status: "online",
    health: "/api/health"
  }));

  app.get("/api/health", asyncRoute(async (_req, res) => {
    unwrap(await supabase.from("stores").select("id").eq("id", storeId).single());
    res.json({ status: "ok", database: "supabase" });
  }));

  app.use("/api", requireAuth);
  app.get("/api/auth/me", (req, res) => res.json({
    fullName: req.auth.fullName, role: req.auth.role
  }));

  app.get("/api/store", asyncRoute(async (_req, res) => {
    const results = await Promise.all([
      supabase.from("stores").select("timezone").eq("id", storeId).single(),
      supabase.from("cash_openings").select("id,business_date,opening_cash,note,created_at").eq("store_id", storeId).order("business_date", { ascending: false }).limit(370),
      supabase.from("products").select("id,code,name,category,price,stock,min_stock,image_url").eq("store_id", storeId).eq("active", true).order("name").limit(2000),
      supabase.from("sales").select("id,folio,created_at,subtotal,discount,total,payment_method,cash_received,change_amount,sale_items(product_id,product_name,quantity,unit_price,subtotal)").eq("store_id", storeId).order("created_at", { ascending: false }).limit(500),
      supabase.from("inventory_movements").select("id,product_id,product_name,type,quantity,note,created_at").eq("store_id", storeId).order("created_at", { ascending: false }).limit(500),
      supabase.from("cash_closes").select("id,business_date,opening_cash,total_sales,cash_sales,card_sales,transfer_sales,total_expenses,expected_cash,actual_cash,difference,created_at,cash_close_expenses(expenses(id,description,amount,created_at))").eq("store_id", storeId).order("business_date", { ascending: false }).limit(370),
      supabase.from("expenses").select("id,description,amount,created_at,cash_close_expenses(expense_id)").eq("store_id", storeId).order("created_at", { ascending: false }).limit(500)
    ]);
    const [store, openings, products, sales, movements, closes, expenses] = results.map(unwrap);
    const currentDate = dateInTimezone(new Date(), store.timezone);
    const todayOpening = openings.find((opening) => opening.business_date === currentDate);
    const todayClose = closes.find((close) => close.business_date === currentDate);
    const openExpenses = expenses.filter((expense) =>
      expense.cash_close_expenses.length === 0 && dateInTimezone(expense.created_at, store.timezone) === currentDate
    );
    res.json({
      products: products.map(productFromDb), sales: sales.map(saleFromDb),
      movements: movements.map(movementFromDb), cashCloses: closes.map(closeFromDb),
      todayExpenses: openExpenses.map(expenseFromDb),
      cashOpening: todayOpening ? openingFromDb(todayOpening) : todayClose ? {
        id: todayClose.id, date: todayClose.business_date, openingCash: Number(todayClose.opening_cash), openedAt: todayClose.created_at
      } : null
    });
  }));

  app.post("/api/cash-openings", asyncRoute(async (req, res) => {
    const store = unwrap(await supabase.from("stores").select("timezone").eq("id", storeId).single());
    const businessDate = dateInTimezone(new Date(), store.timezone);
    const existingClose = unwrap(await supabase.from("cash_closes").select("id").eq("store_id", storeId).eq("business_date", businessDate).maybeSingle());
    if (existingClose) throw httpError(409, "La caja de hoy ya fue cerrada");
    const values = {
      store_id: storeId, business_date: businessDate, opened_by: req.auth.userId,
      opening_cash: number(req.body.openingCash, "Fondo inicial", 0, 100_000_000),
      note: optionalText(req.body.note, "Nota", 300)
    };
    const opening = unwrap(await supabase.from("cash_openings").insert(values).select().single());
    res.status(201).json(openingFromDb(opening));
  }));

  app.post("/api/products", requireRole("owner", "admin"), asyncRoute(async (req, res) => {
    const values = { store_id: storeId, ...productValues(req.body) };
    res.status(201).json(productFromDb(unwrap(await supabase.from("products").insert(values).select().single())));
  }));

  app.post("/api/product-images", requireRole("owner", "admin"), imageLimiter, imageUpload.single("image"), asyncRoute(async (req, res) => {
    if (!req.file) throw httpError(400, "Selecciona una fotografía");
    const detected = await fileTypeFromBuffer(req.file.buffer);
    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);
    if (!detected || !allowedTypes.has(detected.mime)) throw httpError(400, "El archivo no contiene una fotografía válida");
    const safeExtension = detected.ext === "jpeg" ? "jpg" : detected.ext;
    const objectPath = `${storeId}/${randomUUID()}.${safeExtension}`;
    unwrap(await supabase.storage.from("product-images").upload(objectPath, req.file.buffer, {
      contentType: detected.mime, cacheControl: "31536000", upsert: false
    }));
    const { data } = supabase.storage.from("product-images").getPublicUrl(objectPath);
    res.status(201).json({ url: data.publicUrl });
  }));

  app.put("/api/products/:id", requireRole("owner", "admin"), asyncRoute(async (req, res) => {
    const productId = uuid(req.params.id, "Producto");
    const result = await supabase.from("products").update(productValues(req.body)).eq("store_id", storeId).eq("id", productId).select().single();
    res.json(productFromDb(unwrap(result)));
  }));

  app.delete("/api/products/:id", requireRole("owner", "admin"), asyncRoute(async (req, res) => {
    const productId = uuid(req.params.id, "Producto");
    unwrap(await supabase.from("products").update({ active: false }).eq("store_id", storeId).eq("id", productId).select("id").single());
    res.status(204).end();
  }));

  app.post("/api/movements", requireRole("owner", "admin"), asyncRoute(async (req, res) => {
    if (!['entrada', 'salida'].includes(req.body.type)) throw httpError(400, "Tipo de movimiento inválido");
    const quantity = integer(req.body.quantity, "Cantidad", 1, 1_000_000);
    const movement = unwrap(await supabase.rpc("register_inventory_movement", {
      requested_store_id: storeId, requested_product_id: uuid(req.body.productId, "Producto"),
      movement_type: req.body.type, movement_quantity: quantity, movement_note: optionalText(req.body.note, "Nota", 300)
    }));
    await supabase.from("inventory_movements").update({ created_by: req.auth.userId }).eq("id", firstRow(movement).id);
    res.status(201).json(movementFromDb(firstRow(movement)));
  }));

  app.post("/api/sales", asyncRoute(async (req, res) => {
    if (!paymentMethods.includes(req.body.paymentMethod)) throw httpError(400, "Método de pago inválido");
    const items = saleItems(req.body.items);
    const store = unwrap(await supabase.from("stores").select("timezone").eq("id", storeId).single());
    const businessDate = dateInTimezone(new Date(), store.timezone);
    const [opening, close] = await Promise.all([
      supabase.from("cash_openings").select("id").eq("store_id", storeId).eq("business_date", businessDate).maybeSingle(),
      supabase.from("cash_closes").select("id").eq("store_id", storeId).eq("business_date", businessDate).maybeSingle()
    ]).then((results) => results.map(unwrap));
    if (!opening) throw httpError(409, "Debes abrir la caja antes de realizar ventas");
    if (close) throw httpError(409, "La caja de hoy ya fue cerrada");
    const created = unwrap(await supabase.rpc("complete_sale", {
      requested_store_id: storeId,
      requested_items: items,
      requested_payment_method: req.body.paymentMethod,
      discount_percent: number(req.body.discount ?? 0, "Descuento", 0, 100),
      requested_cash_received: req.body.paymentMethod === "efectivo" ? number(req.body.cashReceived, "Efectivo recibido", 0, 100_000_000) : null
    }));
    await supabase.from("sales").update({ sold_by: req.auth.userId }).eq("id", created.id);
    res.status(201).json(await loadSale(created.id));
  }));

  app.post("/api/expenses", asyncRoute(async (req, res) => {
    const values = { store_id: storeId, created_by: req.auth.userId, description: text(req.body.description, "Descripción", 300), amount: number(req.body.amount, "Monto", 0.01, 100_000_000) };
    res.status(201).json(expenseFromDb(unwrap(await supabase.from("expenses").insert(values).select().single())));
  }));

  app.delete("/api/expenses/:id", requireRole("owner", "admin"), asyncRoute(async (req, res) => {
    const deleted = unwrap(await supabase.rpc("delete_open_expense", { requested_store_id: storeId, requested_expense_id: uuid(req.params.id, "Gasto") }));
    if (!deleted) throw httpError(409, "El gasto no existe o ya fue incluido en un cierre de caja");
    res.status(204).end();
  }));

  app.post("/api/cash-closes", requireRole("owner", "admin"), asyncRoute(async (req, res) => {
    const created = unwrap(await supabase.rpc("close_cash", { requested_store_id: storeId, requested_actual_cash: number(req.body.actualCash, "Efectivo real", 0, 100_000_000) }));
    await supabase.from("cash_closes").update({ closed_by: req.auth.userId }).eq("id", firstRow(created).id);
    res.status(201).json(await loadClose(firstRow(created).id));
  }));

  app.use((_req, res) => res.status(404).json({ message: "Ruta no encontrada" }));
  app.use((error, req, res, _next) => {
    if (error instanceof multer.MulterError) {
      const message = error.code === "LIMIT_FILE_SIZE" ? "La fotografía no puede superar 6 MB" : "No se pudo procesar la fotografía";
      return res.status(400).json({ message });
    }
    const malformedJson = error?.type === "entity.parse.failed";
    const status = malformedJson ? 400 : Number.isInteger(error?.status) ? error.status : 500;
    const message = malformedJson ? "El contenido JSON no es válido" : error?.expose ? error.message : "Error interno del servidor";
    if (status >= 500) {
      console.error(JSON.stringify({
        level: "error", event: "api_error", requestId: req.requestId, method: req.method, path: req.path,
        status, code: error?.code ?? "INTERNAL_ERROR", error: error?.message ?? "Unknown error"
      }));
    }
    res.status(status).json({ message, requestId: req.requestId });
  });
  return app;
}
