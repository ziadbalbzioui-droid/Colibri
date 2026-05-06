import { useState, useEffect } from "react";
import { User, MapPin, ShieldCheck, Save, Loader2, CheckCircle2, KeyRound, Plus, AlertCircle, Zap, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../../../lib/auth";
import { useParentData } from "../../../lib/hooks/useParentData";

export function ParentProfil() {
  const { profile, updateProfile } = useAuth();
  const { children, ajouterCode } = useParentData();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [codeLoading, setCodeLoading] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeSuccess, setCodeSuccess] = useState(false);

  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        prenom: profile.prenom ?? "",
        nom: profile.nom ?? "",
        email: profile.email ?? "",
        telephone: profile.telephone ?? "",
      });
    }
  }, [profile]);

  async function handleSave() {
    setSaving(true);
    try {
      const { error } = await updateProfile({
        prenom: form.prenom,
        nom: form.nom,
        telephone: form.telephone,
      });
      if (!error) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full px-4 py-2.5 bg-muted rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-sm";
  const labelClass = "block mb-1.5 text-xs text-muted-foreground";
  const readonlyClass = "w-full px-4 py-2.5 bg-muted/60 rounded-lg text-sm text-muted-foreground opacity-70 cursor-not-allowed";

  const urssafStatus = profile?.urssaf_status;
  const urssafLabel =
    urssafStatus === "active" ? "Actif" :
    urssafStatus === "activation_pending" ? "En attente d'activation" :
    "Non activé";
  const urssafColor =
    urssafStatus === "active" ? "bg-green-50 text-green-700 border-green-200" :
    urssafStatus === "activation_pending" ? "bg-amber-50 text-amber-700 border-amber-200" :
    "bg-gray-50 text-gray-500 border-border";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mon profil</h1>
        <p className="text-muted-foreground text-sm mt-1">Gérez vos informations personnelles</p>
      </div>

      {/* Informations personnelles */}
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-5">
          <User className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-gray-900">Informations personnelles</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Prénom</label>
              <input
                value={form.prenom}
                onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Nom</label>
              <input
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={form.email}
              disabled
              className={readonlyClass}
              title="L'email ne peut pas être modifié ici"
            />
          </div>
          <div>
            <label className={labelClass}>Téléphone</label>
            <input
              type="tel"
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              placeholder="06 12 34 56 78"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Professeurs liés */}
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-5">
          <KeyRound className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-gray-900">Professeurs & matières</h3>
        </div>

        {children.length > 0 && (
          <div className="space-y-2 mb-5">
            {children.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-4 py-3 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.nom}</p>
                  <p className="text-xs text-muted-foreground">{c.matiere} · {c.niveau}</p>
                </div>
                <span className="text-xs text-muted-foreground">{c.prof_nom}</span>
              </div>
            ))}
          </div>
        )}

        <div>
          <label className={labelClass}>Ajouter un nouveau professeur</label>
          <p className="text-xs text-muted-foreground mb-3">
            Saisissez le code d'invitation communiqué par le professeur pour lier une nouvelle matière.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCode}
              onChange={(e) => {
                setNewCode(e.target.value.replace(/\s/g, "").toUpperCase());
                setCodeError(null);
                setCodeSuccess(false);
              }}
              placeholder="CODE PROF"
              maxLength={20}
              className="flex-1 px-4 py-2.5 bg-muted rounded-lg outline-none focus:ring-2 focus:ring-primary/20 text-sm font-mono tracking-widest uppercase text-center"
            />
            <button
              onClick={async () => {
                if (!newCode.trim()) return;
                setCodeLoading(true);
                setCodeError(null);
                setCodeSuccess(false);
                try {
                  await ajouterCode(newCode);
                  setNewCode("");
                  setCodeSuccess(true);
                  setTimeout(() => setCodeSuccess(false), 3000);
                } catch (err) {
                  setCodeError(err instanceof Error ? err.message : "Erreur");
                } finally {
                  setCodeLoading(false);
                }
              }}
              disabled={!newCode.trim() || codeLoading}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg hover:bg-primary/90 disabled:opacity-40 text-sm font-medium transition-colors"
            >
              {codeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Ajouter
            </button>
          </div>
          {codeError && (
            <div className="mt-2 flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {codeError}
            </div>
          )}
          {codeSuccess && (
            <div className="mt-2 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              Professeur ajouté avec succès !
            </div>
          )}
        </div>
      </div>

      {/* État civil (lecture seule — rempli à l'onboarding) */}
      {profile?.nom_naissance && (
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-5">
            <MapPin className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-gray-900">État civil</h3>
            <span className="ml-auto text-xs text-muted-foreground">Renseigné à l'inscription</span>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Civilité</label>
                <div className={readonlyClass}>{profile.civilite ?? "—"}</div>
              </div>
              <div>
                <label className={labelClass}>Date de naissance</label>
                <div className={readonlyClass}>
                  {profile.date_naissance
                    ? new Date(profile.date_naissance).toLocaleDateString("fr-FR")
                    : "—"}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nom de naissance</label>
                <div className={readonlyClass}>{profile.nom_naissance ?? "—"}</div>
              </div>
              {profile.nom_usage && (
                <div>
                  <label className={labelClass}>Nom d'usage</label>
                  <div className={readonlyClass}>{profile.nom_usage}</div>
                </div>
              )}
            </div>
            <div>
              <label className={labelClass}>Lieu de naissance</label>
              <div className={readonlyClass}>
                {[profile.lieu_naissance_cp, profile.lieu_naissance_ville, profile.lieu_naissance_pays]
                  .filter(Boolean).join(" · ") || "—"}
              </div>
            </div>
            <div>
              <label className={labelClass}>Adresse postale</label>
              <div className={`${readonlyClass} whitespace-pre-line`}>
                {profile.adresse_postale ?? "—"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statut Urssaf */}
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-5">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-gray-900">Service d'avance immédiate</h3>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-700">Statut Urssaf</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Avance immédiate déduite directement de vos factures
            </p>
          </div>
          <span className={`text-xs font-medium px-3 py-1.5 rounded-full border ${urssafColor}`}>
            {urssafLabel}
          </span>
        </div>
        {urssafStatus === "activation_pending" && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-700">
            Votre compte Urssaf est en attente de validation. Consultez votre boîte mail pour
            finaliser l'activation.
          </div>
        )}
        {(!urssafStatus || urssafStatus === "none") && (
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-3">
              Bénéficiez de 50% de réduction directement sur chaque facture grâce au crédit d'impôt Urssaf.
            </p>
            <button
              onClick={() => navigate("/parent/activation")}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90"
            >
              <Zap className="w-4 h-4" />
              Activer le service
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : saved ? (
          <CheckCircle2 className="w-4 h-4" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        {saved ? "Enregistré !" : "Enregistrer les modifications"}
      </button>
    </div>
  );
}
