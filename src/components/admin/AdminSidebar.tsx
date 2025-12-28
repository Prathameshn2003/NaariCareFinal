import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Building2,
  Activity,
  AlertTriangle,
  Flag,
  Wrench,
  ScrollText,   // ✅ Admin Logs icon
  Bell
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Overview", url: "/admin", icon: LayoutDashboard },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Resources", url: "/admin/resources", icon: BookOpen },
  { title: "Schemes", url: "/admin/schemes", icon: FileText },
  { title: "NGOs", url: "/admin/ngos", icon: Building2 },

  { title: "System Health", url: "/admin/system-health", icon: Activity },
  { title: "Error Management", url: "/admin/errors", icon: AlertTriangle },
  { title: "Feature Flags", url: "/admin/feature-flags", icon: Flag },
  { title: "Diagnostics", url: "/admin/diagnostics", icon: Wrench },

  // ✅ NEW
  { title: "Admin Logs", url: "/admin/logs", icon: ScrollText },
  { title: "Alerts", url: "/admin/alerts", icon: Bell },
];

export const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-20 left-0 h-[calc(100vh-5rem)] w-64 bg-card border-r z-40 transition-transform",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Admin Panel</h2>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.url}
                to={item.url}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium",
                  isActive(item.url)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.title}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};
