import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, LoaderCircle, MapPinned, PackageCheck, Play, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { config } from "@/lib/config";

const TIKTOK_SCRIPT_ID = "tiktok-embed-script";

function usernameFromProfileUrl(profileUrl: string) {
  return profileUrl.match(/tiktok\.com\/@([^/?#]+)/i)?.[1] ?? "";
}

export function MarketingVideos() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const username = useMemo(() => usernameFromProfileUrl(config.tiktokProfileUrl), []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || isNearViewport) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsNearViewport(true);
        observer.disconnect();
      },
      { rootMargin: "300px 0px" },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [isNearViewport]);

  useEffect(() => {
    if (!isNearViewport || !username || document.getElementById(TIKTOK_SCRIPT_ID)) return;

    const script = document.createElement("script");
    script.id = TIKTOK_SCRIPT_ID;
    script.src = "https://www.tiktok.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
  }, [isNearViewport, username]);

  return (
    <section
      ref={sectionRef}
      id="inspiracion"
      className="scroll-mt-24 bg-[color:var(--forest)] text-[color:var(--cream)]"
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            onDark
            eyebrow="Inspiración"
            title={
              <>
                Lo nuevo de nuestra <em className="italic">comunidad</em>.
              </>
            }
            description="Los videos recientes se actualizan automáticamente cuando publicamos en TikTok."
          />
          {config.tiktokProfileUrl ? (
            <a
              href={config.tiktokProfileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-[color:var(--gold)]/60 px-5 py-2.5 text-sm text-[color:var(--gold)] transition hover:bg-[color:var(--gold)] hover:text-[color:var(--forest)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]"
            >
              Ver perfil en TikTok
              <ArrowUpRight className="h-4 w-4" />
            </a>
          ) : null}
        </div>

        {username ? (
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(288px,520px)_1fr] lg:gap-12">
            <div className="min-h-[470px] w-full overflow-hidden rounded-2xl border border-white/10 bg-white shadow-xl shadow-black/15">
              {isNearViewport ? (
                <blockquote
                  className="tiktok-embed"
                  cite={config.tiktokProfileUrl}
                  data-unique-id={username}
                  data-embed-type="creator"
                  style={{ maxWidth: "520px", minWidth: "288px", margin: 0 }}
                >
                  <section>
                    <a
                      href={`${config.tiktokProfileUrl}?refer=creator_embed`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      @{username}
                    </a>
                  </section>
                </blockquote>
              ) : (
                <div className="grid min-h-[470px] place-items-center bg-[color:var(--paper)] text-[color:var(--forest)]">
                  <div className="text-center">
                    <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-[color:var(--gold)]" />
                    <p className="mt-4 text-sm">Preparando inspiración…</p>
                  </div>
                </div>
              )}
            </div>

            <aside className="rounded-2xl border border-white/15 bg-white/[0.06] p-6 sm:p-8">
              <span className="text-xs uppercase tracking-[0.26em] text-[color:var(--gold)]">
                Del video a tus manos
              </span>
              <h3 className="mt-4 max-w-md font-serif text-3xl italic sm:text-4xl">
                ¿Viste algo que te encantó?
              </h3>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/70 sm:text-base">
                Escríbenos con una captura o el nombre del producto. Confirmamos existencias y
                coordinamos la entrega contigo.
              </p>

              <ul className="mt-7 space-y-4">
                {[
                  { icon: Sparkles, text: "Novedades reales desde nuestra tienda" },
                  { icon: PackageCheck, text: "Disponibilidad confirmada por WhatsApp" },
                  { icon: MapPinned, text: "Envíos a ciudades de toda Honduras" },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3 text-sm text-white/85">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-[color:var(--gold)]">
                      <Icon className="h-4 w-4" />
                    </span>
                    {text}
                  </li>
                ))}
              </ul>

              <a
                href={config.tiktokProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-[color:var(--gold)] px-5 text-sm font-medium text-[color:var(--forest)] transition hover:bg-[color:var(--cream)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                Explorar en TikTok
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </aside>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/15 bg-white/5 px-6 py-12 text-center">
            <Play className="mx-auto h-9 w-9 text-[color:var(--gold)]" />
            <h3 className="mt-5 font-serif text-2xl italic">Conecta el perfil de TikTok</h3>
            <p className="mx-auto mt-3 max-w-lg text-sm text-white/65">
              Configura la URL completa del perfil para mostrar automáticamente sus videos
              recientes.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
