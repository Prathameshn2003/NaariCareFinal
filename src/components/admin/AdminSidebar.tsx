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
  ScrollText,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/favicon.png";

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

  { title: "Admin Logs", url: "/admin/logs", icon: ScrollText },
  { title: "Alerts", url: "/admin/alerts", icon: Bell },
];

interface AdminSidebarProps {
  onClose?: () => void; // ✅ used only for mobile
}

export const AdminSidebar = ({ onClose }: AdminSidebarProps) => {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="h-full w-64 bg-background border-r border-border flex flex-col">

      {/* ===== FIXED HEADER ===== */}
      <div className="p-4 border-b border-border shrink-0">
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="NaariCare Admin"
            className="w-9 h-9 object-contain"
          />
          <div className="leading-tight">
            <h2 className="text-lg font-heading font-bold">
              Naari<span className="text-accent">Care</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      {/* ===== SCROLLABLE NAV ===== */}
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive(item.url)
                  ? "bg-accent/15 text-accent"
                  : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>
      </div>

    </aside>
  );
};
