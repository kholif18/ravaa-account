# Deploy Ravaa Account (Home Server) — Docker

## 1. Clone & ENV
```bash
git clone git@github.com:kholif18/ravaa-account.git
cd ravaa-account
cp .env.example .env
# Isi .env: VITE_API_URL=http://<home-ip>:2711 atau https://service.ravaa.my.id
nano .env
```

## 2. Build & Run
```bash
# ENV dibaca via build args
VITE_API_URL=https://service.ravaa.my.id docker compose up -d --build
docker compose logs -f web
# Buka http://localhost:2712
```

## 3. Update
```bash
git pull
docker compose up -d --build
```

HOME mode default `VITE_HOME_HIDE_ADMIN=true` (hide Enterprise Applications/Permissions).
Cloudflare Tunnel: `cloudflared tunnel --url http://localhost:2712` → `account.ravaa.my.id`.
