import { useNavigate, Link } from "react-router";
import {
  GraduationCap,
  CheckCircle2,
  ArrowRight,
  Search,
  ShieldCheck,
  Trophy,
  Users,
  Building2,
  FileSearch,
  UserCheck
} from "lucide-react";
import urssafBlanc from "../../../assets/Urssaf_BLANC.png";

const SCHOOLS = [
  {
    name: "Polytechnique (X)",
    label: "Ingénierie & Sciences",
    description: "L'école d'ingénieurs la plus prestigieuse de France. Un niveau en mathématiques et en physique inégalé pour un accompagnement d'élite.",
    tag: "Excellence Scientifique",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/POLYTECHNIQUE-IP_PARIS.png/250px-POLYTECHNIQUE-IP_PARIS.png"
  },
  {
    name: "ENS Ulm",
    label: "Sciences & Humanités",
    description: "Le temple de la recherche et du savoir. Nos professeurs normaliens offrent une pédagogie exceptionnelle et une profondeur de réflexion unique.",
    tag: "Excellence Académique",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Logo_%C3%89cole_normale_sup%C3%A9rieure_-_PSL_%28ENS-PSL%29.svg/250px-Logo_%C3%89cole_normale_sup%C3%A9rieure_-_PSL_%28ENS-PSL%29.svg.png"
  },
  {
    name: "Mines Paris - PSL",
    label: "Ingénierie & Sciences",
    description: "La référence de l'excellence scientifique française. Nos professeurs issus des Mines garantissent une maîtrise absolue des mathématiques et une méthodologie de travail rigoureuse.",
    tag: "Excellence Scientifique",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Logo_Mines_Paris_-_PSL.png/330px-Logo_Mines_Paris_-_PSL.png"
  },
  {
    name: "HEC Paris",
    label: "Management & Stratégie",
    description: "Première école de commerce d'Europe. Ces professeurs transmettent l'exigence des classes préparatoires et une capacité de synthèse indispensable pour les examens.",
    tag: "Rigueur Académique",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/HEC_Paris.svg/250px-HEC_Paris.svg.png"
  },
  {
    name: "ESSEC Business School",
    label: "Innovation & Sciences Humaines",
    description: "Institution pionnière de l'élite française. Un profil de professeurs capables d'allier rigueur académique et ouverture d'esprit pour redonner confiance à l'élève.",
    tag: "Pédagogie Avancée",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Logo_essec2.svg/250px-Logo_essec2.svg.png"
  },
  {
    name: "CentraleSupélec",
    label: "Sciences & Technologie",
    description: "Le fer de lance de l'innovation technologique. Des professeurs experts pour débloquer les matières scientifiques les plus complexes avec clarté et précision.",
    tag: "Expertise Technique",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/LogoCS.png/250px-LogoCS.png"
  },
  {
    name: "ENS Paris-Saclay",
    label: "Sciences & Ingénierie",
    description: "L'excellence dans les sciences appliquées et fondamentales. Une approche rigoureuse pour exceller dans les matières scientifiques.",
    tag: "Rigueur Scientifique",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Logo_Universit%C3%A9_Paris-Saclay_%28ComUE%29.svg/250px-Logo_Universit%C3%A9_Paris-Saclay_%28ComUE%29.svg.png"
  },
  {
    name: "Dauphine - PSL",
    label: "Finance & Management",
    description: "L'université d'excellence en économie et gestion. Une expertise pointue pour les matières quantitatives et les sciences sociales.",
    tag: "Expertise Économique",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Dauphine_logo_2019_-_Bleu.png/250px-Dauphine_logo_2019_-_Bleu.png"
  }
];

