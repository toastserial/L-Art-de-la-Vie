import { Eye, ImageIcon, PackageCheck, PackageX, Pencil, Plus } from "lucide-react";
import type { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ProductPreviewDialogProps {
  product: Product | null;
  onOpenChange: (open: boolean) => void;
  onEdit?: (product: Product) => void;
  onAdd?: (product: Product) => void;
}

export function ProductPreviewDialog({ product, onOpenChange, onEdit, onAdd }: ProductPreviewDialogProps) {
  if (!product) return null;
  const lowStock = product.stock <= product.minStock;

  return (
    <Dialog open={Boolean(product)} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-[680px]">
        <div className="grid sm:grid-cols-[0.95fr_1.05fr]">
          <div className="relative min-h-72 bg-secondary sm:min-h-[430px]">
            {product.image ? (
              <img src={product.image} alt={product.name} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-muted-foreground">
                <ImageIcon className="h-12 w-12 opacity-50" />
                <span className="text-sm">Sin fotografía</span>
              </div>
            )}
            <Badge className="absolute left-4 top-4 bg-background/90 text-foreground shadow-sm backdrop-blur">
              {product.category}
            </Badge>
          </div>

          <div className="flex flex-col p-6 sm:p-8">
            <DialogHeader className="text-left">
              <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                <Eye className="h-4 w-4" /> Vista del producto
              </div>
              <DialogTitle className="font-display text-2xl leading-tight">{product.name}</DialogTitle>
              <DialogDescription className="font-mono">Código {product.code}</DialogDescription>
            </DialogHeader>

            <div className="mt-7 flex flex-wrap items-center gap-3"><p className="text-3xl font-bold text-primary">L {product.price.toFixed(2)}</p>{product.discountPercent > 0 && <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">Oferta tienda web: -{product.discountPercent}%</span>}</div>
            <div className={`mt-6 rounded-2xl border p-4 ${lowStock ? "border-destructive/25 bg-destructive/5" : "border-primary/15 bg-primary/5"}`}>
              <div className="flex items-center gap-3">
                {lowStock ? <PackageX className="h-6 w-6 text-destructive" /> : <PackageCheck className="h-6 w-6 text-primary" />}
                <div>
                  <p className="font-semibold">{product.stock} unidades disponibles</p>
                  <p className="text-xs text-muted-foreground">
                    {lowStock ? `Requiere reposición · mínimo ${product.minStock}` : `Inventario saludable · mínimo ${product.minStock}`}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-auto gap-2 pt-8 sm:justify-start">
              {onEdit && <Button variant="outline" onClick={() => onEdit(product)}><Pencil className="mr-2 h-4 w-4" />Editar</Button>}
              {onAdd && <Button onClick={() => onAdd(product)} disabled={product.stock <= 0}><Plus className="mr-2 h-4 w-4" />Agregar a venta</Button>}
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
