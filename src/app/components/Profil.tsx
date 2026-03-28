import { useState } from "react";
import { User, BookOpen, CreditCard, Save } from "lucide-react";
import logo from "@/assets/colibri.png";

export function Profil() {
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <img src={logo} alt="Colibri" className="w-14 h-14 mx-auto mb-4 rounded-xl" />
        <h1>Mon profil</h1>
        <p className="text-muted-foreground mt-1">Gérez vos informations personnelles et fiscales</p>
      </div>

      <div className="space-y-6">
        {/* Informations personnelles */}
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-5">
            <User className="w-4 h-4 text-primary" />
            <h3>Informations personnelles</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Prénom</label>
                <input defaultValue="Jean" className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Nom</label>
                <input defaultValue="Dupont" className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div>
              <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Email</label>
              <input type="email" defaultValue="jean.dupont@universite.fr" className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Téléphone</label>
              <input type="tel" defaultValue="06 12 34 56 78" className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
        </div>

        {/* Informations académiques */}
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-5">
            <BookOpen className="w-4 h-4 text-primary" />
            <h3>Informations académiques</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Établissement</label>
              <input defaultValue="Université Paris-Saclay" className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Niveau d'études</label>
              <select defaultValue="Master 2" className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none focus:ring-2 focus:ring-primary/20">
                <option>Licence 1</option>
                <option>Licence 2</option>
                <option>Licence 3</option>
                <option>Master 1</option>
                <option>Master 2</option>
                <option>Doctorat</option>
              </select>
            </div>
            <div>
              <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Matières enseignées</label>
              <input defaultValue="Mathématiques, Physique" className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
        </div>

        {/* Informations fiscales */}
        <div className="bg-white rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-5">
            <CreditCard className="w-4 h-4 text-primary" />
            <h3>Informations fiscales & bancaires</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Numéro de sécurité sociale</label>
              <input defaultValue="1 99 12 75 XXX XXX XX" className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>IBAN</label>
              <input defaultValue="FR76 XXXX XXXX XXXX XXXX XXXX XXX" className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="block mb-1.5 text-muted-foreground" style={{ fontSize: 13 }}>Adresse postale</label>
              <input defaultValue="12 rue de la Paix, 75001 Paris" className="w-full px-4 py-2.5 bg-muted rounded-lg outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
        >
          <Save className="w-4 h-4" />
          {saved ? "Enregistré !" : "Enregistrer les modifications"}
        </button>
      </div>
    </div>
  );
}
