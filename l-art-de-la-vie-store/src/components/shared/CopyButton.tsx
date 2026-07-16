import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({ value, label = "Copiar" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* ignore */
        }
      }}
      className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[color:var(--gold)]/40 bg-[color:var(--cream)] px-4 py-2 text-sm font-medium text-[color:var(--forest)] transition hover:border-[color:var(--gold)] hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]"
      aria-live="polite"
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copiado" : label}
    </button>
  );
}
