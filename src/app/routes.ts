import { createBrowserRouter } from "react-router";
import { Welcome } from "./components/Welcome";
import { AuthGuard, ParentGuard, OnboardingGuard } from "./components/AuthGuard";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { Eleves } from "./components/Eleves";
import { Cours } from "./components/Cours";
import { RecapMensuel } from "./components/RecapMensuel";
import { Profil } from "./components/Profil";
import { Paps } from "./components/Paps";
import { Factures } from "./components/Factures";
import { Aide } from "./components/Aide";
import { ParentLayout } from "./components/ParentLayout";
import { ParentDashboard } from "./components/parent/ParentDashboard";
import { ParentCours } from "./components/parent/ParentCours";
import { ParentFactures } from "./components/parent/ParentFactures";
import { ParentProfil } from "./components/parent/ParentProfil";

// Import de l'Aiguilleur unique
import { Onboarding } from "./components/Onboarding";

export const router = createBrowserRouter([
  { path: "/", Component: Welcome },
  { path: "/signup", Component: Welcome },
  {
    path: "/onboarding",
    Component: OnboardingGuard,
    children: [
      // L'Aiguilleur prend en charge la distribution selon le rôle
      { index: true, Component: Onboarding },
    ],
  },
  {
    path: "/app",
    Component: AuthGuard,
    children: [
      {
        Component: Layout,
        children: [
          { index: true, Component: Dashboard },
          { path: "eleves", Component: Eleves },
          { path: "cours", Component: Cours },
          { path: "cours/recap/:eleveId/:mois/:annee", Component: RecapMensuel },
          { path: "paps", Component: Paps },
          { path: "factures", Component: Factures },
          { path: "profil", Component: Profil },
          { path: "aide", Component: Aide },
        ],
      },
    ],
  },
  {
    path: "/parent",
    Component: ParentGuard,
    children: [
      {
        Component: ParentLayout,
        children: [
          { index: true, Component: ParentDashboard },
          { path: "cours", Component: ParentCours },
          { path: "factures", Component: ParentFactures },
          { path: "profil", Component: ParentProfil },
        ],
      },
    ],
  },
]);