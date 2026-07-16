import { motion } from "framer-motion";

export function TopBar() {
  return (
    <div
      className="bg-[color:var(--forest)] text-[color:var(--cream)]"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-[0.72rem] uppercase tracking-[0.28em]"
      >
        <span className="inline-block h-1 w-1 rounded-full bg-[color:var(--gold)]" aria-hidden />
        <span className="text-center">Detalles que transforman espacios y momentos</span>
        <span className="inline-block h-1 w-1 rounded-full bg-[color:var(--gold)]" aria-hidden />
      </motion.div>
    </div>
  );
}
