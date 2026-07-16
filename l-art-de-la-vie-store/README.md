# L'Art de la Vie Store

Ecommerce público de L'Art de la Vie. El diseño original proviene de `toastserial/lartdevie-shop` y fue adaptado para funcionar dentro del monorepo con el backend Express existente.

## Funcionamiento

- Consulta el catálogo público en `GET /api/catalog`.
- Sincroniza nombre, precio, stock e imagen con el inventario.
- Conserva el carrito en el dispositivo.
- Actualiza el carrito cuando cambian precio o existencias.
- Envía el pedido por WhatsApp.
- Muestra transferencia, ubicación, horarios, TikTok e Instagram desde variables de entorno.
- No solicita ni almacena datos de tarjetas.

## Desarrollo local

```bash
npm install
npm run dev
```

La tienda abre en `http://127.0.0.1:5174`. El backend debe estar ejecutándose en `http://127.0.0.1:3000`.

## Variables

Copia `.env.example` como `.env` y configura:

- `VITE_API_URL`
- `VITE_WHATSAPP_NUMBER` y `VITE_WHATSAPP_DISPLAY`
- `VITE_BANK_NAME`, `VITE_BANK_ACCOUNT_NAME` y `VITE_BANK_ACCOUNT_NUMBER`
- `VITE_STORE_ADDRESS`, `VITE_STORE_HOURS` y `VITE_GOOGLE_MAPS_URL`
- `VITE_TIKTOK_PROFILE_URL`
- `VITE_INSTAGRAM_URL`

El número de WhatsApp debe llevar código de país y solamente dígitos. Para Honduras comienza con `504`.

En `VITE_TIKTOK_PROFILE_URL` coloca la URL completa del perfil público, por ejemplo `https://www.tiktok.com/@lartdelavie_hn`. La sección de inspiración utiliza el perfil oficial incrustado de TikTok, muestra automáticamente hasta diez videos recientes y se carga solamente cuando el visitante se acerca a ella para no retrasar el inicio de la página.

Nunca agregues `SUPABASE_SERVICE_ROLE_KEY` a este frontend.

## Vercel

Crear un proyecto independiente con:

- Root Directory: `l-art-de-la-vie-store`
- Build Command: `npm run build`
- Output Directory: `dist`
- Variables: las mismas de `.env.example`, con valores reales.

Después se debe agregar el dominio final del ecommerce a `STOREFRONT_ORIGIN` en Render y volver a desplegar la API.
