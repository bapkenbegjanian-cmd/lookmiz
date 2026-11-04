-- Paiement des cartes : une carte ne s'ouvre chez les invités qu'une fois payée.
alter table public.cartes add column if not exists paid boolean not null default false;
create or replace function public.lire_carte(p_id text) returns jsonb
language sql security definer set search_path = public as $$ select data from cartes where id = p_id and paid $$;
grant execute on function public.lire_carte(text) to anon, authenticated;
