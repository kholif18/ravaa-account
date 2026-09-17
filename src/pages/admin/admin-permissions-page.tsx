import { useState, useEffect, useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/auth-provider";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import * as permissionsApi from "../../lib/api/permissions";
import type { Permission } from "../../types";
import { Plus, Trash2, Search, Shield, Layers } from "lucide-react";

const RESOURCES = ["drive", "notes", "photos", "admin", "user"] as const;
const ACTIONS = ["read", "write", "share", "delete", "manage"] as const;

const RESOURCE_LABEL: Record<string, { label: string; desc: string }> = {
  drive: { label: "Drive", desc: "File & folder" },
  notes: { label: "Notes", desc: "Catatan" },
  photos: { label: "Photos", desc: "Foto" },
  admin: { label: "Admin", desc: "Pengaturan sistem" },
  user: { label: "User", desc: "Manajemen user" },
};

function autoDesc(resource: string, action: string) {
  if (!resource || !action) return "";
  const map: Record<string, string> = {
    read: "Lihat",
    write: "Edit & buat",
    share: "Bagikan",
    delete: "Hapus",
    manage: "Kelola penuh",
  };
  return `${map[action] || action} ${resource}`;
}

export function AdminPermissionsPage() {
  const { state: authState } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newResource, setNewResource] = useState("drive");
  const [newAction, setNewAction] = useState("read");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => { loadPermissions(); }, []);

  async function loadPermissions() {
    try {
      setLoading(true);
      const data = await permissionsApi.listPermissions();
      setPermissions(data.permissions);
    } catch {
      setError("Failed to load permissions");
    } finally {
      setLoading(false);
    }
  }

  const exists = permissions.some((p) => p.resource === newResource && p.action === newAction);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (exists) {
      setError(`Permission ${newResource}:${newAction} sudah ada`);
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const desc = newDescription.trim() || autoDesc(newResource, newAction);
      const result = await permissionsApi.createPermission(newResource, newAction, desc);
      setPermissions([...permissions, result.permission]);
      setNewDescription("");
      setShowCreate(false);
    } catch (err: any) {
      setError(err.message || "Failed to create permission");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string, label: string) {
    if (!confirm(`Hapus permission ${label}?`)) return;
    try {
      await permissionsApi.deletePermission(id);
      setPermissions(permissions.filter((p) => p.id !== id));
    } catch {
      setError("Failed to delete permission");
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return permissions;
    const q = search.toLowerCase();
    return permissions.filter((p) => `${p.resource}:${p.action}`.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q));
  }, [permissions, search]);

  const grouped = useMemo(() => {
    const map = new Map<string, Permission[]>();
    filtered.forEach((p) => {
      const arr = map.get(p.resource) || [];
      arr.push(p);
      map.set(p.resource, arr);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  if (authState.status === "loading") {
    return <div className="page"><div className="animate-pulse space-y-4"><div className="skeleton h-8 w-48" /><div className="skeleton h-32" /></div></div>;
  }
  if (authState.status !== "authenticated") return <Navigate to="/login" replace />;
  if (authState.user.role !== "ADMIN") return <Navigate to="/app" replace />;
  if (loading) {
    return <div className="page"><div className="animate-pulse space-y-4"><div className="skeleton h-8 w-48" /><div className="skeleton h-32" /></div></div>;
  }

  return (
    <div className="page">
      <div className="page-header-row">
        <div className="page-header">
          <h1 className="page-title flex items-center gap-2"><Shield className="w-6 h-6" /> Permissions</h1>
          <p className="page-subtitle">Kelola permission catalogue — pilih Resource + Action, gak perlu ketik manual</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>{showCreate ? "Batal" : <><Plus className="w-4 h-4 mr-2" /> Buat Permission</>}</Button>
      </div>

      {error && <div className="alert alert-error" role="alert">{error}</div>}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          placeholder="Cari permission... (misal drive:read, Notes)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-3 py-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 bg-white border-slate-200 text-sm"
        />
      </div>

      {showCreate && (
        <Card>
          <CardHeader><h2 className="text-lg font-semibold dark:text-slate-100">Buat Permission Baru</h2><p className="text-sm text-slate-500">Pilih Resource + Action, deskripsi otomatis terisi</p></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium dark:text-slate-200">Resource</label>
                  <select value={newResource} onChange={(e) => setNewResource(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 bg-white border-slate-200 text-sm">
                    {RESOURCES.map((r) => <option key={r} value={r}>{r} — {RESOURCE_LABEL[r]?.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium dark:text-slate-200">Action</label>
                  <select value={newAction} onChange={(e) => setNewAction(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl border dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 bg-white border-slate-200 text-sm">
                    {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-700 border-slate-200 text-sm">
                Preview: <code className="font-mono text-blue-500">{newResource}:{newAction}</code> {exists && <span className="text-red-500 ml-2">— sudah ada!</span>}
              </div>
              <Input label="Deskripsi (otomatis, bisa edit)" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} placeholder={autoDesc(newResource, newAction)} />
              <Button type="submit" loading={creating} disabled={exists}>{exists ? "Sudah ada" : "Buat"}</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {grouped.length === 0 ? (
        <Card><CardContent><p className="list-item text-sm text-slate-500 text-center py-8">{search ? `Tidak ada hasil untuk "${search}"` : "Belum ada permission — buat yang pertama di atas"}</p></CardContent></Card>
      ) : (
        grouped.map(([resource, perms]) => (
          <Card key={resource}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center"><Layers className="w-4 h-4 text-blue-500" /></div>
                <div>
                  <h3 className="font-semibold dark:text-slate-100 flex items-center gap-2">{RESOURCE_LABEL[resource]?.label || resource} <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">{perms.length}</span></h3>
                  <p className="text-xs text-slate-500">{RESOURCE_LABEL[resource]?.desc || resource}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="list-divider">
                {perms.map((perm) => (
                  <div key={perm.id} className="list-item flex justify-between items-center">
                    <div>
                      <code className="text-sm font-mono text-blue-500">{perm.resource}:{perm.action}</code>
                      {perm.description && <p className="text-xs text-slate-500 mt-1">{perm.description}</p>}
                    </div>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(perm.id, `${perm.resource}:${perm.action}`)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <Card><CardContent className="text-xs text-slate-500">Tips: pakai <code>drive:read</code> untuk toko (pelanggan cuma lihat), <code>drive:write</code> biar bisa edit/upload. Kombinasi yang sering: <code>drive:read + drive:write</code>, <code>notes:read + notes:write</code></CardContent></Card>
    </div>
  );
}
