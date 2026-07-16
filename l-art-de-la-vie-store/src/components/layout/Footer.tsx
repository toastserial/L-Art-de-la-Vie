import { Instagram, MapPin, ArrowUp } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { config, hasWhatsapp } from "@/lib/config";
import { whatsappHelloUrl } from "@/lib/whatsapp";

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M19.6 6.7a5.6 5.6 0 0 1-3.4-1.2 5.5 5.5 0 0 1-2-3.5H11v13.3a2.6 2.6 0 1 1-2.6-2.6c.3 0 .6 0 .8.1V9.6a5.9 5.9 0 1 0 5 5.8V9.9a8.3 8.3 0 0 0 5.4 1.8V8.3a5.4 5.4 0 0 1-.6-.1z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer id="visitanos" className="mt-24 bg-[color:var(--forest)] text-[color:var(--cream)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <Logo size={48} />
              <div>
                <div className="font-serif text-2xl italic">L’Art de la Vie</div>
                <div className="text-xs uppercase tracking-[0.28em] text-[color:var(--gold)]">
                  Lujo Accesible
                </div>
              </div>
            </div>
            <p className="mt-6 max-w-sm font-serif text-lg italic leading-relaxed text-[color:var(--cream)]/85">
              “Detalles que hacen de la vida un arte.”
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-xs uppercase tracking-[0.28em] text-[color:var(--gold)]">
              Visítanos
            </h4>
            <p className="text-sm leading-relaxed text-[color:var(--cream)]/85">
              {config.storeAddress}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-[color:var(--cream)]/70">
              {config.storeHours}
            </p>
            {config.googleMapsUrl ? (
              <a
                href={config.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm text-[color:var(--gold)] underline-offset-4 hover:underline"
              >
                <MapPin className="h-4 w-4" /> Ver en Google Maps
              </a>
            ) : null}
          </div>

          <div>
            <h4 className="mb-4 text-xs uppercase tracking-[0.28em] text-[color:var(--gold)]">
              Síguenos
            </h4>
            <div className="flex flex-wrap gap-3">
              {config.instagramUrl ? (
                <a
                  href={config.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="inline-grid h-11 w-11 place-items-center rounded-full border border-white/20 transition hover:border-[color:var(--gold)] hover:text-[color:var(--gold)]"
                >
                  <Instagram className="h-5 w-5" />
                </a>
              ) : null}
              {config.tiktokProfileUrl ? (
                <a
                  href={config.tiktokProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="inline-grid h-11 w-11 place-items-center rounded-full border border-white/20 transition hover:border-[color:var(--gold)] hover:text-[color:var(--gold)]"
                >
                  <TikTokIcon className="h-5 w-5" />
                </a>
              ) : null}
              {hasWhatsapp() ? (
                <a
                  href={whatsappHelloUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="inline-flex min-h-11 items-center rounded-full border border-white/20 px-4 text-sm transition hover:border-[color:var(--gold)] hover:text-[color:var(--gold)]"
                >
                  WhatsApp {config.whatsappDisplay ? `· ${config.whatsappDisplay}` : ""}
                </a>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-[color:var(--cream)]/60">
            © {new Date().getFullYear()} L’Art de la Vie · Siguatepeque, Comayagua
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.24em] transition hover:border-[color:var(--gold)] hover:text-[color:var(--gold)]"
          >
            <ArrowUp className="h-3.5 w-3.5" /> Volver arriba
          </button>
        </div>
      </div>
    </footer>
  );
}
