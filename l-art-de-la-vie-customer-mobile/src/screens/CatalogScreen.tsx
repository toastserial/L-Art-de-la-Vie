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
}: {
  products: Product[];
  onAdd: (product: Product) => void;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const categories = useMemo(
    () => [
      "Todos",
      ...Array.from(new Set(products.map((product) => product.category))),
    ],
    [products],
  );
  const filtered = products.filter(
    (product) =>
      `${product.name} ${product.category}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (category === "Todos" || product.category === category),
  );
  return (
    <View style={styles.page}>
      <Text style={styles.eyebrow}>EXISTENCIAS REALES</Text>
      <Text style={styles.title}>La colección</Text>
      <View style={styles.search}>
        <MaterialCommunityIcons name="magnify" size={21} color={colors.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar productos"
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
        />
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
            <Text
              style={[
                styles.filterText,
                category === item && styles.filterTextActive,
              ]}
            >
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
          <ProductCard product={item} onAdd={() => onAdd(item)} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons
              name="shopping-search"
              size={40}
              color={colors.gold}
            />
            <Text style={styles.emptyText}>No encontramos productos.</Text>
          </View>
        }
      />
    </View>
  );
}

function ProductCard({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: () => void;
}) {
  return (
    <View style={styles.card}>
      {product.image ? (
        <Image source={{ uri: product.image }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.fallback]}>
          <MaterialCommunityIcons
            name="package-variant"
            size={31}
            color={colors.gold}
          />
        </View>
      )}
      <Text style={styles.category}>{product.category.toUpperCase()}</Text>
      <Text numberOfLines={2} style={styles.name}>
        {product.name}
      </Text>
      <View style={styles.cardFooter}>
        <Text style={styles.price}>{money(product.price)}</Text>
        <Pressable
          onPress={onAdd}
          disabled={!product.stock}
          style={({ pressed }) => [
            styles.add,
            pressed && { opacity: 0.7 },
            !product.stock && { opacity: 0.3 },
          ]}
        >
          <MaterialCommunityIcons name="plus" size={20} color="white" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, paddingHorizontal: 16, paddingTop: 18 },
  eyebrow: {
    color: colors.forest2,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.8,
  },
  title: {
    color: colors.ink,
    fontSize: 31,
    fontWeight: "900",
    marginTop: 4,
    marginBottom: 14,
  },
  search: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
    borderRadius: 18,
    paddingHorizontal: 15,
  },
  searchInput: { flex: 1, color: colors.ink },
  filters: { gap: 8, paddingVertical: 13 },
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
  list: { paddingBottom: 28 },
  card: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.paper,
    borderRadius: 20,
    padding: 9,
    marginBottom: 11,
  },
  image: {
    width: "100%",
    aspectRatio: 0.82,
    borderRadius: 15,
    backgroundColor: "#EDF0ED",
  },
  fallback: { alignItems: "center", justifyContent: "center" },
  category: {
    color: colors.gold,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 1,
    marginTop: 9,
  },
  name: {
    color: colors.ink,
    fontSize: 13,
    lineHeight: 17,
    minHeight: 34,
    fontWeight: "800",
    marginTop: 3,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  price: { color: colors.forest, fontSize: 13, fontWeight: "900" },
  add: {
    width: 35,
    height: 35,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.forest,
  },
  empty: { alignItems: "center", paddingTop: 60, gap: 12 },
  emptyText: { color: colors.muted },
});
