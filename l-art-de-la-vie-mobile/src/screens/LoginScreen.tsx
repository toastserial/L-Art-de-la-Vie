import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { Button, Field } from "../components/ui";
import { BrandLogo } from "../components/BrandLogo";
import { useAuth } from "../context/AuthContext";
import { supabaseConfigError } from "../lib/supabase";
import { colors, shadow } from "../theme";

export function LoginScreen() {
  const { signIn, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const login = async () => {
    if (!email.trim() || !password) return Alert.alert("Faltan datos", "Escribe tu correo y contraseña.");
    setBusy(true);
    try { await signIn(email, password); }
    catch (reason) { Alert.alert("No pudimos ingresar", reason instanceof Error ? reason.message : "Intenta nuevamente"); }
    finally { setBusy(false); }
  };

  const recover = async () => {
    if (!email.trim()) return Alert.alert("Escribe tu correo", "Primero escribe el correo de tu cuenta.");
    try {
      await resetPassword(email);
      Alert.alert("Correo enviado", "Revisa tu bandeja para recuperar la contraseña.");
    } catch (reason) { Alert.alert("No se pudo enviar", reason instanceof Error ? reason.message : "Intenta nuevamente"); }
  };

  return <LinearGradient colors={["#052D18", colors.forest, "#0F5732"]} style={styles.background}>
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.center}>
      <View style={styles.brand}>
        <BrandLogo size={148} />
        <Text style={styles.brandSub}>Punto de venta móvil</Text>
      </View>
      <View style={styles.panel}>
        <Text style={styles.title}>Bienvenida</Text>
        <Text style={styles.copy}>Ingresa para administrar la tienda desde tu teléfono.</Text>
        {supabaseConfigError && <View style={styles.warning}><Text style={styles.warningText}>{supabaseConfigError}</Text></View>}
        <Field label="Correo electrónico" value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" placeholder="correo@ejemplo.com" />
        <Field label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry placeholder="Tu contraseña" onSubmitEditing={login} />
        <Button title="Ingresar" icon="arrow-right" onPress={login} loading={busy} />
        <Button title="Olvidé mi contraseña" variant="ghost" onPress={recover} compact style={styles.recover} />
      </View>
      <Text style={styles.secure}><MaterialCommunityIcons name="shield-check-outline" size={14} /> Sesión protegida por Supabase</Text>
    </KeyboardAvoidingView>
  </LinearGradient>;
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  center: { flex: 1, justifyContent: "center", padding: 22 },
  brand: { alignItems: "center", marginBottom: 25 },
  brandSub: { color: "rgba(255,255,255,0.76)", marginTop: 12, fontWeight: "700", letterSpacing: 0.4 },
  panel: { backgroundColor: colors.cream, borderRadius: 28, padding: 22, ...shadow },
  title: { fontSize: 25, fontWeight: "900", color: colors.ink },
  copy: { color: colors.muted, lineHeight: 20, marginTop: 5, marginBottom: 20 },
  warning: { padding: 10, backgroundColor: colors.dangerSoft, borderRadius: 10, marginBottom: 12 },
  warningText: { color: colors.danger, fontSize: 12 },
  recover: { marginTop: 5 },
  secure: { textAlign: "center", marginTop: 18, color: "rgba(255,255,255,0.65)", fontSize: 12 },
});
