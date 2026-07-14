import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Button, Card, EmptyState, Field, Pill, Segmented, Sheet } from "../components/ui";
import { Page } from "../components/Page";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import { colors, localDay, money, shortDate } from "../theme";

export function CashScreen() {
  const { canManage } = useAuth();
  const { sales, cashOpening, todayExpenses, cashCloses, refreshing, refresh, addExpense, deleteExpense, closeCash } = useStore();
  const [tab, setTab] = useState<"today" | "history">("today");
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [expenseDescription, setExpenseDescription] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [closeOpen, setCloseOpen] = useState(false);
  const [actualCash, setActualCash] = useState("");
  const [busy, setBusy] = useState(false);
  const today = localDay(new Date());
  const closedToday = cashCloses.some(close => close.date === today || localDay(close.date) === today);
  const todaySales = sales.filter(sale => localDay(sale.date) === today);
  const cashSales = todaySales.filter(s => s.paymentMethod === "efectivo").reduce((sum, s) => sum + s.total, 0);
  const cardSales = todaySales.filter(s => s.paymentMethod === "tarjeta").reduce((sum, s) => sum + s.total, 0);
  const transfers = todaySales.filter(s => s.paymentMethod === "transferencia").reduce((sum, s) => sum + s.total, 0);
  const totalSales = cashSales + cardSales + transfers;
  const expenses = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const expected = (cashOpening?.openingCash || 0) + cashSales - expenses;
  const actual = Number(actualCash) || 0;

  const saveExpense = async () => {
    const amount = Number(expenseAmount);
    if (!expenseDescription.trim() || !Number.isFinite(amount) || amount <= 0) return Alert.alert("Datos incompletos", "Escribe una descripción y monto válido.");
    setBusy(true);
    try { await addExpense(expenseDescription.trim(), amount); setExpenseDescription(""); setExpenseAmount(""); setExpenseOpen(false); }
    catch (reason) { Alert.alert("No se registró", reason instanceof Error ? reason.message : "Intenta nuevamente"); }
    finally { setBusy(false); }
  };

  const submitClose = async () => {
    if (actualCash === "" || actual < 0) return Alert.alert("Falta el conteo", "Escribe cuánto efectivo contaste físicamente.");
    Alert.alert("Confirmar cierre", `Esperado: ${money(expected)}\nContado: ${money(actual)}\nDiferencia: ${money(actual - expected)}`, [
      { text: "Cancelar" }, { text: "Cerrar caja", style: "destructive", onPress: async () => {
        setBusy(true); try { await closeCash(actual); setCloseOpen(false); setActualCash(""); Alert.alert("Caja cerrada", "El cierre fue guardado correctamente."); }
        catch (reason) { Alert.alert("No se cerró", reason instanceof Error ? reason.message : "Intenta nuevamente"); } finally { setBusy(false); }
      } },
    ]);
  };

  return <>
    <Page title="Caja" subtitle={closedToday ? "Jornada cerrada" : "Control de la jornada"} refreshing={refreshing} onRefresh={() => refresh(true)}>
      <Segmented<"today" | "history"> values={[{ value: "today", label: "Hoy" }, { value: "history", label: "Historial" }]} value={tab} onChange={setTab} />
      {tab === "today" ? <>
        <View style={[styles.state, { backgroundColor: closedToday ? colors.muted : colors.forest }]}><MaterialCommunityIcons name={closedToday ? "lock-outline" : "lock-open-outline"} size={22} color={colors.white} /><View><Text style={styles.stateTitle}>{closedToday ? "Caja cerrada" : "Caja abierta"}</Text><Text style={styles.stateCopy}>{cashOpening ? `Fondo inicial ${money(cashOpening.openingCash)}` : "Sin apertura"}</Text></View></View>
        <View style={styles.grid}><CashMetric icon="cash" label="Efectivo" value={cashSales} /><CashMetric icon="credit-card-outline" label="Tarjeta" value={cardSales} /><CashMetric icon="bank-transfer" label="Transferencia" value={transfers} /><CashMetric icon="chart-line" label="Total ventas" value={totalSales} /></View>
        <Text style={styles.sectionTitle}>Gastos del día</Text>
        <Card style={styles.cardList}>
          {todayExpenses.length === 0 ? <EmptyState icon="cash-minus" title="Sin gastos" message="No se han registrado salidas de efectivo hoy." /> : todayExpenses.map((expense, index) => <View key={expense.id} style={[styles.expenseRow, index > 0 && styles.border]}><View style={styles.expenseIcon}><MaterialCommunityIcons name="cash-minus" size={20} color={colors.danger} /></View><View style={styles.expenseText}><Text style={styles.expenseName}>{expense.description}</Text><Text style={styles.expenseDate}>{shortDate(expense.date)}</Text></View><Text style={styles.expenseValue}>-{money(expense.amount)}</Text>{canManage && !closedToday && <Pressable onPress={() => Alert.alert("Eliminar gasto", `¿Eliminar ${expense.description}?`, [{ text: "Cancelar" }, { text: "Eliminar", style: "destructive", onPress: () => deleteExpense(expense.id).catch(reason => Alert.alert("No se eliminó", reason instanceof Error ? reason.message : "Intenta nuevamente")) }])} hitSlop={10}><MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.danger} /></Pressable>}</View>)}
        </Card>
        {!closedToday && cashOpening && <Button title="Registrar gasto" variant="secondary" icon="plus" onPress={() => setExpenseOpen(true)} style={styles.action} />}
        <Text style={styles.sectionTitle}>Resumen de efectivo</Text><Card>
          <Summary label="Fondo inicial" value={cashOpening?.openingCash || 0} /><Summary label="Ventas en efectivo" value={cashSales} /><Summary label="Gastos" value={-expenses} danger /><View style={styles.totalLine} /><Summary label="Efectivo esperado" value={expected} total />
        </Card>
        {canManage && !closedToday && cashOpening && <Button title="Cerrar caja" icon="lock-outline" onPress={() => setCloseOpen(true)} style={styles.closeButton} />}
      </> : <Card style={[styles.cardList, styles.history]}>
        {cashCloses.length === 0 ? <EmptyState icon="history" title="Sin cierres" message="Los cierres diarios aparecerán aquí." /> : cashCloses.map((close, index) => <View key={close.id} style={[styles.historyRow, index > 0 && styles.border]}><View style={styles.calendar}><Text style={styles.calendarDay}>{new Date(close.date).getUTCDate()}</Text><Text style={styles.calendarMonth}>{new Date(close.date).toLocaleDateString("es-HN", { month: "short", timeZone: "UTC" })}</Text></View><View style={styles.expenseText}><Text style={styles.expenseName}>{money(close.totalSales)} en ventas</Text><Text style={styles.expenseDate}>Esperado {money(close.expectedCash)} · Real {money(close.actualCash)}</Text></View><Pill tone={close.difference === 0 ? "success" : "danger"}>{close.difference >= 0 ? "+" : ""}{money(close.difference)}</Pill></View>)}
      </Card>}
    </Page>

    <Sheet visible={expenseOpen} onClose={() => setExpenseOpen(false)} title="Nuevo gasto" footer={<Button title="Registrar gasto" icon="check" onPress={saveExpense} loading={busy} />}><Field label="Descripción" value={expenseDescription} onChangeText={setExpenseDescription} placeholder="Ej. compra de bolsas" autoFocus /><Field label="Monto" value={expenseAmount} onChangeText={setExpenseAmount} keyboardType="decimal-pad" placeholder="0.00" /></Sheet>
    <Sheet visible={closeOpen} onClose={() => setCloseOpen(false)} title="Cerrar caja" footer={<Button title="Confirmar cierre" icon="lock-outline" onPress={submitClose} loading={busy} />}>
      <View style={styles.closeSummary}><Text style={styles.closeSummaryLabel}>El sistema espera</Text><Text style={styles.closeSummaryValue}>{money(expected)}</Text><Text style={styles.closeSummaryNote}>Fondo + efectivo vendido − gastos</Text></View>
      <Field label="¿Cuánto efectivo contaste?" value={actualCash} onChangeText={setActualCash} keyboardType="decimal-pad" placeholder="0.00" autoFocus />
      {actualCash !== "" && <View style={[styles.difference, { backgroundColor: actual - expected === 0 ? colors.forestSoft : colors.dangerSoft }]}><Text style={styles.differenceLabel}>Diferencia</Text><Text style={[styles.differenceValue, { color: actual - expected === 0 ? colors.success : colors.danger }]}>{actual - expected >= 0 ? "+" : ""}{money(actual - expected)}</Text></View>}
    </Sheet>
  </>;
}

