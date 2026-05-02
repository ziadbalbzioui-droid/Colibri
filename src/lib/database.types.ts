export type UserRole = "prof" | "parent";
export type EleveStatut = "actif" | "en attente" | "en pause" | "terminé";
export type CoursStatut = "payé" | "en attente" | "planifié";
export type FactureStatut = "payée" | "en attente";
export type RecapStatut = "en_cours" | "en_attente_parent" | "en_attente_paiement" | "valide";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      eleves: {
        Row: Eleve;
        Insert: Omit<Eleve, "id" | "created_at">;
        Update: Partial<Omit<Eleve, "id" | "created_at" | "prof_id">>;
      };
      eleve_tags: {
        Row: EleveTag;
        Insert: Omit<EleveTag, "id">;
        Update: never;
      };
      cours: {
        Row: Cours;
        Insert: Omit<Cours, "id" | "created_at">;
        Update: Partial<Omit<Cours, "id" | "created_at" | "prof_id">>;
      };
      factures: {
        Row: Facture;
        Insert: Omit<Facture, "id" | "created_at">;
        Update: Partial<Omit<Facture, "id" | "created_at" | "prof_id">>;
      };
      lignes_facture: {
        Row: LigneFacture;
        Insert: Omit<LigneFacture, "id">;
        Update: Partial<Omit<LigneFacture, "id" | "facture_id">>;
      };
      paps_annonces: {
        Row: PapsAnnonce;
        Insert: Omit<PapsAnnonce, "id" | "created_at">;
        Update: Partial<Omit<PapsAnnonce, "id" | "created_at" | "prof_id">>;
      };
      paps_candidatures: {
        Row: PapsCandidature;
        Insert: Omit<PapsCandidature, "id" | "created_at">;
        Update: never;
      };
      parent_eleve: {
        Row: ParentEleve;
        Insert: Omit<ParentEleve, "id" | "created_at">;
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export interface Profile {
  id: string;
  role: UserRole;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  // prof-specific
  etablissement?: string;
  niveau_etudes?: string;
  matieres_enseignees?: string;
  siret?: string;
  nom_entreprise?: string;
  adresse?: string;
  iban?: string;
  // parent-specific
  prenom_enfant?: string;
  // onboarding
  onboarding_complete?: boolean;
  cgu_accepted?: boolean;
  mandat_accepted?: boolean;
  competence_accepted?: boolean;
  acceptances_at?: string;
  stripe_account_id?: string;
  stripe_onboarding_complete?: boolean;
  // parent onboarding – état civil
  civilite?: "M." | "Mme";
  nom_naissance?: string;
  nom_usage?: string;
  date_naissance?: string;
  lieu_naissance_cp?: string;
  lieu_naissance_ville?: string;
  lieu_naissance_pays?: string;
  adresse_postale?: string;
  // parent onboarding – légal
  parent_cgu_accepted?: boolean;
  parent_mandat_urssaf_accepted?: boolean;
  parent_cgu_accepted_at?: string;
  parent_mandat_accepted_at?: string;
  // parent onboarding – urssaf
  urssaf_status?: "none" | "activation_pending" | "active";
  urssaf_id?: string;
  created_at: string;
}

export interface Eleve {
  id: string;
  prof_id: string;
  nom: string;
  niveau: string;
  matiere: string;
  tarif_heure: number;
  statut: EleveStatut;
  solde: number;
  notes: string;
  telephone_eleve?: string;
  email_eleve?: string;
  adresse_eleve?: string;
  created_at: string;
}

export interface EleveTag {
  id: string;
  eleve_id: string;
  tag: string;
}

export interface Cours {
  id: string;
  prof_id: string;
  eleve_id: string;
  eleve_nom: string; // denormalised for display
  matiere: string;
  date: string; // YYYY-MM-DD
  duree: string;
  duree_heures: number;
  montant: number;
  statut: CoursStatut;
  recap_id: string | null;
  created_at: string;
}

export interface RecapMensuel {
  id: string;
  prof_id: string;
  mois: number;
  annee: number;
  statut: RecapStatut;
  created_at: string;
}

export interface RecapEleveValidation {
  id: string;
  recap_id: string;
  eleve_id: string;
  statut: "en_attente_parent" | "valide";
  created_at: string;
}

export interface Facture {
  id: string;
  prof_id: string;
  mois: string;
  date_emission: string;
  statut: FactureStatut;
  montant_brut: number;
  montant_net: number;
  created_at: string;
}

export interface LigneFacture {
  id: string;
  facture_id: string;
  eleve_nom: string;
  matiere: string;
  heures: number;
  tarif_heure: number;
}

export interface PapsCandidature {
  id: string;
  annonce_id: string;
  candidat_id: string;
  message: string;
  created_at: string;
}

export interface PapsCandidatureWithProfile extends PapsCandidature {
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
}

export interface PapsAnnonce {
  id: string;
  prof_id: string;
  prof_nom: string;
  matiere: string;
  niveau_eleve: string;
  prix: number;
  horaires: string;
  frequence: string;
  localisation: string;
  description_eleve: string;
  tags: string[];
  urgent: boolean;
  active: boolean;
  created_at: string;
}

export interface ParentEleve {
  id: string;
  parent_id: string;
  eleve_id: string;
  created_at: string;
}
