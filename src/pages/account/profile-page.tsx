import { useState } from "react";
import { useAuth } from "../../auth/auth-provider";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { resendVerification } from "../../lib/api/auth";
import { ApiClientError } from "../../lib/api/client";

export function ProfilePage() {
  const { state } = useAuth();

  if (state.status !== "authenticated") return null;

  const { user } = state;

  const roleVariant = user.role === "ADMIN" ? "warning" : "default";
  const statusVariant =
    user.status === "active"
      ? "success"
      : user.status === "suspended"
        ? "danger"
        : "warning";

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Your Ravaa Account information</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold dark:text-zinc-100 text-white">
            Account Details
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {(user.displayName || user.username).charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-lg font-medium dark:text-zinc-100 text-white">
                {user.displayName || user.username}
              </p>
              <p className="text-sm text-zinc-500">@{user.username}</p>
            </div>
          </div>

          <div className="border-t dark:border-white/[0.04]/30 border-zinc-200/50 pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-500">Email</span>
              <span className="text-sm dark:text-zinc-200 text-white">
                {user.email}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-500">Role</span>
              <Badge variant={roleVariant}>{user.role}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-500">Status</span>
              <Badge variant={statusVariant}>{user.status}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-500">Email Verified</span>
              <span className="text-sm flex items-center gap-1.5">
                {user.emailVerifiedAt ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="dark:text-zinc-200 text-white">Terverifikasi</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span className="dark:text-zinc-200 text-white">Belum terverifikasi</span>
                  </>
                )}
              </span>
            </div>
            {!user.emailVerifiedAt && (
              <EmailVerificationBanner email={user.email} />
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-zinc-500">Member Since</span>
              <span className="text-sm dark:text-zinc-200 text-white">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function EmailVerificationBanner({ email }: { email: string }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <div className="mt-3 p-3 rounded-xl border border-amber-500/20 bg-amber-500/10 flex flex-col gap-2">
      <p className="text-sm text-amber-700 dark:text-amber-400">Email kamu belum diverifikasi. Periksa inbox atau kirim ulang.</p>
      <button
        onClick={async () => {
          setLoading(true);
          setMsg(null);
          try {
            const r = await resendVerification(email);
            setMsg(r.message);
          } catch (e) {
            if (e instanceof ApiClientError) setMsg(e.message);
            else setMsg("Gagal mengirim ulang.");
          } finally {
            setLoading(false);
          }
        }}
        disabled={loading}
        className="self-start inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:underline"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
        Kirim ulang email verifikasi
      </button>
      {msg && <p className="text-sm text-zinc-500">{msg}</p>}
    </div>
  );
}
