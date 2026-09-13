import { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { Product, Category } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Search, ArrowUpDown, ImagePlus, X, Eye, FolderPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { uploadProductImage } from "@/lib/api";
import { ProductPreviewDialog } from "@/components/ProductPreviewDialog";

type ProductForm = Omit<Product, "id" | "code">;
const emptyProduct: ProductForm = { name: "", category: "Decoración", price: 0, stock: 0, minStock: 3 };

export default function Inventory() {
  const { products, categories, movements, addProduct, updateProduct, deleteProduct, addMovement, addCategory } = useStore();
  const { toast } = useToast();
  const { canManage } = useAuth();
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyProduct);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [movementDialog, setMovementDialog] = useState(false);
  const [movementProduct, setMovementProduct] = useState<Product | null>(null);
  const [movementType, setMovementType] = useState<"entrada" | "salida">("entrada");
  const [movementQty, setMovementQty] = useState(1);
  const [movementNote, setMovementNote] = useState("");

  const filtered = products.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "all" || p.category === filterCategory;
    return matchSearch && matchCat;
  });

  const openAdd = () => {
    if (categories.length === 0) { setCategoryDialog(true); return; }
    setEditingProduct(null); setImageFile(null); setImagePreview(undefined);
    setForm({ ...emptyProduct, category: categories[0] }); setDialogOpen(true);
  };
  const openEdit = (p: Product) => { setEditingProduct(p); setImageFile(null); setImagePreview(p.image); setForm({ name: p.name, category: p.category, price: p.price, stock: p.stock, minStock: p.minStock, image: p.image }); setDialogOpen(true); };

  const handleImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast({ title: "Archivo inválido", description: "Selecciona una fotografía.", variant: "destructive" });
    if (file.size > 6 * 1024 * 1024) return toast({ title: "Fotografía demasiado grande", description: "El tamaño máximo es 6 MB.", variant: "destructive" });
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.name) { toast({ title: "Error", description: "El nombre es requerido", variant: "destructive" }); return; }
    setSaving(true);
    try {
      const image = imageFile ? (await uploadProductImage(imageFile)).url : form.image;
      const values = { ...form, image };
      if (editingProduct) {
        await updateProduct({ ...editingProduct, ...values });
        toast({ title: "Producto actualizado" });
      } else {
        await addProduct(values);
        toast({ title: "Producto agregado" });
      }
      setDialogOpen(false);
    } catch (error) {
      toast({ title: "No se pudo guardar", description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      toast({ title: "Producto eliminado" });
    } catch (error) {
      toast({ title: "No se pudo eliminar", description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    }
  };

  const openMovement = (p: Product) => { setMovementProduct(p); setMovementType("entrada"); setMovementQty(1); setMovementNote(""); setMovementDialog(true); };

  const handleMovement = async () => {
    if (!movementProduct) return;
    try {
      await addMovement({ productId: movementProduct.id, productName: movementProduct.name, type: movementType, quantity: movementQty, note: movementNote || undefined });
      toast({ title: `${movementType === "entrada" ? "Entrada" : "Salida"} registrada` });
      setMovementDialog(false);
    } catch (error) {
      toast({ title: "No se pudo registrar", description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    }
  };
  const handleAddCategory = async () => {
    const name = newCategory.trim();
    if (!name) return toast({ title: "Escribe el nombre de la categoría", variant: "destructive" });
    try {
      await addCategory(name);
      setNewCategory(""); setCategoryDialog(false);
      setForm((current) => ({ ...current, category: name }));
      toast({ title: "Categoría agregada", description: name });
    } catch (error) {
      toast({ title: "No se pudo agregar", description: error instanceof Error ? error.message : undefined, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-display font-bold">Inventario</h1>
        {canManage && <div className="flex gap-2"><Button variant="outline" onClick={() => setCategoryDialog(true)}><FolderPlus className="h-4 w-4 mr-2" />Nueva categoría</Button><Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Agregar Producto</Button></div>}
      </div>

      <Tabs defaultValue="products">
        <TabsList>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="movements">Movimientos</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por nombre o código..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Categoría" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-xs">{p.code}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {p.image ? <img src={p.image} alt={p.name} className="h-11 w-11 rounded-xl object-cover border" /> : <div className="h-11 w-11 rounded-xl bg-secondary flex items-center justify-center font-bold text-primary">{p.name.charAt(0)}</div>}
                          <button type="button" onClick={() => setPreviewProduct(p)} className="font-medium text-left hover:text-primary hover:underline underline-offset-4">{p.name}</button>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="secondary">{p.category}</Badge></TableCell>
                      <TableCell className="text-right">L {p.price.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={p.stock <= p.minStock ? "destructive" : "secondary"}>
                          {p.stock}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {canManage ? <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setPreviewProduct(p)} title="Vista previa">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openMovement(p)} title="Movimiento">
                            <ArrowUpDown className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(p)} title="Editar">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" title="Eliminar"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
                                <AlertDialogDescription>Esta acción no se puede deshacer. Se eliminará "{p.name}" del inventario.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(p.id)}>Eliminar</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div> : <span className="text-muted-foreground">Solo lectura</span>}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No se encontraron productos.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements">
          <Card>
            <CardHeader><CardTitle className="text-lg font-sans">Historial de Movimientos</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-center">Cantidad</TableHead>
                    <TableHead>Nota</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="text-sm">{new Date(m.date).toLocaleString("es")}</TableCell>
                      <TableCell>{m.productName}</TableCell>
                      <TableCell>
                        <Badge variant={m.type === "entrada" ? "default" : m.type === "salida" ? "destructive" : "secondary"}>
                          {m.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{m.quantity}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{m.note || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Editar Producto" : "Agregar Producto"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col sm:flex-row gap-4 rounded-2xl border bg-muted/30 p-4">
              <div className="relative h-32 w-full sm:w-32 shrink-0 overflow-hidden rounded-2xl border bg-background">
                {imagePreview ? <img src={imagePreview} alt="Vista previa del producto" className="h-full w-full object-cover" /> : <div className="flex h-full flex-col items-center justify-center text-muted-foreground"><ImagePlus className="h-7 w-7" /><span className="mt-2 text-xs">Sin fotografía</span></div>}
              </div>
              <div className="flex flex-1 flex-col justify-center">
                <Label className="font-semibold">Fotografía del producto</Label>
                <p className="mt-1 text-xs text-muted-foreground">Selecciona una imagen cuadrada de hasta 6 MB. En teléfono podrás usar la cámara.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" asChild><label htmlFor="product-image" className="cursor-pointer"><ImagePlus className="mr-2 h-4 w-4" />Seleccionar foto</label></Button>
                  {imagePreview && <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => { setImageFile(null); setImagePreview(undefined); setForm(current => ({ ...current, image: undefined })); }}><X className="mr-1 h-4 w-4" />Quitar</Button>}
                  <input id="product-image" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" className="hidden" onChange={(event) => { handleImage(event.target.files?.[0]); event.target.value = ""; }} />
                </div>
              </div>
            </div>
            <div>
                <Label>Categoría</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as Category })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
            </div>
            {!editingProduct && <p className="text-xs text-muted-foreground">El código se asignará automáticamente al guardar.</p>}
            <div><Label>Nombre</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label>Precio</Label><Input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} /></div>
              <div><Label>Stock</Label><Input type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} /></div>
              <div><Label>Stock Mín.</Label><Input type="number" min={0} value={form.minStock} onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })} /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>{saving ? "Guardando..." : editingProduct ? "Guardar" : "Agregar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ProductPreviewDialog
        product={previewProduct}
        onOpenChange={(open) => !open && setPreviewProduct(null)}
        onEdit={canManage ? (product) => { setPreviewProduct(null); openEdit(product); } : undefined}
      />

      <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Nueva categoría</DialogTitle></DialogHeader>
          <div className="space-y-2 py-3">
            <Label>Nombre</Label>
            <Input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="Ej. Joyería" maxLength={60} onKeyDown={(event) => event.key === "Enter" && handleAddCategory()} />
            <p className="text-xs text-muted-foreground">Aparecerá automáticamente en inventario, venta y tienda web.</p>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setCategoryDialog(false)}>Cancelar</Button><Button onClick={handleAddCategory}>Agregar categoría</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Movement Dialog */}
      <Dialog open={movementDialog} onOpenChange={setMovementDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Movimiento — {movementProduct?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Tipo</Label>
              <Select value={movementType} onValueChange={(v) => setMovementType(v as "entrada" | "salida")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="salida">Salida</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Cantidad</Label><Input type="number" min={1} value={movementQty} onChange={(e) => setMovementQty(Number(e.target.value))} /></div>
            <div><Label>Nota (opcional)</Label><Input value={movementNote} onChange={(e) => setMovementNote(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMovementDialog(false)}>Cancelar</Button>
            <Button onClick={handleMovement}>Registrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
