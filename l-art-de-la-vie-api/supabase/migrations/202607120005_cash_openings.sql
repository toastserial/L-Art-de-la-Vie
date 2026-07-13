-- Apertura diaria y fondo inicial de caja.
create table public.cash_openings (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete restrict,
  business_date date not null,
  opening_cash numeric(12,2) not null check (opening_cash >= 0),
  opened_by uuid references auth.users(id) on delete set null,
  note text,
  created_at timestamptz not null default now(),
  unique (store_id, business_date)
);

create index cash_openings_store_date_idx on public.cash_openings (store_id, business_date desc);
alter table public.cash_openings enable row level security;
create policy "members read cash openings" on public.cash_openings for select to authenticated using (public.is_store_member(store_id));
create policy "members create cash openings" on public.cash_openings for insert to authenticated with check (public.is_store_member(store_id));
grant select, insert on public.cash_openings to authenticated, service_role;

alter table public.cash_closes
add column opening_cash numeric(12,2) not null default 0 check (opening_cash >= 0);

create or replace function public.close_cash(requested_store_id uuid, requested_actual_cash numeric)
returns public.cash_closes
language plpgsql
security invoker
set search_path = ''
as $$
declare
  local_date date;
  initial_cash numeric(12,2);
  cash_total numeric(12,2);
  card_total numeric(12,2);
  transfer_total numeric(12,2);
  expenses_total numeric(12,2);
  created_close public.cash_closes;
begin
  if requested_actual_cash < 0 then raise exception 'El efectivo real no puede ser negativo'; end if;
  select (now() at time zone timezone)::date into local_date from public.stores where id = requested_store_id;
  if local_date is null then raise exception 'Tienda no encontrada'; end if;

  select opening_cash into initial_cash from public.cash_openings
  where store_id = requested_store_id and business_date = local_date;
  if initial_cash is null then raise exception 'La caja todavía no ha sido abierta'; end if;

  select
    coalesce(sum(total) filter (where payment_method = 'efectivo'), 0),
    coalesce(sum(total) filter (where payment_method = 'tarjeta'), 0),
    coalesce(sum(total) filter (where payment_method = 'transferencia'), 0)
  into cash_total, card_total, transfer_total
  from public.sales
  where store_id = requested_store_id
    and (created_at at time zone (select timezone from public.stores where id = requested_store_id))::date = local_date;

  select coalesce(sum(e.amount), 0) into expenses_total
  from public.expenses e
  left join public.cash_close_expenses cce on cce.expense_id = e.id
  where e.store_id = requested_store_id and cce.expense_id is null
    and (e.created_at at time zone (select timezone from public.stores where id = requested_store_id))::date = local_date;

  insert into public.cash_closes (store_id, business_date, closed_by, opening_cash, total_sales, cash_sales,
    card_sales, transfer_sales, total_expenses, expected_cash, actual_cash)
  values (requested_store_id, local_date, (select auth.uid()), initial_cash, cash_total + card_total + transfer_total,
    cash_total, card_total, transfer_total, expenses_total, initial_cash + cash_total - expenses_total, requested_actual_cash)
  returning * into created_close;

  insert into public.cash_close_expenses (cash_close_id, expense_id)
  select created_close.id, e.id from public.expenses e
  left join public.cash_close_expenses cce on cce.expense_id = e.id
  where e.store_id = requested_store_id and cce.expense_id is null
    and (e.created_at at time zone (select timezone from public.stores where id = requested_store_id))::date = local_date;
  return created_close;
end;
$$;
