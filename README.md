# L'Art de la Vie POS

Sistema privado de punto de venta con aplicaciones web y móvil, Express y Supabase.

## Aplicaciones

- `l-art-de-la-vie-pos`: frontend web React/Vite.
- `l-art-de-la-vie-api`: backend Express y migraciones Supabase.
- `l-art-de-la-vie-mobile`: aplicación Android/iOS con Expo y React Native.
- `l-art-de-la-vie-store`: tienda pública React/Vite para clientes.

Documentación detallada de arquitectura, componentes, base de datos, Git y despliegue: [`docs/SYSTEM_GUIDE.md`](docs/SYSTEM_GUIDE.md).

Guía de seguridad, permisos y verificación: [`docs/SECURITY.md`](docs/SECURITY.md).

Configuración de acceso privado con Google: [`docs/GOOGLE_SSO.md`](docs/GOOGLE_SSO.md).

Preparación legal y técnica de factura CAI: [`docs/CAI_HONDURAS.md`](docs/CAI_HONDURAS.md).

## Configuración inicial

### 1. Base de datos

En Supabase → **SQL Editor**, ejecuta en orden los archivos de `l-art-de-la-vie-api/supabase/migrations`:

1. `202607120001_initial_schema.sql`
2. `202607120002_delete_open_expense.sql`
3. `202607120003_auth_bootstrap.sql`
4. `202607120004_auto_product_codes.sql`
5. `202607120005_cash_openings.sql`
6. `202607140001_product_images.sql`
7. `202607140002_backend_only_access.sql`
8. `202607140003_user_display_names.sql`
9. `202607160001_customer_accounts.sql`
10. `202609080001_dynamic_product_categories.sql`
11. `202609120001_staff_access_allowlist.sql`
12. `202609120002_cai_foundation.sql`

### 2. Primer usuario

En Supabase → **Authentication → Users**, crea el usuario propietario con correo y contraseña. Luego autoriza ese mismo correo; el trigger enlaza automáticamente la cuenta existente:

```sql
insert into public.staff_access_allowlist (store_id, email, role)
values ('00000000-0000-0000-0000-000000000001', 'CORREO-DEL-PROPIETARIO', 'owner');
```

Si el propietario ya existía antes de ejecutar la migración `202609120001`, su acceso se conserva y se agrega a la lista automáticamente.

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
VITE_GOOGLE_AUTH_ENABLED=true
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

El propietario puede administrar los correos desde **POS → Personal**. Para hacerlo manualmente:

```sql
insert into public.staff_access_allowlist (store_id, email, role)
values (
  '00000000-0000-0000-0000-000000000001',
  'correo@gmail.com',
  'cashier'
)
on conflict (store_id, email)
do update set role = excluded.role, active = true;
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
