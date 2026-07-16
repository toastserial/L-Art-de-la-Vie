import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "@/components/shared/Logo";
import { config } from "@/lib/config";

interface Props {
  open: boolean;
  onClose: () => void;
  items: { label: string; to: string }[];
}

export function MobileMenu({ open, onClose, items }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <AnimatePresence>
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-[color:var(--ink)]/40 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.aside
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "tween", duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="fixed top-0 right-0 z-50 flex h-dvh w-[86%] max-w-sm flex-col bg-[color:var(--paper)] p-6 shadow-2xl"
              >
                <Dialog.Title className="sr-only">Menú de navegación</Dialog.Title>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Logo size={36} />
                    <span className="font-serif italic text-lg text-[color:var(--forest)]">
                      L’Art de la Vie
                    </span>
                  </div>
                  <Dialog.Close asChild>
                    <button
                      aria-label="Cerrar menú"
                      className="inline-grid min-h-11 min-w-11 place-items-center rounded-full text-[color:var(--forest)] hover:bg-[color:var(--cream)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </Dialog.Close>
                </div>

                <nav className="mt-10 flex flex-col gap-1" aria-label="Navegación">
                  {items.map((n) => (
                    <a
                      key={n.to}
                      href={n.to}
                      onClick={onClose}
                      className="border-b border-[color:var(--border)] py-4 font-serif text-2xl italic text-[color:var(--forest)] transition-colors hover:text-[color:var(--gold)]"
                    >
                      {n.label}
                    </a>
                  ))}
                </nav>

                <div className="mt-auto space-y-3 pt-8 text-sm text-[color:var(--ink-muted)]">
                  <p>{config.storeAddress}</p>
                  <p>{config.storeHours}</p>
                </div>
              </motion.aside>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
