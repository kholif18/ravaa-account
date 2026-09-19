import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/auth-provider";
import { ApiClientError } from "../../lib/api/client";
import { resendVerification } from "../../lib/api/auth";
import { Eye, EyeOff, Loader2, Lock, Mail, User, CheckCircle } from "lucide-react";

export function RegisterPage() {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    if (password.length < 8) {
      setErrors({ password: "Password must be at least 8 characters" });
      return;
    }

    setLoading(true);
    try {
      await register(email, username, password, displayName || undefined);
      setRegisteredEmail(email);
      return;
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.details) {
          const flatErrors: Record<string, string> = {};
          for (const [key, messages] of Object.entries(err.details)) {
            flatErrors[key] = Array.isArray(messages)
              ? messages[0]
              : String(messages);
          }
          setErrors(flatErrors);
        } else {
          setErrors({ form: err.message });
        }
      } else {
        setErrors({ form: "An unexpected error occurred" });
      }
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = (name: string) =>
    `auth-field ${errors[name] ? "is-invalid" : ""}`;

  const inputCls = (name: string) =>
    `auth-input ${errors[name] ? "is-error" : ""}`;

  const handleResend = async () => {
    if (!registeredEmail) return;
    setResendLoading(true);
    setResendMsg(null);
    try {
      const res = await resendVerification(registeredEmail);
      setResendMsg(res.message);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setResendMsg(err.message);
      } else {
        setResendMsg("Gagal mengirim ulang email.");
      }
    } finally {
      setResendLoading(false);
    }
  };

  if (registeredEmail) {
    return (
      <div className="auth-card">
        <div className="auth-card-header">
          <h1 className="auth-card-title">Akun berhasil dibuat</h1>
          <p className="auth-card-subtitle">Akun kamu sudah aktif</p>
        </div>
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center py-4">
            <div className="h-14 w-14 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
              <CheckCircle className="h-7 w-7 text-green-500" />
            </div>
            <p className="text-sm font-medium text-zinc-300 dark:text-zinc-200">Akun Ravaa kamu sudah aktif dan dapat digunakan.</p>
            <p className="text-sm text-zinc-400 dark:text-zinc-300 mt-3">
              Kami telah mengirim email verifikasi ke
            </p>
            <p className="font-semibold text-[var(--accent)] mt-1">{registeredEmail}</p>
            <p className="text-sm text-zinc-500 mt-3">Verifikasi email disarankan untuk meningkatkan keamanan akun. Link berlaku 24 jam.</p>
          </div>
          {resendMsg && (
            <div className="flex items-start gap-2 p-3 rounded-xl border border-green-500/20 bg-green-500/10 text-sm text-green-700 dark:text-green-400">
              <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" /> <span>{resendMsg}</span>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <Link to="/app" className="auth-submit justify-center no-underline text-center">
              Masuk ke Ravaa Account
            </Link>
            <button onClick={handleResend} disabled={resendLoading} className="w-full py-2 text-sm font-medium rounded-xl border dark:border-white/[0.04] border-zinc-200 dark:text-zinc-300 text-zinc-400 hover:bg-[#f5f5f5] dark:hover:bg-[#1A1A1A] transition-colors flex items-center justify-center gap-2">
              {resendLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />} Kirim ulang email verifikasi
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-card">
      {/* Mobile logo — desktop shows branding in the layout */}
      <div className="auth-card-header lg:hidden flex flex-col items-center gap-2">
        <img src="/logo.svg" alt="Ravaa" className="w-10 h-10" />
        <h1 className="auth-card-title !text-2xl">
          Ravaa <span className="auth-accent">Account</span>
        </h1>
        <p className="auth-card-subtitle">Create your account</p>
      </div>

      {/* Desktop heading */}
      <div className="auth-card-header hidden lg:block">
        <h1 className="auth-card-title">Create your account</h1>
        <p className="auth-card-subtitle">Join the Ravaa ecosystem</p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        {errors.form && (
          <div role="alert" className="auth-error">
            <span>{errors.form}</span>
          </div>
        )}

        <div className={fieldClass("email")}>
          <label htmlFor="email" className="auth-label">
            Email
          </label>
          <div className="relative">
            <Mail className="auth-input-icon" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className={inputCls("email")}
              style={{ paddingLeft: "2.75rem" }}
            />
          </div>
          {errors.email && <p className="auth-field-error">{errors.email}</p>}
        </div>

        <div className={fieldClass("username")}>
          <label htmlFor="username" className="auth-label">
            Username
          </label>
          <div className="relative">
            <User className="auth-input-icon" />
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
              required
              autoComplete="username"
              className={inputCls("username")}
              style={{ paddingLeft: "2.75rem" }}
            />
          </div>
          {errors.username && (
            <p className="auth-field-error">{errors.username}</p>
          )}
        </div>

        <div className="auth-field">
          <label htmlFor="displayName" className="auth-label">
            Display Name <span style={{ color: "var(--muted)" }}>(optional)</span>
          </label>
          <div className="relative">
            <User className="auth-input-icon" />
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="John Doe"
              autoComplete="name"
              className="auth-input"
              style={{ paddingLeft: "2.75rem" }}
            />
          </div>
        </div>

        <div className={fieldClass("password")}>
          <label htmlFor="password" className="auth-label">
            Password
          </label>
          <div className="relative">
            <Lock className="auth-input-icon" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              required
              autoComplete="new-password"
              className={inputCls("password")}
              style={{ paddingLeft: "2.75rem", paddingRight: "3rem" }}
            />
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setShowPassword((p) => !p);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setShowPassword((p) => !p);
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
          {errors.password && (
            <p className="auth-field-error">{errors.password}</p>
          )}
        </div>

        <div className={fieldClass("confirmPassword")}>
          <label htmlFor="confirmPassword" className="auth-label">
            Confirm Password
          </label>
          <div className="relative">
            <Lock className="auth-input-icon" />
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              autoComplete="new-password"
              className={inputCls("confirmPassword")}
              style={{ paddingLeft: "2.75rem", paddingRight: "3rem" }}
            />
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                setShowPassword((p) => !p);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setShowPassword((p) => !p);
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
          {errors.confirmPassword && (
            <p className="auth-field-error">{errors.confirmPassword}</p>
          )}
        </div>

        <button type="submit" disabled={loading} className="auth-submit">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      <div className="auth-footer">
        <span>Already have an account?{" "}</span>
        <Link to="/login" className="auth-link">
          Sign in
        </Link>
      </div>
    </div>
  );
}
