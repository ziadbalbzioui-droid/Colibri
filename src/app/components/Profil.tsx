import { useState, useEffect } from "react";
import { User, BookOpen, CreditCard, Save, Loader2, CheckCircle2, X, Building2, AlertTriangle, ShieldCheck, ChevronRight } from "lucide-react";
import { Navigate, useNavigate } from "react-router";
import logo from "@/assets/colibri.png";
import { useAuth } from "../../lib/auth";
import { LoadingGuard } from "./LoadingGuard";

const MATIERES = [
  "Mathématiques", "Physique", "Chimie", "Français", "Anglais", "Espagnol",
  "Allemand", "Histoire-Géographie", "SES", "SVT", "NSI", "Philosophie", "Autre",
];

export function Profil() {
  const { user, profile, updateProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    etablissement: "",
    niveau_etudes: "",
    siret: "",
    adresse: "",
    iban: "",
  });

  // Matières : tableau interne, synchronisé depuis/vers la string DB
  const [matieres, setMatieres] = useState<string[]>([]);
  const [matiereInput, setMatiereInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Stripe
  const stripeConfigured = profile?.stripe_onboarding_complete === true;
  const stripePending = !!profile?.stripe_account_id && !stripeConfigured;

  useEffect(() => {
    if (profile) {
      setForm({
        prenom: profile.prenom ?? "",
        nom: profile.nom ?? "",
        email: profile.email ?? "",
        telephone: profile.telephone ?? "",
        etablissement: profile.etablissement ?? "",
        niveau_etudes: profile.niveau_etudes ?? "",
        siret: profile.siret ?? "",
        adresse: profile.adresse ?? "",
        iban: profile.iban ?? "",
      });
      const raw = profile.matieres_enseignees ?? "";
      setMatieres(raw ? raw.split(",").map((m) => m.trim()).filter(Boolean) : []);
    }
  }, [profile]);

  function addMatiere(m: string) {
    const val = m.trim();
    if (val && !matieres.includes(val)) {
      setMatieres([...matieres, val]);
    }
    setMatiereInput("");
    setShowDropdown(false);
  }

  function removeMatiere(m: string) {
    setMatieres(matieres.filter((x) => x !== m));
  }

  const suggestions = MATIERES.filter(
    (m) => !matieres.includes(m) && m.toLowerCase().includes(matiereInput.toLowerCase())
  );

  async function handleSave() {
    setSaving(true);
    try {
      const { error } = await updateProfile({
        prenom: form.prenom,
        nom: form.nom,
        telephone: form.telephone,
        etablissement: form.etablissement,
        niveau_etudes: form.niveau_etudes,
        matieres_enseignees: matieres.join(", "),
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

  function handleStripe() {
    navigate("/onboarding?step=4");
  }

  if (loading) return <LoadingGuard loading>{null}</LoadingGuard>;
  if (!user || !profile) return <Navigate to="/" replace />;

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
              <div className="relative">
                <input
                  value={matiereInput}
                  onChange={(e) => { setMatiereInput(e.target.value); setShowDropdown(true); }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && matiereInput.trim()) {
                      e.preventDefault();
                      addMatiere(matiereInput);
                    }
                  }}
                  placeholder="Ex : Mathématiques..."
                  className={inputClass}
                />
                {showDropdown && (suggestions.length > 0 || (matiereInput.trim() && !MATIERES.some((m) => m.toLowerCase() === matiereInput.toLowerCase()))) && (
                  <ul className="absolute z-10 w-full bg-white border border-border rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {suggestions.map((m) => (
                      <li
                        key={m}
                        onMouseDown={() => addMatiere(m)}
                        className="px-4 py-2.5 hover:bg-muted cursor-pointer"
                        style={{ fontSize: 13 }}
                      >
                        {m}
                      </li>
                    ))}
                    {matiereInput.trim() && !MATIERES.some((m) => m.toLowerCase() === matiereInput.toLowerCase()) && !matieres.includes(matiereInput.trim()) && (
                      <li
                        onMouseDown={() => addMatiere(matiereInput)}
                        className="px-4 py-2.5 hover:bg-muted cursor-pointer text-primary"
                        style={{ fontSize: 13 }}
                      >
                        Ajouter "{matiereInput.trim()}"
                      </li>
                    )}
                  </ul>
                )}
              </div>
              {matieres.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {matieres.map((m) => (
                    <span key={m} className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1 rounded-lg" style={{ fontSize: 13 }}>
                      {m}
                      <button type="button" onClick={() => removeMatiere(m)} className="hover:text-red-500 ml-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Informations fiscales & bancaires */}
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

            {/* Stripe Connect */}
            <div>
              <label className={labelClass} style={{ fontSize: 13 }}>Compte bancaire & Identité</label>
              {stripeConfigured ? (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                  <span className="text-green-700" style={{ fontSize: 13 }}>Compte Stripe connecté et vérifié</span>
                </div>
              ) : stripePending ? (
                <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="text-amber-700" style={{ fontSize: 13 }}>Vérification Stripe en cours — vérifiez votre email</span>
                </div>
              ) : (
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="p-4 bg-indigo-50/50 flex items-start gap-3">
                    <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium" style={{ fontSize: 13 }}>Stripe Connect Express</p>
                      <p className="text-muted-foreground mt-0.5" style={{ fontSize: 12 }}>
                        Vérification d'identité (KYC) · Renseignement de votre IBAN · Réception des paiements
                      </p>
                    </div>
                  </div>
                  <div className="px-4 py-3 border-t border-border bg-white">
                    <button
                      type="button"
                      onClick={handleStripe}
                      disabled={!profile.siret}
                      title={!profile.siret ? "Renseignez votre SIRET d'abord" : undefined}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      style={{ fontSize: 13 }}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Configurer mon compte bancaire
                    </button>
                    {!profile.siret && (
                      <p className="text-muted-foreground mt-2" style={{ fontSize: 12 }}>
                        Renseignez votre SIRET pour débloquer cette étape.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Casier judiciaire */}
            <div>
              <label className={labelClass} style={{ fontSize: 13 }}>Extrait de casier judiciaire</label>
              {(profile as any).casier_judiciaire_url ? (
                <div className="flex items-center justify-between px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    <span className="text-green-700" style={{ fontSize: 13 }}>Document déposé — en cours de vérification</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/app/profil/casier")}
                    className="text-xs text-green-600 hover:underline"
                  >
                    Modifier
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/app/profil/casier")}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-muted rounded-lg hover:bg-muted/70 transition-colors"
                  style={{ fontSize: 13 }}
                >
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Déposer mon extrait de casier judiciaire</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
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
