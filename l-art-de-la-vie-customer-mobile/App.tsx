import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { Session } from "@supabase/supabase-js";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Linking, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { api } from "./src/lib/api";
import { supabase } from "./src/lib/supabase";
import { colors, money } from "./src/theme";
import type { CartItem, Customer, Product } from "./src/types";

type Tab = "home" | "catalog" | "cart" | "profile";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tab, setTab] = useState<Tab>("home");

  useEffect(() => {
    let mounted = true;
    const sync = async (next: Session | null) => {
      if (!mounted) return;
      setSession(next);
      if (!next) { setCustomer(null); setLoading(false); return; }
      try {
        const [me, catalog] = await Promise.all([
          api<Customer>("/customer/me"),
          api<{ products: Product[] }>("/catalog"),
        ]);
        if (mounted) { setCustomer(me); setProducts(catalog.products); }
      } catch (error) {
        Alert.alert("No pudimos cargar tu cuenta", error instanceof Error ? error.message : "Intenta nuevamente");
      } finally { if (mounted) setLoading(false); }
    };
    supabase.auth.getSession().then(({ data }) => sync(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setTimeout(() => sync(next), 0));
    return () => { mounted = false; data.subscription.unsubscribe(); };
  }, []);

  const add = (product: Product) => setCart((current) => {
    const found = current.find((item) => item.id === product.id);
    if (found) return current.map((item) => item.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) } : item);
    return [...current, { ...product, quantity: 1 }];
  });
  const setQuantity = (id: string, quantity: number) => setCart((current) => current.map((item) => item.id === id ? { ...item, quantity } : item).filter((item) => item.quantity > 0));
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) return <SafeAreaProvider><Loading /></SafeAreaProvider>;
  if (!session || !customer) return <SafeAreaProvider><AuthScreen /></SafeAreaProvider>;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor={colors.cream} />
      <SafeAreaView style={styles.app}>
        <Header customer={customer} />
        <View style={styles.body}>
          {tab === "home" && <Home customer={customer} products={products} onCatalog={() => setTab("catalog")} />}
          {tab === "catalog" && <Catalog products={products} onAdd={add} />}
          {tab === "cart" && <Cart items={cart} setQuantity={setQuantity} customer={customer} />}
          {tab === "profile" && <Profile customer={customer} onSaved={setCustomer} />}
        </View>
        <BottomNav active={tab} onChange={setTab} count={count} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function AuthScreen() {
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const submit = async () => {
    if (!email.trim() || password.length < 6 || (register && !fullName.trim())) return Alert.alert("Revisa tus datos", "Completa los campos y usa una contraseña de al menos 6 caracteres.");
    setBusy(true);
    try {
      if (register) {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: fullName.trim() } } });
        if (error) throw error;
        if (data.session) await api("/customer/me", { method: "PUT", body: JSON.stringify({ fullName: fullName.trim(), phone: "" }) });
        else Alert.alert("Revisa tu correo", "Confirma tu cuenta y luego inicia sesión.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
    } catch { Alert.alert("No fue posible continuar", register ? "Revisa el correo o intenta nuevamente." : "Correo o contraseña incorrectos."); }
    finally { setBusy(false); }
  };
  return <KeyboardAvoidingView style={styles.auth} behavior={Platform.OS === "ios" ? "padding" : undefined}>
    <StatusBar style="light" backgroundColor={colors.forest} />
    <View style={styles.authBrand}><Image source={require("./assets/logo.png")} style={styles.authLogo} /><Text style={styles.authEyebrow}>L'ART DE LA VIE</Text><Text style={styles.authTitle}>Tu boutique, más cerca de ti.</Text><Text style={styles.authCopy}>Descubre novedades, guarda tus favoritos y prepara tus pedidos desde cualquier ciudad de Honduras.</Text></View>
    <View style={styles.authCard}>
      <Text style={styles.cardTitle}>{register ? "Crear cuenta" : "Bienvenida"}</Text>
      {register && <Input label="Nombre completo" value={fullName} onChangeText={setFullName} />}
      <Input label="Correo" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Input label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
      <PrimaryButton title={busy ? "Procesando…" : register ? "Registrarme" : "Iniciar sesión"} onPress={submit} disabled={busy} />
      <Pressable onPress={() => setRegister(!register)}><Text style={styles.link}>{register ? "Ya tengo cuenta" : "Crear una cuenta nueva"}</Text></Pressable>
    </View>
  </KeyboardAvoidingView>;
}

