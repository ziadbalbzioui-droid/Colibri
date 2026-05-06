import { createBrowserRouter, Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import { Welcome } from "./components/pages/Welcome";
import { Tarifs } from "./components/pages/Tarifs";
import { Mission } from "./components/pages/Mission";
import { EcolesPartenaires } from "./components/pages/Ecolespartenaires";
import { AvanceImmediate } from "./components/pages/AvanceImmediate";
import { AuthGuard, ParentGuard, OnboardingGuard, AdminGuard } from "./components/layout/AuthGuard";
import { Layout } from "./components/layout/Layout";
import { ParentLayout } from "./components/layout/ParentLayout";
import { Dashboard } from "./components/app/Dashboard";
import { Eleves } from "./components/app/Eleves";
import { Cours } from "./components/app/Cours";
import { RecapMensuel } from "./components/app/RecapMensuel";
import { Profil } from "./components/app/Profil";
import { Paps } from "./components/app/Paps";
import { Parrainage } from "./components/app/Parrainage";
import { Factures } from "./components/app/Factures";
import { Aide } from "./components/app/Aide";
import { CasierJudiciaire } from "./components/app/CasierJudiciaire";
import { CarteIdentite } from "./components/app/CarteIdentite";
import { ParentDashboard } from "./components/parent/ParentDashboard";
import { ParentCours } from "./components/parent/ParentCours";
import { ParentFactures } from "./components/parent/ParentFactures";
import { ParentProfil } from "./components/parent/ParentProfil";
import { ParentAide } from "./components/parent/ParentAide";
import { ParentActivation } from "./components/parent/ParentActivation";
import { ParentContestation } from "./components/parent/ParentContestation";
import { Onboarding } from "./components/onboarding/Onboarding";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { ForgotPassword } from "./components/pages/ForgotPassword";
import { ResetPassword } from "./components/pages/ResetPassword";

function RootLayout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      { path: "/", Component: Welcome },
      { path: "/signup", Component: Welcome },
      { path: "/tarifs", Component: Tarifs },
      { path: "/mission", Component: Mission },
      { path: "/ecoles", Component: EcolesPartenaires },
      { path: "/avance-immediate", Component: AvanceImmediate },
      { path: "/mot-de-passe-oublie", Component: ForgotPassword },
      { path: "/reinitialiser-mot-de-passe", Component: ResetPassword },
      {
        path: "/onboarding",
        Component: OnboardingGuard,
        children: [
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
              { path: "profil/casier", Component: CasierJudiciaire },
              { path: "profil/identite", Component: CarteIdentite },
              { path: "parrainage", Component: Parrainage },
              { path: "aide", Component: Aide },
            ],
          },
        ],
      },
      {
        path: "/admin",
        Component: AdminGuard,
        children: [
          { index: true, Component: AdminDashboard },
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
              { path: "aide", Component: ParentAide },
              { path: "profil", Component: ParentProfil },
            ],
          },
          { path: "activation", Component: ParentActivation },
          { path: "contestation/:validationId", Component: ParentContestation },
        ],
      },
    ],
  },
]);
