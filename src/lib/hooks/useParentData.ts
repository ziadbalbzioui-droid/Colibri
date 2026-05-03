import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";
import { useAuth } from "../auth";
import type { CoursRow } from "./useCours";
import type { FactureRow } from "./useFactures";
import type { RecapEleveValidationRow } from "./useRecapMensuel";

export interface ValidationWithRecap {
  id: string;
  recap_id: string;
  eleve_id: string;
  statut: "en_attente_parent" | "valide" | "conteste";
  recap_mensuel: { id: string; mois: number; annee: number; statut: string };
}

export interface ChildInfo {
  id: string;
  nom: string;
  niveau: string;
  matiere: string;
  prof_id: string;
  prof_nom: string;
}

export function useParentData() {
  const { user, profile, loading: authLoading } = useAuth();
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [cours, setCours] = useState<CoursRow[]>([]);
  const [factures, setFactures] = useState<FactureRow[]>([]);
  const [validations, setValidations] = useState<ValidationWithRecap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (staleCheck?: () => boolean) => {
    if (!user) { setLoading(false); return; }
    setError(null);
    setLoading(true);

    try {
      // ── Étape 1 : Récupérer les élèves (SANS embed profiles, pour éviter les erreurs RLS) ──
      const { data: elevesRaw, error: ee } = await supabase
        .from("eleves")
        .select("*");
      if (ee) throw ee;

      const elevesData = (elevesRaw ?? []) as unknown as Array<{
        id: string; nom: string; niveau: string; matiere: string; prof_id: string;
      }>;

      if (elevesData.length === 0) {
        if (!staleCheck?.()) {
          setChildren([]); setCours([]); setFactures([]); setValidations([]); setLoading(false);
        }
        return;
      }

      const eleveIds = elevesData.map((e) => e.id);
      const profIds = [...new Set(elevesData.map((e) => e.prof_id))];

      // ── Étape 2 : Récupérer les profils des profs + cours + recaps en parallèle ──
      const [profsResult, coursResult, validationsResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, prenom, nom")
          .in("id", profIds),
        supabase
          .from("cours")
          .select("*")
          .in("eleve_id", eleveIds)
          .order("date", { ascending: false }),
        // On ne fait PAS d'embed recap_mensuel ici — cela déclencherait une récursion
        // infinie dans le RLS (recap_mensuel: parent read → recap_eleve_validation → ...).
        // On fait deux requêtes séparées et on merge en mémoire.
        supabase
          .from("recap_eleve_validation")
          .select("*")
          .in("eleve_id", eleveIds),
      ]);

      if (profsResult.error) console.warn("[useParentData] profiles error:", profsResult.error);
      if (coursResult.error) throw coursResult.error;
      if (validationsResult.error) throw validationsResult.error;

      // Construire le map prof_id → nom
      const profMap = new Map<string, string>();
      ((profsResult.data ?? []) as unknown as Array<{ id: string; prenom: string; nom: string }>)
        .forEach((p) => profMap.set(p.id, `${p.prenom} ${p.nom}`));

      const childrenList: ChildInfo[] = elevesData.map((e) => ({
        id: e.id,
        nom: e.nom,
        niveau: e.niveau,
        matiere: e.matiere,
        prof_id: e.prof_id,
        prof_nom: profMap.get(e.prof_id) ?? "Professeur",
      }));

      // Récupérer les recap_mensuel séparément pour éviter la récursion RLS
      const validationsRaw = (validationsResult.data ?? []) as Array<{ id: string; recap_id: string; eleve_id: string; statut: string }>;
      const recapIds = [...new Set(validationsRaw.map((v) => v.recap_id))];

      let recapMap = new Map<string, { id: string; mois: number; annee: number; statut: string }>();
      if (recapIds.length > 0) {
        const { data: recapsData, error: re } = await supabase
          .from("recap_mensuel")
          .select("id, mois, annee, statut")
          .in("id", recapIds);
        if (re) throw re;
        (recapsData ?? []).forEach((r: any) => recapMap.set(r.id, r));
      }

      const validationsWithRecap: ValidationWithRecap[] = validationsRaw.map((v) => ({
        id: v.id,
        recap_id: v.recap_id,
        eleve_id: v.eleve_id,
        statut: v.statut as "en_attente_parent" | "valide" | "conteste",
        recap_mensuel: recapMap.get(v.recap_id) ?? { id: v.recap_id, mois: 0, annee: 0, statut: "en_cours" },
      }));

      if (!staleCheck?.()) {
        setChildren(childrenList);
        setCours(coursResult.data ?? []);
        setValidations(validationsWithRecap);
      }

      // ── Étape 3 : Factures (séparé car peut échouer si pas de policy parent) ──
      try {
        const { data: facturesData } = await supabase
          .from("factures")
          .select("*, lignes_facture(*)")
          .in("prof_id", profIds)
          .order("date_emission", { ascending: false });

        if (!staleCheck?.()) {
          setFactures((facturesData ?? []).map((f: any) => ({ ...f, lignes: f.lignes_facture })));
        }
      } catch {
        // Les factures ne sont pas critiques — on continue sans
        if (!staleCheck?.()) setFactures([]);
      }

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur chargement données";
      console.error("[useParentData]", msg, err);
      if (!staleCheck?.()) setError(msg);
    } finally {
      if (!staleCheck?.()) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (authLoading) return;
    let stale = false;
    load(() => stale);
    return () => { stale = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id]);

  const payFacture = async (id: string) => {
    const { error } = await supabase.from("factures").update({ statut: "payée" }).eq("id", id);
    if (error) throw error;
    setFactures((prev) => prev.map((f) => f.id === id ? { ...f, statut: "payée" } : f));
  };

  const validerRecap = async (validationId: string, _recapId: string) => {
    // Le parent met la ligne à 'valide'. Le trigger SQL gère la suite.
    console.log("[validerRecap] Tentative validation:", { validationId, _recapId });

    const { data, error: valErr, status } = await (supabase
      .from("recap_eleve_validation") as any)
      .update({ statut: "valide" })
      .eq("id", validationId)
      .select();

    console.log("[validerRecap] Résultat:", { data, error: valErr, status });

    if (valErr) throw valErr;

    setValidations((prev) =>
      prev.map((v) => v.id === validationId ? { ...v, statut: "valide" } : v)
    );
  };

  const contesterRecap = async (
    validationId: string,
    contestations: Array<{ cours_id: string; raison: string }>
  ) => {
    const { error } = await (supabase as any)
      .from("recap_eleve_validation")
      .update({ statut: "conteste" })
      .eq("id", validationId);
    if (error) throw error;

    if (contestations.length > 0) {
      const { error: ce } = await (supabase as any)
        .from("contestation_cours")
        .insert(contestations.map((c) => ({
          validation_id: validationId,
          cours_id: c.cours_id,
          raison: c.raison,
        })));
      if (ce) console.warn("[contesterRecap] contestation_cours:", ce.message);

      await supabase
        .from("cours")
        .update({ statut: "contesté" })
        .in("id", contestations.map((c) => c.cours_id));
    }

    setValidations((prev) =>
      prev.map((v) => v.id === validationId ? { ...v, statut: "conteste" as const } : v)
    );
  };

  const ajouterCode = async (code: string) => {
    const { error } = await (supabase as any).rpc("lier_parent_eleve", { code_secret: code.trim().toUpperCase() });
    if (error) throw new Error("Code invalide ou déjà utilisé. Vérifiez avec votre professeur.");
    await load();
  };

  // Compat: expose `child` as first child
  const child = children.length > 0 ? children[0] : null;

  return { child, children, cours, factures, validations, loading, error, reload: load, payFacture, validerRecap, contesterRecap, ajouterCode, profile };
}
