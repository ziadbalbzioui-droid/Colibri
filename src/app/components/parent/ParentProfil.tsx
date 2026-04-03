import { useState, useEffect } from "react";
import { User, MapPin, ShieldCheck, Save, Loader2, CheckCircle2, Baby } from "lucide-react";
import { useAuth } from "../../../lib/auth";

export function ParentProfil() {
  const { profile, updateProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    prenom_enfant: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        prenom: profile.prenom ?? "",
        nom: profile.nom ?? "",
        email: profile.email ?? "",
        telephone: profile.telephone ?? "",
        prenom_enfant: profile.prenom_enfant ?? "",
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
        prenom_enfant: form.prenom_enfant,
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

      {/* Enfant */}
      <div className="bg-white rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-5">
          <Baby className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-gray-900">Votre enfant</h3>
        </div>
        <div>
          <label className={labelClass}>Prénom de l'enfant</label>
          <input
            value={form.prenom_enfant}
            onChange={(e) => setForm({ ...form, prenom_enfant: e.target.value })}
            placeholder="Thomas"
            className={inputClass}
          />
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
          <div className="mt-4 bg-gray-50 border border-border rounded-lg px-4 py-3 text-xs text-muted-foreground">
            Complétez votre onboarding pour activer le service d'avance immédiate.
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
