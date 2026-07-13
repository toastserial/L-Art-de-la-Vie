import cors from "cors";
import express from "express";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { closeFromDb, expenseFromDb, movementFromDb, openingFromDb, productFromDb, saleFromDb } from "./mappers.js";
import { storeId, supabase, unwrap } from "./supabase.js";
import { httpError, number, text } from "./validation.js";
import { requireAuth, requireRole } from "./auth.js";

const categories = ["Decoración", "Perfumes", "Carteras", "Varios"];
const paymentMethods = ["efectivo", "tarjeta", "transferencia"];

const asyncRoute = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
const firstRow = (value) => Array.isArray(value) ? value[0] : value;
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
  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) return callback(null, true);
      return callback(httpError(403, "Origen no permitido por CORS"));
    }
  }));
  app.use(express.json({ limit: "100kb" }));
  app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: "draft-8", legacyHeaders: false }));

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
    id: req.auth.userId, email: req.auth.email, fullName: req.auth.fullName, role: req.auth.role
  }));

  app.get("/api/store", asyncRoute(async (_req, res) => {
    const results = await Promise.all([
      supabase.from("stores").select("timezone").eq("id", storeId).single(),
      supabase.from("cash_openings").select("*").eq("store_id", storeId).order("business_date", { ascending: false }),
      supabase.from("products").select("*").eq("store_id", storeId).eq("active", true).order("name"),
      supabase.from("sales").select("*, sale_items(*)").eq("store_id", storeId).order("created_at", { ascending: false }),
      supabase.from("inventory_movements").select("*").eq("store_id", storeId).order("created_at", { ascending: false }),
      supabase.from("cash_closes").select("*, cash_close_expenses(expenses(*))").eq("store_id", storeId).order("business_date", { ascending: false }),
      supabase.from("expenses").select("*, cash_close_expenses(expense_id)").eq("store_id", storeId).order("created_at", { ascending: false })
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
      opening_cash: number(req.body.openingCash, "Fondo inicial"), note: req.body.note ? text(req.body.note, "Nota") : null
    };
    const opening = unwrap(await supabase.from("cash_openings").insert(values).select().single());
    res.status(201).json(openingFromDb(opening));
  }));

  app.post("/api/products", requireRole("owner", "admin"), asyncRoute(async (req, res) => {
    if (!categories.includes(req.body.category)) throw httpError(400, "Categoría inválida");
    const values = {
      store_id: storeId, name: text(req.body.name, "Nombre"),
      category: req.body.category, price: number(req.body.price, "Precio"), stock: number(req.body.stock, "Stock"),
      min_stock: number(req.body.minStock, "Stock mínimo"), image_url: req.body.image || null
    };
    res.status(201).json(productFromDb(unwrap(await supabase.from("products").insert(values).select().single())));
  }));

  app.put("/api/products/:id", requireRole("owner", "admin"), asyncRoute(async (req, res) => {
    if (!categories.includes(req.body.category)) throw httpError(400, "Categoría inválida");
    const values = {
      name: text(req.body.name, "Nombre"), category: req.body.category,
      price: number(req.body.price, "Precio"), stock: number(req.body.stock, "Stock"),
      min_stock: number(req.body.minStock, "Stock mínimo"), image_url: req.body.image || null
    };
    const result = await supabase.from("products").update(values).eq("store_id", storeId).eq("id", req.params.id).select().single();
    res.json(productFromDb(unwrap(result)));
  }));

  app.delete("/api/products/:id", requireRole("owner", "admin"), asyncRoute(async (req, res) => {
    unwrap(await supabase.from("products").update({ active: false }).eq("store_id", storeId).eq("id", req.params.id).select("id").single());
    res.status(204).end();
  }));

  app.post("/api/movements", requireRole("owner", "admin"), asyncRoute(async (req, res) => {
    if (!['entrada', 'salida'].includes(req.body.type)) throw httpError(400, "Tipo de movimiento inválido");
    const quantity = number(req.body.quantity, "Cantidad", 1);
    if (!Number.isInteger(quantity)) throw httpError(400, "La cantidad debe ser entera");
    const movement = unwrap(await supabase.rpc("register_inventory_movement", {
      requested_store_id: storeId, requested_product_id: req.body.productId,
      movement_type: req.body.type, movement_quantity: quantity, movement_note: req.body.note || null
    }));
    await supabase.from("inventory_movements").update({ created_by: req.auth.userId }).eq("id", firstRow(movement).id);
    res.status(201).json(movementFromDb(firstRow(movement)));
  }));

  app.post("/api/sales", asyncRoute(async (req, res) => {
    if (!paymentMethods.includes(req.body.paymentMethod)) throw httpError(400, "Método de pago inválido");
    if (!Array.isArray(req.body.items) || req.body.items.length === 0) throw httpError(400, "El carrito está vacío");
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
      requested_items: req.body.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      requested_payment_method: req.body.paymentMethod,
      discount_percent: number(req.body.discount ?? 0, "Descuento"),
      requested_cash_received: req.body.paymentMethod === "efectivo" ? number(req.body.cashReceived, "Efectivo recibido") : null
    }));
    await supabase.from("sales").update({ sold_by: req.auth.userId }).eq("id", created.id);
    res.status(201).json(await loadSale(created.id));
  }));

  app.post("/api/expenses", asyncRoute(async (req, res) => {
    const values = { store_id: storeId, created_by: req.auth.userId, description: text(req.body.description, "Descripción"), amount: number(req.body.amount, "Monto", 0.01) };
    res.status(201).json(expenseFromDb(unwrap(await supabase.from("expenses").insert(values).select().single())));
  }));

  app.delete("/api/expenses/:id", requireRole("owner", "admin"), asyncRoute(async (req, res) => {
    const deleted = unwrap(await supabase.rpc("delete_open_expense", { requested_store_id: storeId, requested_expense_id: req.params.id }));
    if (!deleted) throw httpError(409, "El gasto no existe o ya fue incluido en un cierre de caja");
    res.status(204).end();
  }));

  app.post("/api/cash-closes", requireRole("owner", "admin"), asyncRoute(async (req, res) => {
    const created = unwrap(await supabase.rpc("close_cash", { requested_store_id: storeId, requested_actual_cash: number(req.body.actualCash, "Efectivo real") }));
    await supabase.from("cash_closes").update({ closed_by: req.auth.userId }).eq("id", firstRow(created).id);
    res.status(201).json(await loadClose(firstRow(created).id));
  }));

  app.use((_req, res) => res.status(404).json({ message: "Ruta no encontrada" }));
  app.use((error, _req, res, _next) => {
    console.error(error);
    res.status(error.status ?? 500).json({ message: error.message || "Error interno del servidor" });
  });
  return app;
}
