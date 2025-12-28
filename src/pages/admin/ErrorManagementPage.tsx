import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ErrorManagement } from "@/components/admin/ErrorManagement";
import { IncidentTimeline } from "@/components/admin/IncidentTimeline";

const ErrorManagementPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex pt-20">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:p-8">
          <ErrorManagement />
          <IncidentTimeline />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default ErrorManagementPage;
