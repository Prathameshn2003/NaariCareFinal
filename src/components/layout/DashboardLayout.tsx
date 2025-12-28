import { ReactNode, useState } from "react";
import { Menu } from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-background">
      
      {/* ================= MOBILE HEADER ================= */}
      <header className="lg:hidden sticky top-0 z-40 bg-background/80 backdrop-blur border-b">
        <div className="flex items-center justify-between px-4 py-3">
          
          {/* NaariCare Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              ❤️
            </div>
            <span className="font-heading font-bold text-lg">
              Naari<span className="text-accent">Care</span>
            </span>
          </div>

          {/* Menu Button */}
          <button
            onClick={() => setMobileOpen(true)}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </header>

      <div className="flex w-full">
        
        {/* ================= DESKTOP SIDEBAR ================= */}
        <aside className="hidden lg:block">
          <DashboardSidebar />
        </aside>

        {/* ================= MOBILE OVERLAY ================= */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* ================= MOBILE SIDEBAR ================= */}
        <aside
          className={`fixed top-0 left-0 h-full w-64 bg-sidebar-background z-50 transform transition-transform duration-300 lg:hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <DashboardSidebar onClose={() => setMobileOpen(false)} />
        </aside>

        {/* ================= MAIN CONTENT ================= */}
        <main className="flex-1 min-h-screen overflow-x-hidden">
          <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
