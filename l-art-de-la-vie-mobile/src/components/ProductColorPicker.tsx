import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";
import { Field } from "./ui";

const colorOptions = [
  { name: "Blanco", hex: "#F5F5F2" },
  { name: "Negro", hex: "#1C1C1C" },
  { name: "Gris", hex: "#7C8580" },
  { name: "Plateado", hex: "#B8BDC4" },
  { name: "Beige", hex: "#D8C3A5" },
  { name: "Café", hex: "#795548" },
  { name: "Dorado", hex: "#C9A227" },
  { name: "Rojo", hex: "#D64545" },
  { name: "Rosado", hex: "#E88AAA" },
  { name: "Naranja", hex: "#F28C28" },
  { name: "Amarillo", hex: "#F2C94C" },
  { name: "Verde", hex: "#2E7D4F" },
  { name: "Azul", hex: "#2F64B5" },
  { name: "Morado", hex: "#7D4E9E" },
];

const normalized = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export const colorHexForName = (name: string) => {
  const value = normalized(name);
  return colorOptions.find(option => value.includes(normalized(option.name)))?.hex ?? "";
};

const validHex = (value: string) => /^#[0-9A-F]{6}$/i.test(value);
const readableCheck = (hex: string) => {
  if (!validHex(hex)) return colors.forest;
  const red = Number.parseInt(hex.slice(1, 3), 16);
  const green = Number.parseInt(hex.slice(3, 5), 16);
  const blue = Number.parseInt(hex.slice(5, 7), 16);
  return red * 0.299 + green * 0.587 + blue * 0.114 > 165 ? colors.forest : colors.white;
};

interface Props {
  name: string;
  hex: string;
  onChange(name: string, hex: string): void;
}

export function ProductColorPicker({ name, hex, onChange }: Props) {
  const selectedHex = validHex(hex) ? hex.toUpperCase() : colorHexForName(name);
  const previewHex = selectedHex || colors.forestSoft;
  const updateHex = (value: string) => {
    const raw = value.toUpperCase().replace(/[^0-9A-F#]/g, "").replace(/#/g, "");
    onChange(name, raw ? `#${raw.slice(0, 6)}` : "");
  };

  return <View style={styles.container}>
    <View style={styles.header}>
      <View>
        <Text style={styles.title}>Color</Text>
        <Text style={styles.help}>Elige uno o escribe un color personalizado.</Text>
      </View>
      <View style={styles.selection}>
        <View style={[styles.selectionSwatch, { backgroundColor: previewHex }]} />
        <Text numberOfLines={1} style={styles.selectionText}>{name || "Sin elegir"}</Text>
        {selectedHex && <Text style={styles.selectionHex}>{selectedHex}</Text>}
      </View>
    </View>

    <View style={styles.palette}>
      {colorOptions.map(option => {
        const selected = selectedHex.toUpperCase() === option.hex;
        return <Pressable
          key={option.hex}
          accessibilityRole="button"
          accessibilityLabel={`${option.name}, ${option.hex}`}
          onPress={() => onChange(option.name, option.hex)}
          style={[styles.bubbleOuter, selected && styles.bubbleOuterSelected]}
        >
          <View style={[styles.bubble, { backgroundColor: option.hex }, option.name === "Blanco" && styles.lightBubble]}>
            {selected && <MaterialCommunityIcons name="check" size={17} color={readableCheck(option.hex)} />}
          </View>
        </Pressable>;
      })}
    </View>

    <View style={styles.fields}>
      <View style={styles.nameField}><Field label="Nombre" value={name} onChangeText={value => onChange(value, colorHexForName(value) || hex)} placeholder="Ej. Azul marino" /></View>
      <View style={styles.hexField}><Field label="HEX" value={hex} onChangeText={updateHex} autoCapitalize="characters" autoCorrect={false} maxLength={7} placeholder="#2F64B5" error={hex && !validHex(hex) ? "Usa 6 dígitos" : undefined} /></View>
    </View>
  </View>;
}

const styles = StyleSheet.create({
  container: { marginTop: 2 },
  header: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  title: { color: colors.ink, fontSize: 13, fontWeight: "800" },
  help: { color: colors.muted, fontSize: 9, marginTop: 3 },
  selection: { maxWidth: "48%", minHeight: 32, flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.cream, paddingHorizontal: 9 },
  selectionSwatch: { width: 15, height: 15, borderRadius: 8, borderWidth: 1, borderColor: "rgba(0,0,0,0.12)" },
  selectionText: { flexShrink: 1, color: colors.ink, fontSize: 10, fontWeight: "800" },
  selectionHex: { color: colors.muted, fontSize: 9, fontWeight: "700" },
  palette: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 13, marginBottom: 14 },
  bubbleOuter: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "transparent" },
  bubbleOuterSelected: { borderColor: colors.forest },
  bubble: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  lightBubble: { borderWidth: 1, borderColor: "#D8DCD9" },
  fields: { flexDirection: "row", gap: 12 },
  nameField: { flex: 1.35 },
  hexField: { flex: 0.75 },
});
