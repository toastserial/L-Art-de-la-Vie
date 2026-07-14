import type { PropsWithChildren, ReactNode } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

export function Page({ title, subtitle, action, children, refreshing, onRefresh }: PropsWithChildren<{
  title: string; subtitle?: string; action?: ReactNode; refreshing?: boolean; onRefresh?: () => void;
}>) {
  return <ScrollView
    style={styles.scroll}
    contentContainerStyle={styles.content}
    showsVerticalScrollIndicator={false}
    refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.forest} /> : undefined}
    keyboardShouldPersistTaps="handled"
  >
    <View style={styles.header}>
      <View style={styles.headerText}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {action}
    </View>
    {children}
  </ScrollView>;
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.cream },
  content: { padding: 18, paddingBottom: 115 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  headerText: { flex: 1, paddingRight: 12 },
  title: { color: colors.ink, fontSize: 28, fontWeight: "900", letterSpacing: -0.6 },
  subtitle: { color: colors.muted, fontSize: 13, marginTop: 4 },
});
