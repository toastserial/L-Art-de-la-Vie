import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRef, useState } from "react";
import { Alert, ImageBackground, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button, Field } from "../components/ui";
import { BrandLogo } from "../components/BrandLogo";
import { useAuth } from "../context/AuthContext";
import { supabaseConfigError } from "../lib/supabase";
import { colors, shadow } from "../theme";

export function LoginScreen() {
  const { signIn, signInWithGoogle, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // En teléfonos pequeños el teclado puede cubrir el segundo campo. Al
  // enfocarlo, llevamos el final del formulario a la parte visible.
  const keepActiveFieldVisible = () => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 140);
  };

  const login = async () => {
    if (!email.trim() || !password) return Alert.alert("Faltan datos", "Escribe tu correo y contraseña.");
    setBusy(true);
    try { await signIn(email, password); }
    catch (reason) { Alert.alert("No pudimos ingresar", reason instanceof Error ? reason.message : "Intenta nuevamente"); }
    finally { setBusy(false); }
  };

  const loginWithGoogle = async () => {
    setGoogleBusy(true);
    try {
      await signInWithGoogle();
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Intenta nuevamente";
      if (message !== "Inicio de sesión cancelado") Alert.alert("No pudimos ingresar", message);
    } finally {
      setGoogleBusy(false);
    }
  };

  const recover = async () => {
    if (!email.trim()) return Alert.alert("Escribe tu correo", "Primero escribe el correo de tu cuenta.");
    try {
      await resetPassword(email);
      Alert.alert("Correo enviado", "Revisa tu bandeja para recuperar la contraseña.");
    } catch (reason) { Alert.alert("No se pudo enviar", reason instanceof Error ? reason.message : "Intenta nuevamente"); }
  };

  return <ImageBackground source={require("../../assets/login-boutique.jpg")} style={styles.background} imageStyle={styles.image}>
    <LinearGradient colors={["rgba(3,35,18,0.48)", "rgba(5,45,24,0.82)", "#031f10"]} locations={[0, 0.48, 1]} style={StyleSheet.absoluteFill} />
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={0} style={styles.keyboard}>
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.topbar}>
          <BrandLogo size={76} />
          <View style={styles.brandCopy}><Text style={styles.brandName}>L'Art de la Vie</Text><Text style={styles.brandSub}>BOUTIQUE · GESTIÓN</Text></View>
        </View>

        <View style={styles.intro}>
          <Text style={styles.heroTitle}>Tu boutique,{"\n"}en calma.</Text>
          <Text style={styles.heroCopy}>Ventas, inventario y caja en un solo lugar.</Text>
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHeader}><View><Text style={styles.eyebrow}>PORTAL DEL EQUIPO</Text><Text style={styles.title}>Bienvenida de nuevo.</Text></View><View style={styles.lock}><MaterialCommunityIcons name="lock-outline" size={21} color={colors.forest} /></View></View>
          <Text style={styles.copy}>Ingresa para gestionar tu día.</Text>
          {supabaseConfigError && <View style={styles.warning}><Text style={styles.warningText}>{supabaseConfigError}</Text></View>}
          <Field label="Correo electrónico" value={email} onChangeText={setEmail} onFocus={keepActiveFieldVisible} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" placeholder="correo@ejemplo.com" style={styles.input} />
          <Field label="Contraseña" value={password} onChangeText={setPassword} onFocus={keepActiveFieldVisible} secureTextEntry placeholder="Tu contraseña" onSubmitEditing={login} style={styles.input} />
          <Button title="Continuar" icon="arrow-right" onPress={login} loading={busy} style={styles.loginButton} />
          <Button title="¿Olvidaste tu contraseña?" variant="ghost" onPress={recover} compact style={styles.recover} />
          <View style={styles.divider}><View style={styles.dividerLine} /><Text style={styles.dividerText}>O CONTINÚA CON</Text><View style={styles.dividerLine} /></View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Continuar con Google"
            disabled={busy || googleBusy}
            onPress={loginWithGoogle}
            style={({ pressed }) => [styles.googleButton, (pressed || busy || googleBusy) && styles.googleButtonPressed]}
          >
            <MaterialCommunityIcons name="google" size={20} color="#4285F4" />
            <Text style={styles.googleText}>{googleBusy ? "Abriendo Google…" : "Continuar con Google"}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </ImageBackground>;
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: colors.forest },
  image: { resizeMode: "cover" },
  keyboard: { flex: 1 },
  content: { flexGrow: 1, justifyContent: "flex-end", paddingHorizontal: 20, paddingTop: Platform.OS === "ios" ? 58 : 34, paddingBottom: 52 },
  topbar: { position: "absolute", top: Platform.OS === "ios" ? 52 : 28, left: 20, right: 20, flexDirection: "row", alignItems: "center" },
  brandCopy: { marginLeft: 9 },
  brandName: { color: colors.white, fontSize: 18, fontWeight: "800" },
  brandSub: { color: colors.gold, marginTop: 4, fontSize: 9, fontWeight: "900", letterSpacing: 2 },
  intro: { marginTop: 130, marginBottom: 22, maxWidth: 355 },
  pill: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 7, borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)", backgroundColor: "rgba(7,59,32,0.35)", paddingHorizontal: 12, paddingVertical: 7 },
  pillText: { color: colors.white, fontSize: 10, fontWeight: "900", letterSpacing: 1.4 },
  heroTitle: { color: colors.white, fontSize: 34, lineHeight: 38, fontWeight: "900", letterSpacing: -0.7 },
  heroCopy: { color: "rgba(255,255,255,0.9)", fontSize: 14, lineHeight: 21, fontWeight: "600", marginTop: 9, maxWidth: 330 },
  panel: { backgroundColor: "rgba(250,248,242,0.97)", borderRadius: 30, padding: 22, borderWidth: 1, borderColor: "rgba(255,255,255,0.8)", ...shadow },
  panelHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  eyebrow: { color: colors.forestLight, fontSize: 9, fontWeight: "900", letterSpacing: 1.5, marginBottom: 5 },
  lock: { width: 43, height: 43, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: colors.forestSoft },
  title: { fontSize: 27, fontWeight: "900", color: colors.ink, letterSpacing: -0.4 },
  copy: { color: colors.muted, lineHeight: 20, marginTop: 7, marginBottom: 19 },
  input: { backgroundColor: colors.white, borderRadius: 16 },
  warning: { padding: 10, backgroundColor: colors.dangerSoft, borderRadius: 10, marginBottom: 12 },
  warningText: { color: colors.danger, fontSize: 12 },
  loginButton: { marginTop: 3, borderRadius: 16 },
  recover: { marginTop: 7 },
  divider: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 9, marginBottom: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#dfe4df" },
  dividerText: { color: colors.muted, fontSize: 9, fontWeight: "900", letterSpacing: 1.2 },
  googleButton: { minHeight: 51, borderRadius: 16, borderWidth: 1, borderColor: "#d9dfda", backgroundColor: colors.white, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  googleButtonPressed: { opacity: 0.62 },
  googleText: { color: colors.ink, fontSize: 14, fontWeight: "800" },
  secure: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 17 },
  secureText: { color: "rgba(255,255,255,0.68)", fontSize: 11, fontWeight: "600" },
});
