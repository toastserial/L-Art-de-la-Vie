import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { AppShell } from "./src/components/AppShell";
import { Button, Skeleton } from "./src/components/ui";
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
  if (loading) return <StoreSkeleton />;
  if (error) return <View style={styles.errorPage}><View style={styles.errorIcon}><MaterialCommunityIcons name="wifi-alert" size={34} color={colors.danger} /></View><Text style={styles.errorTitle}>No pudimos conectar</Text><Text style={styles.errorMessage}>{error}</Text><Button title="Intentar nuevamente" icon="refresh" onPress={() => refresh()} /></View>;
  return <AppShell />;
}

function Loading({ message }: { message: string }) {
  return <View style={styles.loading}><BrandLogo size={132} /><ActivityIndicator size="small" color={colors.gold} /><Text style={styles.loadingText}>{message}</Text></View>;
}

function StoreSkeleton() {
  return <View style={styles.skeletonPage} accessibilityLabel="Cargando información de la tienda">
    <View style={styles.skeletonTop}><Skeleton style={styles.skeletonLogo} /><View style={styles.skeletonBrand}><Skeleton style={styles.skeletonLineWide} /><Skeleton style={styles.skeletonLineShort} /></View><Skeleton style={styles.skeletonAvatar} /></View>
    <View style={styles.skeletonBody}><Skeleton style={styles.skeletonTitle} /><Skeleton style={styles.skeletonSubtitle} /><Skeleton style={styles.skeletonStatus} /><View style={styles.skeletonGrid}>{Array.from({ length: 4 }).map((_, index) => <View key={index} style={styles.skeletonCard}><Skeleton style={styles.skeletonIcon} /><Skeleton style={styles.skeletonLineShort} /><Skeleton style={styles.skeletonValue} /></View>)}</View><Skeleton style={styles.skeletonSectionTitle} /><Skeleton style={styles.skeletonPanel} /></View>
    <View style={styles.skeletonNav}>{Array.from({ length: 4 }).map((_, index) => <View key={index} style={styles.skeletonNavItem}><Skeleton style={styles.skeletonNavIcon} /><Skeleton style={styles.skeletonNavText} /></View>)}</View>
  </View>;
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: colors.cream, alignItems: "center", justifyContent: "center", gap: 18 }, loadingText: { color: colors.muted, fontSize: 13 },
  skeletonPage: { flex: 1, backgroundColor: colors.cream }, skeletonTop: { height: 72, flexDirection: "row", alignItems: "center", paddingHorizontal: 15, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.line }, skeletonLogo: { width: 43, height: 43, borderRadius: 14 }, skeletonBrand: { flex: 1, marginLeft: 10, gap: 7 }, skeletonLineWide: { width: 125, height: 13 }, skeletonLineShort: { width: 76, height: 9 }, skeletonAvatar: { width: 40, height: 40, borderRadius: 14 },
  skeletonBody: { flex: 1, padding: 18 }, skeletonTitle: { width: 185, height: 29 }, skeletonSubtitle: { width: 110, height: 11, marginTop: 9 }, skeletonStatus: { height: 70, marginTop: 20, borderRadius: 20 }, skeletonGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 13 }, skeletonCard: { width: "48%", flexGrow: 1, height: 126, padding: 14, borderRadius: 19, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white }, skeletonIcon: { width: 38, height: 38, borderRadius: 13 }, skeletonValue: { width: 92, height: 22, marginTop: 12 }, skeletonSectionTitle: { width: 170, height: 17, marginTop: 25 }, skeletonPanel: { height: 150, marginTop: 13, borderRadius: 20 },
  skeletonNav: { height: 76, flexDirection: "row", alignItems: "center", backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.line }, skeletonNavItem: { flex: 1, alignItems: "center", gap: 6 }, skeletonNavIcon: { width: 34, height: 28, borderRadius: 10 }, skeletonNavText: { width: 40, height: 7 },
  errorPage: { flex: 1, backgroundColor: colors.cream, justifyContent: "center", padding: 28 }, errorIcon: { width: 70, height: 70, borderRadius: 24, backgroundColor: colors.dangerSoft, alignItems: "center", justifyContent: "center", alignSelf: "center" }, errorTitle: { textAlign: "center", fontSize: 24, fontWeight: "900", color: colors.ink, marginTop: 18 }, errorMessage: { textAlign: "center", color: colors.muted, lineHeight: 20, marginTop: 7, marginBottom: 22 },
});
