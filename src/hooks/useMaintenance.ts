import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useMaintenance = () => {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkMaintenance();
  }, []);

  const checkMaintenance = async () => {
    const { data } = await supabase
      .from("system_alerts")
      .select("id")
      .eq("alert_type", "maintenance_mode")
      .eq("is_acknowledged", false)
      .limit(1);

    setIsMaintenance((data?.length ?? 0) > 0);
    setLoading(false);
  };

  return { isMaintenance, loading };
};
