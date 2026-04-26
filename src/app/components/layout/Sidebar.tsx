import { NavLink, Link, useNavigate } from "react-router";
import { LayoutDashboard, Users, BookOpen, CircleUser, GraduationCap, FileText, HelpCircle, LogOut, X } from "lucide-react";
import logo from "@/assets/colibri.png";
import { useAuth } from "../../../lib/auth";

const BASE_NAV = [
  { to: "/app", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/app/eleves", icon: Users, label: "Élèves" },
  { to: "/app/cours", icon: BookOpen, label: "Cours" },
  { to: "/app/factures", icon: FileText, label: "Factures" },
  { to: "/app/aide", icon: HelpCircle, label: "Aide" },
  { to: "/app/profil", icon: CircleUser, label: "Mon profil" },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { signOut, profile } = useAuth();

  const isMinesParis = profile?.etablissement?.toLowerCase().includes("mines") ?? false;
  const navItems = isMinesParis
    ? [...BASE_NAV.slice(0, 4), { to: "/app/paps", icon: GraduationCap, label: "PAPS" }, ...BASE_NAV.slice(4)]
    : BASE_NAV;

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 md:hidden"
          onClick={onClose}
        />
      )}

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
          <Link to="/app" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
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
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/app"}
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
    </>
  );
}
