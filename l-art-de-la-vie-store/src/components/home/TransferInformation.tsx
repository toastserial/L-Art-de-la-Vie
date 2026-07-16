import { Landmark } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { CopyButton } from "@/components/shared/CopyButton";
import { config, hasBank } from "@/lib/config";

export function TransferInformation() {
  if (!hasBank()) return null;
  return (
    <section className="bg-[color:var(--paper)]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-20">
        <SectionHeading
          align="center"
          eyebrow="Pago por transferencia"
          title={
            <>
              Coordinamos tu pago con <em className="italic">confianza</em>.
            </>
          }
          description="Envía el comprobante por WhatsApp. La tienda confirmará tu pedido y disponibilidad."
        />
        <div className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-2xl border border-[color:var(--gold)]/30 bg-[color:var(--cream)]">
          <div className="flex items-center gap-3 border-b border-[color:var(--gold)]/20 bg-[color:var(--paper)] px-6 py-4">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[color:var(--forest)] text-[color:var(--gold)]">
              <Landmark className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-[0.24em] text-[color:var(--forest-2)]">
                Banco
              </div>
              <div className="truncate font-serif text-lg text-[color:var(--ink)]">
                {config.bankName}
              </div>
            </div>
          </div>
          <dl className="divide-y divide-[color:var(--gold)]/15 px-6">
            <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
              <dt className="text-xs uppercase tracking-[0.24em] text-[color:var(--forest-2)]">
                Titular
              </dt>
              <dd className="text-[color:var(--ink)]">{config.bankAccountName}</dd>
            </div>
            <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <dt className="text-xs uppercase tracking-[0.24em] text-[color:var(--forest-2)]">
                  Número de cuenta
                </dt>
                <dd className="mt-1 font-mono text-lg text-[color:var(--ink)]">
                  {config.bankAccountNumber}
                </dd>
              </div>
              <CopyButton value={config.bankAccountNumber} label="Copiar número" />
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