function CashMetric({ icon, label, value }: { icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"]; label: string; value: number }) { return <Card style={styles.metric}><MaterialCommunityIcons name={icon} size={21} color={colors.forest} /><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue}>{money(value)}</Text></Card>; }
function Summary({ label, value, danger, total }: { label: string; value: number; danger?: boolean; total?: boolean }) { return <View style={styles.summaryRow}><Text style={[styles.summaryLabel, total && styles.summaryTotal]}>{label}</Text><Text style={[styles.summaryValue, danger && { color: colors.danger }, total && styles.summaryTotal]}>{value < 0 ? "-" : ""}{money(Math.abs(value))}</Text></View>; }

const styles = StyleSheet.create({
  state: { marginTop: 17, borderRadius: 18, padding: 15, flexDirection: "row", alignItems: "center", gap: 12 }, stateTitle: { color: colors.white, fontWeight: "900" }, stateCopy: { color: "rgba(255,255,255,0.72)", fontSize: 11, marginTop: 2 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 }, metric: { width: "48%", minHeight: 112, padding: 14 }, metricLabel: { color: colors.muted, fontSize: 11, marginTop: 9 }, metricValue: { color: colors.ink, fontSize: 16, fontWeight: "900", marginTop: 3 },
  sectionTitle: { color: colors.ink, fontSize: 17, fontWeight: "900", marginTop: 23, marginBottom: 10 }, cardList: { padding: 4 }, expenseRow: { flexDirection: "row", alignItems: "center", minHeight: 69, paddingHorizontal: 9, gap: 9 }, border: { borderTopWidth: 1, borderTopColor: colors.line }, expenseIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: colors.dangerSoft, alignItems: "center", justifyContent: "center" }, expenseText: { flex: 1 }, expenseName: { color: colors.ink, fontSize: 13, fontWeight: "800" }, expenseDate: { color: colors.muted, fontSize: 10, marginTop: 3 }, expenseValue: { color: colors.danger, fontSize: 12, fontWeight: "900" },
  action: { marginTop: 10 }, summaryRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 }, summaryLabel: { color: colors.muted, fontSize: 13 }, summaryValue: { color: colors.ink, fontSize: 13, fontWeight: "800" }, summaryTotal: { fontSize: 18, color: colors.ink, fontWeight: "900" }, totalLine: { height: 1, backgroundColor: colors.line, marginVertical: 8 }, closeButton: { marginTop: 14 },
  history: { marginTop: 16 }, historyRow: { minHeight: 78, flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 9 }, calendar: { width: 45, height: 49, borderRadius: 13, backgroundColor: colors.forestSoft, alignItems: "center", justifyContent: "center" }, calendarDay: { color: colors.forest, fontSize: 17, fontWeight: "900" }, calendarMonth: { color: colors.forest, fontSize: 9, textTransform: "uppercase" },
  closeSummary: { backgroundColor: colors.forest, borderRadius: 20, padding: 20, alignItems: "center", marginBottom: 20 }, closeSummaryLabel: { color: "rgba(255,255,255,0.7)", fontSize: 12 }, closeSummaryValue: { color: colors.white, fontSize: 28, fontWeight: "900", marginTop: 4 }, closeSummaryNote: { color: "rgba(255,255,255,0.6)", fontSize: 10, marginTop: 4 }, difference: { borderRadius: 15, padding: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, differenceLabel: { color: colors.ink, fontWeight: "700" }, differenceValue: { fontSize: 18, fontWeight: "900" },
});
