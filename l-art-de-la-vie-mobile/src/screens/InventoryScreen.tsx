import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useMemo, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Button, Card, EmptyState, Field, Pill, Segmented, Sheet } from "../components/ui";
import { Page } from "../components/Page";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import { uploadProductImage } from "../lib/api";
import { colors, money, shortDate } from "../theme";
import type { Category, Product } from "../types";

const categoryOptions: { value: Category; label: string }[] = ["Decoración", "Perfumes", "Carteras", "Varios"].map(value => ({ value: value as Category, label: value }));
interface ProductForm { name: string; category: Category; price: string; stock: string; minStock: string; image?: string }
interface PendingImage { uri: string; mimeType?: string | null; fileName?: string | null }
const blank: ProductForm = { name: "", category: "Decoración", price: "", stock: "", minStock: "3" };

export function InventoryScreen() {
  const { canManage } = useAuth();
  const { products, movements, refreshing, refresh, addProduct, updateProduct, deleteProduct, addMovement } = useStore();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"products" | "movements">("products");
  const [productOpen, setProductOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(blank);
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [movementOpen, setMovementOpen] = useState(false);
  const [movementProduct, setMovementProduct] = useState<Product | null>(null);
  const [movementType, setMovementType] = useState<"entrada" | "salida">("entrada");
  const [quantity, setQuantity] = useState("1");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => products.filter(product => `${product.name} ${product.code} ${product.category}`.toLowerCase().includes(search.toLowerCase())), [products, search]);
  const openNew = () => { setEditing(null); setPendingImage(null); setForm(blank); setProductOpen(true); };
  const openEdit = (product: Product) => { setEditing(product); setPendingImage(null); setForm({ name: product.name, category: product.category, price: String(product.price), stock: String(product.stock), minStock: String(product.minStock), image: product.image }); setProductOpen(true); };

  const usePickedImage = (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setPendingImage({ uri: asset.uri, mimeType: asset.mimeType, fileName: asset.fileName });
    setForm(current => ({ ...current, image: asset.uri }));
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return Alert.alert("Permiso necesario", "Activa el permiso de cámara para fotografiar productos.");
    usePickedImage(await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], cameraType: ImagePicker.CameraType.back, quality: 0.72 }));
  };

  const choosePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert("Permiso necesario", "Activa el acceso a fotografías para escoger una imagen.");
    usePickedImage(await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.72 }));
  };

  const selectPhoto = () => Alert.alert("Fotografía del producto", "Elige de dónde obtener la imagen.", [
    { text: "Tomar foto", onPress: () => takePhoto().catch(() => Alert.alert("No se abrió la cámara")) },
    { text: "Elegir de galería", onPress: () => choosePhoto().catch(() => Alert.alert("No se abrió la galería")) },
    { text: "Cancelar", style: "cancel" },
  ]);

  const saveProduct = async () => {
    const price = Number(form.price), stock = Number(form.stock), minStock = Number(form.minStock);
    if (!form.name.trim()) return Alert.alert("Falta el nombre", "Escribe el nombre del producto.");
    if (price < 0 || !Number.isFinite(price) || !Number.isInteger(stock) || stock < 0 || !Number.isInteger(minStock) || minStock < 0) return Alert.alert("Datos inválidos", "Revisa precio y cantidades.");
    setBusy(true);
    try {
      let image = form.image;
      if (pendingImage) image = (await uploadProductImage(pendingImage.uri, pendingImage.mimeType, pendingImage.fileName)).url;
      const values = { name: form.name.trim(), category: form.category, price, stock, minStock, image };
      if (editing) await updateProduct({ ...editing, ...values }); else await addProduct(values);
      setProductOpen(false);
    } catch (reason) { Alert.alert("No se guardó", reason instanceof Error ? reason.message : "Intenta nuevamente"); }
    finally { setBusy(false); }
  };

  const openMovement = (product: Product) => { setMovementProduct(product); setMovementType("entrada"); setQuantity("1"); setNote(""); setMovementOpen(true); };
  const saveMovement = async () => {
    const amount = Number(quantity);
    if (!movementProduct || !Number.isInteger(amount) || amount <= 0) return Alert.alert("Cantidad inválida", "Escribe una cantidad entera mayor que cero.");
    setBusy(true);
    try { await addMovement(movementProduct.id, movementType, amount, note.trim() || undefined); setMovementOpen(false); }
    catch (reason) { Alert.alert("No se registró", reason instanceof Error ? reason.message : "Intenta nuevamente"); }
    finally { setBusy(false); }
  };

  return <>
    <Page title="Inventario" subtitle={`${products.length} productos registrados`} refreshing={refreshing} onRefresh={() => refresh(true)}
      action={canManage ? <Pressable onPress={openNew} style={styles.addButton}><MaterialCommunityIcons name="plus" size={26} color={colors.white} /></Pressable> : undefined}>
      <Segmented<"products" | "movements"> values={[{ value: "products", label: "Productos" }, { value: "movements", label: "Movimientos" }]} value={tab} onChange={setTab} />
      {tab === "products" ? <>
        <View style={styles.search}><Field value={search} onChangeText={setSearch} placeholder="Buscar producto..." /></View>
        <Card style={styles.list}>
          {filtered.length === 0 ? <EmptyState icon="package-variant" title="Sin productos" message="No encontramos productos con esa búsqueda." /> : filtered.map((product, index) => {
            const low = product.stock <= product.minStock;
            return <Pressable key={product.id} onPress={() => canManage && openEdit(product)} style={[styles.row, index > 0 && styles.border]}>
              {product.image ? <Image source={{ uri: product.image }} style={styles.productThumb} /> : <View style={styles.initial}><Text style={styles.initialText}>{product.name.charAt(0)}</Text></View>}
              <View style={styles.details}><Text style={styles.name}>{product.name}</Text><Text style={styles.meta}>{product.code} · {product.category}</Text><Text style={styles.price}>{money(product.price)}</Text></View>
              <View style={styles.rowRight}><Pill tone={low ? "danger" : "success"}>{product.stock} uds.</Pill>{canManage && <Pressable onPress={() => openMovement(product)} hitSlop={10} style={styles.moveButton}><MaterialCommunityIcons name="swap-vertical" size={20} color={colors.forest} /></Pressable>}</View>
            </Pressable>;
          })}
        </Card>
      </> : <Card style={[styles.list, styles.movements]}>
        {movements.length === 0 ? <EmptyState icon="swap-vertical" title="Sin movimientos" message="Las entradas, salidas y ventas aparecerán aquí." /> : movements.slice(0, 50).map((movement, index) =>
          <View key={movement.id} style={[styles.row, index > 0 && styles.border]}>
            <View style={[styles.initial, movement.type === "salida" || movement.type === "venta" ? styles.outIcon : undefined]}><MaterialCommunityIcons name={movement.type === "entrada" ? "arrow-down" : "arrow-up"} size={20} color={movement.type === "entrada" ? colors.success : colors.danger} /></View>
            <View style={styles.details}><Text style={styles.name}>{movement.productName}</Text><Text style={styles.meta}>{shortDate(movement.date)}{movement.note ? ` · ${movement.note}` : ""}</Text></View>
            <View style={styles.movementRight}><Text style={[styles.movementQty, { color: movement.type === "entrada" ? colors.success : colors.danger }]}>{movement.type === "entrada" ? "+" : "-"}{movement.quantity}</Text><Text style={styles.movementType}>{movement.type}</Text></View>
          </View>)}
      </Card>}
    </Page>

    <Sheet visible={productOpen} onClose={() => setProductOpen(false)} title={editing ? "Editar producto" : "Nuevo producto"} footer={<View style={styles.footerRow}>{editing && <Button title="Eliminar" variant="danger" icon="trash-can-outline" onPress={() => Alert.alert("Eliminar producto", `¿Desactivar ${editing.name}?`, [{ text: "Cancelar" }, { text: "Eliminar", style: "destructive", onPress: async () => { try { await deleteProduct(editing.id); setProductOpen(false); } catch (reason) { Alert.alert("No se eliminó", reason instanceof Error ? reason.message : "Intenta nuevamente"); } } }])} style={styles.footerDelete} />}<Button title="Guardar" icon="content-save-outline" onPress={saveProduct} loading={busy} style={styles.footerSave} /></View>}>
      <View style={styles.photoSection}>
        <Pressable onPress={selectPhoto} style={styles.photoPicker}>
          {form.image ? <Image source={{ uri: form.image }} style={styles.photoPreview} /> : <View style={styles.photoEmpty}><MaterialCommunityIcons name="camera-plus-outline" size={30} color={colors.forest} /><Text style={styles.photoEmptyTitle}>Agregar fotografía</Text><Text style={styles.photoEmptyCopy}>Cámara o galería</Text></View>}
          <View style={styles.photoEdit}><MaterialCommunityIcons name="camera" size={17} color={colors.white} /></View>
        </Pressable>
        <View style={styles.photoHelp}>
          <Text style={styles.photoTitle}>{form.image ? "Fotografía seleccionada" : "Imagen opcional"}</Text>
          <Text style={styles.photoCopy}>Centra el producto; la app ajustará la imagen automáticamente.</Text>
          {form.image && <Pressable onPress={() => { setPendingImage(null); setForm(current => ({ ...current, image: undefined })); }}><Text style={styles.removePhoto}>Quitar fotografía</Text></Pressable>}
        </View>
      </View>
      <Field label="Nombre" value={form.name} onChangeText={name => setForm(current => ({ ...current, name }))} placeholder="Nombre del producto" />
      <Text style={styles.label}>Categoría</Text><Segmented values={categoryOptions} value={form.category} onChange={category => setForm(current => ({ ...current, category }))} />
      <View style={styles.fieldSpacer} />
      <Field label="Precio" value={form.price} onChangeText={price => setForm(current => ({ ...current, price }))} keyboardType="decimal-pad" placeholder="0.00" />
      <View style={styles.twoFields}><View style={styles.half}><Field label="Existencias" value={form.stock} onChangeText={stock => setForm(current => ({ ...current, stock }))} keyboardType="number-pad" placeholder="0" /></View><View style={styles.half}><Field label="Stock mínimo" value={form.minStock} onChangeText={minStock => setForm(current => ({ ...current, minStock }))} keyboardType="number-pad" placeholder="3" /></View></View>
    </Sheet>

    <Sheet visible={movementOpen} onClose={() => setMovementOpen(false)} title="Ajustar inventario" footer={<Button title="Registrar movimiento" icon="check" onPress={saveMovement} loading={busy} />}>
      <View style={styles.selectedProduct}><Text style={styles.selectedName}>{movementProduct?.name}</Text><Text style={styles.selectedStock}>Stock actual: {movementProduct?.stock}</Text></View>
      <Text style={styles.label}>Tipo de movimiento</Text><Segmented<"entrada" | "salida"> values={[{ value: "entrada", label: "Entrada (+)" }, { value: "salida", label: "Salida (-)" }]} value={movementType} onChange={setMovementType} />
      <View style={styles.fieldSpacer} /><Field label="Cantidad" value={quantity} onChangeText={setQuantity} keyboardType="number-pad" />
      <Field label="Motivo o nota" value={note} onChangeText={setNote} placeholder="Ej. compra a proveedor" multiline />
    </Sheet>
  </>;
}

