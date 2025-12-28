import { ReactNode, useState } from "react";
import { Menu } from "lucide-react";
import { DashboardSidebar } from "./DashboardSidebar";
import logo from "@/assets/favicon.png";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="h-full w-full bg-background">

      {/* ================= MOBILE HEADER ================= */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img
              src={logo}
              alt="NaariCare"
              className="w-9 h-9 object-contain"
            />
            <span className="font-heading font-bold text-lg">
              Naari<span className="text-accent">Care</span>
            </span>
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
        </div>
      </header>

      {/* ================= DESKTOP SIDEBAR (FIXED) ================= */}
      <aside className="hidden lg:block lg:fixed lg:top-0 lg:left-0 lg:h-full lg:w-64 lg:border-r lg:bg-background lg:z-40">
        <DashboardSidebar />
      </aside>

      {/* ================= MOBILE OVERLAY ================= */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ================= MOBILE SIDEBAR ================= */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-background z-50 transform transition-transform duration-300 lg:hidden
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <DashboardSidebar onClose={() => setMobileOpen(false)} />
      </aside>

      {/* ================= MAIN CONTENT (ONLY THIS SCROLLS) ================= */}
      <main className="h-full overflow-y-auto pt-16 lg:pt-0 lg:ml-64">
        <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
          {children}
        </div>
      </main>

    </div>
  );
};
