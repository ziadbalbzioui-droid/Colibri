import { useState } from "react";
import { Outlet } from "react-router";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { SiretBanner } from "./SiretBanner";
import { IbanBanner } from "./IbanBanner";
import logo from "@/assets/colibri.svg";

export function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

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

      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        <SiretBanner />
        <IbanBanner />
        <main className="flex-1 px-4 pt-18 pb-8 md:pt-8 md:px-8 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
