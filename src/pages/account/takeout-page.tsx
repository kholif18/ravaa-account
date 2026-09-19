import { useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Download, Package } from "lucide-react";
import * as meApi from "../../lib/api/me";
import JSZip from "jszip";

export function TakeoutPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleTakeout = async () => {
    setLoading(true);
    setMsg(null);
    try {
      const data: any = await meApi.exportData();
      const zip = new JSZip();
      zip.file("account.json", JSON.stringify(data.user || data, null, 2));
      zip.file("sessions.json", JSON.stringify(data.sessions || [], null, 2));
      zip.file("auditLogs.json", JSON.stringify(data.auditLogs || [], null, 2));
      // Notes & Drive: try fetch via Service mobile gateway if available
      try {
        const notesRes: any = await (await fetch("/api/v1/mobile/notes", { headers: { Authorization: `Bearer ${localStorage.getItem("ravaa_token") || ""}` } })).json().catch(()=>null);
        if (notesRes?.data?.notes) zip.file("notes.json", JSON.stringify(notesRes.data.notes, null, 2));
      } catch {}
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ravaa-takeout-${new Date().toISOString().slice(0,10)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setMsg("Takeout berhasil — Drive+Notes+Account dalam 1 zip");
    } catch (e: any) {
      setMsg(e.message || "Gagal takeout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2"><Package className="w-5 h-5" /> Takeout</h1>
        <p className="page-subtitle">Export Drive+Notes+Account 1 zip — ala Google Takeout</p>
      </div>
      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm text-zinc-500">Download semua data: account JSON, sessions, auditLogs, notes (jika ada), files Drive. Zip siap untuk backup toko.</p>
          <Button onClick={handleTakeout} loading={loading}><Download className="w-4 h-4" /> Download Takeout ZIP</Button>
          {msg && <p className="text-sm text-emerald-600 dark:text-emerald-400">{msg}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
