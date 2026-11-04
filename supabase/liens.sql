-- Un lien personnel par invité : la carte ne s'ouvre qu'avec un lien valide,
-- sur 2 appareils maximum par lien, et une seule réponse par lien.
alter table public.cartes add column if not exists invites jsonb;
alter table public.reponses add column if not exists t text;
create unique index if not exists reponses_un_par_lien on public.reponses (carte, t);
create table if not exists public.ouvertures (
  carte text not null references public.cartes on delete cascade,
  t text not null, appareil text not null, created_at timestamptz default now(),
  primary key (carte, t, appareil)
);
alter table public.ouvertures enable row level security;

create or replace function public.ouvrir_carte(p_id text, p_t text, p_dev text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare c record; inv jsonb; nb int; maxi int;
begin
  select * into c from cartes where id = p_id and paid;
  if not found then return null; end if;
  if c.invites is null then return jsonb_build_object('data', c.data); end if;          -- anciennes cartes
  maxi := greatest(1, coalesce(jsonb_array_length(c.data->'f'->'dest'), 0));             -- autant de liens que de personnes payées
  select e into inv from jsonb_array_elements(c.invites) with ordinality as x(e, i) where e->>'t' = p_t and i <= maxi;
  if inv is null then return jsonb_build_object('erreur', 'lien'); end if;
  if not exists (select 1 from ouvertures where carte = p_id and t = p_t and appareil = p_dev) then
    select count(*) into nb from ouvertures where carte = p_id and t = p_t;
    if nb >= 2 then return jsonb_build_object('erreur', 'limite'); end if;
    insert into ouvertures (carte, t, appareil) values (p_id, p_t, left(p_dev, 40));
  end if;
  return jsonb_build_object('data', c.data, 'nom', inv->>'n');
end $$;
grant execute on function public.ouvrir_carte(text, text, text) to anon, authenticated;
