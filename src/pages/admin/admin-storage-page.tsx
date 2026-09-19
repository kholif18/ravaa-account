import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/auth-provider";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import * as storageApi from "../../lib/api/storage";
import { HardDrive, Plus, Trash2, Server } from "lucide-react";

export function AdminStoragePage() {
  const { state } = useAuth();
  const [locations, setLocations] = useState<any[]>([]);
  const [mounts, setMounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState("/mnt/");
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const data = await storageApi.listStorage();
      setLocations(data.locations || []);
      setMounts(data.mounts || []);
    } catch (e: any) {
      setError(e.message || "Gagal load storage");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!path.trim().startsWith("/mnt")) {
      setError("Path harus di /mnt (misal /mnt/hdd1/uploads)");
      return;
    }
    setAdding(true);
    setError(null);
    try {
      await storageApi.addStorage(path.trim());
      setPath("/mnt/");
      await load();
    } catch (e: any) {
      setError(e.message || "Gagal tambah storage");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(id: string) {
    if (!confirm("Hapus storage ini? File yang sudah ada tetap, tapi upload baru tidak ke sini.")) return;
    try {
      await storageApi.removeStorage(id);
      await load();
    } catch (e: any) {
      setError(e.message || "Gagal hapus");
    }
  }

  if (state.status === "loading") return <div className="page"><div className="skeleton h-32" /></div>;
  if (state.status !== "authenticated") return <Navigate to="/login" replace />;
  if (state.user.role !== "ADMIN") return <Navigate to="/app" replace />;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2"><HardDrive className="w-6 h-6" /> Storage Locations</h1>
        <p className="page-subtitle">Tambah HDD baru yang di-mount di /mnt — upload baru otomatis ke disk dengan free space terbesar</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <Card>
        <CardHeader><h3 className="font-semibold flex items-center gap-2"><Plus className="w-4 h-4" /> Tambah Storage</h3></CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex gap-2">
            <Input label="Path" value={path} onChange={(e) => setPath(e.target.value)} placeholder="/mnt/hdd1/uploads" />
            <Button type="submit" loading={adding}><Plus className="w-4 h-4" /> Tambah</Button>
          </form>
          <p className="text-xs text-zinc-500 mt-2">Mount HDD baru ke <code>/mnt/hdd1</code> lalu isi path di atas. Contoh: <code>/mnt/hdd1/uploads</code></p>
          {mounts.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Mount terdeteksi:</p>
              <div className="flex flex-wrap gap-1.5">
                {mounts.slice(0, 8).map((m: any) => (
                  <button key={m.mountPoint} onClick={() => setPath(m.mountPoint + "/uploads")} className="text-xs px-2 py-1 rounded bg-[#1A1A1A] border border-white/[0.04] hover:bg-[#232323]">{m.mountPoint} ({m.fsType})</button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {loading ? <div className="skeleton h-32" /> : (
        <div className="grid gap-3">
          {locations.map((loc: any) => (
            <Card key={loc.id}>
              <CardContent className="flex items-center gap-4 py-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center"><Server className="w-5 h-5 text-blue-400" /></div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{loc.path} <Badge variant={loc.enabled ? "success" : "warning"}>{loc.enabled ? "Aktif" : "Nonaktif"}</Badge></p>
                  <p className="text-xs text-zinc-500">{loc.exists ? `Free ${(loc.free / 1024 / 1024 / 1024).toFixed(1)}GB / ${(loc.total / 1024 / 1024 / 1024).toFixed(1)}GB` : "Path tidak ada"} · {loc.fileCount || 0} file</p>
                </div>
                <Button variant="danger" size="sm" onClick={() => handleRemove(loc.id)}><Trash2 className="w-4 h-4" /></Button>
              </CardContent>
            </Card>
          ))}
          {locations.length === 0 && <p className="text-sm text-zinc-500 text-center py-8">Belum ada storage tambahan — semua upload ke default.</p>}
        </div>
      )}
    </div>
  );
}
