import { createBrowserRouter, Navigate } from "react-router-dom";
import { AuthProvider } from "../../auth/auth-provider";
import { ThemeProvider } from "../../components/providers/theme-provider";
import { PublicLayout } from "../layouts/public-layout";
import { AppLayout } from "../layouts/app-layout";
import { LoginPage } from "../../pages/auth/login-page";
import { RegisterPage } from "../../pages/auth/register-page";
import { VerifyEmailPage } from "../../pages/auth/verify-email-page";
import { DashboardPage } from "../../pages/account/dashboard-page";
import { ProfilePage } from "../../pages/account/profile-page";
import { ProfileEditPage } from "../../pages/account/profile-edit-page";
import { SecurityPage } from "../../pages/account/security-page";
import { SessionsPage } from "../../pages/account/sessions-page";
import { ApplicationsPage } from "../../pages/account/applications-page";
import { TwoFactorPage } from "../../pages/account/two-factor-page";
import { RecoveryPage } from "../../pages/account/recovery-page";
import { ChangePasswordPage } from "../../pages/account/change-password-page";
import { AppPasswordsPage } from "../../pages/account/app-passwords-page";
import { PreferencesPage } from "../../pages/account/preferences-page";
import { DataPrivacyPage } from "../../pages/account/data-privacy-page";
import { AdminOverviewPage } from "../../pages/admin/admin-overview-page";
import { AdminApplicationsPage } from "../../pages/admin/admin-applications-page";
import { AdminPermissionsPage } from "../../pages/admin/admin-permissions-page";
import { AdminUsersPage } from "../../pages/admin/admin-users-page";
import { AdminStoragePage } from "../../pages/admin/admin-storage-page";

// HOME mode: hide Enterprise admin — set VITE_HOME_HIDE_ADMIN=false untuk business mode
const HOME_HIDE_ADMIN = import.meta.env.VITE_HOME_HIDE_ADMIN !== "false";

function HomeGuard({ children }: { children: React.ReactNode }) {
  if (HOME_HIDE_ADMIN) {
    return <Navigate to="/app" replace />;
  }
  return <>{children}</>;
}

function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Providers>
        <PublicLayout />
      </Providers>
    ),
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "verify-email", element: <VerifyEmailPage /> },
    ],
  },
  {
    path: "/app",
    element: (
      <Providers>
        <AppLayout />
      </Providers>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "profile/edit", element: <ProfileEditPage /> },
      { path: "security", element: <SecurityPage /> },
      { path: "security/password", element: <ChangePasswordPage /> },
      { path: "security/2fa", element: <TwoFactorPage /> },
      { path: "security/recovery", element: <RecoveryPage /> },
      { path: "security/app-passwords", element: <AppPasswordsPage /> },
      { path: "sessions", element: <SessionsPage /> },
      { path: "applications", element: HOME_HIDE_ADMIN ? <Navigate to="/app" replace /> : <ApplicationsPage /> },
      { path: "preferences", element: <PreferencesPage /> },
      { path: "data-privacy", element: <DataPrivacyPage /> },
    ],
  },
  {
    path: "/admin",
    element: (
      <Providers>
        <AppLayout />
      </Providers>
    ),
    children: [
      { index: true, element: <AdminOverviewPage /> },
      { path: "users", element: <AdminUsersPage /> },
      { path: "storage", element: <AdminStoragePage /> },
      { path: "applications", element: <HomeGuard><AdminApplicationsPage /></HomeGuard> },
      { path: "permissions", element: <HomeGuard><AdminPermissionsPage /></HomeGuard> },
    ],
  },

  { path: "*", element: <Navigate to="/" replace /> },
]);
