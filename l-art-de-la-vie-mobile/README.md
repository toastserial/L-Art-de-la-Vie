# L'Art de la Vie POS — App móvil

Aplicación Android/iOS creada con Expo y React Native. Usa el mismo backend Express, la misma base de datos Supabase y las mismas reglas del POS web.

## Qué incluye

- Inicio de sesión persistente con Supabase Auth y roles.
- Dashboard móvil con ventas, existencias y alertas.
- POS táctil con carrito, descuento y tres métodos de pago.
- Apertura obligatoria de caja.
- Productos y movimientos de inventario.
- Gastos diarios, cierre, diferencia e historial.
- Navegación inferior adaptada para teléfono.

## Estructura

```text
l-art-de-la-vie-mobile/
├── App.tsx                 # Entrada y protecciones de sesión/tienda
├── src/
│   ├── components/         # Navegación, apertura y UI reutilizable
│   ├── context/            # Sesión y estado operativo
│   ├── lib/                # Clientes de Supabase y Express
│   ├── screens/            # Inicio, POS, inventario y caja
│   ├── theme.ts            # Colores, moneda y fechas
│   └── types.ts            # Contratos de datos
├── .env.example
├── app.json
└── eas.json
```

## Configuración

1. Copia `.env.example` como `.env`.
2. Usa la misma URL y llave pública de Supabase del frontend web.

```env
EXPO_PUBLIC_API_URL=https://l-art-de-la-vie.onrender.com/api
EXPO_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=TU_LLAVE_PUBLICA
```

Nunca coloques `SUPABASE_SERVICE_ROLE_KEY` en la app. Esa llave solamente pertenece al backend.

## Probar Google y la app completa

Google OAuth necesita la compilación nativa porque Expo Go no puede registrar el esquema `lartdelavie://`. La primera vez, con el emulador o teléfono Android conectado, ejecuta:

```bash
npm install
npm run android:native
```

Después de instalarla una vez, inicia siempre el servidor para la app nativa con:

```bash
npm start
```

Al pulsar `a`, la terminal debe mostrar una dirección que comienza con `lartdelavie://expo-development-client/`. Si muestra `exp://`, abrió Expo Go y Google no podrá regresar a la app.

Expo Go queda disponible únicamente para revisar pantallas que no usan Google:

```bash
npm run start:expo-go
```

## Verificación

```bash
npm run typecheck
npx expo-doctor
npm run export:android
```

## Generar un APK de prueba

Necesitas una cuenta gratuita en Expo:

```bash
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview
```

Para publicar en Play Store se usa el perfil `production` y se necesita una cuenta de Google Play Console.

## Flujo de seguridad

```text
App móvil → token de Supabase Auth → API Express → Supabase/PostgreSQL
```

La app no incluye la llave administrativa. Precios, stock, permisos, ventas y cierres continúan validados por el backend.
