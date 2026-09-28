import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View } from "react-native";
import type { Product } from "../types";
import { colors, money } from "../theme";
import { Button, Pill, Sheet } from "./ui";

interface ProductPreviewSheetProps {
  product: Product | null;
  onClose(): void;
  primaryLabel?: string;
  primaryIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onPrimary?: (product: Product) => void;
}

export function ProductPreviewSheet({ product, onClose, primaryLabel, primaryIcon = "pencil-outline", onPrimary }: ProductPreviewSheetProps) {
  if (!product) return null;
  const low = product.stock <= product.minStock;
  const colorHex = /^#[0-9A-F]{6}$/i.test(product.specifications?.["Color HEX"] ?? "") ? product.specifications["Color HEX"] : null;
  const visibleSpecifications = Object.entries(product.specifications ?? {}).filter(([label]) => label !== "Color HEX");

  return (
    <Sheet
      visible
      onClose={onClose}
      title="Vista del producto"
      footer={primaryLabel && onPrimary ? <Button title={primaryLabel} icon={primaryIcon} onPress={() => onPrimary(product)} disabled={product.stock <= 0 && primaryIcon === "cart-plus"} /> : undefined}
    >
      <View style={styles.hero}>
        {product.image ? <Image source={{ uri: product.image }} style={styles.image} resizeMode="cover" /> : (
          <View style={styles.placeholder}>
            <MaterialCommunityIcons name="image-outline" size={46} color={colors.forest} />
            <Text style={styles.placeholderText}>Sin fotografía</Text>
          </View>
        )}
        <View style={styles.category}><Text style={styles.categoryText}>{product.category}</Text></View>
      </View>

      <Text style={styles.code}>CÓDIGO {product.code}</Text>
      <Text style={styles.name}>{product.name}</Text>
      <View style={styles.priceRow}><Text style={styles.price}>{money(product.price)}</Text>{product.discountPercent > 0 && <View style={styles.offer}><Text style={styles.offerText}>Oferta web -{product.discountPercent}%</Text></View>}</View>
      {!!product.description && <Text style={styles.description}>{product.description}</Text>}
      {visibleSpecifications.length > 0 && <View style={styles.specifications}>
        {visibleSpecifications.map(([label, value]) => <View key={label} style={styles.specification}>
          <Text style={styles.specLabel}>{label}</Text><View style={styles.specValueRow}>{label === "Color" && colorHex && <View style={[styles.colorSwatch, { backgroundColor: colorHex }]} />}<Text style={styles.specValue}>{value}</Text>{label === "Color" && colorHex && <Text style={styles.specHex}>{colorHex}</Text>}</View>
        </View>)}
      </View>}

      <View style={[styles.stockCard, low && styles.stockCardLow]}>
        <View style={[styles.stockIcon, low && styles.stockIconLow]}>
          <MaterialCommunityIcons name={low ? "package-variant-minus" : "package-variant-closed-check"} size={25} color={low ? colors.danger : colors.forest} />
        </View>
        <View style={styles.stockCopy}>
          <Text style={styles.stockTitle}>{product.stock} unidades disponibles</Text>
          <Text style={styles.stockText}>{low ? `Requiere reposición · mínimo ${product.minStock}` : `Inventario saludable · mínimo ${product.minStock}`}</Text>
        </View>
        <Pill tone={low ? "danger" : "success"}>{low ? "Bajo" : "Disponible"}</Pill>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  hero: { height: 310, borderRadius: 24, overflow: "hidden", backgroundColor: colors.forestSoft, marginBottom: 23 },
  image: { width: "100%", height: "100%" },
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: 9 },
  placeholderText: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  category: { position: "absolute", left: 14, top: 14, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.92)", paddingHorizontal: 13, paddingVertical: 8 },
  categoryText: { color: colors.forest, fontSize: 10, fontWeight: "900", letterSpacing: 0.7 },
  code: { color: colors.gold, fontSize: 9, fontWeight: "900", letterSpacing: 1.5 },
  name: { color: colors.ink, fontFamily: "serif", fontSize: 28, lineHeight: 34, fontWeight: "700", marginTop: 6 },
  priceRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 9, marginTop: 9 },
  price: { color: colors.forest, fontSize: 24, fontWeight: "900" },
  offer: { borderRadius: 999, backgroundColor: colors.forest, paddingHorizontal: 9, paddingVertical: 5 },
  offerText: { color: colors.white, fontSize: 9, fontWeight: "900" },
  description: { color: colors.muted, fontSize: 12, lineHeight: 19, marginTop: 15 },
  specifications: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 15 },
  specification: { minWidth: "46%", flexGrow: 1, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, padding: 11 },
  specLabel: { color: colors.muted, fontSize: 9, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.7 },
  specValueRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 },
  colorSwatch: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: "rgba(0,0,0,0.12)" },
  specValue: { color: colors.ink, fontSize: 12, fontWeight: "800" },
  specHex: { color: colors.muted, fontSize: 9, fontWeight: "700" },
  stockCard: { flexDirection: "row", alignItems: "center", gap: 11, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.forestSoft, borderRadius: 18, padding: 13, marginTop: 22 },
  stockCardLow: { backgroundColor: colors.dangerSoft },
  stockIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.white },
  stockIconLow: { backgroundColor: colors.white },
  stockCopy: { flex: 1 }, stockTitle: { color: colors.ink, fontSize: 13, fontWeight: "900" }, stockText: { color: colors.muted, fontSize: 10, marginTop: 3 },
});
