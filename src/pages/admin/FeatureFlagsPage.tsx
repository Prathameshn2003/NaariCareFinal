import { FeatureFlags } from "@/components/admin/FeatureFlags";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

const FeatureFlagsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex pt-20">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <FeatureFlags />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default FeatureFlagsPage;
