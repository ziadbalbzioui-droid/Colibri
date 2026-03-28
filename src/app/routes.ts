import { createBrowserRouter } from "react-router";
import { Welcome } from "./components/Welcome";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { Eleves } from "./components/Eleves";
import { Cours } from "./components/Cours";
import { Profil } from "./components/Profil";
import { Paps } from "./components/Paps";
import { Factures } from "./components/Factures";
import { Aide } from "./components/Aide";
import { ParentLayout } from "./components/ParentLayout";
import { ParentDashboard } from "./components/parent/ParentDashboard";
import { ParentCours } from "./components/parent/ParentCours";
import { ParentFactures } from "./components/parent/ParentFactures";

export const router = createBrowserRouter([
  { path: "/", Component: Welcome },
  {
    path: "/app",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "eleves", Component: Eleves },
      { path: "cours", Component: Cours },
      { path: "paps", Component: Paps },
      { path: "factures", Component: Factures },
      { path: "profil", Component: Profil },
      { path: "aide", Component: Aide },
    ],
  },
  {
    path: "/parent",
    Component: ParentLayout,
    children: [
      { index: true, Component: ParentDashboard },
      { path: "cours", Component: ParentCours },
      { path: "factures", Component: ParentFactures },
    ],
  },
]);
