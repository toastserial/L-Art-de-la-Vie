import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import hero1 from "@/assets/hero-1.jpg";
import hero2 from "@/assets/hero-2.jpg";
import hero3 from "@/assets/hero-3.jpg";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useIsMobile } from "@/hooks/use-mobile";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const reduced = prefersReducedMotion || isMobile;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y1 = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [40, -40]);
  const y2 = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-30, 30]);
  const y3 = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [20, -20]);

  return (
    <section ref={ref} className="relative overflow-hidden bg-[color:var(--cream)]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 py-16 md:py-24 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col justify-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-[color:var(--forest-2)]">
            <span className="h-px w-8 bg-[color:var(--gold)]" />
            Lujo Accesible · Siguatepeque
          </div>
          <h1 className="font-serif text-4xl leading-[1.05] text-[color:var(--ink)] sm:text-5xl md:text-6xl lg:text-[4.25rem]">
            Convierte cada rincón en una experiencia <br className="hidden sm:block" />
            <em className="font-serif italic text-[color:var(--forest)]">única y armoniosa.</em>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-[color:var(--ink-muted)] sm:text-lg">
            Decoración, aromas y accesorios elegidos para convertir lo cotidiano en algo especial.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#coleccion"
              className="group inline-flex min-h-11 items-center gap-3 rounded-full bg-[color:var(--forest)] px-6 py-3 text-sm font-medium text-[color:var(--cream)] transition hover:bg-[color:var(--forest-2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--cream)]"
            >
              Explorar colección
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
            <a
              href="#inspiracion"
              className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[color:var(--forest)] underline-offset-4 hover:underline"
            >
              Ver inspiración
            </a>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 border-t border-[color:var(--border)] pt-8 sm:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--forest-2)]">
                Existencias reales
              </div>
              <p className="mt-1 text-sm text-[color:var(--ink-muted)]">
                Catálogo sincronizado con el inventario de la tienda.
              </p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--forest-2)]">
                Atención personal
              </div>
              <p className="mt-1 text-sm text-[color:var(--ink-muted)]">
                Coordinamos tu pedido y entrega directamente contigo.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Composition */}
        <div className="relative min-h-[420px] sm:min-h-[520px] lg:min-h-[620px]">
          <motion.div
            style={{ y: y1 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-0 w-[62%]"
          >
            <div className="overflow-hidden rounded-b-[999px] rounded-t-lg shadow-[var(--shadow-card)]">
              <motion.img
                src={hero1}
                alt="Vela artesanal y objetos de decoración"
                loading="eager"
                className="aspect-[3/4] w-full object-cover"
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                transition={{
                  duration: 12,
                  ease: "easeInOut",
                  repeat: reduced ? 0 : Infinity,
                  repeatType: "reverse",
                }}
              />
            </div>
          </motion.div>
          <motion.div
            style={{ y: y2 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 top-24 w-[48%] sm:top-32"
          >
            <div className="overflow-hidden rounded-lg shadow-[var(--shadow-card)]">
              <motion.img
                src={hero2}
                alt="Cartera de cuero contra pared verde"
                className="aspect-[4/5] w-full object-cover"
                initial={{ scale: 1 }}
                animate={{ scale: 1.04 }}
                transition={{
                  duration: 14,
                  ease: "easeInOut",
                  repeat: reduced ? 0 : Infinity,
                  repeatType: "reverse",
                }}
              />
            </div>
          </motion.div>
          <motion.div
            style={{ y: y3 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-0 right-8 w-[40%]"
          >
            <div className="overflow-hidden rounded-lg border border-[color:var(--gold)]/30 shadow-[var(--shadow-card)]">
              <img
                src={hero3}
                alt="Frasco de perfume ámbar sobre mármol"
                className="aspect-[3/4] w-full object-cover"
              />
            </div>
          </motion.div>
          <div
            aria-hidden
            className="absolute -bottom-6 left-2 hidden font-serif text-[10rem] italic leading-none text-[color:var(--forest)]/5 sm:block"
          >
            L
          </div>
        </div>
      </div>
    </section>
  );
}
