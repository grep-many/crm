import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import { HomeLayout } from "./laytouts/HomeLayout";
import DashboardOverview from "./pages/DashboardOverview";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "./components/ui/sonner";
import Customers from "./pages/customers";
import CustomerDetail from "./pages/customers/CustomerDetail";

function App() {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith("/auth")) {
      document.title = "CRM | Auth";
    } else if (location.pathname.startsWith("/dashboard")) {
      document.title = "CRM | Dashboard";
    } else if (location.pathname.startsWith("/customers")) {
      document.title = "CRM | Customers";
    } else {
      document.title = "CRM";
    }
  }, [location.pathname]);

  return (
    <>
      <Toaster />
      <Routes>
        {/* Public auth route */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomeLayout />
            </ProtectedRoute>
          }
        >
          {/* Redirect "/" to "/dashboard" when logged in */}
          <Route index element={<Navigate to="dashboard" replace />} />

          {/* App pages */}
          <Route path="dashboard" element={<DashboardOverview />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/:id" element={<CustomerDetail />} />
        </Route>

        {/* Catch-all → redirect to dashboard (if logged in) */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default App;