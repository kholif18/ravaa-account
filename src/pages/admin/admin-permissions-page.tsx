import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/auth-provider";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import * as permissionsApi from "../../lib/api/permissions";
import type { Permission } from "../../types";
import { Plus, Trash2 } from "lucide-react";

export function AdminPermissionsPage() {
  const { state: authState } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newResource, setNewResource] = useState("");
  const [newAction, setNewAction] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadPermissions();
  }, []);

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

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const result = await permissionsApi.createPermission(
        newResource,
        newAction,
        newDescription || undefined
      );
      setPermissions([...permissions, result.permission]);
      setNewResource("");
      setNewAction("");
      setNewDescription("");
      setShowCreate(false);
    } catch (err: any) {
      setError(err.message || "Failed to create permission");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this permission?")) return;
    try {
      await permissionsApi.deletePermission(id);
      setPermissions(permissions.filter((p) => p.id !== id));
    } catch {
      setError("Failed to delete permission");
    }
  }

  if (authState.status === "loading") {
    return (
      <div className="page">
        <div className="animate-pulse space-y-4">
          <div className="skeleton h-8 w-48" />
          <div className="skeleton h-32" />
        </div>
      </div>
    );
  }

  if (authState.status !== "authenticated") {
    return <Navigate to="/login" replace />;
  }

  if (authState.user.role !== "ADMIN") {
    return <Navigate to="/app" replace />;
  }

  if (loading) {
    return (
      <div className="page">
        <div className="animate-pulse space-y-4">
          <div className="skeleton h-8 w-48" />
          <div className="skeleton h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header-row">
        <div className="page-header">
          <h1 className="page-title">Permissions</h1>
          <p className="page-subtitle">Manage the permission catalogue</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? (
            "Cancel"
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              New Permission
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      {showCreate && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold dark:text-slate-100 text-slate-900">
              Create Permission
            </h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="Resource"
                value={newResource}
                onChange={(e) => setNewResource(e.target.value)}
                placeholder="file"
                required
              />
              <Input
                label="Action"
                value={newAction}
                onChange={(e) => setNewAction(e.target.value)}
                placeholder="read"
                required
              />
              <Input
                label="Description (optional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Read access to files"
              />
              <Button type="submit" loading={creating}>
                Create
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <div className="list-divider">
            {permissions.map((perm) => (
              <div
                key={perm.id}
                className="list-item flex justify-between items-center"
              >
                <div>
                  <code className="text-sm font-mono text-blue-500">
                    {perm.resource}:{perm.action}
                  </code>
                  {perm.description && (
                    <p className="text-xs text-slate-500 mt-1">
                      {perm.description}
                    </p>
                  )}
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(perm.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {permissions.length === 0 && (
              <p className="list-item text-sm text-slate-500 text-center">
                No permissions defined
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