function Header({ customer }: { customer: Customer }) { return <View style={styles.header}><Image source={require("./assets/logo.png")} style={styles.logo} /><View style={{ flex: 1 }}><Text style={styles.brand}>L'Art de la Vie</Text><Text style={styles.mini}>Hola, {customer.fullName.split(" ")[0]}</Text></View><View style={styles.avatar}><Text style={styles.avatarText}>{customer.fullName.charAt(0).toUpperCase()}</Text></View></View>; }

function Home({ customer, products, onCatalog }: { customer: Customer; products: Product[]; onCatalog: () => void }) { const featured = products.filter((p) => p.stock > 0).slice(0, 4); return <ScrollView contentContainerStyle={styles.page}><Text style={styles.eyebrow}>LUJO ACCESIBLE</Text><Text style={styles.heroTitle}>Detalles que hacen de la vida un arte.</Text><Text style={styles.heroCopy}>Bienvenida, {customer.fullName.split(" ")[0]}. Explora piezas seleccionadas y recibe tu pedido donde estés.</Text><PrimaryButton title="Ver colección" onPress={onCatalog} /><Text style={styles.sectionTitle}>Recién llegados</Text><View style={styles.featured}>{featured.map((product) => <MiniProduct key={product.id} product={product} />)}</View><View style={styles.shipping}><MaterialCommunityIcons name="truck-fast-outline" size={28} color={colors.gold} /><View style={{ flex: 1 }}><Text style={styles.shippingTitle}>Envíos en Honduras</Text><Text style={styles.shippingCopy}>Coordinamos disponibilidad, destino y costo contigo.</Text></View></View></ScrollView>; }

function Catalog({ products, onAdd }: { products: Product[]; onAdd: (p: Product) => void }) { const [query, setQuery] = useState(""); const filtered = products.filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(query.toLowerCase())); return <View style={styles.listPage}><Text style={styles.pageTitle}>Colección</Text><TextInput value={query} onChangeText={setQuery} placeholder="Buscar productos" placeholderTextColor={colors.muted} style={styles.search} /><FlatList data={filtered} keyExtractor={(p) => p.id} numColumns={2} columnWrapperStyle={styles.columns} contentContainerStyle={{ paddingBottom: 28 }} renderItem={({ item }) => <ProductCard product={item} onAdd={() => onAdd(item)} />} /></View>; }

function Cart({ items, setQuantity, customer }: { items: CartItem[]; setQuantity: (id: string, q: number) => void; customer: Customer }) { const total = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]); const checkout = () => { if (!items.length) return; const number = (process.env.EXPO_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, ""); if (!number) return Alert.alert("WhatsApp no configurado"); const lines = items.map((i) => `• ${i.quantity} x ${i.name} — ${money(i.price * i.quantity)}`); const message = [`Hola, soy ${customer.fullName}. Quiero consultar este pedido:`, "", ...lines, "", `Total estimado: ${money(total)}`].join("\n"); Linking.openURL(`https://wa.me/${number}?text=${encodeURIComponent(message)}`); }; return <ScrollView contentContainerStyle={styles.page}><Text style={styles.pageTitle}>Mi bolsa</Text>{!items.length ? <Empty icon="shopping-outline" text="Todavía no has agregado productos." /> : items.map((item) => <View key={item.id} style={styles.cartRow}><View style={{ flex: 1 }}><Text style={styles.productName}>{item.name}</Text><Text style={styles.muted}>{money(item.price)}</Text></View><Pressable style={styles.qty} onPress={() => setQuantity(item.id, item.quantity - 1)}><Text>−</Text></Pressable><Text style={styles.qtyText}>{item.quantity}</Text><Pressable style={styles.qty} onPress={() => setQuantity(item.id, item.quantity + 1)}><Text>+</Text></Pressable></View>)}{items.length > 0 && <><View style={styles.total}><Text style={styles.sectionTitle}>Total</Text><Text style={styles.totalMoney}>{money(total)}</Text></View><PrimaryButton title="Continuar por WhatsApp" onPress={checkout} /></>}</ScrollView>; }

function Profile({ customer, onSaved }: { customer: Customer; onSaved: (c: Customer) => void }) { const [name, setName] = useState(customer.fullName); const [phone, setPhone] = useState(customer.phone); const save = async () => { try { const next = await api<Customer>("/customer/me", { method: "PUT", body: JSON.stringify({ fullName: name, phone }) }); onSaved({ ...customer, ...next }); Alert.alert("Perfil actualizado"); } catch (e) { Alert.alert("No se pudo guardar", e instanceof Error ? e.message : "Intenta nuevamente"); } }; return <ScrollView contentContainerStyle={styles.page}><Text style={styles.pageTitle}>Mi cuenta</Text><Input label="Nombre" value={name} onChangeText={setName} /><Input label="Teléfono" value={phone} onChangeText={setPhone} keyboardType="phone-pad" /><View style={styles.emailBox}><Text style={styles.label}>CORREO</Text><Text style={styles.productName}>{customer.email}</Text></View><PrimaryButton title="Guardar cambios" onPress={save} /><Pressable style={styles.logout} onPress={() => supabase.auth.signOut({ scope: "local" })}><Text style={styles.logoutText}>Cerrar sesión</Text></Pressable></ScrollView>; }

