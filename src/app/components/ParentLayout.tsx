import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router";
import { Home, BookOpen, FileText, LogOut, Menu, X } from "lucide-react";
import logo from "@/assets/colibri.png";

const parentNavItems = [
  { to: "/parent", icon: Home, label: "Accueil", end: true },
  { to: "/parent/cours", icon: BookOpen, label: "Cours" },
  { to: "/parent/factures", icon: FileText, label: "Factures" },
];

export function ParentLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-border h-14 flex items-center justify-between px-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <img src={logo} alt="Colibri" className="w-7 h-7 rounded-lg" />
          <span className="text-primary font-semibold">Colibri</span>
        </div>
        <div className="w-9" />
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 w-64 bg-white border-r border-border flex flex-col
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:sticky md:top-0 md:h-screen md:translate-x-0 md:z-auto md:left-auto
        `}
      >
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Colibri" className="w-9 h-9 rounded-lg" />
            <span className="text-xl text-primary font-semibold">Colibri</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Child info card */}
        <div className="mx-3 mb-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/20 rounded-full flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
              T
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Thomas Dupont</p>
              <p className="text-xs text-muted-foreground">Terminale · Mathématiques</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1">
          {parentNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-border">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Déconnexion</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 pt-18 md:pt-4 md:p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
