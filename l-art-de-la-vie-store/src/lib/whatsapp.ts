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

/**
 * WhatsApp only accepts a prefilled text message through wa.me; it cannot
 * attach files automatically, so the order keeps to its useful details.
 */
export function buildOrderMessage(items: CartItem[], info: CheckoutInfo): string {
  const productLines = items.map(
    (item) => `• ${item.quantity} × ${item.name} — ${formatL(item.price * item.quantity)}`,
  );
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = info.delivery === "pickup" ? "Recoger en tienda" : "Envío a Honduras";

  const parts = [
    "Hola 👋 Me gustaría confirmar este pedido de L'Art de la Vie.",
    "",
    "*PRODUCTOS*",
    ...productLines,
    "",
    "*RESUMEN*",
    `Total de productos: ${formatL(total)}`,
    `Entrega: ${delivery}`,
    "",
    "*DATOS DE CONTACTO*",
    `Nombre: ${info.name}`,
    `Teléfono: ${info.phone}`,
  ];

  if (info.delivery === "shipping" && info.address) parts.push(`Dirección: ${info.address}`);
  if (info.note) parts.push(`Nota: ${info.note}`);
  parts.push(
    "",
    "Por favor, confirmen disponibilidad, costo de envío y formas de pago. ¡Gracias!",
  );
  return parts.join("\n");
}

export function whatsappUrl(message: string): string {
  const num = config.whatsappNumber.replace(/[^\d]/g, "");
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

export function whatsappHelloUrl(): string {
  const num = config.whatsappNumber.replace(/[^\d]/g, "");
  const msg = encodeURIComponent(
    "Hola 👋 Me gustaría recibir asesoría sobre los productos de L'Art de la Vie. ¿Podrían ayudarme con disponibilidad, envíos y formas de pago?",
  );
  return `https://wa.me/${num}?text=${msg}`;
}
