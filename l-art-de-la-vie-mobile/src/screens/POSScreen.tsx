import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Button, Card, EmptyState, Field, Pill, Segmented, Sheet } from "../components/ui";
import { Page } from "../components/Page";
import { useStore } from "../context/StoreContext";
import { colors, money } from "../theme";
import type { Category, PaymentMethod, Product } from "../types";

type Filter = "Todas" | Category;
const categories: { value: Filter; label: string }[] = [
  { value: "Todas", label: "Todas" }, { value: "Decoración", label: "Decoración" },
  { value: "Perfumes", label: "Perfumes" }, { value: "Carteras", label: "Carteras" }, { value: "Varios", label: "Varios" },
];

export function POSScreen() {
  const { products, cart, cartCount, cartSubtotal, cashOpening, refreshing, refresh, addToCart, removeFromCart, updateCartQuantity, clearCart, completeSale } = useStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Filter>("Todas");
  const [cartOpen, setCartOpen] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("efectivo");
  const [discount, setDiscount] = useState("0");
  const [cashReceived, setCashReceived] = useState("");
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => products.filter(product => product.stock > 0
    && (category === "Todas" || product.category === category)
    && (`${product.name} ${product.code}`.toLowerCase().includes(search.trim().toLowerCase()))), [products, search, category]);
  const discountPercent = Math.min(100, Math.max(0, Number(discount) || 0));
  const discountAmount = cartSubtotal * discountPercent / 100;
  const total = cartSubtotal - discountAmount;
  const cash = Number(cashReceived) || 0;

  const charge = async () => {
    if (!cashOpening) return Alert.alert("Caja cerrada", "Primero debes abrir la caja.");
    if (!cart.length) return Alert.alert("Carrito vacío", "Agrega al menos un producto.");
    if (method === "efectivo" && cash < total) return Alert.alert("Efectivo insuficiente", `Faltan ${money(total - cash)}.`);
    setBusy(true);
    try {
      const sale = await completeSale(method, discountPercent, method === "efectivo" ? cash : undefined);
      setCartOpen(false); setDiscount("0"); setCashReceived("");
      Alert.alert("Venta completada", `${money(sale.total)} cobrados correctamente.${sale.change ? `\nCambio: ${money(sale.change)}` : ""}`);
    } catch (reason) { Alert.alert("No se completó la venta", reason instanceof Error ? reason.message : "Intenta nuevamente"); }
    finally { setBusy(false); }
  };

  return <>
    <Page title="Punto de venta" subtitle="Toca un producto para agregarlo" refreshing={refreshing} onRefresh={() => refresh(true)}
      action={<Pressable onPress={() => setCartOpen(true)} style={styles.cartButton}><MaterialCommunityIcons name="cart-outline" size={23} color={colors.white} />{cartCount > 0 && <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{cartCount}</Text></View>}</Pressable>}>
      {!cashOpening && <View style={styles.closed}><MaterialCommunityIcons name="lock-outline" size={18} color={colors.warning} /><Text style={styles.closedText}>Debes abrir la caja antes de cobrar.</Text></View>}
      <Field value={search} onChangeText={setSearch} placeholder="Buscar nombre o código..." autoCapitalize="none" />
      <Segmented<Filter> values={categories} value={category} onChange={setCategory} />
      <View style={styles.productGrid}>
        {filtered.map(product => <ProductCard key={product.id} product={product} onAdd={() => addToCart(product)} />)}
      </View>
      {filtered.length === 0 && <Card style={styles.emptyCard}><EmptyState icon="magnify" title="Sin resultados" message="Prueba con otro nombre o categoría." /></Card>}
      {cartCount > 0 && <Button title={`Ver carrito · ${cartCount} · ${money(cartSubtotal)}`} icon="cart-outline" onPress={() => setCartOpen(true)} style={styles.viewCart} />}
    </Page>

    <Sheet visible={cartOpen} onClose={() => setCartOpen(false)} title={`Carrito (${cartCount})`} full footer={<Button title={`Cobrar ${money(total)}`} icon="cash-register" onPress={charge} loading={busy} disabled={!cashOpening || !cart.length} />}>
      {cart.length === 0 ? <EmptyState icon="cart-outline" title="Carrito vacío" message="Cierra esta ventana y toca los productos que deseas vender." /> : <>
        {cart.map((item, index) => <View key={item.product.id} style={[styles.cartRow, index > 0 && styles.cartBorder]}>
          <View style={styles.cartProduct}><Text style={styles.cartName}>{item.product.name}</Text><Text style={styles.cartPrice}>{money(item.product.price)} c/u</Text></View>
          <View style={styles.quantity}>
            <Pressable onPress={() => updateCartQuantity(item.product.id, item.quantity - 1)} style={styles.qtyButton}><MaterialCommunityIcons name="minus" size={18} color={colors.forest} /></Pressable>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <Pressable onPress={() => updateCartQuantity(item.product.id, item.quantity + 1)} style={styles.qtyButton}><MaterialCommunityIcons name="plus" size={18} color={colors.forest} /></Pressable>
          </View>
          <Pressable onPress={() => removeFromCart(item.product.id)} hitSlop={8}><MaterialCommunityIcons name="trash-can-outline" size={21} color={colors.danger} /></Pressable>
        </View>)}
        <Pressable onPress={() => Alert.alert("Vaciar carrito", "¿Quitar todos los productos?", [{ text: "Cancelar" }, { text: "Vaciar", style: "destructive", onPress: clearCart }])} style={styles.clear}><Text style={styles.clearText}>Vaciar carrito</Text></Pressable>
        <View style={styles.summary}>
          <Summary label="Subtotal" value={money(cartSubtotal)} />
          <Field label="Descuento (%)" value={discount} onChangeText={setDiscount} keyboardType="decimal-pad" />
          {discountAmount > 0 && <Summary label="Descuento" value={`-${money(discountAmount)}`} danger />}
          <Summary label="Total" value={money(total)} total />
        </View>
        <Text style={styles.formTitle}>Método de pago</Text>
        <Segmented<PaymentMethod> values={[{ value: "efectivo", label: "Efectivo" }, { value: "tarjeta", label: "Tarjeta" }, { value: "transferencia", label: "Transferencia" }]} value={method} onChange={setMethod} />
        {method === "efectivo" && <View style={styles.cashField}>
          <Field label="Efectivo recibido" value={cashReceived} onChangeText={setCashReceived} keyboardType="decimal-pad" placeholder={money(total)} />
          {cash >= total && cash > 0 && <View style={styles.change}><Text style={styles.changeLabel}>Cambio</Text><Text style={styles.changeValue}>{money(cash - total)}</Text></View>}
        </View>}
      </>}
    </Sheet>
  </>;
}

