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
  code_invitation text unique default upper(substring(md5(random()::text) from 1 for 8))
);

create table if not exists public.eleve_tags (
  id        uuid primary key default uuid_generate_v4(),
  eleve_id  uuid not null references public.eleves(id) on delete cascade,
  tag       text not null,
  unique (eleve_id, tag)
);

-- ─── RECAP MENSUEL (v2) ──────────────────────────────────────
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

-- ─── TRIGGER : Auto-create profile on signup ─────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  requested_role text;
BEGIN
  requested_role := coalesce(new.raw_user_meta_data->>'role', 'prof');

  IF requested_role NOT IN ('prof', 'parent') THEN
    requested_role := 'prof';
  END IF;

  INSERT INTO public.profiles (id, role, prenom, nom, email, telephone, etablissement)
  VALUES (
    new.id,
    requested_role,
    coalesce(new.raw_user_meta_data->>'prenom', ''),
    coalesce(new.raw_user_meta_data->>'nom', ''),
    new.email,
    coalesce(new.raw_user_meta_data->>'telephone', ''),
    coalesce(new.raw_user_meta_data->>'etablissement', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

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
  v_parent_id := auth.uid();
  if v_parent_id is null then
    raise exception 'Non autorisé : Utilisateur non connecté.';
  end if;

  select id into v_eleve_id from public.eleves where code_invitation = code_secret;

  if v_eleve_id is null then
    raise exception 'Code d''invitation invalide ou introuvable.';
  end if;

  insert into public.parent_eleve (parent_id, eleve_id)
  values (v_parent_id, v_eleve_id)
  on conflict (parent_id, eleve_id) do nothing;

  return true;
end;
$$;

-- ─── TRIGGER : Validation automatique du recap_mensuel ───────
create or replace function public.check_all_parents_validated()
returns trigger as $$
begin
  if NEW.statut = 'valide' then
    if not exists (
      select 1
      from public.recap_eleve_validation
      where recap_id = NEW.recap_id
        and statut = 'en_attente_parent'
    ) then
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

-- ─── INTÉGRATION QONTO / URSSAF ──────────────────────────────

ALTER TABLE public.recap_mensuel
  ADD COLUMN IF NOT EXISTS montant_total    numeric(10,2),
  ADD COLUMN IF NOT EXISTS paye_le          timestamptz;

ALTER TABLE public.recap_mensuel
  DROP CONSTRAINT IF EXISTS recap_mensuel_statut_check;
ALTER TABLE public.recap_mensuel
  ADD CONSTRAINT recap_mensuel_statut_check
  CHECK (statut IN (
    'en_cours','en_attente_parent',
    'en_attente_paiement','valide','paye'
  ));

ALTER TABLE public.recap_eleve_validation
  DROP CONSTRAINT IF EXISTS recap_eleve_validation_statut_check;
ALTER TABLE public.recap_eleve_validation
  ADD CONSTRAINT recap_eleve_validation_statut_check
  CHECK (statut IN ('en_attente_parent', 'valide', 'conteste'));

ALTER TABLE public.recap_mensuel DROP COLUMN IF EXISTS eleve_id;

-- Table des demandes de paiement URSSAF
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

-- Table des virements URSSAF reçus
CREATE TABLE IF NOT EXISTS public.urssaf_virements_recus (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  demande_id    uuid REFERENCES public.urssaf_demandes_paiement(id) ON DELETE SET NULL,
  qonto_tx_id   text NOT NULL UNIQUE,
  montant_cents int  NOT NULL,
  recu_le       timestamptz NOT NULL DEFAULT now(),
  dispatche     boolean NOT NULL DEFAULT false
);

-- Table des virements sortants vers les profs
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

CREATE INDEX IF NOT EXISTS idx_urssaf_demandes_recap
  ON public.urssaf_demandes_paiement (recap_id);
CREATE INDEX IF NOT EXISTS idx_urssaf_demandes_statut
  ON public.urssaf_demandes_paiement (statut);
CREATE INDEX IF NOT EXISTS idx_virements_recus_dispatche
  ON public.urssaf_virements_recus (dispatche);
CREATE INDEX IF NOT EXISTS idx_bulk_transfers_prof
  ON public.qonto_bulk_transfers (prof_id);

-- Table dédiée aux admins
CREATE TABLE IF NOT EXISTS public.admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid());
$$;

-- ─── DÉNORMALISATION prof_id sur parent_eleve ────────────────
ALTER TABLE public.parent_eleve
  ADD COLUMN IF NOT EXISTS prof_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;

create or replace function public.sync_parent_eleve_prof_id()
returns trigger language plpgsql security definer as $$
begin
  select prof_id into new.prof_id from public.eleves where id = new.eleve_id;
  return new;
end;
$$;

drop trigger if exists trg_sync_parent_eleve_prof_id on public.parent_eleve;
create trigger trg_sync_parent_eleve_prof_id
  before insert or update of eleve_id on public.parent_eleve
  for each row execute function public.sync_parent_eleve_prof_id();

update public.parent_eleve pe
set prof_id = e.prof_id
from public.eleves e
where e.id = pe.eleve_id and pe.prof_id is null;

NOTIFY pgrst, 'reload schema';
