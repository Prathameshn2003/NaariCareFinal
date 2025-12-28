import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Users, AlertTriangle, Activity, Server } from "lucide-react";
import { AdminSuggestions } from "./AdminSuggestions";

/* ---------- Stat Card ---------- */
type StatCardProps = {
  title: string;
  value: string | number;
  icon: any;
  color: string;
};

const StatCard = ({ title, value, icon: Icon, color }: StatCardProps) => (
  <div className="glass-card rounded-xl p-5 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

/* ---------- Admin Overview ---------- */
export const AdminOverview = () => {
  const [activeUsers, setActiveUsers] = useState<number>(0);
  const [errorCount, setErrorCount] = useState<number>(0);
  const [healthScore, setHealthScore] = useState<number>(100);
  const [failedServices, setFailedServices] = useState<number>(0);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    /* 1️⃣ Active users today */
    const today = new Date().toISOString().split("T")[0];

    const { count: usersToday } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("updated_at", today);

    setActiveUsers(usersToday ?? 0);

    /* 2️⃣ Errors in last 24 hours */
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { count: errors } = await supabase
      .from("system_errors")
      .select("*", { count: "exact", head: true })
      .gte("created_at", yesterday);

    setErrorCount(errors ?? 0);

    /* 3️⃣ System health */
    const { data: services } = await supabase
      .from("system_health_checks")
      .select("status");

    if (services && services.length > 0) {
      const healthy = services.filter(s => s.status === "healthy").length;
      const failed = services.filter(
        s => s.status === "warning" || s.status === "down"
      ).length;

      setFailedServices(failed);
      setHealthScore(Math.round((healthy / services.length) * 100));
    } else {
      setHealthScore(100);
      setFailedServices(0);
    }
  };

  return (
    <div className="space-y-10">

      {/* ===== TOP STATS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard
          title="Active Users Today"
          value={activeUsers}
          icon={Users}
          color="bg-primary"
        />
        <StatCard
          title="Errors (Last 24h)"
          value={errorCount}
          icon={AlertTriangle}
          color="bg-destructive"
        />
        <StatCard
          title="System Health"
          value={`${healthScore}%`}
          icon={Activity}
          color="bg-green-600"
        />
        <StatCard
          title="Failing Services"
          value={failedServices}
          icon={Server}
          color="bg-yellow-500"
        />
      </div>

      {/* ===== STEP 5: SMART ADMIN SUGGESTIONS ===== */}
      <AdminSuggestions />
    </div>
  );
};
