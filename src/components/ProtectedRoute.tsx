import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMaintenance } from "@/hooks/useMaintenance";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) => {
  const { user, loading, isAdmin } = useAuth();
  const { isMaintenance, loading: maintenanceLoading } = useMaintenance();
  const location = useLocation();

  /* ✅ Prevent back navigation after logout */
  useEffect(() => {
    const handlePopState = () => {
      if (!user && !["/login", "/signup"].includes(location.pathname)) {
        window.history.replaceState(null, "", "/login");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [user, location.pathname]);

  /* ✅ Global loading state */
  if (loading || maintenanceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  /* ✅ User not logged in */
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  /* 🚧 MAINTENANCE MODE (Admins allowed) */
  if (isMaintenance && !isAdmin) {
    return <Navigate to="/maintenance" replace />;
  }

  /* 🔐 Admin-only routes */
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
