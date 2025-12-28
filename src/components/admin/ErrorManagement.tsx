/**
 * ErrorManagement
 * ---------------------------------------------
 * Admin panel to monitor, filter, and manage
 * system errors raised by the application.
 *
 * Admins can:
 * - Filter errors by severity
 * - Track affected modules
 * - Update error lifecycle status
 */

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ================= ENUMS (MATCH SUPABASE) ================= */

type ErrorSeverity = "info" | "warning" | "error" | "critical";
type ErrorStatus =
  | "detected"
  | "analyzed"
  | "fix_applied"
  | "verified"
  | "closed";

/* ================= DATA TYPE ================= */

type SystemError = {
  id: string;
  error_message: string;
  severity: ErrorSeverity;
  affected_module: string | null;
  status: ErrorStatus;
  created_at: string;
};

/* ================= COMPONENT ================= */

export const ErrorManagement = () => {
  const [errors, setErrors] = useState<SystemError[]>([]);
  const [filter, setFilter] = useState<ErrorSeverity | "all">("all");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchErrors();
  }, [filter]);

  /* ================= FETCH ERRORS ================= */

  const fetchErrors = async () => {
    setLoading(true);

    let query = supabase
      .from("system_errors")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "all") {
      query = query.eq("severity", filter);
    }

    const { data, error } = await query;

    if (!error && data) {
      setErrors(data as SystemError[]);
    }

    setLoading(false);
  };

  /* ================= UPDATE STATUS ================= */

  const updateStatus = async (id: string, status: ErrorStatus) => {
    await supabase
      .from("system_errors")
      .update({ status })
      .eq("id", id);

    fetchErrors();
  };

  /* ================= HELPERS ================= */

  const severityStyle = (severity: ErrorSeverity) => {
    switch (severity) {
      case "info":
        return "bg-blue-500/10 text-blue-600";
      case "warning":
        return "bg-yellow-500/10 text-yellow-600";
      case "error":
        return "bg-orange-500/10 text-orange-600";
      case "critical":
        return "bg-red-500/10 text-red-600";
    }
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold">🚨 Error Management</h2>
        <p className="text-muted-foreground text-sm">
          Track, analyze, and resolve system-level errors
        </p>
      </div>

      {/* FILTER */}
      <div className="w-64">
        <Select
          value={filter}
          onValueChange={(value) =>
            setFilter(value as ErrorSeverity | "all")
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="error">Error</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-sm text-muted-foreground">
          Loading system errors…
        </p>
      )}

      {/* EMPTY STATE */}
      {!loading && errors.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            🎉 No errors found for this filter
          </CardContent>
        </Card>
      )}

      {/* ERROR LIST */}
      <div className="space-y-4">
        {errors.map((err) => (
          <Card key={err.id}>
            <CardContent className="p-4 space-y-3">
              {/* HEADER */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{err.error_message}</p>
                  <p className="text-xs text-muted-foreground">
                    Module: {err.affected_module ?? "N/A"} •{" "}
                    {new Date(err.created_at).toLocaleString()}
                  </p>
                </div>

                <Badge className={severityStyle(err.severity)}>
                  {err.severity.toUpperCase()}
                </Badge>
              </div>

              {/* STATUS */}
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  Status:
                </span>
                <Select
                  value={err.status}
                  onValueChange={(value) =>
                    updateStatus(err.id, value as ErrorStatus)
                  }
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="detected">Detected</SelectItem>
                    <SelectItem value="analyzed">Analyzed</SelectItem>
                    <SelectItem value="fix_applied">Fix Applied</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
