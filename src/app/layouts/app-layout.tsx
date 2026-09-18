import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../auth/auth-provider";
import { Sidebar } from "../../components/layout/sidebar";

export function AppLayout() {
  const { state } = useAuth();

  if (state.status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-[#2B2A33] bg-[#f5f5f5]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (state.status === "unauthenticated") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">
        <div className="app-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
