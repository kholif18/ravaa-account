import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/auth-provider";
import { useTheme } from "../../components/providers/theme-provider";
import { Sun, Moon } from "lucide-react";

export function PublicLayout() {
  const { state } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const location = useLocation();

  if (state.status === "loading") {
    return (
      <div className="auth-page auth-page-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  // /verify-email harus tetap bisa diakses meski sudah login
  const isVerifyEmail = location.pathname.startsWith("/verify-email");
  if (state.status === "authenticated" && !isVerifyEmail) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="auth-page auth-page-bg relative overflow-y-auto">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full blur-3xl auth-orb-blue" />
        <div className="absolute -bottom-48 -right-24 h-[28rem] w-[28rem] rounded-full blur-3xl auth-orb-purple" />
        <div className="absolute top-1/3 right-1/4 h-72 w-72 rounded-full blur-3xl auth-orb-cyan" />
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 z-20 p-2 rounded-lg dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-[#1A1A1A]/50 text-zinc-400 hover:text-white hover:bg-[#f5f5f5] transition-colors backdrop-blur-xl"
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Content */}
      <div className="relative z-10 auth-page">
        <div className="auth-grid">
          {/* Branding - desktop only */}
          <div className="auth-brand">
            <h1 className="auth-brand-title">
              Ravaa <span className="auth-accent">Account</span>
            </h1>
            <p className="auth-brand-subtitle">
              Your central hub for the Ravaa ecosystem.
            </p>
            <div className="auth-brand-features">
              {[
                "Single sign-on across all Ravaa services",
                "Manage your profile and security",
                "Control application access",
              ].map((feature) => (
                <div key={feature} className="auth-brand-feature">
                  <div className="auth-brand-dot" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="auth-form-col">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
