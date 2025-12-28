import { useState } from "react";
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
  Menu,
  X,
  Shield,
  Users,
  BookOpen,
  Heart,
  ChevronRight,
} from "lucide-react";

// User navigation items
const userNavItems = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Menstrual Health", path: "/modules/menstrual", icon: Droplets },
  { title: "PCOS Prediction", path: "/modules/pcos", icon: Activity },
  { title: "Menopause", path: "/modules/menopause", icon: Thermometer },
  { title: "Diet & Exercise", path: "/education", icon: Apple },
  { title: "Nearby Doctors", path: "/doctors", icon: Stethoscope },
  { title: "NGOs & Support", path: "/ngos", icon: Building2 },
  { title: "Govt. Schemes", path: "/schemes", icon: FileText },
  { title: "Hygiene & Wellness", path: "/hygiene", icon: Sparkles },
  { title: "AI Chatbot", path: "/chatbot", icon: MessageCircle },
  { title: "My Profile", path: "/profile", icon: User },
];

// Admin navigation items
const adminNavItems = [
  { title: "Admin Dashboard", path: "/admin", icon: LayoutDashboard },
  { title: "Manage Users", path: "/admin/users", icon: Users },
  { title: "Health Resources", path: "/admin/resources", icon: BookOpen },
  { title: "Govt. Schemes", path: "/admin/schemes", icon: FileText },
  { title: "NGO Management", path: "/admin/ngos", icon: Building2 },
];

export const DashboardSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
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
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-50 lg:hidden shadow-lg bg-background"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:sticky top-0 left-0 h-screen w-64 bg-sidebar-background border-r border-sidebar-border z-40 transition-transform duration-300 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border">
          <NavLink to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Heart className="w-5 h-5 text-foreground fill-current" />
            </div>
            <span className="font-heading font-bold text-lg text-sidebar-foreground">
              Naari<span className="text-accent">Care</span>
            </span>
          </NavLink>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* User Section */}
          <div className="mb-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
              Menu
            </p>
            <nav className="space-y-1">
              {userNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                    isActive(item.path)
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 flex-shrink-0",
                    isActive(item.path) ? "text-accent" : "text-muted-foreground group-hover:text-accent"
                  )} />
                  <span className="flex-1">{item.title}</span>
                  {isActive(item.path) && (
                    <ChevronRight className="w-4 h-4 text-accent" />
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Admin Section - Only visible to admins */}
          {isAdmin && (
            <div className="mb-6 pt-4 border-t border-sidebar-border">
              <p className="text-xs font-semibold text-destructive uppercase tracking-wider mb-3 px-3 flex items-center gap-2">
                <Shield className="w-3 h-3" />
                Admin Panel
              </p>
              <nav className="space-y-1">
                {adminNavItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/admin"}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                      isActive(item.path)
                        ? "bg-destructive/10 text-destructive"
                        : "text-sidebar-foreground/70 hover:bg-destructive/5 hover:text-destructive"
                    )}
                  >
                    <item.icon className={cn(
                      "w-5 h-5 flex-shrink-0",
                      isActive(item.path) ? "text-destructive" : "text-muted-foreground group-hover:text-destructive"
                    )} />
                    <span className="flex-1">{item.title}</span>
                    {isActive(item.path) && (
                      <ChevronRight className="w-4 h-4 text-destructive" />
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>
          )}
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 mb-4 px-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <User className="w-5 h-5 text-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.user_metadata?.full_name || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
};
