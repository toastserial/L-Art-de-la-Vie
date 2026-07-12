import { useState, useMemo } from "react";
import { useStore } from "@/context/StoreContext";
import { PaymentMethod, Sale } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Search, Plus, Minus, Trash2, ShoppingBag, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function POS() {
  const { products, cart, addToCart, removeFromCart, updateCartQuantity, clearCart, completeSale } = useStore();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");
  const [discount, setDiscount] = useState(0);
  const [cashReceived, setCashReceived] = useState(0);
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const filteredProducts = products.filter(
    (p) => p.stock > 0 && (p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase()))
  );

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount;
  const change = paymentMethod === "efectivo" ? cashReceived - total : 0;

  const handleCompleteSale = async () => {
    if (cart.length === 0) { toast({ title: "Carrito vacío", variant: "destructive" }); return; }
    if (paymentMethod === "efectivo" && cashReceived < total) { toast({ title: "Monto insuficiente", variant: "destructive" }); return; }
    try {
      const sale = await completeSale(paymentMethod, discount, paymentMethod === "efectivo" ? cashReceived : undefined);
      setReceiptSale(sale);
      setReceiptOpen(true);
      setDiscount(0);
      setCashReceived(0);
      toast({ title: "¡Venta realizada!" });
    } catch (error) {
      toast({ title: "No se pudo completar la venta", description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold">Punto de Venta</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product catalog */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar producto por nombre o código..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredProducts.map((p) => (
              <Card key={p.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => addToCart(p)}>
                <CardContent className="p-4">
                  <p className="font-medium text-sm truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.code}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-primary">L {p.price.toFixed(2)}</span>
                    <Badge variant={p.stock <= p.minStock ? "destructive" : "secondary"} className="text-xs">{p.stock}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredProducts.length === 0 && (
              <p className="col-span-full text-center text-muted-foreground py-8">No se encontraron productos.</p>
            )}
          </div>
        </div>

        {/* Cart */}
        <Card className="h-fit sticky top-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-sans flex items-center gap-2"><ShoppingBag className="h-5 w-5" />Carrito</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cart.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Agrega productos al carrito</p>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">L {item.product.price.toFixed(2)} c/u</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                   <span className="min-w-[90px] whitespace-nowrap text-right text-sm font-bold">
                    L {(item.product.price * item.quantity).toFixed(2)}
                  </span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeFromCart(item.product.id)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              ))
            )}

            {cart.length > 0 && (
              <>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Subtotal</span><span>L {subtotal.toFixed(2)}</span></div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Descuento %</Label>
                    <Input type="number" min={0} max={100} value={discount} onChange={(e) => setDiscount(Number(e.target.value))} className="w-20 h-8" />
                    {discountAmount > 0 && <span className="text-destructive text-sm">-L {discountAmount.toFixed(2)}</span>}
                  </div>
                  <div className="flex justify-between font-bold text-lg"><span>Total</span><span>L {total.toFixed(2)}</span></div>
                </div>

                <Separator />
                <div>
                  <Label>Método de Pago</Label>
                  <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="tarjeta">Tarjeta</SelectItem>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentMethod === "efectivo" && (
                  <div>
                    <Label>Efectivo Recibido</Label>
                    <Input type="number" min={0} value={cashReceived} onChange={(e) => setCashReceived(Number(e.target.value))} />
                    {cashReceived >= total && cashReceived > 0 && (
                      <p className="text-sm text-accent font-medium mt-1">Cambio: L {change.toFixed(2)}</p>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={clearCart}>Vaciar</Button>
                  <Button className="flex-1" onClick={handleCompleteSale}>Cobrar</Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Receipt Dialog */}
      <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center font-display">Ticket de Venta</DialogTitle>
          </DialogHeader>
          {receiptSale && (
            <div className="space-y-3 text-sm" id="receipt">
              <div className="text-center border-b pb-3">
                <h3 className="font-display font-bold text-lg">L'Art de la Vie</h3>
                <p className="text-xs text-muted-foreground">{new Date(receiptSale.date).toLocaleString("es")}</p>
                <p className="text-xs text-muted-foreground">Folio: {receiptSale.id}</p>
              </div>
              {receiptSale.items.map((item, i) => (
                <div key={i} className="flex justify-between">
                  <div>
                    <span>{item.productName}</span>
                    <span className="text-muted-foreground ml-1">x{item.quantity}</span>
                  </div>
                  <span>L {item.subtotal.toFixed(2)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between"><span>Subtotal</span><span>L {receiptSale.subtotal.toFixed(2)}</span></div>
              {receiptSale.discount > 0 && <div className="flex justify-between text-destructive"><span>Descuento</span><span>L {receiptSale.discount.toFixed(2)}</span></div>}
              <div className="flex justify-between font-bold text-base"><span>Total</span><span>L {receiptSale.total.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Pago</span><span className="capitalize">{receiptSale.paymentMethod}</span></div>
              {receiptSale.change !== undefined && receiptSale.change > 0 && (
                <div className="flex justify-between"><span>Cambio</span><span>L {receiptSale.change.toFixed(2)}</span></div>
              )}
              <p className="text-center text-xs text-muted-foreground mt-4">¡Gracias por su compra!</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiptOpen(false)}>Cerrar</Button>
            <Button onClick={() => window.print()}><Printer className="h-4 w-4 mr-2" />Imprimir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
