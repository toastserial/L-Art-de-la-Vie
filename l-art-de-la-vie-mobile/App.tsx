import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { AppShell } from "./src/components/AppShell";
import { CashOpeningModal } from "./src/components/CashOpeningModal";
import { Button } from "./src/components/ui";
import { AuthProvider, useAuth } from "./src/context/AuthContext";
import { StoreProvider, useStore } from "./src/context/StoreContext";
import { LoginScreen } from "./src/screens/LoginScreen";
import { colors } from "./src/theme";
import { BrandLogo } from "./src/components/BrandLogo";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function App() {
  return <SafeAreaProvider><AuthProvider><StatusBar style="dark" backgroundColor={colors.white} /><AuthGate /></AuthProvider></SafeAreaProvider>;
}

function AuthGate() {
  const { session, user, loading } = useAuth();
  if (loading) return <Loading message="Preparando tu sesión..." />;
  if (!session || !user) return <LoginScreen />;
  return <StoreProvider><StoreGate /></StoreProvider>;
}

function StoreGate() {
  const { loading, error, refresh } = useStore();
  if (loading) return <Loading message="Cargando la tienda..." />;
  if (error) return <View style={styles.errorPage}><View style={styles.errorIcon}><MaterialCommunityIcons name="wifi-alert" size={34} color={colors.danger} /></View><Text style={styles.errorTitle}>No pudimos conectar</Text><Text style={styles.errorMessage}>{error}</Text><Button title="Intentar nuevamente" icon="refresh" onPress={() => refresh()} /></View>;
  return <><AppShell /><CashOpeningModal /></>;
}

function Loading({ message }: { message: string }) {
  return <View style={styles.loading}><BrandLogo size={156} /><ActivityIndicator size="large" color={colors.forest} /><Text style={styles.loadingText}>{message}</Text></View>;
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.cream, alignItems: "center", justifyContent: "center", gap: 18 }, loadingText: { color: colors.muted, fontSize: 13 },
  errorPage: { flex: 1, backgroundColor: colors.cream, justifyContent: "center", padding: 28 }, errorIcon: { width: 70, height: 70, borderRadius: 24, backgroundColor: colors.dangerSoft, alignItems: "center", justifyContent: "center", alignSelf: "center" }, errorTitle: { textAlign: "center", fontSize: 24, fontWeight: "900", color: colors.ink, marginTop: 18 }, errorMessage: { textAlign: "center", color: colors.muted, lineHeight: 20, marginTop: 7, marginBottom: 22 },
});
