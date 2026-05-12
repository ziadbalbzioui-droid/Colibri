import { useState, useEffect } from "react";
import { User, BookOpen, CreditCard, Save, Loader2, CheckCircle2, X, AlertCircle } from "lucide-react";
import { validateIban, formatIban } from "../../../lib/validateIban";
import { Navigate, useNavigate } from "react-router";
import logo from "@/assets/colibri.svg";
import { useAuth } from "../../../lib/auth";
import { supabase } from "../../../lib/supabase";
import { LoadingGuard } from "../layout/LoadingGuard";

const MATIERES = [
  "Mathématiques", "Physique", "Chimie", "Français", "Anglais", "Espagnol",
  "Allemand", "Histoire-Géographie", "SES", "SVT", "NSI", "Philosophie", "Autre",
];

const AUTRE_ETAB = "Autre établissement d'excellence (soumis à validation)";

const S = {
  card: { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 16, boxShadow: "0 1px 3px rgba(15,23,42,.06)", padding: 24 } as React.CSSProperties,
  input: { width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid #E2E8F0", background: "#F1F5F9", fontFamily: "inherit", fontSize: 13, color: "#0F172A", outline: "none" } as React.CSSProperties,
  label: { display: "block", fontSize: 12, fontWeight: 600, color: "#334155", marginBottom: 5 } as React.CSSProperties,
  btnPrimary: { display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 12, background: "#2E6BEA", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" } as React.CSSProperties,
  sectionHeader: { display: "flex", alignItems: "center", gap: 8, marginBottom: 20 } as React.CSSProperties,
};

export function Profil() {
  const { user, profile, updateProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [ibanError, setIbanError] = useState<string | null>(null);
  const [matieres, setMatieres] = useState<string[]>([]);
  const [matiereInput, setMatiereInput] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEtabDropdown, setShowEtabDropdown] = useState(false);
  const [ecoles, setEcoles] = useState<string[]>([]);
  const [isAutreEtab, setIsAutreEtab] = useState(false);
  const [autreEtabNom, setAutreEtabNom] = useState("");

  const [form, setForm] = useState({
    prenom: "", nom: "", email: "", telephone: "",
    etablissement: "", niveau_etudes: "", siret: "", adresse: "", iban: "",
  });

  useEffect(() => {
    supabase.from("ecoles").select("nom").eq("active", true).order("ordre")
      .then(({ data }) => { if (data) setEcoles(data.map((e) => e.nom)); });
  }, []);

  useEffect(() => {
    if (profile) {
      setForm({
        prenom: profile.prenom ?? "", nom: profile.nom ?? "", email: profile.email ?? "",
        telephone: profile.telephone ?? "", etablissement: profile.etablissement ?? "",
        niveau_etudes: profile.niveau_etudes ?? "", siret: profile.siret ?? "",
        adresse: profile.adresse ?? "", iban: profile.iban ?? "",
      });
      const raw = profile.matieres_enseignees ?? "";
      setMatieres(raw ? raw.split(",").map((m) => m.trim()).filter(Boolean) : []);
    }
  }, [profile]);

  useEffect(() => {
    if (profile && ecoles.length > 0) {
      const etab = profile.etablissement ?? "";
      if (etab && !ecoles.includes(etab)) {
        setIsAutreEtab(true);
        setAutreEtabNom(etab);
      }
    }
  }, [profile, ecoles]);

  function addMatiere(m: string) {
    const val = m.trim();
    if (val && !matieres.includes(val)) setMatieres([...matieres, val]);
    setMatiereInput(""); setShowDropdown(false);
  }
  function removeMatiere(m: string) { setMatieres(matieres.filter((x) => x !== m)); }

  const suggestions = MATIERES.filter((m) => !matieres.includes(m) && m.toLowerCase().includes(matiereInput.toLowerCase()));

  async function handleSave() {
    if (form.iban) {
      const err = validateIban(form.iban);
      if (err) { setIbanError(err); return; }
    }
    setIbanError(null);
    setSaving(true);
    try {
      const finalEtab = isAutreEtab ? autreEtabNom : form.etablissement;
      const { error } = await updateProfile({ prenom: form.prenom, nom: form.nom, telephone: form.telephone, etablissement: finalEtab, niveau_etudes: form.niveau_etudes, matieres_enseignees: matieres.join(", "), siret: form.siret, adresse: form.adresse, iban: form.iban });
      if (!error) {
        if (isAutreEtab && autreEtabNom.trim()) {
          await supabase.from("ecoles_demandes").insert({ prof_id: user!.id, email_prof: form.email, prenom_prof: form.prenom, nom_prof: form.nom, nom_propose: autreEtabNom.trim() });
        }
        setSaved(true); setTimeout(() => setSaved(false), 2500);
      }
    } finally { setSaving(false); }
  }

  if (loading) return <LoadingGuard loading>{null}</LoadingGuard>;
  if (!user || !profile) return <Navigate to="/" replace />;

  return (
    <div style={{ maxWidth: 680, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: "#DBEAFE", overflow: "hidden", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <img src={logo} alt="Colibri" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-.02em", color: "#0F172A" }}>Mon profil</h1>
        <p style={{ color: "#64748B", marginTop: 6, fontSize: 13 }}>Gérez vos informations personnelles et fiscales</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Informations personnelles */}
        <div style={S.card}>
          <div style={S.sectionHeader}>
            <User style={{ width: 16, height: 16, color: "#2E6BEA" }} />
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Informations personnelles</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div><label style={S.label}>Prénom</label><input style={S.input} value={form.prenom} onChange={(e) => setForm({ ...form, prenom: e.target.value })} /></div>
            <div><label style={S.label}>Nom</label><input style={S.input} value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} /></div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={S.label}>Email</label>
            <input style={{ ...S.input, opacity: 0.6, cursor: "not-allowed" }} value={form.email} disabled title="L'email ne peut pas être modifié ici" />
          </div>
          <div>
            <label style={S.label}>Téléphone</label>
            <input type="tel" style={S.input} value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} placeholder="06 12 34 56 78" />
          </div>
        </div>

        {/* Informations académiques */}
        <div style={S.card}>
          <div style={S.sectionHeader}>
            <BookOpen style={{ width: 16, height: 16, color: "#2E6BEA" }} />
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Informations académiques</h2>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={S.label}>Établissement</label>
            <div style={{ position: "relative" }}>
              {!isAutreEtab ? (
                <>
                  <input style={S.input} value={form.etablissement}
                    onChange={(e) => { setForm({ ...form, etablissement: e.target.value }); setShowEtabDropdown(true); }}
                    onFocus={() => setShowEtabDropdown(true)}
                    onBlur={() => setTimeout(() => setShowEtabDropdown(false), 150)}
                    placeholder="Rechercher un établissement..." />
                  {showEtabDropdown && (
                    <ul style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, boxShadow: "0 4px 16px rgba(15,23,42,.08)", zIndex: 10, maxHeight: 240, overflowY: "auto", padding: 0, margin: 0 }}>
                      {ecoles.filter((e) => e.toLowerCase().includes(form.etablissement.toLowerCase())).map((e) => (
                        <li key={e} onMouseDown={() => { setForm({ ...form, etablissement: e }); setShowEtabDropdown(false); }}
                          style={{ padding: "10px 14px", fontSize: 13, cursor: "pointer", listStyle: "none", color: "#0F172A" }}
                          onMouseEnter={(ev) => (ev.currentTarget.style.background = "#F1F5F9")} onMouseLeave={(ev) => (ev.currentTarget.style.background = "")}>
                          {e}
                        </li>
                      ))}
                      <li onMouseDown={() => { setIsAutreEtab(true); setShowEtabDropdown(false); setForm({ ...form, etablissement: "" }); }}
                        style={{ padding: "10px 14px", fontSize: 13, cursor: "pointer", listStyle: "none", color: "#92400E", borderTop: "1px solid #E2E8F0" }}
                        onMouseEnter={(ev) => (ev.currentTarget.style.background = "#FFFBEB")} onMouseLeave={(ev) => (ev.currentTarget.style.background = "")}>
                        {AUTRE_ETAB}
                      </li>
                    </ul>
                  )}
                </>
              ) : (
                <div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                    <input style={{ ...S.input, borderColor: "#F59E0B", background: "#FFFBEB", flex: 1 }}
                      value={autreEtabNom}
                      onChange={(e) => setAutreEtabNom(e.target.value)}
                      placeholder="Nom de votre établissement..." />
                    <button type="button" onClick={() => { setIsAutreEtab(false); setAutreEtabNom(""); setForm({ ...form, etablissement: "" }); }}
                      style={{ padding: "10px 14px", borderRadius: 12, background: "#F1F5F9", border: "1px solid #E2E8F0", cursor: "pointer", fontSize: 12, color: "#64748B", fontWeight: 600 }}>
                      Annuler
                    </button>
                  </div>
                  <p style={{ fontSize: 11, color: "#92400E", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 8, padding: "6px 10px", margin: 0 }}>
                    Votre établissement sera soumis à validation. Vous pouvez continuer à utiliser l'application normalement.
                  </p>
                </div>
              )}
            </div>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={S.label}>Niveau d'études</label>
            <select style={S.input} value={form.niveau_etudes} onChange={(e) => setForm({ ...form, niveau_etudes: e.target.value })}>
              <option value="">— Sélectionner —</option>
              {["Licence 1", "Licence 2", "Licence 3", "Master 1", "Master 2", "Doctorat"].map((n) => <option key={n}>{n}</option>)}
            </select>
          </div>
          <div>
            <label style={S.label}>Matières enseignées</label>
            <div style={{ position: "relative" }}>
              <input style={{ ...S.input, marginBottom: 8 }} value={matiereInput}
                onChange={(e) => { setMatiereInput(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                onKeyDown={(e) => { if (e.key === "Enter" && matiereInput.trim()) { e.preventDefault(); addMatiere(matiereInput); } }}
                placeholder="Ex : Mathématiques..." />
              {showDropdown && (suggestions.length > 0 || (matiereInput.trim() && !MATIERES.some((m) => m.toLowerCase() === matiereInput.toLowerCase()))) && (
                <ul style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, boxShadow: "0 4px 16px rgba(15,23,42,.08)", zIndex: 10, maxHeight: 192, overflowY: "auto" }}>
                  {suggestions.map((m) => (
                    <li key={m} onMouseDown={() => addMatiere(m)} style={{ padding: "10px 14px", fontSize: 13, cursor: "pointer", listStyle: "none", color: "#0F172A" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#F1F5F9")} onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                      {m}
                    </li>
                  ))}
                  {matiereInput.trim() && !MATIERES.some((m) => m.toLowerCase() === matiereInput.toLowerCase()) && !matieres.includes(matiereInput.trim()) && (
                    <li onMouseDown={() => addMatiere(matiereInput)} style={{ padding: "10px 14px", fontSize: 13, cursor: "pointer", listStyle: "none", color: "#2E6BEA" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#F1F5F9")} onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                      Ajouter "{matiereInput.trim()}"
                    </li>
                  )}
                </ul>
              )}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {matieres.map((m) => (
                <span key={m} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: "#EFF6FF", color: "#1E3A8A", cursor: "default" }}>
                  {m}
                  <button type="button" onClick={() => removeMatiere(m)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#1E3A8A" }}><X style={{ width: 10, height: 10 }} /></button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Informations fiscales */}
        <div style={S.card}>
          <div style={S.sectionHeader}>
            <CreditCard style={{ width: 16, height: 16, color: "#2E6BEA" }} />
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Informations fiscales &amp; bancaires</h2>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={S.label}>SIRET (auto-entrepreneur)</label>
            <input style={S.input} value={form.siret} onChange={(e) => setForm({ ...form, siret: e.target.value })} placeholder="123 456 789 00012" />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={S.label}>IBAN</label>
            <input
              style={{ ...S.input, fontFamily: "monospace", letterSpacing: "0.05em", textTransform: "uppercase", borderColor: ibanError ? "#EF4444" : undefined }}
              value={form.iban}
              onChange={(e) => { setForm({ ...form, iban: formatIban(e.target.value) }); setIbanError(null); }}
              placeholder="FR76 3000 6000 0112 3456 7890 189"
              maxLength={42}
            />
            {ibanError && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 11, color: "#EF4444" }}>
                <AlertCircle style={{ width: 12, height: 12 }} />
                {ibanError}
              </div>
            )}
            {!ibanError && form.iban && !validateIban(form.iban) && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, fontSize: 11, color: "#059669" }}>
                <CheckCircle2 style={{ width: 12, height: 12 }} />
                IBAN valide
              </div>
            )}
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={S.label}>Pièce d'identité</label>
            {profile.carte_identite_url ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#ECFDF5", border: "1px solid #BBF7D0", borderRadius: 10, fontSize: 13 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircle2 style={{ width: 16, height: 16, color: "#059669" }} />
                  <span style={{ color: "#059669", fontWeight: 600 }}>Document déposé — en cours de vérification</span>
                </div>
                <button onClick={() => navigate("/app/profil/identite")} style={{ fontSize: 11, color: "#059669", background: "none", border: "none", cursor: "pointer" }}>Modifier</button>
              </div>
            ) : (
              <button onClick={() => navigate("/app/profil/identite")} style={{ ...S.btnPrimary, fontSize: 12 }}>Déposer le document</button>
            )}
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={S.label}>Extrait de casier judiciaire</label>
            {profile.casier_judiciaire_url ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#ECFDF5", border: "1px solid #BBF7D0", borderRadius: 10, fontSize: 13 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <CheckCircle2 style={{ width: 16, height: 16, color: "#059669" }} />
                  <span style={{ color: "#059669", fontWeight: 600 }}>Document déposé — en cours de vérification</span>
                </div>
                <button onClick={() => navigate("/app/profil/casier")} style={{ fontSize: 11, color: "#059669", background: "none", border: "none", cursor: "pointer" }}>Modifier</button>
              </div>
            ) : (
              <button onClick={() => navigate("/app/profil/casier")} style={{ ...S.btnPrimary, fontSize: 12 }}>Déposer le document</button>
            )}
          </div>
          <div>
            <label style={S.label}>Adresse postale</label>
            <input style={S.input} value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} placeholder="12 rue de la Paix, 75001 Paris" />
          </div>
        </div>

        {/* Save */}
        <button onClick={handleSave} disabled={saving} style={{ ...S.btnPrimary, justifyContent: "center", padding: "13px", width: "100%", fontSize: 14 }}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Enregistré !" : "Enregistrer les modifications"}
        </button>
      </div>
    </div>
  );
}
