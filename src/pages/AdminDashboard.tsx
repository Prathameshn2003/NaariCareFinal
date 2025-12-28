import { Shield } from "lucide-react";
import { AdminOverview } from "@/components/admin/AdminOverview";

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Shield className="text-destructive" />
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          System overview & platform management
        </p>
      </div>

      <AdminOverview />
    </div>
  );
};

export default AdminDashboard;
