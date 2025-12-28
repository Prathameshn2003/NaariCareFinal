import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";

/* ================= PUBLIC PAGES ================= */
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Contact from "./pages/Contact";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

/* ================= USER PAGES ================= */
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Modules from "./pages/Modules";
import PCOSModule from "./pages/PCOSModule";
import MenstrualModule from "./pages/MenstrualModule";
import MenopauseModule from "./pages/MenopauseModule";
import Chatbot from "./pages/Chatbot";
import Doctors from "./pages/Doctors";
import NGOs from "./pages/NGOs";
import Schemes from "./pages/Schemes";
import HealthResources from "./pages/HealthResources";
import Hygiene from "./pages/Hygiene";
import Education from "./pages/Education";

/* ================= ADMIN PAGES ================= */
import AdminIndex from "./pages/admin/AdminIndex";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminResourcesPage from "./pages/admin/AdminResourcesPage";
import AdminSchemesPage from "./pages/admin/AdminSchemesPage";
import AdminNGOsPage from "./pages/admin/AdminNGOsPage";

/* ================= ADMIN SYSTEM MODULES ================= */
import SystemHealthPage from "./pages/admin/SystemHealthPage";
import ErrorManagementPage from "./pages/admin/ErrorManagementPage";
import FeatureFlagsPage from "./pages/admin/FeatureFlagsPage";
import AdminLogsPage from "./pages/admin/AdminLogsPage";
import AlertsPage from "./pages/admin/AlertsPage";
import DiagnosticsPage from "./pages/admin/DiagnosticsPage";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <AuthProvider>
            <Routes>

              {/* ===== PUBLIC ===== */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* ===== USER (PROTECTED) ===== */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/modules" element={<ProtectedRoute><Modules /></ProtectedRoute>} />
              <Route path="/modules/pcos" element={<ProtectedRoute><PCOSModule /></ProtectedRoute>} />
              <Route path="/modules/menstrual" element={<ProtectedRoute><MenstrualModule /></ProtectedRoute>} />
              <Route path="/modules/menopause" element={<ProtectedRoute><MenopauseModule /></ProtectedRoute>} />
              <Route path="/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
              <Route path="/doctors" element={<ProtectedRoute><Doctors /></ProtectedRoute>} />
              <Route path="/ngos" element={<ProtectedRoute><NGOs /></ProtectedRoute>} />
              <Route path="/schemes" element={<ProtectedRoute><Schemes /></ProtectedRoute>} />
              <Route path="/health-resources" element={<ProtectedRoute><HealthResources /></ProtectedRoute>} />
              <Route path="/hygiene" element={<ProtectedRoute><Hygiene /></ProtectedRoute>} />
              <Route path="/education" element={<ProtectedRoute><Education /></ProtectedRoute>} />

              {/* ===== ADMIN (STRICT) ===== */}
              <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminIndex /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute requireAdmin><AdminUsersPage /></ProtectedRoute>} />
              <Route path="/admin/resources" element={<ProtectedRoute requireAdmin><AdminResourcesPage /></ProtectedRoute>} />
              <Route path="/admin/schemes" element={<ProtectedRoute requireAdmin><AdminSchemesPage /></ProtectedRoute>} />
              <Route path="/admin/ngos" element={<ProtectedRoute requireAdmin><AdminNGOsPage /></ProtectedRoute>} />

              {/* ===== ADMIN SYSTEM MODULES ===== */}
              <Route path="/admin/system-health" element={<ProtectedRoute requireAdmin><SystemHealthPage /></ProtectedRoute>} />
              <Route path="/admin/errors" element={<ProtectedRoute requireAdmin><ErrorManagementPage /></ProtectedRoute>} />
              <Route path="/admin/feature-flags" element={<ProtectedRoute requireAdmin><FeatureFlagsPage /></ProtectedRoute>} />
              <Route path="/admin/logs" element={<ProtectedRoute requireAdmin><AdminLogsPage /></ProtectedRoute>} />
              <Route path="/admin/alerts" element={<ProtectedRoute requireAdmin><AlertsPage /></ProtectedRoute>} />
              <Route path="/admin/diagnostics" element={<ProtectedRoute requireAdmin><DiagnosticsPage /></ProtectedRoute>} />

              {/* ===== FALLBACK ===== */}
              <Route path="*" element={<NotFound />} />

            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
