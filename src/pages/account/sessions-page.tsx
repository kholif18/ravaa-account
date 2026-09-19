import { useState, useEffect } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import * as sessionsApi from "../../lib/api/sessions";
import type { Session } from "../../types";
import { Monitor, Smartphone, Globe, Shield, MapPin } from "lucide-react";

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

  const currentId = sessions[0]?.id;

  return (
    <div className="page">
      <div className="page-header-row">
        <div className="page-header">
          <h1 className="page-title flex items-center gap-2"><Shield className="w-5 h-5" /> Sessions</h1>
          <p className="page-subtitle">Recent activity & Your devices — kayak Google (IP + device + last active)</p>
        </div>
        <Button variant="danger" size="sm" onClick={handleRevokeAll}>
          Revoke All
        </Button>
      </div>

      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
        <Shield className="w-4 h-4 mt-0.5" />
        <span>Jika ada sesi yang tidak kamu kenali, segera <strong>Revoke</strong> — was it you?</span>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="list-divider">
            {sessions.map((session) => {
              const isCurrent = session.id === currentId;
              return (
                <div key={session.id} className="list-item">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className={`icon-chip ${isCurrent ? "bg-emerald-500/20 text-emerald-400" : "neutral"}`}>
                        {getDeviceIcon(session.deviceType)}
                      </div>
                      <div>
                        <p className="font-medium dark:text-zinc-100 text-white flex items-center gap-2">
                          {session.deviceName || session.deviceType || "Unknown Device"}
                          {isCurrent && <Badge variant="success">Current</Badge>}
                        </p>
                        <p className="text-sm text-zinc-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {session.ipAddress || "Unknown IP"} {isCurrent && "• This device"}
                        </p>
                        <p className="text-xs text-zinc-400 mt-1">
                          Last active: {session.lastActiveAt ? new Date(session.lastActiveAt).toLocaleString() : "Never"} {isCurrent && "• now"}
                        </p>
                        <p className="text-xs text-zinc-400">Expires: {new Date(session.expiresAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleRevokeSession(session.id)} disabled={isCurrent}>
                      {isCurrent ? "Current" : "Revoke"}
                    </Button>
                  </div>
                </div>
              );
            })}
            {sessions.length === 0 && (
              <p className="list-item text-sm text-zinc-500 text-center">
                No active sessions
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
