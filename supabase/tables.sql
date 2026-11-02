-- Tables de Cabine : essais faits par chaque compte, et abonnés.
create table public.essais (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users on delete cascade,
  prediction text,
  created_at timestamptz default now()
);
create index on public.essais (user_id);
create table public.abonnes (
  user_id uuid primary key references auth.users on delete cascade,
  fin timestamptz,
  created_at timestamptz default now()
);
alter table public.essais enable row level security;
alter table public.abonnes enable row level security;
-- Aucune règle d'accès public : seules la fonction (clé serveur) et toi, dans le tableau de bord, peuvent lire et écrire.

-- Un essai peut regrouper plusieurs images (les 3 looks) : elles partagent le même « groupe ».
alter table public.essais add column if not exists groupe text;

-- Abonnement Stripe : identifiants du client et de l'abonnement, pour suivre renouvellements et résiliations.
alter table public.abonnes add column if not exists stripe_customer text;
alter table public.abonnes add column if not exists stripe_sub text;
create index if not exists abonnes_customer on public.abonnes (stripe_customer);
