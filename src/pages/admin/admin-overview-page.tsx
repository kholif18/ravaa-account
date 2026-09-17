import { useAuth } from "../../auth/auth-provider";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Link, Navigate } from "react-router-dom";
import { AppWindow, Lock, Users } from "lucide-react";

export function AdminOverviewPage() {
  const { state } = useAuth();

  if (state.status !== "authenticated") return null;

  if (state.user.role !== "ADMIN") {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <h1 className="page-title">Administration</h1>
          <Badge variant="warning">Admin</Badge>
        </div>
        <p className="page-subtitle">Manage the Ravaa ecosystem</p>
      </div>

      <div className="card-grid">
        <Link to="/admin/applications">
          <Card className="card-link">
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="icon-chip">
                  <AppWindow />
                </div>
                <div>
                  <h3 className="font-semibold dark:text-slate-100 text-slate-900">
                    Applications
                  </h3>
                  <p className="text-sm text-slate-500">
                    Create, configure, and manage registered applications
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/permissions">
          <Card className="card-link">
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="icon-chip">
                  <Lock />
                </div>
                <div>
                  <h3 className="font-semibold dark:text-slate-100 text-slate-900">
                    Permissions
                  </h3>
                  <p className="text-sm text-slate-500">
                    Manage the permission catalogue and resource grants
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/admin/users">
          <Card className="card-link">
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="icon-chip">
                  <Users />
                </div>
                <div>
                  <h3 className="font-semibold dark:text-slate-100 text-slate-900">
                    Users & Storage
                  </h3>
                  <p className="text-sm text-slate-500">
                    Kelola user dan kapasitas storage per user (dynamic)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
