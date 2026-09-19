import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/auth-provider";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import * as adminApi from "../../lib/api/admin";
import * as authApi from "../../lib/api/auth";
import type { User } from "../../types";
import { Users, HardDrive, Save, Plus, X } from "lucide-react";

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
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", username: "", displayName: "", password: "" });
  const [creating, setCreating] = useState(false);

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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!newUser.email || !newUser.username || !newUser.password) {
      setError("Email, username, dan password wajib");
      return;
    }
    if (newUser.password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }
    setCreating(true);
    try {
      await authApi.register(
        newUser.email.trim(),
        newUser.username.trim(),
        newUser.password,
        newUser.displayName.trim() || newUser.username.trim(),
      );
      setNewUser({ email: "", username: "", displayName: "", password: "" });
      setShowAdd(false);
      await load();
    } catch (err: any) {
      setError(err.message || "Gagal tambah user");
    } finally {
      setCreating(false);
    }
  }

  if (state.status === "loading") return <div className="page"><div className="skeleton h-32" /></div>;
  if (state.status !== "authenticated") return <Navigate to="/login" replace />;
  if (state.user.role !== "ADMIN") return <Navigate to="/app" replace />;

  return (
    <div className="page">
      <div className="page-header flex items-start justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2"><Users className="w-6 h-6" /> Users & Storage</h1>
          <p className="page-subtitle">Kelola user & kapasitas storage per user (enterprise)</p>
        </div>
        <Button onClick={() => setShowAdd(true)}><Plus className="w-4 h-4" /> Tambah User</Button>
      </div>

      {showAdd && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Tambah User Baru</h3>
              <button onClick={() => setShowAdd(false)} className="p-1.5 rounded hover:bg-white/10"><X className="w-4 h-4" /></button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-2">
              <Input label="Email *" type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} placeholder="user@ravaa.my.id" required />
              <Input label="Username *" value={newUser.username} onChange={(e) => setNewUser({ ...newUser, username: e.target.value })} placeholder="username" required />
              <Input label="Display Name" value={newUser.displayName} onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })} placeholder="Nama lengkap" />
              <Input label="Password *" type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} placeholder="Min. 8 karakter" required />
              <div className="sm:col-span-2 flex gap-2 pt-2">
                <Button type="submit" loading={creating}><Plus className="w-4 h-4" /> Buat User</Button>
                <Button type="button" variant="secondary" onClick={() => setShowAdd(false)}>Batal</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

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