export function EcolesPartenaires() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col font-sans text-slate-900 selection:bg-blue-50">

      {/* FOND */}
      <div className="fixed inset-0 -z-20 bg-[#f0f4f8]" />

      {/* SVG VAGUES OBLIQUES */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
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

          <g>
            <path fill="url(#wvA)" opacity="0.7" d="M-200,0 L400,0 C350,50 250,180 200,280 C150,380 50,420 -50,350 C-150,280 -200,150 -200,0 Z" />
            <path fill="url(#wvB)" opacity="0.55" d="M-100,0 L500,0 L300,350 C250,420 150,480 50,430 C-50,380 -120,280 -150,180 L-100,0 Z" />
            <path fill="url(#wvC)" opacity="0.65" d="M0,0 L550,0 L350,300 C280,400 180,350 100,400 C20,450 -80,380 -120,280 C-160,180 -80,80 0,0 Z" />
          </g>

          <g>
            <path fill="url(#wvC)" opacity="0.45" d="M-100,200 C100,150 300,350 500,250 C700,150 850,300 950,200 L800,0 L-100,0 Z" />
            <path fill="url(#wvA)" opacity="0.35" d="M-50,350 C150,280 350,450 550,350 C750,250 900,380 1050,300 L900,100 L-50,100 Z" />
          </g>

          <g>
            <path fill="url(#wvD)" opacity="0.65" d="M1500,1100 C1240,1100 1000,1050 1040,850 C1100,700 1200,720 1260,620 C1320,520 1420,480 1500,550 C1580,620 1520,780 1500,1100 Z" />
            <path fill="url(#wvE)" opacity="0.55" d="M1600,1150 C1200,1150 850,1050 940,800 C1000,650 1050,600 1140,550 C1200,470 1300,430 1400,480 C1500,530 1560,650 1580,750 C1600,850 1600,1000 1600,1150 Z" />
            <path fill="url(#wvB)" opacity="0.6" d="M1500,1150 C1100,1150 800,1000 900,800 C950,700 1000,650 1100,600 C1180,500 1280,550 1360,500 C1440,450 1520,520 1560,620 C1600,720 1520,820 1500,1150 Z" />
          </g>

          <g>
            <path fill="url(#wvA)" opacity="0.3" d="M1440,0 L1440,200 C1380,250 1280,180 1200,220 C1120,260 1080,180 1100,100 C1120,40 1200,0 1300,0 Z" />
            <path fill="url(#wvE)" opacity="0.25" d="M1440,0 L1440,300 C1350,330 1250,250 1180,300 C1110,350 1050,280 1080,200 C1110,120 1200,60 1300,30 L1440,0 Z" />
          </g>
        </svg>

        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute right-0 w-[45%] h-[65%]" style={{ top: '60%' }}>
          <path fill="#00F2FE" opacity="0.5" d="M100,100 L100,25 Q92,20 82,32 Q68,48 58,65 Q50,80 45,92 Q42,100 100,100 Z" />
          <path fill="#43E7E0" opacity="0.4" d="M100,100 L100,38 Q95,30 88,42 Q75,56 65,72 Q58,85 52,96 Q50,100 100,100 Z" />
          <path fill="#4FACFE" opacity="0.45" d="M100,100 L100,48 Q96,42 90,52 Q80,64 72,78 Q65,90 60,98 Q58,100 100,100 Z" />
        </svg>

        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute left-0 w-[35%] h-[55%]" style={{ top: '80%' }}>
          <path fill="#0052D4" opacity="0.35" d="M0,100 L0,28 Q8,22 18,34 Q32,52 42,68 Q50,82 55,94 Q58,100 0,100 Z" />
          <path fill="#4FACFE" opacity="0.25" d="M0,100 L0,40 Q6,32 16,44 Q28,58 38,74 Q46,86 50,96 Q52,100 0,100 Z" />
        </svg>

        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute left-0 w-[50%] h-[60%]" style={{ top: '130%' }}>
          <path fill="#00F2FE" opacity="0.45" d="M0,100 L0,30 Q10,22 22,35 Q36,52 46,68 Q54,82 58,94 Q60,100 0,100 Z" />
          <path fill="#43E7E0" opacity="0.35" d="M0,100 L0,42 Q8,34 18,46 Q30,60 40,75 Q48,88 52,97 Q54,100 0,100 Z" />
        </svg>

        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute right-0 w-[40%] h-[55%]" style={{ top: '150%' }}>
          <path fill="#0052D4" opacity="0.4" d="M100,0 L100,72 Q92,80 82,70 Q68,55 58,38 Q50,22 45,10 Q42,0 100,0 Z" />
          <path fill="#4364F7" opacity="0.35" d="M100,8 L100,65 Q94,74 85,62 Q72,48 62,32 Q55,18 50,8 Q48,0 100,8 Z" />
        </svg>
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/40 px-6 h-20 flex items-center justify-between shadow-[0_4px_24px_rgba(0,0,0,0.04)] transition-all">
        <div className="flex-1 flex items-center">
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate("/")}>
            <img src="/src/assets/colibri.svg" alt="Colibri" className="w-9 h-9 object-contain" />
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">Colibri</span>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center justify-center gap-8">
          <a href="/#concept" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Le concept</a>
          <Link to="/tarifs" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Grille tarifaire</Link>
          <Link to="/ecoles" className="text-sm font-semibold text-blue-600">Les Écoles partenaires</Link>
          <Link to="/mission" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Notre mission</Link>
        </nav>

        <div className="flex-1 flex items-center justify-end gap-5">
          <button onClick={() => navigate("/")} className="text-sm font-semibold text-slate-600 hover:text-slate-900 hidden sm:block">
            Se connecter
          </button>
          <button onClick={() => navigate("/")} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-sm">
            S'inscrire
          </button>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO SECTION RÉDUITE - Accès direct aux écoles */}
        <section className="px-6 pt-16 pb-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: "clamp(2rem, 4vw, 2.8rem)", letterSpacing: "-0.02em", color: "#0F172A", marginBottom: "1rem" }}>
              Nos Écoles Partenaires
            </h1>
            <p className="text-base text-slate-500 max-w-xl mx-auto font-medium leading-relaxed">
              Nous collaborons avec les meilleures institutions académiques françaises pour garantir un niveau d'excellence inégalé à nos élèves.
            </p>
          </div>
        </section>

        {/* GRID DES ECOLES */}
        <section className="pb-20 px-6 max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {SCHOOLS.map((school, index) => (
              <div key={index} className="group border border-white/50 rounded-2xl p-8 bg-white/85 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300">
                <div className="flex items-center gap-4 mb-6">
                  {/* Container avec l'image locale */}
                  <div className="w-14 h-14 bg-white border border-slate-100 rounded-xl flex items-center justify-center shadow-sm p-2 overflow-hidden">
                    <img 
                      src={school.logo} 
                      alt={`Logo ${school.name}`} 
                      className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{school.name}</h3>
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">{school.tag}</span>
                  </div>
                </div>
                
                <p className="text-slate-600 leading-relaxed mb-6 text-sm font-medium">
                  {school.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION CRITÈRES - Confiance & Audit (Nouveau design) */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto text-center">
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Un standard de qualité strict.</h2>
              <p className="text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto text-lg">
                La confiance ne se décrète pas, elle se prouve. L'accès à Colibri est conditionné par un processus de vérification en 4 étapes.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {/* Etape 1 */}
              <div className="bg-white/85 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.05)] p-8 rounded-3xl hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                  <FileSearch className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg mb-3">Parcours Académique</h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Nous exigeons un certificat de scolarité valide, vérifié manuellement auprès du secrétariat des écoles d'excellence.
                </p>
              </div>

              {/* Etape 2 */}
              <div className="bg-white/85 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.05)] p-8 rounded-3xl hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg mb-3">Sécurité et Légalité</h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Extrait de casier judiciaire vierge obligatoire, couplé à une vérification d'identité stricte pour garantir la sécurité des élèves.
                </p>
              </div>

              {/* Etape 3 */}
              <div className="bg-white/85 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.05)] p-8 rounded-3xl hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-6 text-amber-600">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg mb-3">Transparence</h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Pas de mise en relation à l'aveugle. Les professeurs détaillent leur pédagogie. Vous choisissez l'étudiant idéal pour votre enfant.
                </p>
              </div>

              {/* Etape 4 */}
              <div className="bg-white/85 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.05)] p-8 rounded-3xl hover:shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 text-purple-600">
                  <Trophy className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg mb-3">Évaluation Continue</h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Les professeurs sont évalués en temps réel. Un niveau de satisfaction inférieur à 4.8/5 entraîne une exclusion de la plateforme.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER PRO / SAAS */}
      <footer className="bg-white/70 backdrop-blur-xl border-t border-white/40 pt-16 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src="/src/assets/colibri.svg" alt="Colibri" className="w-6 h-6 object-contain" />
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
                <li><a href="/#concept" className="hover:text-blue-600 transition-colors">Le concept</a></li>
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
          
          <div className="border-t border-white/30 pt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-400">
              © 2026 Colibri SAS. Entreprise mandataire de Services à la Personne.
            </p>
            <p className="text-xs text-slate-400">
              Paiements sécurisés par virement bancaire.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}