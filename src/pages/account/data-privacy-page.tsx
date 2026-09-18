import { useState } from "react";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  AlertCircle,
  Shield,
  FileText,
  Clock,
  Download,
  Trash2,
  CheckCircle,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import * as meApi from "../../lib/api/me";
import { useAuth } from "../../auth/auth-provider";
import { ApiClientError } from "../../lib/api/client";

export function DataPrivacyPage() {
  const { logout } = useAuth();
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);

  const [deletePassword, setDeletePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    setExportError(null);
    setExportSuccess(false);
    try {
      const data = await meApi.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ravaa-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setExportSuccess(true);
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : "Failed to export data";
      setExportError(msg);
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);
    if (confirmText !== "DELETE") {
      setDeleteError('Type DELETE to confirm');
      return;
    }
    if (!deletePassword) {
      setDeleteError("Password required");
      return;
    }
    setDeleting(true);
    try {
      await meApi.deleteAccount(deletePassword);
      // logout locally & redirect to login
      await logout().catch(() => {});
      window.location.href = "/login";
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : "Failed to delete account";
      setDeleteError(msg);
      setDeleting(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Data & Privacy</h1>
        <p className="page-subtitle">Manage your data and privacy settings</p>
      </div>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="icon-chip">
              <Download />
            </div>
            <h2 className="text-lg font-semibold dark:text-zinc-100 text-white">
              Download Your Data
            </h2>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-500 mb-4">
            Download a copy of your data including profile, security settings, sessions, connected applications, and recent audit logs.
          </p>

          {exportSuccess && (
            <div className="flex items-center gap-2 p-3 mb-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-sm text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-4 h-4" />
              Export downloaded. Check your downloads folder.
            </div>
          )}
          {exportError && (
            <div className="flex items-center gap-2 p-3 mb-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4" /> {exportError}
            </div>
          )}

          <div className="flex items-center justify-between p-4 bg-[#f5f5f5] dark:bg-[#1A1A1A]/50 rounded-lg border dark:border-white/[0.04]/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <FileText className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium dark:text-zinc-100 text-white">Full Data Export (JSON)</p>
                <p className="text-sm text-zinc-500">Includes profile, sessions, apps, audit logs</p>
              </div>
            </div>
            <Button onClick={handleExport} loading={exporting}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="icon-chip purple">
              <Clock />
            </div>
            <h2 className="text-lg font-semibold dark:text-zinc-100 text-white">
              Data Retention
            </h2>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-[#f5f5f5] dark:bg-[#1A1A1A]/50 rounded-lg border dark:border-white/[0.04]/30">
            <p className="font-medium dark:text-zinc-100 text-white mb-1">Automatic Deletion</p>
            <p className="text-sm text-zinc-500">
              Sessions older than 90 days are automatically purged. Application access logs are kept for 1 year for security auditing.
              Audit logs older than 1 year may be archived.
            </p>
          </div>
          <div className="p-4 bg-[#f5f5f5] dark:bg-[#1A1A1A]/30 rounded-lg border dark:border-white/[0.04]/30 opacity-80">
            <p className="font-medium dark:text-zinc-100 text-white mb-1">Local Preferences</p>
            <p className="text-sm text-zinc-500">
              Language, timezone, and notification preferences are stored in your browser (localStorage key <code className="font-mono">ravaa-preferences</code>). Clear site data to remove them.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Account Deletion */}
      <Card className="border-red-500/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="icon-chip !bg-red-500/10">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold dark:text-zinc-100 text-white">Delete Account</h2>
              <p className="text-sm text-red-500">Danger Zone — irreversible</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!showDeleteConfirm ? (
            <>
              <div className="p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-zinc-400 dark:text-zinc-400">
                    <p className="font-medium text-amber-700 dark:text-amber-400 mb-1">This will permanently delete your account</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>All sessions will be revoked</li>
                      <li>Application access grants will be removed</li>
                      <li>Your profile will be deleted (audit logs anonymized)</li>
                      <li>Admins: last admin cannot be deleted</li>
                    </ul>
                  </div>
                </div>
              </div>
              <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete My Account
              </Button>
            </>
          ) : (
            <form onSubmit={handleDelete} className="space-y-4">
              <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400">
                <p className="font-medium mb-1">Confirm deletion</p>
                <p>Type <code className="font-mono bg-red-100 dark:bg-red-900/50 px-1 rounded">DELETE</code> and enter your password.</p>
              </div>

              {deleteError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" /> {deleteError}
                </div>
              )}

              <Input
                label='Type "DELETE" to confirm'
                placeholder="DELETE"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                required
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Current password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[34px] text-zinc-400 hover:text-zinc-400 dark:hover:text-zinc-300"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex gap-3">
                <Button type="submit" variant="danger" loading={deleting} disabled={confirmText !== "DELETE" || !deletePassword}>
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                  Permanently Delete
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteError(null);
                    setDeletePassword("");
                    setConfirmText("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Privacy Notice */}
      <Card className="border-blue-500/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="icon-chip">
              <Shield />
            </div>
            <h2 className="text-lg font-semibold dark:text-zinc-100 text-white">
              Privacy Notice
            </h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-zinc-500 space-y-3">
            <p>
              Ravaa Account is the central identity service for the Ravaa ecosystem. We collect only the data necessary to provide
              authentication and authorization services across Ravaa applications.
            </p>
            <p>
              Your data is encrypted in transit (TLS 1.3) and at rest (AES-256). We do not sell your data to third parties. See export for
              exactly what we store.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
