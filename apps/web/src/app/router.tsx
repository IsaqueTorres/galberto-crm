import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "../modules/auth/components/protected-route";
import { useAuth } from "../modules/auth/use-auth";
import { DashboardPage } from "../pages/dashboard-page";
import { LoginPage } from "../pages/login-page";

function LoginRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="app-shell">Carregando...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <LoginPage />;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginRoute />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
