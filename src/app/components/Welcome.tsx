import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import {
  GraduationCap, Users, Eye, EyeOff,
  ChevronLeft, Loader2, MailCheck,
  BookOpen, FileText, PiggyBank,
  TrendingUp, Building, Shield,
  ShieldCheck, ArrowRight,
  HeartHandshake, Landmark, Sparkles
} from "lucide-react";
import { useAuth } from "../../lib/auth";

type Role = "prof" | "parent" | null;
type AuthMode = "connexion" | "inscription";

export function Welcome() {
  const [role, setRole] = useState<Role>(null);
  const [mode, setMode] = useState<AuthMode>("connexion");
  const [showAuth, setShowAuth] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  
  // Auth states
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
  const [prenomEnfant, setPrenomEnfant] = useState(""); // eslint-disable-line @typescript-eslint/no-unused-vars

  const [searchParams] = useSearchParams();
  const codeFromUrl = searchParams.get("code") ?? "";
  const roleFromUrl = searchParams.get("role") as Role | null;

  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle, user, profile, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user && profile && !emailSent) {
      if (profile.role === "parent") {
        navigate("/parent", { replace: true });
      } else {
        navigate("/app", { replace: true });
      }
    }
  }, [user, profile, authLoading, emailSent, navigate]);

  useEffect(() => {
    if (roleFromUrl === "parent" || roleFromUrl === "prof") {
      setRole(roleFromUrl);
      setMode("inscription");
      setShowAuth(true);
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
          ? { prenom_enfant: prenomEnfant, code_invitation: codeProf }
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
    setShowAuth(true);
    setShowRoleModal(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900 selection:bg-blue-100">
      
      {/* HEADER PRO / SAAS */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 h-20 flex items-center justify-between transition-all">
        
        {/* Zone Logo */}
        <div className="flex-1 flex items-center">
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => { setRole(null); setShowAuth(false); setEmailSent(false); }}>
            <img src="/src/assets/colibri.png" alt="Colibri" className="w-9 h-9 object-contain" />
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">
              Colibri
            </span>
          </div>
        </div>
        
        {/* Zone Liens */}
        <nav className="hidden md:flex items-center justify-center gap-8">
          <a href="#concept" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Le concept</a>
          <Link to="/tarifs" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Grille tarifaire</Link>
          <Link to="/ecoles" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Les Écoles partenaires</Link>
          <Link to="/mission" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Notre mission</Link>
        </nav>

        {/* Zone Boutons */}
        <div className="flex-1 flex items-center justify-end gap-5">
          <button 
            onClick={() => { setRole(null); setMode("connexion"); setShowAuth(true); window.scrollTo(0,0); }} 
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors hidden sm:block active:scale-95"
          >
            Se connecter
          </button>
          <button 
            onClick={() => setShowRoleModal(true)} 
            className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-sm hover:shadow-md"
          >
            S'inscrire
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {!showAuth && !role ? (
          <div className="w-full animate-in fade-in duration-500">
            
            {/* HERO SECTION - Tailles réduites pour remonter le contenu */}
            <section className="px-6 pt-10 pb-12 md:pt-14 md:pb-14 border-b border-slate-100 bg-slate-50/50">
              <div className="max-w-6xl mx-auto text-center space-y-6">
                
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                  L’excellence du soutien scolaire. <br className="hidden md:block"/>
                  La sérénité administrative absolue.
                </h1>
                
                <p className="text-base md:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-medium">
                  Rejoignez le premier réseau de soutien scolaire d'excellence où la légalité ne coûte rien aux parents et rapporte enfin plus aux étudiants.
                </p>
                
                {/* BOUTONS D'ACTION (50/50) */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                  
                  {/* Bouton Parent (Primary) */}
                  <button 
                    onClick={() => handleStart("parent")} 
                    className="group relative flex items-center text-left w-full sm:w-[280px] p-2 pr-5 bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700 hover:shadow transition-all duration-200 active:scale-[0.98]"
                  >
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4 shrink-0">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <span className="block font-semibold text-[15px] leading-snug">Trouver un prof</span>
                      <span className="block text-[13px] text-blue-100 font-medium">Je suis parent</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-blue-200 group-hover:translate-x-1 group-hover:text-white transition-all duration-200" />
                  </button>
                  
                  {/* Bouton Étudiant (Secondary) */}
                  <button 
                    onClick={() => handleStart("prof")} 
                    className="group relative flex items-center text-left w-full sm:w-[280px] p-2 pr-5 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:shadow transition-all duration-200 active:scale-[0.98]"
                  >
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mr-4 shrink-0">
                      <GraduationCap className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="flex-1">
                      <span className="block font-semibold text-[15px] leading-snug">Donner des cours</span>
                      <span className="block text-[13px] text-slate-500 font-medium">Je suis étudiant</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-slate-900 transition-all duration-200" />
                  </button>
                </div>

                {/* BARRE D'ARGUMENTS - Cartes fluides */}
                <div className="flex flex-wrap justify-center gap-5 pt-8 mt-6 border-t border-slate-200 text-left">
                  
                  <div className="w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] flex items-start gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
                    <div className="mt-0.5 bg-rose-100 p-2.5 rounded-xl text-rose-700 group-hover:scale-110 transition-transform shrink-0">
                      <HeartHandshake className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-[15px]">Impact Social</h3>
                      <p className="text-[13px] text-slate-600 mt-1.5 leading-relaxed">Notre modèle redistributif rend l'excellence accessible aux classes moyennes.</p>
                    </div>
                  </div>

                  <div className="w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] flex items-start gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
                    <div className="mt-0.5 bg-slate-100 p-2.5 rounded-xl text-slate-700 group-hover:scale-110 transition-transform shrink-0">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-[15px]">Profs issus du Top 10</h3>
                      <p className="text-[13px] text-slate-600 mt-1.5 leading-relaxed">Mines Paris, Centrale Supélec, HEC, ESSEC. Un casting ultra-sélectif.</p>
                    </div>
                  </div>

                  <div className="w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] flex items-start gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
                    <div className="mt-0.5 bg-emerald-100 p-2.5 rounded-xl text-emerald-700 group-hover:scale-110 transition-transform shrink-0">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-[15px]">Rémunération +40%</h3>
                      <p className="text-[13px] text-slate-600 mt-1.5 leading-relaxed">Nos professeurs gagnent jusqu'à 40% de plus que sur le marché au black.</p>
                    </div>
                  </div>

                  <div className="w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] flex items-start gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
                    <div className="mt-0.5 bg-amber-100 p-2.5 rounded-xl text-amber-700 group-hover:scale-110 transition-transform shrink-0">
                      <Landmark className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-[15px]">Cotisations & Retraite</h3>
                      <p className="text-[13px] text-slate-600 mt-1.5 leading-relaxed">Validez vos trimestres de retraite et constituez un historique de revenus officiel.</p>
                    </div>
                  </div>

                  <div className="w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] flex items-start gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
                    <div className="mt-0.5 bg-blue-100 p-2.5 rounded-xl text-blue-700 group-hover:scale-110 transition-transform shrink-0">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-[15px]">100% Légal & Automatisé</h3>
                      <p className="text-[13px] text-slate-600 mt-1.5 leading-relaxed">Fini le travail au black. L'application gère vos factures et cotisations automatiquement.</p>
                    </div>
                  </div>
                  
                </div>

              </div>
            </section>

            {/* SECTION CIBLES : PARENTS ET ÉTUDIANTS */}
            <section id="concept" className="py-24 px-6 bg-white">
              <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-12">
                
                {/* BLOC A : PARENTS */}
                <div className="border border-slate-200 rounded-3xl p-8 md:p-10 bg-slate-50/50 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5 transition-all duration-300">
                  <div className="mb-8 border-b border-slate-200 pb-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Pour les parents :</h2>
                    <p className="text-xl text-blue-600 font-semibold">L'alternative au CESU, sans surcoût.</p>
                  </div>
                  
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
                        <BookOpen className="w-5 h-5 text-slate-400" />
                        L'élite académique pour vos enfants.
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed pl-7">Nos profs sont rigoureusement sélectionnés parmi les meilleures formations supérieures (Ingénierie, Sciences Po, Médecine). Plus que des professeurs, ce sont des étudiants qui transmettent l'exigence et la méthodologie de leur propre réussite.</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-slate-400" />
                        Zéro charge, zéro paperasse.
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed pl-7">Avec Colibri, vous n'êtes pas un employeur. Vous ne payez aucune charge patronale ni salariale, et vous n'avez aucune déclaration à faire. Nous gérons l'intégralité du cadre légal et des factures.</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
                        <PiggyBank className="w-5 h-5 text-slate-400" />
                        Votre budget reste intact.
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed pl-7">Offrez à votre enfant des cours déclarés et encadrés par des profs vérifiés, sans dépenser un euro de plus. Le coût final de notre service premium reste strictement identique à celui que vous allouiez jusqu'ici à des cours non déclarés.</p>
                    </div>
                  </div>
                </div>

                {/* BLOC B : ÉTUDIANTS */}
                <div className="border border-slate-200 rounded-3xl p-8 md:p-10 bg-white hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/5 transition-all duration-300">
                  <div className="mb-8 border-b border-slate-200 pb-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Pour les étudiants :</h2>
                    <p className="text-xl text-slate-600 font-semibold">Structurez votre activité, valorisez votre expertise.</p>
                  </div>
                  
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-slate-400" />
                        Gagnez jusqu'à 40 % de plus qu'au marché au black.
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed pl-7">Notre modèle économique repose sur un arbitrage financier conçu pour vous. En facturant vos heures à leur véritable valeur, votre rémunération APRÈS IMPÔTS ET COTISATIONS SOCIALES est jusqu'à 40 % supérieure à celle des cours non déclarés. <Link to="/tarifs" className="text-blue-600 hover:underline font-medium">(Consulter notre grille tarifaire)</Link></p>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
                        <Building className="w-5 h-5 text-slate-400" />
                        Cotisez et construisez vos droits sociaux.
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed pl-7">Ne laissez plus votre travail dans l'ombre. En facturant légalement via Colibri, vous existez aux yeux de l'État : vous cotisez pour votre retraite, vous validez des trimestres, et vous vous constituez un historique de revenus officiel pour vos futurs dossiers de location.</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
                        <Shield className="w-5 h-5 text-slate-400" />
                        Une gestion administrative 100 % automatisée.
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed pl-7">Nous vous accompagnons dans la création de votre statut en 5 minutes. Ensuite, Colibri génère vos factures et gère les prélèvements. Vous vous concentrez uniquement sur vos cours.</p>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* SECTION MISSION SOCIALE */}
            <section id="mission" className="py-16 px-6 bg-white">
              <div className="max-w-4xl mx-auto">
                <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50/80 border border-blue-100 rounded-3xl p-8 md:p-12 text-center overflow-hidden shadow-sm">
                  
                  <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400/10 blur-[80px] rounded-full" />
                    <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-400/10 blur-[80px] rounded-full" />
                  </div>
                  
                  <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
                    
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wide mb-6 shadow-sm">
                      <HeartHandshake className="w-3.5 h-3.5" />
                      Notre Mission
                    </div>
                    
                    <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 mb-6 leading-snug flex items-center justify-center gap-3">
                      Démocratiser l'excellence
                      <Sparkles className="w-6 h-6 text-blue-500" />
                    </h2>
                    
                    <p className="text-base md:text-lg text-slate-700 leading-relaxed font-medium">
                      Historiquement, l'accompagnement par des étudiants issus des filières d'élite était un privilège réservé aux foyers les plus aisés. Le modèle d'optimisation financière de Colibri change la donne. En absorbant les coûts de gestion, nous permettons aux familles issues de la classe moyenne de s'offrir une éducation d'excellence qui leur était auparavant inaccessible. <br className="hidden md:block"/><br className="hidden md:block"/><strong className="text-blue-700 font-bold">En rejoignant Colibri, vous participez activement à rétablir l'égalité des chances.</strong>
                    </p>
                    
                  </div>
                  
                </div>
              </div>
            </section>

          </div>
        ) : (
          /* --- AUTHENTICATION FLOW --- */
          <div className="flex-1 flex items-center justify-center px-4 py-12 bg-slate-50">
            <div className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-300">
              <button
                onClick={() => { setRole(null); setShowAuth(false); setErrorMsg(null); setEmailSent(false); setMode("connexion"); }}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" /> Retour à l'accueil
              </button>

              {emailSent ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MailCheck className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="font-bold text-slate-900 text-xl mb-2">Vérifiez votre boîte mail</h2>
                  <p className="text-slate-600 text-sm mb-8">
                    Un lien sécurisé a été envoyé à <strong>{email}</strong>. Cliquez dessus pour valider votre identité.
                  </p>
                  <button
                    onClick={() => { setEmailSent(false); setMode("connexion"); }}
                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-colors active:scale-95"
                  >
                    J'ai cliqué, me connecter
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                  <div className="mb-8">
                    <h2 className="font-extrabold text-2xl text-slate-900">
                      {!role ? "Connexion" : role === "prof" ? "Espace Professeur" : "Espace Famille"}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Gérez vos cours en toute simplicité.
                    </p>
                  </div>

                  {role && (
                    <div className="flex bg-slate-100 rounded-xl p-1.5 mb-6">
                      {(["connexion", "inscription"] as AuthMode[]).map((m) => (
                        <button
                          key={m}
                          onClick={() => { setMode(m); setErrorMsg(null); }}
                          className={`flex-1 text-sm py-2 rounded-lg transition-all active:scale-95 ${
                            mode === m ? "bg-white shadow-sm font-semibold text-slate-900" : "font-medium text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          {m.charAt(0).toUpperCase() + m.slice(1)}
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => signInWithGoogle(role || "parent")}
                    className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-xl py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 mb-6"
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
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
                    <div className="relative flex justify-center"><span className="bg-white px-3 text-xs font-medium text-slate-400">ou par email</span></div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === "inscription" && role && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Prénom</label>
                            <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} required className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nom</label>
                            <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors" />
                          </div>
                        </div>
                        {role === "prof" && (
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Établissement (Grande École...)</label>
                            <input type="text" value={etablissement} onChange={(e) => setEtablissement(e.target.value)} required className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors" />
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Adresse e-mail</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-semibold text-slate-700">Mot de passe</label>
                      </div>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors pr-10" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {mode === "inscription" && role && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirmer le mot de passe</label>
                        <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white focus:ring-1 focus:ring-blue-600 focus:border-blue-600 outline-none transition-colors" />
                      </div>
                    )}

                    {errorMsg && (
                      <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium flex items-start gap-2">
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2 mt-4 shadow-sm">
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {mode === "connexion" ? "Se connecter" : "Créer mon compte"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* FOOTER PRO / SAAS */}
      <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs leading-none">C</span>
                </div>
                <span className="font-bold text-slate-900">Colibri</span>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                L'excellence du soutien scolaire certifiée par l'État.
              </p>
              <div className="flex items-center gap-4 opacity-40 grayscale hover:grayscale-0 transition-all">
                <span className="font-bold text-lg tracking-tighter text-slate-800">URSSAF</span>
                <span className="font-bold text-lg tracking-tighter text-slate-800">Stripe</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-900 mb-4 text-sm">Plateforme</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Le concept</a></li>
                <li><Link to="/tarifs" className="hover:text-blue-600 transition-colors">Grille tarifaire</Link></li>
                <li><Link to="/ecoles" className="hover:text-blue-600 transition-colors">Écoles partenaires</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4 text-sm">Ressources</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link to="/mission" className="hover:text-blue-600 transition-colors">Notre mission</Link></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Espace Professeur</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Espace Parent</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4 text-sm">Légal</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Mentions légales</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">CGV / CGU</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Politique de confidentialité</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-200 pt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-400">
              © 2026 Colibri SAS. Entreprise mandataire de Services à la Personne.
            </p>
            <p className="text-xs text-slate-400">
              Transactions sécurisées par Stripe.
            </p>
          </div>
        </div>
      </footer>

      {/* MODAL S'INSCRIRE */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-6 text-center border-b border-slate-100 relative">
              <h3 className="text-xl font-bold text-slate-900">Bienvenue sur Colibri</h3>
              <p className="text-sm text-slate-500 mt-1">Sélectionnez votre profil pour continuer</p>
              <button onClick={() => setShowRoleModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-900 transition-colors bg-slate-50 hover:bg-slate-100 rounded-md p-1.5 active:scale-95">
                ✕
              </button>
            </div>
            
            <div className="p-6 grid sm:grid-cols-2 gap-4">
               <button 
                  onClick={() => handleStart("parent")} 
                  className="flex flex-col items-center p-6 border border-slate-200 rounded-xl hover:border-blue-600 hover:bg-blue-50/50 hover:shadow-sm transition-all text-center active:scale-95"
                >
                  <Users className="w-8 h-8 text-blue-600 mb-3" />
                  <span className="font-semibold text-slate-900">Je suis parent</span>
               </button>
               
               <button 
                  onClick={() => handleStart("prof")} 
                  className="flex flex-col items-center p-6 border border-slate-200 rounded-xl hover:border-slate-400 hover:bg-slate-50 hover:shadow-sm transition-all text-center active:scale-95"
                >
                  <GraduationCap className="w-8 h-8 text-slate-700 mb-3" />
                  <span className="font-semibold text-slate-900">Je suis étudiant</span>
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}