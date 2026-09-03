export type User = {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  role: "USER" | "ADMIN";
  status: "active" | "suspended" | "pending";
  emailVerifiedAt: string | null;
  recoveryEmail: string | null;
  recoveryPhone: string | null;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SecurityInfo = {
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  twoFactorSetupPending: boolean;
  recoveryEmail: string | null;
  recoveryPhone: string | null;
};

export type MyApplicationAccess = {
  id: string;
  userId: string;
  applicationId: string;
  scopes: string[];
  grantedAt: string;
  revokedAt: string | null;
  application: Application;
};

export type DataExport = {
  exportedAt: string;
  user: User;
  sessions: { count: number; items: Session[] };
  applications: { count: number; items: unknown[] };
  auditLogs: { count: number; items: { id: string; action: string; ipAddress: string | null; userAgent: string | null; createdAt: string }[] };
  security: { twoFactorEnabled: boolean; recoveryEmail: string | null; recoveryPhone: string | null; emailVerified: boolean };
};

export type Session = {
  id: string;
  deviceName: string | null;
  deviceType: string | null;
  ipAddress: string | null;
  lastActiveAt: string | null;
  expiresAt: string;
  createdAt: string;
  revokedAt: string | null;
};

export type Application = {
  id: string;
  name: string;
  slug: string;
  clientId: string;
  redirectUris: string[];
  status: "active" | "inactive" | "suspended" | "disabled";
  createdAt: string;
  updatedAt: string;
};

export type ApplicationScope = {
  id: string;
  applicationId: string;
  scope: string;
  description: string | null;
  createdAt: string;
};

export type UserApplicationAccess = {
  id: string;
  userId: string;
  applicationId: string;
  scopes: string[];
  grantedAt: string;
  revokedAt: string | null;
};

export type Permission = {
  id: string;
  resource: string;
  action: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ResourcePermission = {
  id: string;
  resourceType: string;
  resourceId: string;
  principalType: "USER" | "APPLICATION" | "SYSTEM";
  principalId: string;
  permissionId: string;
  effect: "allow" | "deny";
  grantedAt: string;
  revokedAt: string | null;
  expiresAt: string | null;
  permission?: Permission;
};

export type AuthResult = {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export type RefreshResult = {
  accessToken: string;
  expiresIn: number;
};

export type ApiError = {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
};
