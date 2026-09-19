import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/auth-provider";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import * as storageApi from "../../lib/api/storage";
import { HardDrive, Plus, Trash2, Server, Activity } from "lucide-react";

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

      <Card>
        <CardHeader><h3 className="font-semibold flex items-center gap-2"><Activity className="w-4 h-4" /> Disk Monitor</h3><p className="text-xs text-zinc-500">Usage & Available per mount — update otomatis</p></CardHeader>
        <CardContent className="space-y-4">
          {loading ? <div className="skeleton h-20" /> : (
            <>
              {mounts.length === 0 && <p className="text-sm text-zinc-500">Tidak ada mount terdeteksi</p>}
              {mounts.map((m: any) => {
                const s = m.stats;
                if (!s) return (
                  <div key={m.mountPoint} className="p-3 rounded-lg border dark:border-white/[0.04] bg-[#1A1A1A]/30">
                    <p className="text-sm font-medium">{m.mountPoint} <span className="text-xs text-zinc-500">({m.fsType} • {m.device})</span></p>
                    <p className="text-xs text-zinc-500">No stats</p>
                  </div>
                );
                const pct = Math.round(s.percentUsed || 0);
                const freeGB = (s.free / 1024 / 1024 / 1024).toFixed(1);
                const usedGB = (s.used / 1024 / 1024 / 1024).toFixed(1);
                const totalGB = (s.total / 1024 / 1024 / 1024).toFixed(1);
                return (
                  <div key={m.mountPoint} className="p-3 rounded-lg border dark:border-white/[0.04] bg-[#1A1A1A]/30">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate">{m.mountPoint} <span className="text-xs font-normal text-zinc-500">({m.fsType} • {m.device}) {m.isUsed && <Badge variant="success">Terpakai</Badge>}</span></p>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${m.writable ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>{m.writable ? "Writable" : "Read-only"}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-[#232323] overflow-hidden">
                      <div className={`h-full ${pct > 85 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-blue-500"}`} style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex justify-between text-[11px] text-zinc-500 mt-1">
                      <span>{pct}% used • {usedGB}GB used</span>
                      <span>{freeGB}GB free / {totalGB}GB total</span>
                    </div>
                  </div>
                );
              })}
            </>
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
