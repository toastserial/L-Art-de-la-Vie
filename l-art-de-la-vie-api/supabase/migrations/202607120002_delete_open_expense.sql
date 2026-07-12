-- Permite corregir un gasto únicamente antes de que forme parte de un cierre.
create or replace function public.delete_open_expense(
  requested_store_id uuid,
  requested_expense_id uuid
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  deleted_count integer;
begin
  delete from public.expenses e
  where e.id = requested_expense_id
    and e.store_id = requested_store_id
    and not exists (
      select 1 from public.cash_close_expenses cce
      where cce.expense_id = e.id
    );
  get diagnostics deleted_count = row_count;
  return deleted_count = 1;
end;
$$;

grant execute on function public.delete_open_expense(uuid, uuid) to authenticated, service_role;
