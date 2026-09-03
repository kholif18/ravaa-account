import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Puzzle, AlertCircle, AppWindow, Shield, Trash2, Clock, CheckCircle } from "lucide-react";
import * as meApi from "../../lib/api/me";
import type { MyApplicationAccess } from "../../types";
import { ApiClientError } from "../../lib/api/client";

export function ApplicationsPage() {
  const [accesses, setAccesses] = useState<MyApplicationAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await meApi.listMyApplications();
      // filter out revoked if you want to show active only, but show all with badge
      setAccesses(data.accesses);
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : "Failed to load applications";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRevoke = async (accessId: string) => {
    if (!confirm("Revoke access for this application? You will need to re-authorize to use it again.")) return;
    setRevoking(accessId);
    setError(null);
    setSuccess(null);
    try {
      await meApi.revokeMyApplicationAccess(accessId);
      setAccesses((prev) => prev.map((a) => (a.id === accessId ? { ...a, revokedAt: new Date().toISOString() } : a)));
      setSuccess("Access revoked");
    } catch (err) {
      const msg = err instanceof ApiClientError ? err.message : "Failed to revoke";
      setError(msg);
    } finally {
      setRevoking(null);
    }
  };

  const active = accesses.filter((a) => !a.revokedAt);
  const revoked = accesses.filter((a) => !!a.revokedAt);

  return (
    <div className="page">
      <div className="page-header-row">
        <div className="page-header">
          <h1 className="page-title">Connected Applications</h1>
          <p className="page-subtitle">Applications that have access to your Ravaa Account</p>
        </div>
        {!loading && <Badge variant={active.length > 0 ? "success" : "default"}>{active.length} active</Badge>}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl text-sm bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 rounded-xl text-sm bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
          <CheckCircle className="w-4 h-4" /> {success}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="icon-chip">
              <Puzzle />
            </div>
            <h2 className="text-lg font-semibold dark:text-slate-100 text-slate-900">
              User Application Access
            </h2>
            {!loading && active.length === 0 && revoked.length === 0 && <Badge variant="default">No apps</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800/50 animate-pulse" />
              ))}
            </div>
          ) : accesses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 mb-3">
                <Puzzle className="w-6 h-6 text-slate-400" />
              </div>
              <p className="font-medium dark:text-slate-100 text-slate-900">No applications yet</p>
              <p className="text-sm text-slate-500 max-w-md mt-1">
                When you authorize a Ravaa app like Ravaa Drive, it will appear here. You can revoke access at any time.
              </p>
              <Button variant="secondary" size="sm" className="mt-4" onClick={load}>
                Refresh
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {active.length > 0 && (
                <>
                  <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Active</p>
                  {active.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-4 p-4 rounded-xl border dark:border-slate-700 border-slate-200 bg-white dark:bg-slate-800/30"
                    >
                      <div className="p-2.5 rounded-xl bg-blue-500/10">
                        <AppWindow className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium dark:text-slate-100 text-slate-900 truncate">
                          {a.application.name}
                        </p>
                        <p className="text-xs font-mono text-slate-500 truncate">{a.application.slug} • {a.application.clientId.slice(0, 16)}…</p>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {a.scopes.length > 0 ? (
                            a.scopes.map((s) => (
                              <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                {s}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">No scopes</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Granted {new Date(a.grantedAt).toLocaleDateString()} • {a.application.status}
                        </p>
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        loading={revoking === a.id}
                        onClick={() => handleRevoke(a.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                        Revoke
                      </Button>
                    </div>
                  ))}
                </>
              )}

              {revoked.length > 0 && (
                <>
                  <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase mt-6">Revoked</p>
                  {revoked.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-4 p-4 rounded-xl border dark:border-slate-700/50 border-slate-200/50 bg-slate-50 dark:bg-slate-800/20 opacity-70"
                    >
                      <div className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-700">
                        <Shield className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium dark:text-slate-300 text-slate-700 truncate">
                          {a.application.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{a.application.slug}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Revoked {a.revokedAt ? new Date(a.revokedAt).toLocaleDateString() : ""} • Granted {new Date(a.grantedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="default">Revoked</Badge>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-blue-500/30">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-slate-500">
              <p className="font-medium text-blue-600 dark:text-blue-400 mb-1">About Application Access</p>
              <p>
                In the Ravaa ecosystem, applications like Ravaa Drive request access to your account via OAuth2. Once you grant access, the
                application appears here and you can revoke it at any time.
              </p>
              <p className="mt-2">
                For managing registered applications (admin only), visit the{" "}
                <Link to="/admin/applications" className="text-blue-500 hover:text-blue-400 font-medium">
                  Admin → Applications
                </Link>{" "}
                page.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