const styles = StyleSheet.create({
  addButton: { width: 47, height: 47, borderRadius: 16, backgroundColor: colors.forest, alignItems: "center", justifyContent: "center" }, search: { marginTop: 16 }, list: { padding: 4 }, movements: { marginTop: 16 },
  row: { minHeight: 84, flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 10 }, border: { borderTopWidth: 1, borderTopColor: colors.line },
  initial: { width: 46, height: 46, borderRadius: 15, backgroundColor: colors.forestSoft, alignItems: "center", justifyContent: "center" }, outIcon: { backgroundColor: colors.dangerSoft }, initialText: { color: colors.forest, fontSize: 18, fontWeight: "900" },
  productThumb: { width: 48, height: 48, borderRadius: 15, backgroundColor: colors.forestSoft },
  details: { flex: 1, marginHorizontal: 11 }, name: { color: colors.ink, fontSize: 13, fontWeight: "800" }, meta: { color: colors.muted, fontSize: 10, marginTop: 3 }, price: { color: colors.forest, fontSize: 12, fontWeight: "900", marginTop: 5 }, rowRight: { alignItems: "flex-end", gap: 7 }, moveButton: { width: 34, height: 30, borderRadius: 9, backgroundColor: colors.forestSoft, alignItems: "center", justifyContent: "center" },
  movementRight: { alignItems: "flex-end" }, movementQty: { fontSize: 17, fontWeight: "900" }, movementType: { color: colors.muted, fontSize: 10, textTransform: "capitalize", marginTop: 2 },
  footerRow: { flexDirection: "row", gap: 10 }, footerDelete: { flex: 0.8 }, footerSave: { flex: 1.2 }, label: { fontSize: 13, color: colors.ink, fontWeight: "700", marginBottom: 9 }, fieldSpacer: { height: 18 }, twoFields: { flexDirection: "row", gap: 12 }, half: { flex: 1 },
  selectedProduct: { backgroundColor: colors.forestSoft, padding: 15, borderRadius: 16, marginBottom: 18 }, selectedName: { color: colors.forest, fontWeight: "900" }, selectedStock: { color: colors.muted, fontSize: 12, marginTop: 4 },
  photoSection: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.white, borderRadius: 18, borderWidth: 1, borderColor: colors.line, padding: 12, marginBottom: 18 },
  photoPicker: { width: 104, height: 104, borderRadius: 18, overflow: "hidden", backgroundColor: colors.forestSoft },
  photoPreview: { width: "100%", height: "100%" },
  photoEmpty: { flex: 1, alignItems: "center", justifyContent: "center" }, photoEmptyTitle: { color: colors.forest, fontSize: 11, fontWeight: "800", marginTop: 5 }, photoEmptyCopy: { color: colors.muted, fontSize: 9, marginTop: 2 },
  photoEdit: { position: "absolute", right: 7, bottom: 7, width: 30, height: 30, borderRadius: 10, backgroundColor: colors.forest, alignItems: "center", justifyContent: "center" },
  photoHelp: { flex: 1 }, photoTitle: { color: colors.ink, fontWeight: "800", fontSize: 13 }, photoCopy: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 4 }, removePhoto: { color: colors.danger, fontSize: 11, fontWeight: "800", marginTop: 9 },
});
