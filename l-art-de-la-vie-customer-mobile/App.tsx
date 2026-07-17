import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { Session } from "@supabase/supabase-js";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { api } from "./src/lib/api";
import { authRedirectUrl, handleAuthDeepLink, supabase } from "./src/lib/supabase";
import { colors, money } from "./src/theme";
import type { CartItem, Customer, Product } from "./src/types";
import { HomeScreen } from "./src/screens/HomeScreen";
import { CatalogScreen } from "./src/screens/CatalogScreen";

type Tab = "home" | "catalog" | "cart" | "profile";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tab, setTab] = useState<Tab>("home");
  const [catalogCategory, setCatalogCategory] = useState<string>();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [recoveringPassword, setRecoveringPassword] = useState(false);
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let mounted = true;
    const sync = async (next: Session | null) => {
      if (!mounted) return;
      setSession(next);
      if (!next) {
        setCustomer(null);
        setLoading(false);
        return;
      }
      try {
        const [me, catalog] = await Promise.all([
          api<Customer>("/customer/me"),
          api<{ products: Product[] }>("/catalog"),
        ]);
        if (mounted) {
          setCustomer(me);
          setProducts(catalog.products);
        }
      } catch (error) {
        Alert.alert(
          "No pudimos cargar tu cuenta",
          error instanceof Error ? error.message : "Intenta nuevamente",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };
    const processAuthUrl = async (url: string | null) => {
      if (!url) return;
      try {
        const authAction = await handleAuthDeepLink(url);
        if (authAction === "recovery") setRecoveringPassword(true);
        if (authAction === "confirmation") {
          Alert.alert("Correo confirmado", "Tu cuenta ya está lista para usar.");
        }
      } catch (error) {
        Alert.alert(
          "No pudimos confirmar el correo",
          error instanceof Error ? error.message : "Solicita un enlace nuevo e intenta otra vez.",
        );
      }
    };
    Linking.getInitialURL().then(async (url) => {
      await processAuthUrl(url);
      const { data } = await supabase.auth.getSession();
      sync(data.session);
    });
    const linkSubscription = Linking.addEventListener("url", ({ url }) => {
      void processAuthUrl(url);
    });
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === "PASSWORD_RECOVERY") setRecoveringPassword(true);
      setTimeout(() => sync(next), 0);
    });
    return () => {
      mounted = false;
      data.subscription.unsubscribe();
      linkSubscription.remove();
    };
  }, []);

  const add = (product: Product) =>
    setCart((current) => {
      const found = current.find((item) => item.id === product.id);
      if (found)
        return current.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
            : item,
        );
      return [...current, { ...product, quantity: 1 }];
    });
  const setQuantity = (id: string, quantity: number) =>
    setCart((current) =>
      current
        .map((item) => (item.id === id ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0),
    );
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const changeTab = (next: Tab) => {
    if (next === tab) return;
    Animated.timing(screenOpacity, {
      toValue: 0,
      duration: 80,
      useNativeDriver: true,
    }).start(() => {
      setTab(next);
      Animated.timing(screenOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    });
  };
  const openCatalog = (category?: string) => {
    setCatalogCategory(category);
    changeTab("catalog");
  };

  if (loading)
    return (
      <SafeAreaProvider>
        <Loading />
      </SafeAreaProvider>
    );
  if (recoveringPassword && session)
    return (
      <SafeAreaProvider>
        <PasswordRecoveryScreen onDone={() => setRecoveringPassword(false)} />
      </SafeAreaProvider>
    );
  if (!session || !customer)
    return (
      <SafeAreaProvider>
        <AuthScreen />
      </SafeAreaProvider>
    );

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={colors.cream} />
      <SafeAreaView style={styles.app}>
        <Header customer={customer} onProfile={() => changeTab("profile")} />
        <Animated.View
          style={[
            styles.body,
            {
              opacity: screenOpacity,
              transform: [
                {
                  translateY: screenOpacity.interpolate({
                    inputRange: [0, 1],
                    outputRange: [5, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {tab === "home" && (
            <HomeScreen
              customer={customer}
              products={products}
              onCatalog={openCatalog}
              onProduct={setSelectedProduct}
            />
          )}
          {tab === "catalog" && (
            <CatalogScreen
              key={catalogCategory || "all"}
              products={products}
              initialCategory={catalogCategory}
              onProduct={setSelectedProduct}
              onAdd={add}
            />
          )}
          {tab === "cart" && (
            <Cart items={cart} setQuantity={setQuantity} customer={customer} />
          )}
          {tab === "profile" && (
            <Profile customer={customer} onSaved={setCustomer} />
          )}
        </Animated.View>
        <BottomNav active={tab} onChange={changeTab} count={count} />
        <ProductDetail
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAdd={(product) => {
            add(product);
            setSelectedProduct(null);
          }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function PasswordRecoveryScreen({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  const savePassword = async () => {
    if (password.length < 8) {
      return Alert.alert("Contraseña muy corta", "Usa al menos 8 caracteres.");
    }
    if (password !== confirmation) {
      return Alert.alert("Las contraseñas no coinciden", "Escribe la misma contraseña en ambos campos.");
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return Alert.alert("No pudimos cambiarla", error.message);
    Alert.alert("Contraseña actualizada", "Ya puedes continuar usando tu cuenta.", [
      { text: "Continuar", onPress: onDone },
    ]);
  };

  return (
    <KeyboardAvoidingView style={styles.auth} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar style="dark" backgroundColor={colors.cream} />
      <Image source={require("./assets/hero-boutique.jpg")} style={styles.authBackdrop} />
      <LinearGradient colors={["rgba(250,248,242,.12)", colors.cream]} style={styles.authShade} />
      <View style={styles.authCard}>
        <View style={styles.authBrand}>
          <View style={styles.confirmationIcon}>
            <MaterialCommunityIcons name="lock-reset" size={34} color={colors.forest} />
          </View>
          <Text style={styles.authEyebrow}>SEGURIDAD</Text>
          <Text style={styles.cardTitle}>Crea una nueva contraseña</Text>
          <Text style={styles.authCopy}>Debe contener al menos 8 caracteres y ser difícil de adivinar.</Text>
        </View>
        <Input
          label="Nueva contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          trailing={
            <Pressable onPress={() => setShowPassword((value) => !value)} hitSlop={10}>
              <MaterialCommunityIcons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.muted} />
            </Pressable>
          }
        />
        <Input
          label="Confirmar contraseña"
          value={confirmation}
          onChangeText={setConfirmation}
          secureTextEntry={!showPassword}
        />
        <PrimaryButton title={busy ? "Guardando…" : "Guardar nueva contraseña"} onPress={savePassword} disabled={busy} />
      </View>
    </KeyboardAvoidingView>
  );
}

function AuthScreen() {
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [resending, setResending] = useState(false);
  const submit = async () => {
    if (!email.trim() || password.length < 6 || (register && !fullName.trim()))
      return Alert.alert(
        "Revisa tus datos",
        "Completa los campos y usa una contraseña de al menos 6 caracteres.",
      );
    setBusy(true);
    try {
      if (register) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: authRedirectUrl,
            data: { full_name: fullName.trim() },
          },
        });
        if (error) throw error;
        if (data.session)
          await api("/customer/me", {
            method: "PUT",
            body: JSON.stringify({ fullName: fullName.trim(), phone: "" }),
          });
        else
          setConfirmationEmail(email.trim());
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }
    } catch {
      Alert.alert(
        "No fue posible continuar",
        register
          ? "Revisa el correo o intenta nuevamente."
          : "Correo o contraseña incorrectos.",
      );
    } finally {
      setBusy(false);
    }
  };
  const resetPassword = async () => {
    if (!email.trim()) return Alert.alert("Escribe tu correo", "Así podremos enviarte las instrucciones.");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: authRedirectUrl,
    });
    if (error) return Alert.alert("No fue posible enviar el correo", error.message);
    Alert.alert("Revisa tu correo", "Te enviamos las instrucciones para recuperar tu acceso.");
  };
  const resendConfirmation = async () => {
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: confirmationEmail,
      options: { emailRedirectTo: authRedirectUrl },
    });
    setResending(false);
    if (error) return Alert.alert("No pudimos reenviarlo", "Espera un momento e intenta nuevamente.");
    Alert.alert("Correo reenviado", "Revisa también Spam o Correo no deseado.");
  };
  return (
    <KeyboardAvoidingView
      style={styles.auth}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="dark" backgroundColor={colors.cream} />
      <Image
        source={require("./assets/hero-boutique.jpg")}
        style={styles.authBackdrop}
      />
      <LinearGradient
        colors={["rgba(250,248,242,.12)", colors.cream]}
        style={styles.authShade}
      />
      <View style={styles.authCard}>
        {confirmationEmail ? (
          <View style={styles.confirmation}>
            <View style={styles.confirmationIcon}>
              <MaterialCommunityIcons name="email-check-outline" size={34} color={colors.forest} />
            </View>
            <Text style={styles.cardTitle}>Confirma tu correo</Text>
            <Text style={styles.confirmationCopy}>
              Enviamos un enlace a {confirmationEmail}. Ábrelo desde este teléfono;
              la aplicación regresará automáticamente con tu cuenta confirmada.
            </Text>
            <Text style={styles.confirmationHint}>
              Si no aparece, revisa Spam o Correo no deseado.
            </Text>
            <PrimaryButton
              title="Ya revisé mi correo"
              onPress={() => {
                setConfirmationEmail("");
                setRegister(false);
              }}
            />
            <Pressable disabled={resending} onPress={resendConfirmation}>
              <Text style={styles.resetLink}>
                {resending ? "Reenviando…" : "¿No llegó? Reenviar correo"}
              </Text>
            </Pressable>
          </View>
        ) : (
          <>
        <View style={styles.authBrand}>
          <Image source={require("./assets/logo.png")} style={styles.authLogo} />
          <Text style={styles.authEyebrow}>BOUTIQUE</Text>
          <Text style={styles.cardTitle}>{register ? "Crea tu cuenta" : "Bienvenido de vuelta"}</Text>
          <Text style={styles.authCopy}>
            {register
              ? "Descubre piezas curadas para transformar tus rincones."
              : "Ingresa para continuar tu experiencia."}
          </Text>
        </View>
        {register && (
          <Input
            label="Nombre completo"
            value={fullName}
            onChangeText={setFullName}
          />
        )}
        <Input
          label="Correo"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          trailing={
            <Pressable onPress={() => setShowPassword((value) => !value)} hitSlop={10}>
              <MaterialCommunityIcons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={colors.muted}
              />
            </Pressable>
          }
        />
        <PrimaryButton
          title={
            busy ? "Procesando…" : register ? "Registrarme" : "Iniciar sesión"
          }
          onPress={submit}
          disabled={busy}
        />
        {!register ? (
          <Pressable onPress={resetPassword}>
            <Text style={styles.resetLink}>¿Olvidaste tu contraseña?</Text>
          </Pressable>
        ) : null}
        <Pressable onPress={() => setRegister(!register)}>
          <Text style={styles.link}>
            {register ? "Volver a iniciar sesión" : "¿Nuevo por aquí? Crear cuenta"}
          </Text>
        </Pressable>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function Header({ customer, onProfile }: { customer: Customer; onProfile: () => void }) {
  return (
    <View style={styles.header}>
      <Image source={require("./assets/logo.png")} style={styles.logo} />
      <View style={{ flex: 1 }}>
        <Text style={styles.brandEyebrow}>BOUTIQUE</Text>
        <Text style={styles.brand}>L'Art de la Vie</Text>
      </View>
      <Pressable onPress={onProfile} style={styles.avatar}>
        <Text style={styles.avatarText}>
          {customer.fullName.charAt(0).toUpperCase()}
        </Text>
      </Pressable>
    </View>
  );
}

function Cart({
  items,
  setQuantity,
  customer,
}: {
  items: CartItem[];
  setQuantity: (id: string, q: number) => void;
  customer: Customer;
}) {
  const total = useMemo(
    () => items.reduce((s, i) => s + i.price * i.quantity, 0),
    [items],
  );
  const checkout = () => {
    if (!items.length) return;
    const number = (process.env.EXPO_PUBLIC_WHATSAPP_NUMBER || "").replace(
      /\D/g,
      "",
    );
    if (!number) return Alert.alert("WhatsApp no configurado");
    const lines = items.map(
      (i) => `• ${i.quantity} x ${i.name} — ${money(i.price * i.quantity)}`,
    );
    const message = [
      `Hola, soy ${customer.fullName}. Quiero consultar este pedido:`,
      "",
      ...lines,
      "",
      `Total estimado: ${money(total)}`,
    ].join("\n");
    Linking.openURL(
      `https://wa.me/${number}?text=${encodeURIComponent(message)}`,
    );
  };
  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageEyebrow}>TU SELECCIÓN</Text>
      <Text style={styles.pageTitle}>Mi bolsa</Text>
      {!items.length ? (
        <Empty
          icon="shopping-outline"
          text="Todavía no has agregado productos."
        />
      ) : (
        items.map((item) => (
          <View key={item.id} style={styles.cartRow}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.cartImage} />
            ) : (
              <View style={[styles.cartImage, styles.imageFallback]}>
                <MaterialCommunityIcons
                  name="package-variant"
                  size={22}
                  color={colors.gold}
                />
              </View>
            )}
            <View style={styles.cartInfo}>
              <Text style={styles.productName}>{item.name}</Text>
              <Text style={styles.muted}>{money(item.price)}</Text>
              <View style={styles.quantityRow}>
                <Pressable
                  style={styles.qty}
                  onPress={() => setQuantity(item.id, item.quantity - 1)}
                >
                  <MaterialCommunityIcons name="minus" size={15} color={colors.ink} />
                </Pressable>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <Pressable
                  style={styles.qty}
                  disabled={item.quantity >= item.stock}
                  onPress={() => setQuantity(item.id, item.quantity + 1)}
                >
                  <MaterialCommunityIcons name="plus" size={15} color={colors.ink} />
                </Pressable>
              </View>
            </View>
            <Pressable
              style={styles.remove}
              onPress={() => setQuantity(item.id, 0)}
            >
              <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.muted} />
            </Pressable>
          </View>
        ))
      )}
      {items.length > 0 && (
        <>
          <View style={styles.deliveryNote}>
            <MaterialCommunityIcons name="truck-fast-outline" size={19} color={colors.forest} />
            <Text style={styles.deliveryText}>
              El costo de envío se confirma según tu ciudad y dirección.
            </Text>
          </View>
          <View style={styles.orderSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryCopy}>Subtotal ({items.length} piezas)</Text>
              <Text style={styles.summaryValue}>{money(total)}</Text>
            </View>
            <View style={styles.total}>
              <Text style={styles.sectionTitle}>Total estimado</Text>
              <Text style={styles.totalMoney}>{money(total)}</Text>
            </View>
            <Text style={styles.summaryCopy}>
              *Sin incluir envío. Confirmaremos existencias y pago por WhatsApp.
            </Text>
          </View>
          <PrimaryButton title="Continuar pedido por WhatsApp" onPress={checkout} />
        </>
      )}
    </ScrollView>
  );
}

function Profile({
  customer,
  onSaved,
}: {
  customer: Customer;
  onSaved: (c: Customer) => void;
}) {
  const [name, setName] = useState(customer.fullName);
  const [phone, setPhone] = useState(customer.phone);
  const save = async () => {
    try {
      const next = await api<Customer>("/customer/me", {
        method: "PUT",
        body: JSON.stringify({ fullName: name, phone }),
      });
      onSaved({ ...customer, ...next });
      Alert.alert("Perfil actualizado");
    } catch (e) {
      Alert.alert(
        "No se pudo guardar",
        e instanceof Error ? e.message : "Intenta nuevamente",
      );
    }
  };
  return (
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageEyebrow}>MI ESPACIO</Text>
      <Text style={styles.pageTitle}>Mi cuenta</Text>
      <View style={styles.profileHero}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileInitial}>
            {customer.fullName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>{customer.fullName}</Text>
          <Text style={styles.profileEmail}>{customer.email}</Text>
        </View>
        <MaterialCommunityIcons
          name="shield-check-outline"
          size={24}
          color={colors.gold}
        />
      </View>
      <Text style={styles.sectionTitle}>Información personal</Text>
      <Input label="Nombre" value={name} onChangeText={setName} />
      <Input
        label="Teléfono"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <View style={styles.emailBox}>
        <Text style={styles.label}>CORREO</Text>
        <Text style={styles.productName}>{customer.email}</Text>
      </View>
      <PrimaryButton title="Guardar cambios" onPress={save} />
      <View style={styles.supportCard}>
        <MaterialCommunityIcons name="message-text-outline" size={22} color={colors.forest} />
        <View style={{ flex: 1 }}>
          <Text style={styles.supportTitle}>¿Necesitas ayuda?</Text>
          <Text style={styles.supportCopy}>Nuestro equipo puede atenderte por WhatsApp.</Text>
        </View>
      </View>
      <Pressable
        style={styles.logout}
        onPress={() => supabase.auth.signOut({ scope: "local" })}
      >
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </Pressable>
    </ScrollView>
  );
}

