import { useState } from "react";
import { Outlet, NavLink, Link, useNavigate } from "react-router";
import { Home, BookOpen, FileText, LogOut, Menu, X, UserCircle, HelpCircle } from "lucide-react";
import logo from "@/assets/colibri.png";
import { useAuth } from "../../../lib/auth";

const NAV_ITEMS = [
  { to: "/parent", icon: Home, label: "Accueil", end: true },
  { to: "/parent/cours", icon: BookOpen, label: "Cours" },
  { to: "/parent/factures", icon: FileText, label: "Factures" },
  { to: "/parent/aide", icon: HelpCircle, label: "Aide" },
  { to: "/parent/profil", icon: UserCircle, label: "Mon profil" },
];

export function ParentLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();

  const onClose = () => setMobileOpen(false);

  return (
    <div className="flex min-h-screen" style={{ background: "var(--background)" }}>
      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 h-14 flex items-center justify-between px-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors active:scale-95"
        >
          <Menu className="w-5 h-5 text-slate-500" />
        </button>
        <div className="flex items-center gap-2">
          <img src={logo} alt="Colibri" className="w-7 h-7 rounded-lg" />
          <span className="font-bold text-slate-900 tracking-tight" style={{ fontSize: 16 }}>Colibri</span>
        </div>
        <div className="w-9" />
      </header>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 w-[220px] bg-white border-r border-slate-100 flex flex-col
          transition-transform duration-200 ease-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:sticky md:top-0 md:h-screen md:translate-x-0 md:z-auto md:left-auto
        `}
      >
        {/* Logo */}
        <div className="px-4 py-5 flex items-center justify-between">
          <Link to="/parent" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <img src={logo} alt="Colibri" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-slate-900 tracking-tight" style={{ fontSize: 17 }}>Colibri</span>
          </Link>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Profile pill */}
        {profile && (
          <div className="mx-3 mb-3 px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide leading-none mb-0.5">Connecté</p>
            <p className="text-sm font-medium text-slate-800 truncate">{profile.prenom} {profile.nom}</p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group ${
                  isActive
                    ? "bg-primary/8 text-primary font-semibold"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
                  )}
                  <item.icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-600"}`} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-slate-100">
          <button
            onClick={async () => { onClose(); await signOut(); navigate("/"); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        <main className="flex-1 px-4 pt-18 pb-8 md:pt-8 md:px-8 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
