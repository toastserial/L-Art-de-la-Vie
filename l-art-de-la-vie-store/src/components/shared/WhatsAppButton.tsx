import { config, hasWhatsapp } from "@/lib/config";
import { whatsappHelloUrl } from "@/lib/whatsapp";
import { motion } from "framer-motion";
import { WhatsAppIcon } from "./WhatsAppIcon";

export function WhatsAppButton({ hidden = false }: { hidden?: boolean }) {
  if (!hasWhatsapp()) return null;
  return (
    <motion.a
      href={whatsappHelloUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Escribir por WhatsApp a ${config.whatsappDisplay || "la tienda"}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{
        opacity: hidden ? 0 : 1,
        y: hidden ? 12 : 0,
        pointerEvents: hidden ? "none" : "auto",
      }}
      transition={{ duration: 0.25 }}
      className="fixed right-4 z-40 inline-flex items-center gap-2 rounded-full bg-[color:var(--forest)] py-3 pr-4 pl-3 text-sm font-medium text-[color:var(--cream)] shadow-[var(--shadow-card)] transition hover:bg-[color:var(--forest-2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
    >
      <span className="grid h-8 w-8 place-items-center rounded-full bg-[color:var(--gold)] text-[color:var(--forest)]">
        <WhatsAppIcon className="h-4.5 w-4.5" />
      </span>
      <span className="hidden sm:inline">Hola, ¿te ayudamos?</span>
    </motion.a>
  );
}