function BottomNav({
  active,
  onChange,
  count,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
  count: number;
}) {
  const tabs: {
    id: Tab;
    label: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
  }[] = [
    { id: "home", label: "Inicio", icon: "home-outline" },
    { id: "catalog", label: "Colección", icon: "shopping-search" },
    { id: "cart", label: "Bolsa", icon: "shopping-outline" },
    { id: "profile", label: "Cuenta", icon: "account-outline" },
  ];
  return (
    <View style={styles.nav}>
      {tabs.map((t) => (
        <Pressable
          key={t.id}
          style={[styles.navItem, active === t.id && styles.navItemActive]}
          onPress={() => onChange(t.id)}
        >
          <View>
            <MaterialCommunityIcons
              name={t.icon}
              size={23}
              color={active === t.id ? colors.forest : colors.muted}
            />
            {t.id === "cart" && count > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{count}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.navText, active === t.id && styles.navActive]}>
            {t.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function ProductDetail({
  product,
  onClose,
  onAdd,
}: {
  product: Product | null;
  onClose: () => void;
  onAdd: (product: Product) => void;
}) {
  return (
    <Modal
      visible={Boolean(product)}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      {product ? (
        <SafeAreaView style={styles.detailPage}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.detailImageWrap}>
              {product.image ? (
                <Image source={{ uri: product.image }} style={styles.detailImage} />
              ) : (
                <View style={[styles.detailImage, styles.imageFallback]}>
                  <MaterialCommunityIcons name="package-variant" size={52} color={colors.gold} />
                </View>
              )}
              <Pressable onPress={onClose} style={styles.detailClose}>
                <MaterialCommunityIcons name="arrow-left" size={22} color={colors.ink} />
              </Pressable>
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailCategory}>{product.category.toUpperCase()}</Text>
              <Text style={styles.detailName}>{product.name}</Text>
              <Text style={styles.detailPrice}>{money(product.price)}</Text>
              <View style={styles.stockLine}>
                <View style={[styles.stockDot, !product.stock && styles.stockDotEmpty]} />
                <Text style={styles.stockText}>
                  {product.stock ? `${product.stock} disponibles` : "Agotado por el momento"}
                </Text>
              </View>
              <Text style={styles.detailCopy}>
                Una pieza seleccionada por L'Art de la Vie. Confirma los detalles,
                disponibilidad y envío con nuestro equipo al preparar tu pedido.
              </Text>
              <View style={styles.detailBenefit}>
                <MaterialCommunityIcons name="truck-fast-outline" size={22} color={colors.forest} />
                <Text style={styles.detailBenefitText}>Envíos coordinados a toda Honduras</Text>
              </View>
            </View>
          </ScrollView>
          <View style={styles.detailFooter}>
            <Pressable
              disabled={!product.stock}
              onPress={() => onAdd(product)}
              style={[styles.detailButton, !product.stock && styles.detailButtonDisabled]}
            >
              <MaterialCommunityIcons name="shopping-outline" size={20} color={colors.cream} />
              <Text style={styles.detailButtonText}>
                {product.stock ? "Agregar a mi bolsa" : "Producto agotado"}
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
      ) : null}
    </Modal>
  );
}

function Input(
  props: React.ComponentProps<typeof TextInput> & { label: string; trailing?: React.ReactNode },
) {
  const { label, trailing, ...input } = props;
  return (
    <View style={{ gap: 7 }}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <View style={styles.inputWrap}>
        <TextInput
          {...input}
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        {trailing}
      </View>
    </View>
  );
}
function PrimaryButton({
  title,
  onPress,
  disabled,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[styles.primary, disabled && { opacity: 0.6 }]}
    >
      <Text style={styles.primaryText}>{title}</Text>
      <MaterialCommunityIcons
        name="arrow-right"
        size={18}
        color={colors.cream}
      />
    </Pressable>
  );
}
function Empty({
  icon,
  text,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  text: string;
}) {
  return (
    <View style={styles.empty}>
      <MaterialCommunityIcons name={icon} size={42} color={colors.gold} />
      <Text style={styles.muted}>{text}</Text>
    </View>
  );
}
function Loading() {
  return (
    <View style={styles.loading}>
      <Image source={require("./assets/logo.png")} style={styles.loadingLogo} />
      <ActivityIndicator color={colors.gold} />
      <Text style={styles.muted}>Preparando tu experiencia…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: colors.cream },
  body: { flex: 1 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 18, backgroundColor: colors.forest },
  loadingLogo: { width: 120, height: 120, borderRadius: 60 },
  auth: { flex: 1, backgroundColor: colors.cream, justifyContent: "center", padding: 16 },
  authBackdrop: { position: "absolute", left: 0, right: 0, top: 0, width: "115%", height: 300, opacity: 0.76 },
  authShade: { position: "absolute", left: 0, right: 0, top: 0, height: 310 },
  authBrand: { alignItems: "center" },
  authLogo: { width: 68, height: 68, borderRadius: 34, marginBottom: 5 },
  authEyebrow: { color: colors.gold, fontSize: 9, fontWeight: "900", letterSpacing: 2.8 },
  authCopy: { color: colors.muted, textAlign: "center", lineHeight: 19, marginTop: 5, maxWidth: 310, fontSize: 13 },
  authCard: { marginTop: 92, backgroundColor: colors.paper, borderRadius: 28, padding: 22, gap: 14, borderWidth: 1, borderColor: colors.line, elevation: 8, shadowColor: colors.forest, shadowOpacity: 0.13, shadowRadius: 24, shadowOffset: { width: 0, height: 12 } },
  confirmation: { alignItems: "center", gap: 13, paddingVertical: 8 },
  confirmationIcon: { width: 68, height: 68, borderRadius: 34, alignItems: "center", justifyContent: "center", backgroundColor: "#EAF2ED" },
  confirmationCopy: { color: colors.muted, textAlign: "center", fontSize: 13, lineHeight: 20 },
  confirmationHint: { color: colors.forest, textAlign: "center", fontSize: 11, fontWeight: "700", marginBottom: 3 },
  cardTitle: { fontFamily: "serif", fontSize: 27, fontWeight: "700", color: colors.forest, marginTop: 3 },
  label: { fontSize: 10, fontWeight: "800", letterSpacing: 1.2, color: colors.muted },
  inputWrap: { minHeight: 49, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: colors.line, borderRadius: 17, paddingHorizontal: 14, backgroundColor: colors.cream },
  input: { flex: 1, color: colors.ink, paddingVertical: 12, paddingRight: 8 },
  primary: { minHeight: 50, borderRadius: 25, backgroundColor: colors.forest, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 20 },
  primaryText: { color: colors.cream, fontWeight: "800" },
  resetLink: { textAlign: "center", color: colors.forest, textDecorationLine: "underline", fontSize: 12, paddingTop: 2 },
  link: { textAlign: "center", color: colors.forest, fontWeight: "700", fontSize: 13, padding: 5 },
  header: { height: 69, flexDirection: "row", alignItems: "center", paddingHorizontal: 18, gap: 10, backgroundColor: colors.cream },
  logo: { width: 38, height: 38, borderRadius: 19 },
  brandEyebrow: { fontSize: 8, letterSpacing: 1.8, color: colors.muted, fontWeight: "800" },
  brand: { fontFamily: "serif", fontWeight: "700", color: colors.forest, fontSize: 17, lineHeight: 19 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.forest, alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.cream, fontFamily: "serif", fontWeight: "700", fontSize: 17 },
  page: { padding: 18, paddingBottom: 112, gap: 15 },
  pageEyebrow: { color: colors.gold, fontSize: 9, fontWeight: "900", letterSpacing: 2 },
  pageTitle: { fontFamily: "serif", fontSize: 30, lineHeight: 34, fontWeight: "700", color: colors.forest, marginTop: -8, marginBottom: 5 },
  sectionTitle: { fontFamily: "serif", fontSize: 20, fontWeight: "700", color: colors.ink },
  imageFallback: { alignItems: "center", justifyContent: "center", backgroundColor: "#EDF0ED" },
  productName: { fontFamily: "serif", fontSize: 15, lineHeight: 18, fontWeight: "700", color: colors.ink },
  muted: { color: colors.muted, fontSize: 12, marginTop: 3 },
  cartRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.paper, padding: 12, borderRadius: 18, borderWidth: 1, borderColor: colors.line },
  cartImage: { width: 78, height: 88, borderRadius: 14, backgroundColor: "#EDF0ED" },
  cartInfo: { flex: 1, alignSelf: "stretch", justifyContent: "space-between", paddingVertical: 2 },
  quantityRow: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", borderWidth: 1, borderColor: colors.line, borderRadius: 18 },
  qty: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  qtyText: { minWidth: 22, textAlign: "center", fontWeight: "800", color: colors.ink },
  remove: { alignSelf: "flex-end", width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  deliveryNote: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 15, borderRadius: 18, backgroundColor: "#F2EFE6" },
  deliveryText: { flex: 1, color: colors.muted, fontSize: 12, lineHeight: 17 },
  orderSummary: { backgroundColor: colors.paper, borderRadius: 22, padding: 18, gap: 9, borderWidth: 1, borderColor: colors.line },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  summaryCopy: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  summaryValue: { color: colors.ink, fontWeight: "700", fontSize: 13 },
  total: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 5 },
  totalMoney: { fontFamily: "serif", fontSize: 23, fontWeight: "700", color: colors.forest },
  emailBox: { backgroundColor: colors.paper, borderRadius: 17, padding: 15, gap: 6, borderWidth: 1, borderColor: colors.line },
  profileHero: { flexDirection: "row", alignItems: "center", gap: 13, backgroundColor: colors.forest, borderRadius: 24, padding: 18 },
  profileAvatar: { width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center", backgroundColor: colors.gold },
  profileInitial: { color: colors.forest, fontFamily: "serif", fontSize: 23, fontWeight: "700" },
  profileName: { color: colors.cream, fontFamily: "serif", fontSize: 18, fontWeight: "700" },
  profileEmail: { color: "#C9D6CD", fontSize: 11, marginTop: 3 },
  supportCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, backgroundColor: "#F2EFE6", borderRadius: 18 },
  supportTitle: { color: colors.ink, fontWeight: "800", fontSize: 13 },
  supportCopy: { color: colors.muted, fontSize: 11, marginTop: 2 },
  logout: { padding: 15, alignItems: "center" },
  logoutText: { color: colors.danger, fontWeight: "800" },
  empty: { minHeight: 260, alignItems: "center", justifyContent: "center", gap: 14, backgroundColor: colors.paper, borderRadius: 22, borderWidth: 1, borderColor: colors.line },
  nav: { position: "absolute", left: 12, right: 12, bottom: 10, height: 74, flexDirection: "row", backgroundColor: "rgba(255,255,255,.98)", borderWidth: 1, borderColor: colors.line, borderRadius: 37, paddingHorizontal: 7, paddingVertical: 6, elevation: 12, shadowColor: colors.forest, shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 0, height: 7 } },
  navItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 2, borderRadius: 27 },
  navItemActive: { backgroundColor: "#EAF2ED" },
  navText: { fontSize: 9, color: colors.muted, fontWeight: "700" },
  navActive: { color: colors.forest },
  badge: { position: "absolute", right: -9, top: -6, minWidth: 17, height: 17, borderRadius: 9, backgroundColor: colors.gold, alignItems: "center", justifyContent: "center" },
  badgeText: { fontSize: 9, fontWeight: "900", color: colors.forest },
  detailPage: { flex: 1, backgroundColor: colors.cream },
  detailImageWrap: { height: 460, backgroundColor: "#EDF0ED" },
  detailImage: { width: "100%", height: "100%" },
  detailClose: { position: "absolute", top: 16, left: 16, width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(250,248,242,.94)" },
  detailContent: { padding: 22, gap: 10 },
  detailCategory: { color: colors.gold, fontSize: 10, fontWeight: "900", letterSpacing: 1.8 },
  detailName: { color: colors.forest, fontFamily: "serif", fontSize: 31, lineHeight: 35, fontWeight: "700" },
  detailPrice: { color: colors.forest, fontFamily: "serif", fontSize: 23, fontWeight: "700" },
  stockLine: { flexDirection: "row", alignItems: "center", gap: 7 },
  stockDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.forest2 },
  stockDotEmpty: { backgroundColor: colors.danger },
  stockText: { color: colors.muted, fontSize: 12 },
  detailCopy: { color: colors.muted, fontSize: 13, lineHeight: 20, marginTop: 5 },
  detailBenefit: { flexDirection: "row", alignItems: "center", gap: 11, borderRadius: 18, backgroundColor: "#F2EFE6", padding: 15, marginTop: 7 },
  detailBenefitText: { color: colors.ink, fontSize: 12, fontWeight: "700" },
  detailFooter: { padding: 16, backgroundColor: colors.paper, borderTopWidth: 1, borderColor: colors.line },
  detailButton: { minHeight: 52, borderRadius: 26, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: colors.forest },
  detailButtonDisabled: { opacity: 0.45 },
  detailButtonText: { color: colors.cream, fontWeight: "800" },
});
