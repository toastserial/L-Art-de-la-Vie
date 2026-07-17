import { ArrowRight, Check, CircleAlert, LockKeyhole } from "lucide-react";
import { Logo } from "@/components/shared/Logo";

const appCallbackUrl =
  import.meta.env.VITE_CUSTOMER_APP_URL || "lartdelavieclientes://auth/confirm";

export function AuthConfirmedPage() {
  const query = new URLSearchParams(window.location.search);
  const fragment = new URLSearchParams(window.location.hash.slice(1));
  const error = fragment.get("error_description") || query.get("error_description");
  const authType = fragment.get("type") || query.get("type");
  const hasSession = Boolean(
    fragment.get("access_token") || fragment.get("refresh_token") || query.get("code"),
  );
  const isRecovery = authType === "recovery";

  const returnToApp = () => {
    const suffix = `${window.location.search}${window.location.hash}`;
    window.location.assign(`${appCallbackUrl}${suffix}`);
  };

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-cream px-4 py-10">
      <div className="pointer-events-none absolute -left-28 -top-28 size-80 rounded-full bg-gold/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 size-96 rounded-full bg-forest/10 blur-3xl" />

      <section className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-border bg-paper shadow-card">
        <div className="bg-forest px-7 py-10 text-center text-cream">
          <Logo size={72} className="ring-4 ring-gold/30" />
          <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.32em] text-gold">
            L'Art de la Vie
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl">
            {error
              ? "El enlace no funcionó"
              : isRecovery
                ? "Protejamos tu cuenta"
                : hasSession
                  ? "Correo confirmado"
                  : "Enlace incompleto"}
          </h1>
        </div>

        <div className="px-7 py-9 text-center sm:px-10">
          <div
            className={`mx-auto grid size-16 place-items-center rounded-full ${
              error || !hasSession ? "bg-red-50 text-red-700" : "bg-forest/10 text-forest"
            }`}
          >
            {error || !hasSession ? (
              <CircleAlert className="size-7" />
            ) : isRecovery ? (
              <LockKeyhole className="size-7" />
            ) : (
              <Check className="size-8" strokeWidth={2.2} />
            )}
          </div>

          <h2 className="mt-5 text-2xl text-ink">
            {error
              ? "Necesitamos un enlace nuevo"
              : isRecovery
                ? "Crea tu nueva contraseña en la app"
                : hasSession
                  ? "Tu cuenta ya está lista"
                  : "Abre el enlace original del correo"}
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-ink-muted">
            {error
              ? decodeURIComponent(error.replace(/\+/g, " "))
              : isRecovery
                ? "Regresa a la aplicación para elegir una contraseña segura y recuperar tu acceso."
                : hasSession
                  ? "Gracias por confirmar tu dirección. Ya puedes regresar a la aplicación y descubrir la colección."
                  : "Esta página necesita la información segura que Supabase incluye en el enlace enviado a tu correo."}
          </p>

          {hasSession && !error ? (
            <button
              type="button"
              onClick={returnToApp}
              className="mt-7 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-forest px-6 text-sm font-bold text-cream transition hover:bg-forest-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 active:scale-[0.99]"
            >
              Regresar a la app <ArrowRight className="size-4" />
            </button>
          ) : null}

          <p className="mt-5 text-xs leading-5 text-ink-muted">
            Si la aplicación no se abre, verifica que esté instalada en este teléfono.
          </p>
        </div>
      </section>
    </main>
  );
}
