import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";

type Suggestion = {
  id: string;
  message: string;
  severity: "info" | "warning" | "critical";
};

export const AdminSuggestions = () => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);

  useEffect(() => {
    generateSuggestions();
  }, []);

  const generateSuggestions = async () => {
    const list: Suggestion[] = [];

    // 1️⃣ Check error count
    const { count: errorCount } = await supabase
      .from("system_errors")
      .select("*", { count: "exact", head: true });

    if ((errorCount || 0) > 5) {
      list.push({
        id: "high-errors",
        message: "High error rate detected → Consider disabling unstable features",
        severity: "critical",
      });
    }

    // 2️⃣ Check slow services
    const { data: slowServices } = await supabase
      .from("system_health_checks")
      .select("*")
      .gt("response_time_ms", 500);

    if (slowServices && slowServices.length > 0) {
      list.push({
        id: "slow-api",
        message: "Some APIs are slow → Enable caching or retry logic",
        severity: "warning",
      });
    }

    // 3️⃣ Disabled features
    const { data: disabledFeatures } = await supabase
      .from("feature_flags")
      .select("*")
      .eq("is_enabled", false);

    if (disabledFeatures && disabledFeatures.length > 0) {
      list.push({
        id: "disabled-feature",
        message: "Some features are disabled → Verify and re-enable if stable",
        severity: "info",
      });
    }

    setSuggestions(list);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-yellow-500" />
        Smart Admin Suggestions
      </h2>

      {suggestions.length === 0 && (
        <p className="text-muted-foreground">
          ✅ System looks healthy. No actions required.
        </p>
      )}

      <div className="space-y-3">
        {suggestions.map((s) => (
          <Card key={s.id} className="p-4 flex gap-3">
            <AlertTriangle
              className={`w-5 h-5 ${
                s.severity === "critical"
                  ? "text-red-500"
                  : s.severity === "warning"
                  ? "text-yellow-500"
                  : "text-blue-500"
              }`}
            />
            <p>{s.message}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};
