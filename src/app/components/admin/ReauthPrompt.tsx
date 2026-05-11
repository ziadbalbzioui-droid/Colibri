import React, { useEffect, useRef, useState } from "react";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  verifyPassword: (password: string) => Promise<boolean>;
}

export function ReauthPrompt({ open, onClose, onSuccess, verifyPassword }: Props) {
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) { setPassword(""); setStatus("idle"); setShowPwd(false); return; }
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  async function handleSubmit() {
    if (!password || status === "loading") return;
    setStatus("loading");
    const ok = await verifyPassword(password);
    if (ok) { onSuccess(); }
    else { setStatus("error"); }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Confirme ton identité</h3>
            <p className="text-xs text-slate-500 mt-0.5">Entre ton mot de passe pour autoriser le virement</p>
          </div>
        </div>

        <div className="relative">
          <input
            ref={inputRef}
            type={showPwd ? "text" : "password"}
            value={password}
            onChange={(e) => { setPassword(e.target.value); if (status === "error") setStatus("idle"); }}
            onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
            placeholder="Mot de passe"
            className={`w-full border-2 rounded-xl py-3 px-4 pr-10 text-sm outline-none transition-colors ${
              status === "error" ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-blue-500"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className={`text-xs mt-1.5 mb-4 ${status === "error" ? "text-red-600" : "text-transparent"}`}>
          Mot de passe incorrect.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={!password || status === "loading"}
            className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === "loading" ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" />Vérification…</>
            ) : (
              "Confirmer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
