import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  GraduationCap, Users, Eye, EyeOff, ArrowRight,
  ChevronLeft, Loader2, MailCheck, ShieldCheck, HeartHandshake, CheckCircle2, Calculator, Check, Quote
} from "lucide-react";
import logo from "@/assets/colibri.png";
import { useAuth } from "../../lib/auth";

type Role = "prof" | "parent" | null;
type AuthMode = "connexion" | "inscription";

export function Welcome() {
  const [role, setRole] = useState<Role>(null);
  const [mode, setMode] = useState<AuthMode>("connexion");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [telephone, setTelephone] = useState("");
  const [etablissement, setEtablissement] = useState("");
  const [prenomEnfant, setPrenomEnfant] = useState("");

  const [simHeures, setSimHeures] = useState<number>(12);
  const [simTarif, setSimTarif] = useState<number>(28);

  const [searchParams] = useSearchParams();
  const codeFromUrl = searchParams.get("code") ?? "";
  const roleFromUrl = searchParams.get("role") as Role | null;

  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, user, profile, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user && profile && !emailSent) {
      if (profile.role === "parent") {
        navigate("/parent", { replace: true });
      } else if (!profile.onboarding_complete) {
        navigate("/onboarding", { replace: true });
      } else {
        navigate("/app", { replace: true });
      }
    }
  }, [user, profile, authLoading, emailSent, navigate]);

  useEffect(() => {
    if (roleFromUrl === "parent" || roleFromUrl === "prof") {
      setRole(roleFromUrl);
      setMode("inscription");
    }
    if (codeFromUrl) {
      sessionStorage.setItem("colibri_parent_code", codeFromUrl);
    }
  }, [roleFromUrl, codeFromUrl]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (mode === "connexion") {
        const { error } = await signIn(email, password);
        if (error) { setErrorMsg(error); return; }
      } else {
        if (password !== confirmPassword) {
          setErrorMsg("Les mots de passe ne correspondent pas.");
          return;
        }
        const codeProf = codeFromUrl || sessionStorage.getItem("colibri_parent_code") || "";

        const extra = role === "parent"
          ? { prenom_enfant: prenomEnfant , code_invitation: codeProf }
          : { telephone, etablissement };
        const { error } = await signUp(email, password, role!, prenom, nom, extra);
        if (error) { setErrorMsg(error); return; }
        setEmailSent(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStart = (selectedRole: Role) => {
    setRole(selectedRole);
    setMode("inscription");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const revenuActuel = simHeures * simTarif;
  const revenuColibri = Math.round(revenuActuel * 1.28); 

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans text-gray-900">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setRole(null); setEmailSent(false); }}>
          <img src={logo} alt="Colibri" className="w-10 h-10 rounded-xl shadow-sm" />
          <span className="text-xl font-extrabold tracking-tight">Colibri</span>
        </div>
        <div className="flex items-center gap-6">
          {!role && (
            <>
              <button onClick={() => handleStart("prof")} className="hidden md:block text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
                Devenir Mentor
              </button>
              <button 
                onClick={() => { setRole("prof"); setMode("connexion"); }} 
                className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-blue-500/20"
              >
                Espace Connexion
              </button>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {!role ? (
          <div className="w-full animate-in fade-in duration-700">
            
            {/* HERO SECTION */}
            <section className="relative px-6 pt-16 pb-24 overflow-hidden bg-gradient-to-br from-blue-50 via-[#F0F7FF] to-white">
              <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
                <div className="space-y-8">
                  <div className="inline-flex items-center gap-2 bg-white border border-blue-100 rounded-full px-4 py-1.5 text-xs font-bold text-blue-800 shadow-sm">
                    <ShieldCheck className="w-4 h-4 text-blue-600" /> Agrément d'État : Services à la personne
                  </div>
                  <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1]">
                    L'élite de l'enseignement. <br />
                    <span className="text-blue-600">Le cadre légal en plus.</span>
                  </h1>
                  <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
                    Colibri connecte les familles exigeantes aux brillants étudiants des Grandes Écoles. Notre plateforme active instantanément les aides de l'État : les parents divisent leurs coûts par deux, les mentors maximisent leurs revenus.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 pt-2">
                    <button onClick={() => handleStart("prof")} className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2">
                      Je donne des cours
                    </button>
                    <button onClick={() => handleStart("parent")} className="bg-white border-2 border-gray-200 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                      Je cherche un mentor
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
                    <div>
                      <p className="text-2xl font-extrabold text-gray-900">100%</p>
                      <p className="text-xs text-gray-500 font-medium">Déclaré et assuré</p>
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold text-gray-900">-50%</p>
                      <p className="text-xs text-gray-500 font-medium">Sur la facture parent</p>
                    </div>
                    <div>
                      <p className="text-2xl font-extrabold text-gray-900">48h</p>
                      <p className="text-xs text-gray-500 font-medium">Versement garanti</p>
                    </div>
                  </div>
                </div>

                {/* SIMULATOR */}
                <div className="relative bg-white rounded-3xl p-8 border border-gray-100 shadow-xl">
                  <h3 className="text-2xl font-bold mb-4">Simulez votre potentiel</h3>
                  <p className="text-gray-500 mb-8">Découvrez combien vous pourriez réellement percevoir en sortant de l'économie souterraine.</p>
                  
                  <div className="space-y-6 mb-8">
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="font-semibold text-sm">Volume mensuel estimé</label>
                      </div>
                      <input 
                        type="number" value={simHeures} 
                        onChange={(e) => setSimHeures(Number(e.target.value))}
                        className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-blue-500 font-medium"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="font-semibold text-sm">Tarif de base souhaité</label>
                        <span className="font-bold">{simTarif} € / h</span>
                      </div>
                      <input 
                        type="range" min="15" max="80" step="1" value={simTarif} 
                        onChange={(e) => setSimTarif(Number(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100 text-center mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-sm font-semibold text-gray-500 block">Travail dissimulé</span>
                        <span className="text-2xl font-bold text-gray-400 line-through">{revenuActuel} €</span>
                      </div>
                      <ArrowRight className="text-blue-400 w-5 h-5" />
                      <div>
                        <span className="text-sm font-semibold text-gray-600 block">Légal avec Colibri</span>
                        <span className="text-2xl font-extrabold text-green-600">{revenuColibri} €*</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">*Estimation nette après cotisations Urssaf (avec dispositif ACRE). Vous validez également vos trimestres de retraite.</p>
                  </div>

                  <button onClick={() => handleStart("prof")} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors">
                    Calculer ma situation exacte
                  </button>
                </div>
              </div>
            </section>

            {/* SECTION 2: LA MÉCANIQUE FISCALE */}
            <section className="py-20 px-6 bg-white border-t border-gray-100">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold mb-4 text-gray-900">La mécanique fiscale à votre service</h2>
                <p className="text-gray-600 mb-12 max-w-3xl leading-relaxed">Arrêtez de choisir entre facturer cher et rester accessible. Notre agrément d'État transforme la donne : l'avantage fiscal absorbe la différence pour que les familles économisent pendant que vous prospérez.</p>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xl mb-6">1</div>
                    <h3 className="text-xl font-bold mb-3">La magie des -50%</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">Les cours à domicile sont soutenus par l'État. Chaque prestation facturée via Colibri permet à la famille de diviser immédiatement son reste à charge par deux.</p>
                  </div>
                  <div className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xl mb-6">2</div>
                    <h3 className="text-xl font-bold mb-3">L'Avance de l'Urssaf</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">Fini l'attente des déclarations d'impôts annuelles. La subvention de l'État est appliquée à la source. Les parents ne décaisent que leur part réelle.</p>
                  </div>
                  <div className="bg-blue-50 p-8 rounded-2xl border border-blue-100">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xl mb-6">
                      <HeartHandshake className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-blue-900">Redistribution Éthique</h3>
                    <p className="text-blue-800 text-sm leading-relaxed">Notre modèle est unique : nous réduisons nos frais sur les tarifs premium pour sur-financer les cours plus abordables (jusqu'à +40% de boost). L'excellence devient inclusive.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 3: EXEMPLE CONCRET */}
            <section className="py-20 px-6 bg-[#FAFAFA]">
              <div className="max-w-5xl mx-auto bg-white rounded-3xl p-10 md:p-14 shadow-sm border border-gray-200">
                <h2 className="text-3xl font-bold mb-8">La démonstration mathématique</h2>
                <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
                  <p>
                    <span className="font-semibold text-gray-900">Le piège du travail au noir :</span> Vous facturez 100 €. Le parent paie 100 €. Vous n'avez aucune couverture, aucune preuve de revenus pour votre futur appartement, et aucun droit à la retraite.
                  </p>
                  <p>
                    <span className="font-semibold text-blue-600">L'optimisation Colibri :</span> Vous fixez votre facture à <strong>200 €</strong>. Grâce à notre système branché à l'Urssaf, l'État prend instantanément 100 € à sa charge. <strong>Le parent ne paie toujours que 100 €</strong>.
                  </p>
                  <p>
                    Nous encaissons les 200 €, réglons vos cotisations d'auto-entrepreneur et nos frais réduits. Il vous reste environ <strong>128 € nets</strong> (avec l'ACRE). Vous avez généré 28 € de bénéfice pur, en toute légalité, avec le même budget familial.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 4: PAR OÙ COMMENCER */}
            <section className="py-24 px-6 bg-white">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold mb-16 text-center">Votre activité structurée en 3 étapes</h2>
                
                <div className="grid md:grid-cols-3 gap-10">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 text-gray-900 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-6">1</div>
                    <h3 className="text-xl font-bold mb-3">Validation du profil</h3>
                    <p className="text-gray-600 text-sm">Créez votre compte. Nous vérifions votre parcours (Grande École, diplômes) pour garantir l'excellence à notre réseau de parents.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 text-gray-900 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-6">2</div>
                    <h3 className="text-xl font-bold mb-3">Activation légale</h3>
                    <p className="text-gray-600 text-sm">Notre interface vous guide pour obtenir votre numéro SIRET et vous connecter aux services de l'Urssaf en quelques clics.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-6">3</div>
                    <h3 className="text-xl font-bold mb-3">Enseignez l'esprit libre</h3>
                    <p className="text-gray-600 text-sm">Concentrez-vous sur la pédagogie. Saisissez vos heures, nous automatisons la facturation et les encaissements.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 5: POURQUOI PASSER AU LÉGAL */}
            <section className="py-20 px-6 bg-[#FAFAFA] border-t border-gray-100 pb-32">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold mb-10">Fini le bricolage. Devenez professionnel.</h2>
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                      <Check className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-3">Dossier locatif en béton</h3>
                    <p className="text-gray-600 text-sm">Fini le cash introuvable. Vos revenus sont tracés et déclarés, parfaits pour justifier de vos ressources auprès d'une agence immobilière.</p>
                  </div>
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                      <Check className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-3">Capital Retraite</h3>
                    <p className="text-gray-600 text-sm">Ne travaillez pas dans le vide pendant vos études. Votre activité valide officiellement des trimestres pour votre retraite future.</p>
                  </div>
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                      <Check className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-lg mb-3">Zéro friction de paiement</h3>
                    <p className="text-gray-600 text-sm">N'ayez plus jamais à réclamer votre argent à la fin du mois. La plateforme prélève les familles automatiquement après chaque session.</p>
                  </div>
                </div>

                <div className="bg-blue-600 rounded-2xl p-10 flex flex-col md:flex-row items-center justify-between shadow-xl">
                  <h3 className="text-2xl font-bold text-white mb-6 md:mb-0">Prêt à rentabiliser vos années d'études ?</h3>
                  <button onClick={() => handleStart("prof")} className="bg-white text-blue-900 font-bold px-10 py-4 rounded-xl hover:bg-gray-50 transition-colors w-full md:w-auto">
                    Créer mon profil Mentor
                  </button>
                </div>
              </div>
            </section>

          </div>
        ) : (
          /* --- AUTHENTICATION FLOW --- */
          <div className="flex-1 flex items-center justify-center px-4 py-12 animate-in slide-in-from-bottom-4 duration-300">
            <div className="w-full max-w-md">
              <button
                onClick={() => { setRole(null); setErrorMsg(null); setEmailSent(false); }}
                className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-900 mb-6 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Retour au site
              </button>

              {emailSent ? (
                <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-8 text-center">
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MailCheck className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="font-extrabold text-gray-900 text-2xl mb-3">Vérifiez votre boîte mail</h2>
                  <p className="text-gray-600 mb-2">
                    Un lien sécurisé a été envoyé à <strong>{email}</strong>.
                  </p>
                  <p className="text-sm text-gray-500 mb-8">
                    Cliquez dessus pour valider votre identité. C'est la première étape indispensable pour sécuriser votre espace.
                  </p>
                  <button
                    onClick={() => { setEmailSent(false); setMode("connexion"); }}
                    className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition-colors"
                  >
                    J'ai cliqué, me connecter
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center">
                      {role === "prof" ? <GraduationCap className="w-7 h-7 text-blue-600" /> : <Users className="w-7 h-7 text-blue-600" />}
                    </div>
                    <div>
                      <h2 className="font-extrabold text-2xl text-gray-900 tracking-tight">
                        {role === "prof" ? "Espace Mentor" : "Espace Famille"}
                      </h2>
                      <p className="text-sm text-gray-500 font-medium mt-1">
                        {role === "prof" ? "L'excellence académique." : "Le suivi optimal pour votre enfant."}
                      </p>
                    </div>
                  </div>

                  <div className="flex bg-gray-100/80 rounded-xl p-1.5 mb-8">
                    {(["connexion", "inscription"] as AuthMode[]).map((m) => (
                      <button
                        key={m}
                        onClick={() => { setMode(m); setErrorMsg(null); }}
                        className={`flex-1 text-sm py-2.5 rounded-lg transition-all ${
                          mode === m ? "bg-white shadow-sm font-bold text-gray-900" : "font-semibold text-gray-500 hover:text-gray-900"
                        }`}
                      >
                        {m.charAt(0).toUpperCase() + m.slice(1)}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => signInWithGoogle(role!)}
                    className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-xl py-3.5 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all mb-6"
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continuer avec Google
                  </button>

                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
                    <div className="relative flex justify-center"><span className="bg-white px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">ou par email</span></div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {mode === "inscription" && (
                      <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1.5">Prénom</label>
                            <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Jean" required className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-gray-50/50" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1.5">Nom</label>
                            <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Dupont" required className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-gray-50/50" />
                          </div>
                        </div>
                        {role === "prof" && (
                          <div>
                            <label className="block text-sm font-bold text-gray-900 mb-1.5">Votre Grande École / Université</label>
                            <input type="text" value={etablissement} onChange={(e) => setEtablissement(e.target.value)} placeholder="HEC, Polytechnique, Dauphine..." required className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-gray-50/50" />
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-1.5">Adresse e-mail</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.fr" required className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-gray-50/50" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-sm font-bold text-gray-900">Mot de passe</label>
                        {mode === "connexion" && <button type="button" className="text-xs font-bold text-blue-600 hover:text-blue-800">Oublié ?</button>}
                      </div>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-gray-50/50" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {mode === "inscription" && (
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-1.5">Confirmer le mot de passe</label>
                        <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required minLength={6} className={`w-full px-4 py-3 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 transition-all bg-gray-50/50 ${confirmPassword && password !== confirmPassword ? "border-red-400 focus:ring-red-500/20" : "border-gray-200 focus:ring-blue-600/20 focus:border-blue-600"}`} />
                      </div>
                    )}

                    {errorMsg && (
                      <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-sm text-red-700 font-medium">
                        <span className="mt-0.5">⚠️</span>
                        <p>{errorMsg}</p>
                      </div>
                    )}

                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-xl text-base font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6">
                      {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                      {mode === "connexion" ? "Accéder à mon espace" : "Créer mon compte Colibri"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-12 px-6 text-center text-sm font-medium text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Colibri" className="w-6 h-6 grayscale opacity-50" />
            <span>Colibri Soutien</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-900 transition-colors">Mentions légales</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Politique de confidentialité</a>
          </div>
          <div>
            © 2026 Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}