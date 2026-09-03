---
name: ravaa-account
description: Guide for developing Ravaa Account, a React + Vite frontend for the Ravaa ecosystem central account service. Use when writing or modifying any app code — components, API calls, pages, hooks, styles, or types. Covers component patterns, API conventions, auth flow, and verification steps. Triggers on "ravaa account", "account page", "login", "register", "profile", "sessions", "admin", "permissions".
---

# Ravaa Account Development Skill

## Project Overview

Ravaa Account is the central account management UI for the Ravaa ecosystem. It connects to **ravaa-service** (Hono + Prisma 7 + PostgreSQL 16) backend.

- **Framework**: React 19 + Vite 8 + TypeScript 6
- **Styling**: Tailwind CSS 4 (dark-first theme)
- **Routing**: React Router 7
- **State**: React Context (AuthProvider, ThemeProvider)
- **Backend**: `http://localhost:3000` (dev) / `https://api.ravaa.my.id` (prod)

## Project Structure

```
ravaa-account/src/
├── app/
│   ├── layouts/           # AppLayout (sidebar), PublicLayout (auth)
│   └── router/index.tsx   # Route definitions with providers
├── auth/auth-provider.tsx # Auth context (login, register, logout, refreshUser)
├── components/
│   ├── layout/sidebar.tsx # Collapsible sidebar navigation
│   ├── providers/theme-provider.tsx  # Dark/light theme
│   └── ui/                # Button, Input, Card, Badge
├── lib/
│   ├── api/               # API client layer
│   │   ├── client.ts      # Base fetch + auth + error handling
│   │   ├── auth.ts        # Auth endpoints
│   │   ├── sessions.ts    # Session endpoints
│   │   ├── applications.ts # Application endpoints
│   │   └── permissions.ts # Permission endpoints
│   └── utils.ts           # cn() utility
├── pages/
│   ├── auth/              # LoginPage, RegisterPage
│   ├── account/           # Dashboard, Profile, Security, Sessions, Applications
│   └── admin/             # AdminOverview, AdminApplications, AdminPermissions
└── types/index.ts         # TypeScript types
```

## Development Rules

### Code Style
- TypeScript for all files
- Functional components with hooks
- Use `cn()` from `@/lib/utils` for conditional classes
- Follow existing patterns in the codebase
- **Always run `npm run build` after changes** — must pass with 0 errors

### Component Pattern
```tsx
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SomeIcon } from "lucide-react";

export function MyComponent({ prop }: { prop: string }) {
  const [state, setState] = useState("");
  
  return (
    <div className="dark:text-slate-50 text-slate-900">
      {/* Content */}
    </div>
  );
}
```

### Theme Pattern
```tsx
import { useTheme } from "@/components/providers/theme-provider";

const { theme, toggleTheme, isDark } = useTheme();

// Use dark: prefix
<div className="dark:bg-slate-900 bg-slate-50">
  <span className="dark:text-slate-50 text-slate-900">Text</span>
</div>
```

### API Call Pattern
```tsx
import { apiRequest, ApiClientError } from "@/lib/api/client";
import type { User } from "@/types";

try {
  const data = await apiRequest<{ user: User }>("/api/v1/me");
} catch (err) {
  if (err instanceof ApiClientError) {
    switch (err.code) {
      case "AUTHENTICATION_ERROR":
        // Handle auth error
        break;
      case "ACCOUNT_LOCKED":
        // Handle locked account
        break;
      default:
        setError(err.message);
    }
  }
}
```

## Routes

| Route | Page | Auth | Admin |
|-------|------|------|-------|
| `/login` | LoginPage | No | No |
| `/register` | RegisterPage | No | No |
| `/app` | DashboardPage | Yes | No |
| `/app/profile` | ProfilePage | Yes | No |
| `/app/security` | SecurityPage | Yes | No |
| `/app/sessions` | SessionsPage | Yes | No |
| `/app/applications` | ApplicationsPage | Yes | No |
| `/admin` | AdminOverviewPage | Yes | Yes |
| `/admin/applications` | AdminApplicationsPage | Yes | Yes |
| `/admin/permissions` | AdminPermissionsPage | Yes | Yes |

