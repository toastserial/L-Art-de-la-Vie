# L'Art de la Vie POS

Sistema privado de punto de venta con aplicaciones web y móvil, Express y Supabase.

## Aplicaciones

- `l-art-de-la-vie-pos`: frontend web React/Vite.
- `l-art-de-la-vie-api`: backend Express y migraciones Supabase.
- `l-art-de-la-vie-mobile`: aplicación Android/iOS con Expo y React Native.

Documentación detallada de arquitectura, componentes, base de datos, Git y despliegue: [`docs/SYSTEM_GUIDE.md`](docs/SYSTEM_GUIDE.md).

## Configuración inicial

### 1. Base de datos

En Supabase → **SQL Editor**, ejecuta en orden los archivos de `l-art-de-la-vie-api/supabase/migrations`:

1. `202607120001_initial_schema.sql`
2. `202607120002_delete_open_expense.sql`
3. `202607120003_auth_bootstrap.sql`
4. `202607120004_auto_product_codes.sql`
5. `202607120005_cash_openings.sql`

### 2. Primer usuario

En Supabase → **Authentication → Users**, crea el usuario propietario con correo y contraseña. La migración `003` asigna como `owner` al primer usuario existente. Si el usuario se creó después, el trigger hace la misma asignación automáticamente.

No existe registro público en el frontend: es un sistema privado para personal autorizado.

### 3. Variables del backend

En `l-art-de-la-vie-api/.env`:

```env
PORT=3000
FRONTEND_ORIGIN=http://localhost:8080
SUPABASE_URL=https://TU-PROYECTO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY
SUPABASE_STORE_ID=00000000-0000-0000-0000-000000000001
```

### 4. Variables del frontend

En `l-art-de-la-vie-pos/.env`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=TU_PUBLISHABLE_KEY
```

La clave publishable/anon puede estar en el navegador. La `service_role` jamás debe colocarse en el frontend.

### 5. Recuperación de contraseña

En Supabase → **Authentication → URL Configuration** configura:

- Site URL local: `http://localhost:8080`
- Redirect URL local: `http://localhost:8080/reset-password`
- En producción agrega también `https://TU-DOMINIO/reset-password`.

## Roles

- `owner`: control completo.
- `admin`: inventario, corrección de gastos y cierre de caja.
- `cashier`: ventas, consulta de inventario y registro de gastos.

Para autorizar otro usuario creado en Supabase Auth:

```sql
insert into public.store_members (store_id, user_id, role)
values (
  '00000000-0000-0000-0000-000000000001',
  'UUID-DEL-USUARIO',
  'cashier'
);
```

Cambia `cashier` por `admin` cuando corresponda.

## Ejecución

Terminal 1:

```bash
cd l-art-de-la-vie-api
npm install
npm run dev
```

Terminal 2:

```bash
cd l-art-de-la-vie-pos
npm install
npm run dev
```

Abre `http://localhost:8080`.
