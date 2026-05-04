import React, { useState } from "react";
import { Search, X, Copy, Check, Loader2 } from "lucide-react";

// ── Constants ─────────────────────────────────────────────────────────────────
export const MOIS_LABELS = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
export const MATIERES_FORM = ["Mathématiques","Physique-Chimie","SVT","Français","Anglais","Espagnol","Histoire-Géo","SES","Philosophie","Informatique","Autre"];
export const NIVEAUX_FORM  = ["6ème","5ème","4ème","3ème","2nde","1ère S","1ère ES","Terminale S","Terminale ES","BTS","Licence 1","Licence 2","Licence 3","Autre"];

export const STATUTS_ELEVE = ["actif","en pause","en attente","terminé"] as const;
export const COURS_STATUTS = ["déclaré","contesté","payé"] as const;
export const RECAP_STATUTS = ["en_cours","en_attente_parent","en_attente_paiement","valide","paye"] as const;

export const RECAP_STATUT_STYLE: Record<string, { bg: string; label: string }> = {
  en_cours:            { bg: "bg-blue-100 text-blue-700",     label: "En cours" },
  en_attente_parent:   { bg: "bg-amber-100 text-amber-700",   label: "En attente parent" },
  en_attente_paiement: { bg: "bg-purple-100 text-purple-700", label: "En attente paiement" },
  valide:              { bg: "bg-emerald-100 text-emerald-700",label: "Validé" },
  paye:                { bg: "bg-teal-100 text-teal-700",      label: "Payé" },
};
export const VALIDATION_STATUT_STYLE: Record<string, { bg: string; label: string }> = {
  en_attente_parent:     { bg: "bg-amber-100 text-amber-700",    label: "En attente" },
  en_attente_validation: { bg: "bg-blue-100 text-blue-700",      label: "En validation" },
  valide:                { bg: "bg-emerald-100 text-emerald-700", label: "Validé" },
  conteste:              { bg: "bg-red-100 text-red-700",         label: "Contesté" },
};

// ── Style helpers ─────────────────────────────────────────────────────────────
export const FL = "block mb-1 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide";
export const FI = "w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary";
export const FS = "w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-primary";
export const TH = "text-left px-3 py-2.5 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap";
export const TD = "px-3 py-2.5 text-sm";

// ── Shared components ─────────────────────────────────────────────────────────

export function SearchInput({ value, onChange, placeholder, className }: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) {
  return (
    <div className={`relative ${className ?? "mb-5 max-w-xs"}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder ?? "Rechercher…"}
        className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-slate-400" />
    </div>
  );
}

export function CopyID({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(id); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      title={id} className="font-mono text-[10px] text-slate-400 hover:text-primary transition-colors flex items-center gap-1 group">
      <span>{id.slice(0, 8)}</span>
      {copied ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />}
    </button>
  );
}

export function AdminEditModal({ title, onClose, onSave, saving, children }: {
  title: string; onClose: () => void; onSave: () => void; saving: boolean; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] px-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-slate-100 px-5 py-3.5 flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wide">{title}</span>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"><X className="w-3.5 h-3.5 text-slate-400" /></button>
        </div>
        <div className="p-5 space-y-3.5">{children}</div>
        <div className="border-t border-slate-100 px-5 py-3.5 flex gap-2.5">
          <button onClick={onClose} className="flex-1 px-4 py-2 text-sm font-medium border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">Annuler</button>
          <button onClick={onSave} disabled={saving}
            className="flex-1 px-4 py-2 text-sm font-semibold bg-slate-900 text-white rounded-xl hover:bg-primary disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
            {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
