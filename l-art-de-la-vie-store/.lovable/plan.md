# L'Art de la Vie — Tienda boutique

Ecommerce editorial, cálido y minimalista para Siguatepeque. Catálogo conectado a un backend externo vía `VITE_API_URL/catalog`, carrito persistente en localStorage y checkout que envía el pedido por WhatsApp (sin procesamiento de tarjetas).

## Alcance de esta primera versión

- Una sola página (Home) con secciones ancladas + rutas separadas para SEO (`/`, `/coleccion`, `/inspiracion`, `/visitanos`) reutilizando componentes.
- Catálogo remoto con estados de carga, vacío y error + reintento.
- Carrito lateral (drawer) con sincronización contra stock cuando el catálogo se refresca.
- Checkout por WhatsApp con formulario mínimo (nombre, teléfono, tipo de entrega, dirección opcional, nota).
- Sección de videos verticales de TikTok embebidos, ubicación, datos de transferencia (desde env, con copiar-al-portapapeles) y footer con redes.
- Sin Supabase, sin auth, sin admin, sin formularios de tarjeta.

## Identidad visual

Tokens en `src/styles.css` (Tailwind v4 `@theme inline` + variables oklch):

```
--forest: #073D25   --forest-2: #0F5435
--cream:  #F7F5EF   --paper: #FFFFFF
--gold:   #C8A94B
--ink:    #13251B   --ink-muted: #68756D
```

Tipografía cargada vía `<link>` en `__root.tsx` (nunca `@import` URL en CSS):

- **Playfair Display** (400/500/600 + italic) para títulos editoriales.
- **DM Sans** (400/500/600) para cuerpo, navegación y botones.

Reglas visuales: mucho espacio en blanco, radios discretos (2–8px, arcos editoriales sólo en imágenes hero), sombras suaves, sin degradados llamativos ni blobs.

## Arquitectura de rutas (TanStack Start)

El stack usa file-based routing, no `src/pages/`. La estructura pedida se conserva conceptualmente dentro de `src/components/`:

```
src/routes/
  __root.tsx           head global + fuentes + shell
  index.tsx            Home (todas las secciones)
  coleccion.tsx        catálogo enfocado
  inspiracion.tsx      videos + editorial
  visitanos.tsx        ubicación + transferencia

src/components/
  layout/    Header, MobileMenu, Footer, TopBar
  home/      Hero, Benefits, ProductSection, MarketingVideos,
             StoreInformation, TransferInformation
  products/  ProductCard, ProductGrid, ProductFilters, ProductSkeleton
  cart/      CartDrawer, CartItem, CheckoutDialog
  shared/    WhatsAppButton, SectionHeading, EmptyState, CopyButton

src/hooks/   useCatalog.ts, useCart.ts, useReducedMotion.ts, useHydrated.ts
src/lib/     api.ts, config.ts, currency.ts, whatsapp.ts
src/types/   product.ts
```

Cada ruta define su propio `head()` con título/descripción únicos.

## Datos y contratos

`src/types/product.ts`:

```ts
export type Category = "Decoración" | "Perfumes" | "Carteras" | "Varios";
export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  stock: number;
  image: string;
}
```

`src/lib/api.ts`: `fetchCatalog(): Promise<Product[]>` → `GET ${import.meta.env.VITE_API_URL}/catalog`, valida el shape con un guard ligero. Sin fallback estático en producción; sólo un pequeño array `SAMPLE_PRODUCTS` que se usa **solamente** si `VITE_API_URL` no está definida en dev (para permitir vista previa).

`useCatalog` usa TanStack Query (ya en el template): `useSuspenseQuery` no encaja aquí porque queremos estados de skeleton/error personalizados; usamos `useQuery` con `retry: 1`, `staleTime: 60_000`.

`useCart`:

