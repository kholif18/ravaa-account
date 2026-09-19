import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/auth-provider";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Shield, Clock, Key, AlertTriangle } from "lucide-react";
import * as meApi from "../../lib/api/me";

export function SecurityPage() {
  const { state } = useAuth();
  const [security, setSecurity] = useState<{ twoFactorEnabled: boolean } | null>(null);
  useEffect(() => {
    meApi.getSecurity().then((data) => setSecurity(data.security)).catch(() => {});
  }, []);
  if (state.status !== "authenticated") return null;
  const isEnabled = security?.twoFactorEnabled ?? false;

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
              <h2 className="text-lg font-semibold dark:text-zinc-100 text-white">
                Password
              </h2>
            </div>
            <Badge variant="success">Active</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500 mb-4">
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
              <h2 className="text-lg font-semibold dark:text-zinc-100 text-white">
                Two-Factor Authentication
              </h2>
            </div>
            <Badge variant={isEnabled ? "success" : "warning"}>{isEnabled ? "Enabled" : "Recommended"}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500 mb-4">
            {isEnabled ? "Your account is protected with TOTP 2FA. Manage or disable in settings." : "Add an extra layer of security to your account with TOTP-based two-factor authentication."}
          </p>
          <Link to="/app/security/2fa">
            <button className="auth-submit max-w-[200px]">
              {isEnabled ? "Manage 2FA" : "Setup 2FA"}
            </button>
          </Link>
        </CardContent>
      </Card>

      {/* Passkeys */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="icon-chip">
              <Key />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold dark:text-zinc-100 text-white">
                Passkeys
              </h2>
            </div>
            <Badge variant="success">New</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500 mb-4">
            Login without password using Touch ID / Face ID / Windows Hello — like Google.
          </p>
          <Link to="/app/security/passkeys">
            <button className="auth-submit max-w-[200px]">
              Manage Passkeys
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
              <h2 className="text-lg font-semibold dark:text-zinc-100 text-white">
                Recovery Options
              </h2>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500 mb-4">
            Set up recovery email and phone number in case you lose access to your account.
          </p>
          <Link to="/app/security/recovery">
            <button className="auth-submit max-w-[200px]">
              Manage Recovery
            </button>
          </Link>
        </CardContent>
      </Card>

      {/* App Passwords */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="icon-chip">
              <Key />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold dark:text-zinc-100 text-white">
                App Passwords
              </h2>
            </div>
            <Badge variant="warning">For Android</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500 mb-4">
            Create separate passwords for Drive Android sync without using your main password.
          </p>
          <Link to="/app/security/app-passwords">
            <button className="auth-submit max-w-[200px]">
              Manage App Passwords
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
              <h2 className="text-lg font-semibold dark:text-zinc-100 text-white">
                Active Sessions
              </h2>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500 mb-4">
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
