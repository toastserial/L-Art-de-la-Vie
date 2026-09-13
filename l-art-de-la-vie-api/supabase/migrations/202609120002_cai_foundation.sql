-- Base para facturación CAI de Honduras.
-- Mantener enabled=false hasta ingresar y validar los datos reales otorgados por SAR.
create table public.fiscal_settings (
  store_id uuid primary key references public.stores(id) on delete cascade,
  legal_name text,
  trade_name text,
  rtn text check (rtn is null or rtn ~ '^[0-9]{14}$'),
  address text,
  phone text,
  email text,
  cai text check (
    cai is null or cai ~ '^[A-Z0-9]{6}-[A-Z0-9]{6}-[A-Z0-9]{6}-[A-Z0-9]{6}-[A-Z0-9]{6}-[A-Z0-9]{2}$'
  ),
  establishment_code text not null default '000' check (establishment_code ~ '^[0-9]{3}$'),
  emission_point_code text not null default '001' check (emission_point_code ~ '^[0-9]{3}$'),
  document_type_code text not null default '01' check (document_type_code ~ '^[0-9]{2}$'),
  range_start bigint check (range_start is null or range_start between 1 and 99999999),
  range_end bigint check (range_end is null or range_end between 1 and 99999999),
  next_number bigint check (next_number is null or next_number between 1 and 99999999),
  authorization_date date,
  deadline_date date,
  enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint valid_fiscal_range check (
    range_start is null or range_end is null or
    (range_end >= range_start and next_number between range_start and range_end + 1)
  ),
  constraint enabled_fiscal_data_complete check (
    not enabled or (
      legal_name is not null and rtn is not null and address is not null and cai is not null and
      range_start is not null and range_end is not null and next_number is not null and
      authorization_date is not null and deadline_date is not null
    )
  )
);

create trigger fiscal_settings_set_updated_at before update on public.fiscal_settings
for each row execute function public.set_updated_at();

-- Se conserva una fotografía fiscal de cada documento; nunca depende de que
-- posteriormente cambien el CAI, razón social o dirección configurada.
create table public.fiscal_invoices (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete restrict,
  sale_id uuid not null unique references public.sales(id) on delete restrict,
  invoice_number text not null,
  sequence_number bigint not null,
  cai text not null,
  issuer_legal_name text not null,
  issuer_trade_name text,
  issuer_rtn text not null,
  issuer_address text not null,
  customer_name text not null default 'Consumidor final',
  customer_rtn text,
  issued_at timestamptz not null default now(),
  deadline_date date not null,
  authorized_range text not null,
  exempt_amount numeric(12,2) not null default 0,
  exonerated_amount numeric(12,2) not null default 0,
  taxable_15_amount numeric(12,2) not null default 0,
  taxable_18_amount numeric(12,2) not null default 0,
  isv_15 numeric(12,2) not null default 0,
  isv_18 numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  total numeric(12,2) not null check (total >= 0),
  status text not null default 'issued' check (status in ('issued', 'voided')),
  unique (store_id, invoice_number)
);

create index fiscal_invoices_store_issued_idx on public.fiscal_invoices (store_id, issued_at desc);
alter table public.fiscal_settings enable row level security;
alter table public.fiscal_invoices enable row level security;
revoke all privileges on public.fiscal_settings, public.fiscal_invoices from anon, authenticated;
grant all privileges on public.fiscal_settings, public.fiscal_invoices to service_role;
