# Ravaa Account AI Agent Guide

## Project Overview

Ravaa Account is the central account management UI for the Ravaa ecosystem. It provides authentication, profile management, session control, and application/permission administration for the Ravaa platform.

- **User language**: The user communicates in Indonesian — respond in Indonesian unless they write in English.
- **Git policy**: NEVER commit/push unless the user explicitly asks ("push ke git", "commit"). When asked, inspect `git status`, stage only intended files, use a concise message matching repo style (`feat:`/`fix:` prefix).

## Tech Stack

- **Framework**: React 19 + Vite 8
- **Language**: TypeScript 6
- **Styling**: Tailwind CSS 4 (`@import "tailwindcss"` in `src/index.css`)
- **Routing**: React Router 7
- **State**: React Context (AuthProvider, ThemeProvider)
- **Icons**: Lucide React
- **Utilities**: `clsx` + `tailwind-merge` (via `cn()` utility)
- **Validation**: Zod
- **Backend**: ravaa-service (Hono + Prisma 7 + PostgreSQL 16)

## Project Structure

```
ravaa-account/
├── .opencode/agents/AGENTS.md    # This file
├── src/
│   ├── app/
│   │   ├── layouts/              # AppLayout (sidebar), PublicLayout (auth)
│   │   └── router/index.tsx      # Route definitions with providers
│   ├── auth/auth-provider.tsx    # Auth state + context (login, register, logout, refreshUser)
│   ├── components/
│   │   ├── layout/sidebar.tsx    # Sidebar navigation (collapsible, dark/light)
│   │   ├── providers/theme-provider.tsx  # Dark/light theme context
│   │   └── ui/                   # Reusable components (button, input, card, badge)
│   ├── lib/
│   │   ├── api/                  # API client layer
│   │   │   ├── client.ts         # Base fetch + auth headers + error handling
│   │   │   ├── auth.ts           # Login, register, refresh, logout, getCurrentUser
│   │   │   ├── sessions.ts       # List, revoke sessions
│   │   │   ├── applications.ts   # CRUD + scopes + access management
│   │   │   └── permissions.ts    # CRUD + grant/revoke resource permissions
│   │   └── utils.ts              # cn() utility (clsx + tailwind-merge)
│   ├── pages/
│   │   ├── auth/                 # LoginPage, RegisterPage
│   │   ├── account/              # DashboardPage, ProfilePage, SecurityPage, SessionsPage, ApplicationsPage
│   │   └── admin/                # AdminOverviewPage, AdminApplicationsPage, AdminPermissionsPage
│   └── types/index.ts            # TypeScript types (User, Session, Application, Permission, etc.)
├── .env.example                  # VITE_API_URL=http://localhost:3000
├── package.json
├── tailwind.config.ts
└── vite.config.ts
```

## Development Rules

### Code Style
- Use TypeScript for all files
- Use functional components with hooks
- Follow existing patterns in the codebase
- Use `cn()` from `@/lib/utils` for conditional classes
- **Verification**: always run `npm run build` after changes — it must pass with 0 errors

### Code Writing Rules

#### Component Structure
```tsx
// 1. Imports (grouped: React, libs, local)
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { SomeIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

// 2. Types/Interfaces
interface ComponentProps {
  name: string;
  onClose: () => void;
}

// 3. Component
export function Component({ name, onClose }: ComponentProps) {
  // 4. Hooks (state, effects, callbacks)
  const [isOpen, setIsOpen] = useState(false);

  // 5. Render
  return (
    <div>
      {/* Content */}
    </div>
  );
}
```

#### Naming Conventions
| Item | Convention | Example |
|------|-----------|---------|
| Component file | `kebab-case.tsx` | `login-page.tsx` |
| Utility file | `kebab-case.ts` | `client.ts` |
| Component export | `PascalCase` | `LoginPage`, `Sidebar` |
| Interface/Type | `PascalCase` | `User`, `SessionInfo` |
| Constant | `UPPER_SNAKE_CASE` | `API_URL` |
| Helper function | `camelCase` | `setAccessToken`, `loadSessions` |
| Boolean state | `is/has/can` prefix | `isLoading`, `hasError` |
| Event handler | `handle` prefix | `handleSubmit`, `handleDelete` |

#### Tailwind Class Order
```tsx
// Order: layout → box model → typography → visual → interactive
className={cn(
  "flex items-center gap-2",       // layout
  "px-4 py-2 rounded-lg",          // box model
  "text-sm font-medium",           // typography
  "dark:bg-slate-800 bg-white",    // visual
  "hover:bg-slate-700 transition-colors", // interactive
  isActive && "bg-blue-500/20 text-blue-400" // conditional
)}
```

