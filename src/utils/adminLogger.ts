import { supabase } from "@/integrations/supabase/client";

type AdminLogPayload = {
  adminId: string;
  adminEmail: string;
  actionType: string;
  description: string;
  resource?: string;
  resourceId?: string;
};

export const logAdminAction = async ({
  adminId,
  adminEmail,
  actionType,
  description,
  resource,
  resourceId,
}: AdminLogPayload) => {
  try {
    await supabase.from("admin_logs").insert({
      admin_id: adminId,
      admin_email: adminEmail,
      action_type: actionType,
      action_description: description,
      affected_resource: resource || null,
      affected_resource_id: resourceId || null,
    });
  } catch (error) {
    console.error("Admin log failed:", error);
  }
};
