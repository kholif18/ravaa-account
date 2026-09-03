# Ravaa Account

Central account management UI for the Ravaa ecosystem. Provides authentication, profile management, session control, and application/permission administration.

## Tech Stack

- **React 19** + **Vite 8** + **TypeScript 6**
- **Tailwind CSS 4** (dark-first theme)
- **React Router 7** (client-side routing)
- **Lucide React** (icons)
- **Zod** (validation)
- **Backend**: [ravaa-service](https://github.com/kholif18/ravaa-service) (Hono + Prisma 7 + PostgreSQL 16)

## Features

- **Authentication**: Register, login, logout, token refresh
- **Profile**: View and edit account details
- **Security**: Change password, two-factor auth, recovery codes
- **Sessions**: View and revoke active sessions
- **Applications**: View connected applications
- **Admin**: Manage applications, permissions, and access
- **Theme**: Dark/light mode (persisted to localStorage)
- **Responsive**: Collapsible sidebar, mobile-friendly

## Getting Started

### Prerequisites

- Node.js v24+
- ravaa-service running on port 3000

### Installation

```bash
git clone git@github.com:kholif18/ravaa-account.git
cd ravaa-account
npm install
```

### Environment Variables

```bash
cp .env.example .env
```

```env
VITE_API_URL=http://localhost:3000
```

### Development

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`.

### Build

```bash
npm run build
npm run preview
```

## Project Structure

```
ravaa-account/
├── .opencode/
│   ├── agents/AGENTS.md          # AI agent guide
│   └── skills/
│       ├── frontend-design/      # UI design patterns
│       └── ravaa-account/        # Development guide
├── src/
│   ├── app/
│   │   ├── layouts/
│   │   │   ├── app-layout.tsx    # Authenticated layout (sidebar)
│   │   │   └── public-layout.tsx # Public layout (login/register)
│   │   └── router/index.tsx      # Route definitions
│   ├── auth/auth-provider.tsx    # Auth state management
│   ├── components/
│   │   ├── layout/sidebar.tsx    # Sidebar navigation
│   │   ├── providers/
│   │   │   └── theme-provider.tsx
│   │   └── ui/
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── input.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts         # Base fetch + auth
│   │   │   ├── auth.ts           # Auth endpoints
│   │   │   ├── sessions.ts       # Session endpoints
│   │   │   ├── applications.ts   # Application endpoints
│   │   │   └── permissions.ts    # Permission endpoints
│   │   └── utils.ts              # cn() utility
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── login-page.tsx
│   │   │   └── register-page.tsx
│   │   ├── account/
│   │   │   ├── dashboard-page.tsx
│   │   │   ├── profile-page.tsx
│   │   │   ├── profile-edit-page.tsx
│   │   │   ├── security-page.tsx
│   │   │   ├── change-password-page.tsx
│   │   │   ├── two-factor-page.tsx
│   │   │   ├── recovery-page.tsx
│   │   │   ├── sessions-page.tsx
│   │   │   ├── applications-page.tsx
│   │   │   ├── preferences-page.tsx
│   │   │   └── data-privacy-page.tsx
│   │   └── admin/
│   │       ├── admin-overview-page.tsx
│   │       ├── admin-applications-page.tsx
│   │       └── admin-permissions-page.tsx
│   └── types/index.ts
├── .env.example
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Routes

### Public

| Route | Description |
|-------|-------------|
| `/login` | Sign in to your account |
| `/register` | Create a new account |

### Authenticated

| Route | Description |
|-------|-------------|
| `/app` | Dashboard |
| `/app/profile` | View profile |
| `/app/profile/edit` | Edit profile |
| `/app/security` | Security settings |
| `/app/security/password` | Change password |
| `/app/security/2fa` | Two-factor authentication |
| `/app/security/recovery` | Recovery codes |
| `/app/sessions` | Active sessions |
| `/app/applications` | Connected applications |
| `/app/preferences` | User preferences |
| `/app/data-privacy` | Data & privacy |

### Admin (requires ADMIN role)

| Route | Description |
|-------|-------------|
| `/admin` | Admin overview |
| `/admin/applications` | Manage applications |
| `/admin/permissions` | Manage permissions |

## Design System

### Theme

Dark-first with CSS variables:

```css
:root, .dark {
  --background: #0f172a;    /* slate-900 */
  --foreground: #f8fafc;    /* slate-50 */
  --accent: #3b82f6;        /* blue-500 */
}

.light {
  --background: #f8fafc;    /* slate-50 */
  --foreground: #0f172a;    /* slate-900 */
  --accent: #2563eb;        /* blue-600 */
}
```

### Components

| Component | Usage |
|-----------|-------|
| `Button` | `variant="primary\|secondary\|danger\|ghost"` |
| `Input` | `label`, `error`, `type` props |
| `Card`, `CardHeader`, `CardContent` | Layout containers |
| `Badge` | `variant="default\|success\|warning\|danger\|info"` |

### Utilities

```tsx
import { cn } from "@/lib/utils";

className={cn(
  "base-classes",
  conditional && "conditional-classes"
)}
```

## Admin Setup & Seed

Database *tidak* kosong — seeder idempotent akan membuat akun admin & demo otomatis, dan **mempertahankan data user** saat migrasi (ALTER TABLE, bukan drop).

| Akun | Email | Password | Role | Kegunaan |
|------|-------|----------|------|----------|
| Admin | `admin@ravaa.my.id` | `Secret123` | ADMIN | Akses `/admin` |
| Demo | `demo@ravaa.my.id` | `demo12345` | USER | Test fitur user |

**Seed dijalankan otomatis saat `prisma migrate reset`, atau manual:**
```bash
cd ravaa-service
npm run db:seed           # tsx prisma/seed.ts
# atau via env kustom
INITIAL_ADMIN_EMAIL=admin@domain.com INITIAL_ADMIN_PASSWORD=Secret123 npm run db:seed
```

**Kustomisasi via `ravaa-service/.env`:**
```env
INITIAL_ADMIN_EMAIL=admin@ravaa.my.id
INITIAL_ADMIN_PASSWORD=Secret123
INITIAL_ADMIN_USERNAME=admin
SEED_DEMO_USER=true
SEED_SAMPLE_APPS=true
```

**Kenapa tidak perlu buat user baru tiap perubahan?**
- `prisma migrate dev` → `ALTER TABLE` dengan `DEFAULT`, data lama tetap
- `prisma migrate reset` → seed otomatis buat admin/demo lagi
- Seed idempotent: jalankan berulang tidak duplikat, password di-reset ke nilai env/default

Legacy manual:
```bash
PGPASSWORD=ravaa_dev_password psql -h localhost -U ravaa -d ravaa_service \
  -c "UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';"
```

## API Reference

The frontend connects to [ravaa-service](https://github.com/kholif18/ravaa-service). See the backend documentation for full API reference.

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register |
| POST | `/api/v1/auth/login` | Login |
| POST | `/api/v1/auth/refresh` | Refresh token |
| POST | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/me` | Current user |
| PATCH | `/api/v1/me` | Update profile (displayName, username, avatarUrl) |
| PATCH | `/api/v1/me/password` | Change password |
| GET | `/api/v1/me/security` | Security overview (2FA, recovery) |
| POST | `/api/v1/me/security/2fa/setup` | Setup TOTP (secret + otpauthUrl) |
| POST | `/api/v1/me/security/2fa/confirm` | Confirm TOTP (code 6-digit, dev: 123456) |
| POST | `/api/v1/me/security/2fa/disable` | Disable 2FA (password) |
| PATCH | `/api/v1/me/security/recovery` | Update recovery email/phone |
| GET | `/api/v1/me/applications` | List my application accesses |
| DELETE | `/api/v1/me/applications/:id` | Revoke application access |
| GET | `/api/v1/me/export` | Export all my data (JSON download) |
| DELETE | `/api/v1/me` | Delete account (password + DELETE confirm) |
| GET | `/api/v1/sessions` | List sessions |
| GET | `/api/v1/applications` | List applications (admin) |
| GET | `/api/v1/permissions` | List permissions (admin) |

## Development

### Commands

```bash
npm run dev           # Start dev server
npm run build         # Build for production
npm run preview       # Preview production build
npm run lint          # Run linter
npx tsc --noEmit      # Type check
```

### Code Style

- TypeScript for all files
- Functional components with hooks
- `cn()` for conditional classes
- Lucide React for icons

## License

Private — Ravaa Ecosystem
