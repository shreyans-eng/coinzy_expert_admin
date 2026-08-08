# Deploy to Vercel (production)

Admin portal → **Vercel**  
Backend API → **https://coinzy-experts-api.trackzio.com**

---

## Pre-flight (run locally once)

```sh
cd coinzy-experts-admin
npm install
npm run predeploy
```

This runs lint, tests, and production build. Fix any errors before deploying.

---

## Environment variable (Vercel)

Set **one** variable for Production, Preview, and Development:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://coinzy-experts-api.trackzio.com` |

Do **not** put `ADMIN_API_KEY` in Vercel — admins type it on the login screen.

Copy from [`.env.production.sample`](./.env.production.sample).

---

## Option 1 — Vercel CLI (recommended)

### 1. Install & log in

```sh
npm install -g vercel
vercel login
```

### 2. First deploy (links project)

```sh
cd coinzy-experts-admin
vercel
```

Answer the prompts:

- **Set up and deploy?** Yes  
- **Which scope?** Your team/personal account  
- **Link to existing project?** No (first time)  
- **Project name?** `coinzy-experts-admin` (or your choice)  
- **Directory?** `./`  
- **Override settings?** No  

When asked for env vars, add:

```
NEXT_PUBLIC_API_BASE_URL=https://coinzy-experts-api.trackzio.com
```

### 3. Production deploy

```sh
vercel --prod
```

Your live URL will look like:

```
https://coinzy-experts-admin.vercel.app
```

(or a custom domain if you attach one in Vercel → Settings → Domains)

### 4. Set env var via CLI (alternative)

```sh
vercel env add NEXT_PUBLIC_API_BASE_URL production
# paste: https://coinzy-experts-api.trackzio.com

vercel env add NEXT_PUBLIC_API_BASE_URL preview
vercel env add NEXT_PUBLIC_API_BASE_URL development

vercel --prod
```

---

## Option 2 — GitHub + Vercel dashboard

### 1. Create git repo & push

```sh
cd coinzy-experts-admin
git init
git add .
git commit -m "Coinzy Experts admin portal"
```

Create a repo on GitHub, then:

```sh
git branch -M main
git remote add origin git@github.com:YOUR_ORG/coinzy-experts-admin.git
git push -u origin main
```

### 2. Import on Vercel

1. Open [vercel.com/new](https://vercel.com/new)
2. **Import** your `coinzy-experts-admin` repository
3. **Framework preset:** Next.js (auto-detected)
4. **Root directory:** `./` (default)
5. **Build command:** `npm run build` (default)
6. **Install command:** `npm install` (default)
7. **Environment variables** → Add:
   - `NEXT_PUBLIC_API_BASE_URL` = `https://coinzy-experts-api.trackzio.com`
8. Click **Deploy**

### 3. Auto-deploy on push

Every push to `main` triggers a production deployment (if configured in Vercel → Settings → Git).

---

## Post-deploy checklist

1. Open your Vercel URL → `/login`
2. Enter your **production** `ADMIN_API_KEY` (from backend ops — not `change-me`)
3. Confirm **Experts** and **Users** load data from the live API
4. If you see network/CORS errors, confirm the backend allows your Vercel origin (backend uses open `cors()` today)

---

## Vercel project settings reference

| Setting | Value |
|---------|-------|
| Node.js version | 20.x (from `package.json` engines) |
| Framework | Next.js |
| Build command | `npm run build` |
| Output | Next.js default (no static export) |

---

## Custom domain (optional)

1. Vercel → Project → **Settings** → **Domains**
2. Add e.g. `admin.coinzy.com`
3. Add DNS records Vercel shows (CNAME or A)
4. Redeploy if needed

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Build fails on Vercel | Run `npm run predeploy` locally; fix TypeScript/lint errors |
| Login works but lists empty | Wrong API URL — check `NEXT_PUBLIC_API_BASE_URL` in Vercel env |
| 401 on login | Wrong admin API key for production backend |
| Old API URL after env change | Redeploy: `vercel --prod` or push a commit |
| Env var not applied | Must redeploy after adding/changing env vars |

---

## Quick reference commands

```sh
# Local dev (live API)
cp .env.sample .env.local
npm run dev

# Ship to production
npm run predeploy
vercel --prod

# View deployment logs
vercel logs
```
