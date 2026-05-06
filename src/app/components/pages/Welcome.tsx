import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router";
import {
  GraduationCap, Users, Eye, EyeOff,
  ChevronLeft, Loader2, MailCheck,
  BookOpen, FileText, PiggyBank,
  TrendingUp, Building, Shield,
  ShieldCheck, ArrowRight,
  HeartHandshake, Landmark, Sparkles
} from "lucide-react";
import { useAuth } from "../../../lib/auth";
import urssafBlanc from "../../../assets/Urssaf_BLANC.png";

type Role = "prof" | "parent" | null;
type AuthMode = "connexion" | "inscription";

const ETABLISSEMENTS = [
  "Polytechnique (X)", "ENS Ulm", "Mines Paris - PSL", "HEC Paris",
  "ESSEC Business School", "CentraleSupélec", "ENS Paris-Saclay", "Dauphine - PSL",
];

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
  const [showEtabDropdown, setShowEtabDropdown] = useState(false);
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

  // Scroll parallax for waves
  const bgRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>(0);

  const handleScroll = useCallback(() => {
    if (!rafId.current) {
      rafId.current = requestAnimationFrame(() => {
        if (bgRef.current) {
          const scrollY = window.scrollY;
          const layers = bgRef.current.querySelectorAll<HTMLElement | SVGElement>('[data-wave]');
          layers.forEach((layer) => {
            const speed = parseFloat(layer.getAttribute('data-wave') || '1');
            const ty = scrollY * speed * 0.12;
            layer.style.transform = `translateY(${-ty}px)`;
          });
        }
        rafId.current = 0;
      });
    }
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [handleScroll]);

  return (
    <div className="relative min-h-screen flex flex-col font-sans text-slate-900 selection:bg-blue-100">

      {/* FOND */}
      <div className="fixed inset-0 -z-20 bg-[#f0f4f8]" />

      {/* SVG VAGUES — fixed, mouvement vertical au scroll */}
      <div ref={bgRef} className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">

        {/* Defs partagées */}
        <svg className="absolute w-0 h-0">
          <defs>
            <linearGradient id="gCyan" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00F2FE" />
              <stop offset="50%" stopColor="#00D4FF" />
              <stop offset="100%" stopColor="#0052D4" />
            </linearGradient>
            <linearGradient id="gSky" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#4FACFE" />
              <stop offset="100%" stopColor="#00F2FE" />
            </linearGradient>
            <linearGradient id="gBlue" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0052D4" />
              <stop offset="50%" stopColor="#4364F7" />
              <stop offset="100%" stopColor="#6FB1FC" />
            </linearGradient>
            <linearGradient id="gTeal" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#43E7E0" />
              <stop offset="100%" stopColor="#0052D4" />
            </linearGradient>
            <linearGradient id="gCyanR" x1="100%" y1="0%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#00F2FE" />
              <stop offset="50%" stopColor="#4FACFE" />
              <stop offset="100%" stopColor="#0052D4" />
            </linearGradient>
          </defs>
        </svg>

        {/* ========== HERO : Vagues plein écran (les originales) ========== */}


         {/* SVG BACKGROUND - Vagues obliques interactives */}
      <div ref={bgRef} className="fixed inset-0 -z-10 overflow-hidden bg-[#f0f4f8]">
        <svg viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" className="absolute -inset-10 w-[calc(100%+80px)] h-[calc(100%+80px)]">
          <defs>
            <linearGradient id="wvA" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F2FE" />
              <stop offset="100%" stopColor="#0099E5" />
            </linearGradient>
            <linearGradient id="wvB" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4FACFE" />
              <stop offset="100%" stopColor="#00F2FE" />
            </linearGradient>
            <linearGradient id="wvC" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0052D4" />
              <stop offset="50%" stopColor="#4364F7" />
              <stop offset="100%" stopColor="#6FB1FC" />
            </linearGradient>
            <linearGradient id="wvD" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#00F2FE" />
              <stop offset="50%" stopColor="#4FACFE" />
              <stop offset="100%" stopColor="#0066CC" />
            </linearGradient>
            <linearGradient id="wvE" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#43E7E0" />
              <stop offset="100%" stopColor="#0052D4" />
            </linearGradient>
          </defs>

          {/* Couche 1 - Vagues haut-gauche obliques, mouvement lent */}
          <g data-wave="1" className="transition-transform duration-700 ease-out">
            <path fill="url(#wvA)" opacity="0.7" d="M-200,0 L400,0 C350,50 250,180 200,280 C150,380 50,420 -50,350 C-150,280 -200,150 -200,0 Z" />
            <path fill="url(#wvB)" opacity="0.55" d="M-100,0 L500,0 L300,350 C250,420 150,480 50,430 C-50,380 -120,280 -150,180 L-100,0 Z" />
            <path fill="url(#wvC)" opacity="0.65" d="M0,0 L550,0 L350,300 C280,400 180,350 100,400 C20,450 -80,380 -120,280 C-160,180 -80,80 0,0 Z" />
          </g>

          {/* Couche 2 - Rubans diagonaux traversants, mouvement moyen */}
          <g data-wave="2" className="transition-transform duration-500 ease-out">
            <path fill="url(#wvC)" opacity="0.45" d="M-100,200 C100,150 300,350 500,250 C700,150 850,300 950,200 L800,0 L-100,0 Z" />
            <path fill="url(#wvA)" opacity="0.35" d="M-50,350 C150,280 350,450 550,350 C750,250 900,380 1050,300 L900,100 L-50,100 Z" />
          </g>

        {/* Couche 3 - Vagues bas-droite obliques, mouvement rapide */}
          <g data-wave="3" className="transition-transform duration-300 ease-out">
            {/* Vague 1 : On supprime L1040,900. L'ancrage plonge à Y=1100 et remonte en courbe */}
            <path fill="url(#wvD)" opacity="0.65" d="M1500,1100 C1240,1100 1000,1050 1040,850 C1100,700 1200,720 1260,620 C1320,520 1420,480 1500,550 C1580,620 1520,780 1500,1100 Z" />
            
            {/* Vague 2 : On éradique L940,900 et la ligne droite montante L1140,550 */}
            <path fill="url(#wvE)" opacity="0.55" d="M1600,1150 C1200,1150 850,1050 940,800 C1000,650 1050,600 1140,550 C1200,470 1300,430 1400,480 C1500,530 1560,650 1580,750 C1600,850 1600,1000 1600,1150 Z" />
            
            {/* Vague 3 : Même principe, on ancre hors cadre en bas à droite pour arrondir le tout */}
            <path fill="url(#wvB)" opacity="0.6" d="M1500,1150 C1100,1150 800,1000 900,800 C950,700 1000,650 1100,600 C1180,500 1280,550 1360,500 C1440,450 1520,520 1560,620 C1600,720 1520,820 1500,1150 Z" />
          </g>

          {/* Couche 4 - Accents haut-droite */}
          <g data-wave="1.5" className="transition-transform duration-600 ease-out">
            <path fill="url(#wvA)" opacity="0.3" d="M1440,0 L1440,200 C1380,250 1280,180 1200,220 C1120,260 1080,180 1100,100 C1120,40 1200,0 1300,0 Z" />
            <path fill="url(#wvE)" opacity="0.25" d="M1440,0 L1440,300 C1350,330 1250,250 1180,300 C1110,350 1050,280 1080,200 C1110,120 1200,60 1300,30 L1440,0 Z" />
          </g>
        </svg>
      </div>



        {/* ========== SCROLL : Vagues obliques latérales (apparaissent au scroll) ========== */}

        {/* DROITE — oblique milieu */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" data-wave="2" className="absolute right-0 w-[45%] h-[65%]" style={{ top: '60%', transition: 'transform 0.5s ease-out' }}>
          <path fill="#00F2FE" opacity="0.5" d="M100,100 L100,25 Q92,20 82,32 Q68,48 58,65 Q50,80 45,92 Q42,100 100,100 Z" />
          <path fill="#43E7E0" opacity="0.4" d="M100,100 L100,38 Q95,30 88,42 Q75,56 65,72 Q58,85 52,96 Q50,100 100,100 Z" />
          <path fill="#4FACFE" opacity="0.45" d="M100,100 L100,48 Q96,42 90,52 Q80,64 72,78 Q65,90 60,98 Q58,100 100,100 Z" />
        </svg>

        {/* GAUCHE — oblique milieu */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" data-wave="1.8" className="absolute left-0 w-[35%] h-[55%]" style={{ top: '80%', transition: 'transform 0.6s ease-out' }}>
          <path fill="#0052D4" opacity="0.35" d="M0,100 L0,28 Q8,22 18,34 Q32,52 42,68 Q50,82 55,94 Q58,100 0,100 Z" />
          <path fill="#4FACFE" opacity="0.25" d="M0,100 L0,40 Q6,32 16,44 Q28,58 38,74 Q46,86 50,96 Q52,100 0,100 Z" />
        </svg>

        {/* GAUCHE — oblique bas */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" data-wave="2.5" className="absolute left-0 w-[50%] h-[60%]" style={{ top: '130%', transition: 'transform 0.4s ease-out' }}>
          <path fill="#00F2FE" opacity="0.45" d="M0,100 L0,30 Q10,22 22,35 Q36,52 46,68 Q54,82 58,94 Q60,100 0,100 Z" />
          <path fill="#43E7E0" opacity="0.35" d="M0,100 L0,42 Q8,34 18,46 Q30,60 40,75 Q48,88 52,97 Q54,100 0,100 Z" />
        </svg>

        {/* DROITE — oblique bas */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" data-wave="3" className="absolute right-0 w-[40%] h-[55%]" style={{ top: '150%', transition: 'transform 0.3s ease-out' }}>
          <path fill="#0052D4" opacity="0.4" d="M100,0 L100,72 Q92,80 82,70 Q68,55 58,38 Q50,22 45,10 Q42,0 100,0 Z" />
          <path fill="#4364F7" opacity="0.35" d="M100,8 L100,65 Q94,74 85,62 Q72,48 62,32 Q55,18 50,8 Q48,0 100,8 Z" />
        </svg>

      </div>

      {/* HEADER PRO / SAAS */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/40 px-6 h-20 flex items-center justify-between shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all">

        {/* Zone Logo */}
        <div className="flex-1 flex items-center">
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => { setRole(null); setShowAuth(false); setEmailSent(false); }}>
            <img src="/src/assets/colibri.svg" alt="Colibri" className="w-9 h-9 object-contain" />
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">
              Colibri
            </span>
          </div>
        </div>

        {/* Zone Liens */}
        <nav className="hidden md:flex items-center justify-center gap-8">
          <a href="#concept" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Le concept</a>
          <Link to="/tarifs" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Grille tarifaire</Link>
          <Link to="/ecoles" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Les Écoles partenaires</Link>
          <Link to="/mission" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Notre mission</Link>
        </nav>

        {/* Zone Boutons */}
        <div className="flex-1 flex items-center justify-end gap-5">
          <button
            onClick={() => { setRole(null); setMode("connexion"); setShowAuth(true); window.scrollTo(0,0); }}
            className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors hidden sm:block active:scale-95"
          >
            Se connecter
          </button>
          <button
            onClick={() => setShowRoleModal(true)}
            className="bg-[#0052D4] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-md hover:shadow-lg"
          >
            S'inscrire
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {!showAuth && !role ? (
          <div className="w-full animate-in fade-in duration-500">

            {/* HERO SECTION */}
            <section className="relative px-6 pt-16 pb-16 md:pt-24 md:pb-20 overflow-hidden">
              <div className="max-w-6xl mx-auto text-center space-y-8">

                <h1 className="tracking-tight leading-[1.1]">
                  <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: "clamp(2.4rem, 6vw, 4.2rem)", color: "#0F172A", display: "block", letterSpacing: "-0.02em" }}>
                    L'excellence du soutien scolaire.
                  </span>
                  <span className="text-slate-500 font-semibold" style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.5rem)", marginTop: "0.5rem", display: "block", letterSpacing: "-0.01em" }}>
                    La sérénité administrative absolue.
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-slate-700 leading-relaxed max-w-2xl mx-auto font-medium drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">
                  Rejoignez le premier réseau de soutien scolaire d'excellence où la légalité ne coûte rien aux parents et rapporte enfin plus aux étudiants.
                </p>

                {/* BOUTONS D'ACTION */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">

                  {/* Bouton Parent (Primary - Blue gradient) */}
                  <button
                    onClick={() => handleStart("parent")}
                    className="group relative flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#0052D4] to-[#4364F7] text-white rounded-2xl shadow-lg hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300 active:scale-[0.98]"
                  >
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg">Trouver un prof</span>
                    <ArrowRight className="w-5 h-5 text-blue-200 group-hover:translate-x-1 group-hover:text-white transition-all duration-200" />
                  </button>

                  {/* Bouton Étudiant (Secondary - Teal gradient) */}
                  <button
                    onClick={() => handleStart("prof")}
                    className="group relative flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-400 text-white rounded-2xl shadow-lg hover:shadow-xl hover:shadow-emerald-500/20 transition-all duration-300 active:scale-[0.98]"
                  >
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg">Donner des cours</span>
                    <ArrowRight className="w-5 h-5 text-emerald-200 group-hover:translate-x-1 group-hover:text-white transition-all duration-200" />
                  </button>
                </div>

                {/* BARRE D'ARGUMENTS - Cartes Glassmorphism */}
                <div className="flex flex-wrap justify-center gap-5 pt-8 mt-6 border-t border-white/30 text-left">

                  <div className="w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] flex items-start gap-4 p-5 bg-white/85 backdrop-blur-xl border border-rose-200/60 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-2xl hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 group">
                    <div className="mt-0.5 bg-gradient-to-br from-rose-100 to-pink-100 p-2.5 rounded-xl text-rose-600 group-hover:scale-110 transition-transform shrink-0">
                      <HeartHandshake className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-[15px]">Impact Social</h3>
                      <p className="text-[13px] text-slate-600 mt-1.5 leading-relaxed">Notre modèle redistributif rend l'excellence accessible aux classes moyennes.</p>
                    </div>
                  </div>

                  <div className="w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] flex items-start gap-4 p-5 bg-white/85 backdrop-blur-xl border border-indigo-200/60 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-2xl hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 group">
                    <div className="mt-0.5 bg-gradient-to-br from-indigo-100 to-blue-100 p-2.5 rounded-xl text-indigo-600 group-hover:scale-110 transition-transform shrink-0">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-[15px]">Profs issus du Top 10</h3>
                      <p className="text-[13px] text-slate-600 mt-1.5 leading-relaxed">Mines Paris, Centrale Supélec, HEC, ESSEC. Un casting ultra-sélectif.</p>
                    </div>
                  </div>

                  <div className="w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] flex items-start gap-4 p-5 bg-white/85 backdrop-blur-xl border border-emerald-200/60 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-2xl hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 group">
                    <div className="mt-0.5 bg-gradient-to-br from-emerald-100 to-teal-100 p-2.5 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform shrink-0">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-[15px]">Rémunération +40%</h3>
                      <p className="text-[13px] text-slate-600 mt-1.5 leading-relaxed">Nos professeurs gagnent jusqu'à 40% de plus que sur le marché au black.</p>
                    </div>
                  </div>

                  <div className="w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] flex items-start gap-4 p-5 bg-white/85 backdrop-blur-xl border border-amber-200/60 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-2xl hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 group">
                    <div className="mt-0.5 bg-gradient-to-br from-amber-100 to-yellow-100 p-2.5 rounded-xl text-amber-600 group-hover:scale-110 transition-transform shrink-0">
                      <Landmark className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-[15px]">Cotisations & Retraite</h3>
                      <p className="text-[13px] text-slate-600 mt-1.5 leading-relaxed">Validez vos trimestres de retraite et constituez un historique de revenus officiel.</p>
                    </div>
                  </div>

                  <div className="w-full sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] flex items-start gap-4 p-5 bg-white/85 backdrop-blur-xl border border-blue-200/60 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-2xl hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all duration-300 group">
                    <div className="mt-0.5 bg-gradient-to-br from-blue-100 to-cyan-100 p-2.5 rounded-xl text-blue-600 group-hover:scale-110 transition-transform shrink-0">
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
            <section id="concept" className="py-24 px-6">
              <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-12">

                {/* BLOC A : PARENTS */}
                <div className="bg-white/85 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-3xl p-8 md:p-10 hover:shadow-[0_16px_48px_rgba(0,82,212,0.1)] hover:-translate-y-1 transition-all duration-300">
                  <div className="mb-8 border-b border-slate-200/60 pb-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Pour les parents :</h2>
                    <p className="text-xl text-[#0052D4] font-semibold">L'alternative au CESU, sans surcoût.</p>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
                        <BookOpen className="w-5 h-5 text-blue-400" />
                        L'élite académique pour vos enfants.
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed pl-7">Nos profs sont rigoureusement sélectionnés parmi les meilleures formations supérieures (Ingénierie, Sciences Po, Médecine). Plus que des professeurs, ce sont des étudiants qui transmettent l'exigence et la méthodologie de leur propre réussite.</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-blue-400" />
                        Zéro charge, zéro paperasse.
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed pl-7">Avec Colibri, vous n'êtes pas un employeur. Vous ne payez aucune charge patronale ni salariale, et vous n'avez aucune déclaration à faire. Nous gérons l'intégralité du cadre légal et des factures.</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
                        <PiggyBank className="w-5 h-5 text-blue-400" />
                        Votre budget reste intact.
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed pl-7">Offrez à votre enfant des cours déclarés et encadrés par des profs vérifiés, sans dépenser un euro de plus. Le coût final de notre service premium reste strictement identique à celui que vous allouiez jusqu'ici à des cours non déclarés.</p>
                      <div className="pl-7 mt-3">
                        <Link to="/avance-immediate" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0052D4] hover:text-[#4364F7] transition-colors group">
                          Comprendre le mécanisme financier
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* BLOC B : ÉTUDIANTS */}
                <div className="bg-white/85 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-3xl p-8 md:p-10 hover:shadow-[0_16px_48px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
                  <div className="mb-8 border-b border-slate-200/60 pb-6">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Pour les étudiants :</h2>
                    <p className="text-xl text-slate-600 font-semibold">Structurez votre activité, valorisez votre expertise.</p>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        Gagnez jusqu'à 40 % de plus qu'au marché au black.
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed pl-7">Notre modèle économique repose sur un arbitrage financier conçu pour vous. En facturant vos heures à leur véritable valeur, votre rémunération APRÈS IMPÔTS ET COTISATIONS SOCIALES est jusqu'à 40 % supérieure à celle des cours non déclarés. <Link to="/tarifs" className="text-[#0052D4] hover:underline font-medium">(Consulter notre grille tarifaire)</Link></p>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
                        <Building className="w-5 h-5 text-emerald-400" />
                        Cotisez et construisez vos droits sociaux.
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed pl-7">Ne laissez plus votre travail dans l'ombre. En facturant légalement via Colibri, vous existez aux yeux de l'État : vous cotisez pour votre retraite, vous validez des trimestres, et vous vous constituez un historique de revenus officiel pour vos futurs dossiers de location.</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-2">
                        <Shield className="w-5 h-5 text-emerald-400" />
                        Une gestion administrative 100 % automatisée.
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed pl-7">Nous vous accompagnons dans la création de votre statut en 5 minutes. Ensuite, Colibri génère vos factures et gère les prélèvements. Vous vous concentrez uniquement sur vos cours.</p>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* SECTION MISSION SOCIALE */}
            <section id="mission" className="py-16 px-6">
              <div className="max-w-4xl mx-auto">
                <div className="relative bg-white/85 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-3xl p-8 md:p-12 text-center overflow-hidden">

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
                      <Sparkles className="w-6 h-6 text-[#0052D4]" />
                    </h2>

                    <p className="text-base md:text-lg text-slate-700 leading-relaxed font-medium">
                      Historiquement, l'accompagnement par des étudiants issus des filières d'élite était un privilège réservé aux foyers les plus aisés. Le modèle d'optimisation financière de Colibri change la donne. En absorbant les coûts de gestion, nous permettons aux familles issues de la classe moyenne de s'offrir une éducation d'excellence qui leur était auparavant inaccessible. <br className="hidden md:block"/><br className="hidden md:block"/><strong className="text-[#0052D4] font-bold">En rejoignant Colibri, vous participez activement à rétablir l'égalité des chances.</strong>
                    </p>

                  </div>

                </div>
              </div>
            </section>

          </div>
        ) : (
          /* --- AUTHENTICATION FLOW --- */
          <div className="flex-1 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-300">
              <button
                onClick={() => { setRole(null); setShowAuth(false); setErrorMsg(null); setEmailSent(false); setMode("connexion"); }}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" /> Retour à l'accueil
              </button>

              {emailSent ? (
                <div className="bg-white/85 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MailCheck className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: "1.4rem", letterSpacing: "-0.02em", color: "#0F172A", marginBottom: "0.5rem" }}>Vérifiez votre boîte mail</h2>
                  <p className="text-slate-600 text-sm mb-8">
                    Un lien sécurisé a été envoyé à <strong>{email}</strong>. Cliquez dessus pour valider votre identité.
                  </p>
                  <button
                    onClick={() => { setEmailSent(false); setMode("connexion"); }}
                    className="w-full bg-[#0052D4] text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors active:scale-95"
                  >
                    J'ai cliqué, me connecter
                  </button>
                </div>
              ) : (
                <div className="bg-white/85 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-2xl p-8">
                  <div className="mb-8">
                    <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: "1.6rem", letterSpacing: "-0.02em", color: "#0F172A" }}>
                      {!role ? "Connexion" : role === "prof" ? "Espace Professeur" : "Espace Famille"}
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Gérez vos cours en toute simplicité.
                    </p>
                  </div>

                  {role && (
                    <div className="flex bg-slate-100/80 backdrop-blur-sm rounded-xl p-1.5 mb-6">
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

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === "inscription" && role && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Prénom</label>
                            <input type="text" value={prenom} onChange={(e) => setPrenom(e.target.value)} required className="w-full px-3 py-2.5 border border-slate-200/60 rounded-xl text-sm bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-[#0052D4] outline-none transition-all" />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Nom</label>
                            <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} required className="w-full px-3 py-2.5 border border-slate-200/60 rounded-xl text-sm bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-[#0052D4] outline-none transition-all" />
                          </div>
                        </div>
                        {role === "prof" && (
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Établissement (Grande École...)</label>
                            <div className="relative">
                              <input
                                type="text"
                                value={etablissement}
                                onChange={(e) => { setEtablissement(e.target.value); setShowEtabDropdown(true); }}
                                onFocus={() => setShowEtabDropdown(true)}
                                onBlur={() => setTimeout(() => setShowEtabDropdown(false), 150)}
                                required
                                className="w-full px-3 py-2.5 border border-slate-200/60 rounded-xl text-sm bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-[#0052D4] outline-none transition-all"
                              />
                              {showEtabDropdown && ETABLISSEMENTS.filter((e) => e.toLowerCase().includes(etablissement.toLowerCase())).length > 0 && (
                                <ul className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-10 max-h-48 overflow-y-auto">
                                  {ETABLISSEMENTS.filter((e) => e.toLowerCase().includes(etablissement.toLowerCase())).map((e) => (
                                    <li
                                      key={e}
                                      onMouseDown={() => { setEtablissement(e); setShowEtabDropdown(false); }}
                                      className="px-3 py-2.5 text-sm text-slate-700 cursor-pointer hover:bg-slate-50 list-none"
                                    >
                                      {e}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Adresse e-mail</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2.5 border border-slate-200/60 rounded-xl text-sm bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-[#0052D4] outline-none transition-all" />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-semibold text-slate-700">Mot de passe</label>
                      </div>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full px-3 py-2.5 border border-slate-200/60 rounded-xl text-sm bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-[#0052D4] outline-none transition-all pr-10" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {mode === "inscription" && role && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirmer le mot de passe</label>
                        <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className="w-full px-3 py-2.5 border border-slate-200/60 rounded-xl text-sm bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-[#0052D4] outline-none transition-all" />
                      </div>
                    )}

                    {errorMsg && (
                      <div className="p-3 bg-red-50/80 backdrop-blur-sm border border-red-200/60 rounded-xl text-sm text-red-600 font-medium flex items-start gap-2">
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-[#0052D4] to-[#4364F7] text-white py-3 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2 mt-4">
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
      <footer className="bg-white/60 backdrop-blur-xl border-t border-white/40 pt-16 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-[#0052D4] rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs leading-none">C</span>
                </div>
                <span className="font-bold text-slate-900">Colibri</span>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                L'excellence du soutien scolaire certifiée par l'État.
              </p>
              <div className="inline-flex items-center bg-[#1a1a2e] px-3 py-1.5 rounded-lg opacity-70 hover:opacity-100 transition-all">
                <img src={urssafBlanc} alt="Urssaf" className="h-5 object-contain" />
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4 text-sm">Plateforme</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><a href="#" className="hover:text-[#0052D4] transition-colors">Le concept</a></li>
                <li><Link to="/tarifs" className="hover:text-[#0052D4] transition-colors">Grille tarifaire</Link></li>
                <li><Link to="/ecoles" className="hover:text-[#0052D4] transition-colors">Écoles partenaires</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4 text-sm">Ressources</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link to="/mission" className="hover:text-[#0052D4] transition-colors">Notre mission</Link></li>
                <li><a href="#" className="hover:text-[#0052D4] transition-colors">Espace Professeur</a></li>
                <li><a href="#" className="hover:text-[#0052D4] transition-colors">Espace Parent</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-4 text-sm">Légal</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><a href="#" className="hover:text-[#0052D4] transition-colors">Mentions légales</a></li>
                <li><a href="#" className="hover:text-[#0052D4] transition-colors">CGV / CGU</a></li>
                <li><a href="#" className="hover:text-[#0052D4] transition-colors">Politique de confidentialité</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200/40 pt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-400">
              © 2026 Colibri SAS. Entreprise mandataire de Services à la Personne.
            </p>
            <p className="text-xs text-slate-400">
              Paiements sécurisés par virement bancaire.
            </p>
          </div>
        </div>
      </footer>

      {/* MODAL S'INSCRIRE */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white/90 backdrop-blur-xl border border-white/50 shadow-[0_16px_64px_rgba(0,0,0,0.12)] rounded-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-6 text-center border-b border-slate-100/60 relative">
              <h3 className="text-xl font-bold text-slate-900">Bienvenue sur Colibri</h3>
              <p className="text-sm text-slate-500 mt-1">Sélectionnez votre profil pour continuer</p>
              <button onClick={() => setShowRoleModal(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-900 transition-colors bg-slate-50/80 hover:bg-slate-100 rounded-md p-1.5 active:scale-95">
                ✕
              </button>
            </div>

            <div className="p-6 grid sm:grid-cols-2 gap-4">
               <button
                  onClick={() => handleStart("parent")}
                  className="flex flex-col items-center p-6 bg-white/60 backdrop-blur-sm border border-blue-100/60 rounded-xl hover:border-[#0052D4] hover:bg-blue-50/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all text-center active:scale-95"
                >
                  <Users className="w-8 h-8 text-[#0052D4] mb-3" />
                  <span className="font-semibold text-slate-900">Je suis parent</span>
               </button>

               <button
                  onClick={() => handleStart("prof")}
                  className="flex flex-col items-center p-6 bg-white/60 backdrop-blur-sm border border-slate-200/60 rounded-xl hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all text-center active:scale-95"
                >
                  <GraduationCap className="w-8 h-8 text-emerald-600 mb-3" />
                  <span className="font-semibold text-slate-900">Je suis étudiant</span>
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}