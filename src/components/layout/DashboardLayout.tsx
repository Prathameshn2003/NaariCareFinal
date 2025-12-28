import { ReactNode } from "react";
import { DashboardSidebar } from "./DashboardSidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen flex w-full bg-background">
      {/* Sidebar */}
      <DashboardSidebar />
      
      {/* Main Content */}
      <main className="flex-1 min-h-screen overflow-x-hidden">
        <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
};
