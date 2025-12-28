import { ReactNode, useState } from "react";
import { Menu } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="h-screen bg-background">

      {/* ===== MOBILE HEADER ===== */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="font-bold text-lg">NaariCare Admin</span>
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-lg bg-muted"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* ===== DESKTOP SIDEBAR (FIXED) ===== */}
      <aside className="hidden lg:fixed lg:left-0 lg:top-0 lg:h-full lg:w-64 border-r bg-background">
        <AdminSidebar />
      </aside>

      {/* ===== MOBILE OVERLAY ===== */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ===== MOBILE SIDEBAR ===== */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-background transform transition-transform lg:hidden
        ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <AdminSidebar onClose={() => setOpen(false)} />
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="lg:ml-64 pt-16 lg:pt-0 h-full overflow-y-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
};

export default AdminLayout;
