import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Clock, CheckCircle, AlertTriangle } from "lucide-react";

type Log = {
  id: string;
  action_type: string;
  action_description: string;
  admin_email: string;
  created_at: string;
};

export const IncidentTimeline = () => {
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    const { data } = await supabase
      .from("admin_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    setLogs(data || []);
  };

  return (
    <div className="mt-10">
      <h3 className="text-xl font-semibold mb-4">🕒 Incident Timeline</h3>

      <div className="space-y-4">
        {logs.map((log) => (
          <div
            key={log.id}
            className="border rounded-lg p-4 bg-card flex gap-4"
          >
            <div className="mt-1">
              {log.action_type.includes("ERROR") ? (
                <AlertTriangle className="text-destructive w-5 h-5" />
              ) : (
                <CheckCircle className="text-green-500 w-5 h-5" />
              )}
            </div>

            <div className="flex-1">
              <p className="font-medium">{log.action_description}</p>
              <p className="text-sm text-muted-foreground">
                By {log.admin_email}
              </p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Clock className="w-3 h-3" />
                {new Date(log.created_at).toLocaleString()}
              </div>
            </div>
          </div>
        ))}

        {logs.length === 0 && (
          <p className="text-muted-foreground text-sm">
            No incident activity yet
          </p>
        )}
      </div>
    </div>
  );
};
