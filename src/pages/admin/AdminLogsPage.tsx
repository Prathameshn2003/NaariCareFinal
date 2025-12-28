import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { Clock, User, RefreshCw, Activity, ShieldCheck } from "lucide-react";

/* ================= TYPES ================= */
type AdminLog = {
  id: string;
  admin_email: string;
  action_type: string;
  action_description: string;
  created_at: string;
};

/* ================= PAGE ================= */
const AdminLogsPage = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, []);

  /* ================= FETCH LOGS ================= */
  const fetchLogs = async () => {
    setLoading(true);

    const { data } = await supabase
      .from("admin_logs")
      .select("*")
      .order("created_at", { ascending: false });

    setLogs(data || []);
    setLoading(false);
  };

  const totalLogs = logs.length;
  const todayLogs = logs.filter(
    (l) =>
      new Date(l.created_at).toDateString() ===
      new Date().toDateString()
  ).length;

  return (
    <div className="min-h-screen bg-background">
      {/* ===== HEADER ===== */}
      <Header />

      {/* ===== MAIN LAYOUT ===== */}
      <div className="flex pt-20">
        <AdminSidebar />

        <main className="flex-1 p-6 space-y-6">
          {/* ===== HEADER ===== */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">📜 Admin Activity Logs</h1>
              <p className="text-muted-foreground text-sm">
                Complete audit trail of all admin actions
              </p>
            </div>

            <Button variant="outline" onClick={fetchLogs}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* ===== STATS ===== */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Actions</p>
                  <p className="text-2xl font-bold">{totalLogs}</p>
                </div>
                <Activity className="w-8 h-8 text-muted-foreground" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today</p>
                  <p className="text-2xl font-bold">{todayLogs}</p>
                </div>
                <ShieldCheck className="w-8 h-8 text-muted-foreground" />
              </CardContent>
            </Card>
          </div>

          {/* ===== EMPTY STATE ===== */}
          {!loading && logs.length === 0 && (
            <Card>
              <CardContent className="p-10 text-center text-muted-foreground">
                <p className="text-lg font-medium">
                  No admin activity recorded yet
                </p>
                <p className="text-sm mt-1">
                  All admin actions will appear here automatically
                </p>
              </CardContent>
            </Card>
          )}

          {/* ===== LOG LIST ===== */}
          <div className="space-y-4">
            {logs.map((log) => (
              <Card key={log.id} className="hover:shadow-sm transition">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">
                        {log.admin_email}
                      </span>
                    </div>
                    <Badge variant="outline">{log.action_type}</Badge>
                  </div>

                  <p className="text-sm">{log.action_description}</p>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {loading && (
            <p className="text-sm text-muted-foreground">
              Loading logs…
            </p>
          )}
        </main>
      </div>

      {/* ===== FOOTER ===== */}
      <Footer />
    </div>
  );
};

export default AdminLogsPage;
