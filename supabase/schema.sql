-- ============================================================
-- COLIBRI — Supabase Schema (idempotent — safe to re-run)
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  role          text not null check (role in ('prof', 'parent')),
  prenom        text not null,
  nom           text not null,
  email         text not null,
  telephone     text,
  etablissement       text,
  niveau_etudes       text,
  matieres_enseignees text,
  siret               text,
  adresse             text,
  iban                text,
  prenom_enfant text,
  created_at    timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, prenom, nom, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'prof'),
    coalesce(new.raw_user_meta_data->>'prenom', ''),
    coalesce(new.raw_user_meta_data->>'nom', ''),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── ÉLÈVES ──────────────────────────────────────────────────
create table if not exists public.eleves (
  id          uuid primary key default uuid_generate_v4(),
  prof_id     uuid not null references public.profiles(id) on delete cascade,
  nom         text not null,
  niveau      text not null,
  matiere     text not null,
  tarif_heure numeric(8,2) not null default 0,
  statut      text not null default 'actif'
              check (statut in ('actif', 'en attente', 'en pause', 'terminé')),
  solde       numeric(10,2) not null default 0,
  notes       text not null default '',
  created_at  timestamptz not null default now()
);

create table if not exists public.eleve_tags (
  id        uuid primary key default uuid_generate_v4(),
  eleve_id  uuid not null references public.eleves(id) on delete cascade,
  tag       text not null,
  unique (eleve_id, tag)
);

-- ─── COURS ───────────────────────────────────────────────────
create table if not exists public.cours (
  id            uuid primary key default uuid_generate_v4(),
  prof_id       uuid not null references public.profiles(id) on delete cascade,
  eleve_id      uuid references public.eleves(id) on delete set null,
  eleve_nom     text not null,
  matiere       text not null,
  date          date not null,
  duree         text not null,
  duree_heures  numeric(4,2) not null,
  montant       numeric(8,2) not null,
  statut        text not null default 'planifié'
                check (statut in ('payé', 'en attente', 'planifié')),
  created_at    timestamptz not null default now()
);

-- ─── FACTURES ────────────────────────────────────────────────
create table if not exists public.factures (
  id            uuid primary key default uuid_generate_v4(),
  prof_id       uuid not null references public.profiles(id) on delete cascade,
  mois          text not null,
  date_emission date not null default current_date,
  statut        text not null default 'en attente'
                check (statut in ('payée', 'en attente')),
  montant_brut  numeric(10,2) not null default 0,
  montant_net   numeric(10,2) not null default 0,
  created_at    timestamptz not null default now()
);

create table if not exists public.lignes_facture (
  id          uuid primary key default uuid_generate_v4(),
  facture_id  uuid not null references public.factures(id) on delete cascade,
  eleve_nom   text not null,
  matiere     text not null,
  heures      numeric(5,2) not null,
  tarif_heure numeric(8,2) not null
);

-- ─── PAPS ────────────────────────────────────────────────────
create table if not exists public.paps_annonces (
  id                uuid primary key default uuid_generate_v4(),
  prof_id           uuid not null references public.profiles(id) on delete cascade,
  prof_nom          text not null,
  matiere           text not null,
  niveau_eleve      text not null,
  prix              numeric(8,2) not null,
  horaires          text not null default '',
  frequence         text not null default '',
  localisation      text not null default '',
  description_eleve text not null default '',
  tags              text[] not null default '{}',
  urgent            boolean not null default false,
  active            boolean not null default true,
  created_at        timestamptz not null default now()
);

