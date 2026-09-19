import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { KeyRound, Copy, Trash2, CheckCircle, AlertCircle } from "lucide-react";

type AppPass = { id: string; name: string; password: string; createdAt: string };

const STORAGE_KEY = "ravaa-app-passwords";

function load(): AppPass[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function save(list: AppPass[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }

function genPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < 16; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s.match(/.{1,4}/g)!.join("-");
}

export function AppPasswordsPage() {
  const [list, setList] = useState<AppPass[]>(() => load());
  const [name, setName] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => { save(list); }, [list]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const pw: AppPass = { id: Date.now().toString(), name: name.trim(), password: genPassword(), createdAt: new Date().toISOString() };
    setList([pw, ...list]);
    setName("");
  };

  const copy = async (pw: string, id: string) => {
    await navigator.clipboard.writeText(pw);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const remove = (id: string) => {
    if (!confirm("Revoke app password ini?")) return;
    setList(list.filter((p) => p.id !== id));
  };

  return (
    <div className="page">
      <div className="page-header-row">
        <div className="page-header">
          <h1 className="page-title flex items-center gap-2"><KeyRound className="w-5 h-5" /> App Passwords</h1>
          <p className="page-subtitle">Buat password terpisah untuk Drive Android sync — tanpa pakai password utama (ala Google App Passwords)</p>
        </div>
        <Link to="/app/security"><Button variant="secondary">Back</Button></Link>
      </div>

      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-sm text-blue-700 dark:text-blue-300">
        Untuk <strong>ravaa-drive-android</strong>: pakai <code>Bearer &lt;app-password&gt;</code> di <code>Authorization</code> header ke <code>POST /api/v1/mobile/drive/files/upload</code> — scope terbatas, bisa revoke kapan saja.
      </div>

      <Card>
        <CardHeader><h3 className="font-semibold">Buat App Password Baru</h3></CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex gap-2">
            <Input label="Nama aplikasi" value={name} onChange={(e) => setName(e.target.value)} placeholder="misal: Pixel 7 — Drive" />
            <Button type="submit" disabled={!name.trim()}><KeyRound className="w-4 h-4" /> Buat</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h3 className="font-semibold">App Passwords ({list.length})</h3></CardHeader>
        <CardContent className="space-y-3">
          {list.length === 0 && <p className="text-sm text-zinc-500">Belum ada — buat untuk Drive Android.</p>}
          {list.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border dark:border-white/[0.04] bg-[#1A1A1A]/30">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center"><KeyRound className="w-4 h-4 text-amber-400" /></div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm flex items-center gap-2">{p.name} <Badge variant="default">{new Date(p.createdAt).toLocaleDateString()}</Badge></p>
                <code className="text-xs font-mono bg-white dark:bg-[#232323] px-2 py-1 rounded break-all">{p.password}</code>
              </div>
              <Button size="sm" variant="ghost" onClick={() => copy(p.password, p.id)}>{copied === p.id ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}</Button>
              <Button size="sm" variant="danger" onClick={() => remove(p.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-amber-500/30">
        <CardContent className="p-3 flex gap-2 text-sm text-zinc-500">
          <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
          <span>Simpan password ini sekali saja — tidak bisa dilihat lagi setelah refresh (copy sekarang). Revoke jika HP hilang.</span>
        </CardContent>
      </Card>
    </div>
  );
}
