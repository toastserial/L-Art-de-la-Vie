import { config } from "./config";
import { formatL } from "./currency";
import type { CartItem } from "@/types/product";

export interface CheckoutInfo {
  name: string;
  phone: string;
  delivery: "pickup" | "shipping";
  address?: string;
  note?: string;
}

export function buildOrderMessage(items: CartItem[], info: CheckoutInfo): string {
  const lines = items.map(
    (it) => `• ${it.quantity} x ${it.name} — ${formatL(it.price * it.quantity)}`,
  );
  const total = items.reduce((s, it) => s + it.price * it.quantity, 0);
  const parts = [
    "Hola, L’Art de la Vie 🌿 Quiero confirmar este pedido:",
    "",
    ...lines,
    "",
    `Total: ${formatL(total)}`,
    `Cliente: ${info.name}`,
    `Teléfono: ${info.phone}`,
    `Entrega: ${info.delivery === "pickup" ? "Recoger en tienda" : "Envío nacional"}`,
  ];
  if (info.delivery === "shipping" && info.address) {
    parts.push(`Dirección: ${info.address}`);
  }
  if (info.note) parts.push(`Nota: ${info.note}`);
  parts.push("", "Entiendo que la disponibilidad y el pago serán confirmados por la tienda.");
  return parts.join("\n");
}

export function whatsappUrl(message: string): string {
  const num = config.whatsappNumber.replace(/[^\d]/g, "");
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

export function whatsappHelloUrl(): string {
  const num = config.whatsappNumber.replace(/[^\d]/g, "");
  const msg = encodeURIComponent("Hola, L’Art de la Vie 🌿 me gustaría más información.");
  return `https://wa.me/${num}?text=${msg}`;
}