## Backend API Reference

### Authentication
| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/api/v1/auth/register` | `{email, username, password, displayName?}` | `{user, accessToken, refreshToken, expiresIn}` |
| POST | `/api/v1/auth/login` | `{identifier, password, deviceName?, deviceType?}` | `{user, accessToken, refreshToken, expiresIn}` |
| POST | `/api/v1/auth/refresh` | `{refreshToken}` | `{accessToken, expiresIn}` |
| POST | `/api/v1/auth/logout` | - | - |
| GET | `/api/v1/me` | - | `{user}` |

### Sessions
| Method | Endpoint | Response |
|--------|----------|----------|
| GET | `/api/v1/sessions` | `{sessions[]}` |
| DELETE | `/api/v1/sessions/{id}` | - |
| DELETE | `/api/v1/sessions` | - |

### Applications (Admin)
| Method | Endpoint | Body |
|--------|----------|------|
| GET | `/api/v1/applications` | - |
| POST | `/api/v1/applications` | `{name, slug, redirectUris?}` |
| GET | `/api/v1/applications/{id}` | - |
| PATCH | `/api/v1/applications/{id}` | `{name?, redirectUris?, status?}` |
| DELETE | `/api/v1/applications/{id}` | - |
| POST | `/api/v1/applications/{id}/rotate-secret` | - |
| GET/POST | `/api/v1/applications/{id}/scopes` | `{scope, description?}` |
| GET/POST | `/api/v1/applications/{id}/access` | `{userId, scopes[]}` |
| DELETE | `/api/v1/applications/{id}/access/{accessId}` | - |

### Permissions (Admin)
| Method | Endpoint | Body |
|--------|----------|------|
| GET | `/api/v1/permissions` | - |
| POST | `/api/v1/permissions` | `{resource, action, description?}` |
| GET | `/api/v1/permissions/{id}` | - |
| DELETE | `/api/v1/permissions/{id}` | - |
| POST | `/api/v1/permissions/grant` | `{resourceType, resourceId, principalType, principalId, permissionId, expiresAt?}` |
| POST | `/api/v1/permissions/revoke` | `{resourceType, resourceId, principalType, principalId, permissionId}` |
| GET | `/api/v1/permissions/resource/{type}/{id}` | - |
| GET | `/api/v1/permissions/principal/{type}/{id}` | - |

## Error Codes

| Code | Meaning |
|------|---------|
| `AUTHENTICATION_ERROR` | Invalid credentials |
| `ACCOUNT_LOCKED` | Too many failed attempts |
| `RATE_LIMIT` | Too many requests |
| `VALIDATION_ERROR` | Invalid input |
| `CONFLICT` | Resource already exists |
| `FORBIDDEN` | Insufficient permissions |

## Component Library

### Button
```tsx
<Button variant="primary" size="md" loading={false}>Text</Button>
// variants: primary, secondary, danger, ghost
// sizes: sm, md, lg
```

### Input
```tsx
<Input label="Email" type="email" value={val} onChange={fn} error={err} />
```

### Card
```tsx
<Card>
  <CardHeader>Title</CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Badge
```tsx
<Badge variant="success">Active</Badge>
// variants: default, success, warning, danger, info
```

## Common Commands

```bash
npm run dev           # Start dev server (port 5173)
npm run build         # TypeScript + Vite build
npm run lint          # Run oxlint
npx tsc --noEmit      # Type check only
```

## Admin Setup

1. Register via UI
2. Update role via database:
```bash
PGPASSWORD=ravaa_dev_password psql -h localhost -U ravaa -d ravaa_service \
  -c "UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';"
```

## Verification

After any change:
1. `npm run build` — must pass
2. Test dark/light mode toggle
3. Test responsive (375px, 768px, 1280px)
4. Verify API calls work with backend running
5. Check all interactive elements have hover + focus states
