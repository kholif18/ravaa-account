import { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, AlertTriangle, Loader2, Mail, Clock } from "lucide-react";
import { verifyEmail, resendVerification } from "../../lib/api/auth";
import { ApiClientError } from "../../lib/api/client";
import { useAuth } from "../../auth/auth-provider";

type VerifyState =
  | { kind: "missing_token" }
  | { kind: "loading" }
  | { kind: "success" }
  | { kind: "invalid" }
  | { kind: "expired" }
  | { kind: "error"; message: string };

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { state: authState, refreshUser } = useAuth();

  const [verifyState, setVerifyState] = useState<VerifyState>(() =>
    !token ? { kind: "missing_token" } : { kind: "loading" },
  );

  // resend
  const [email, setEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  const doVerify = useCallback(async (t: string) => {
    setVerifyState({ kind: "loading" });
    try {
      await verifyEmail(t);
      await refreshUser().catch(() => {});
      setVerifyState({ kind: "success" });
    } catch (err) {
      if (err instanceof ApiClientError) {
        const msg = err.message.toLowerCase();
        if (msg.includes("expired")) {
          setVerifyState({ kind: "expired" });
        } else if (msg.includes("invalid")) {
          setVerifyState({ kind: "invalid" });
        } else if (err.status === 404) {
          setVerifyState({ kind: "invalid" });
        } else {
          setVerifyState({ kind: "error", message: err.message });
        }
      } else {
        setVerifyState({ kind: "error", message: "Terjadi kesalahan. Coba lagi nanti." });
      }
    }
  }, [refreshUser]);

  useEffect(() => {
    if (token) {
      doVerify(token);
    }
  }, [token, doVerify]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setResendLoading(true);
    setResendMessage(null);
    setResendError(null);
    try {
      const res = await resendVerification(email.trim());
      setResendMessage(res.message || "Jika akun memerlukan verifikasi, email baru akan dikirim.");
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === "RATE_LIMIT") {
          setResendError("Terlalu banyak permintaan. Coba lagi dalam beberapa menit.");
        } else {
          setResendError(err.message);
        }
      } else {
        setResendError("Gagal mengirim ulang email.");
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-card">
      {/* Header */}
      <div className="auth-card-header">
        <h1 className="auth-card-title">Verifikasi Email</h1>
        <p className="auth-card-subtitle">Konfirmasi alamat email Ravaa Account kamu</p>
      </div>

      {/* States */}
      {verifyState.kind === "loading" && (
        <div className="flex flex-col items-center justify-center py-8 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--accent)]" />
          <p className="text-sm text-[var(--muted)]">Memverifikasi token kamu...</p>
        </div>
      )}

      {verifyState.kind === "missing_token" && (
        <div className="space-y-6">
          <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/10">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-700 dark:text-amber-400">Token tidak ditemukan</p>
              <p className="text-sm text-slate-500 mt-1">Link verifikasi tidak mengandung token. Pastikan kamu membuka link lengkap dari email.</p>
            </div>
          </div>
          <ResendForm
            email={email}
            setEmail={setEmail}
            onSubmit={handleResend}
            loading={resendLoading}
            message={resendMessage}
            error={resendError}
          />
          <div className="text-center">
            <Link to="/login" className="auth-link text-sm">Kembali ke login</Link>
          </div>
        </div>
      )}

      {verifyState.kind === "success" && (
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center py-4">
            <div className="h-14 w-14 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-lg font-semibold dark:text-white text-slate-900">Email berhasil diverifikasi</h2>
            <p className="text-sm text-slate-500 mt-2">Email kamu sekarang sudah terverifikasi.</p>
            <p className="text-sm text-slate-500">Akun Ravaa kamu tetap aktif dan siap digunakan.</p>
          </div>
          <Link to="/login" className="auth-submit justify-center no-underline">
            Masuk ke Ravaa Account
          </Link>
          {authState.status === "authenticated" && (
            <div className="text-center">
              <Link to="/app" className="auth-link text-sm">Buka dashboard</Link>
            </div>
          )}
        </div>
      )}

      {verifyState.kind === "invalid" && (
        <div className="space-y-6">
          <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/10">
            <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-600 dark:text-red-400">Link tidak valid</p>
              <p className="text-sm text-slate-500 mt-1">Link verifikasi tidak valid atau sudah digunakan. Silakan kirim ulang email verifikasi.</p>
            </div>
          </div>
          <ResendForm email={email} setEmail={setEmail} onSubmit={handleResend} loading={resendLoading} message={resendMessage} error={resendError} />
          <div className="text-center">
            <Link to="/login" className="auth-link text-sm">Kembali ke login</Link>
          </div>
        </div>
      )}

      {verifyState.kind === "expired" && (
        <div className="space-y-6">
          <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/20 bg-amber-500/10">
            <Clock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-700 dark:text-amber-400">Link sudah kedaluwarsa</p>
              <p className="text-sm text-slate-500 mt-1">Link verifikasi sudah kedaluwarsa. Silakan kirim ulang email verifikasi.</p>
            </div>
          </div>
          <ResendForm email={email} setEmail={setEmail} onSubmit={handleResend} loading={resendLoading} message={resendMessage} error={resendError} />
          <div className="text-center">
            <Link to="/login" className="auth-link text-sm">Kembali ke login</Link>
          </div>
        </div>
      )}

      {verifyState.kind === "error" && (
        <div className="space-y-6">
          <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/10">
            <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-600 dark:text-red-400">Gagal memverifikasi</p>
              <p className="text-sm text-slate-500 mt-1">{verifyState.message}</p>
            </div>
          </div>
          <ResendForm email={email} setEmail={setEmail} onSubmit={handleResend} loading={resendLoading} message={resendMessage} error={resendError} />
          <div className="text-center">
            <Link to="/login" className="auth-link text-sm">Kembali ke login</Link>
          </div>
        </div>
      )}
    </div>
  );
}

function ResendForm({
  email,
  setEmail,
  onSubmit,
  loading,
  message,
  error,
}: {
  email: string;
  setEmail: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  message: string | null;
  error: string | null;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="auth-field">
        <label htmlFor="resend-email" className="auth-label flex items-center gap-2">
          <Mail className="h-4 w-4" /> Kirim ulang email verifikasi
        </label>
        <div className="flex gap-2">
          <input
            id="resend-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@contoh.com"
            required
            className="auth-input flex-1"
          />
          <button type="submit" disabled={loading} className="auth-submit !mt-0 !w-auto px-6 shrink-0">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Kirim ulang"}
          </button>
        </div>
      </div>
      {message && (
        <div className="flex items-start gap-2 p-3 rounded-xl border border-green-500/20 bg-green-500/10 text-sm text-green-700 dark:text-green-400">
          <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" /> <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-sm text-red-600 dark:text-red-400">
          <XCircle className="h-4 w-4 shrink-0 mt-0.5" /> <span>{error}</span>
        </div>
      )}
    </form>
  );
}
