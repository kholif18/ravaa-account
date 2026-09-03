import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { Globe, Bell, CheckCircle } from "lucide-react";
import { cn } from "../../lib/utils";

const STORAGE_KEY = "ravaa-preferences";

type Preferences = {
  language: string;
  timezone: string;
  emailNotifications: boolean;
  securityAlerts: boolean;
};

function loadPreferences(): Preferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return {
    language: "en",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    emailNotifications: true,
    securityAlerts: true,
  };
}

function savePreferences(prefs: Preferences) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function PreferencesPage() {
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  );
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const prefs = loadPreferences();
    setLanguage(prefs.language);
    setTimezone(prefs.timezone);
    setEmailNotifications(prefs.emailNotifications);
    setSecurityAlerts(prefs.securityAlerts);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    savePreferences({
      language,
      timezone,
      emailNotifications,
      securityAlerts,
    });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Preferences</h1>
        <p className="page-subtitle">Customize your account preferences</p>
      </div>

      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl text-sm text-blue-600 dark:text-blue-400">
        Preferences are stored locally in your browser. They are not synced to the server.
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
              <h2 className="text-lg font-semibold dark:text-slate-100 text-slate-900">
                Localization
              </h2>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className="block text-sm font-medium dark:text-slate-200 text-slate-700 mb-2">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <label className="block text-sm font-medium dark:text-slate-200 text-slate-700 mb-2">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 bg-white border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <h2 className="text-lg font-semibold dark:text-slate-100 text-slate-900">
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
        <p className="text-sm font-medium dark:text-slate-200 text-slate-900">{label}</p>
        <p className="text-sm text-slate-500 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0",
          checked
            ? "bg-blue-600"
            : "bg-slate-200 dark:bg-slate-700",
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
