import { useState } from "react";
import { Outlet } from "react-router";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { SiretBanner } from "./SiretBanner";
import logo from "@/assets/colibri.png";

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

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
          <span className="text-primary" style={{ fontWeight: 600 }}>Colibri</span>
        </div>
        <div className="w-9" />
      </header>

      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col overflow-auto">
        <SiretBanner />
        <main className="flex-1 p-4 pt-18 md:pt-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
