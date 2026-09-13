-- Promociones permanentes del catálogo. `price` conserva el precio regular;
-- la tienda pública calcula y muestra el precio de oferta desde este porcentaje.
alter table public.products
add column if not exists discount_percent numeric(5,2) not null default 0
check (discount_percent >= 0 and discount_percent <= 100);
