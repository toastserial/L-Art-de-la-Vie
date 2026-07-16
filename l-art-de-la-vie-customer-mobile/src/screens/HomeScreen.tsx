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

export function HomeScreen({
  customer,
  products,
  onCatalog,
}: {
  customer: Customer;
  products: Product[];
  onCatalog: () => void;
}) {
  const featured = products.filter((product) => product.stock > 0).slice(0, 6);
  return (
    <ScrollView
      contentContainerStyle={styles.page}
      showsVerticalScrollIndicator={false}
    >
      <ImageBackground
        source={require("../../assets/hero-1.jpg")}
        style={styles.hero}
        imageStyle={styles.heroImage}
      >
        <LinearGradient
          colors={["rgba(7,59,32,0.04)", "rgba(7,59,32,0.94)"]}
          style={styles.gradient}
        >
          <View style={styles.pill}>
            <Text style={styles.pillText}>LUJO ACCESIBLE · HONDURAS</Text>
          </View>
          <View>
            <Text style={styles.title}>
              Convierte cada rincón en algo único.
            </Text>
            <Text style={styles.copy}>
              Decoración, aromas y accesorios elegidos para hacer especial lo
              cotidiano.
            </Text>
            <Pressable
              onPress={onCatalog}
              style={({ pressed }) => [
                styles.button,
                pressed && styles.pressed,
              ]}
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

      <View style={styles.welcome}>
        <View>
          <Text style={styles.eyebrow}>SELECCIONADO PARA TI</Text>
          <Text style={styles.sectionTitle}>
            Hola, {customer.fullName.split(" ")[0]}
          </Text>
        </View>
        <Pressable onPress={onCatalog}>
          <Text style={styles.seeAll}>Ver todo</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.products}
      >
        {featured.map((product) => (
          <Pressable
            key={product.id}
            onPress={onCatalog}
            style={({ pressed }) => [styles.product, pressed && styles.pressed]}
          >
            {product.image ? (
              <Image
                source={{ uri: product.image }}
                style={styles.productImage}
              />
            ) : (
              <View style={[styles.productImage, styles.fallback]}>
                <MaterialCommunityIcons
                  name="package-variant"
                  size={30}
                  color={colors.gold}
                />
              </View>
            )}
            <Text numberOfLines={1} style={styles.productName}>
              {product.name}
            </Text>
            <Text style={styles.productPrice}>{money(product.price)}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.benefits}>
        <View style={styles.benefitIcon}>
          <MaterialCommunityIcons
            name="truck-fast-outline"
            size={25}
            color={colors.gold}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.benefitTitle}>Envíos a toda Honduras</Text>
          <Text style={styles.benefitCopy}>
            Coordinamos disponibilidad, ciudad y costo directamente contigo.
          </Text>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={22}
          color="#A8B7AD"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, paddingBottom: 36, gap: 22 },
  hero: {
    height: 430,
    overflow: "hidden",
    borderRadius: 28,
    backgroundColor: colors.forest,
  },
  heroImage: { borderRadius: 28 },
  gradient: { flex: 1, justifyContent: "space-between", padding: 22 },
  pill: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,.45)",
    backgroundColor: "rgba(7,59,32,.34)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  pillText: {
    color: "white",
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.6,
  },
  title: {
    color: "white",
    fontSize: 35,
    lineHeight: 39,
    fontWeight: "900",
    maxWidth: 320,
  },
  copy: {
    color: "rgba(255,255,255,.82)",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    maxWidth: 310,
  },
  button: {
    marginTop: 18,
    alignSelf: "flex-start",
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.gold,
    borderRadius: 24,
    paddingHorizontal: 18,
  },
  buttonText: { color: colors.forest, fontWeight: "900" },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  welcome: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  eyebrow: {
    color: colors.forest2,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.8,
    marginBottom: 5,
  },
  sectionTitle: { color: colors.ink, fontSize: 24, fontWeight: "900" },
  seeAll: { color: colors.forest, fontWeight: "800", fontSize: 13 },
  products: { gap: 12, paddingRight: 4 },
  product: {
    width: 158,
    backgroundColor: colors.paper,
    borderRadius: 20,
    padding: 9,
  },
  productImage: {
    width: "100%",
    height: 178,
    borderRadius: 15,
    backgroundColor: "#EDF0ED",
  },
  fallback: { alignItems: "center", justifyContent: "center" },
  productName: {
    color: colors.ink,
    fontWeight: "800",
    marginTop: 10,
    fontSize: 13,
  },
  productPrice: { color: colors.forest, fontWeight: "900", marginTop: 5 },
  benefits: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    backgroundColor: colors.forest,
    borderRadius: 22,
    padding: 18,
  },
  benefitIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,.1)",
  },
  benefitTitle: { color: colors.cream, fontWeight: "900", fontSize: 15 },
  benefitCopy: { color: "#CAD6CE", fontSize: 11, lineHeight: 16, marginTop: 3 },
});
