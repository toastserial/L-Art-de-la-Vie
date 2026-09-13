import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ListPaginationProps {
  page: number;
  total: number;
  onPageChange(page: number): void;
  pageSize?: number;
  itemLabel?: string;
}

export function ListPagination({ page, total, onPageChange, pageSize = 10, itemLabel = "registros" }: ListPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(page, 1), totalPages);
  if (total <= pageSize) return null;
  return <nav className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row" aria-label={`Paginación de ${itemLabel}`}>
    <p className="text-xs text-muted-foreground">{(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, total)} de {total} {itemLabel}</p>
    <div className="flex items-center gap-2">
      <Button type="button" variant="outline" size="sm" disabled={safePage === 1} onClick={() => onPageChange(safePage - 1)}><ChevronLeft className="h-4 w-4" />Anterior</Button>
      <span className="min-w-16 text-center text-xs font-semibold tabular-nums">{safePage} / {totalPages}</span>
      <Button type="button" variant="outline" size="sm" disabled={safePage === totalPages} onClick={() => onPageChange(safePage + 1)}>Siguiente<ChevronRight className="h-4 w-4" /></Button>
    </div>
  </nav>;
}

