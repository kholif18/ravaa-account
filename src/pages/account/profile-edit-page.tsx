import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/auth-provider";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { User, CheckCircle, AlertCircle } from "lucide-react";
import * as meApi from "../../lib/api/me";
import { ApiClientError } from "../../lib/api/client";

export function ProfileEditPage() {
  const { state, refreshUser } = useAuth();
  const navigate = useNavigate();

  if (state.status !== "authenticated") return null;
  const { user } = state;

  const [displayName, setDisplayName] = useState(user.displayName ?? "");
  const [username, setUsername] = useState(user.username);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDisplayName(user.displayName ?? "");
    setUsername(user.username);
    setAvatarUrl(user.avatarUrl ?? "");
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError(null);
    setSuccess(false);

    // client validation
    if (username.length < 3) {
      setErrors({ username: "Username min 3 chars" });
      return;
    }
    if (!/^[a-z0-9_]+$/.test(username.toLowerCase())) {
      setErrors({ username: "Only lowercase letters, numbers, underscore" });
      return;
    }
    if (displayName.length > 100) {
      setErrors({ displayName: "Max 100 chars" });
      return;
    }
    if (avatarUrl && avatarUrl.length > 0) {
      try {
        new URL(avatarUrl);
      } catch {
        setErrors({ avatarUrl: "Must be a valid URL" });
        return;
      }
    }

    setLoading(true);
    try {
      const payload: Record<string, string | null> = {};
      const trimmedDisplay = displayName.trim();
      const trimmedUsername = username.trim().toLowerCase();
      const trimmedAvatar = avatarUrl.trim();

      // only send changed fields
      if (trimmedDisplay !== (user.displayName ?? "")) {
        payload.displayName = trimmedDisplay || null;
      }
      if (trimmedUsername !== user.username) {
        payload.username = trimmedUsername;
      }
      if (trimmedAvatar !== (user.avatarUrl ?? "")) {
        payload.avatarUrl = trimmedAvatar || null;
      }

      if (Object.keys(payload).length === 0) {
        setGeneralError("No changes to save");
        setLoading(false);
        return;
      }

      await meApi.updateProfile(payload);
      await refreshUser();
      setSuccess(true);
      setTimeout(() => navigate("/app/profile"), 800);
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.details) {
          const flat: Record<string, string> = {};
          for (const [k, v] of Object.entries(err.details)) {
            flat[k] = Array.isArray(v) ? v[0] : String(v);
          }
          setErrors(flat);
        }
        setGeneralError(err.message);
      } else {
        setGeneralError("Failed to update profile");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header-row">
        <div className="page-header">
          <h1 className="page-title">Edit Profile</h1>
          <p className="page-subtitle">Update your account information</p>
        </div>
        <Link to="/app/profile">
          <button className="px-4 py-2 text-sm font-medium rounded-lg dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-[#1A1A1A]/50 text-zinc-400 hover:text-white hover:bg-[#f5f5f5] transition-colors">
            Cancel
          </button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="icon-chip">
              <User />
            </div>
            <h2 className="text-lg font-semibold dark:text-zinc-100 text-white">
              Personal Information
            </h2>
          </div>
        </CardHeader>
        <CardContent>
          {success && (
            <div className="flex items-center gap-2 p-3 mb-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl text-sm text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-4 h-4" />
              Profile updated successfully. Redirecting...
            </div>
          )}
          {generalError && (
            <div className="flex items-start gap-2 p-3 mb-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{generalError}</span>
            </div>
          )}

          <div className="flex items-center gap-4 mb-6">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.displayName || user.username} className="h-full w-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-white">
                  {(user.displayName || user.username).charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="space-y-1">
              <p className="font-medium dark:text-zinc-100 text-white">
                {user.displayName || user.username}
              </p>
              <p className="text-sm text-zinc-500">@{user.username} • {user.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Display Name"
              placeholder="Your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              error={errors.displayName}
            />
            <Input
              label="Username"
              placeholder="username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              error={errors.username}
              required
            />
            <Input
              label="Avatar URL"
              placeholder="https://example.com/avatar.png"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              error={errors.avatarUrl}
            />
            <p className="text-xs text-zinc-500">Leave empty to remove avatar. Username must be 3-50 chars, lowercase letters, numbers, underscore.</p>

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={loading} className="min-w-[140px]">
                Save Changes
              </Button>
              <Link to="/app/profile">
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t dark:border-white/[0.04]/30 border-zinc-200/50 space-y-2 text-sm text-zinc-500">
            <div className="flex justify-between">
              <span>Email</span>
              <span className="font-mono text-zinc-300 dark:text-zinc-300">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span>Member Since</span>
              <span>{new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