-- ─── PARENT–ÉLÈVE LINK ───────────────────────────────────────
create table if not exists public.parent_eleve (
  id         uuid primary key default uuid_generate_v4(),
  parent_id  uuid not null references public.profiles(id) on delete cascade,
  eleve_id   uuid not null references public.eleves(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (parent_id, eleve_id)
);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
alter table public.profiles       enable row level security;
alter table public.eleves         enable row level security;
alter table public.eleve_tags     enable row level security;
alter table public.cours          enable row level security;
alter table public.factures       enable row level security;
alter table public.lignes_facture enable row level security;
alter table public.paps_annonces  enable row level security;
alter table public.parent_eleve   enable row level security;

-- Drop existing policies before recreating (idempotent)
do $$ begin

  -- profiles
  drop policy if exists "profiles: read own"   on public.profiles;
  drop policy if exists "profiles: update own" on public.profiles;

  -- eleves
  drop policy if exists "eleves: prof crud"   on public.eleves;
  drop policy if exists "eleves: parent read" on public.eleves;

  -- eleve_tags
  drop policy if exists "eleve_tags: prof crud" on public.eleve_tags;

  -- cours
  drop policy if exists "cours: prof crud"   on public.cours;
  drop policy if exists "cours: parent read" on public.cours;

  -- factures
  drop policy if exists "factures: prof crud" on public.factures;

  -- lignes_facture
  drop policy if exists "lignes_facture: prof crud" on public.lignes_facture;

  -- paps_annonces
  drop policy if exists "paps: read all active" on public.paps_annonces;
  drop policy if exists "paps: prof crud"       on public.paps_annonces;
  drop policy if exists "paps: prof update"     on public.paps_annonces;
  drop policy if exists "paps: prof delete"     on public.paps_annonces;

  -- parent_eleve
  drop policy if exists "parent_eleve: parent read" on public.parent_eleve;

end $$;

-- Profiles: own row only
create policy "profiles: read own"   on public.profiles for select using (auth.uid() = id);
create policy "profiles: update own" on public.profiles for update using (auth.uid() = id);

-- Eleves: prof owns their students; parent can read linked students
create policy "eleves: prof crud" on public.eleves for all
  using (auth.uid() = prof_id)
  with check (auth.uid() = prof_id);

create policy "eleves: parent read" on public.eleves for select
  using (
    exists (
      select 1 from public.parent_eleve pe
      where pe.eleve_id = eleves.id and pe.parent_id = auth.uid()
    )
  );

-- Eleve tags: follow eleve access
create policy "eleve_tags: prof crud" on public.eleve_tags for all
  using (
    exists (select 1 from public.eleves e where e.id = eleve_tags.eleve_id and e.prof_id = auth.uid())
  )
  with check (
    exists (select 1 from public.eleves e where e.id = eleve_tags.eleve_id and e.prof_id = auth.uid())
  );

-- Cours: prof owns; parent can read linked student's cours
create policy "cours: prof crud" on public.cours for all
  using (auth.uid() = prof_id)
  with check (auth.uid() = prof_id);

create policy "cours: parent read" on public.cours for select
  using (
    exists (
      select 1 from public.parent_eleve pe
      where pe.eleve_id = cours.eleve_id and pe.parent_id = auth.uid()
    )
  );

-- Factures: prof owns
create policy "factures: prof crud" on public.factures for all
  using (auth.uid() = prof_id)
  with check (auth.uid() = prof_id);

-- Lignes facture: follow facture access
create policy "lignes_facture: prof crud" on public.lignes_facture for all
  using (
    exists (select 1 from public.factures f where f.id = lignes_facture.facture_id and f.prof_id = auth.uid())
  )
  with check (
    exists (select 1 from public.factures f where f.id = lignes_facture.facture_id and f.prof_id = auth.uid())
  );

-- PAPS: everyone logged-in can read active annonces; only owner can write
create policy "paps: read all active" on public.paps_annonces for select
  using (active = true or auth.uid() = prof_id);

create policy "paps: prof crud" on public.paps_annonces for insert
  with check (auth.uid() = prof_id);

create policy "paps: prof update" on public.paps_annonces for update
  using (auth.uid() = prof_id);

create policy "paps: prof delete" on public.paps_annonces for delete
  using (auth.uid() = prof_id);

-- Parent-eleve link: parent can read own links
create policy "parent_eleve: parent read" on public.parent_eleve for select
  using (auth.uid() = parent_id);

-- ─── INDEXES ─────────────────────────────────────────────────
create index if not exists idx_eleves_prof_id         on public.eleves         (prof_id);
create index if not exists idx_cours_prof_date         on public.cours          (prof_id, date desc);
create index if not exists idx_cours_eleve_id          on public.cours          (eleve_id);
create index if not exists idx_factures_prof_id        on public.factures       (prof_id);
create index if not exists idx_lignes_facture_id       on public.lignes_facture (facture_id);
create index if not exists idx_paps_active_created     on public.paps_annonces  (active, created_at desc);
create index if not exists idx_parent_eleve_parent_id  on public.parent_eleve   (parent_id);
create index if not exists idx_parent_eleve_eleve_id   on public.parent_eleve   (eleve_id);
