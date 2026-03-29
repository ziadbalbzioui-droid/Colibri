import { useState, useEffect } from "react";
import { User, BookOpen, CreditCard, Save, Loader2, CheckCircle2 } from "lucide-react";
import logo from "@/assets/colibri.png";
import { useAuth } from "../../lib/auth";

export function Profil() {
  const { profile, updateProfile, loading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    etablissement: "",
    niveau_etudes: "",
    matieres_enseignees: "",
    siret: "",
    adresse: "",
    iban: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        prenom: profile.prenom ?? "",
        nom: profile.nom ?? "",
        email: profile.email ?? "",
        telephone: profile.telephone ?? "",
        etablissement: profile.etablissement ?? "",
        niveau_etudes: profile.niveau_etudes ?? "",
        matieres_enseignees: profile.matieres_enseignees ?? "",
        siret: profile.siret ?? "",
        adresse: profile.adresse ?? "",
        iban: profile.iban ?? "",
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
        etablissement: form.etablissement,
        niveau_etudes: form.niveau_etudes,
        matieres_enseignees: form.matieres_enseignees,
        siret: form.siret,
        adresse: form.adresse,
        iban: form.iban,
      });
      if (!error) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Chargement...
      </div>
    );
  }

  const inputClass = "w-full px-4 py-2.5 bg-muted rounded-lg outline-none focus:ring-2 focus:ring-primary/20";
  const labelClass = "block mb-1.5 text-muted-foreground";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <img src={logo} alt="Colibri" className="w-14 h-14 mx-auto mb-4 rounded-xl" />
        <h1>Mon profil</h1>
        <p className="text-muted-foreground mt-1">Gérez vos informations personnelles et fiscales</p>
      </div>

      <div className="space-y-6">
        {/* Informations personnelles */}
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-5">
            <User className="w-4 h-4 text-primary" />
            <h3>Informations personnelles</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass} style={{ fontSize: 13 }}>Prénom</label>
                <input
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} style={{ fontSize: 13 }}>Nom</label>
                <input
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass} style={{ fontSize: 13 }}>Email</label>
              <input
                type="email"
                value={form.email}
                disabled
                className={`${inputClass} opacity-60 cursor-not-allowed`}
                title="L'email ne peut pas être modifié ici"
              />
            </div>
            <div>
              <label className={labelClass} style={{ fontSize: 13 }}>Téléphone</label>
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

        {/* Informations académiques */}
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-5">
            <BookOpen className="w-4 h-4 text-primary" />
            <h3>Informations académiques</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className={labelClass} style={{ fontSize: 13 }}>Établissement</label>
              <input
                value={form.etablissement}
                onChange={(e) => setForm({ ...form, etablissement: e.target.value })}
                placeholder="Université Paris-Saclay"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} style={{ fontSize: 13 }}>Niveau d'études</label>
              <select
                value={form.niveau_etudes}
                onChange={(e) => setForm({ ...form, niveau_etudes: e.target.value })}
                className={inputClass}
              >
                <option value="">— Sélectionner —</option>
                <option>Licence 1</option>
                <option>Licence 2</option>
                <option>Licence 3</option>
                <option>Master 1</option>
                <option>Master 2</option>
                <option>Doctorat</option>
              </select>
            </div>
            <div>
              <label className={labelClass} style={{ fontSize: 13 }}>Matières enseignées</label>
              <input
                value={form.matieres_enseignees}
                onChange={(e) => setForm({ ...form, matieres_enseignees: e.target.value })}
                placeholder="Mathématiques, Physique..."
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Informations fiscales */}
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-5">
            <CreditCard className="w-4 h-4 text-primary" />
            <h3>Informations fiscales & bancaires</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className={labelClass} style={{ fontSize: 13 }}>SIRET (auto-entrepreneur)</label>
              <input
                value={form.siret}
                onChange={(e) => setForm({ ...form, siret: e.target.value })}
                placeholder="123 456 789 00012"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} style={{ fontSize: 13 }}>IBAN</label>
              <input
                value={form.iban}
                onChange={(e) => setForm({ ...form, iban: e.target.value })}
                placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} style={{ fontSize: 13 }}>Adresse postale</label>
              <input
                value={form.adresse}
                onChange={(e) => setForm({ ...form, adresse: e.target.value })}
                placeholder="12 rue de la Paix, 75001 Paris"
                className={inputClass}
              />
            </div>
          </div>
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
    </div>
  );
}
