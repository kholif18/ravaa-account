import { useState, useEffect } from "react";
import { useAuth } from "../../auth/auth-provider";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Link } from "react-router-dom";
import {
  User,
  Shield,
  Clock,
  Puzzle,
  Settings,
  AppWindow,
  Mail,
  AlertTriangle,
  HardDrive,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { resendVerification } from "../../lib/api/auth";
import * as adminApi from "../../lib/api/admin";

export function DashboardPage() {
  const { state } = useAuth();
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  if (state.status !== "authenticated") return null;

  const { user } = state;

  const [storage, setStorage] = useState<{ used: number; limit: number } | null>(null);
  useEffect(() => {
    if (user.role === "ADMIN") {
      adminApi.listUsers().then((data) => {
        const me = (data.users as any[]).find((u: any) => u.id === user.id);
        if (me) setStorage({ used: Number(me.storageUsed || 0), limit: Number(me.storageLimit || 5368709120) });
      }).catch(() => setStorage({ used: 0, limit: 5368709120 }));
    } else {
      setStorage({ used: 0, limit: 5368709120 });
    }
  }, [user.id, user.role]);

  const handleResend = async () => {
    setResendLoading(true);
    setResendMsg(null);
    try {
      const r = await resendVerification(user.email);
      setResendMsg(r.message);
    } catch {
      setResendMsg("Gagal mengirim email.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Welcome, {user.displayName || user.username}!</h1>
        <p className="page-subtitle">Your Ravaa Account dashboard</p>
      </div>

      {!user.emailVerifiedAt && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/10">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Email belum diverifikasi</p>
            <p className="text-sm text-zinc-500">Verifikasi email kamu untuk membantu menjaga keamanan akun.</p>
            {resendMsg && <p className="text-sm text-green-600 dark:text-green-400 mt-1">{resendMsg}</p>}
          </div>
          <button
            onClick={handleResend}
            disabled={resendLoading}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-white dark:bg-[#1A1A1A] border border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Mail className="h-4 w-4" /> {resendLoading ? "Mengirim..." : "Kirim ulang email"}
          </button>
        </div>
      )}

      {/* Storage per-app — Google One style */}
      {storage && (
        <Card>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2"><HardDrive className="w-4 h-4" /> Storage</h3>
              <span className="text-xs text-zinc-500">{(storage.used / 1024 / 1024 / 1024).toFixed(2)} GB of {(storage.limit / 1024 / 1024 / 1024).toFixed(0)} GB used</span>
            </div>
            <div className="h-2 rounded-full bg-[#1A1A1A] border border-white/[0.04] overflow-hidden flex">
              <div className="bg-blue-500" style={{ width: `${Math.min(100, (storage.used / storage.limit) * 100)}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center gap-2"><HardDrive className="w-4 h-4 text-blue-400" /> Drive</div>
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2"><FileText className="w-4 h-4 text-emerald-400" /> Notes</div>
              <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-purple-400" /> Photos</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security status widget */}
      <Card className="border-green-500/30">
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="icon-chip green">
              <Shield />
            </div>
            <div className="flex-1">
              <p className="font-semibold dark:text-zinc-100 text-white">
                Security Status: Good
              </p>
              <p className="text-sm text-zinc-500">
                Password active. Consider enabling two-factor authentication.
              </p>
            </div>
            <Link to="/app/security/2fa">
              <button className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                Enable 2FA
              </button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="card-grid">
        <Link to="/app/profile">
          <Card className="card-link">
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="icon-chip">
                  <User />
                </div>
                <div>
                  <h3 className="font-semibold dark:text-zinc-100 text-white">
                    Profile
                  </h3>
                  <p className="text-sm text-zinc-500">
                    View and edit your account details
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/app/security">
          <Card className="card-link">
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="icon-chip">
                  <Shield />
                </div>
                <div>
                  <h3 className="font-semibold dark:text-zinc-100 text-white">
                    Security
                  </h3>
                  <p className="text-sm text-zinc-500">
                    Manage passwords and security settings
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/app/sessions">
          <Card className="card-link">
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="icon-chip">
                  <Clock />
                </div>
                <div>
                  <h3 className="font-semibold dark:text-zinc-100 text-white">
                    Sessions
                  </h3>
                  <p className="text-sm text-zinc-500">
                    View and revoke active sessions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/app/applications">
          <Card className="card-link">
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="icon-chip">
                  <Puzzle />
                </div>
                <div>
                  <h3 className="font-semibold dark:text-zinc-100 text-white">
                    Applications
                  </h3>
                  <p className="text-sm text-zinc-500">
                    Connected applications
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        {user.role === "ADMIN" && (
          <>
            <Link to="/admin">
              <Card className="card-link border-purple-500/30">
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="icon-chip purple">
                      <Settings />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold dark:text-zinc-100 text-white">
                          Administration
                        </h3>
                        <Badge variant="warning">Admin</Badge>
                      </div>
                      <p className="text-sm text-zinc-500">
                        Manage Ravaa ecosystem
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/admin/applications">
              <Card className="card-link">
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="icon-chip">
                      <AppWindow />
                    </div>
                    <div>
                      <h3 className="font-semibold dark:text-zinc-100 text-white">
                        Manage Applications
                      </h3>
                      <p className="text-sm text-zinc-500">
                        Create and configure applications
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
