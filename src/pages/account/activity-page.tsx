import { useEffect, useState } from "react";
import { Card, CardContent } from "../../components/ui/card";
import * as meApi from "../../lib/api/me";
import { Clock, Shield, LogIn, Share2 } from "lucide-react";

export function ActivityPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    meApi.exportData().then((data: any) => {
      setLogs(data.auditLogs?.items || data.auditLogs || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const icon = (action: string) => {
    if (action.includes("LOGIN")) return <LogIn className="w-4 h-4 text-blue-400" />;
    if (action.includes("SHARE")) return <Share2 className="w-4 h-4 text-emerald-400" />;
    if (action.includes("SESSION")) return <Shield className="w-4 h-4 text-amber-400" />;
    return <Clock className="w-4 h-4 text-zinc-400" />;
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2"><Clock className="w-5 h-5" /> Activity</h1>
        <p className="page-subtitle">Nextcloud-style — login, share LINK dibuka, sesi (auditLogs dari Service)</p>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-white/[0.04]">
            {loading ? <p className="p-4 text-sm text-zinc-500">Loading...</p> : logs.length === 0 ? <p className="p-4 text-sm text-zinc-500">Belum ada aktivitas</p> : logs.slice(0, 50).map((log: any) => (
              <div key={log.id} className="flex items-start gap-3 p-3">
                <div className="mt-0.5">{icon(log.action)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium dark:text-zinc-100 truncate">{log.action}</p>
                  <p className="text-xs text-zinc-500">{log.ipAddress || "Unknown IP"} • {log.userAgent?.slice(0, 40) || ""}</p>
                </div>
                <span className="text-xs text-zinc-400 shrink-0">{new Date(log.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
