# L'Art de la Vie · App de clientes

Aplicación Expo separada del POS administrativo. Los clientes usan Supabase Auth, consultan el catálogo público del backend y nunca reciben un registro en `store_members`.

## Preparación

1. Ejecutar en Supabase la migración `202607160001_customer_accounts.sql`.
2. Copiar `.env.example` como `.env` y colocar las mismas URL/llave pública utilizadas por la app administrativa.
3. Instalar y ejecutar:

```bash
npm install
npm start
```

Para probar desde Expo Go usa `npx expo start --tunnel`. Para generar APK usa `npm run build:apk` después de ejecutar `eas init` para esta aplicación nueva.
