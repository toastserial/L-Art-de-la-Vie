import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, money } from "../theme";
import type { Customer, Product } from "../types";

const CATEGORY_ORDER = ["Decoración", "Perfumes", "Carteras", "Varios"];

export function HomeScreen({
  customer,
  products,
  onCatalog,
  onProduct,
}: {
  customer: Customer;
  products: Product[];
  onCatalog: (category?: string) => void;
  onProduct: (product: Product) => void;
}) {
  const available = products.filter((product) => product.stock > 0);
  const featured = available.slice(0, 6);
  const categories = CATEGORY_ORDER.map((name) => ({
    name,
    sample: products.find((product) => product.category === name),
  }));

  return (
    <ScrollView
      contentContainerStyle={styles.page}
      showsVerticalScrollIndicator={false}
    >
      <ImageBackground
        source={require("../../assets/hero-boutique.jpg")}
        style={styles.hero}
        imageStyle={styles.heroImage}
      >
        <LinearGradient
          colors={["rgba(7,59,32,0.02)", "rgba(7,59,32,0.88)"]}
          locations={[0.3, 1]}
          style={styles.gradient}
        >
          <View />
          <View>
            <Text style={styles.heroEyebrow}>
              HOLA, {(customer.fullName.split(" ")[0] || "CLIENTE").toUpperCase()}
            </Text>
            <Text style={styles.title}>
              Convierte cada rincón en algo único.
            </Text>
            <Pressable
              onPress={() => onCatalog()}
              style={({ pressed }) => [styles.button, pressed && styles.pressed]}
            >
              <Text style={styles.buttonText}>Explorar colección</Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={18}
                color={colors.forest}
              />
            </Pressable>
          </View>
        </LinearGradient>
      </ImageBackground>

      <SectionHeader title="Categorías" onPress={() => onCatalog()} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categories}
      >
        {categories.map(({ name, sample }) => (
          <Pressable
            key={name}
            onPress={() => onCatalog(name)}
            style={({ pressed }) => [
              styles.categoryCard,
              pressed && styles.pressed,
            ]}
          >
            {sample?.image ? (
              <Image source={{ uri: sample.image }} style={styles.categoryImage} />
            ) : (
              <View style={[styles.categoryImage, styles.fallback]}>
                <MaterialCommunityIcons
                  name="creation"
                  size={26}
                  color={colors.gold}
                />
              </View>
            )}
            <LinearGradient
              colors={["transparent", "rgba(7,59,32,.91)"]}
              style={styles.categoryShade}
            />
            <Text style={styles.categoryName}>{name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <SectionHeader title="Selección de la casa" onPress={() => onCatalog()} />
      {featured.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.products}
        >
          {featured.map((product) => (
            <Pressable
              key={product.id}
              onPress={() => onProduct(product)}
              style={({ pressed }) => [styles.product, pressed && styles.pressed]}
            >
              {product.image ? (
                <Image source={{ uri: product.image }} style={styles.productImage} />
              ) : (
                <View style={[styles.productImage, styles.fallback]}>
                  <MaterialCommunityIcons
                    name="package-variant"
                    size={30}
                    color={colors.gold}
                  />
                </View>
              )}
              <Text style={styles.productCategory}>{product.category}</Text>
              <Text numberOfLines={2} style={styles.productName}>
                {product.name}
              </Text>
              <Text style={styles.productPrice}>{money(product.price)}</Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyCatalog}>
          <Text style={styles.emptyText}>El catálogo se está preparando.</Text>
        </View>
      )}

      <View style={styles.inspiration}>
        <View style={styles.inspirationIcon}>
          <MaterialCommunityIcons name="creation" size={22} color={colors.forest} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.inspirationEyebrow}>INSPIRACIÓN</Text>
          <Text style={styles.inspirationTitle}>
            Novedades, aromas y detalles para ti.
          </Text>
        </View>
        <MaterialCommunityIcons name="instagram" size={22} color="#B8C7BD" />
      </View>

      <View style={styles.shipping}>
        <View style={styles.shippingIcon}>
          <MaterialCommunityIcons
            name="truck-fast-outline"
            size={23}
            color={colors.forest}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.shippingTitle}>Envíos a toda Honduras</Text>
          <Text style={styles.shippingCopy}>
            Coordinamos destino, costo y disponibilidad por WhatsApp.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function SectionHeader({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable onPress={onPress} hitSlop={10} style={styles.seeAllRow}>
        <Text style={styles.seeAll}>Ver todo</Text>
        <MaterialCommunityIcons name="chevron-right" size={17} color={colors.forest} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, paddingBottom: 118, gap: 18 },
  hero: {
    height: 440,
    overflow: "hidden",
    borderRadius: 28,
    backgroundColor: colors.forest,
  },
  heroImage: { borderRadius: 28 },
  gradient: { flex: 1, justifyContent: "space-between", padding: 24 },
  heroEyebrow: {
    color: colors.gold,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2.1,
    marginBottom: 9,
  },
  title: {
    color: colors.cream,
    fontFamily: "serif",
    fontSize: 36,
    lineHeight: 39,
    fontWeight: "700",
    maxWidth: 315,
  },
  button: {
    marginTop: 20,
    alignSelf: "flex-start",
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.cream,
    borderRadius: 24,
    paddingHorizontal: 19,
  },
  buttonText: { color: colors.forest, fontWeight: "800" },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginTop: 3,
  },
  sectionTitle: {
    color: colors.ink,
    fontFamily: "serif",
    fontSize: 23,
    fontWeight: "700",
  },
  seeAllRow: { flexDirection: "row", alignItems: "center" },
  seeAll: { color: colors.forest, fontWeight: "700", fontSize: 12 },
  categories: { gap: 12, paddingHorizontal: 4 },
  categoryCard: {
    width: 132,
    height: 132,
    overflow: "hidden",
    borderRadius: 24,
    backgroundColor: colors.paper,
  },
  categoryImage: { ...StyleSheet.absoluteFillObject, width: "100%", height: "100%" },
  categoryShade: { ...StyleSheet.absoluteFillObject },
  categoryName: {
    position: "absolute",
    left: 13,
    right: 10,
    bottom: 13,
    color: colors.cream,
    fontFamily: "serif",
    fontWeight: "700",
    fontSize: 17,
  },
  products: { gap: 13, paddingHorizontal: 4 },
  product: { width: 166 },
  productImage: {
    width: "100%",
    height: 202,
    borderRadius: 18,
    backgroundColor: "#EDF0ED",
  },
  fallback: { alignItems: "center", justifyContent: "center", backgroundColor: "#EDF0ED" },
  productCategory: {
    color: colors.muted,
    fontSize: 9,
    letterSpacing: 1.1,
    textTransform: "uppercase",
    marginTop: 9,
  },
  productName: {
    color: colors.ink,
    fontFamily: "serif",
    fontWeight: "700",
    fontSize: 15,
    lineHeight: 18,
    marginTop: 2,
  },
  productPrice: { color: colors.forest, fontWeight: "800", marginTop: 4 },
  emptyCatalog: { padding: 20, borderRadius: 20, backgroundColor: colors.paper },
  emptyText: { color: colors.muted, fontSize: 13 },
  inspiration: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: colors.forest,
    borderRadius: 24,
    padding: 18,
  },
  inspirationIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gold,
  },
  inspirationEyebrow: { color: colors.gold, fontSize: 9, fontWeight: "800", letterSpacing: 1.6 },
  inspirationTitle: { color: colors.cream, fontFamily: "serif", fontSize: 16, lineHeight: 20, marginTop: 3 },
  shipping: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 24,
    padding: 18,
  },
  shippingIcon: { width: 44, height: 44, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "#F2EFE6" },
  shippingTitle: { color: colors.ink, fontFamily: "serif", fontWeight: "700", fontSize: 17 },
  shippingCopy: { color: colors.muted, fontSize: 11, lineHeight: 16, marginTop: 3 },
});
