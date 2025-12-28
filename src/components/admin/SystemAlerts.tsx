/**
 * SystemAlerts
 * --------------------------------------------------
 * Displays system-generated alerts such as:
 * - Critical errors
 * - Warning thresholds
 * - System health notifications
 *
 * Admins can acknowledge alerts to confirm review.
 */

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Bell,
  Check,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Info,
  AlertCircle,
  XCircle,
  CheckCircle,
} from "lucide-react";

/* ================= TYPES ================= */

type AlertSeverity = "info" | "warning" | "error" | "critical";

interface SystemAlert {
  id: string;
  alert_type: string;
  message: string;
  severity: AlertSeverity;
  is_acknowledged: boolean;
  acknowledged_by: string | null;
  acknowledged_at: string | null;
  created_at: string;
}

/* ================= COMPONENT ================= */

export const SystemAlerts = () => {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();
  const { user, isAdmin } = useAuth();

  /* ================= FETCH ALERTS ================= */

  const fetchAlerts = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("system_alerts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      toast({
        title: "Failed to load alerts",
        variant: "destructive",
      });
    }

    setAlerts((data as SystemAlert[]) || []);
    setLoading(false);
  };

  /* ================= REALTIME ================= */

  useEffect(() => {
    fetchAlerts();

    const channel = supabase
      .channel("system-alerts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "system_alerts" },
        fetchAlerts
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* ================= ACKNOWLEDGE ONE ================= */

  const acknowledgeAlert = async (alertId: string) => {
    if (!isAdmin) return;

    const { error } = await supabase
      .from("system_alerts")
      .update({
        is_acknowledged: true,
        acknowledged_by: user?.id,
        acknowledged_at: new Date().toISOString(),
      })
      .eq("id", alertId);

    if (error) {
      toast({
        title: "Failed to acknowledge alert",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Alert acknowledged" });
    fetchAlerts();
  };

  /* ================= ACKNOWLEDGE ALL ================= */

  const acknowledgeAll = async () => {
    if (!isAdmin) return;

    const { error } = await supabase
      .from("system_alerts")
      .update({
        is_acknowledged: true,
        acknowledged_by: user?.id,
        acknowledged_at: new Date().toISOString(),
      })
      .eq("is_acknowledged", false);

    if (error) {
      toast({
        title: "Failed to acknowledge alerts",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "All alerts acknowledged" });
    fetchAlerts();
  };

  /* ================= HELPERS ================= */

  const severityIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case "info":
        return <Info className="w-5 h-5 text-blue-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case "critical":
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const severityBadge = (severity: AlertSeverity) => {
    const colors = {
      info: "bg-blue-500/10 text-blue-600",
      warning: "bg-yellow-500/10 text-yellow-600",
      error: "bg-orange-500/10 text-orange-600",
      critical: "bg-red-500/10 text-red-600",
    };
    return (
      <Badge className={colors[severity]}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const timeAgo = (ts: string) => {
    const mins = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  const pendingCount = alerts.filter(a => !a.is_acknowledged).length;

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="w-6 h-6" />
          System Alerts
          {pendingCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {pendingCount}
            </Badge>
          )}
        </h1>

        <div className="flex gap-2">
          {pendingCount > 0 && (
            <Button variant="outline" onClick={acknowledgeAll}>
              <Check className="w-4 h-4 mr-2" />
              Acknowledge All
            </Button>
          )}
          <Button variant="outline" onClick={fetchAlerts}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* EMPTY STATE */}
      {alerts.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="font-medium">All systems normal</p>
            <p className="text-muted-foreground text-sm">
              No active alerts detected
            </p>
          </CardContent>
        </Card>
      )}

      {/* ALERT LIST */}
      {alerts.map(alert => (
        <Card
          key={alert.id}
          className={alert.is_acknowledged ? "opacity-60" : ""}
        >
          <CardContent className="p-4 flex justify-between gap-4">
            <div className="flex gap-3">
              {severityIcon(alert.severity)}
              <div>
                <div className="flex gap-2 items-center">
                  {severityBadge(alert.severity)}
                  <span className="text-xs text-muted-foreground">
                    {timeAgo(alert.created_at)}
                  </span>
                </div>
                <p className="font-medium mt-1">
                  {alert.alert_type.replace(/_/g, " ")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {alert.message}
                </p>
              </div>
            </div>

            {!alert.is_acknowledged && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => acknowledgeAlert(alert.id)}
              >
                <Check className="w-4 h-4 mr-1" />
                Acknowledge
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
