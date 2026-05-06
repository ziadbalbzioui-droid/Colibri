import { useState } from "react";
import { Link } from "react-router";
import { ChevronLeft, Loader2, MailCheck } from "lucide-react";
import { supabase } from "../../../lib/supabase";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reinitialiser-mot-de-passe`,
      });
      if (error) { setError(error.message); return; }
      setSent(true);
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
            <linearGradient id="fpA" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F2FE" />
              <stop offset="100%" stopColor="#0099E5" />
            </linearGradient>
            <linearGradient id="fpB" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4FACFE" />
              <stop offset="100%" stopColor="#00F2FE" />
            </linearGradient>
            <linearGradient id="fpC" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0052D4" />
              <stop offset="50%" stopColor="#4364F7" />
              <stop offset="100%" stopColor="#6FB1FC" />
            </linearGradient>
            <linearGradient id="fpD" x1="100%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#00F2FE" />
              <stop offset="50%" stopColor="#4FACFE" />
              <stop offset="100%" stopColor="#0066CC" />
            </linearGradient>
            <linearGradient id="fpE" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#43E7E0" />
              <stop offset="100%" stopColor="#0052D4" />
            </linearGradient>
          </defs>
          <g>
            <path fill="url(#fpA)" opacity="0.7" d="M-200,0 L400,0 C350,50 250,180 200,280 C150,380 50,420 -50,350 C-150,280 -200,150 -200,0 Z" />
            <path fill="url(#fpB)" opacity="0.55" d="M-100,0 L500,0 L300,350 C250,420 150,480 50,430 C-50,380 -120,280 -150,180 L-100,0 Z" />
            <path fill="url(#fpC)" opacity="0.65" d="M0,0 L550,0 L350,300 C280,400 180,350 100,400 C20,450 -80,380 -120,280 C-160,180 -80,80 0,0 Z" />
          </g>
          <g>
            <path fill="url(#fpD)" opacity="0.65" d="M1500,1100 C1240,1100 1000,1050 1040,850 C1100,700 1200,720 1260,620 C1320,520 1420,480 1500,550 C1580,620 1520,780 1500,1100 Z" />
            <path fill="url(#fpE)" opacity="0.55" d="M1600,1150 C1200,1150 850,1050 940,800 C1000,650 1050,600 1140,550 C1200,470 1300,430 1400,480 C1500,530 1560,650 1580,750 C1600,850 1600,1000 1600,1150 Z" />
            <path fill="url(#fpB)" opacity="0.6" d="M1500,1150 C1100,1150 800,1000 900,800 C950,700 1000,650 1100,600 C1180,500 1280,550 1360,500 C1440,450 1520,520 1560,620 C1600,720 1520,820 1500,1150 Z" />
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
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" /> Retour à la connexion
          </Link>

          {sent ? (
            <div className="bg-white/85 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <MailCheck className="w-8 h-8 text-green-600" />
              </div>
              <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: "1.4rem", letterSpacing: "-0.02em", color: "#0F172A", marginBottom: "0.5rem" }}>
                Vérifiez votre boîte mail
              </h2>
              <p className="text-slate-600 text-sm mb-8">
                Un lien de réinitialisation a été envoyé à <strong>{email}</strong>. Cliquez dessus pour choisir un nouveau mot de passe.
              </p>
              <Link
                to="/"
                className="block w-full bg-[#0052D4] text-white py-3 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors text-center active:scale-95"
              >
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <div className="bg-white/85 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-2xl p-8">
              <div className="mb-8">
                <h2 style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400, fontSize: "1.6rem", letterSpacing: "-0.02em", color: "#0F172A" }}>
                  Mot de passe oublié
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Entrez votre adresse e-mail pour recevoir un lien de réinitialisation.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Adresse e-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="vous@exemple.com"
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
                  Envoyer le lien
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