function ProductCard({ product, onAdd }: { product: Product; onAdd(): void }) {
  const low = product.stock <= product.minStock;
  return <Pressable onPress={onAdd} style={({ pressed }) => [styles.product, pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] }]}>
    <View style={styles.productTop}><View style={styles.productIcon}><Text style={styles.productInitial}>{product.name.charAt(0)}</Text></View><Pill tone={low ? "danger" : "success"}>{product.stock}</Pill></View>
    <Text style={styles.productName} numberOfLines={2}>{product.name}</Text><Text style={styles.productCode}>{product.code}</Text>
    <View style={styles.productBottom}><Text style={styles.productPrice}>{money(product.price)}</Text><View style={styles.add}><MaterialCommunityIcons name="plus" size={19} color={colors.white} /></View></View>
  </Pressable>;
}

function Summary({ label, value, total, danger }: { label: string; value: string; total?: boolean; danger?: boolean }) {
  return <View style={styles.summaryRow}><Text style={[styles.summaryLabel, total && styles.summaryTotal]}>{label}</Text><Text style={[styles.summaryValue, total && styles.summaryTotal, danger && { color: colors.danger }]}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  cartButton: { width: 47, height: 47, borderRadius: 16, backgroundColor: colors.forest, alignItems: "center", justifyContent: "center" }, cartBadge: { position: "absolute", right: -4, top: -5, backgroundColor: colors.gold, minWidth: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 }, cartBadgeText: { color: colors.white, fontSize: 10, fontWeight: "900" },
  closed: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.goldSoft, borderRadius: 14, padding: 12, marginBottom: 14 }, closedText: { color: colors.warning, fontSize: 12, fontWeight: "700" },
  productGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 17 }, product: { width: "48%", backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 20, padding: 13, minHeight: 190 },
  productTop: { flexDirection: "row", justifyContent: "space-between" }, productIcon: { width: 40, height: 40, borderRadius: 13, backgroundColor: colors.forestSoft, alignItems: "center", justifyContent: "center" }, productInitial: { fontWeight: "900", color: colors.forest, fontSize: 17 },
  productName: { color: colors.ink, fontWeight: "800", fontSize: 14, minHeight: 37, marginTop: 12 }, productCode: { color: colors.muted, fontSize: 10, marginTop: 2 }, productBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }, productPrice: { color: colors.forest, fontWeight: "900", fontSize: 15 }, add: { width: 31, height: 31, borderRadius: 10, backgroundColor: colors.forest, alignItems: "center", justifyContent: "center" },
  emptyCard: { marginTop: 18 }, viewCart: { marginTop: 18 },
  cartRow: { minHeight: 75, flexDirection: "row", alignItems: "center", gap: 10 }, cartBorder: { borderTopWidth: 1, borderTopColor: colors.line }, cartProduct: { flex: 1 }, cartName: { color: colors.ink, fontWeight: "800", fontSize: 13 }, cartPrice: { color: colors.muted, fontSize: 11, marginTop: 3 },
  quantity: { flexDirection: "row", alignItems: "center", gap: 7 }, qtyButton: { width: 31, height: 31, borderRadius: 10, backgroundColor: colors.forestSoft, alignItems: "center", justifyContent: "center" }, qtyText: { minWidth: 20, textAlign: "center", color: colors.ink, fontWeight: "900" },
  clear: { alignSelf: "flex-end", paddingVertical: 10 }, clearText: { color: colors.danger, fontSize: 12, fontWeight: "800" },
  summary: { backgroundColor: colors.white, borderRadius: 18, padding: 16, marginVertical: 14 }, summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 }, summaryLabel: { color: colors.muted, fontSize: 13 }, summaryValue: { color: colors.ink, fontSize: 13, fontWeight: "800" }, summaryTotal: { color: colors.ink, fontSize: 18, fontWeight: "900" },
  formTitle: { color: colors.ink, fontWeight: "900", fontSize: 15, marginBottom: 10 }, cashField: { marginTop: 16 }, change: { backgroundColor: colors.forestSoft, borderRadius: 14, padding: 13, flexDirection: "row", justifyContent: "space-between" }, changeLabel: { color: colors.forest, fontWeight: "700" }, changeValue: { color: colors.forest, fontWeight: "900", fontSize: 17 },
});
