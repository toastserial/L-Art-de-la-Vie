-- Seguridad: la web y la app usan Supabase solamente para Auth.
-- Toda lectura/escritura comercial debe atravesar Express, que conserva la
-- service_role exclusivamente en el servidor y aplica autenticación, roles y validación.

revoke all privileges on all tables in schema public from anon, authenticated;
revoke all privileges on all sequences in schema public from anon, authenticated;

-- PostgreSQL concede EXECUTE a PUBLIC por defecto. Se revoca explícitamente
-- para impedir que un usuario autenticado invoque RPCs y omita el backend.
revoke execute on function public.is_store_member(uuid) from public, anon, authenticated;
revoke execute on function public.can_manage_store(uuid) from public, anon, authenticated;
revoke execute on function public.register_inventory_movement(uuid, uuid, public.inventory_movement_type, integer, text) from public, anon, authenticated;
revoke execute on function public.complete_sale(uuid, jsonb, public.payment_method, numeric, numeric) from public, anon, authenticated;
revoke execute on function public.close_cash(uuid, numeric) from public, anon, authenticated;
revoke execute on function public.delete_open_expense(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.assign_product_code() from public, anon, authenticated;

-- El backend mantiene permisos. RLS continúa habilitado como defensa adicional.
grant all privileges on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
grant execute on function public.is_store_member(uuid) to service_role;
grant execute on function public.can_manage_store(uuid) to service_role;
grant execute on function public.register_inventory_movement(uuid, uuid, public.inventory_movement_type, integer, text) to service_role;
grant execute on function public.complete_sale(uuid, jsonb, public.payment_method, numeric, numeric) to service_role;
grant execute on function public.close_cash(uuid, numeric) to service_role;
grant execute on function public.delete_open_expense(uuid, uuid) to service_role;

-- Nuevas tablas creadas por postgres nacen cerradas para clientes.
alter default privileges for role postgres in schema public revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public revoke all on sequences from anon, authenticated;
alter default privileges for role postgres in schema public revoke execute on functions from public, anon, authenticated;
