import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useStore } from "../context/StoreContext";
import { colors, money } from "../theme";
import { Button, Field } from "./ui";

export function CashOpeningModal({ visible, onClose, onInventory }: { visible: boolean; onClose(): void; onInventory(): void }) {
  const { cashOpening, loading, openCash } = useStore();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState<"choice" | "opening">("choice");
  useEffect(() => { if (!visible) setStep("choice"); }, [visible]);
  if (loading || cashOpening || !visible) return null;

  const submit = async () => {
    const value = Number(amount);
    if (!Number.isFinite(value) || value < 0) return Alert.alert("Monto inválido", "Escribe un fondo inicial válido. Puede ser cero.");
    setBusy(true);
    try { await openCash(value, note.trim() || undefined); }
    catch (reason) { Alert.alert("No se abrió la caja", reason instanceof Error ? reason.message : "Intenta nuevamente"); }
    finally { setBusy(false); }
  };

  return <Modal visible animationType="fade" onRequestClose={onClose}>
    <LinearGradient colors={[colors.cream, colors.forestSoft]} style={styles.background}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.center}>
        {step === "choice" ? <>
          <View style={styles.icon}><MaterialCommunityIcons name="weather-sunset-up" size={40} color={colors.gold} /></View>
          <Text style={styles.eyebrow}>COMENCEMOS</Text><Text style={styles.title}>¿Qué harás primero?</Text>
          <Text style={styles.copy}>Puedes organizar el inventario y abrir la caja cuando estés lista para vender.</Text>
          <View style={styles.choices}>
            <Pressable onPress={() => setStep("opening")} style={({ pressed }) => [styles.choice, styles.choicePrimary, pressed && styles.pressed]}><View style={styles.choiceIconPrimary}><MaterialCommunityIcons name="cash-register" size={25} color={colors.white} /></View><View style={styles.choiceText}><Text style={styles.choiceTitle}>Abrir caja</Text><Text style={styles.choiceCopy}>Registrar fondo y comenzar ventas.</Text></View><MaterialCommunityIcons name="chevron-right" size={22} color={colors.forest} /></Pressable>
            <Pressable onPress={onInventory} style={({ pressed }) => [styles.choice, pressed && styles.pressed]}><View style={styles.choiceIcon}><MaterialCommunityIcons name="package-variant-closed" size={25} color={colors.forest} /></View><View style={styles.choiceText}><Text style={styles.choiceTitle}>Ir a inventario</Text><Text style={styles.choiceCopy}>Agregar productos, fotos o categorías.</Text></View><MaterialCommunityIcons name="chevron-right" size={22} color={colors.forest} /></Pressable>
          </View>
          <Text style={styles.hint}>Te mostraremos un aviso discreto hasta que abras la caja.</Text>
        </> : <>
          <Pressable onPress={() => setStep("choice")} style={styles.back}><MaterialCommunityIcons name="arrow-left" size={19} color={colors.forest} /><Text style={styles.backText}>Volver</Text></Pressable>
          <View style={styles.icon}><MaterialCommunityIcons name="cash-register" size={42} color={colors.gold} /></View>
          <Text style={styles.eyebrow}>APERTURA DE CAJA</Text><Text style={styles.title}>¿Con cuánto comienzas?</Text>
          <Text style={styles.copy}>Registra el efectivo disponible antes de realizar la primera venta.</Text>
          <View style={styles.card}>
            <Field label="Fondo inicial" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.00" autoFocus />
            {amount !== "" && Number(amount) >= 0 && <Text style={styles.preview}>Comenzarás con {money(Number(amount) || 0)}</Text>}
            <Field label="Nota (opcional)" value={note} onChangeText={setNote} placeholder="Ej. cambio dejado del día anterior" multiline />
            <Button title="Abrir caja y comenzar" icon="lock-open-outline" onPress={submit} loading={busy} />
          </View>
          <Text style={styles.hint}>Este monto se sumará al efectivo esperado en el cierre.</Text>
        </>}
      </KeyboardAvoidingView>
    </LinearGradient>
  </Modal>;
}

const styles = StyleSheet.create({
  background: { flex: 1 }, center: { flex: 1, justifyContent: "center", padding: 24 }, icon: { width: 78, height: 78, borderRadius: 25, backgroundColor: colors.forest, alignItems: "center", justifyContent: "center", alignSelf: "center", marginBottom: 20 },
  eyebrow: { textAlign: "center", color: colors.gold, fontWeight: "900", fontSize: 11, letterSpacing: 2 }, title: { textAlign: "center", color: colors.ink, fontWeight: "900", fontSize: 30, marginTop: 6 }, copy: { textAlign: "center", color: colors.muted, lineHeight: 21, marginTop: 8, marginBottom: 22, paddingHorizontal: 10 },
  card: { backgroundColor: colors.white, borderRadius: 25, padding: 20, borderWidth: 1, borderColor: colors.line }, preview: { color: colors.success, fontSize: 12, fontWeight: "700", marginTop: -7, marginBottom: 14 }, hint: { textAlign: "center", color: colors.muted, fontSize: 11, marginTop: 16 },
  choices: { gap: 12, width: "100%" },
  choice: { minHeight: 92, borderRadius: 22, padding: 15, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white },
  choicePrimary: { borderColor: "#C9DCCF" }, choiceIcon: { width: 50, height: 50, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: colors.forestSoft }, choiceIconPrimary: { width: 50, height: 50, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: colors.forest },
  choiceText: { flex: 1, marginLeft: 13 }, choiceTitle: { color: colors.ink, fontSize: 15, fontWeight: "900" }, choiceCopy: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 3 }, pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
  back: { position: "absolute", left: 22, top: Platform.OS === "ios" ? 56 : 28, flexDirection: "row", alignItems: "center", gap: 5, padding: 8 }, backText: { color: colors.forest, fontSize: 12, fontWeight: "800" },
});