- Estado en `useReducer` + `localStorage` (`lartdelavie:cart:v1`).
- API: `add`, `remove`, `setQty`, `clear`, `subtotal`, `count`.
- Efecto de reconciliación cuando llegan productos frescos: refrescar precio/imagen/nombre, clampar cantidad a `stock`, eliminar ítems sin stock o inexistentes.

`src/lib/currency.ts`: `formatL(n)` → `L 350.00` con `Intl.NumberFormat("es-HN", { minimumFractionDigits: 2 })`.

`src/lib/whatsapp.ts`: construye el mensaje del pedido y devuelve la URL `https://wa.me/{num}?text={enc}`.

`src/lib/config.ts`: lee y expone todas las envs `VITE_*` con defaults seguros (strings vacíos) + helpers `getTiktokIds()` que hace split por coma y filtra.

## Envs requeridas

Documentadas en un `README` corto y leídas sólo vía `import.meta.env`:

```
VITE_API_URL
VITE_WHATSAPP_NUMBER      (formato internacional sin +)
VITE_WHATSAPP_DISPLAY
VITE_BANK_NAME
VITE_BANK_ACCOUNT_NAME
VITE_BANK_ACCOUNT_NUMBER
VITE_STORE_ADDRESS
VITE_STORE_HOURS
VITE_GOOGLE_MAPS_URL
VITE_TIKTOK_VIDEO_IDS     (CSV)
VITE_TIKTOK_PROFILE_URL
VITE_INSTAGRAM_URL
```

Si falta un dato, la sección lo oculta o muestra un estado neutro; nunca revienta.

## Secciones (Home)

1. **TopBar** verde bosque, texto crema, mensaje "Detalles que transforman espacios y momentos." con una animación de opacidad muy leve al montar.
2. **Header** sticky con transición de padding/blur al pasar `scrollY > 24`. Logo circular (SVG monograma "L·V" en dorado sobre verde), nav (Colección, Inspiración, Visítanos), botón "Mi bolsa" con badge animado (spring en cambios de count). `MobileMenu` es un sheet desde la derecha.
3. **Hero** dos columnas en desktop, una en móvil. Tres fotos en composición asimétrica (dos pequeñas + una grande arqueada) con:
   - Aparición escalonada (fade + translateY 12px, stagger 80ms).
   - Parallax suave sobre scroll (translateY según `useScroll`).
   - Zoom lento continuo muy sutil (`scale 1 → 1.03` en 12s, `ease` triangular).
   - Micro-tilt basado en cursor sólo si `matchMedia("(hover:hover)")` y no `prefers-reduced-motion`.
4. **Benefits** tres columnas con iconos Lucide finos (Truck, Sparkles, HandCoins), sin tarjetas pesadas: sólo icono + título + línea corta.
5. **Catálogo (`ProductSection`)** con `SectionHeading`, buscador (input con icono), chips de filtro por categoría, y `ProductGrid`.
   - Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`.
   - `ProductCard`: imagen `aspect-[4/5] object-cover` con zoom `scale-105` en hover, sombra suave al hover, botón "Agregar" con transición y estado disabled + etiqueta "Agotado" cuando `stock === 0`.
   - `ProductSkeleton`: 8 tarjetas placeholder mientras carga.
   - `EmptyState` para catálogo vacío o error (con botón "Intentar nuevamente" que hace `refetch`).
6. **MarketingVideos** con fondo verde bosque. Desktop: 3 videos verticales (iframe `https://www.tiktok.com/player/v1/{id}`, `aspect-[9/16]`, `allow="autoplay; encrypted-media"` sin `autoplay`). Móvil: carrusel horizontal con `snap-x snap-mandatory` y sombreros de scroll. Link "Seguir en TikTok".
7. **StoreInformation** dos columnas: info textual (dirección, horario, WhatsApp, botón "Ver cómo llegar" → `VITE_GOOGLE_MAPS_URL`) + composición visual (foto + tarjeta flotante con horario).
8. **TransferInformation** tarjeta crema con borde dorado sutil; banco, titular, número + `CopyButton` (cambia a "Copiado ✓" 1.5s). Texto sobre enviar comprobante por WhatsApp.
9. **Footer** logo, frase, redes (Instagram, TikTok, WhatsApp), ubicación, botón "Volver arriba".

