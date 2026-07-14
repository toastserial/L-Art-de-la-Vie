import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { Card, EmptyState, Pill } from "../components/ui";
import { Page } from "../components/Page";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import { colors, localDay, money, shortDate } from "../theme";

export function DashboardScreen() {
  const { user } = useAuth();
  const { products, sales, cashOpening, refreshing, refresh } = useStore();
  const today = localDay(new Date());
  const todaySales = sales.filter(sale => localDay(sale.date) === today);
  const todayTotal = todaySales.reduce((sum, sale) => sum + sale.total, 0);
  const lowStock = products.filter(product => product.stock <= product.minStock);
  const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
  const weekTotal = sales.filter(sale => new Date(sale.date) >= weekAgo).reduce((sum, sale) => sum + sale.total, 0);

  return <Page title={`Hola, ${user?.fullName?.split(" ")[0] || "equipo"}`} subtitle={shortDate(new Date())} refreshing={refreshing} onRefresh={() => refresh(true)}>
    <View style={[styles.cashState, { backgroundColor: cashOpening ? colors.forest : colors.warning }]}>
      <View style={styles.cashIcon}><MaterialCommunityIcons name={cashOpening ? "cash-check" : "cash-remove"} size={26} color={colors.white} /></View>
      <View style={styles.cashText}>
        <Text style={styles.cashTitle}>{cashOpening ? "Caja abierta" : "Caja pendiente"}</Text>
        <Text style={styles.cashCopy}>{cashOpening ? `Fondo inicial ${money(cashOpening.openingCash)}` : "Abre la caja para comenzar a vender"}</Text>
      </View>
    </View>

    <View style={styles.grid}>
      <Metric icon="cash-multiple" label="Ventas hoy" value={money(todayTotal)} note={`${todaySales.length} transacciones`} />
      <Metric icon="trending-up" label="Últimos 7 días" value={money(weekTotal)} note="Ventas acumuladas" />
      <Metric icon="package-variant-closed" label="Productos" value={`${products.length}`} note={`${products.reduce((s, p) => s + p.stock, 0)} unidades`} />
      <Metric icon="alert-outline" label="Stock bajo" value={`${lowStock.length}`} note="Requieren atención" warning={lowStock.length > 0} />
    </View>

    <Text style={styles.sectionTitle}>Stock que debes revisar</Text>
    <Card style={styles.listCard}>
      {lowStock.length === 0 ? <EmptyState icon="check-circle-outline" title="Inventario saludable" message="No hay productos debajo del mínimo." /> : lowStock.slice(0, 5).map((product, index) =>
        <View key={product.id} style={[styles.row, index > 0 && styles.rowBorder]}>
          <View style={styles.productIcon}><Text style={styles.productInitial}>{product.name.charAt(0)}</Text></View>
          <View style={styles.rowText}><Text style={styles.productName}>{product.name}</Text><Text style={styles.productCode}>{product.code}</Text></View>
          <Pill tone="danger">{product.stock} / {product.minStock}</Pill>
        </View>)}
    </Card>

    <Text style={styles.sectionTitle}>Ventas recientes</Text>
    <Card style={styles.listCard}>
      {sales.length === 0 ? <EmptyState icon="receipt-text-outline" title="Aún no hay ventas" message="Las ventas aparecerán aquí." /> : sales.slice(0, 4).map((sale, index) =>
        <View key={sale.id} style={[styles.row, index > 0 && styles.rowBorder]}>
          <View style={[styles.productIcon, { backgroundColor: colors.goldSoft }]}><MaterialCommunityIcons name="receipt-text-outline" size={20} color={colors.warning} /></View>
          <View style={styles.rowText}><Text style={styles.productName}>{sale.items.length} productos</Text><Text style={styles.productCode}>{sale.paymentMethod} · {shortDate(sale.date)}</Text></View>
          <Text style={styles.saleTotal}>{money(sale.total)}</Text>
        </View>)}
    </Card>
  </Page>;
}

function Metric({ icon, label, value, note, warning }: { icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"]; label: string; value: string; note: string; warning?: boolean }) {
  return <Card style={styles.metric}>
    <View style={[styles.metricIcon, warning && { backgroundColor: colors.dangerSoft }]}><MaterialCommunityIcons name={icon} size={21} color={warning ? colors.danger : colors.forest} /></View>
    <Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricNote}>{note}</Text>
  </Card>;
}

const styles = StyleSheet.create({
  cashState: { borderRadius: 20, padding: 16, flexDirection: "row", alignItems: "center", marginBottom: 14 },
  cashIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  cashText: { marginLeft: 13 }, cashTitle: { color: colors.white, fontWeight: "900", fontSize: 16 }, cashCopy: { color: "rgba(255,255,255,0.76)", marginTop: 3, fontSize: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metric: { width: "48%", minHeight: 150, padding: 14 }, metricIcon: { width: 39, height: 39, borderRadius: 12, backgroundColor: colors.forestSoft, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  metricLabel: { color: colors.muted, fontSize: 12, fontWeight: "700" }, metricValue: { color: colors.ink, fontSize: 20, fontWeight: "900", marginTop: 4 }, metricNote: { color: colors.muted, fontSize: 10, marginTop: 3 },
  sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: "900", marginTop: 23, marginBottom: 10 },
  listCard: { paddingVertical: 3 }, row: { flexDirection: "row", alignItems: "center", minHeight: 66, paddingHorizontal: 12 }, rowBorder: { borderTopWidth: 1, borderTopColor: colors.line },
  productIcon: { width: 39, height: 39, borderRadius: 12, backgroundColor: colors.forestSoft, alignItems: "center", justifyContent: "center" }, productInitial: { color: colors.forest, fontWeight: "900" },
  rowText: { flex: 1, marginHorizontal: 11 }, productName: { color: colors.ink, fontSize: 13, fontWeight: "800" }, productCode: { color: colors.muted, fontSize: 11, marginTop: 3, textTransform: "capitalize" }, saleTotal: { fontWeight: "900", color: colors.forest, fontSize: 13 },
});
