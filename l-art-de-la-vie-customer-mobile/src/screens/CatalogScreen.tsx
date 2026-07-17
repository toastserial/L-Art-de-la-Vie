import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors, money } from "../theme";
import type { Product } from "../types";

export function CatalogScreen({
  products,
  onAdd,
  onProduct,
  initialCategory,
}: {
  products: Product[];
  onAdd: (product: Product) => void;
  onProduct: (product: Product) => void;
  initialCategory?: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory || "Todos");
  const categories = useMemo(
    () => ["Todos", ...Array.from(new Set(products.map((product) => product.category)))],
    [products],
  );
  const filtered = products.filter(
    (product) =>
      `${product.name} ${product.category}`.toLowerCase().includes(query.toLowerCase()) &&
      (category === "Todos" || product.category === category),
  );

  return (
    <View style={styles.page}>
      <Text style={styles.eyebrow}>COLECCIÓN</Text>
      <Text style={styles.title}>Piezas curadas para ti</Text>
      <View style={styles.search}>
        <MaterialCommunityIcons name="magnify" size={20} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar por nombre o categoría"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
        />
        {query ? (
          <Pressable onPress={() => setQuery("")} hitSlop={10}>
            <MaterialCommunityIcons name="close" size={18} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {categories.map((item) => (
          <Pressable
            key={item}
            onPress={() => setCategory(item)}
            style={[styles.filter, category === item && styles.filterActive]}
          >
            <Text style={[styles.filterText, category === item && styles.filterTextActive]}>
              {item}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <FlatList
        data={filtered}
        keyExtractor={(product) => product.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.columns}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            onPress={() => onProduct(item)}
            onAdd={() => onAdd(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons name="shopping-search" size={28} color={colors.forest} />
            </View>
            <Text style={styles.emptyTitle}>No encontramos piezas</Text>
            <Text style={styles.emptyText}>Prueba con otra palabra o categoría.</Text>
          </View>
        }
      />
    </View>
  );
}

function ProductCard({
  product,
  onAdd,
  onPress,
}: {
  product: Product;
  onAdd: () => void;
  onPress: () => void;
}) {
  return (
    <View style={styles.card}>
      <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
        {product.image ? (
          <Image source={{ uri: product.image }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.fallback]}>
            <MaterialCommunityIcons name="package-variant" size={31} color={colors.gold} />
          </View>
        )}
        <Text style={styles.category}>{product.category.toUpperCase()}</Text>
        <Text numberOfLines={2} style={styles.name}>{product.name}</Text>
      </Pressable>
      <View style={styles.cardFooter}>
        <Text style={styles.price}>{money(product.price)}</Text>
        <Pressable
          onPress={onAdd}
          disabled={!product.stock}
          style={({ pressed }) => [
            styles.add,
            pressed && styles.pressed,
            !product.stock && styles.disabled,
          ]}
        >
          <MaterialCommunityIcons name="plus" size={20} color={colors.cream} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, paddingHorizontal: 16, paddingTop: 18 },
  eyebrow: { color: colors.gold, fontSize: 9, fontWeight: "900", letterSpacing: 2 },
  title: {
    color: colors.forest,
    fontFamily: "serif",
    fontSize: 30,
    lineHeight: 35,
    fontWeight: "700",
    marginTop: 4,
    marginBottom: 15,
  },
  search: {
    height: 49,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    borderRadius: 25,
    paddingHorizontal: 16,
  },
  searchInput: { flex: 1, color: colors.ink, fontSize: 13 },
  filters: { gap: 8, paddingVertical: 14 },
  filter: {
    height: 37,
    justifyContent: "center",
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 15,
    backgroundColor: colors.paper,
  },
  filterActive: { backgroundColor: colors.forest, borderColor: colors.forest },
  filterText: { color: colors.muted, fontSize: 12, fontWeight: "700" },
  filterTextActive: { color: colors.cream },
  columns: { gap: 11 },
  list: { paddingBottom: 112 },
  card: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.paper,
    borderRadius: 20,
    padding: 9,
    marginBottom: 11,
  },
  image: { width: "100%", aspectRatio: 0.82, borderRadius: 15, backgroundColor: "#EDF0ED" },
  fallback: { alignItems: "center", justifyContent: "center" },
  category: { color: colors.gold, fontSize: 8, fontWeight: "900", letterSpacing: 1, marginTop: 9 },
  name: {
    color: colors.ink,
    fontFamily: "serif",
    fontSize: 14,
    lineHeight: 17,
    minHeight: 34,
    fontWeight: "700",
    marginTop: 3,
  },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  price: { color: colors.forest, fontSize: 13, fontWeight: "900" },
  add: { width: 35, height: 35, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: colors.forest },
  pressed: { opacity: 0.72 },
  disabled: { opacity: 0.3 },
  empty: { alignItems: "center", paddingTop: 55, gap: 8 },
  emptyIcon: { width: 58, height: 58, borderRadius: 29, alignItems: "center", justifyContent: "center", backgroundColor: "#EAF2ED" },
  emptyTitle: { color: colors.ink, fontFamily: "serif", fontSize: 19, fontWeight: "700" },
  emptyText: { color: colors.muted, fontSize: 12 },
});
