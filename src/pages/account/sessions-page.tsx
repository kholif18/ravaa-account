import { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import * as sessionsApi from "../../lib/api/sessions";
import type { Session } from "../../types";
import { Monitor, Smartphone, Globe } from "lucide-react";

export function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    try {
      setLoading(true);
      const data = await sessionsApi.listSessions();
      setSessions(data.sessions);
    } catch {
      setError("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }

  async function handleRevokeSession(sessionId: string) {
    try {
      await sessionsApi.revokeSession(sessionId);
      setSessions(sessions.filter((s) => s.id !== sessionId));
    } catch {
      setError("Failed to revoke session");
    }
  }

  async function handleRevokeAll() {
    try {
      await sessionsApi.revokeAllSessions();
      await loadSessions();
    } catch {
      setError("Failed to revoke all sessions");
    }
  }

  const getDeviceIcon = (deviceType: string | null) => {
    switch (deviceType?.toLowerCase()) {
      case "mobile":
        return <Smartphone className="w-5 h-5" />;
      case "desktop":
        return <Monitor className="w-5 h-5" />;
      default:
        return <Globe className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="animate-pulse space-y-4">
          <div className="skeleton h-8 w-48" />
          <div className="skeleton h-4 w-64" />
          <div className="skeleton h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header-row">
        <div className="page-header">
          <h1 className="page-title">Sessions</h1>
          <p className="page-subtitle">Manage your active sessions</p>
        </div>
        <Button variant="danger" size="sm" onClick={handleRevokeAll}>
          Revoke All
        </Button>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <Card>
        <CardContent>
          <div className="list-divider">
            {sessions.map((session) => (
              <div key={session.id} className="list-item">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className="icon-chip neutral">
                      {getDeviceIcon(session.deviceType)}
                    </div>
                    <div>
                      <p className="font-medium dark:text-slate-100 text-slate-900">
                        {session.deviceName || session.deviceType || "Unknown Device"}
                      </p>
                      <p className="text-sm text-slate-500">
                        {session.ipAddress || "Unknown IP"}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Last active:{" "}
                        {session.lastActiveAt
                          ? new Date(session.lastActiveAt).toLocaleString()
                          : "Never"}
                      </p>
                      <p className="text-xs text-slate-400">
                        Expires: {new Date(session.expiresAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevokeSession(session.id)}
                  >
                    Revoke
                  </Button>
                </div>
              </div>
            ))}
            {sessions.length === 0 && (
              <p className="list-item text-sm text-slate-500 text-center">
                No active sessions
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
