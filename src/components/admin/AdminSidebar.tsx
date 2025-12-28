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
  onClose?: () => void;
}

export const AdminSidebar = ({ onClose }: AdminSidebarProps) => {
  const location = useLocation();

  return (
    <aside className="h-full w-64 flex flex-col bg-background">

      {/* Logo */}
      <div className="p-4 border-b flex items-center gap-2">
        <img src={logo} className="w-8 h-8" />
        <div>
          <p className="font-bold">NaariCare</p>
          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm",
              location.pathname.startsWith(item.url)
                ? "bg-accent/15 text-accent"
                : "text-muted-foreground hover:bg-accent/10"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.title}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
