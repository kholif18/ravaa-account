import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Shield, AlertCircle, CheckCircle, Copy, Eye, EyeOff, KeyRound } from "lucide-react";
import * as meApi from "../../lib/api/me";
import { ApiClientError } from "../../lib/api/client";

export function TwoFactorPage() {
  const [loadingSec, setLoadingSec] = useState(true);
  const [security, setSecurity] = useState<{ twoFactorEnabled: boolean; twoFactorSetupPending: boolean } | null>(null);
  const [secError, setSecError] = useState<string | null>(null);

  const [setupData, setSetupData] = useState<{ secret: string; otpauthUrl: string; backupCodes: string[] } | null>(null);
  const [code, setCode] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableLoading, setDisableLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const loadSecurity = async () => {
    setLoadingSec(true);
    setSecError(null);
    try {
      const { security: sec } = await meApi.getSecurity();
      setSecurity(sec);
    } catch {
      setSecError("Failed to load security settings");
    } finally {
      setLoadingSec(false);
    }
  };

  useEffect(() => {
    loadSecurity();
  }, []);

  const handleSetup = async () => {
    setMessage(null);
    setSetupLoading(true);
    try {
      const data = await meApi.setup2FA();
      setSetupData(data);
      // refresh security pending state
      await loadSecurity();
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : "Failed to setup 2FA";
      setMessage({ type: "error", text: msg });
    } finally {
      setSetupLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setMessage({ type: "error", text: "Code must be 6 digits" });
      return;
    }
    setConfirmLoading(true);
    setMessage(null);
    try {
      const res = await meApi.confirm2FA(code);
      setMessage({ type: "success", text: res.message || "2FA enabled" });
      setSetupData(null);
      setCode("");
      await loadSecurity();
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : "Failed to confirm";
      setMessage({ type: "error", text: msg });
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disablePassword) {
      setMessage({ type: "error", text: "Password required" });
      return;
    }
    setDisableLoading(true);
    setMessage(null);
    try {
      await meApi.disable2FA(disablePassword);
      setMessage({ type: "success", text: "Two-factor disabled" });
      setDisablePassword("");
      await loadSecurity();
      setSetupData(null);
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : "Failed to disable";
      setMessage({ type: "error", text: msg });
    } finally {
      setDisableLoading(false);
    }
  };

  const copy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  if (loadingSec) {
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Two-Factor Authentication</h1>
          <p className="page-subtitle">Loading...</p>
        </div>
      </div>
    );
  }

  const isEnabled = security?.twoFactorEnabled ?? false;

  return (
    <div className="page">
      <div className="page-header-row">
        <div className="page-header">
          <h1 className="page-title">Two-Factor Authentication</h1>
          <p className="page-subtitle">Add an extra layer of security to your account</p>
        </div>
        <Link to="/app/security">
          <button className="px-4 py-2 text-sm font-medium rounded-lg dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
            Back
          </button>
        </Link>
      </div>

      {message && (
        <div
          className={`flex items-start gap-2 p-3 rounded-xl text-sm border ${
            message.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400"
          }`}
        >
          {message.type === "success" ? <CheckCircle className="w-4 h-4 mt-0.5" /> : <AlertCircle className="w-4 h-4 mt-0.5" />}
          <span>{message.text}</span>
        </div>
      )}

      {secError && (
        <div className="flex items-center gap-2 p-3 rounded-xl text-sm bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4" /> {secError}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="icon-chip purple">
              <Shield />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold dark:text-slate-100 text-slate-900 flex items-center gap-2">
                Two-Factor Authentication
                {isEnabled ? <Badge variant="success">Enabled</Badge> : <Badge variant="warning">Disabled</Badge>}
              </h2>
              <p className="text-sm text-slate-500">
                {isEnabled ? "Your account is protected with TOTP 2FA." : "Protect your account with an authenticator app."}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isEnabled ? (
            <>
              {!setupData ? (
                <>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-sm text-slate-600 dark:text-slate-400">
                    <p className="font-medium dark:text-slate-200 text-slate-900 mb-1 flex items-center gap-2">
                      <KeyRound className="w-4 h-4" /> How it works
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Click Setup — we generate a secret key.</li>
                      <li>Scan QR or enter secret in Google Authenticator / Authy.</li>
                      <li>Enter the 6-digit code to confirm. You can also use <code className="font-mono bg-slate-200 dark:bg-slate-700 px-1 rounded">123456</code> for testing.</li>
                    </ul>
                  </div>
                  <Button onClick={handleSetup} loading={setupLoading}>
                    Setup 2FA
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-4 p-4 border dark:border-slate-700 border-slate-200 rounded-xl bg-amber-50/50 dark:bg-amber-500/5">
                    <div>
                      <p className="text-sm font-medium dark:text-slate-200 text-slate-900 mb-1">Secret Key</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 p-2 bg-white dark:bg-slate-900 rounded-lg font-mono text-sm break-all border dark:border-slate-700">
                          {showSecret ? setupData.secret : "•••• •••• •••• •••• •••• ••••"}
                        </code>
                        <Button variant="ghost" size="sm" onClick={() => setShowSecret(!showSecret)}>
                          {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => copy(setupData.secret, "secret")}>
                          {copied === "secret" ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 break-all">
                        otpauth: <span className="font-mono">{setupData.otpauthUrl}</span>
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium dark:text-slate-200 text-slate-900 mb-2">Backup Codes</p>
                      <p className="text-xs text-slate-500 mb-2">Save these — each can be used once if you lose your device. Shown only once.</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {setupData.backupCodes.map((c) => (
                          <code key={c} className="p-2 bg-white dark:bg-slate-900 rounded-lg font-mono text-xs text-center border dark:border-slate-700">
                            {c}
                          </code>
                        ))}
                      </div>
                      <Button variant="ghost" size="sm" className="mt-2" onClick={() => copy(setupData.backupCodes.join(", "), "backup")}>
                        {copied === "backup" ? "Copied" : "Copy all"}
                      </Button>
                    </div>
                  </div>

                  <form onSubmit={handleConfirm} className="space-y-3">
                    <Input
                      label="Verification Code"
                      placeholder="6-digit code (or 123456 for dev)"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      maxLength={6}
                      required
                    />
                    <div className="flex gap-2">
                      <Button type="submit" loading={confirmLoading}>
                        Confirm & Enable
                      </Button>
                      <Button type="button" variant="secondary" onClick={() => setSetupData(null)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </>
          ) : (
            <>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl flex gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-emerald-700 dark:text-emerald-400">2FA is active</p>
                  <p className="text-slate-600 dark:text-slate-400">You will be asked for a TOTP code on login from new devices. Keep your authenticator app safe.</p>
                </div>
              </div>

              <form onSubmit={handleDisable} className="space-y-3 p-4 border dark:border-slate-700 border-slate-200 rounded-xl">
                <h3 className="font-medium dark:text-slate-100 text-slate-900">Disable 2FA</h3>
                <p className="text-sm text-slate-500">Enter your password to disable two-factor authentication.</p>
                <Input
                  label="Password"
                  type="password"
                  placeholder="Current password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  required
                />
                <Button type="submit" variant="danger" loading={disableLoading}>
                  Disable 2FA
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200/50 dark:border-slate-700/30">
        <CardContent className="p-4">
          <div className="flex gap-3 text-sm text-slate-500">
            <AlertCircle className="w-5 h-5 text-slate-400 flex-shrink-0" />
            <div>
              <p className="font-medium dark:text-slate-300 text-slate-700">Backup codes are single-use</p>
              <p>If you lose your authenticator, use a backup code to regain access, then re-setup 2FA.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
