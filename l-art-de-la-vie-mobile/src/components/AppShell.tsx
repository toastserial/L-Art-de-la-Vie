import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { useStore } from "../context/StoreContext";
import { CashScreen } from "../screens/CashScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { InventoryScreen } from "../screens/InventoryScreen";
import { POSScreen } from "../screens/POSScreen";
import { colors, money, shadow } from "../theme";
import { BrandLogo } from "./BrandLogo";
import { Button, Sheet } from "./ui";

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
  const { bottom } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [tab, setTab] = useState<Tab>("home");
  const [accountOpen, setAccountOpen] = useState(false);
  const Screen = tab === "home" ? DashboardScreen : tab === "pos" ? POSScreen : tab === "inventory" ? InventoryScreen : CashScreen;
  const role = user?.role === "owner" ? "Propietario" : user?.role === "admin" ? "Administrador" : "Cajero";
  const compact = width < 350;

  return <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
    <View style={styles.topbar}>
      <View style={styles.logoWrap}><BrandLogo size={36} animated={false} /></View>
      <View style={styles.brandText}>
        <Text style={styles.brand} numberOfLines={1}>L'Art de la Vie</Text>
        {!compact && <View style={styles.connection}><View style={styles.statusDot} /><Text style={styles.status}>Sistema conectado</Text></View>}
      </View>
      {!compact && <View style={styles.roleCompact}><Text style={styles.roleCompactText}>{role}</Text></View>}
      <Pressable onPress={() => setAccountOpen(true)} style={({ pressed }) => [styles.avatar, pressed && styles.pressed]} hitSlop={6}>
        <Text style={styles.avatarText}>{user?.fullName?.charAt(0).toUpperCase() || "U"}</Text>
        <View style={styles.avatarOnline} />
      </Pressable>
    </View>

    <View style={styles.screen}><Screen /></View>

    <View style={[styles.bottom, { paddingBottom: Math.max(bottom, 8) }]}>
      {tabs.map(item => {
        const active = tab === item.id;
        return <Pressable key={item.id} onPress={() => setTab(item.id)} style={({ pressed }) => [styles.tab, pressed && styles.pressed]}>
          <View style={[styles.tabIcon, active && styles.tabIconActive]}>
            <MaterialCommunityIcons name={item.icon} size={21} color={active ? colors.white : colors.muted} />
            {item.id === "pos" && cartCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{cartCount > 99 ? "99+" : cartCount}</Text></View>}
          </View>
          <Text style={[styles.tabLabel, active && styles.tabLabelActive]} numberOfLines={1}>{item.label}</Text>
        </Pressable>;
      })}
    </View>

    <Sheet visible={accountOpen} onClose={() => setAccountOpen(false)} title="Mi cuenta">
      <View style={styles.profile}>
        <View style={styles.profileAvatar}><Text style={styles.profileInitial}>{user?.fullName?.charAt(0).toUpperCase()}</Text></View>
        <Text style={styles.profileName}>{user?.fullName}</Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
        <View style={styles.role}><Text style={styles.roleText}>{role}</Text></View>
      </View>
      {cartCount > 0 && <View style={styles.pending}>
        <MaterialCommunityIcons name="cart-outline" size={21} color={colors.warning} />
        <View><Text style={styles.pendingTitle}>Venta pendiente</Text><Text style={styles.pendingCopy}>{cartCount} unidades · {money(cartSubtotal)}</Text></View>
      </View>}
      <Button title="Cerrar sesión" variant="danger" icon="logout" onPress={() => Alert.alert("Cerrar sesión", "¿Quieres salir de la aplicación?", [{ text: "Cancelar" }, { text: "Salir", style: "destructive", onPress: () => signOut() }])} />
    </Sheet>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  screen: { flex: 1, backgroundColor: colors.cream },
  topbar: { minHeight: 68, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.line, backgroundColor: colors.white, zIndex: 2 },
  logoWrap: { width: 44, height: 44, borderRadius: 15, backgroundColor: colors.forestSoft, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  brandText: { flex: 1, marginLeft: 10, minWidth: 0 },
  brand: { color: colors.ink, fontSize: 15, fontWeight: "900", letterSpacing: -0.2 },
  connection: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.success },
  status: { color: colors.success, fontSize: 9, fontWeight: "700" },
  roleCompact: { backgroundColor: colors.forestSoft, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, marginRight: 9 },
  roleCompactText: { color: colors.forest, fontSize: 9, fontWeight: "800" },
  avatar: { width: 40, height: 40, borderRadius: 15, backgroundColor: colors.goldSoft, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#E4D293" },
  avatarText: { color: colors.warning, fontWeight: "900", fontSize: 15 },
  avatarOnline: { position: "absolute", width: 10, height: 10, borderRadius: 5, backgroundColor: colors.success, borderWidth: 2, borderColor: colors.white, right: -1, bottom: -1 },
  pressed: { opacity: 0.7 },
  bottom: { backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.line, flexDirection: "row", paddingTop: 8, paddingHorizontal: 6, ...shadow },
  tab: { flex: 1, minWidth: 0, alignItems: "center", justifyContent: "center", paddingHorizontal: 2 },
  tabIcon: { minWidth: 43, height: 32, borderRadius: 12, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  tabIconActive: { backgroundColor: colors.forest },
  tabLabel: { color: colors.muted, fontSize: 9, fontWeight: "700", marginTop: 3 },
  tabLabelActive: { color: colors.forest, fontWeight: "900" },
  badge: { position: "absolute", right: -5, top: -5, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.gold, alignItems: "center", justifyContent: "center", paddingHorizontal: 3, borderWidth: 2, borderColor: colors.white },
  badgeText: { color: colors.white, fontSize: 8, fontWeight: "900" },
  profile: { alignItems: "center", marginBottom: 22 },
  profileAvatar: { width: 72, height: 72, borderRadius: 24, backgroundColor: colors.forest, alignItems: "center", justifyContent: "center" },
  profileInitial: { color: colors.white, fontSize: 28, fontWeight: "900" },
  profileName: { color: colors.ink, fontSize: 20, fontWeight: "900", marginTop: 12 },
  profileEmail: { color: colors.muted, fontSize: 12, marginTop: 3 },
  role: { backgroundColor: colors.goldSoft, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginTop: 10 },
  roleText: { color: colors.warning, fontSize: 11, fontWeight: "800" },
  pending: { flexDirection: "row", gap: 10, alignItems: "center", backgroundColor: colors.goldSoft, borderRadius: 15, padding: 13, marginBottom: 14 },
  pendingTitle: { color: colors.warning, fontWeight: "800", fontSize: 12 },
  pendingCopy: { color: colors.muted, fontSize: 10, marginTop: 2 },
});
