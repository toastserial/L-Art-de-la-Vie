# Backend L'Art de la Vie

## 1. Preparar Supabase

Ejecuta en orden todas las migraciones de `supabase/migrations` una sola vez desde **SQL Editor**.

## 2. Configurar el backend

Duplica `.env.example`, llámalo `.env` y completa:

- `SUPABASE_URL`: Project Settings → API → Project URL.
- `SUPABASE_SERVICE_ROLE_KEY`: Project Settings → API Keys → service_role.
- `SUPABASE_STORE_ID`: déjalo con el UUID incluido en el ejemplo.

La clave `service_role` es secreta: solo debe estar en esta carpeta backend.

## 3. Iniciar Express

```bash
npm install
npm run dev
```

Comprueba `http://localhost:3000/api/health`. Debe responder `{ "status": "ok", "database": "supabase" }`.

## Flujo

`React (puerto 8080) → Express (puerto 3000) → Supabase/PostgreSQL`

Express valida los datos y transforma los nombres de columnas SQL al formato que ya usaba el frontend.

Todas las rutas bajo `/api`, excepto `/api/health`, requieren `Authorization: Bearer <token>`. El servidor valida el token con Supabase Auth y aplica el rol registrado en `store_members`.
