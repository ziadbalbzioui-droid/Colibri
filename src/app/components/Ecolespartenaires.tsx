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

const SCHOOLS = [
  {
    name: "Polytechnique (X)",
    label: "Ingénierie & Sciences",
    description: "L'école d'ingénieurs la plus prestigieuse de France. Un niveau en mathématiques et en physique inégalé pour un accompagnement d'élite.",
    tag: "Excellence Scientifique",
    logo: "/logos/x.png"
  },
  {
    name: "ENS Ulm",
    label: "Sciences & Humanités",
    description: "Le temple de la recherche et du savoir. Nos professeurs normaliens offrent une pédagogie exceptionnelle et une profondeur de réflexion unique.",
    tag: "Excellence Académique",
    logo: "/logos/ens.png"
  },
  {
    name: "Mines Paris - PSL",
    label: "Ingénierie & Sciences",
    description: "La référence de l'excellence scientifique française. Nos professeurs issus des Mines garantissent une maîtrise absolue des mathématiques et une méthodologie de travail rigoureuse.",
    tag: "Excellence Scientifique",
    logo: "/logos/mines.png"
  },
  {
    name: "HEC Paris",
    label: "Management & Stratégie",
    description: "Première école de commerce d'Europe. Ces professeurs transmettent l'exigence des classes préparatoires et une capacité de synthèse indispensable pour les examens.",
    tag: "Rigueur Académique",
    logo: "/logos/hec.png"
  },
  {
    name: "ESSEC Business School",
    label: "Innovation & Sciences Humaines",
    description: "Institution pionnière de l'élite française. Un profil de professeurs capables d'allier rigueur académique et ouverture d'esprit pour redonner confiance à l'élève.",
    tag: "Pédagogie Avancée",
    logo: "/logos/essec.png"
  },
  {
    name: "Centrale Supélec",
    label: "Sciences & Technologie",
    description: "Le fer de lance de l'innovation technologique. Des professeurs experts pour débloquer les matières scientifiques les plus complexes avec clarté et précision.",
    tag: "Expertise Technique",
    logo: "/logos/centrale.png"
  },
  {
    name: "ENS Paris-Saclay",
    label: "Sciences & Ingénierie",
    description: "L'excellence dans les sciences appliquées et fondamentales. Une approche rigoureuse pour exceller dans les matières scientifiques.",
    tag: "Rigueur Scientifique",
    logo: "/logos/ens_paris.png"
  },
  {
    name: "Dauphine - PSL",
    label: "Finance & Management",
    description: "L'université d'excellence en économie et gestion. Une expertise pointue pour les matières quantitatives et les sciences sociales.",
    tag: "Expertise Économique",
    logo: "/logos/dauphine.png"
  }
];

export function EcolesPartenaires() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900 selection:bg-blue-50">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 h-20 flex items-center justify-between transition-all">
        <div className="flex-1 flex items-center">
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => navigate("/")}>
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-700 transition-colors shadow-sm">
              <span className="text-white font-bold text-xl leading-none">C</span>
            </div>
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
        <section className="px-6 pt-16 pb-12 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-4">
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
              <div key={index} className="group border border-slate-100 rounded-2xl p-8 bg-white hover:bg-slate-50/50 transition-all duration-300">
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
        <section className="py-24 px-6 bg-slate-50/50 border-t border-slate-100">
          <div className="max-w-5xl mx-auto text-center">
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Un standard de qualité strict.</h2>
              <p className="text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto text-lg">
                La confiance ne se décrète pas, elle se prouve. L'accès à Colibri est conditionné par un processus de vérification en 4 étapes.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              {/* Etape 1 */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
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
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-900 text-lg mb-3">Sécurité et Légalité</h4>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Extrait de casier judiciaire vierge obligatoire, couplé à une vérification d'identité stricte (KYC) par notre partenaire bancaire Stripe.
                </p>
              </div>

              {/* Etape 3 */}
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
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
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 relative overflow-hidden group">
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
    </div>
  );
}