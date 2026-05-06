-- ============================================================
-- COLIBRI — Supabase Schema (Fusion V2 + Onboarding Parent)
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
  -- onboarding prof
  nom_entreprise           text,
  onboarding_complete      boolean not null default false,
  cgu_accepted             boolean not null default false,
  mandat_accepted          boolean not null default false,
  competence_accepted      boolean not null default false,
  acceptances_at           timestamptz,
  stripe_account_id        text,
  stripe_onboarding_complete boolean not null default false,
  -- onboarding parent – état civil
  civilite                     text check (civilite in ('M.', 'Mme')),
  nom_naissance                text,
  nom_usage                    text,
  date_naissance               date,
  lieu_naissance_cp            text,
  lieu_naissance_ville         text,
  lieu_naissance_pays          text,
  adresse_postale              text,
  -- onboarding parent – légal
  parent_cgu_accepted          boolean not null default false,
  parent_mandat_urssaf_accepted boolean not null default false,
  parent_cgu_accepted_at       timestamptz,
  parent_mandat_accepted_at    timestamptz,
  -- onboarding parent – urssaf
  urssaf_status                text check (urssaf_status in ('none', 'activation_pending', 'active')),
  urssaf_id                    text,
  created_at    timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, prenom, nom, email, telephone, etablissement)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'role', 'prof'),
    coalesce(new.raw_user_meta_data->>'prenom', ''),
    coalesce(new.raw_user_meta_data->>'nom', ''),
    new.email,
    new.raw_user_meta_data->>'telephone',
    new.raw_user_meta_data->>'etablissement'
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
  created_at  timestamptz not null default now(),
  -- AJOUT DE LA COLONNE CODE INVITATION
  code_invitation text unique default upper(substring(md5(random()::text) from 1 for 8))
);

-- ─── RECAP MENSUEL (v2) ──────────────────────────────────────
-- Création anticipée pour que la table cours puisse y faire référence
create table if not exists public.recap_mensuel (
  id         uuid primary key default uuid_generate_v4(),
  prof_id    uuid not null references public.profiles(id) on delete cascade,
  mois       int not null check (mois between 1 and 12),
  annee      int not null,
  statut     text not null default 'en_cours'
             check (statut in ('en_cours', 'en_attente_parent', 'en_attente_paiement', 'valide')),
  created_at timestamptz not null default now(),
  unique (prof_id, mois, annee)
);

