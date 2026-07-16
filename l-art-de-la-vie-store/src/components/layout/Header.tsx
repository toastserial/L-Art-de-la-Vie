import { useEffect, useState } from "react";
import { ShoppingBag, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Logo } from "@/components/shared/Logo";
import { useCart } from "@/hooks/useCart";
import { MobileMenu } from "./MobileMenu";

const NAV = [
  { label: "Colección", to: "/#coleccion" },
  { label: "Inspiración", to: "/#inspiracion" },
  { label: "Visítanos", to: "/#visitanos" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { count, open } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-30 transition-all duration-300 ${
          scrolled
            ? "bg-[color:var(--paper)]/85 backdrop-blur-md shadow-[0_1px_0_rgba(19,37,27,0.06)]"
            : "bg-[color:var(--paper)]"
        }`}
      >
        <div
          className={`mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 transition-[padding] duration-300 ${
            scrolled ? "py-3" : "py-5"
          }`}
        >
          <a
            href="/"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)] rounded-full"
          >
            <Logo size={scrolled ? 36 : 44} />
            <span className="flex flex-col leading-none">
              <span className="font-serif text-lg italic tracking-tight text-[color:var(--forest)] sm:text-xl">
                L’Art de la Vie
              </span>
              <span className="mt-1 text-[10px] uppercase tracking-[0.28em] text-[color:var(--ink-muted)]">
                Siguatepeque · Honduras
              </span>
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-8" aria-label="Navegación principal">
            {NAV.map((n) => (
              <a
                key={n.to}
                href={n.to}
                className="relative text-sm font-medium text-[color:var(--ink)] transition-colors hover:text-[color:var(--forest)] after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-[color:var(--gold)] after:transition-all hover:after:w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)] rounded"
              >
                {n.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={open}
              aria-label={`Abrir mi bolsa. ${count} artículo${count === 1 ? "" : "s"}.`}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[color:var(--forest)] bg-transparent px-3 py-2 text-sm font-medium text-[color:var(--forest)] transition hover:bg-[color:var(--forest)] hover:text-[color:var(--cream)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)] sm:px-4"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Mi bolsa</span>
              <AnimatePresence mode="popLayout">
                {count > 0 ? (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className="grid h-5 min-w-5 place-items-center rounded-full bg-[color:var(--gold)] px-1 text-[11px] font-semibold text-[color:var(--forest)]"
                  >
                    {count}
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </button>
            <button
              type="button"
              className="md:hidden inline-grid min-h-11 min-w-11 place-items-center rounded-full border border-[color:var(--border)] text-[color:var(--forest)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gold)]"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} items={NAV} />
    </>
  );
}