## Carrito y checkout

- **CartDrawer** desde la derecha (Radix Dialog + animación de translate). Lista `CartItem` con imagen, nombre, precio, `-/+`, eliminar, subtotal. Footer con total y botón "Continuar pedido".
- **CheckoutDialog** modal accesible (focus trap por Radix Dialog):
  - Campos: nombre*, teléfono*, `RadioGroup` "Recoger en tienda / Envío local", `Textarea` dirección (solo si envío), nota opcional.
  - Validación mínima: nombre no vacío, teléfono con al menos 8 dígitos.
  - Resumen del pedido + total.
  - Botón "Enviar pedido por WhatsApp" abre `wa.me` en nueva pestaña con el mensaje formateado exactamente como el ejemplo del brief.

## Botón flotante WhatsApp

`fixed bottom-4 right-4` (con `env(safe-area-inset-bottom)`), verde bosque con círculo dorado al hover. Desktop muestra pill "Hola, ¿te ayudamos?"; móvil sólo icono. Oculto cuando `CartDrawer` o `CheckoutDialog` están abiertos.

## Animaciones

Framer Motion, todas cortas (150–500ms), `ease-out`. Un hook `useReducedMotion` corta parallax, tilt y auto-zoom cuando el usuario lo prefiere. Sin loops infinitos molestos; el auto-zoom del hero se pausa fuera del viewport con `IntersectionObserver`.

## Accesibilidad

- HTML semántico (`<header>`, `<main>` único por página, `<nav>`, `<section>` con headings).
- Todos los botones icon-only con `aria-label`.
- Focus visible con anillo dorado (`ring-2 ring-[color:var(--gold)]`).
- Radix Dialog para drawer/modal → Escape + focus trap gratis.
- Contraste AA verificado entre `ink`/`cream` y `cream`/`forest`.
- Targets táctiles ≥ 44px en móvil (`min-h-11`).

## Responsive

Mobile-first. Breakpoints Tailwind por defecto. `min-h-dvh` en lugar de `min-h-screen` para contenedores full-height. Uso de `env(safe-area-inset-*)` en TopBar sticky y botón flotante. Sin scroll horizontal (`overflow-x-clip` en `body`).

## Detalles técnicos

- El template incluye TanStack Query; se usa a través del `QueryClient` inyectado en `router.tsx` (ya presente).
- No se toca `src/routeTree.gen.ts`.
- No se crea `src/pages/`; se respeta la convención `src/routes/` del stack. La carpeta `pages/` del brief se sustituye documentadamente por `routes/` — Home vive en `src/routes/index.tsx`.
- Reemplazo del placeholder en `src/routes/index.tsx` (deja de renderizar el SVG blank).
- Assets: se reserva un slot para hasta 6 fotografías locales (`src/assets/hero-*.jpg`, `src/assets/store-*.jpg`) generadas con imagegen (composición editorial de decoración, perfumes, carteras) para hero + ubicación; el catálogo real viene del backend.
- `__root.tsx`: se actualizan `<title>`, `<meta description>`, `og:title`, `og:description`, `og:type`, `twitter:card` con textos propios de la tienda; se agregan `<link>` de Google Fonts (preconnect + Playfair + DM Sans).

## Fuera de alcance (explícito)

- Supabase, autenticación, panel admin, POS.
- Pagos con tarjeta / pasarelas.
- Formularios de tarjeta.
- Emails transaccionales.

## Notas para el usuario

Al terminar, la tienda estará funcional con `SAMPLE_PRODUCTS` de respaldo si `VITE_API_URL` no está configurada, para que se pueda ver la vista previa. Para producción hay que definir las envs listadas arriba (WhatsApp, banco, TikTok, dirección, etc.); mientras no existan, esas secciones se degradan sin romper.
