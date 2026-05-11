import React, { useEffect, useRef, useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sendOTP: () => Promise<void>;
  verifyOTP: (code: string) => Promise<boolean>;
}

export function OTPPrompt({ open, onClose, onSuccess, sendOTP, verifyOTP }: Props) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"sending" | "waiting" | "verifying" | "error">("sending");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) { setCode(""); setStatus("sending"); setErrorMsg(""); return; }
    setStatus("sending");
    sendOTP()
      .then(() => { setStatus("waiting"); setTimeout(() => inputRef.current?.focus(), 50); })
      .catch(() => { setStatus("error"); setErrorMsg("Impossible d'envoyer le code. Réessaie."); });
  }, [open]);

  async function handleVerify() {
    if (code.length !== 8) return;
    setStatus("verifying");
    const ok = await verifyOTP(code);
    if (ok) { onSuccess(); }
    else { setStatus("error"); setErrorMsg("Code incorrect ou expiré."); }
  }

  async function handleResend() {
    setCode(""); setStatus("sending"); setErrorMsg("");
    try {
      await sendOTP();
      setStatus("waiting");
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch {
      setStatus("error");
      setErrorMsg("Impossible d'envoyer le code. Réessaie.");
    }
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
            <h3 className="font-bold text-slate-900 text-base">Vérification requise</h3>
            <p className="text-xs text-slate-500 mt-0.5">Un code a été envoyé à ton adresse email</p>
          </div>
        </div>

        {status === "sending" && (
          <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Envoi du code…
          </div>
        )}

        {(status === "waiting" || status === "verifying" || status === "error") && (
          <>
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              maxLength={8}
              value={code}
              onChange={(e) => { setCode(e.target.value.replace(/\D/g, "")); setErrorMsg(""); if (status === "error") setStatus("waiting"); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleVerify(); }}
              placeholder="00000000"
              className="w-full text-center text-2xl font-mono tracking-[0.3em] border-2 border-slate-200 rounded-xl py-3 px-4 outline-none focus:border-blue-500 transition-colors mb-1"
            />
            {errorMsg && <p className="text-xs text-red-600 text-center mb-3">{errorMsg}</p>}
            {!errorMsg && <p className="text-xs text-slate-400 text-center mb-3">Entre le code à 8 chiffres</p>}

            <div className="flex gap-3 mt-2">
              <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                Annuler
              </button>
              <button
                onClick={handleVerify}
                disabled={code.length !== 8 || status === "verifying"}
                className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === "verifying" ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Vérification…</> : "Confirmer"}
              </button>
            </div>

            <button onClick={handleResend} className="w-full mt-3 text-xs text-slate-400 hover:text-blue-600 transition-colors">
              Renvoyer le code
            </button>
          </>
        )}
      </div>
    </div>
  );
}
