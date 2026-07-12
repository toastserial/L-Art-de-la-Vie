# Base de datos de L'Art de la Vie

Supabase usa PostgreSQL (no MySQL). Las migraciones están en la carpeta `migrations` y se ejecutan en orden por nombre.

## Instalación

1. Crea un proyecto en Supabase.
2. Abre **SQL Editor**, pega cada migración y ejecútala una sola vez, en orden: `202607120001`, `202607120002`, `202607120003` y `202607120004`.
3. La migración crea la tienda con ID `00000000-0000-0000-0000-000000000001` y carga el catálogo inicial del frontend.
4. Cuando exista el primer usuario en Supabase Auth, asígnalo como propietario reemplazando el UUID:

```sql
insert into public.store_members (store_id, user_id, role)
values (
  '00000000-0000-0000-0000-000000000001',
  'UUID-DEL-USUARIO-DE-AUTH',
  'owner'
);
```

## Seguridad

Todas las tablas expuestas tienen RLS. Los usuarios autenticados solo pueden ver tiendas a las que pertenecen. La `service_role` se reservará para Express y nunca debe aparecer en React ni en variables con prefijo `VITE_`.

Las funciones `complete_sale`, `register_inventory_movement` y `close_cash` concentran las operaciones que antes vivían en el JSON/estado de React y evitan actualizaciones parciales.
