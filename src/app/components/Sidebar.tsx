import { NavLink } from "react-router";
import { LayoutDashboard, Users, BookOpen, CircleUser, X } from "lucide-react";
import logo from "@/assets/colibri.png";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/eleves", icon: Users, label: "Élèves" },
  { to: "/cours", icon: BookOpen, label: "Cours" },
  { to: "/profil", icon: CircleUser, label: "Mon profil" },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onClose}
        />
      )}

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
            <span className="text-xl text-primary" style={{ fontWeight: 600 }}>Colibri</span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={onClose}
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
      </aside>
    </>
  );
}
