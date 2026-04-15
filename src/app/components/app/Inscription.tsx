import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import logo from "@/assets/colibri.png";

export function Inscription() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h1>Inscription terminée !</h1>
        <p className="text-muted-foreground mt-3">
          Votre dossier est en cours de vérification. Vous recevrez un email de confirmation sous 48h.
        </p>
        <button
          onClick={() => { setStep(1); setSubmitted(false); }}
          className="mt-6 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
        >
          Retour au tableau de bord
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <img src={logo} alt="Colibri" className="w-14 h-14 mx-auto mb-4 rounded-xl" />
        <h1>Inscription administrative</h1>
        <p className="text-muted-foreground mt-1">Créez votre profil pour commencer à bénéficier du crédit d'impôt</p>
      </div>

      {/* Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
              s <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>{s}</div>
            {s < 3 && <div className={`w-12 h-0.5 ${s < step ? "bg-primary" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border p-8">
        {step === 1 && (
          <div className="space-y-5">
            <h3>Informations personnelles</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5" style={{ fontSize: 14 }}>Prénom</label>
                <input className="w-full px-4 py-2.5 bg-muted rounded-lg" placeholder="Jean" />
              </div>
              <div>
                <label className="block mb-1.5" style={{ fontSize: 14 }}>Nom</label>
                <input className="w-full px-4 py-2.5 bg-muted rounded-lg" placeholder="Dupont" />
              </div>
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: 14 }}>Email</label>
              <input type="email" className="w-full px-4 py-2.5 bg-muted rounded-lg" placeholder="jean@universite.fr" />
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: 14 }}>Téléphone</label>
              <input type="tel" className="w-full px-4 py-2.5 bg-muted rounded-lg" placeholder="06 12 34 56 78" />
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: 14 }}>Date de naissance</label>
              <input type="date" className="w-full px-4 py-2.5 bg-muted rounded-lg" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h3>Informations académiques</h3>
            <div>
              <label className="block mb-1.5" style={{ fontSize: 14 }}>Établissement</label>
              <input className="w-full px-4 py-2.5 bg-muted rounded-lg" placeholder="Université Paris-Saclay" />
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: 14 }}>Niveau d'études</label>
              <select className="w-full px-4 py-2.5 bg-muted rounded-lg">
                <option>Licence 1</option>
                <option>Licence 2</option>
                <option>Licence 3</option>
                <option>Master 1</option>
                <option>Master 2</option>
                <option>Doctorat</option>
              </select>
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: 14 }}>Matières enseignées</label>
              <input className="w-full px-4 py-2.5 bg-muted rounded-lg" placeholder="Mathématiques, Physique..." />
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: 14 }}>Numéro étudiant</label>
              <input className="w-full px-4 py-2.5 bg-muted rounded-lg" placeholder="21234567" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h3>Informations fiscales & bancaires</h3>
            <div>
              <label className="block mb-1.5" style={{ fontSize: 14 }}>Numéro de sécurité sociale</label>
              <input className="w-full px-4 py-2.5 bg-muted rounded-lg" placeholder="1 99 12 75 XXX XXX XX" />
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: 14 }}>IBAN</label>
              <input className="w-full px-4 py-2.5 bg-muted rounded-lg" placeholder="FR76 XXXX XXXX XXXX XXXX XXXX XXX" />
            </div>
            <div>
              <label className="block mb-1.5" style={{ fontSize: 14 }}>Adresse postale</label>
              <input className="w-full px-4 py-2.5 bg-muted rounded-lg" placeholder="12 rue de la Paix, 75001 Paris" />
            </div>
            <div className="flex items-start gap-3 p-4 bg-secondary rounded-lg">
              <input type="checkbox" className="mt-1" />
              <span className="text-secondary-foreground" style={{ fontSize: 14 }}>
                J'accepte les conditions générales d'utilisation et j'autorise Colibri à transmettre mes informations fiscales dans le cadre du crédit d'impôt.
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-5 py-2.5 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              Précédent
            </button>
          ) : <div />}
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={() => setSubmitted(true)}
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Soumettre mon dossier
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