function BottomNav({ active, onChange, count }: { active: Tab; onChange: (t: Tab) => void; count: number }) { const tabs: { id: Tab; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [{ id: "home", label: "Inicio", icon: "home-outline" }, { id: "catalog", label: "Colección", icon: "shopping-search" }, { id: "cart", label: "Bolsa", icon: "shopping-outline" }, { id: "profile", label: "Cuenta", icon: "account-outline" }]; return <View style={styles.nav}>{tabs.map((t) => <Pressable key={t.id} style={styles.navItem} onPress={() => onChange(t.id)}><View><MaterialCommunityIcons name={t.icon} size={23} color={active === t.id ? colors.forest : colors.muted} />{t.id === "cart" && count > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{count}</Text></View>}</View><Text style={[styles.navText, active === t.id && styles.navActive]}>{t.label}</Text></Pressable>)}</View>; }

function ProductCard({ product, onAdd }: { product: Product; onAdd: () => void }) { return <View style={styles.productCard}>{product.image ? <Image source={{ uri: product.image }} style={styles.productImage} /> : <View style={[styles.productImage, styles.imageFallback]}><MaterialCommunityIcons name="package-variant" size={32} color={colors.gold} /></View>}<Text numberOfLines={1} style={styles.productName}>{product.name}</Text><Text style={styles.muted}>{product.category}</Text><View style={styles.priceRow}><Text style={styles.price}>{money(product.price)}</Text><Pressable disabled={!product.stock} onPress={onAdd} style={[styles.add, !product.stock && { opacity: .35 }]}><MaterialCommunityIcons name="plus" size={20} color={colors.cream} /></Pressable></View></View>; }
function MiniProduct({ product }: { product: Product }) { return <View style={styles.miniProduct}>{product.image ? <Image source={{ uri: product.image }} style={styles.miniImage} /> : <View style={[styles.miniImage, styles.imageFallback]} />}<Text numberOfLines={1} style={styles.miniName}>{product.name}</Text></View>; }
function Input(props: React.ComponentProps<typeof TextInput> & { label: string }) { const { label, ...input } = props; return <View style={{ gap: 7 }}><Text style={styles.label}>{label.toUpperCase()}</Text><TextInput {...input} placeholderTextColor={colors.muted} style={styles.input} /></View>; }
function PrimaryButton({ title, onPress, disabled }: { title: string; onPress: () => void; disabled?: boolean }) { return <Pressable disabled={disabled} onPress={onPress} style={[styles.primary, disabled && { opacity: .6 }]}><Text style={styles.primaryText}>{title}</Text><MaterialCommunityIcons name="arrow-right" size={18} color={colors.cream} /></Pressable>; }
function Empty({ icon, text }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; text: string }) { return <View style={styles.empty}><MaterialCommunityIcons name={icon} size={42} color={colors.gold} /><Text style={styles.muted}>{text}</Text></View>; }
function Loading() { return <View style={styles.loading}><Image source={require("./assets/logo.png")} style={styles.loadingLogo} /><ActivityIndicator color={colors.gold} /><Text style={styles.muted}>Preparando tu experiencia…</Text></View>; }

