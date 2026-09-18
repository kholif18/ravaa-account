import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/auth-provider";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import * as adminApi from "../../lib/api/admin";
import type { User } from "../../types";
import { Users, HardDrive, Save } from "lucide-react";

function formatGB(bytes: number) {
  return (bytes / (1024 * 1024 * 1024)).toFixed(1);
}

export function AdminUsersPage() {
  const { state } = useAuth();
  const [users, setUsers] = useState<(User & { storageLimit?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      const data = await adminApi.listUsers();
      setUsers(data.users);
      const map: Record<string, string> = {};
      data.users.forEach((u) => { map[u.id] = formatGB((u as any).storageLimit || 5368709120); });
      setEditing(map);
    } catch (e: any) {
      setError(e.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleSave(userId: string) {
    const val = parseFloat(editing[userId]);
    if (isNaN(val) || val < 1 || val > 1024) {
      setError("Storage must be 1 - 1024 GB");
      return;
    }
    setSaving(userId);
    setError(null);
    try {
      const res = await adminApi.updateUserStorage(userId, Math.round(val * 1024 * 1024 * 1024));
      setUsers(users.map((u) => (u.id === userId ? res.user : u)));
    } catch (e: any) {
      setError(e.message || "Failed to update");
    } finally {
      setSaving(null);
    }
  }

  if (state.status === "loading") return <div className="page"><div className="skeleton h-32" /></div>;
  if (state.status !== "authenticated") return <Navigate to="/login" replace />;
  if (state.user.role !== "ADMIN") return <Navigate to="/app" replace />;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2"><Users className="w-6 h-6" /> Users & Storage</h1>
        <p className="page-subtitle">Kelola kapasitas storage per user (dynamic enterprise)</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="skeleton h-32" />
      ) : (
        <div className="grid gap-4">
          {users.map((u) => (
            <Card key={u.id}>
              <CardContent className="flex items-center gap-4 py-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-semibold">
                  {(u.displayName || u.username).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium dark:text-zinc-100 truncate">{u.displayName || u.username} <Badge variant={u.role === "ADMIN" ? "warning" : "default"}>{u.role}</Badge></p>
                  <p className="text-sm text-zinc-500 truncate">{u.email} · @{u.username}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <HardDrive className="w-4 h-4 text-zinc-400" />
                  <input
                    value={editing[u.id] || ""}
                    onChange={(e) => setEditing({ ...editing, [u.id]: e.target.value })}
                    type="number"
                    step="0.5"
                    min="1"
                    max="1024"
                    className="w-20 px-2 py-1 text-sm rounded border dark:bg-[#1A1A1A] dark:border-white/[0.04] dark:text-zinc-100"
                  />
                  <span className="text-sm text-zinc-500">GB</span>
                  <Button size="sm" onClick={() => handleSave(u.id)} loading={saving === u.id}>
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader><h3 className="font-semibold">Info</h3></CardHeader>
        <CardContent className="text-sm text-zinc-500">
          Storage dihitung on-the-fly di Drive (<code>SUM File.fileSize</code> per user). Limit disimpan di service per-user. Default 5GB, admin 10GB. Ubah di sini, langsung refleksi di <code>/drive/storage</code>.
        </CardContent>
      </Card>
    </div>
  );
}
