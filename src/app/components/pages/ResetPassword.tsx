import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "../../../lib/supabase";

type Status = "loading" | "ready" | "invalid" | "success";

export function ResetPassword() {
  const [status, setStatus] = useState<Status>("loading");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fallback : si le token n'est pas détecté après 2s, on considère le lien invalide
    const timer = setTimeout(() => {
      setStatus((s) => (s === "loading" ? "invalid" : s));
    }, 2000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        clearTimeout(timer);
        setStatus("ready");
      }
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) { setError(error.message); return; }
      setStatus("success");
      setTimeout(() => navigate("/"), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col font-sans text-slate-900 selection:bg-blue-100">
      <div className="fixed inset-0 -z-20 bg-[#f0f4f8]" />

      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <svg viewBox="0 0 1440 900" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" className="absolute -inset-10 w-[calc(100%+80px)] h-[calc(100%+80px)]">
          <defs>
            <linearGradient id="rpA" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F2FE" />
              <stop offset="100%" stopColor="#0099E5" />
            </linearGradient>
            <linearGradient id="rpB" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4FACFE" />
              <stop offset="100%" stopColor="#00F2FE" />
            </linearGradient>
            <linearGradient id="rpC" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0052D4" />
              <stop offset="50%" stopColor="#4364F7" />
              <stop offset="100%" stopColor="#6FB1FC" />
            </linearGradient>
            <linearGradient id="rpD" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#00F2FE" />
              <stop offset="50%" stopColor="#4FACFE" />
              <stop offset="100%" stopColor="#0066CC" />
            </linearGradient>
            <linearGradient id="rpE" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#43E7E0" />
              <stop offset="100%" stopColor="#0052D4" />
            </linearGradient>
          </defs>
          <g>
            <path fill="url(#rpA)" opacity="0.7" d="M-200,0 L400,0 C350,50 250,180 200,280 C150,380 50,420 -50,350 C-150,280 -200,150 -200,0 Z" />
            <path fill="url(#rpB)" opacity="0.55" d="M-100,0 L500,0 L300,350 C250,420 150,480 50,430 C-50,380 -120,280 -150,180 L-100,0 Z" />
            <path fill="url(#rpC)" opacity="0.65" d="M0,0 L550,0 L350,300 C280,400 180,350 100,400 C20,450 -80,380 -120,280 C-160,180 -80,80 0,0 Z" />
          </g>
          <g>
            <path fill="url(#rpD)" opacity="0.65" d="M1500,1100 C1240,1100 1000,1050 1040,850 C1100,700 1200,720 1260,620 C1320,520 1420,480 1500,550 C1580,620 1520,780 1500,1100 Z" />
            <path fill="url(#rpE)" opacity="0.55" d="M1600,1150 C1200,1150 850,1050 940,800 C1000,650 1050,600 1140,550 C1200,470 1300,430 1400,480 C1500,530 1560,650 1580,750 C1600,850 1600,1000 1600,1150 Z" />
            <path fill="url(#rpB)" opacity="0.6" d="M1500,1150 C1100,1150 800,1000 900,800 C950,700 1000,650 1100,600 C1180,500 1280,550 1360,500 C1440,450 1520,520 1560,620 C1600,720 1520,820 1500,1150 Z" />
          </g>
        </svg>
      </div>

      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/40 px-6 h-20 flex items-center shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        <Link to="/" className="flex items-center gap-2.5">
          <img src="/src/assets/colibri.svg" alt="Colibri" className="w-9 h-9 object-contain" />
          <span className="text-2xl font-extrabold tracking-tight text-slate-900">Colibri</span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-in slide-in-from-bottom-4 duration-300">

          {status === "loading" && (
            <div className="bg-white/85 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-2xl p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#0052D4] mx-auto mb-4" />
              <p className="text-slate-500 text-sm">Vérification du lien en cours…</p>
            </div>
          )}

          {status === "invalid" && (
            <div className="bg-white/85 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: "1.4rem", letterSpacing: "-0.02em", color: "#0F172A", marginBottom: "0.5rem" }}>
                Lien invalide ou expiré
              </h2>
              <p className="text-slate-600 text-sm mb-8">
                Ce lien de réinitialisation n'est plus valide. Veuillez en demander un nouveau.
              </p>
              <Link
                to="/mot-de-passe-oublie"
                className="block w-full bg-gradient-to-r from-[#0052D4] to-[#4364F7] text-white py-3 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/20 transition-all text-center active:scale-95"
              >
                Demander un nouveau lien
              </Link>
            </div>
          )}

          {status === "success" && (
            <div className="bg-white/85 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: "1.4rem", letterSpacing: "-0.02em", color: "#0F172A", marginBottom: "0.5rem" }}>
                Mot de passe mis à jour
              </h2>
              <p className="text-slate-600 text-sm">
                Votre mot de passe a bien été réinitialisé. Vous allez être redirigé vers la connexion…
              </p>
            </div>
          )}

          {status === "ready" && (
            <div className="bg-white/85 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-2xl p-8">
              <div className="mb-8">
                <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: "1.6rem", letterSpacing: "-0.02em", color: "#0F172A" }}>
                  Nouveau mot de passe
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Choisissez un mot de passe sécurisé d'au moins 6 caractères.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-3 py-2.5 border border-slate-200/60 rounded-xl text-sm bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-[#0052D4] outline-none transition-all pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-3 py-2.5 border border-slate-200/60 rounded-xl text-sm bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 focus:border-[#0052D4] outline-none transition-all"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50/80 backdrop-blur-sm border border-red-200/60 rounded-xl text-sm text-red-600 font-medium">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#0052D4] to-[#4364F7] text-white py-3 rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70 flex justify-center items-center gap-2 mt-4"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Réinitialiser le mot de passe
                </button>
              </form>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