const styles = StyleSheet.create({
  app:{flex:1,backgroundColor:colors.cream},body:{flex:1},loading:{flex:1,alignItems:"center",justifyContent:"center",gap:18,backgroundColor:colors.forest},loadingLogo:{width:120,height:120,borderRadius:60},auth:{flex:1,backgroundColor:colors.forest,justifyContent:"center",padding:22,gap:22},authBrand:{alignItems:"center"},authLogo:{width:86,height:86,borderRadius:43,marginBottom:14},authEyebrow:{color:colors.gold,fontSize:11,fontWeight:"800",letterSpacing:3},authTitle:{color:colors.cream,fontSize:30,fontWeight:"900",textAlign:"center",marginTop:10},authCopy:{color:"#D8E0DA",textAlign:"center",lineHeight:21,marginTop:8,maxWidth:380},authCard:{backgroundColor:colors.paper,borderRadius:24,padding:22,gap:16},cardTitle:{fontSize:25,fontWeight:"900",color:colors.ink},label:{fontSize:10,fontWeight:"800",letterSpacing:1.6,color:colors.forest2},input:{borderWidth:1,borderColor:colors.line,borderRadius:14,paddingHorizontal:15,paddingVertical:13,color:colors.ink,backgroundColor:colors.cream},primary:{minHeight:50,borderRadius:25,backgroundColor:colors.forest,flexDirection:"row",alignItems:"center",justifyContent:"center",gap:10,paddingHorizontal:20},primaryText:{color:colors.cream,fontWeight:"800"},link:{textAlign:"center",color:colors.forest,fontWeight:"700",padding:6},header:{height:68,flexDirection:"row",alignItems:"center",paddingHorizontal:18,gap:11,borderBottomWidth:1,borderColor:colors.line,backgroundColor:colors.paper},logo:{width:42,height:42,borderRadius:21},brand:{fontWeight:"900",color:colors.ink,fontSize:15},mini:{fontSize:11,color:colors.muted,marginTop:2},avatar:{width:36,height:36,borderRadius:18,backgroundColor:colors.forest,alignItems:"center",justifyContent:"center"},avatarText:{color:colors.gold,fontWeight:"900"},page:{padding:20,paddingBottom:40,gap:18},listPage:{flex:1,paddingHorizontal:16,paddingTop:18},eyebrow:{fontSize:11,fontWeight:"900",letterSpacing:2.5,color:colors.gold},heroTitle:{fontSize:36,lineHeight:41,fontWeight:"900",color:colors.ink},heroCopy:{fontSize:15,lineHeight:23,color:colors.muted},pageTitle:{fontSize:30,fontWeight:"900",color:colors.ink,marginBottom:8},sectionTitle:{fontSize:20,fontWeight:"900",color:colors.ink},featured:{flexDirection:"row",gap:10},miniProduct:{width:100},miniImage:{width:100,height:120,borderRadius:14,backgroundColor:"#EDF0ED"},miniName:{fontSize:12,fontWeight:"700",color:colors.ink,marginTop:7},shipping:{flexDirection:"row",gap:14,alignItems:"center",backgroundColor:colors.forest,borderRadius:20,padding:18},shippingTitle:{color:colors.cream,fontWeight:"900",fontSize:16},shippingCopy:{color:"#CFD9D2",fontSize:12,marginTop:3},search:{borderWidth:1,borderColor:colors.line,borderRadius:16,padding:13,backgroundColor:colors.paper,marginBottom:15},columns:{gap:12},productCard:{flex:1,backgroundColor:colors.paper,borderRadius:18,padding:10,marginBottom:12},productImage:{width:"100%",aspectRatio:.82,borderRadius:13,marginBottom:10},imageFallback:{alignItems:"center",justifyContent:"center",backgroundColor:"#EDF0ED"},productName:{fontWeight:"800",color:colors.ink},muted:{color:colors.muted,fontSize:12,marginTop:3},priceRow:{flexDirection:"row",alignItems:"center",justifyContent:"space-between",marginTop:10},price:{fontWeight:"900",color:colors.forest},add:{width:36,height:36,borderRadius:18,backgroundColor:colors.forest,alignItems:"center",justifyContent:"center"},cartRow:{flexDirection:"row",alignItems:"center",gap:10,backgroundColor:colors.paper,padding:15,borderRadius:16},qty:{width:34,height:34,borderRadius:17,backgroundColor:colors.cream,alignItems:"center",justifyContent:"center"},qtyText:{fontWeight:"900"},total:{flexDirection:"row",justifyContent:"space-between",alignItems:"center",paddingTop:12},totalMoney:{fontSize:24,fontWeight:"900",color:colors.forest},emailBox:{backgroundColor:colors.paper,borderRadius:16,padding:15,gap:6},logout:{padding:15,alignItems:"center"},logoutText:{color:colors.danger,fontWeight:"800"},empty:{minHeight:260,alignItems:"center",justifyContent:"center",gap:14,backgroundColor:colors.paper,borderRadius:20},nav:{height:72,flexDirection:"row",backgroundColor:colors.paper,borderTopWidth:1,borderColor:colors.line,paddingBottom:4},navItem:{flex:1,alignItems:"center",justifyContent:"center",gap:4},navText:{fontSize:10,color:colors.muted,fontWeight:"700"},navActive:{color:colors.forest},badge:{position:"absolute",right:-9,top:-6,minWidth:17,height:17,borderRadius:9,backgroundColor:colors.gold,alignItems:"center",justifyContent:"center"},badgeText:{fontSize:9,fontWeight:"900",color:colors.forest},
});
