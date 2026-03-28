import { useState } from "react";
import { useNavigate } from "react-router";
import {
  GraduationCap, Users, Eye, EyeOff, ArrowRight,
  ChevronLeft, BookOpen, TrendingUp, CreditCard,
} from "lucide-react";
import logo from "@/assets/colibri.png";

type Role = "prof" | "parent" | null;
type AuthMode = "connexion" | "inscription";

export function Welcome() {
  const [role, setRole] = useState<Role>(null);
  const [mode, setMode] = useState<AuthMode>("connexion");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "prof") navigate("/app");
    else navigate("/parent");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E3F2FD] via-white to-[#F0F7FF] flex flex-col">
      <header className="p-6">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Colibri" className="w-10 h-10 rounded-xl shadow-sm" />
          <span className="text-2xl font-semibold text-primary">Colibri</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-4xl">
          {!role ? (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white/80 border border-border rounded-full px-4 py-1.5 text-xs text-muted-foreground mb-6 shadow-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Plateforme de cours particuliers
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                Bienvenue sur <span className="text-primary">Colibri</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-12 max-w-xl mx-auto">
                La plateforme qui simplifie les cours particuliers pour les professeurs et les familles
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
                {/* Prof card */}
                <button
                  onClick={() => setRole("prof")}
                  className="group bg-white rounded-2xl p-8 border-2 border-border hover:border-primary hover:shadow-xl transition-all duration-200 text-left cursor-pointer"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                    <GraduationCap className="w-7 h-7 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Je suis professeur</h2>
                  <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                    Gérez vos élèves, déclarez vos cours et suivez vos revenus en toute simplicité.
                  </p>
                  <div className="space-y-2 mb-6">
                    {[
                      { icon: Users, text: "Gestion des élèves" },
                      { icon: BookOpen, text: "Suivi des cours" },
                      { icon: TrendingUp, text: "Revenus & facturation" },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm text-primary font-medium group-hover:gap-2 transition-all">
                    Commencer <ArrowRight className="w-4 h-4" />
                  </span>
                </button>

                {/* Parent card */}
                <button
                  onClick={() => setRole("parent")}
                  className="group bg-white rounded-2xl p-8 border-2 border-border hover:border-primary hover:shadow-xl transition-all duration-200 text-left cursor-pointer"
                >
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                    <Users className="w-7 h-7 text-primary" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Je suis parent</h2>
                  <p className="text-sm text-muted-foreground mb-5 leading-relaxed">
                    Suivez les cours de votre enfant, payez les factures et bénéficiez du crédit d'impôt.
                  </p>
                  <div className="space-y-2 mb-6">
                    {[
                      { icon: BookOpen, text: "Suivi des séances" },
                      { icon: CreditCard, text: "Paiement en ligne" },
                      { icon: TrendingUp, text: "Crédit d'impôt 50%" },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Icon className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span>{text}</span>
                      </div>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm text-primary font-medium group-hover:gap-2 transition-all">
                    Commencer <ArrowRight className="w-4 h-4" />
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-md mx-auto">
              <button
                onClick={() => setRole(null)}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Retour
              </button>

              <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    {role === "prof"
                      ? <GraduationCap className="w-5 h-5 text-primary" />
                      : <Users className="w-5 h-5 text-primary" />}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {role === "prof" ? "Espace professeur" : "Espace parent"}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {role === "prof"
                        ? "Gérez vos cours particuliers"
                        : "Suivez les cours de votre enfant"}
                    </p>
                  </div>
                </div>

                {/* Mode tabs */}
                <div className="flex bg-muted rounded-lg p-1 mb-6">
                  {(["connexion", "inscription"] as AuthMode[]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMode(m)}
                      className={`flex-1 text-sm py-2 rounded-md transition-colors ${
                        mode === m
                          ? "bg-white shadow-sm font-medium text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === "inscription" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Prénom</label>
                        <input
                          type="text"
                          placeholder="Marie"
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-[var(--input-background)]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">Nom</label>
                        <input
                          type="text"
                          placeholder="Dupont"
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-[var(--input-background)]"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Adresse e-mail</label>
                    <input
                      type="email"
                      placeholder="vous@exemple.fr"
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-[var(--input-background)]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Mot de passe</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 pr-10 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-[var(--input-background)]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {mode === "connexion" && (
                      <div className="text-right mt-1">
                        <button type="button" className="text-xs text-primary hover:underline">
                          Mot de passe oublié ?
                        </button>
                      </div>
                    )}
                  </div>

                  {mode === "inscription" && role === "parent" && (
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Prénom de votre enfant</label>
                      <input
                        type="text"
                        placeholder="Thomas"
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-[var(--input-background)]"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    {mode === "connexion" ? "Se connecter" : "Créer mon compte"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="p-6 text-center text-xs text-muted-foreground">
        © 2026 Colibri — Tous droits réservés
      </footer>
    </div>
  );
}
