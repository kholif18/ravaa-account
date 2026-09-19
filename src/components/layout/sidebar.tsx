import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  User,
  Shield,
  Clock,
  Puzzle,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
  LayoutDashboard,
  AppWindow,
  Lock,
  Users,
  HardDrive,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useTheme } from "../providers/theme-provider";
import { useAuth } from "../../auth/auth-provider";

// HOME mode: hide Enterprise admin (Applications/Permissions RBAC) — ganti ShareLink di Drive
// Set VITE_HOME_HIDE_ADMIN=false untuk munculkan lagi (business mode)
const HOME_HIDE_ADMIN = import.meta.env.VITE_HOME_HIDE_ADMIN !== "false";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  admin?: boolean;
};

const accountNav: NavItem[] = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/profile", label: "Profile", icon: User },
  { to: "/app/security", label: "Security", icon: Shield },
  { to: "/app/sessions", label: "Sessions", icon: Clock },
];

const securitySubNav: NavItem[] = [
  { to: "/app/security/password", label: "Password", icon: Lock },
  { to: "/app/security/2fa", label: "2FA", icon: Shield },
  { to: "/app/security/recovery", label: "Recovery", icon: Shield },
];

const settingsNav: NavItem[] = [
  ...(!HOME_HIDE_ADMIN ? [{ to: "/app/applications", label: "Applications", icon: Puzzle } as NavItem] : []),
  { to: "/app/preferences", label: "Preferences", icon: Settings },
  { to: "/app/data-privacy", label: "Data & Privacy", icon: Shield },
];

const adminNav: NavItem[] = [
  { to: "/admin", label: "Overview", icon: Settings, exact: true, admin: true },
  { to: "/admin/users", label: "Users", icon: Users, admin: true },
  { to: "/admin/storage", label: "Disks", icon: HardDrive, admin: true },
  ...(!HOME_HIDE_ADMIN ? [
    { to: "/admin/applications", label: "Applications", icon: AppWindow, admin: true },
    { to: "/admin/permissions", label: "Permissions", icon: Lock, admin: true },
  ] as NavItem[] : []),
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem("sidebar-collapsed") === "true";
  });
  const location = useLocation();
  const { toggleTheme, isDark } = useTheme();
  const { state, logout } = useAuth();

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("sidebar-collapsed", String(next));
  };

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const user = state.status === "authenticated" ? state.user : null;
  const isAdmin = user?.role === "ADMIN";

  return (
    <aside
      className={cn(
        "app-sidebar",
        collapsed ? "is-collapsed w-[60px]" : "w-52"
      )}
    >
      {/* Logo */}
      <div className="app-sidebar-header">
        {!collapsed && (
          <Link to="/app" className="app-sidebar-logo flex items-center gap-2">
            <img src="/logo.svg" alt="Ravaa" className="w-7 h-7 shrink-0" />
            <span className="app-sidebar-logo-1">Ravaa</span>
            <span className="app-sidebar-logo-2">Account</span>
            {HOME_HIDE_ADMIN && (
              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">HOME</span>
            )}
          </Link>
        )}
        {collapsed && (
          <Link to="/app" className="mx-auto app-sidebar-logo">
            <img src="/logo.svg" alt="Ravaa" className="w-7 h-7" />
          </Link>
        )}
      </div>

      {/* Nav */}
      <nav className="app-sidebar-nav">
        {!collapsed && <p className="app-sidebar-section-label">General</p>}
        {accountNav.map((item) => {
          const active = isActive(item.to, item.exact);
          const isSecurity = item.to === "/app/security";
          const showSub = isSecurity && (active || location.pathname.startsWith("/app/security/"));
          return (
            <div key={item.to}>
              <Link
                to={item.to}
                className={cn("app-sidebar-item", active && "is-active")}
                title={collapsed ? item.label : undefined}
              >
                <item.icon />
                {!collapsed && <span>{item.label}</span>}
              </Link>
              {!collapsed && showSub && (
                <div className="ml-4 pl-3 border-l border-white/[0.06] space-y-0.5 mt-0.5">
                  {securitySubNav.map((sub) => (
                    <Link
                      key={sub.to}
                      to={sub.to}
                      className={cn("app-sidebar-item !py-1.5 !text-xs", isActive(sub.to) && "is-active")}
                    >
                      <sub.icon className="w-3.5 h-3.5" />
                      <span>{sub.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {!collapsed && <p className="app-sidebar-section-label mt-3">Settings</p>}
        {settingsNav.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn("app-sidebar-item", isActive(item.to, item.exact) && "is-active")}
            title={collapsed ? item.label : undefined}
          >
            <item.icon />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}

        {isAdmin && (
          <>
            {!collapsed && <p className="app-sidebar-section-label mt-3">Administration</p>}
            {adminNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn("app-sidebar-item is-admin", isActive(item.to, item.exact) && "is-active")}
                title={collapsed ? item.label : undefined}
              >
                <item.icon />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Bottom controls */}
      <div className="app-sidebar-footer">
        <button
          onClick={toggleTheme}
          className="app-sidebar-foot-btn"
          title={collapsed ? (isDark ? "Light mode" : "Dark mode") : undefined}
        >
          {isDark ? <Sun /> : <Moon />}
          {!collapsed && <span>{isDark ? "Light mode" : "Dark mode"}</span>}
        </button>

        {user && (
          <div className="app-sidebar-user">
            <div className="app-sidebar-avatar">
              {(user.displayName || user.username).charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="app-sidebar-user-info">
                <p className="app-sidebar-user-name">
                  {user.displayName || user.username}
                </p>
                <p className="app-sidebar-user-email">{user.email}</p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => logout()}
          className="app-sidebar-foot-btn is-logout"
          title={collapsed ? "Sign out" : undefined}
        >
          <LogOut />
          {!collapsed && <span>Sign out</span>}
        </button>

        <button
          onClick={toggleCollapse}
          className="app-sidebar-foot-btn"
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
