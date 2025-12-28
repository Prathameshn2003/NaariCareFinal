import { Shield } from "lucide-react";
import { AdminOverview } from "@/components/admin/AdminOverview";

const AdminDashboard = () => {
  return (
    <div className="space-y-8">

      {/* ===== PAGE HEADER ===== */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-destructive" />
          </div>

          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            Admin Dashboard
          </h1>
        </div>

        <p className="text-muted-foreground">
          Monitor system health, manage users, resources, NGOs, and platform operations
        </p>
      </div>

      {/* ===== MAIN ADMIN CONTENT ===== */}
      <AdminOverview />

    </div>
  );
};

export default AdminDashboard;
