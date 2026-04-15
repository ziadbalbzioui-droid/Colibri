import { useNavigate, Link } from "react-router";
import { 
  Heart, 
  Handshake, 
  Sprout, 
  GraduationCap, 
  HeartHandshake, 
  Scale,
  Quote
} from "lucide-react";

export function Mission() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-rose-50/30 flex flex-col font-sans text-slate-900 selection:bg-purple-200">
      
      {/* HEADER (Strictement identique) */}
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
        
        {/* 1. HERO SECTION (L'accroche émotionnelle) */}
        <section className="relative px-6 py-24 md:py-32 bg-gradient-to-br from-purple-900 via-purple-800 to-rose-600 overflow-hidden text-center">
          {/* Effet de fond doux */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-white/5 blur-[120px] rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-4 backdrop-blur-sm border border-white/20">
              <Sprout className="w-6 h-6 text-rose-200" />
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
              L'excellence pour tous. <br className="hidden md:block"/>
              <span className="text-rose-200">Pas seulement pour quelques-uns.</span>
            </h1>
            <p className="text-lg md:text-xl text-purple-100 max-w-3xl mx-auto font-medium leading-relaxed">
              Chez Colibri, nous croyons que chaque enfant mérite d'être accompagné par les meilleurs, quels que soient les revenus de ses parents. Notre mission est de briser la barrière financière du soutien scolaire d'élite.
            </p>
          </div>
        </section>

        {/* 2. SECTION 1 : LE CONSTAT (Le problème que l'on résout) */}
        <section className="py-24 px-6 bg-slate-50">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-6 order-2 md:order-1">
              <h2 className="text-3xl md:text-4xl font-extrabold text-purple-900 leading-tight">
                L'injustice du système classique.
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                Historiquement, faire appel à un étudiant issu d'une prestigieuse Grande École coûtait extrêmement cher. Ces brillants profils facturent logiquement leur expertise à prix d'or sur le marché privé.
              </p>
              <p className="text-slate-600 text-lg leading-relaxed font-medium">
                Résultat ? Seules les familles les plus aisées pouvaient s'offrir ce niveau d'exigence, creusant ainsi les inégalités scolaires et la fracture sociale dès le plus jeune âge. <strong className="text-purple-800">Nous avons décidé de pirater ce système.</strong>
              </p>
            </div>
            
            {/* Visuel d'illustration abstrait/citation */}
            <div className="order-1 md:order-2 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-rose-200 to-purple-200 rounded-[3rem] transform rotate-3 scale-105 opacity-50"></div>
              <div className="relative bg-white p-10 rounded-[3rem] shadow-xl shadow-purple-900/5 border border-purple-100">
                <Quote className="w-12 h-12 text-rose-300 mb-6" />
                <p className="text-xl text-purple-950 font-bold leading-snug">
                  "L'éducation ne devrait jamais être un luxe réservé à une élite financière. Elle est le premier moteur de l'égalité des chances."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SECTION 2 : NOTRE SOLUTION (La solidarité par l'innovation) */}
        <section className="py-24 px-6 bg-white relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rose-50 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <div className="bg-white p-10 md:p-16 rounded-[3rem] border border-rose-200 shadow-xl shadow-purple-900/10 text-center">
              <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-8 transform -rotate-3">
                <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-8">
                Un modèle économique au service de l'égalité.
              </h2>
              
              <p className="text-lg text-slate-600 leading-relaxed font-medium">
                Notre modèle économique repose sur un principe de redistribution inédit : la plateforme subventionne directement les mentors qui font le choix de proposer des tarifs abordables. Ainsi, nous permettons aux familles de la classe moyenne et populaire d'accéder aux mêmes tuteurs d'élite que les milieux privilégiés. 
              </p>
              <p className="text-lg text-slate-600 leading-relaxed font-medium mt-4">
                Plus un professeur facture un tarif accessible pour aider une famille, plus Colibri gonfle sa prime. Le tout, en garantissant à nos étudiants un revenu légal, valorisant et supérieur au marché informel. <strong className="text-rose-600">C'est un cercle vertueux d'entraide.</strong>
              </p>
            </div>
          </div>
        </section>

        {/* 4. SECTION 3 : NOS 3 PILIERS (Grille de 3 cartes) */}
        <section className="py-24 px-6 bg-slate-50/80 border-t border-slate-100">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-extrabold text-slate-900">Les piliers de notre engagement</h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Carte 1 */}
              <div className="bg-white p-10 rounded-3xl border border-purple-100 shadow-sm hover:shadow-lg hover:shadow-purple-900/5 hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                  <Handshake className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Transmettre la réussite</h3>
                <p className="text-slate-600 font-medium leading-relaxed">
                  Nos étudiants ne donnent pas qu'un cours. Ils partagent les codes, la méthodologie et l'ambition qui les ont menés au succès, inspirant la génération suivante.
                </p>
              </div>

              {/* Carte 2 */}
              <div className="bg-white p-10 rounded-3xl border border-rose-100 shadow-sm hover:shadow-lg hover:shadow-rose-900/5 hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center mb-6">
                  <HeartHandshake className="w-7 h-7 text-rose-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Justice sociale</h3>
                <p className="text-slate-600 font-medium leading-relaxed">
                  En démocratisant les tarifs sans baisser la qualité, nous œuvrons pour que le talent et la motivation de l'élève soient les seuls critères de sa réussite scolaire.
                </p>
              </div>

              {/* Carte 3 */}
              <div className="bg-white p-10 rounded-3xl border border-indigo-100 shadow-sm hover:shadow-lg hover:shadow-indigo-900/5 hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6">
                  <Scale className="w-7 h-7 text-indigo-700" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Rémunération éthique</h3>
                <p className="text-slate-600 font-medium leading-relaxed">
                  L'excellence mérite d'être récompensée. Nous garantissons à nos étudiants une rémunération nette parmi les plus hautes du marché, tout en payant leurs cotisations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. CALL TO ACTION (Rejoindre le mouvement) */}
        <section className="py-24 px-6 bg-gradient-to-br from-purple-900 to-rose-600 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto space-y-10">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Rejoignez la communauté Colibri.
            </h2>
            <p className="text-xl text-purple-100 font-medium leading-relaxed">
              Que vous souhaitiez offrir le meilleur à votre enfant ou transmettre votre savoir pour financer vos études, vous avez votre place parmi nous.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button 
                onClick={() => navigate("/?role=parent")} 
                className="px-8 py-4 bg-white text-purple-900 rounded-full font-bold text-lg hover:bg-purple-50 transition-all active:scale-95 shadow-xl shadow-purple-900/20"
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

      {/* FOOTER PRO / SAAS (Strictement identique) */}
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