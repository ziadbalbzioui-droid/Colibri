import { useState } from "react";
import { CheckCircle, AlertCircle, X, CreditCard, Building2, Loader2 } from "lucide-react";
import { useParentData } from "../../../lib/hooks/useParentData";
import type { FactureRow } from "../../../lib/hooks/useFactures";

type PayMethod = "carte" | "virement";

export function ParentFactures() {
  const { factures, loading, payFacture } = useParentData();

  const [payModal, setPayModal] = useState<FactureRow | null>(null);
  const [payMethod, setPayMethod] = useState<PayMethod>("carte");
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  const totalAnnee = factures
    .filter((f) => f.statut === "payée")
    .reduce((s, f) => s + f.montant_brut, 0);
  const enAttente = factures
    .filter((f) => f.statut === "en attente")
    .reduce((s, f) => s + f.montant_brut, 0);

  async function handlePay() {
    if (!payModal) return;
    setPaying(true);
    try {
      await payFacture(payModal.id);
      setPaid(true);
      setTimeout(() => {
        setPayModal(null);
        setPaid(false);
      }, 1800);
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Chargement...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Factures</h1>
        <p className="text-muted-foreground text-sm mt-1">Suivez et payez les factures</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Total payé (année)", value: `${totalAnnee}€`, color: "text-green-600" },
          { label: "En attente", value: `${enAttente}€`, color: enAttente > 0 ? "text-amber-600" : "text-muted-foreground" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-border p-4 text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Invoice list */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-gray-900">Historique des factures</h3>
        </div>
        {factures.length === 0 ? (
          <p className="px-5 py-10 text-center text-muted-foreground text-sm">Aucune facture pour l'instant</p>
        ) : (
          <div className="divide-y divide-border">
            {factures.map((f: FactureRow) => (
              <div key={f.id} className="px-5 py-4 flex items-center gap-4">
                <div className={`shrink-0 ${f.statut === "payée" ? "text-green-500" : "text-amber-500"}`}>
                  {f.statut === "payée"
                    ? <CheckCircle className="w-5 h-5" />
                    : <AlertCircle className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{f.mois}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {f.lignes.reduce((s, l) => s + l.heures, 0)}h · {f.montant_brut}€ brut
                    {f.statut === "payée" && " · payée"}
                  </p>
                </div>
                <div className="text-right shrink-0 hidden sm:block">
                  <p className="text-sm font-semibold text-gray-900">{f.montant_brut}€</p>
                  <p className="text-xs text-muted-foreground">{f.lignes.reduce((s, l) => s + l.heures, 0)}h de cours</p>
                </div>
                <div className="shrink-0">
                  {f.statut === "en attente" ? (
                    <button
                      onClick={() => setPayModal(f)}
                      className="bg-primary text-white text-xs px-4 py-2 rounded-lg hover:bg-primary/90 font-medium"
                    >
                      Payer
                    </button>
                  ) : (
                    <span className="text-xs bg-green-50 text-green-700 px-3 py-2 rounded-lg">Payée</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment modal */}
      {payModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-gray-900">Payer la facture</h2>
              {!paid && !paying && (
                <button onClick={() => setPayModal(null)} className="p-1.5 rounded-lg hover:bg-muted">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {paid ? (
              <div className="px-6 py-14 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">Paiement confirmé !</h3>
                <p className="text-muted-foreground text-sm mt-1">
                  La facture de {payModal.mois} a été marquée comme payée.
                </p>
              </div>
            ) : (
              <div className="px-6 py-5 space-y-5">
                <div className="bg-muted/50 rounded-xl p-4 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Facture</span>
                    <span className="font-medium">{payModal.mois}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Heures</span>
                    <span>{payModal.lignes.reduce((s, l) => s + l.heures, 0)}h</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-border pt-2.5">
                    <span className="font-medium">Montant à payer</span>
                    <span className="font-bold text-xl">{payModal.montant_brut}€</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Mode de paiement</p>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { key: "carte" as PayMethod, label: "Carte bancaire", icon: CreditCard },
                      { key: "virement" as PayMethod, label: "Virement", icon: Building2 },
                    ]).map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => setPayMethod(key)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-colors ${
                          payMethod === key ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${payMethod === key ? "text-primary" : "text-muted-foreground"}`} />
                        <span className={`text-xs font-medium ${payMethod === key ? "text-primary" : "text-muted-foreground"}`}>
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {payMethod === "virement" && (
                  <div className="bg-blue-50 rounded-xl p-4 text-xs text-blue-700 space-y-1">
                    <p className="font-semibold mb-1">Coordonnées bancaires</p>
                    <p>IBAN : FR76 3000 4000 0100 0000 0000 133</p>
                    <p>BIC : BNPAFRPPXXX</p>
                    <p className="text-blue-500 mt-1">Une fois le virement effectué, cliquez sur "Confirmer".</p>
                  </div>
                )}

                {payMethod === "carte" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Numéro de carte</label>
                      <input type="text" placeholder="1234 5678 9012 3456" className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-700 mb-1">Expiration</label>
                        <input type="text" placeholder="MM/AA" className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-700 mb-1">CVV</label>
                        <input type="text" placeholder="123" className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handlePay}
                  disabled={paying}
                  className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {paying && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirmer le paiement — {payModal.montant_brut}€
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
