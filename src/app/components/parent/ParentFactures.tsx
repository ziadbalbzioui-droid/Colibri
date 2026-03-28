import { useState } from "react";
import { CheckCircle, AlertCircle, X, CreditCard, Building2, Info } from "lucide-react";

interface Facture {
  id: string;
  mois: string;
  dateEmission: string;
  montantBrut: number;
  nbHeures: number;
  statut: "payée" | "en attente";
  datePaiement?: string;
}

const FACTURES: Facture[] = [
  { id: "F-2026-03", mois: "Mars 2026", dateEmission: "01/04/2026", montantBrut: 210, nbHeures: 6, statut: "en attente" },
  { id: "F-2026-02", mois: "Février 2026", dateEmission: "01/03/2026", montantBrut: 180, nbHeures: 5, statut: "payée", datePaiement: "05/03/2026" },
  { id: "F-2026-01", mois: "Janvier 2026", dateEmission: "01/02/2026", montantBrut: 225, nbHeures: 6.5, statut: "payée", datePaiement: "03/02/2026" },
  { id: "F-2025-12", mois: "Décembre 2025", dateEmission: "01/01/2026", montantBrut: 195, nbHeures: 5.5, statut: "payée", datePaiement: "07/01/2026" },
  { id: "F-2025-11", mois: "Novembre 2025", dateEmission: "01/12/2025", montantBrut: 210, nbHeures: 6, statut: "payée", datePaiement: "04/12/2025" },
];

type PayMethod = "carte" | "virement";

export function ParentFactures() {
  const [factures, setFactures] = useState<Facture[]>(FACTURES);
  const [payModal, setPayModal] = useState<Facture | null>(null);
  const [payMethod, setPayMethod] = useState<PayMethod>("carte");
  const [paid, setPaid] = useState(false);

  const totalAnnee = factures.reduce(
    (sum, f) => sum + (f.statut === "payée" ? f.montantBrut : 0),
    0,
  );
  const enAttente = factures
    .filter((f) => f.statut === "en attente")
    .reduce((sum, f) => sum + f.montantBrut, 0);
  const creditImpot = Math.round((totalAnnee + enAttente) * 0.5);

  const handlePay = () => {
    setPaid(true);
    setTimeout(() => {
      setFactures((prev) =>
        prev.map((f) =>
          f.id === payModal!.id
            ? { ...f, statut: "payée", datePaiement: new Date().toLocaleDateString("fr-FR") }
            : f,
        ),
      );
      setPayModal(null);
      setPaid(false);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Factures</h1>
        <p className="text-muted-foreground text-sm mt-1">Suivez et payez les factures de Thomas</p>
      </div>

      {/* Crédit d'impôt callout */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 flex gap-4">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Info className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-blue-900 text-sm">Crédit d'impôt — Art. 199 sexdecies CGI</h3>
          <p className="text-sm text-blue-700 mt-1">
            Vous récupérez <strong>50% des sommes payées</strong> sous forme de crédit ou réduction d'impôt.
            Pour l'année en cours, votre crédit d'impôt estimé est de{" "}
            <strong>{creditImpot}€</strong>.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total payé (année)", value: `${totalAnnee}€`, color: "text-green-600" },
          { label: "Crédit d'impôt estimé", value: `${creditImpot}€`, color: "text-blue-600" },
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
        <div className="divide-y divide-border">
          {factures.map((f) => (
            <div key={f.id} className="px-5 py-4 flex items-center gap-4">
              <div className={`flex-shrink-0 ${f.statut === "payée" ? "text-green-500" : "text-amber-500"}`}>
                {f.statut === "payée"
                  ? <CheckCircle className="w-5 h-5" />
                  : <AlertCircle className="w-5 h-5" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">{f.mois}</p>
                  <span className="text-xs text-muted-foreground hidden sm:inline">#{f.id}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {f.nbHeures}h · émise le {f.dateEmission}
                  {f.datePaiement && ` · payée le ${f.datePaiement}`}
                </p>
              </div>

              <div className="text-right flex-shrink-0 hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{f.montantBrut}€</p>
                <p className="text-xs text-muted-foreground">→ {f.montantBrut / 2}€ après CI</p>
              </div>

              <div className="flex-shrink-0">
                {f.statut === "en attente" ? (
                  <button
                    onClick={() => setPayModal(f)}
                    className="bg-primary text-white text-xs px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium"
                  >
                    Payer
                  </button>
                ) : (
                  <span className="text-xs bg-green-50 text-green-700 px-3 py-2 rounded-lg">
                    Payée
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment modal */}
      {payModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-gray-900">Payer la facture</h2>
              {!paid && (
                <button
                  onClick={() => setPayModal(null)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
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
                {/* Invoice summary */}
                <div className="bg-muted/50 rounded-xl p-4 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Facture</span>
                    <span className="font-medium">{payModal.mois}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Durée totale</span>
                    <span>{payModal.nbHeures}h</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-border pt-2.5">
                    <span className="font-medium">Montant à payer</span>
                    <span className="font-bold text-xl">{payModal.montantBrut}€</span>
                  </div>
                  <div className="flex justify-between text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                    <span>Remboursement crédit d'impôt (50%)</span>
                    <span className="font-semibold">+ {payModal.montantBrut / 2}€</span>
                  </div>
                </div>

                {/* Payment method */}
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
                          payMethod === key
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/40"
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
                    <p>Référence : <strong>{payModal.id}</strong></p>
                    <p className="text-blue-500 mt-1">
                      Une fois le virement effectué, cliquez sur "Confirmer".
                    </p>
                  </div>
                )}

                {payMethod === "carte" && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-gray-700 mb-1">Numéro de carte</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-700 mb-1">Expiration</label>
                        <input
                          type="text"
                          placeholder="MM/AA"
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-700 mb-1">CVV</label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handlePay}
                  className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Confirmer le paiement — {payModal.montantBrut}€
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