#### Theme Pattern
```tsx
import { useTheme } from "@/components/providers/theme-provider";

const { theme, toggleTheme, isDark } = useTheme();

// Use dark: prefix for dark mode
<div className="dark:bg-slate-900 bg-slate-50">
  <span className="dark:text-slate-50 text-slate-900">Text</span>
</div>
```

### Component Patterns

#### Button
```tsx
import { Button } from "@/components/ui/button";

<Button variant="primary" size="md" loading={isLoading}>
  Submit
</Button>
// variants: primary, secondary, danger, ghost
// sizes: sm, md, lg
```

#### Input
```tsx
import { Input } from "@/components/ui/input";

<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  required
/>
```

#### Card
```tsx
import { Card, CardHeader, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>
    <h2 className="text-lg font-semibold dark:text-slate-100">Title</h2>
  </CardHeader>
  <CardContent>Content here</CardContent>
</Card>
```

#### Badge
```tsx
import { Badge } from "@/components/ui/badge";

<Badge variant="success">Active</Badge>
// variants: default, success, warning, danger, info
```

### API Client Pattern
```tsx
import { apiRequest, ApiClientError } from "@/lib/api/client";
import type { User } from "@/types";

// Make request
const data = await apiRequest<{ user: User }>("/api/v1/me");

// Handle errors
try {
  await login(identifier, password);
} catch (err) {
  if (err instanceof ApiClientError) {
    switch (err.code) {
      case "AUTHENTICATION_ERROR":
        setError("Invalid credentials");
        break;
      case "ACCOUNT_LOCKED":
        setError("Account locked");
        break;
      default:
        setError(err.message);
    }
  }
}
```

## Routes

| Route | Page | Auth Required | Admin Only |
|-------|------|---------------|------------|
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

## Backend API (ravaa-service)

The frontend connects to ravaa-service at `http://localhost:3000` (dev) or `https://api.ravaa.my.id` (prod).

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Refresh access token |
| POST | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/me` | Get current user |

### Session Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/sessions` | List sessions |
| DELETE | `/api/v1/sessions/{id}` | Revoke session |
| DELETE | `/api/v1/sessions` | Revoke all sessions |

### Application Endpoints (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/applications` | List applications |
| POST | `/api/v1/applications` | Create application |
| GET | `/api/v1/applications/{id}` | Get application |
| PATCH | `/api/v1/applications/{id}` | Update application |
| DELETE | `/api/v1/applications/{id}` | Delete application |
| POST | `/api/v1/applications/{id}/rotate-secret` | Rotate client secret |
| GET/POST | `/api/v1/applications/{id}/scopes` | Manage scopes |
| GET/POST | `/api/v1/applications/{id}/access` | Manage access |

### Permission Endpoints (Admin — Enterprise only, HIDDEN di Home Mode)
> Home Mode tidak pakai ini. Share file pakai `ShareLink` di Drive (`/api/share` + `/s/{token}`), bukan RBAC.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/permissions` | List permissions |
| POST | `/api/v1/permissions` | Create permission |
| GET | `/api/v1/permissions/{id}` | Get permission |
| DELETE | `/api/v1/permissions/{id}` | Delete permission |
| POST | `/api/v1/permissions/grant` | Grant resource permission |
| POST | `/api/v1/permissions/revoke` | Revoke resource permission |
| GET | `/api/v1/permissions/resource/{type}/{id}` | List resource permissions |
| GET | `/api/v1/permissions/principal/{type}/{id}` | List principal permissions |

### ShareLink Endpoints (Home Mode — di Ravaa-Drive, bukan di ravaa-service)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/share` | Create ShareLink (PRIVATE/FAMILY/LINK + password + expiresAt + maxViews) |
| GET | `/api/share?fileId=&folderId=` | List ShareLinks untuk resource |
| DELETE | `/api/share/{id}` | Revoke ShareLink |
| GET | `/s/{token}` / `/shared/{token}` | Public access tanpa login (validasi token + password jika ada) |
| GET | `/api/files/{id}/download?token=` | Download via share token |

## Environment Variables

```env
VITE_API_URL=http://localhost:3000    # Backend URL
```

## Common Commands

```bash
npm run dev                 # Start dev server (port 5173)
npm run build               # TypeScript check + Vite build
npm run lint                # Run oxlint
npx tsc --noEmit            # Type check only
```

## Database Reset & Seed Protocol (via ravaa-service)

