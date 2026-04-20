# How to Publish Winter Pi — Step-by-Step for James

This is Launch 2 — the fully interactive version where buttons actually work. Since you never deployed Launch 1, you can just use this zip.

---

## Before you start

You need:
- **Node.js 18+** — check with `node --version`
- **Git** — check with `git --version`
- Accounts: GitHub (you have `winterpls`), and we'll make Vercel in Step 4

If anything's missing, install from nodejs.org and git-scm.com/download/win. Install with defaults, restart PowerShell after.

---

## Step 1 — Clean up old attempts, unzip fresh

1. **Delete old helix/winter folders** in Downloads — any from earlier attempts
2. **If you made a `winter-capital` or `winter-pi` repo on GitHub earlier that's empty:**
   - Go to github.com/winterpls, click that repo
   - Settings → scroll to bottom → **Delete this repository** → type the name to confirm
3. Find the new **`winter-pi_v2.zip`** in Downloads. Right-click → **Extract All** → Extract
4. Open the extracted folder. Keep double-clicking until you see `package.json`, `app`, `public` in the same view
5. Click the address bar at the top → copy the full path

---

## Step 2 — Open PowerShell, navigate

Windows key → `powershell` → Enter.

```powershell
cd "PASTE_YOUR_PATH_HERE"
```

(Replace with the path you copied, in quotes.)

Verify:
```powershell
ls
```

You should see `package.json`, `app`, `public`. If not, your `cd` didn't work.

If this is a new PowerShell window and you haven't allowed scripts yet:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```
Type `Y` when asked.

---

## Step 3 — Install and test locally

```powershell
npm install
```

Wait 60 seconds. Yellow warnings are fine.

```powershell
npm run dev
```

Open Chrome to **http://localhost:3000**. You should see:
- Landing page with "Practice crypto investing without risking real money"
- Click **Open Terminal** → welcome modal explains the simulation → click "Got it"
- Top of every page has a yellow **DEMO MODE** banner
- **Trade tab** → click **Buy** on any coin → modal opens → enter quantity → click Buy → it actually works
- **Portfolio tab** → you see your new position with live PnL updating
- **Dashboard** → equity curve starts building, NAV ticks up/down in the nav bar

When done testing, Ctrl+C in PowerShell, Y to stop.

---

## Step 4 — Push to GitHub

### Create the repo

1. Go to https://github.com/new
2. Name: `winter-pi`
3. **Public**
4. **Do NOT** check README/gitignore/license boxes
5. **Create repository**

### Configure git (if you haven't already)

```powershell
git config --global user.name "James Lee"
git config --global user.email "ilovepocono3@gmail.com"
```

### Push

Still in your project folder:

```powershell
git init
git add .
git commit -m "Initial commit: Winter Pi v2"
git branch -M main
git remote add origin https://github.com/winterpls/winter-pi.git
git push -u origin main
```

A browser popup opens → **Sign in with your browser** → authorize → come back.

Verify at https://github.com/winterpls/winter-pi — files should appear.

---

## Step 5 — Deploy on Vercel

1. Go to https://vercel.com → **Sign Up** → **Continue with GitHub**
2. Authorize Vercel
3. Dashboard → **Add New...** → **Project**
4. Find `winter-pi`, click **Import**
5. Don't change any settings → **Deploy**
6. Wait 90 seconds for confetti 🎉
7. Click your project card → click the screenshot → opens your live URL

**Copy that URL.** Could be `winter-pi.vercel.app` or `winter-pi-xyz.vercel.app`.

---

## Step 6 — Update the production URL

Open `app/layout.tsx` in Notepad (or VS Code if you have it).

Find:
```typescript
const SITE_URL = "https://winter-pi.vercel.app";
```

Replace with your actual Vercel URL. Save.

Also open `app/page.tsx`, Ctrl+F for `YOUR_HANDLE`, replace with your LinkedIn handle.
And `README.md`, same thing.

Push the changes:
```powershell
git add .
git commit -m "Update URLs with real LinkedIn and domain"
git push
```

Vercel auto-redeploys in 60 seconds.

---

## Step 7 — Verify LinkedIn preview

1. https://www.linkedin.com/post-inspector/
2. Sign in, paste your Vercel URL, click **Inspect**
3. You should see:
   - Blue navy Winter Pi preview image
   - Title mentioning "James Lee"
   - Description mentioning "Stroudsburg, PA"

If anything looks cached/wrong, click **Clear cache** on that page.

---

## Step 8 — Post it

Suggested LinkedIn copy:

> Built **Winter Pi** — a free crypto paper-trading simulator.
>
> Start with $100K in fake money, buy and sell 16 crypto assets with live drifting prices, and track your performance with professional quant metrics. Every trade auto-logs to a journal with your reasoning. No signup, no real money, no catch.
>
> What I built:
> • Live simulated price engine (updates every 3s)
> • Real buy/sell flow with validation, cost preview, and cost-basis tracking
> • Portfolio persistence via localStorage — close the tab, come back, your positions are still there
> • Live NAV, realized/unrealized PnL, win rate, strategy backtester, market regime module
>
> Stack: Next.js 14, TypeScript, Tailwind, Recharts. Mock data layer isolated behind an adapter interface, so I can plug in live CoinGecko data later.
>
> Simulation only — not investment advice. Made as a learning project bridging quant finance and modern frontend.
>
> Demo: [your Vercel URL]
> Source: https://github.com/winterpls/winter-pi
>
> #crypto #quant #nextjs #webdev #buildinpublic

Post Tuesday–Thursday, 8-10am your timezone.

---

## Troubleshooting

**Browser storage says "quota exceeded"**
→ You're in Incognito mode, localStorage is blocked. Use a normal window.

**"I clicked reset, now my portfolio is empty"**
→ That's what reset does. Start fresh trading from the Trade tab.

**"Prices aren't changing"**
→ Are you on the landing page or in the terminal? Prices only drift when you're in the terminal (`view === 'app'`). Click "Open Terminal".

**"LinkedIn preview shows the old green Helix image"**
→ LinkedIn cache. Use Post Inspector to clear.

**"git push says 'updates were rejected'"**
→ Probably already tried to push the old Helix code. Run `git push --force origin main` instead.

---

## What's next (optional improvements)

- **Real market data** — swap `INITIAL_ASSETS` for a CoinGecko API call (free tier, ~50 calls/min). Code is structured so this is one file change.
- **Custom domain** — buy `winterpi.app` or similar at Porkbun ($10/yr), add it in Vercel Settings → Domains
- **Dark/light mode toggle** — add a theme switcher
- **More strategies** — add your own to the Strategy Lab
- **Accounts + cloud save** — add Clerk auth and Supabase database if you want multiple users

That's it. Ship it.
