import { Truck, Sparkles, HandCoins } from "lucide-react";
import { motion } from "framer-motion";

const items = [
  {
    icon: Truck,
    title: "Envíos en Honduras",
    desc: "Recoge en Siguatepeque o coordinamos el envío a otras ciudades del país.",
  },
  {
    icon: Sparkles,
    title: "Selección especial",
    desc: "Piezas con personalidad, seleccionadas una a una.",
  },
  {
    icon: HandCoins,
    title: "Pago flexible",
    desc: "Transferencia bancaria o coordinación directa por WhatsApp.",
  },
];

export function Benefits() {
  return (
    <section className="border-y border-[color:var(--border)] bg-[color:var(--paper)]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 py-14 sm:grid-cols-3 sm:gap-6">
        {items.map((it, i) => (
          <motion.div
            key={it.title}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="flex items-start gap-4"
          >
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[color:var(--cream)] text-[color:var(--forest)]">
              <it.icon className="h-5 w-5" strokeWidth={1.6} />
            </div>
            <div className="min-w-0">
              <h3 className="font-serif text-xl text-[color:var(--ink)]">{it.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-[color:var(--ink-muted)]">
                {it.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
