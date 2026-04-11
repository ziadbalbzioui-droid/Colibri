import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { 
  Calculator, 
  TrendingUp, 
  ShieldCheck, 
  Wallet,
  ArrowRight,
  PiggyBank,
  Landmark,
  Sparkles,
  Plus,
  Trash2,
  Info
} from "lucide-react";

// Types pour le simulateur multi-élèves
type Eleve = {
  id: string;
  heures: number;
  taux: number;
};

export function Tarifs() {
  const navigate = useNavigate();
  
  // --- LOGIQUE SIMULATEUR MULTI-ÉLÈVES ---
  const [eleves, setEleves] = useState<Eleve[]>([
    { id: "1", heures: 4, taux: 30 }
  ]);

  const addEleve = () => {
    setEleves([...eleves, { id: Math.random().toString(), heures: 2, taux: 35 }]);
  };

  const updateEleve = (id: string, field: keyof Eleve, value: number) => {
    setEleves(eleves.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const removeEleve = (id: string) => {
    if (eleves.length > 1) {
      setEleves(eleves.filter(e => e.id !== id));
    }
  };

  // Calcul du pourcentage basé EXCTEMENT sur ton image (Interpolation linéaire)
  const calculateBonusPercent = (taux: number) => {
    if (taux <= 15) return 0.40;
    if (taux >= 60) return 0.15;
    
    const dataPoints = [
      { x: 15, y: 0.40 },
      { x: 20, y: 0.30 },
      { x: 25, y: 0.25 },
      { x: 30, y: 0.25 },
      { x: 35, y: 0.23 },
      { x: 40, y: 0.20 },
      { x: 45, y: 0.18 },
      { x: 50, y: 0.16 },
      { x: 55, y: 0.15 },
      { x: 60, y: 0.15 }
    ];

    for (let i = 0; i < dataPoints.length - 1; i++) {
      if (taux >= dataPoints[i].x && taux <= dataPoints[i+1].x) {
        const x1 = dataPoints[i].x;
        const y1 = dataPoints[i].y;
        const x2 = dataPoints[i+1].x;
        const y2 = dataPoints[i+1].y;
        
        if (x1 === x2) return y1;
        return y1 + ((taux - x1) * (y2 - y1)) / (x2 - x1);
      }
    }
    return 0.15;
  };

  // Calculs totaux
  const totalBlack = eleves.reduce((acc, e) => acc + (e.heures * e.taux), 0);
  const totalColibri = eleves.reduce((acc, e) => {
    const bonus = calculateBonusPercent(e.taux);
    return acc + Math.round((e.heures * e.taux) * (1 + bonus));
  }, 0);
  const totalHeures = eleves.reduce((acc, e) => acc + e.heures, 0);

  // --- DONNÉES POUR LE GRAPHIQUE (Correspondent à ton image) ---
  const graphData = [
    { taux: 15, bonus: 40 },
    { taux: 20, bonus: 30 },
    { taux: 25, bonus: 25 },
    { taux: 30, bonus: 25 },
    { taux: 35, bonus: 23 },
    { taux: 40, bonus: 20 },
    { taux: 45, bonus: 18 },
    { taux: 50, bonus: 16 },
    { taux: 55, bonus: 15 },
    { taux: 60, bonus: 15 }
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-900 selection:bg-blue-100">
      
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
          <Link to="/tarifs" className="text-sm font-semibold text-blue-600 transition-colors">Grille tarifaire</Link>
          <Link to="/ecoles" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Les Écoles partenaires</Link>
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

      <main className="flex-1 bg-slate-50/50">
        
        {/* TITRE SIMPLE */}
        <section className="px-6 pt-16 pb-12 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-4">
            Grille Tarifaire & Rémunération
          </h1>
          <p className="text-slate-500 font-medium max-w-2xl mx-auto">
            Comprenez comment l'optimisation fiscale permet d'augmenter votre revenu net légal par rapport au marché informel.
          </p>
        </section>

        {/* CONTENU PRINCIPAL : GRAPHIQUE + SIMULATEUR */}
        <section className="px-6 pb-24 max-w-6xl mx-auto grid lg:grid-cols-12 gap-8">
          
          {/* COLONNE GAUCHE : LE GRAPHIQUE */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm h-fit">
            <div className="flex items-center gap-2 mb-8">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-slate-900">Courbe des gains</h2>
            </div>

            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              Dans une démarche d'égalité des chances, notre modèle redistributif subventionne plus fortement les cours à des tarifs abordables. Cela permet aux familles de la classe moyenne d'accéder à l'excellence académique, tout en vous garantissant une rémunération très attractive.
            </p>

            {/* Représentation Visuelle (Bar Chart) */}
            <div className="space-y-3">
              {graphData.map((data, i) => (
                <div key={i} className="flex items-center gap-4">
                  {/* Axe Y (Prix) */}
                  <div className="w-12 text-right text-sm font-semibold text-slate-700">
                    {data.taux}€
                  </div>
                  {/* Barre */}
                  <div className="flex-1 h-7 bg-slate-100 rounded-lg overflow-hidden flex relative">
                    <div 
                      className="h-full bg-blue-600 flex items-center px-3" 
                      style={{ width: `${(data.bonus / 40) * 100}%` }}
                    >
                      <span className="text-white text-xs font-bold">+{data.bonus}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-xs text-slate-500 text-center font-medium border-t border-slate-100 pt-5 px-2 leading-relaxed">
              L'augmentation affichée correspond au gain <strong className="text-slate-700">APRÈS impôts et cotisations sociales</strong>, soit le montant qui arrivera effectivement dans votre porte-monnaie.
            </div>
          </div>

          {/* COLONNE DROITE : LE SIMULATEUR COMPLET */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex flex-col h-fit">
            
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-slate-400" />
                  Simulateur multi-élèves
                </h2>
                <p className="text-xs text-slate-500 mt-1">Ajoutez vos différentes heures de cours pour voir le total.</p>
              </div>
              <button 
                onClick={addEleve}
                className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-4 h-4" /> Ajouter
              </button>
            </div>

            <div className="p-8 flex-1 space-y-6">
              {/* Lignes d'élèves */}
              {eleves.map((eleve, index) => (
                <div key={eleve.id} className="flex items-end gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Élève {index + 1} (Heures/mois)
                    </label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range" min="1" max="40" step="1"
                        value={eleve.heures}
                        onChange={(e) => updateEleve(eleve.id, 'heures', parseInt(e.target.value))}
                        className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="w-20 flex items-center justify-end bg-white border border-slate-200 rounded-lg focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all overflow-hidden shadow-sm">
                        <input 
                          type="number"
                          value={eleve.heures === 0 ? "" : eleve.heures}
                          onChange={(e) => updateEleve(eleve.id, 'heures', parseInt(e.target.value) || 0)}
                          className="w-full text-sm font-bold text-slate-700 text-right outline-none py-1.5 px-1 bg-transparent [&::-webkit-inner-spin-button]:appearance-none"
                          style={{ MozAppearance: 'textfield' }}
                        />
                        <span className="text-sm font-bold text-slate-400 pr-2 select-none">h</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      Prix souhaité (€/h)
                    </label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range" min="15" max="60" step="1"
                        value={eleve.taux}
                        onChange={(e) => updateEleve(eleve.id, 'taux', parseInt(e.target.value))}
                        className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="w-20 flex items-center justify-end bg-white border border-slate-200 rounded-lg focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all overflow-hidden shadow-sm">
                        <input 
                          type="number"
                          value={eleve.taux === 0 ? "" : eleve.taux}
                          onChange={(e) => updateEleve(eleve.id, 'taux', parseInt(e.target.value) || 0)}
                          className="w-full text-sm font-bold text-slate-700 text-right outline-none py-1.5 px-1 bg-transparent [&::-webkit-inner-spin-button]:appearance-none"
                          style={{ MozAppearance: 'textfield' }}
                        />
                        <span className="text-sm font-bold text-slate-400 pr-2 select-none">€</span>
                      </div>
                    </div>
                  </div>

                  {eleves.length > 1 && (
                    <button 
                      onClick={() => removeEleve(eleve.id)}
                      className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors mb-0.5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Total et Comparatif */}
            <div className="bg-slate-900 p-8 text-white mt-auto relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[80px] rounded-full pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                
                {/* Marché Noir */}
                <div className="w-full md:w-auto">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Marché au Black
                  </div>
                  <div className="text-2xl font-bold text-slate-500 line-through decoration-slate-600">
                    {totalBlack} €
                  </div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3" /> Zéro cotisation retraite
                  </div>
                </div>

                <ArrowRight className="hidden md:block w-6 h-6 text-slate-600 shrink-0" />

                {/* Colibri */}
                <div className="w-full md:w-auto">
                  <div className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> Avec Colibri (Après Impôts et Cotisations)
                  </div>
                  <div className="text-4xl font-extrabold text-white flex items-baseline gap-2">
                    {totalColibri} € 
                    <span className="text-sm font-medium text-slate-400">pour {totalHeures}h / mois</span>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 text-sm font-semibold border border-blue-500/30">
                    Gain financier : +{totalColibri - totalBlack} € + cotisations retraite
                  </div>
                </div>

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