-- Lookmiz : cartes et réponses des invités.
create table if not exists public.cartes (
  id text primary key check (char_length(id) between 10 and 20),
  cle text not null check (char_length(cle) between 10 and 40),
  data jsonb not null check (pg_column_size(data) < 20000),
  created_at timestamptz default now()
);
alter table public.cartes enable row level security;
create policy "creer une carte" on public.cartes for insert to anon, authenticated with check (true);

create table if not exists public.reponses (
  id bigint generated always as identity primary key,
  carte text not null references public.cartes on delete cascade,
  nom text not null check (char_length(nom) between 1 and 60),
  reponse text not null check (reponse in ('oui', 'non', 'peut-etre')),
  nb int not null default 1 check (nb between 1 and 20),
  message text check (char_length(message) <= 300),
  created_at timestamptz default now()
);
alter table public.reponses enable row level security;
create policy "repondre" on public.reponses for insert to anon, authenticated with check (true);

-- Lire une carte par son lien (sans pouvoir lister les autres)
create or replace function public.lire_carte(p_id text) returns jsonb
language sql security definer set search_path = public as $$ select data from cartes where id = p_id $$;
-- Voir les réponses : seulement avec la clé secrète de l'organisateur
create or replace function public.voir_reponses(p_id text, p_cle text) returns setof reponses
language sql security definer set search_path = public as $$
  select r.* from reponses r join cartes c on c.id = r.carte where c.id = p_id and c.cle = p_cle order by r.created_at desc $$;
grant execute on function public.lire_carte(text) to anon, authenticated;
grant execute on function public.voir_reponses(text, text) to anon, authenticated;
-- Paiement des cartes : une carte ne s'ouvre chez les invités qu'une fois payée.
alter table public.cartes add column if not exists paid boolean not null default false;
create or replace function public.lire_carte(p_id text) returns jsonb
language sql security definer set search_path = public as $$ select data from cartes where id = p_id and paid $$;
grant execute on function public.lire_carte(text) to anon, authenticated;
