import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Droplets,
  Activity,
  Thermometer,
  Apple,
  Stethoscope,
  Building2,
  FileText,
  Sparkles,
  MessageCircle,
  User,
  LogOut,
  Shield,
  Users,
  BookOpen,
  Heart,
  ChevronRight,
} from "lucide-react";

/* ================= USER NAV ITEMS ================= */

const userNavItems = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Menstrual Health", path: "/modules/menstrual", icon: Droplets },
  { title: "PCOS Prediction", path: "/modules/pcos", icon: Activity },
  { title: "Menopause", path: "/modules/menopause", icon: Thermometer },
  { title: "Diet & Exercise", path: "/education", icon: Apple },
  { title: "Nearby Doctors", path: "/doctors", icon: Stethoscope },
  { title: "NGOs & Support", path: "/ngos", icon: Building2 },
  { title: "Govt. Schemes", path: "/schemes", icon: FileText },

  // ✅ ADDED
  { title: "Health Resources", path: "/health-resources", icon: BookOpen },

  { title: "Hygiene & Wellness", path: "/hygiene", icon: Sparkles },
  { title: "AI Chatbot", path: "/chatbot", icon: MessageCircle },
  { title: "My Profile", path: "/profile", icon: User },
];

/* ================= ADMIN NAV ITEMS ================= */

const adminNavItems = [
  { title: "Admin Dashboard", path: "/admin", icon: LayoutDashboard },
  { title: "Manage Users", path: "/admin/users", icon: Users },
  { title: "Health Resources", path: "/admin/resources", icon: BookOpen },
  { title: "Govt. Schemes", path: "/admin/schemes", icon: FileText },
  { title: "NGO Management", path: "/admin/ngos", icon: Building2 },
];

interface DashboardSidebarProps {
  onClose?: () => void; // used only on mobile
}

export const DashboardSidebar = ({ onClose }: DashboardSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  const isActive = (path: string) => {
    if (path === "/dashboard" || path === "/admin") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="h-screen w-64 bg-background border-r border-border flex flex-col">

      {/* ===== LOGO ===== */}
      <div className="p-4 border-b border-border">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Heart className="w-5 h-5 text-foreground fill-current" />
          </div>
          <span className="font-heading font-bold text-lg">
            Naari<span className="text-accent">Care</span>
          </span>
        </NavLink>
      </div>

      {/* ===== NAVIGATION ===== */}
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
          Menu
        </p>

        <nav className="space-y-1 mb-6">
          {userNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive(item.path)
                  ? "bg-accent/15 text-accent"
                  : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.title}</span>
              {isActive(item.path) && (
                <ChevronRight className="w-4 h-4 text-accent" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* ===== ADMIN SECTION ===== */}
        {isAdmin && (
          <div className="pt-4 border-t border-border">
            <p className="text-xs font-semibold text-destructive uppercase mb-3 px-3 flex items-center gap-2">
              <Shield className="w-3 h-3" />
              Admin Panel
            </p>

            <nav className="space-y-1">
              {adminNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                    isActive(item.path)
                      ? "bg-destructive/10 text-destructive"
                      : "hover:bg-destructive/5 text-muted-foreground hover:text-destructive"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1">{item.title}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* ===== USER INFO + LOGOUT ===== */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-4 px-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <User className="w-5 h-5 text-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.user_metadata?.full_name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </aside>
  );
};
