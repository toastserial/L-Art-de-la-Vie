import { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { Expense } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DollarSign, CreditCard, ArrowRightLeft, Plus, Wallet, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export default function CashClose() {
  const { sales, cashCloses, todayExpenses, cashOpening, closeCash, addExpense, deleteExpense } = useStore();
  const { toast } = useToast();
  const { canManage } = useAuth();
  const [actualCash, setActualCash] = useState(0);
  const [expenseDesc, setExpenseDesc] = useState("");
  const [expenseAmount, setExpenseAmount] = useState(0);
  const [expenseDialog, setExpenseDialog] = useState(false);

  const localDate = (value: string | Date) => new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Tegucigalpa", year: "numeric", month: "2-digit", day: "2-digit"
  }).format(new Date(value));
  const today = localDate(new Date());
  const todaySales = sales.filter((s) => localDate(s.date) === today);
  const totalToday = todaySales.reduce((sum, s) => sum + s.total, 0);
  const byMethod = {
    efectivo: todaySales.filter((s) => s.paymentMethod === "efectivo").reduce((sum, s) => sum + s.total, 0),
    tarjeta: todaySales.filter((s) => s.paymentMethod === "tarjeta").reduce((sum, s) => sum + s.total, 0),
    transferencia: todaySales.filter((s) => s.paymentMethod === "transferencia").reduce((sum, s) => sum + s.total, 0),
  };
  const totalExpenses = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const openingCash = cashOpening?.openingCash ?? 0;
  const expectedCash = openingCash + byMethod.efectivo - totalExpenses;
  const difference = actualCash - expectedCash;

  const handleAddExpense = async () => {
    if (!expenseDesc || expenseAmount <= 0) { toast({ title: "Datos incompletos", variant: "destructive" }); return; }
    try {
      await addExpense({ description: expenseDesc, amount: expenseAmount });
      setExpenseDesc(""); setExpenseAmount(0); setExpenseDialog(false);
      toast({ title: "Gasto registrado" });
    } catch (error) {
      toast({ title: "No se pudo registrar", description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    }
  };

  const handleClose = async () => {
    try {
      await closeCash(actualCash);
      setActualCash(0);
      toast({ title: "Caja cerrada exitosamente" });
    } catch (error) {
      toast({ title: "No se pudo cerrar la caja", description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id);
      toast({ title: "Gasto eliminado" });
    } catch (error) {
      toast({ title: "No se pudo eliminar", description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-display font-bold">Cierre de Caja</h1>

      <Tabs defaultValue="today">
        <TabsList>
          <TabsTrigger value="today">Hoy</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-sans font-medium text-muted-foreground">Fondo Inicial</CardTitle>
                <Wallet className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent><p className="text-2xl font-bold font-sans">L {openingCash.toFixed(2)}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-sans font-medium text-muted-foreground">Efectivo</CardTitle>
                <DollarSign className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent><p className="text-2xl font-bold font-sans">L {byMethod.efectivo.toFixed(2)}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-sans font-medium text-muted-foreground">Tarjeta</CardTitle>
                <CreditCard className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent><p className="text-2xl font-bold font-sans">L {byMethod.tarjeta.toFixed(2)}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-sans font-medium text-muted-foreground">Transferencia</CardTitle>
                <ArrowRightLeft className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent><p className="text-2xl font-bold font-sans">L {byMethod.transferencia.toFixed(2)}</p></CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's sales */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-sans">Ventas del Día ({todaySales.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Folio</TableHead>
                      <TableHead>Hora</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {todaySales.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell className="font-mono text-xs">{s.id}</TableCell>
                        <TableCell className="text-sm">{new Date(s.date).toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}</TableCell>
                        <TableCell><Badge variant="secondary" className="capitalize">{s.paymentMethod}</Badge></TableCell>
                        <TableCell className="text-right font-medium">L {s.total.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                    {todaySales.length === 0 && (
                      <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-4">Sin ventas hoy</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Cash close form */}
            <div className="space-y-4">
              {/* Expenses */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-sans">Gastos del Día</CardTitle>
                  <Button size="sm" variant="outline" onClick={() => setExpenseDialog(true)}><Plus className="h-4 w-4 mr-1" />Agregar</Button>
                </CardHeader>
                <CardContent>
                  {todayExpenses.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sin gastos registrados</p>
                  ) : (
                    <div className="space-y-2">
                      {todayExpenses.map((e) => (
                        <div key={e.id} className="flex items-center justify-between gap-2 text-sm">
                          <span>{e.description}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-destructive">-L {e.amount.toFixed(2)}</span>
                            {canManage && <Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label={`Eliminar gasto ${e.description}`} onClick={() => handleDeleteExpense(e.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>}
                          </div>
                        </div>
                      ))}
                      <Separator />
                      <div className="flex justify-between font-bold"><span>Total Gastos</span><span className="text-destructive">-L {totalExpenses.toFixed(2)}</span></div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Close form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-sans flex items-center gap-2"><Wallet className="h-5 w-5" />Cerrar Caja</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Total Ventas</span><span className="font-bold">L {totalToday.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Fondo Inicial</span><span>L {openingCash.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Ventas en Efectivo</span><span>L {byMethod.efectivo.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Gastos</span><span className="text-destructive">-L {totalExpenses.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Efectivo Esperado</span><span className="font-bold">L {expectedCash.toFixed(2)}</span></div>
                  </div>
                  <Separator />
                  <div>
                    <Label>Efectivo Contado</Label>
                    <Input type="number" min={0} value={actualCash} onChange={(e) => setActualCash(Number(e.target.value))} disabled={!canManage} />
                  </div>
                  {actualCash > 0 && (
                    <div className="flex justify-between text-sm">
                      <span>Diferencia</span>
                      <span className={`font-bold ${difference === 0 ? "text-primary" : difference > 0 ? "text-accent" : "text-destructive"}`}>
                        {difference > 0 ? "+" : ""}{difference.toFixed(2)}
                        {difference === 0 ? " ✓" : difference > 0 ? " (sobrante)" : " (faltante)"}
                      </span>
                    </div>
                  )}
                  {canManage ? <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="w-full">Cerrar Caja</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Cerrar caja del día?</AlertDialogTitle>
                        <AlertDialogDescription>Se registrará el cierre con efectivo contado: L {actualCash.toFixed(2)} (diferencia: {difference >= 0 ? "+" : ""}{difference.toFixed(2)}). Esta acción no se puede deshacer.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClose}>Confirmar Cierre</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog> : <p className="rounded-lg bg-muted p-3 text-center text-sm text-muted-foreground">Solo administradores y propietarios pueden cerrar la caja.</p>}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader><CardTitle className="text-lg font-sans">Historial de Cierres</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Ventas</TableHead>
                    <TableHead className="text-right">Fondo Inicial</TableHead>
                    <TableHead className="text-right">Gastos</TableHead>
                    <TableHead className="text-right">Efectivo Esperado</TableHead>
                    <TableHead className="text-right">Efectivo Real</TableHead>
                    <TableHead className="text-right">Diferencia</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cashCloses.map((cc) => (
                    <TableRow key={cc.id}>
                      <TableCell>{new Date(cc.date).toLocaleDateString("es")}</TableCell>
                      <TableCell className="text-right">${cc.totalSales.toFixed(2)}</TableCell>
                      <TableCell className="text-right">L {cc.openingCash.toFixed(2)}</TableCell>
                      <TableCell className="text-right text-destructive">${cc.totalExpenses.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${cc.expectedCash.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${cc.actualCash.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={cc.difference === 0 ? "default" : "destructive"}>
                          {cc.difference >= 0 ? "+" : ""}{cc.difference.toFixed(2)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {cashCloses.length === 0 && (
                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-4">Sin cierres registrados</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Expense Dialog */}
      <Dialog open={expenseDialog} onOpenChange={setExpenseDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar Gasto</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div><Label>Descripción</Label><Input value={expenseDesc} onChange={(e) => setExpenseDesc(e.target.value)} /></div>
            <div><Label>Monto</Label><Input type="number" min={0} value={expenseAmount} onChange={(e) => setExpenseAmount(Number(e.target.value))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setExpenseDialog(false)}>Cancelar</Button>
            <Button onClick={handleAddExpense}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
