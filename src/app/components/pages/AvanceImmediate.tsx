import { useNavigate, Link } from "react-router";
import { ExternalLink } from "lucide-react";
import urssafColor from "../../../assets/Urssaf_Baseline-RVB.jpg";
import urssafBlanc from "../../../assets/Urssaf_BLANC.png";

export function AvanceImmediate() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col font-sans text-slate-900 selection:bg-blue-100">

      <div className="fixed inset-0 -z-20 bg-[#f0f4f8]" />
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <svg viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" className="absolute -inset-10 w-[calc(100%+80px)] h-[calc(100%+80px)]">
          <defs>
            <linearGradient id="aiA" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00F2FE" /><stop offset="100%" stopColor="#0099E5" /></linearGradient>
            <linearGradient id="aiB" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#4FACFE" /><stop offset="100%" stopColor="#00F2FE" /></linearGradient>
            <linearGradient id="aiC" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#0052D4" /><stop offset="50%" stopColor="#4364F7" /><stop offset="100%" stopColor="#6FB1FC" /></linearGradient>
          </defs>
          <g>
            <path fill="url(#aiA)" opacity="0.6" d="M-200,0 L400,0 C350,50 250,180 200,280 C150,380 50,420 -50,350 C-150,280 -200,150 -200,0 Z" />
            <path fill="url(#aiC)" opacity="0.5" d="M0,0 L550,0 L350,300 C280,400 180,350 100,400 C20,450 -80,380 -120,280 C-160,180 -80,80 0,0 Z" />
          </g>
          <g>
            <path fill="url(#aiA)" opacity="0.2" d="M1440,0 L1440,300 C1350,330 1250,250 1180,300 C1110,350 1050,280 1080,200 C1110,120 1200,60 1300,30 L1440,0 Z" />
          </g>
        </svg>
      </div>

      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/40 px-6 h-20 flex items-center justify-between shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        <div className="flex-1 flex items-center">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate("/")}>
            <img src="/src/assets/colibri.svg" alt="Colibri" className="w-9 h-9 object-contain" />
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">Colibri</span>
          </div>
        </div>
        <nav className="hidden md:flex items-center justify-center gap-8">
          <a href="/#concept" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Le concept</a>
          <Link to="/ecoles" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Les Écoles partenaires</Link>
          <Link to="/mission" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">Notre mission</Link>
        </nav>
        <div className="flex-1 flex items-center justify-end gap-5">
          <button onClick={() => navigate("/")} className="text-sm font-semibold text-slate-600 hover:text-slate-900 hidden sm:block">Se connecter</button>
          <button onClick={() => navigate("/")} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-sm">S'inscrire</button>
        </div>
      </header>

      <main className="flex-1">

        {/* ── HERO ── */}
        <section className="px-6 pt-20 pb-16 max-w-4xl mx-auto">
          <h1 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: "clamp(2.4rem, 6vw, 4.2rem)", letterSpacing: "-0.025em", lineHeight: 1.1, color: "#0F172A" }}>
            Vous payez autant qu'un cours<br className="hidden md:block" />
            <span style={{ color: "#0052D4" }}>non déclaré.</span>
          </h1>
          <div className="mt-8 max-w-2xl space-y-5">
            <p className="text-lg text-slate-600 font-medium leading-relaxed">
              Notre volonté est de valoriser la transmission des connaissances des meilleurs étudiants, sans pour autant les détourner des bourses modestes.
            </p>
            <p className="text-base text-slate-500 leading-relaxed">
              Ainsi, nous utilisons l'avance immédiate de crédit d'impôt dans le but d'<span style={{ color: "#0052D4" }}>augmenter les revenus des étudiants selon un pourcentage dégressif suivant leur taux horaire</span>, ce qui réduit l'enchère des prix, et d'<span style={{ color: "#0052D4" }}>offrir un service qui simplifie les démarches administratives des parents et des étudiants</span> pour les aider à se déclarer.
            </p>
            <p className="text-sm font-semibold text-slate-700 pl-4 border-l-2 border-[#0052D4]">
              Tout cela est fait de sorte qu'il vous est finalement prélevé autant que ce que vous auriez payé sans le déclarer.
            </p>
          </div>
        </section>

        {/* ── LE MÉCANISME — INFOGRAPHIE ── */}
        <section className="px-6 pb-20">
          <div className="max-w-4xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Ce que vous payez</p>
            <div className="bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.07)]">

              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">

                {/* SANS COLIBRI */}
                <div className="px-8 py-10">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-7">Sans Colibri</p>
                  <div className="space-y-3 mb-5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Cours (non déclaré)</span>
                      <span className="font-semibold text-slate-700 tabular-nums">30 €</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Crédit d'impôt État</span>
                      <span className="font-semibold text-slate-300 tabular-nums">0 €</span>
                    </div>
                    <div className="h-px bg-slate-200" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">Vous payez</span>
                      <span className="text-3xl font-black text-slate-900 tabular-nums">30 €</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400">Le prof touche 30 €, sans protection sociale ni cotisations.</p>
                </div>

                {/* AVEC COLIBRI */}
                <div className="px-8 py-10 bg-slate-50/60">
                  <p className="text-xs font-bold uppercase tracking-widest text-[#0052D4] mb-7">Avec Colibri</p>
                  <div className="space-y-3 mb-5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Facture déclarée (cours et services)</span>
                      <span className="font-semibold text-slate-700 tabular-nums">60 €</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Crédit d'impôt État</span>
                      <span className="font-semibold text-[#0052D4] tabular-nums">− 30 €</span>
                    </div>
                    <div className="h-px bg-slate-200" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">Vous payez</span>
                      <span className="text-3xl font-black text-slate-900 tabular-nums">30 €</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mb-3">Le prof touche <strong className="text-slate-700">46 € bruts</strong>.</p>
                  <p className="text-sm font-semibold text-[#0052D4]">
                    Vous payez le même prix que sans Colibri, sans démarches lourdes supplémentaires.
                  </p>
                </div>
              </div>

              <div className="px-8 py-5 bg-blue-50/60 border-t border-blue-100/60">
                <p className="text-sm text-slate-600">
                  <strong className="text-slate-800">Pas d'avance, pas d'attente.</strong> Le crédit d'impôt est déduit en temps réel au moment du prélèvement — vous ne payez que votre 50 %, c'est tout.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ── CE QUE ÇA CHANGE ── */}
        <section className="px-6 pb-20">
          <div className="max-w-4xl mx-auto">

            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">A quoi ça sert ?</p>
            <p className="text-slate-500 text-lg leading-relaxed max-w-2xl mb-14">
              Avec notre modèle, nous rêvons de lisser les revenus des étudiants pour <span className="font-bold">mettre en avant la transmission du savoir sans l'impact des limites financières des familles</span> et d'augmenter les revenus des étudiants qui enseignent pour les encourager à partager leurs connaissances.
            </p>

            <div className="grid md:grid-cols-3 gap-10">

              <div className="border-t-2 border-[#0052D4] pt-6">
                <p className="text-4xl font-black text-[#0052D4] tabular-nums mb-4">+40 %</p>
                <h3 className="font-bold text-slate-900 mb-2">Les étudiants sont mieux rémunérés.</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Avec une revalorisation dégressive suivant le taux horaire du professeur, nous encourageons les étudiants à enseigner, en rémunérant davantage leur travail (même après cotisations sociales) et sans se soucier du revenu des familles.
                </p>
              </div>

              <div className="border-t-2 border-[#0052D4] pt-6">
                <p className="text-4xl font-black text-[#0052D4] tabular-nums mb-4">0 €</p>
                <h3 className="font-bold text-slate-900 mb-2">De travail non déclaré.</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  En déclarant leurs revenus, les étudiants cotisent pour leur retraite, valident des trimestres, et s'octroient des droits. Ce qui était de la précarité invisible devient une activité valorisante, sans impact sur le portefeuille des parents.
                </p>
              </div>

              <div className="border-t-2 border-[#0052D4] pt-6">
                <p className="text-4xl font-black text-[#0052D4] mb-4">∞</p>
                <h3 className="font-bold text-slate-900 mb-2">Cours pour les revenus plus modestes.</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Ce modèle économique permet à Colibri de revaloriser sans bénéfice les étudiants aux tarifs les plus bas grâce aux revenus des étudiants aux tarifs les plus élevés.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* ── COMMENT ÇA SE PASSE EN PRATIQUE ── */}
        <section className="px-6 py-20">
          <div className="max-w-4xl mx-auto">

            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Comment ça se passe</p>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-12">Votre parcours, de l'inscription au prélèvement.</h2>

            <div className="space-y-0 border border-slate-200/60 rounded-2xl overflow-hidden bg-white/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.05)]">

              {[
                {
                  n: "01",
                  title: "Colibri crée votre compte Urssaf.",
                  body: "Vous n'avez rien à faire. Dès votre inscription sur Colibri, nous créons votre espace auprès de l'Urssaf en votre nom. Zéro démarche de votre côté.",
                },
                {
                  n: "02",
                  title: "Vous activez votre espace et renseignez votre IBAN.",
                  body: <>Vous recevez un e-mail de l'Urssaf. Cliquez, activez votre compte sur <a href="https://particulier.urssaf.fr" target="_blank" rel="noopener noreferrer" className="text-[#0052D4] font-semibold hover:underline inline-flex items-center gap-0.5">particulier.urssaf.fr <ExternalLink className="w-3 h-3" /></a>, et renseignez vos coordonnées bancaires. C'est fait.</>,
                },
                {
                  n: "03",
                  title: "Chaque mois, vous validez la facture en 48 h.",
                  body: "Colibri émet la demande de paiement. Vous recevez une notification. Vous avez 48 heures pour valider ou contester sur votre espace Urssaf. Sans action, la facture est automatiquement acceptée.",
                },
                {
                  n: "04",
                  title: "L'Urssaf prélève uniquement vos 50 %.",
                  body: "L'Urssaf débite votre compte du seul reste à charge — la moitié de la facture. L'État règle l'autre moitié directement. Aucune avance, aucun remboursement à attendre en fin d'année.",
                },
              ].map((step, i, arr) => (
                <div key={step.n} className={`flex gap-6 px-8 py-7 ${i < arr.length - 1 ? "border-b border-slate-100" : ""}`}>
                  <span className="flex-shrink-0 text-2xl font-black text-slate-200 tabular-nums leading-none mt-0.5">{step.n}</span>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1.5">{step.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{step.body}</p>
                  </div>
                </div>
              ))}

            </div>

          </div>
        </section>

        {/* ── CADRE LÉGAL ── */}
        <section className="px-6 pb-20">
          <div className="max-w-4xl mx-auto">

            <div className="border border-slate-200 rounded-2xl bg-white/70 backdrop-blur-sm overflow-hidden">
              <div className="flex items-center gap-4 px-8 py-6 border-b border-slate-100">
                <img src={urssafColor} alt="Urssaf" className="h-8 object-contain flex-shrink-0" />
                <p className="text-sm text-slate-600">
                  Ce service est opéré par <strong className="text-slate-900">l'Urssaf</strong> et la <strong className="text-slate-900">Direction générale des Finances publiques (DGFiP)</strong> dans le cadre du dispositif national d'Avance Immédiate de crédit d'impôt.
                </p>
              </div>
              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-sm text-slate-600 leading-relaxed">
                <div className="px-8 py-6 space-y-1">
                  <p className="font-semibold text-slate-800 mb-2">Service optionnel</p>
                  <p>L'Avance Immédiate est optionnelle et non obligatoire. Si vous refusez, vous avancez 100 % des frais à Colibri et récupérez votre crédit d'impôt l'année suivante sur votre déclaration.</p>
                </div>
                <div className="px-8 py-6 space-y-1">
                  <p className="font-semibold text-slate-800 mb-2">Votre interlocuteur unique</p>
                  <p>Pour toute question sur une facture ou des heures de cours, contactez Colibri. L'Urssaf ne gère pas les litiges liés aux prestations.</p>
                </div>
                <div className="px-8 py-6 space-y-1 border-t border-slate-100 md:border-t-0">
                  <p className="font-semibold text-slate-800 mb-2">Conditions d'accès</p>
                  <p>Compte bancaire domicilié en zone SEPA et au moins une déclaration de revenus effectuée en France.</p>
                </div>
                <div className="px-8 py-6 space-y-1 border-t border-slate-100">
                  <p className="font-semibold text-slate-800 mb-2">Plafonds annuels</p>
                  <p>Le crédit d'impôt est soumis à des plafonds légaux. <a href="https://www.impots.gouv.fr/portail/particulier/emploi-domicile" target="_blank" rel="noopener noreferrer" className="text-[#0052D4] font-semibold hover:underline inline-flex items-center gap-1">Consulter les plafonds en vigueur <ExternalLink className="w-3 h-3" /></a></p>
                </div>
              </div>
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
                <img src="/src/assets/colibri.svg" alt="Colibri" className="w-6 h-6 object-contain" />
                <span className="font-bold text-slate-900">Colibri</span>
              </div>
              <p className="text-sm text-slate-500 mb-6">L'excellence du soutien scolaire certifiée par l'État.</p>
              <div className="inline-flex items-center bg-[#1a1a2e] px-3 py-1.5 rounded-lg opacity-70 hover:opacity-100 transition-all">
                <img src={urssafBlanc} alt="Urssaf" className="h-5 object-contain" />
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4 text-sm">Plateforme</h4>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><a href="/#concept" className="hover:text-blue-600 transition-colors">Le concept</a></li>
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
            <p className="text-xs text-slate-400">© 2026 Colibri SAS. Entreprise mandataire de Services à la Personne.</p>
            <p className="text-xs text-slate-400">Paiements sécurisés par virement bancaire.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
