import { Link } from "react-router-dom";
import { useAuth } from "../../auth/auth-provider";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Shield, Clock, Key, AlertTriangle } from "lucide-react";

export function SecurityPage() {
  const { state } = useAuth();
  if (state.status !== "authenticated") return null;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Security</h1>
        <p className="page-subtitle">Manage your account security settings</p>
      </div>

      {/* Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="icon-chip">
              <Key />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold dark:text-slate-100 text-slate-900">
                Password
              </h2>
            </div>
            <Badge variant="success">Active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-4">
            Change your password regularly to keep your account secure.
          </p>
          <Link to="/app/security/password">
            <button className="auth-submit max-w-[200px]">
              Change Password
            </button>
          </Link>
        </CardContent>
      </Card>

      {/* Two-Factor Auth */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="icon-chip purple">
              <Shield />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold dark:text-slate-100 text-slate-900">
                Two-Factor Authentication
              </h2>
            </div>
            <Badge variant="warning">Recommended</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-4">
            Add an extra layer of security to your account with TOTP-based two-factor authentication.
          </p>
          <Link to="/app/security/2fa">
            <button className="auth-submit max-w-[200px]">
              Setup 2FA
            </button>
          </Link>
        </CardContent>
      </Card>

      {/* Recovery Options */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="icon-chip">
              <AlertTriangle />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold dark:text-slate-100 text-slate-900">
                Recovery Options
              </h2>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-4">
            Set up recovery email and phone number in case you lose access to your account.
          </p>
          <Link to="/app/security/recovery">
            <button className="auth-submit max-w-[200px]">
              Manage Recovery
            </button>
          </Link>
        </CardContent>
      </Card>

      {/* Active Sessions quick link */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="icon-chip neutral">
              <Clock />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold dark:text-slate-100 text-slate-900">
                Active Sessions
              </h2>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-4">
            View and manage your active sessions across devices.
          </p>
          <Link to="/app/sessions">
            <button className="auth-submit max-w-[200px]">
              Manage Sessions
            </button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
