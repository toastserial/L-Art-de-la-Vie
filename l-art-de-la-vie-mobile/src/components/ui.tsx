import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps, PropsWithChildren, ReactNode } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from "react-native";
import { colors, shadow } from "../theme";

export function Card({ children, style }: PropsWithChildren<{ style?: ViewStyle | ViewStyle[] }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

interface ButtonProps {
  title: string;
  onPress(): void;
  icon?: ComponentProps<typeof MaterialCommunityIcons>["name"];
  variant?: "primary" | "secondary" | "danger" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  compact?: boolean;
  style?: ViewStyle | ViewStyle[];
}

export function Button({ title, onPress, icon, variant = "primary", disabled, loading, compact, style }: ButtonProps) {
  const palette = variant === "primary" ? [colors.forest, colors.white]
    : variant === "danger" ? [colors.dangerSoft, colors.danger]
      : variant === "secondary" ? [colors.forestSoft, colors.forest]
        : ["transparent", colors.forest];
  return (
    <Pressable onPress={onPress} disabled={disabled || loading} style={({ pressed }) => [
      styles.button, compact && styles.buttonCompact, { backgroundColor: palette[0], opacity: disabled ? 0.45 : pressed ? 0.78 : 1 }, style,
    ]}>
      {loading ? <ActivityIndicator color={palette[1]} /> : <>
        {icon && <MaterialCommunityIcons name={icon} size={compact ? 17 : 20} color={palette[1]} />}
        <Text style={[styles.buttonText, { color: palette[1] }]}>{title}</Text>
      </>}
    </Pressable>
  );
}

export function Field({ label, error, ...props }: TextInputProps & { label?: string; error?: string }) {
  return <View style={styles.fieldWrap}>
    {label && <Text style={styles.label}>{label}</Text>}
    <TextInput placeholderTextColor="#9AA19C" {...props} style={[styles.input, props.multiline && styles.textarea, props.style]} />
    {error && <Text style={styles.error}>{error}</Text>}
  </View>;
}

export function Pill({ children, tone = "neutral" }: PropsWithChildren<{ tone?: "neutral" | "success" | "danger" | "gold" }>) {
  const palette = tone === "success" ? [colors.forestSoft, colors.success]
    : tone === "danger" ? [colors.dangerSoft, colors.danger]
      : tone === "gold" ? [colors.goldSoft, colors.warning]
        : ["#F0F2F0", colors.muted];
  return <View style={[styles.pill, { backgroundColor: palette[0] }]}><Text style={[styles.pillText, { color: palette[1] }]}>{children}</Text></View>;
}

export function EmptyState({ icon, title, message }: { icon: ComponentProps<typeof MaterialCommunityIcons>["name"]; title: string; message: string }) {
  return <View style={styles.empty}>
    <View style={styles.emptyIcon}><MaterialCommunityIcons name={icon} size={30} color={colors.forest} /></View>
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptyMessage}>{message}</Text>
  </View>;
}

export function Sheet({ visible, onClose, title, children, footer, full = false }: PropsWithChildren<{
  visible: boolean; onClose(): void; title: string; footer?: ReactNode; full?: boolean;
}>) {
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={[styles.sheet, full && styles.sheetFull]}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={12}><MaterialCommunityIcons name="close" size={25} color={colors.ink} /></Pressable>
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>{children}</ScrollView>
        {footer && <View style={styles.sheetFooter}>{footer}</View>}
      </View>
    </View>
  </Modal>;
}

export function Segmented<T extends string>({ values, value, onChange }: { values: { value: T; label: string }[]; value: T; onChange(value: T): void }) {
  return <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.segmentRow}>
    {values.map(item => <Pressable key={item.value} onPress={() => onChange(item.value)} style={[styles.segment, value === item.value && styles.segmentActive]}>
      <Text style={[styles.segmentText, value === item.value && styles.segmentTextActive]}>{item.label}</Text>
    </Pressable>)}
  </ScrollView>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: 20, borderWidth: 1, borderColor: colors.line, padding: 16, ...shadow },
  button: { minHeight: 52, borderRadius: 16, paddingHorizontal: 18, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8 },
  buttonCompact: { minHeight: 38, borderRadius: 12, paddingHorizontal: 12 },
  buttonText: { fontSize: 15, fontWeight: "800" },
  fieldWrap: { gap: 7, marginBottom: 14 },
  label: { fontSize: 13, fontWeight: "700", color: colors.ink },
  input: { minHeight: 52, borderRadius: 15, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, color: colors.ink, paddingHorizontal: 15, fontSize: 16 },
  textarea: { minHeight: 90, textAlignVertical: "top", paddingTop: 14 },
  error: { color: colors.danger, fontSize: 12 },
  pill: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  pillText: { fontSize: 11, fontWeight: "800" },
  empty: { alignItems: "center", paddingVertical: 34, paddingHorizontal: 22 },
  emptyIcon: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.forestSoft, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: "800", color: colors.ink },
  emptyMessage: { marginTop: 5, color: colors.muted, textAlign: "center", lineHeight: 19 },
  overlay: { flex: 1, backgroundColor: "rgba(10,24,16,0.45)", justifyContent: "flex-end" },
  sheet: { maxHeight: "88%", minHeight: 220, backgroundColor: colors.cream, borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: "hidden" },
  sheetFull: { maxHeight: "96%", height: "96%" },
  sheetHandle: { width: 42, height: 5, borderRadius: 3, backgroundColor: "#CBD0CC", alignSelf: "center", marginTop: 10 },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.line },
  sheetTitle: { fontSize: 21, fontWeight: "900", color: colors.ink },
  sheetContent: { padding: 20, paddingBottom: 30 },
  sheetFooter: { padding: 16, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.white },
  segmentRow: { gap: 8, paddingRight: 18 },
  segment: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  segmentActive: { backgroundColor: colors.forest, borderColor: colors.forest },
  segmentText: { fontSize: 13, fontWeight: "700", color: colors.muted },
  segmentTextActive: { color: colors.white },
});
