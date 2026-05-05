import { useNavigate, Link } from "react-router";
import urssafBlanc from "../../../assets/Urssaf_BLANC.png";
import {
  Heart,
  Handshake,
  Sprout,
  HeartHandshake,
  Scale,
  Quote
} from "lucide-react";

export function Mission() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col font-sans text-slate-900 selection:bg-blue-100">

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
            <img src="/src/assets/colibri.png" alt="Colibri" className="w-9 h-9 object-contain" />
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">Colibri</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center justify-center gap-8">
          <a href="/#concept" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Le concept</a>
          <Link to="/tarifs" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Grille tarifaire</Link>
          <Link to="/ecoles" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Les Écoles partenaires</Link>
          <Link to="/mission" className="text-sm font-semibold text-blue-600 transition-colors">Notre mission</Link>
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

        {/* 1. HERO SECTION */}
        <section className="relative px-6 pt-16 pb-12 text-center">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-full mb-4 border border-blue-200">
              <Sprout className="w-6 h-6 text-blue-600" />
            </div>
            <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: "clamp(2.4rem, 6vw, 4rem)", letterSpacing: "-0.02em", color: "#0F172A", lineHeight: 1.15 }}>
              L'excellence pour tous. <br className="hidden md:block"/>
              <span style={{ color: "#0052D4" }}>Pas seulement pour quelques-uns.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed">
              Chez Colibri, nous croyons que chaque enfant mérite d'être accompagné par les meilleurs, quels que soient les revenus de ses parents. Notre mission est de briser la barrière financière du soutien scolaire d'élite.
            </p>
          </div>
        </section>

        {/* 2. SECTION 1 : LE CONSTAT */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 order-2 md:order-1">
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight">
                L'injustice du système classique.
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                Historiquement, faire appel à un étudiant issu d'une prestigieuse Grande École coûtait extrêmement cher. Ces brillants profils facturent logiquement leur expertise à prix d'or sur le marché privé.
              </p>
              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                Résultat ? Seules les familles les plus aisées pouvaient s'offrir ce niveau d'exigence, creusant ainsi les inégalités scolaires et la fracture sociale dès le plus jeune âge. <strong className="text-[#0052D4]">Nous avons décidé de pirater ce système.</strong>
              </p>
            </div>

            <div className="order-1 md:order-2 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-200 to-indigo-200 rounded-[3rem] transform rotate-3 scale-105 opacity-50"></div>
              <div className="relative bg-white/85 backdrop-blur-xl p-10 rounded-[3rem] shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-blue-100">
                <Quote className="w-12 h-12 text-blue-300 mb-6" />
                <p className="text-xl text-slate-900 font-bold leading-snug">
                  "L'éducation ne devrait jamais être un luxe réservé à une élite financière. Elle est le premier moteur de l'égalité des chances."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SECTION 2 : NOTRE SOLUTION */}
        <section className="py-24 px-6 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="bg-white/85 backdrop-blur-xl p-10 md:p-16 rounded-[3rem] border border-blue-200/60 shadow-[0_8px_32px_rgba(0,82,212,0.08)] text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-8 transform -rotate-3">
                <Heart className="w-8 h-8 text-blue-600 fill-blue-600" />
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-8">
                Un modèle économique au service de l'égalité.
              </h2>

              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                Notre modèle économique repose sur un principe de redistribution inédit : la plateforme subventionne directement les mentors qui font le choix de proposer des tarifs abordables. Ainsi, nous permettons aux familles de la classe moyenne et populaire d'accéder aux mêmes tuteurs d'élite que les milieux privilégiés.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed font-medium mt-4">
                Plus un professeur facture un tarif accessible pour aider une famille, plus Colibri gonfle sa prime. Le tout, en garantissant à nos étudiants un revenu légal, valorisant et supérieur au marché informel. <strong className="text-[#0052D4]">C'est un cercle vertueux d'entraide.</strong>
              </p>
            </div>
          </div>
        </section>

        {/* 4. SECTION 3 : NOS 3 PILIERS */}
        <section className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-slate-900">Les piliers de notre engagement</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white/85 backdrop-blur-xl p-10 rounded-3xl border border-blue-100 shadow-[0_8px_32px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_40px_rgba(0,82,212,0.1)] hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                  <Handshake className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Transmettre la réussite</h3>
                <p className="text-slate-600 font-medium leading-relaxed">
                  Nos étudiants ne donnent pas qu'un cours. Ils partagent les codes, la méthodologie et l'ambition qui les ont menés au succès, inspirant la génération suivante.
                </p>
              </div>

              <div className="bg-white/85 backdrop-blur-xl p-10 rounded-3xl border border-indigo-100 shadow-[0_8px_32px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_40px_rgba(79,70,229,0.1)] hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                  <HeartHandshake className="w-7 h-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Justice sociale</h3>
                <p className="text-slate-600 font-medium leading-relaxed">
                  En démocratisant les tarifs sans baisser la qualité, nous œuvrons pour que le talent et la motivation de l'élève soient les seuls critères de sa réussite scolaire.
                </p>
              </div>

              <div className="bg-white/85 backdrop-blur-xl p-10 rounded-3xl border border-cyan-100 shadow-[0_8px_32px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_40px_rgba(6,182,212,0.1)] hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-cyan-100 rounded-2xl flex items-center justify-center mb-6">
                  <Scale className="w-7 h-7 text-cyan-700" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Rémunération éthique</h3>
                <p className="text-slate-600 font-medium leading-relaxed">
                  L'excellence mérite d'être récompensée. Nous garantissons à nos étudiants une rémunération nette parmi les plus hautes du marché, tout en payant leurs cotisations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. CALL TO ACTION */}
        <section className="py-24 px-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0052D4] via-[#4364F7] to-[#4FACFE]"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl mx-auto space-y-10">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Rejoignez la communauté Colibri.
            </h2>
            <p className="text-xl text-blue-100 font-medium leading-relaxed">
              Que vous souhaitiez offrir le meilleur à votre enfant ou transmettre votre savoir pour financer vos études, vous avez votre place parmi nous.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                onClick={() => navigate("/?role=parent")}
                className="px-8 py-4 bg-white text-[#0052D4] rounded-full font-bold text-lg hover:bg-blue-50 transition-all active:scale-95 shadow-xl shadow-blue-900/20"
              >
                Je cherche un professeur
              </button>
              <button
                onClick={() => navigate("/?role=prof")}
                className="px-8 py-4 bg-transparent border-2 border-white/80 text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all active:scale-95"
              >
                Je veux donner des cours
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <img src="/src/assets/colibri.png" alt="Colibri" className="w-6 h-6 object-contain" />
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

          <div className="border-t border-slate-200 pt-8 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
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
