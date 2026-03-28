import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { Eleves } from "./components/Eleves";
import { Cours } from "./components/Cours";
import { Profil } from "./components/Profil";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "eleves", Component: Eleves },
      { path: "cours", Component: Cours },
      { path: "profil", Component: Profil },
    ],
  },
]);
