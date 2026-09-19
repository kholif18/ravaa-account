import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { Globe, Bell, CheckCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import * as meApi from "../../lib/api/me";

export function PreferencesPage() {
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [success, setSuccess] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    meApi.getPreferences().then(({ preferences }) => {
      setLanguage(preferences.language || "en");
      setTimezone(preferences.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
      setEmailNotifications(preferences.emailNotifications);
      setSecurityAlerts(preferences.securityAlerts);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await meApi.updatePreferences({ language, timezone, emailNotifications, securityAlerts });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {}
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Preferences</h1>
        <p className="page-subtitle">Customize your account preferences</p>
      </div>

      <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-sm text-emerald-700 dark:text-emerald-300">
        {loading ? "Loading preferences..." : "Preferences are synced to server — berlaku di semua device (HP & web)."}
      </div>

      {success && (
        <div className="alert alert-success" role="alert">
          <CheckCircle className="h-4 w-4 text-green-500" />
          Preferences saved successfully
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Localization */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="icon-chip">
                <Globe />
              </div>
              <h2 className="text-lg font-semibold dark:text-zinc-100 text-white">
                Localization
              </h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className="block text-sm font-medium dark:text-zinc-200 text-zinc-300 mb-2">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm dark:bg-[#1A1A1A] dark:border-white/[0.04] dark:text-zinc-200 bg-white border-zinc-200 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="id">Bahasa Indonesia</option>
                <option value="ja">日本語</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-zinc-200 text-zinc-300 mb-2">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm dark:bg-[#1A1A1A] dark:border-white/[0.04] dark:text-zinc-200 bg-white border-zinc-200 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
                <option value="Europe/London">Europe/London</option>
                <option value="Europe/Berlin">Europe/Berlin</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
                <option value="Asia/Jakarta">Asia/Jakarta</option>
                <option value="Asia/Singapore">Asia/Singapore</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="icon-chip">
                <Bell />
              </div>
              <h2 className="text-lg font-semibold dark:text-zinc-100 text-white">
                Notifications
              </h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleSwitch
              label="Email Notifications"
              description="Receive notifications about your account activity via email"
              checked={emailNotifications}
              onChange={setEmailNotifications}
            />
            <ToggleSwitch
              label="Security Alerts"
              description="Receive alerts about suspicious activity and security events"
              checked={securityAlerts}
              onChange={setSecurityAlerts}
            />
          </CardContent>
        </Card>

        <button type="submit" className="auth-submit">
          Save Preferences
        </button>
      </form>
    </div>
  );
}

function ToggleSwitch({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <p className="text-sm font-medium dark:text-zinc-200 text-white">{label}</p>
        <p className="text-sm text-zinc-500 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0",
          checked
            ? "bg-blue-600"
            : "bg-slate-200 dark:bg-[#232323]",
        )}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={cn(
            "inline-block h-4 w-4 rounded-full bg-white transition-transform",
            checked ? "translate-x-6" : "translate-x-1",
          )}
        />
      </button>
    </div>
  );
}
