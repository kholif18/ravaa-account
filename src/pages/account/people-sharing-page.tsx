import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Users, Share2, Link2, Clock } from "lucide-react";
import { apiRequest } from "../../lib/api/client";

export function PeopleSharingPage() {
  const [shares, setShares] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [driveRes, notesRes] = await Promise.all([
          apiRequest<any>("/api/v1/mobile/drive/shares").catch(() => null),
          apiRequest<any>("/api/v1/mobile/notes/shares").catch(() => null),
        ]);
        const driveShares = ((driveRes as any)?.data?.shares || (driveRes as any)?.shares || []).map((s: any) => ({
          id: s.id, resource: s.shareableId || s.fileId || s.noteId || s.shareableId, via: "Drive", visibility: s.visibility, permission: s.permission, createdAt: s.createdAt, views: s.viewCount || 0,
        }));
        const notesShares = ((notesRes as any)?.data?.shares || (notesRes as any)?.shares || []).map((s: any) => ({
          id: s.id, resource: s.shareableId || s.noteId, via: "Notes", visibility: s.visibility, permission: s.permission, createdAt: s.createdAt, views: s.viewCount || 0,
        }));
        setShares([...driveShares, ...notesShares]);
      } catch {
        setShares([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2"><Users className="w-5 h-5" /> People & Sharing</h1>
        <p className="page-subtitle">Overview semua LINK/FAMILY cross Drive+Notes — ala Google Shared with me</p>
      </div>
      <Card>
        <CardHeader><h3 className="font-semibold">Shared Overview ({shares.length})</h3></CardHeader>
        <CardContent className="space-y-3">
          {loading ? <p className="text-sm text-zinc-500">Loading...</p> : shares.map((s) => (
            <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl border dark:border-white/[0.04] bg-[#1A1A1A]/30">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center"><Share2 className="w-4 h-4 text-blue-400" /></div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{s.resource} <Badge variant={s.visibility === "LINK" ? "warning" : "success"}>{s.visibility}</Badge></p>
                <p className="text-xs text-zinc-500 flex items-center gap-2"><Link2 className="w-3 h-3" /> via {s.via} • {s.permission} • <Clock className="w-3 h-3" /> {new Date(s.createdAt).toLocaleDateString()} • {s.views} views</p>
              </div>
            </div>
          ))}
          {shares.length === 0 && <p className="text-sm text-zinc-500">Belum ada share — buat LINK di Drive/Notes.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