> Setiap reset database di `ravaa-service` **WAJIB langsung di-seed** — seed preservasi data user.

```bash
cd ../ravaa-service
npx prisma migrate reset --force   # otomatis seed
# atau manual setelah TRUNCATE / npm test:
npm run db:seed
```

Default akun setelah seed: `admin@ravaa.my.id / Secret123` (ADMIN), `demo@ravaa.my.id / demo12345` (USER).

## Admin & Seed Setup

Database **tidak kosong** — seeder `ravaa-service/prisma/seed.ts` idempotent dan **mempertahankan data user** (displayName, username, recovery) saat di-run ulang. Jalankan seed setiap reset.

| Akun | Email | Password | Role |
|------|-------|----------|------|
| Admin | `admin@ravaa.my.id` | `Secret123` | ADMIN |
| Demo | `demo@ravaa.my.id` | `demo12345` | USER |

**Seed otomatis & manual:**
```bash
# Otomatis saat reset
npx prisma migrate reset --force   # di ravaa-service → seed jalan via prisma.config.ts

# Manual (di ravaa-service)
npm run db:seed
# atau
npx tsx scripts/seed-admin.ts

# Kustom admin via .env (ravaa-service/.env)
INITIAL_ADMIN_EMAIL=admin@domain.com
INITIAL_ADMIN_PASSWORD=Secret123
INITIAL_ADMIN_USERNAME=admin
```

**Aturan Reset & Seed Protocol (WAJIB):**
- `prisma migrate dev` → `ALTER TABLE` → data user **dipertahankan**, seed opsional
- `prisma migrate reset` / `TRUNCATE users` / setelah `npm test` (yang `deleteMany`) → **WAJIB** `npm run db:seed` di `ravaa-service`
- Seed preservasi: jika admin sudah ganti `displayName` via `/app/profile/edit`, run seed lagi **tidak akan overwrite** displayName/username — hanya password/role/status yang direset agar login predictable
- **JANGAN** buat user manual tiap ada perubahan schema — andalkan seed

Legacy manual (jika perlu):
```bash
PGPASSWORD=ravaa_dev_password psql -h localhost -U ravaa -d ravaa_service \
  -c "UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';"
```

## Architecture Decision — Home Mode vs Enterprise (2026-09-17)

> **Konteks:** Tujuan utama adalah **pribadi + keluarga + toko desain** (share source ke pelanggan tanpa akun), bukan enterprise marketplace. Pemisahan `Drive | Note | Photos` tetap dipertahankan (benar), yang disederhanakan adalah **jeroan permission**.

**Keputusan:**
- `ravaa-account` + `ravaa-service` tetap sebagai **Pusat Login Satu Pintu** (SSO) — 1 akun untuk semua app.
- Fitur Enterprise `Applications / Scopes / Permissions (RBAC resource:action + grant/revoke ke principal)` adalah **overkill untuk home** → **disembunyikan (hidden) pada deploy HOME**, tidak dihapus (agar bisa diaktifkan lagi jika go public).
- **Permission file/folder yang benar TIDAK tinggal di `ravaa-account`**. `lib/api/permissions.ts` adalah RBAC sistem (admin catalogue), bukan share file user. Untuk home, ganti dengan model **`ShareLink` di masing-masing app (Drive/Note/Photos)** dengan 3 level:

| Visibility | Arti | Butuh Akun? | Contoh |
|---|---|---|---|
| `PRIVATE` | Hanya owner | Ya (owner) | File pribadi |
| `FAMILY` | Shared ke keluarga (butuh login `ravaa-account`) | Ya | Foto keluarga |
| `LINK` | Link publik via token aman (`/s/{token}`) + opsi password + expiry + maxViews | **Tidak** | Source desain untuk pelanggan toko |

**Keamanan LINK tanpa akun:**
- Token = `crypto.randomBytes(32)` → base64url 43 char (256-bit entropy, tidak bisa ditebak/brute force)
- Opsional `passwordHash` (bcrypt) → pelanggan input password yang kamu share via WA
- `expiresAt` (default 7 hari untuk pelanggan), `maxViews`, `allowDownload`, `revokedAt` (revoke 1 klik)
- Rate-limit + 404 generik jika token salah (jangan leak existance)

