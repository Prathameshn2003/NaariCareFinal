import { AdminOverview } from "@/components/admin/AdminOverview";
import { Shield } from "lucide-react";
import AdminLayout from "@/components/layout/AdminLayout";

const AdminIndex = () => {
  return (
    <AdminLayout>

      {/* ===== PAGE HEADER ===== */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-destructive" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Admin Dashboard
          </h1>
        </div>
        <p className="text-muted-foreground">
          Manage platform content, users, NGOs, and government schemes
        </p>
      </div>

      {/* ===== DASHBOARD CONTENT ===== */}
      <AdminOverview />

    </AdminLayout>
  );
};

export default AdminIndex;
