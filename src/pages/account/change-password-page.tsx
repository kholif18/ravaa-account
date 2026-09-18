import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Key, CheckCircle, AlertCircle, Eye, EyeOff } from "lucide-react";
import * as meApi from "../../lib/api/me";
import { ApiClientError } from "../../lib/api/client";

export function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);
    setSuccess(false);

    if (!currentPassword) {
      setErrors({ currentPassword: "Current password required" });
      return;
    }
    if (newPassword.length < 8) {
      setErrors({ newPassword: "New password must be at least 8 characters" });
      return;
    }
    if (newPassword === currentPassword) {
      setErrors({ newPassword: "New password must be different" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setLoading(true);
    try {
      await meApi.changePassword({ currentPassword, newPassword });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.details) {
          const flat: Record<string, string> = {};
          for (const [k, v] of Object.entries(err.details)) flat[k] = Array.isArray(v) ? v[0] : String(v);
          setErrors(flat);
        }
        setGeneralError(err.message);
      } else {
        setGeneralError("Failed to change password");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header-row">
        <div className="page-header">
          <h1 className="page-title">Change Password</h1>
          <p className="page-subtitle">Update your account password</p>
        </div>
        <Link to="/app/security">
          <button className="px-4 py-2 text-sm font-medium rounded-lg dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-[#1A1A1A]/50 text-zinc-400 hover:text-white hover:bg-[#f5f5f5] transition-colors">
            Back
          </button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="icon-chip">
              <Key />
            </div>
            <h2 className="text-lg font-semibold dark:text-zinc-100 text-white">
              Change Password
            </h2>
          </div>
        </CardHeader>
        <CardContent>
          {success && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-sm text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-4 h-4" />
              Password changed successfully. Other sessions remain active but you should re-login on other devices.
            </div>
          )}
          {generalError && (
            <div className="flex items-start gap-2 p-3 mb-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 mt-0.5" />
              <span>{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                label="Current Password"
                type={showCurrent ? "text" : "password"}
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                error={errors.currentPassword}
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-[34px] text-zinc-400 hover:text-zinc-400 dark:hover:text-zinc-300"
                tabIndex={-1}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="relative">
              <Input
                label="New Password"
                type={showNew ? "text" : "password"}
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={errors.newPassword}
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-[34px] text-zinc-400 hover:text-zinc-400 dark:hover:text-zinc-300"
                tabIndex={-1}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Input
              label="Confirm New Password"
              type={showNew ? "text" : "password"}
              placeholder="Repeat new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              required
            />

            <p className="text-xs text-zinc-500">
              Password must be at least 8 characters. For security, other sessions are not automatically revoked — manage them in Sessions.
            </p>

            <Button type="submit" loading={loading} className="w-full sm:w-auto min-w-[160px]">
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
