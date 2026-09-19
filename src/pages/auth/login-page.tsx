import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Send,
} from "lucide-react";
import { useAuth } from "../../auth/auth-provider";
import { resendVerification } from "../../lib/api/auth";
import { ApiClientError } from "../../lib/api/client";

export function LoginPage() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setFieldErrors({});
    setResendMsg(null);

    // client-side required validation
    const newFieldErrors: Record<string, string> = {};
    if (!identifier.trim()) newFieldErrors.identifier = "Username atau email wajib diisi";
    if (!password) newFieldErrors.password = "Password wajib diisi";
    if (Object.keys(newFieldErrors).length > 0) {
      setFieldErrors(newFieldErrors);
      return;
    }

    setLoading(true);

    try {
      await login(identifier.trim(), password);
    } catch (err) {
      if (err instanceof ApiClientError) {
        // Field-specific errors from backend (details)
        if (err.details) {
          const mapped: Record<string, string> = {};
          for (const [k, v] of Object.entries(err.details)) {
            const key = k === "identifier" ? "identifier" : k;
            mapped[key] = Array.isArray(v) ? v[0] : String(v);
          }
          // if backend sent identifier/password details, show per-field
          if (mapped.identifier || mapped.password) {
            setFieldErrors(mapped);
            // also show general if there's message not in field
            if (err.message && !mapped.identifier && !mapped.password) {
              setError(err.message);
            }
            // keep identifier value, focus will be handled by browser
            return;
          }
          // fallback: show first detail as general
          const first = Object.values(mapped)[0];
          if (first) setError(first);
          else setError(err.message);
          return;
        }
        switch (err.code) {
          case "AUTHENTICATION_ERROR":
            // fallback generic → treat as password error if identifier looks valid
            if (identifier.includes("@") || identifier.length >= 3) {
              setFieldErrors({ password: "Password salah" });
            } else {
              setFieldErrors({ identifier: "Username atau email tidak ditemukan" });
            }
            break;
          case "ACCOUNT_LOCKED":
            setError("Akun terkunci sementara. Coba lagi nanti.");
            break;
          case "RATE_LIMIT":
            setError("Terlalu banyak percobaan. Tunggu sebentar.");
            break;
          default:
            setError(err.message);
        }
      } else {
        setError("Terjadi kesalahan. Coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      {/* Mobile logo — desktop shows branding in the layout */}
      <div className="auth-card-header lg:hidden flex flex-col items-center gap-2">
        <img src="/logo.svg" alt="Ravaa" className="w-10 h-10" />
        <h1 className="auth-card-title !text-2xl">Ravaa <span className="auth-accent">Account</span></h1>
        <p className="auth-card-subtitle">Sign in to your account</p>
      </div>

      {/* Desktop heading */}
      <div className="auth-card-header hidden lg:block">
        <h1 className="auth-card-title">Welcome back</h1>
        <p className="auth-card-subtitle">Sign in to your Ravaa Account</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {error && (
          <div role="alert" className="auth-error">
            <AlertCircle className="auth-error-icon" />
            <span>{error}</span>
          </div>
        )}
        {pendingEmail && (
          <div className="flex flex-col gap-2 p-3 rounded-xl border border-amber-500/20 bg-amber-500/10 text-sm">
            <span className="text-amber-700 dark:text-amber-400">Email kamu belum diverifikasi.</span>
            <button
              type="button"
              onClick={async () => {
                setResendLoading(true);
                setResendMsg(null);
                try {
                  const r = await resendVerification(pendingEmail);
                  setResendMsg(r.message);
                } catch (e) {
                  if (e instanceof ApiClientError) setResendMsg(e.message);
                  else setResendMsg("Gagal mengirim ulang.");
                } finally {
                  setResendLoading(false);
                }
              }}
              disabled={resendLoading}
              className="inline-flex items-center gap-1.5 text-[var(--accent)] font-medium hover:underline text-left"
            >
              {resendLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Kirim ulang email verifikasi
            </button>
            {resendMsg && <span className="text-zinc-500">{resendMsg}</span>}
          </div>
        )}

        <div className="auth-field">
          <label htmlFor="identifier" className="auth-label">
            Email or Username
          </label>
          <div className="relative">
            <Mail className="auth-input-icon" />
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                if (fieldErrors.identifier) setFieldErrors((prev) => ({ ...prev, identifier: "" }));
              }}
              required
              autoFocus
              autoComplete="username"
              placeholder="you@example.com"
              className={`auth-input ${fieldErrors.identifier ? "is-error" : ""}`}
              style={{ paddingLeft: "2.75rem" }}
              aria-invalid={!!fieldErrors.identifier}
              aria-describedby={fieldErrors.identifier ? "identifier-error" : undefined}
            />
          </div>
          {fieldErrors.identifier && (
            <p id="identifier-error" className="auth-field-error">
              {fieldErrors.identifier}
            </p>
          )}
        </div>

        <div className="auth-field">
          <label htmlFor="password" className="auth-label">
            Password
          </label>
          <div className="relative">
            <Lock className="auth-input-icon" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: "" }));
              }}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className={`auth-input ${fieldErrors.password ? "is-error" : ""}`}
              style={{ paddingLeft: "2.75rem", paddingRight: "3rem" }}
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
            />
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                togglePassword();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  togglePassword();
                }
              }}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="auth-eye-btn"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {fieldErrors.password && (
            <p id="password-error" className="auth-field-error">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <button type="submit" disabled={loading} className="auth-submit">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      {/* Resend verification helper */}
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => {
            if (identifier.includes("@")) setPendingEmail(identifier);
            else setPendingEmail(identifier);
          }}
          className="text-sm text-zinc-500 hover:text-[var(--accent)]"
        >
          Belum dapat email verifikasi?
        </button>
      </div>

      <div className="auth-footer">
        <span>Don't have an account?{" "}</span>
        <Link to="/register" className="auth-link">
          Create one
        </Link>
      </div>
    </div>
  );
}
