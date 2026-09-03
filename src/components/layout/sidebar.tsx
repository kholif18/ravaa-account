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
} from "lucide-react";
import { cn } from "../../lib/utils";
import { useTheme } from "../providers/theme-provider";
import { useAuth } from "../../auth/auth-provider";

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
  { to: "/app/applications", label: "Applications", icon: Puzzle },
  { to: "/app/preferences", label: "Preferences", icon: Settings },
  { to: "/app/data-privacy", label: "Data & Privacy", icon: Shield },
];

const adminNav: NavItem[] = [
  { to: "/admin", label: "Overview", icon: Settings, exact: true, admin: true },
  { to: "/admin/applications", label: "Applications", icon: AppWindow, admin: true },
  { to: "/admin/permissions", label: "Permissions", icon: Lock, admin: true },
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
          <Link to="/app" className="app-sidebar-logo">
            <span className="app-sidebar-logo-1">Ravaa</span>
            <span className="app-sidebar-logo-2">Account</span>
          </Link>
        )}
        {collapsed && (
          <Link to="/app" className="mx-auto app-sidebar-logo">
            <span className="app-sidebar-logo-1">R</span>
          </Link>
        )}
      </div>

      {/* Nav */}
      <nav className="app-sidebar-nav">
        {!collapsed && (
          <p className="app-sidebar-section-label">Account</p>
        )}
        {accountNav.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "app-sidebar-item",
              isActive(item.to, item.exact) && "is-active"
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}

        {isAdmin && (
          <>
            {!collapsed && (
              <p className="app-sidebar-section-label">Administration</p>
            )}
            {adminNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "app-sidebar-item is-admin",
                  isActive(item.to, item.exact) && "is-active"
                )}
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
