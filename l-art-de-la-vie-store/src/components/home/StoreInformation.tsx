import { MapPin, Clock, ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { config, hasWhatsapp } from "@/lib/config";
import { whatsappHelloUrl } from "@/lib/whatsapp";
import storeImg from "@/assets/store.jpg";
import { motion } from "framer-motion";
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon";

export function StoreInformation() {
  return (
    <section className="bg-[color:var(--cream)]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 sm:px-6 py-20 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        <div className="flex flex-col justify-center">
          <SectionHeading
            eyebrow="Visítanos"
            title={
              <>
                Una pausa bonita en el corazón de <em className="italic">Siguatepeque</em>.
              </>
            }
            description="Pasa a conocernos, elige en persona y déjate acompañar por nuestro equipo."
          />

          <ul className="mt-10 space-y-6">
            <li className="flex items-start gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color:var(--paper)] text-[color:var(--forest)]">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--forest-2)]">
                  Dirección
                </div>
                <p className="mt-1 text-[color:var(--ink)]">{config.storeAddress}</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color:var(--paper)] text-[color:var(--forest)]">
                <Clock className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--forest-2)]">
                  Horarios
                </div>
                <p className="mt-1 text-[color:var(--ink)]">{config.storeHours}</p>
              </div>
            </li>
            {hasWhatsapp() ? (
              <li className="flex items-start gap-4">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color:var(--paper)] text-[color:var(--forest)]">
                  <WhatsAppIcon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--forest-2)]">
                    WhatsApp
                  </div>
                  <a
                    href={whatsappHelloUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-[color:var(--ink)] underline-offset-4 hover:underline"
                  >
                    {config.whatsappDisplay || "Escríbenos"}
                  </a>
                </div>
              </li>
            ) : null}
          </ul>

          <div className="mt-10">
            <a
              href={config.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[color:var(--forest)] px-6 py-3 text-sm font-medium text-[color:var(--cream)] transition hover:bg-[color:var(--forest-2)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]"
            >
              Ver cómo llegar
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <div className="overflow-hidden rounded-lg shadow-[var(--shadow-card)]">
            <img
              src={storeImg}
              alt="Interior de la boutique L’Art de la Vie"
              className="aspect-[4/5] w-full object-cover lg:aspect-[5/6]"
            />
          </div>
          <div className="absolute -bottom-6 left-6 right-6 rounded-lg border border-[color:var(--gold)]/30 bg-[color:var(--paper)] p-5 shadow-[var(--shadow-card)] sm:right-auto sm:max-w-xs">
            <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--forest-2)]">
              Hoy
            </div>
            <p className="mt-2 font-serif text-lg italic text-[color:var(--forest)]">
              Te esperamos con una taza de café.
            </p>
            <p className="mt-2 text-sm text-[color:var(--ink-muted)]">{config.storeHours}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
