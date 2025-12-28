import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminDiagnostics } from "@/components/admin/AdminDiagnostics";

const DiagnosticsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex pt-20">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:p-8">
          <h1 className="text-3xl font-bold mb-6">🧪 System Diagnostics</h1>
          <AdminDiagnostics />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DiagnosticsPage;
