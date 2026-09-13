import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, LoaderCircle, MapPinned, PackageCheck, Play, Sparkles } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { config } from "@/lib/config";

const TIKTOK_SCRIPT_ID = "tiktok-embed-script";

function usernameFromProfileUrl(profileUrl: string) {
  return profileUrl.match(/tiktok\.com\/@([^/?#]+)/i)?.[1] ?? "";
}

export function MarketingVideos() {
  const embedRef = useRef<HTMLDivElement>(null);
  const [embedState, setEmbedState] = useState<"loading" | "ready" | "blocked">("loading");
  const username = useMemo(() => usernameFromProfileUrl(config.tiktokProfileUrl), []);

  useEffect(() => {
    if (!username) return;

    // El perfil se prepara desde que la página abre, no hasta que el usuario
    // hace scroll. Si TikTok responde con su protección de sobrecarga,
    // reemplazamos su mensaje técnico por una alternativa útil y limpia.
    const detectOverload = () => {
      const content = embedRef.current?.textContent?.toLowerCase() ?? "";
      if (content.includes("overload-protect") || content.includes("triggered")) {
        setEmbedState("blocked");
      }
    };
    const observer = new MutationObserver(detectOverload);
    if (embedRef.current) {
      observer.observe(embedRef.current, { childList: true, subtree: true, characterData: true });
    }

    const existing = document.getElementById(TIKTOK_SCRIPT_ID) as HTMLScriptElement | null;
    const script = existing ?? document.createElement("script");
    const onLoad = () => setEmbedState("ready");
    const onError = () => setEmbedState("blocked");
    script.addEventListener("load", onLoad);
    script.addEventListener("error", onError);

    if (!existing) {
      script.id = TIKTOK_SCRIPT_ID;
      script.src = "https://www.tiktok.com/embed.js";
      script.async = true;
      document.body.appendChild(script);
    } else {
      setEmbedState("ready");
    }

    const timeout = window.setTimeout(() => {
      if (!embedRef.current?.querySelector("iframe")) setEmbedState("blocked");
    }, 12_000);

    return () => {
      observer.disconnect();
      script.removeEventListener("load", onLoad);
      script.removeEventListener("error", onError);
      window.clearTimeout(timeout);
    };
  }, [username]);

  return (
    <section id="inspiracion" className="scroll-mt-24 bg-[color:var(--forest)] text-[color:var(--cream)]">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-16">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            onDark
            eyebrow="Inspiración"
            title={<>Lo nuevo de nuestra <em className="italic">comunidad</em>.</>}
            description="Los videos se preparan al abrir la página para que estén listos cuando llegues aquí."
          />
          {config.tiktokProfileUrl ? (
            <a href={config.tiktokProfileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-[color:var(--gold)]/60 px-5 py-2.5 text-sm text-[color:var(--gold)] transition hover:bg-[color:var(--gold)] hover:text-[color:var(--forest)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]">
              Ver perfil en TikTok <ArrowUpRight className="h-4 w-4" />
            </a>
          ) : null}
        </div>

        {username ? (
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(288px,520px)_1fr] lg:gap-12">
            <div className="min-h-[470px] w-full overflow-hidden rounded-2xl border border-white/10 bg-white shadow-xl shadow-black/15">
              {embedState === "blocked" ? (
                <div className="grid min-h-[470px] place-items-center bg-[color:var(--paper)] px-6 text-[color:var(--forest)]">
                  <div className="max-w-sm text-center">
                    <Play className="mx-auto h-9 w-9 text-[color:var(--gold)]" />
                    <p className="mt-4 font-serif text-xl italic">TikTok está recibiendo muchas visitas.</p>
                    <p className="mt-2 text-sm text-[color:var(--ink-muted)]">Abre el perfil para ver los videos sin esperar.</p>
                    <a href={config.tiktokProfileUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[color:var(--forest)] px-5 text-sm font-medium text-[color:var(--cream)] transition hover:bg-[color:var(--forest-2)]">
                      Abrir TikTok <ArrowUpRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              ) : (
                <div ref={embedRef} className="relative min-h-[470px]">
                  {embedState === "loading" ? (
                    <div className="absolute inset-0 z-10 grid place-items-center bg-[color:var(--paper)] text-[color:var(--forest)]">
                      <div className="text-center">
                        <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-[color:var(--gold)]" />
                        <p className="mt-4 text-sm">Cargando los videos más recientes…</p>
                      </div>
                    </div>
                  ) : null}
                  <blockquote className="tiktok-embed" cite={config.tiktokProfileUrl} data-unique-id={username} data-embed-type="creator" style={{ maxWidth: "520px", minWidth: "288px", margin: 0 }}>
                    <section>
                      <a href={`${config.tiktokProfileUrl}?refer=creator_embed`} target="_blank" rel="noopener noreferrer">@{username}</a>
                    </section>
                  </blockquote>
                </div>
              )}
            </div>

            <aside className="rounded-2xl border border-white/15 bg-white/[0.06] p-6 sm:p-8">
              <span className="text-xs uppercase tracking-[0.26em] text-[color:var(--gold)]">Del video a tus manos</span>
              <h3 className="mt-4 max-w-md font-serif text-3xl italic sm:text-4xl">¿Viste algo que te encantó?</h3>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/70 sm:text-base">Escríbenos con una captura o el nombre del producto. Confirmamos existencias y coordinamos la entrega contigo.</p>
              <ul className="mt-7 space-y-4">
                {[
                  { icon: Sparkles, text: "Novedades reales desde nuestra tienda" },
                  { icon: PackageCheck, text: "Disponibilidad confirmada por WhatsApp" },
                  { icon: MapPinned, text: "Envíos a ciudades de toda Honduras" },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-3 text-sm text-white/85">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-[color:var(--gold)]"><Icon className="h-4 w-4" /></span>
                    {text}
                  </li>
                ))}
              </ul>
              <a href={config.tiktokProfileUrl} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-[color:var(--gold)] px-5 text-sm font-medium text-[color:var(--forest)] transition hover:bg-[color:var(--cream)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
                Explorar en TikTok <ArrowUpRight className="h-4 w-4" />
              </a>
            </aside>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/15 bg-white/5 px-6 py-12 text-center">
            <Play className="mx-auto h-9 w-9 text-[color:var(--gold)]" />
            <h3 className="mt-5 font-serif text-2xl italic">Conecta el perfil de TikTok</h3>
            <p className="mx-auto mt-3 max-w-lg text-sm text-white/65">Configura la URL completa del perfil para mostrar sus videos recientes.</p>
          </div>
        )}
      </div>
    </section>
  );
}
