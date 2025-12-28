import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SystemAlerts } from "@/components/admin/SystemAlerts";

const AlertsPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header */}
      <Header />

      {/* Main Layout */}
      <div className="flex flex-1 pt-20">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Content Area */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <SystemAlerts />
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AlertsPage;
