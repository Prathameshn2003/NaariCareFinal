import { ReactNode, useState } from "react";
import { Menu } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import logo from "@/assets/favicon.png";

export const AdminLayout = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">

      {/* Admin Mobile Header */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-50 bg-background border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src={logo} className="w-8 h-8" />
            <span className="font-bold">NaariCare <span className="text-xs">(Admin)</span></span>
          </div>
          <button onClick={() => setOpen(true)}>
            <Menu />
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:left-0 lg:top-0 lg:h-full lg:w-64">
        <AdminSidebar />
      </aside>

      {/* Mobile Sidebar */}
      {open && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setOpen(false)} />
          <aside className="fixed left-0 top-0 h-full w-64 bg-background z-50">
            <AdminSidebar onClose={() => setOpen(false)} />
          </aside>
        </>
      )}

      {/* Admin Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 max-w-7xl mx-auto">{children}</div>
      </main>

    </div>
  );
};
