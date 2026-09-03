import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Mail, Phone, CheckCircle, AlertCircle } from "lucide-react";
import * as meApi from "../../lib/api/me";
import { ApiClientError } from "../../lib/api/client";

export function RecoveryPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryPhone, setRecoveryPhone] = useState("");
  const [initialEmail, setInitialEmail] = useState<string | null>(null);
  const [initialPhone, setInitialPhone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const { security } = await meApi.getSecurity();
      setRecoveryEmail(security.recoveryEmail ?? "");
      setRecoveryPhone(security.recoveryPhone ?? "");
      setInitialEmail(security.recoveryEmail);
      setInitialPhone(security.recoveryPhone);
    } catch {
      setError("Failed to load recovery settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setError(null);
    setSuccess(false);

    if (recoveryEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recoveryEmail)) {
      setErrors({ recoveryEmail: "Invalid email" });
      return;
    }
    if (recoveryPhone && !/^[+\d][\d\s\-().]{7,30}$/.test(recoveryPhone)) {
      setErrors({ recoveryPhone: "Invalid phone format" });
      return;
    }

    setSaving(true);
    try {
      await meApi.updateRecovery({
        recoveryEmail: recoveryEmail.trim() || null,
        recoveryPhone: recoveryPhone.trim() || null,
      });
      setSuccess(true);
      setInitialEmail(recoveryEmail.trim() || null);
      setInitialPhone(recoveryPhone.trim() || null);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.details) {
          const flat: Record<string, string> = {};
          for (const [k, v] of Object.entries(err.details)) flat[k] = Array.isArray(v) ? v[0] : String(v);
          setErrors(flat);
        }
        setError(err.message);
      } else {
        setError("Failed to update recovery options");
      }
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = recoveryEmail.trim() !== (initialEmail ?? "") || recoveryPhone.trim() !== (initialPhone ?? "");

  if (loading) {
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Recovery Options</h1>
          <p className="page-subtitle">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header-row">
        <div className="page-header">
          <h1 className="page-title">Recovery Options</h1>
          <p className="page-subtitle">Set up recovery email and phone to regain access if locked out</p>
        </div>
        <Link to="/app/security">
          <button className="px-4 py-2 text-sm font-medium rounded-lg dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors">
            Back
          </button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="icon-chip">
              <Mail />
            </div>
            <h2 className="text-lg font-semibold dark:text-slate-100 text-slate-900">
              Recovery Options
            </h2>
          </div>
        </CardHeader>
        <CardContent>
          {success && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-sm text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-4 h-4" />
              Recovery options updated
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2 p-3 mb-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Recovery Email"
              type="email"
              placeholder="recovery@example.com"
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
              error={errors.recoveryEmail}
            />
            <p className="text-xs text-slate-500 -mt-2">Cannot be the same as your primary email. Leave empty to clear.</p>

            <Input
              label="Recovery Phone"
              type="tel"
              placeholder="+628123456789"
              value={recoveryPhone}
              onChange={(e) => setRecoveryPhone(e.target.value)}
              error={errors.recoveryPhone}
            />
            <p className="text-xs text-slate-500 -mt-2">Include country code, e.g. +62. Leave empty to clear.</p>

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={saving} disabled={!hasChanges}>
                Save Recovery Options
              </Button>
              <Button type="button" variant="secondary" onClick={load}>
                Reset
              </Button>
            </div>
          </form>

          <div className="mt-6 grid gap-4">
            <div className={`flex items-center gap-3 p-4 rounded-lg border ${recoveryEmail ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20" : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"}`}>
              <div className={`p-2 rounded-lg ${recoveryEmail ? "bg-emerald-500/10" : "bg-blue-500/10"}`}>
                <Mail className={`w-5 h-5 ${recoveryEmail ? "text-emerald-500" : "text-blue-500"}`} />
              </div>
              <div className="flex-1">
                <p className="font-medium dark:text-slate-100 text-slate-900">Recovery Email</p>
                <p className="text-sm text-slate-500">{recoveryEmail || "Not set"}</p>
              </div>
              {recoveryEmail && <CheckCircle className="w-5 h-5 text-emerald-500" />}
            </div>

            <div className={`flex items-center gap-3 p-4 rounded-lg border ${recoveryPhone ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20" : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"}`}>
              <div className={`p-2 rounded-lg ${recoveryPhone ? "bg-emerald-500/10" : "bg-blue-500/10"}`}>
                <Phone className={`w-5 h-5 ${recoveryPhone ? "text-emerald-500" : "text-blue-500"}`} />
              </div>
              <div className="flex-1">
                <p className="font-medium dark:text-slate-100 text-slate-900">Recovery Phone</p>
                <p className="text-sm text-slate-500">{recoveryPhone || "Not set"}</p>
              </div>
              {recoveryPhone && <CheckCircle className="w-5 h-5 text-emerald-500" />}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-500">
              <p className="font-medium text-amber-600 dark:text-amber-400 mb-1">
                Security Note
              </p>
              <p>
                Keep your recovery information up to date. If you lose access to both your
                password and 2FA device, these recovery options are the only way to
                regain access to your account.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
