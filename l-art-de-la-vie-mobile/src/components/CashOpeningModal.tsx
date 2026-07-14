import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, View } from "react-native";
import { useStore } from "../context/StoreContext";
import { colors, money } from "../theme";
import { Button, Field } from "./ui";

export function CashOpeningModal() {
  const { cashOpening, loading, openCash } = useStore();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  if (loading || cashOpening) return null;

  const submit = async () => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value < 0) return Alert.alert("Monto inválido", "Escribe un fondo inicial válido. Puede ser cero.");
    setBusy(true);
    try { await openCash(value, note.trim() || undefined); }
    catch (reason) { Alert.alert("No se abrió la caja", reason instanceof Error ? reason.message : "Intenta nuevamente"); }
    finally { setBusy(false); }
  };

  return <Modal visible animationType="fade" onRequestClose={() => undefined}>
    <LinearGradient colors={[colors.cream, colors.forestSoft]} style={styles.background}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.center}>
        <View style={styles.icon}><MaterialCommunityIcons name="cash-register" size={42} color={colors.gold} /></View>
        <Text style={styles.eyebrow}>NUEVO DÍA</Text><Text style={styles.title}>Abramos la caja</Text>
        <Text style={styles.copy}>Registra cuánto efectivo hay en la caja antes de realizar la primera venta.</Text>
        <View style={styles.card}>
          <Field label="Fondo inicial" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00" autoFocus />
          {amount !== "" && Number(amount) >= 0 && <Text style={styles.preview}>Comenzarás con {money(Number(amount) || 0)}</Text>}
          <Field label="Nota (opcional)" value={note} onChangeText={setNote} placeholder="Ej. cambio dejado del día anterior" multiline />
          <Button title="Abrir caja y comenzar" icon="lock-open-outline" onPress={submit} loading={busy} />
        </View>
        <Text style={styles.hint}>Este monto se sumará al efectivo esperado en el cierre.</Text>
      </KeyboardAvoidingView>
    </LinearGradient>
  </Modal>;
}

const styles = StyleSheet.create({
  background: { flex: 1 }, center: { flex: 1, justifyContent: "center", padding: 24 }, icon: { width: 78, height: 78, borderRadius: 25, backgroundColor: colors.forest, alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 20 },
  eyebrow: { textAlign: "center", color: colors.gold, fontWeight: "900", fontSize: 11, letterSpacing: 2 }, title: { textAlign: "center", color: colors.ink, fontWeight: "900", fontSize: 30, marginTop: 6 }, copy: { textAlign: "center", color: colors.muted, lineHeight: 21, marginTop: 8, marginBottom: 22, paddingHorizontal: 10 },
  card: { backgroundColor: colors.white, borderRadius: 25, padding: 20, borderWidth: 1, borderColor: colors.line }, preview: { color: colors.success, fontSize: 12, fontWeight: "700", marginTop: -7, marginBottom: 14 }, hint: { textAlign: "center", color: colors.muted, fontSize: 11, marginTop: 16 },
});
