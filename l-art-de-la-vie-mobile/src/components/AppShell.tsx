import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import { CashScreen } from "../screens/CashScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { InventoryScreen } from "../screens/InventoryScreen";
import { POSScreen } from "../screens/POSScreen";
import { colors, money } from "../theme";
import { Button, Sheet } from "./ui";
import { BrandLogo } from "./BrandLogo";

type Tab = "home" | "pos" | "inventory" | "cash";
const tabs: { id: Tab; label: string; icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"] }[] = [
  { id: "home", label: "Inicio", icon: "view-dashboard-outline" },
  { id: "pos", label: "Vender", icon: "cash-register" },
  { id: "inventory", label: "Inventario", icon: "package-variant-closed" },
  { id: "cash", label: "Caja", icon: "wallet-outline" },
];

export function AppShell() {
  const { user, signOut } = useAuth();
  const { cartCount, cartSubtotal } = useStore();
  const [tab, setTab] = useState<Tab>("home");
  const [accountOpen, setAccountOpen] = useState(false);
  const Screen = tab === "home" ? DashboardScreen : tab === "pos" ? POSScreen : tab === "inventory" ? InventoryScreen : CashScreen;
  const role = user?.role === "owner" ? "Propietario" : user?.role === "admin" ? "Administrador" : "Cajero";

  return <SafeAreaView style={styles.safe}>
    <View style={styles.topbar}>
      <BrandLogo size={39} animated={false} />
      <View style={styles.brandText}><Text style={styles.brand}>L'Art de la Vie</Text><Text style={styles.status}>Sistema conectado</Text></View>
      <Pressable onPress={() => setAccountOpen(true)} style={styles.avatar}><Text style={styles.avatarText}>{user?.fullName?.charAt(0).toUpperCase() || "U"}</Text></Pressable>
    </View>
    <View style={styles.screen}><Screen /></View>
    <View style={styles.bottom}>
      {tabs.map(item => {
        const active = tab === item.id;
        return <Pressable key={item.id} onPress={() => setTab(item.id)} style={styles.tab}>
          <View style={[styles.tabIcon, active && styles.tabIconActive]}><MaterialCommunityIcons name={item.icon} size={22} color={active ? colors.white : colors.muted} />
            {item.id === "pos" && cartCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{cartCount}</Text></View>}
          </View><Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{item.label}</Text>
        </Pressable>;
      })}
    </View>
    <Sheet visible={accountOpen} onClose={() => setAccountOpen(false)} title="Mi cuenta">
      <View style={styles.profile}><View style={styles.profileAvatar}><Text style={styles.profileInitial}>{user?.fullName?.charAt(0).toUpperCase()}</Text></View><Text style={styles.profileName}>{user?.fullName}</Text><Text style={styles.profileEmail}>{user?.email}</Text><View style={styles.role}><Text style={styles.roleText}>{role}</Text></View></View>
      {cartCount > 0 && <View style={styles.pending}><MaterialCommunityIcons name="cart-outline" size={21} color={colors.warning} /><View><Text style={styles.pendingTitle}>Venta pendiente</Text><Text style={styles.pendingCopy}>{cartCount} unidades · {money(cartSubtotal)}</Text></View></View>}
      <Button title="Cerrar sesión" variant="danger" icon="logout" onPress={() => Alert.alert("Cerrar sesión", "¿Quieres salir de la aplicación?", [{ text: "Cancelar" }, { text: "Salir", style: "destructive", onPress: () => signOut() }])} />
    </Sheet>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white }, screen: { flex: 1 },
  topbar: { height: 61, flexDirection: "row", alignItems: "center", paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: colors.line, backgroundColor: colors.white }, brandText: { flex: 1, marginLeft: 10 }, brand: { color: colors.ink, fontSize: 14, fontWeight: "900" }, status: { color: colors.success, fontSize: 9, marginTop: 2 }, avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.goldSoft, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.gold }, avatarText: { color: colors.warning, fontWeight: "900" },
  bottom: { height: 78, position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.line, flexDirection: "row", paddingTop: 8, paddingBottom: 7 }, tab: { flex: 1, alignItems: "center" }, tabIcon: { width: 42, height: 35, borderRadius: 13, alignItems: "center", justifyContent: "center" }, tabIconActive: { backgroundColor: colors.forest }, tabLabel: { color: colors.muted, fontSize: 9, fontWeight: "700", marginTop: 3 }, tabLabelActive: { color: colors.forest, fontWeight: "900" }, badge: { position: "absolute", right: -2, top: -4, minWidth: 17, height: 17, borderRadius: 9, backgroundColor: colors.gold, alignItems: "center", justifyContent: "center", paddingHorizontal: 3 }, badgeText: { color: colors.white, fontSize: 8, fontWeight: "900" },
  profile: { alignItems: "center", marginBottom: 22 }, profileAvatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.forest, alignItems: "center", justifyContent: "center" }, profileInitial: { color: colors.white, fontSize: 28, fontWeight: "900" }, profileName: { color: colors.ink, fontSize: 20, fontWeight: "900", marginTop: 12 }, profileEmail: { color: colors.muted, fontSize: 12, marginTop: 3 }, role: { backgroundColor: colors.goldSoft, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginTop: 10 }, roleText: { color: colors.warning, fontSize: 11, fontWeight: "800" },
  pending: { flexDirection: "row", gap: 10, alignItems: "center", backgroundColor: colors.goldSoft, borderRadius: 15, padding: 13, marginBottom: 14 }, pendingTitle: { color: colors.warning, fontWeight: "800", fontSize: 12 }, pendingCopy: { color: colors.muted, fontSize: 10, marginTop: 2 },
});
