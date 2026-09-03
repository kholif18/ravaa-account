import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/auth-provider";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import * as applicationsApi from "../../lib/api/applications";
import type { Application } from "../../types";
import { Plus, Trash2, Copy, Check } from "lucide-react";

export function AdminApplicationsPage() {
  const { state: authState } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newRedirectUri, setNewRedirectUri] = useState("");
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    try {
      setLoading(true);
      const data = await applicationsApi.listApplications();
      setApplications(data.applications);
    } catch {
      setError("Failed to load applications");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const redirectUris = newRedirectUri ? [newRedirectUri] : undefined;
      const result = await applicationsApi.createApplication(
        newName,
        newSlug,
        redirectUris
      );
      setCreatedSecret(result.clientSecret);
      setApplications([...applications, result.application]);
      setNewName("");
      setNewSlug("");
      setNewRedirectUri("");
      setShowCreate(false);
    } catch (err: any) {
      setError(err.message || "Failed to create application");
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this application?")) return;
    try {
      await applicationsApi.deleteApplication(id);
      setApplications(applications.filter((a) => a.id !== id));
    } catch {
      setError("Failed to delete application");
    }
  }

  const copySecret = async () => {
    if (createdSecret) {
      await navigator.clipboard.writeText(createdSecret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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

  const statusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "warning";
      case "suspended":
      case "disabled":
        return "danger";
      default:
        return "default";
    }
  };

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
          <h1 className="page-title">Applications</h1>
          <p className="page-subtitle">Manage registered applications</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? (
            "Cancel"
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              New Application
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
              Create Application
            </h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="My Application"
                required
              />
              <Input
                label="Slug"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                placeholder="my-application"
                required
              />
              <Input
                label="Redirect URI (optional)"
                value={newRedirectUri}
                onChange={(e) => setNewRedirectUri(e.target.value)}
                placeholder="https://example.com/callback"
              />
              <Button type="submit" loading={creating}>
                Create
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {createdSecret && (
        <Card className="border-green-500/30">
          <CardContent>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-green-500 mb-2">
                  Application Created
                </h3>
                <p className="text-sm text-slate-500 mb-2">
                  Copy this client secret now. It will not be shown again.
                </p>
                <code className="block p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg text-sm font-mono break-all dark:text-slate-200 text-slate-900">
                  {createdSecret}
                </code>
              </div>
              <div className="flex gap-2 ml-4">
                <Button variant="ghost" size="sm" onClick={copySecret}>
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCreatedSecret(null)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <div className="list-divider">
            {applications.map((app) => (
              <div
                key={app.id}
                className="list-item"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium dark:text-slate-100 text-slate-900">
                      {app.name}
                    </p>
                    <p className="text-sm text-slate-500">@{app.slug}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Client ID:{" "}
                      <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">
                        {app.clientId}
                      </code>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant(app.status)}>
                      {app.status}
                    </Badge>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(app.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {applications.length === 0 && (
              <p className="list-item text-sm text-slate-500 text-center">
                No applications registered
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