-- ─── COURS ───────────────────────────────────────────────────
create table if not exists public.cours (
  id            uuid primary key default uuid_generate_v4(),
  prof_id       uuid not null references public.profiles(id) on delete cascade,
  eleve_id      uuid references public.eleves(id) on delete set null,
  recap_id      uuid references public.recap_mensuel(id) on delete set null,
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

-- Suivi de validation par élève (lié au recap_mensuel)
create table if not exists public.recap_eleve_validation (
  id         uuid primary key default uuid_generate_v4(),
  recap_id   uuid not null references public.recap_mensuel(id) on delete cascade,
  eleve_id   uuid not null references public.eleves(id) on delete cascade,
  statut     text not null default 'en_attente_parent'
             check (statut in ('en_attente_parent', 'valide')),
  created_at timestamptz not null default now(),
  unique (recap_id, eleve_id)
);

-- ─── FACTURES ────────────────────────────────────────────────
create table if not exists public.factures (
  id            uuid primary key default uuid_generate_v4(),
  prof_id       uuid not null references public.profiles(id) on delete cascade,
  parent_id     uuid references public.profiles(id) on delete set null,
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

-- ─── HELPER FUNCTION : Éviter la récursion RLS recap_mensuel ─
-- security definer = s'exécute avec les droits du propriétaire de la fonction,
-- donc bypass le RLS des tables qu'elle interroge → pas de récursion.
create or replace function public.parent_peut_lire_recap(p_recap_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1
    from public.recap_eleve_validation rev
    join public.parent_eleve pe on pe.eleve_id = rev.eleve_id
    where rev.recap_id = p_recap_id
      and pe.parent_id = auth.uid()
  );
$$;

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────
alter table public.profiles               enable row level security;
alter table public.eleves                 enable row level security;
alter table public.cours                  enable row level security;
alter table public.factures               enable row level security;
alter table public.lignes_facture         enable row level security;
alter table public.paps_annonces          enable row level security;
alter table public.parent_eleve           enable row level security;
alter table public.recap_mensuel          enable row level security;
alter table public.recap_eleve_validation enable row level security;

-- Nettoyage des anciennes policies
do $$ begin
  drop policy if exists "profiles: read own"   on public.profiles;
  drop policy if exists "profiles: parent read prof" on public.profiles;
  drop policy if exists "profiles: update own" on public.profiles;
  drop policy if exists "eleves: prof crud"   on public.eleves;
  drop policy if exists "eleves: parent read" on public.eleves;
  drop policy if exists "cours: prof crud"   on public.cours;
  drop policy if exists "cours: parent read" on public.cours;
  drop policy if exists "factures: prof crud" on public.factures;
  drop policy if exists "lignes_facture: prof crud" on public.lignes_facture;
  drop policy if exists "paps: read all active" on public.paps_annonces;
  drop policy if exists "paps: prof crud"       on public.paps_annonces;
  drop policy if exists "paps: prof update"     on public.paps_annonces;
  drop policy if exists "paps: prof delete"     on public.paps_annonces;
  drop policy if exists "parent_eleve: parent read" on public.parent_eleve;
  drop policy if exists "recap_mensuel: prof crud" on public.recap_mensuel;
  drop policy if exists "recap_mensuel: parent read" on public.recap_mensuel;
  drop policy if exists "recap_mensuel: parent paiement" on public.recap_mensuel;
  drop policy if exists "recap_eleve_validation: prof crud" on public.recap_eleve_validation;
  drop policy if exists "recap_eleve_validation: parent read" on public.recap_eleve_validation;
  drop policy if exists "recap_eleve_validation: parent update" on public.recap_eleve_validation;
end $$;

-- Profiles
create policy "profiles: read own"   on public.profiles for select using (auth.uid() = id);

-- Permet au parent de lire le profil du prof de ses enfants (pour afficher le nom du prof)
create policy "profiles: parent read prof" on public.profiles for select using (
  exists (
    select 1
    from public.eleves e
    join public.parent_eleve pe on pe.eleve_id = e.id
    where e.prof_id = profiles.id
      and pe.parent_id = auth.uid()
  )
);
create policy "profiles: update own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- Eleves
create policy "eleves: prof crud" on public.eleves for all using (auth.uid() = prof_id) with check (auth.uid() = prof_id);
create policy "eleves: parent read" on public.eleves for select using (
  exists (select 1 from public.parent_eleve pe where pe.eleve_id = eleves.id and pe.parent_id = auth.uid())
);

-- Cours
create policy "cours: prof crud" on public.cours for all using (auth.uid() = prof_id) with check (auth.uid() = prof_id);
create policy "cours: parent read" on public.cours for select using (
  exists (select 1 from public.parent_eleve pe where pe.eleve_id = cours.eleve_id and pe.parent_id = auth.uid())
);

-- Factures
create policy "factures: prof crud" on public.factures for all using (auth.uid() = prof_id) with check (auth.uid() = prof_id);

-- Lignes facture
create policy "lignes_facture: prof crud" on public.lignes_facture for all using (
  exists (select 1 from public.factures f where f.id = lignes_facture.facture_id and f.prof_id = auth.uid())
) with check (
  exists (select 1 from public.factures f where f.id = lignes_facture.facture_id and f.prof_id = auth.uid())
);

-- PAPS
create policy "paps: read all active" on public.paps_annonces for select using (active = true or auth.uid() = prof_id);
create policy "paps: prof crud" on public.paps_annonces for insert with check (auth.uid() = prof_id);
create policy "paps: prof update" on public.paps_annonces for update using (auth.uid() = prof_id);
create policy "paps: prof delete" on public.paps_annonces for delete using (auth.uid() = prof_id);

-- Parent-eleve
create policy "parent_eleve: parent read" on public.parent_eleve for select using (auth.uid() = parent_id);

-- 1. On supprime la règle existante
DROP POLICY IF EXISTS "parent_eleve: prof read" ON public.parent_eleve;

-- 2. On la recrée proprement
CREATE POLICY "parent_eleve: prof read" ON public.parent_eleve FOR SELECT USING (
  public.prof_peut_lire_parent_eleve(eleve_id)
);


-- Recap Mensuel (V2)
create policy "recap_mensuel: prof crud" on public.recap_mensuel for all using (auth.uid() = prof_id) with check (auth.uid() = prof_id);
-- IMPORTANT: On utilise une fonction security definer pour éviter la récursion infinie.
-- Sans ça : parent lit recap_eleve_validation → embed recap_mensuel → RLS recap_mensuel
-- interroge recap_eleve_validation → RLS recap_eleve_validation s'évalue → boucle infinie.
create policy "recap_mensuel: parent read" on public.recap_mensuel for select using (
  public.parent_peut_lire_recap(id)
);
-- La transition recap_mensuel → 'en_attente_paiement' est désormais gérée
-- automatiquement par le trigger check_all_parents_validated (voir ci-dessous).
-- Le parent n'a plus besoin de policy UPDATE sur recap_mensuel.

-- Recap Eleve Validation
create policy "recap_eleve_validation: prof crud" on public.recap_eleve_validation for all using (
  exists (select 1 from public.recap_mensuel rm where rm.id = recap_eleve_validation.recap_id and rm.prof_id = auth.uid())
) with check (
  exists (select 1 from public.recap_mensuel rm where rm.id = recap_eleve_validation.recap_id and rm.prof_id = auth.uid())
);
create policy "recap_eleve_validation: parent read" on public.recap_eleve_validation for select using (
  exists (
    select 1 from public.recap_eleve_validation rev2
    join public.parent_eleve pe on pe.eleve_id = rev2.eleve_id
    where rev2.recap_id = recap_eleve_validation.recap_id and pe.parent_id = auth.uid()
  )
);
create policy "recap_eleve_validation: parent update" on public.recap_eleve_validation for update using (
  statut = 'en_attente_parent' and
  exists (
    select 1 from public.parent_eleve pe
    where pe.eleve_id = recap_eleve_validation.eleve_id and pe.parent_id = auth.uid()
  )
) with check (
  statut = 'valide' and
  exists (
    select 1 from public.parent_eleve pe
    where pe.eleve_id = recap_eleve_validation.eleve_id and pe.parent_id = auth.uid()
  )
);


-- 1. On détruit la règle qui cause la boucle infinie
drop policy if exists "recap_eleve_validation: parent read" on public.recap_eleve_validation;

-- 2. On la remplace par une règle directe et optimisée
create policy "recap_eleve_validation: parent read" on public.recap_eleve_validation for select using (
  exists (
    select 1 from public.parent_eleve pe
    where pe.eleve_id = recap_eleve_validation.eleve_id and pe.parent_id = auth.uid()
  )
);



-- ─── INDEXES ─────────────────────────────────────────────────
create index if not exists idx_eleves_prof_id         on public.eleves         (prof_id);
create index if not exists idx_cours_prof_date        on public.cours          (prof_id, date desc);
create index if not exists idx_cours_eleve_id         on public.cours          (eleve_id);
create index if not exists idx_factures_prof_id       on public.factures       (prof_id);
create index if not exists idx_lignes_facture_id      on public.lignes_facture (facture_id);
create index if not exists idx_paps_active_created    on public.paps_annonces  (active, created_at desc);
create index if not exists idx_parent_eleve_parent_id on public.parent_eleve   (parent_id);
create index if not exists idx_parent_eleve_eleve_id  on public.parent_eleve   (eleve_id);
create index if not exists idx_recap_mensuel_prof     on public.recap_mensuel  (prof_id);
create index if not exists idx_recap_validation_recap on public.recap_eleve_validation (recap_id);
create index if not exists idx_recap_validation_eleve on public.recap_eleve_validation (eleve_id);

-- ─── FONCTION RPC : Lier Parent-Élève ────────────────────────
create or replace function public.lier_parent_eleve(code_secret text)
returns boolean
language plpgsql
security definer
as $$
declare
  v_eleve_id uuid;
  v_parent_id uuid;
begin
  -- Vérification de la session
  v_parent_id := auth.uid();
  if v_parent_id is null then
    raise exception 'Non autorisé : Utilisateur non connecté.';
  end if;

  -- Recherche de l'élève via le code
  select id into v_eleve_id from public.eleves where code_invitation = code_secret;
  
  if v_eleve_id is null then
    raise exception 'Code d''invitation invalide ou introuvable.';
  end if;

  -- Création du lien
  insert into public.parent_eleve (parent_id, eleve_id)
  values (v_parent_id, v_eleve_id)
  on conflict (parent_id, eleve_id) do nothing;

  return true;
end;
$$;

-- ─── TRIGGER : Validation automatique du recap_mensuel ──────
-- Quand tous les élèves d'un recap passent à 'valide',
-- le recap_mensuel bascule automatiquement à 'en_attente_paiement'.

create or replace function public.check_all_parents_validated()
returns trigger as $$
begin
  -- On ne réagit que si la ligne vient de passer à 'valide'
  if NEW.statut = 'valide' then
    -- Vérifie s'il reste des lignes 'en_attente_parent' pour ce recap
    if not exists (
      select 1
      from public.recap_eleve_validation
      where recap_id = NEW.recap_id
        and statut = 'en_attente_parent'
    ) then
      -- Tous les parents ont validé → on fait avancer le recap
      update public.recap_mensuel
      set statut = 'en_attente_paiement'
      where id = NEW.recap_id
        and statut = 'en_attente_parent';
    end if;
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_check_all_parents_validated on public.recap_eleve_validation;
create trigger trg_check_all_parents_validated
  after update on public.recap_eleve_validation
  for each row
  execute function public.check_all_parents_validated();

-- ─── POLICY : Permettre aux parents d'ajouter un nouveau lien ──
drop policy if exists "parent_eleve: parent insert" on public.parent_eleve;
create policy "parent_eleve: parent insert" on public.parent_eleve for insert
  with check (auth.uid() = parent_id);

-- LE COUP DE PIED AU CACHE : On force l'API à relire la base de données
NOTIFY pgrst, 'reload schema';





-- ═══════════════════════════════════════════════════════════
-- FIX RECURSION INFINIE : recap_mensuel ↔ recap_eleve_validation
-- ═══════════════════════════════════════════════════════════

-- 1. Fonctions security definer (bypass RLS = pas de récursion)

create or replace function public.parent_peut_lire_recap(p_recap_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.recap_eleve_validation rev
    join public.parent_eleve pe on pe.eleve_id = rev.eleve_id
    where rev.recap_id = p_recap_id and pe.parent_id = auth.uid()
  );
$$;

create or replace function public.prof_owns_recap(p_recap_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.recap_mensuel
    where id = p_recap_id and prof_id = auth.uid()
  );
$$;

-- 2. Supprimer TOUTES les anciennes policies sur ces 2 tables

drop policy if exists "recap_mensuel: prof crud"       on public.recap_mensuel;
drop policy if exists "recap_mensuel: parent read"     on public.recap_mensuel;
drop policy if exists "recap_mensuel: parent paiement" on public.recap_mensuel;

drop policy if exists "recap_eleve_validation: prof crud"      on public.recap_eleve_validation;
drop policy if exists "recap_eleve_validation: parent read"    on public.recap_eleve_validation;
drop policy if exists "recap_eleve_validation: parent update"  on public.recap_eleve_validation;

-- 3. Recréer les policies proprement

create policy "recap_mensuel: prof crud" on public.recap_mensuel
  for all using (auth.uid() = prof_id) with check (auth.uid() = prof_id);

create policy "recap_mensuel: parent read" on public.recap_mensuel
  for select using (public.parent_peut_lire_recap(id));

create policy "recap_eleve_validation: prof crud" on public.recap_eleve_validation
  for all using (public.prof_owns_recap(recap_id))
  with check (public.prof_owns_recap(recap_id));

create policy "recap_eleve_validation: parent read" on public.recap_eleve_validation
  for select using (
    exists (select 1 from public.parent_eleve pe
            where pe.eleve_id = recap_eleve_validation.eleve_id
              and pe.parent_id = auth.uid())
  );

create policy "recap_eleve_validation: parent update" on public.recap_eleve_validation
  for update using (
    statut = 'en_attente_parent' and
    exists (select 1 from public.parent_eleve pe
            where pe.eleve_id = recap_eleve_validation.eleve_id
              and pe.parent_id = auth.uid())
  ) with check (
    statut = 'valide' and
    exists (select 1 from public.parent_eleve pe
            where pe.eleve_id = recap_eleve_validation.eleve_id
              and pe.parent_id = auth.uid())
  );

-- 4. Aussi la policy profiles pour voir le nom du prof
drop policy if exists "profiles: parent read prof" on public.profiles;
create policy "profiles: parent read prof" on public.profiles for select using (
  exists (
    select 1 from public.eleves e
    join public.parent_eleve pe on pe.eleve_id = e.id
    where e.prof_id = profiles.id and pe.parent_id = auth.uid()
  )
);

-- Supprimer la colonne fantôme qui n'a rien à faire là
ALTER TABLE public.recap_mensuel DROP COLUMN IF EXISTS eleve_id;


-- Supprimer l'ancienne contrainte CHECK et la recréer avec 'valide'
ALTER TABLE public.recap_eleve_validation 
  DROP CONSTRAINT IF EXISTS recap_eleve_validation_statut_check;

ALTER TABLE public.recap_eleve_validation 
  ADD CONSTRAINT recap_eleve_validation_statut_check 
  CHECK (statut IN ('en_attente_parent', 'valide', 'conteste'));

ALTER TABLE public.recap_mensuel 
  DROP CONSTRAINT IF EXISTS recap_mensuel_statut_check;

ALTER TABLE public.recap_mensuel 
  ADD CONSTRAINT recap_mensuel_statut_check 
  CHECK (statut IN ('en_cours', 'en_attente_parent', 'en_attente_paiement', 'valide'));



-- 1. On crée les fonctions "Coupe-Circuit" pour éviter la récursion
create or replace function public.parent_peut_lire_eleve(p_eleve_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.parent_eleve
    where eleve_id = p_eleve_id and parent_id = auth.uid()
  );
$$;

create or replace function public.prof_peut_lire_parent_eleve(p_eleve_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.eleves
    where id = p_eleve_id and prof_id = auth.uid()
  );
$$;

-- 2. On remplace les anciennes politiques qui causaient la boucle
drop policy if exists "eleves: parent read" on public.eleves;
create policy "eleves: parent read" on public.eleves for select using (
  public.parent_peut_lire_eleve(id)
);

drop policy if exists "parent_eleve: prof read" on public.parent_eleve;
create policy "parent_eleve: prof read" on public.parent_eleve for select using (
  public.prof_peut_lire_parent_eleve(eleve_id)
);


NOTIFY pgrst, 'reload schema';


-- ─── INTÉGRATION QONTO / URSSAF ──────────────────────────────

-- 1. Nouvelles colonnes sur recap_mensuel
ALTER TABLE public.recap_mensuel
  ADD COLUMN IF NOT EXISTS montant_total    numeric(10,2),
  ADD COLUMN IF NOT EXISTS paye_le          timestamptz;

-- Nouveau statut 'paye'
ALTER TABLE public.recap_mensuel
  DROP CONSTRAINT IF EXISTS recap_mensuel_statut_check;
ALTER TABLE public.recap_mensuel
  ADD CONSTRAINT recap_mensuel_statut_check
  CHECK (statut IN (
    'en_cours','en_attente_parent',
    'en_attente_paiement','valide','paye'
  ));

-- 2. Table des demandes de paiement URSSAF
CREATE TABLE IF NOT EXISTS public.urssaf_demandes_paiement (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  recap_id              uuid NOT NULL REFERENCES public.recap_mensuel(id) ON DELETE CASCADE,
  parent_id             uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  montant_total         numeric(10,2) NOT NULL,
  montant_reste_charge  numeric(10,2) NOT NULL,
  urssaf_demande_id     text,
  statut                text NOT NULL DEFAULT 'brouillon'
                        CHECK (statut IN (
                          'brouillon','envoyee','en_attente_parent',
                          'validee','payee','rejetee'
                        )),
  qonto_tx_id           text,
  cree_le               timestamptz NOT NULL DEFAULT now(),
  paye_le               timestamptz
);

-- 3. Table des virements URSSAF reçus (détectés par webhook Qonto)
CREATE TABLE IF NOT EXISTS public.urssaf_virements_recus (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  demande_id    uuid REFERENCES public.urssaf_demandes_paiement(id) ON DELETE SET NULL,
  qonto_tx_id   text NOT NULL UNIQUE,
  montant_cents int  NOT NULL,
  recu_le       timestamptz NOT NULL DEFAULT now(),
  dispatche     boolean NOT NULL DEFAULT false
);

-- 4. Table des virements sortants vers les profs
CREATE TABLE IF NOT EXISTS public.qonto_bulk_transfers (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  recap_id            uuid REFERENCES public.recap_mensuel(id) ON DELETE SET NULL,
  prof_id             uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  qonto_transfer_id   text,
  montant_cents       int NOT NULL,
  commission_cents    int NOT NULL DEFAULT 0,
  statut              text NOT NULL DEFAULT 'en_attente'
                      CHECK (statut IN ('en_attente','envoye','echoue')),
  execute_le          timestamptz
);

-- 5. Index
CREATE INDEX IF NOT EXISTS idx_urssaf_demandes_recap
  ON public.urssaf_demandes_paiement (recap_id);
CREATE INDEX IF NOT EXISTS idx_urssaf_demandes_statut
  ON public.urssaf_demandes_paiement (statut);
CREATE INDEX IF NOT EXISTS idx_virements_recus_dispatche
  ON public.urssaf_virements_recus (dispatche);
CREATE INDEX IF NOT EXISTS idx_bulk_transfers_prof
  ON public.qonto_bulk_transfers (prof_id);

-- 6. RLS
ALTER TABLE public.urssaf_demandes_paiement  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.urssaf_virements_recus     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qonto_bulk_transfers       ENABLE ROW LEVEL SECURITY;

-- Ces tables sont uniquement accessibles via service_role (back-end)
-- Aucune policy pour les users : le front n'y accède jamais directement


-- ─── POLICIES ADMIN 

-- 1. Supprimer la policy récursive
DROP POLICY IF EXISTS "profiles: admin read all" ON public.profiles;

-- 2. Créer une fonction coupe-circuit
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$;

-- 3. Recréer les 3 policies avec cette fonction
DROP POLICY IF EXISTS "recap_mensuel: admin read all" ON public.recap_mensuel;
DROP POLICY IF EXISTS "cours: admin read all" ON public.cours;

CREATE POLICY "profiles: admin read all" ON public.profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "recap_mensuel: admin read all" ON public.recap_mensuel
  FOR SELECT USING (public.is_admin());

CREATE POLICY "cours: admin read all" ON public.cours
  FOR SELECT USING (public.is_admin());


NOTIFY pgrst, 'reload schema';


-- ─── GRILLE COMMISSION ───────────────────────────────────────
-- multiplicateur_brut = (1 + taux_plusvalue) / 0.8185
-- Virement brut au prof = montant_brut_parent × multiplicateur_brut
-- → le prof touche net = montant_brut_parent × (1 + taux_plusvalue)

CREATE TABLE IF NOT EXISTS public.grille_commission (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tarif_palier        numeric(8,2) NOT NULL UNIQUE,
  taux_plusvalue      numeric(6,4) NOT NULL,
  multiplicateur_brut numeric(8,4) NOT NULL,
  created_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.grille_commission ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "grille_commission: read all" ON public.grille_commission;
CREATE POLICY "grille_commission: read all" ON public.grille_commission FOR SELECT USING (true);

-- Ajout de la colonne si la table existait déjà sans elle
ALTER TABLE public.grille_commission
  ADD COLUMN IF NOT EXISTS multiplicateur_brut numeric(8,4);

-- Recalcul des multiplicateurs bruts pour tous les paliers existants
UPDATE public.grille_commission
  SET multiplicateur_brut = ROUND((1 + taux_plusvalue) / 0.8185, 4);

NOTIFY pgrst, 'reload schema';
