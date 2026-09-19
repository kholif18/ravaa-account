import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { CreditCard, HardDrive, CheckCircle } from "lucide-react";

export function PaymentsPage() {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2"><CreditCard className="w-5 h-5" /> Payments</h1>
        <p className="page-subtitle">Langganan storage toko — ala Google One</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { name: "HOME Free", storage: "5 GB", price: "Gratis", features: ["Drive+Notes", "LINK share", "Support komunitas"] },
          { name: "Toko Pro", storage: "100 GB", price: "Rp 29k /bulan", features: ["+100GB", "Priority share", "Version history 30 hari"], popular: true },
          { name: "Enterprise", storage: "1 TB", price: "Rp 99k /bulan", features: ["1TB", "RBAC Applications", "Audit log"] },
        ].map((p) => (
          <Card key={p.name} className={p.popular ? "border-blue-500/50" : ""}>
            <CardHeader>
              <h3 className="font-semibold flex items-center gap-2"><HardDrive className="w-4 h-4" /> {p.name} {p.popular && <Badge variant="success">Popular</Badge>}</h3>
              <p className="text-2xl font-bold">{p.price}</p>
              <p className="text-sm text-zinc-500">{p.storage} storage</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="space-y-1 text-sm">
                {p.features.map((f) => <li key={f} className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> {f}</li>)}
              </ul>
              <Button className="w-full" variant={p.popular ? "primary" : "secondary"}>{p.price === "Gratis" ? "Current" : "Pilih Paket"}</Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="border-blue-500/30">
        <CardContent className="p-3 text-sm text-zinc-500">
          Pembayaran via Midtrans/Xendit (coming soon) — untuk HOME tetap gratis 5GB, toko 100GB cukup untuk source desain.
        </CardContent>
      </Card>
    </div>
  );
}