**Implikasi di `ravaa-account`:**
- `src/lib/api/permissions.ts` → **DEPRECATED untuk home** — jangan dipakai untuk share file. Diganti `src/lib/api/shares.ts` (jika butuh family group). Endpoint `/api/v1/permissions/*` tetap ada di service tapi tidak diekspos di UI Home.
- `src/pages/admin/admin-permissions-page.tsx` & `admin-applications-page.tsx` → hidden dari `sidebar.tsx` saat `VITE_HOME_MODE=true` (atau cek role, tapi tetap ada code-nya).
- Sidebar Home hanya tampil: Dashboard, Profile, Security, Sessions — Admin disembunyikan.

## Key Features

1. **Authentication**: Register, login, logout, token refresh
2. **Profile**: View account details, role, status
3. **Security**: Password management (placeholder), session management
4. **Sessions**: List active sessions, revoke individual or all
5. **Applications**: View connected applications (Enterprise only — hidden di Home Mode)
6. **Admin - Applications**: CRUD applications, manage scopes/access, rotate secrets (Enterprise only)
7. **Admin - Permissions**: CRUD permission catalogue (Enterprise only — diganti ShareLink di Drive untuk Home)
8. **Theme**: Dark/light mode toggle (persisted to localStorage)
9. **Responsive**: Collapsible sidebar, mobile-friendly
10. **Home Sharing (baru)**: PRIVATE / FAMILY / LINK (token aman + password + expiry) — logic di Drive/Photos, bukan di Account

## Integration Status (Ravaa Ecosystem)

### Completed Phases

| Phase | Status | Description |
|-------|--------|-------------|
| 7.1 Discovery | ✅ PASS | Read-only audit of Drive auth/ownership/permissions |
| 7.2 Registration | ✅ PASS | `ravaa-drive` app registered, 5 scopes |
| 7.3 Token Validation | ✅ PASS | `lib/ravaa-auth.ts` introspection via `GET /api/v1/me` |
| 7.4 Identity Mapping | ✅ PASS | `User.ravaaUserId`, `lib/ravaa-identity.ts`, identity-map script |
| 7.5 Central Login | ✅ PASS | `POST /api/auth/ravaa/login`, dual login form |
| 7.6 Architecture Review | ✅ PASS | Analysis only, recommended KEEP LOCAL for ownership |
| 7.7 Share Polymorphic Fix | ✅ PASS | 15 files refactored from `fileId/folderId` → `shareableType/shareableId` |
| 7.8 Security Hardening | ✅ PASS | 16 security fixes across Service + Drive |
| 7.9 Session Hardening Design | ✅ PASS | Audit + design report, recommended Option C (4h JWT + revalidation) |
| 7.10 Home Simplification | 🔄 ADR 2026-09-17 | Putusan: Enterprise RBAC di-hidden, ganti 3-level ShareLink (PRIVATE/FAMILY/LINK + token aman + password + expiry) untuk Drive/Photos toko |

### Architecture Decision 2026-09-17 — Detail

- **Before:** `permissions.ts` RBAC unlimited `resource:action` + `grant/revoke` ke `USER/APPLICATION/SYSTEM` → overkill untuk keluarga (butuh bikin akun per pelanggan toko).
- **After:** `ShareLink` 3 level di Drive (bukan di Account). LINK = token 32-byte + `passwordHash` opsional + `expiresAt` + `maxViews` + `revokedAt`. Pelanggan buka `/s/{token}` tanpa akun, tetap aman (entropy 256-bit, expiry, revoke).
- **Repo terdampak:** `ravaa-account` (hide admin), `ravaa-service` (endpoints tetap tapi tidak dipakai Home), `Ravaa-Drive` (implementasi ShareLink), `Ravaa-Note` (konsep sama untuk share catatan ke pelanggan jika perlu).

### Key Security Fixes (Phase 7.8)

- Refresh `sid` bug fix
- `lastActiveAt` throttled (5min)
- User status check in auth middleware
- Password change revokes other sessions
- 2FA `123456` bypass gated by `NODE_ENV`
- JWT_SECRET min 32 chars
- CORS whitelist in ravaa-service
- Cookie parsing via `getCookie()` (not regex)
- Open redirect hardened in Drive login form
- Admin API password exposure fixed

## Troubleshooting

### Build fails
```bash
rm -rf node_modules && npm install && npm run build
```

### Backend connection errors
- Ensure ravaa-service is running on port 3000
- Check `VITE_API_URL` in `.env`
- Check CORS settings in ravaa-service

### CSS not loading
- Clear browser cache (Ctrl+Shift+R)
- Check browser console for errors
- Ensure Tailwind CSS is configured correctly

### Auth state issues
- Tokens are stored in memory (not localStorage)
- Refresh happens automatically on page load
- If logged out unexpectedly, check backend is running
