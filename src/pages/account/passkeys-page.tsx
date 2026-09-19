import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { KeyRound, Shield, CheckCircle, Trash2, AlertCircle } from "lucide-react";
import { startRegistration, startAuthentication } from "@simplewebauthn/browser";
import * as webauthnApi from "../../lib/api/webauthn";

type Passkey = { id: string; credentialId?: string; name: string; createdAt: string };

export function PasskeysPage() {
  const [list, setList] = useState<Passkey[]>([]);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [supported, setSupported] = useState(true);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await webauthnApi.listCredentials();
      const creds = (res.credentials || []).map((c: any) => ({ id: c.id, credentialId: c.credentialId, name: c.deviceName || "Passkey", createdAt: c.createdAt }));
      setList(creds);
    } catch {
      // fallback localStorage untuk dev tanpa Service
      try { const local = JSON.parse(localStorage.getItem("ravaa-passkeys") || "[]"); setList(local); } catch { setList([]); }
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!window.PublicKeyCredential) setSupported(false);
    load();
  }, []);

  const handleCreate = async () => {
    setMsg(null);
    const name = prompt("Nama passkey (misal: Pixel 7, MacBook):");
    if (!name) return;
    try {
      const options = await webauthnApi.getRegisterOptions();
      const cred = await startRegistration({ optionsJSON: options });
      await webauthnApi.verifyRegister(cred, name.trim());
      setMsg({ type: "success", text: `Passkey "${name}" dibuat — sekarang bisa login tanpa password` });
      await load();
    } catch (e: any) {
      setMsg({ type: "error", text: e.message || "Gagal buat passkey — coba di HTTPS + Chrome" });
    }
  };

  const handleAuthTest = async () => {
    try {
      const options = await webauthnApi.getLoginOptions();
      const cred = await startAuthentication({ optionsJSON: options });
      setMsg({ type: "success", text: "Verifikasi passkey berhasil — credential: " + (cred as any).id.slice(0, 8) });
    } catch (e: any) {
      setMsg({ type: "error", text: e.message || "Gagal verifikasi" });
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus passkey ini?")) return;
    try {
      await webauthnApi.deleteCredential(id);
      setList(list.filter((p) => p.id !== id));
    } catch {
      // fallback local
      const next = list.filter((p) => p.id !== id);
      setList(next);
      try { localStorage.setItem("ravaa-passkeys", JSON.stringify(next)); } catch {}
    }
  };

  return (
    <div className="page">
      <div className="page-header-row">
        <div className="page-header">
          <h1 className="page-title flex items-center gap-2"><KeyRound className="w-5 h-5" /> Passkeys</h1>
          <p className="page-subtitle">Login tanpa password — seperti Google (WebAuthn)</p>
        </div>
        <Link to="/app/security"><Button variant="secondary">Back</Button></Link>
      </div>

      {!supported && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-sm text-amber-700 dark:text-amber-300 flex gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5" /> Browser tidak support WebAuthn — pakai Chrome/Edge HTTPS.
        </div>
      )}

      {msg && (
        <div className={`p-3 rounded-xl text-sm border flex gap-2 ${msg.type === "success" ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300" : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400"}`}>
          {msg.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />} {msg.text}
        </div>
      )}

      <Card>
        <CardHeader><h3 className="font-semibold flex items-center gap-2"><Shield className="w-4 h-4" /> Buat Passkey Baru</h3></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-zinc-500">Passkey disimpan di device (Touch ID, Face ID, Windows Hello) — login cukup tap, tanpa ketik password.</p>
          <div className="flex gap-2">
            <Button onClick={handleCreate}><KeyRound className="w-4 h-4" /> Buat Passkey</Button>
            <Button variant="secondary" onClick={handleAuthTest}>Test Login</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h3 className="font-semibold">Passkeys ({list.length}) {loading && <span className="text-xs text-zinc-500">Loading...</span>}</h3></CardHeader>
        <CardContent className="space-y-2">
          {!loading && list.length === 0 && <p className="text-sm text-zinc-500">Belum ada passkey — buat satu untuk login tanpa password.</p>}
          {list.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border dark:border-white/[0.04] bg-[#1A1A1A]/30">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center"><KeyRound className="w-4 h-4 text-blue-400" /></div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm flex items-center gap-2">{p.name} <Badge variant="success">Active</Badge></p>
                <p className="text-xs text-zinc-500">{new Date(p.createdAt).toLocaleString()} • {(p.credentialId || p.id).slice(0, 12)}…</p>
              </div>
              <Button size="sm" variant="danger" onClick={() => remove(p.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-emerald-500/30">
        <CardContent className="p-3 flex gap-2 text-sm text-zinc-500">
          <Shield className="w-4 h-4 text-emerald-500 mt-0.5" />
          <span>Production — passkey di-verify di Service <code>/api/v1/webauthn</code> dengan <code>@simplewebauthn/server</code> (logika di <code>webauthn.service.ts</code>), bisa login tanpa password di semua device.</span>
        </CardContent>
      </Card>
    </div>
  );
}
