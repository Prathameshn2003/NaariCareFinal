import { ReactNode, useState } from "react";
import { Menu } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import logo from "@/assets/favicon.png";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-background">

      {/* ================= MOBILE HEADER ================= */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src={logo} alt="NaariCare" className="w-8 h-8" />
            <span className="font-heading font-bold text-lg">
              Naari<span className="text-accent">Care</span>
            </span>
          </div>

          <button
            onClick={() => setMobileOpen(true)}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden lg:fixed lg:top-0 lg:left-0 lg:h-full lg:w-64 lg:border-r lg:bg-background lg:z-40">
        <AdminSidebar />
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
        className={`fixed top-0 left-0 h-full w-64 bg-background z-50 transform transition-transform lg:hidden
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <AdminSidebar onClose={() => setMobileOpen(false)} />
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="min-h-screen overflow-y-auto lg:ml-64 pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {children}
        </div>
      </main>

    </div>
  );
};
