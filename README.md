# blog.stephenarthur.org

A self-hosted blog with a public reading site and a private admin panel. Built to
be fast, to rank well, and to run comfortably on a small VPS.

---

## Stack

| Layer     | Choice                                   | Why |
| --------- | ---------------------------------------- | --- |
| Framework | Next.js 15 (App Router) + React 19        | Server components, first-class SEO metadata, image optimisation |
| Language  | TypeScript                                | |
| Styling   | Tailwind CSS v4                           | Design tokens live in `src/app/globals.css` |
| Database  | SQLite via Drizzle ORM (`better-sqlite3`) | One file, no service to run, trivial to back up |
| Editor    | TipTap                                    | WYSIWYG that outputs clean, sanitised HTML |
| Auth      | JWT session cookie (`jose` + `bcryptjs`)  | Single-tenant admin, no third-party dependency |
| Images    | `sharp`                                   | Uploads are auto-converted to WebP and capped at 1920px |

No external services are required. Analytics and AdSense are opt-in from the
admin panel and load nothing until you fill in an ID.

---

## Getting started

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local` — at minimum set `AUTH_SECRET`:

```bash
openssl rand -base64 48
```

Then create the schema and load the demo content:

```bash
npm run setup
npm run dev
```

- Public site → http://localhost:3000
- Admin panel → http://localhost:3000/admin
- Sign in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env.local`

### Scripts

| Command              | Does |
| -------------------- | ---- |
| `npm run dev`        | Dev server on :3000 |
| `npm run build`      | Production build |
| `npm start`          | Serve the production build |
| `npm run typecheck`  | `tsc --noEmit` |
| `npm run db:push`    | Apply `src/db/schema.ts` to the database |
| `npm run db:seed`    | Load demo content (add `-- --force` to wipe first) |
| `npm run db:studio`  | Drizzle Studio, a GUI for the database |
| `npm run db:reset -- --yes` | Empty every table |

---

## Layout

```
src/
├── app/
│   ├── (site)/            Public site — home, posts, categories, tags, authors, search
│   ├── admin/
│   │   ├── (auth)/login/  Sign-in, outside the dashboard shell
│   │   ├── (dashboard)/   Everything behind the session guard
│   │   └── actions/       Server actions (posts, pages, taxonomy, comments, settings)
│   ├── api/               Comments, newsletter, views, uploads, OG images, CSV export
│   ├── feed.xml/          RSS
│   ├── atom.xml/          Atom
│   ├── robots.txt/        Generated from settings
│   ├── ads.txt/           Generated from settings
│   └── sitemap.ts         Posts, pages, categories, tags, authors
├── components/            UI, split by area (site / post / sidebar / admin / ads)
├── db/                    Drizzle schema + every query the app makes
├── lib/                   Auth, settings, sanitising, rate limiting, helpers
└── middleware.ts          Session gate for /admin
```

Content lives in `data/blog.db`; uploads live in `public/uploads/`. Neither is
committed — back both up together.

---

## URLs

| Path                | What |
| ------------------- | ---- |
| `/`                 | Home — featured hero, trending strip, latest grid, sidebar |
| `/page/2`           | Paginated home |
| `/{slug}`           | A post **or** a static page — posts win a name clash |
| `/category/{slug}`  | Category archive |
| `/tag/{slug}`       | Tag archive |
| `/author/{slug}`    | Author archive |
| `/archive`          | Everything, grouped by year |
| `/search?q=`        | Full-text search over title, excerpt and body |
| `/admin`            | Dashboard |

Posts sit at the root for the shortest possible URLs. Reserved words
(`admin`, `api`, `category`, `tag`, `author`, `search`, `archive`, `page`,
feed and sitemap paths) are blocked in the slug generator, so a post can never
shadow a route.

---

## Running the admin panel

**Posts** — title, slug (auto-generated, editable), WYSIWYG body, cover image,
category, tags, excerpt. The sidebar holds publish status, publish date
(a future date schedules the post), featured/pinned flags, and per-post SEO with
a live Google preview.

**Pages** — the same editor without dates or categories. Use for About, Contact,
Privacy. Tick "Link from the footer" to add it to the footer and the header's
More menu.

**Categories** — each carries a colour that drives badges across the whole site.

**Comments** — moderated by default. Approve, unapprove, mark spam or delete.
Set "Publish comments immediately" in Settings if you'd rather not moderate.
The public form has a honeypot field and IP rate limiting.

**Media** — every upload, with one-click URL copy. Images are re-encoded to WebP
at up to 1920px on upload, so nothing heavy ever reaches a reader.

**Settings** — site identity, about box, social links, SEO, analytics, AdSense,
comments and newsletter. Everything is read at request time, so changes go live
without a rebuild.

---

## SEO

Already wired, nothing to configure:

- Per-page `<title>`, description, canonical URL, OpenGraph and Twitter cards
- JSON-LD: `BlogPosting`, `BreadcrumbList`, `WebSite` (with search action),
  `Organization`, `ProfilePage`
- `sitemap.xml` covering posts, pages, categories, tags and authors
- `robots.txt` generated from settings, with an extra-rules field
- RSS at `/feed.xml` and Atom at `/atom.xml`, both auto-discovered in `<head>`
- Social cards generated on demand at `/api/og` when a post has no cover image
- Semantic headings, automatic heading anchors, and a scroll-spy table of contents
- Fonts self-hosted through `next/font`, images through `next/image`

To verify ownership in Google Search Console, paste the token into
**Settings → SEO → Google Search Console token**, then submit
`https://blog.stephenarthur.org/sitemap.xml`.

---

## Analytics

Fill in whichever you use under **Settings → Analytics**:

- Google Analytics 4 (`G-…`) — loaded with `anonymize_ip`
- Google Tag Manager (`GTM-…`)
- Plausible — just the domain
- Umami — website ID, plus a script URL if self-hosted

Scripts only load when `NODE_ENV=production`, so local development never
pollutes your stats.

---

## AdSense

The site ships AdSense-ready but completely inert. When you're approved:

1. **Settings → AdSense → Publisher ID** — paste `ca-pub-…`
2. Paste the line AdSense gives you into **ads.txt contents** (served at
   `/ads.txt`, which AdSense checks before serving)
3. Create ad units in AdSense and paste the slot IDs into the four placements:
   header, in-article, sidebar, footer
4. Toggle **Enable AdSense** on

Each slot reserves its height whether or not it renders, so switching ads on
later doesn't shift the layout. Leave any slot blank to skip it. The in-article
unit is injected after the third paragraph and only on posts long enough to
carry it.

Auto ads are available but off by default — they place units wherever Google
likes, which usually costs more in layout quality than it earns.

---

## Deploying to a Hostinger VPS

Assumes Ubuntu 22.04+ and a DNS `A` record pointing `blog.stephenarthur.org`
at the VPS IP.

### 1. Server prerequisites

```bash
sudo apt update && sudo apt install -y nginx sqlite3 build-essential git
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

`build-essential` is needed because `better-sqlite3` compiles a native module.

### 2. Get the code onto the server

```bash
sudo mkdir -p /var/www/blog && sudo chown -R $USER:$USER /var/www/blog
git clone <your-repo-url> /var/www/blog
cd /var/www/blog
npm ci
```

### 3. Configure

```bash
cp .env.example .env
nano .env
```

```env
NEXT_PUBLIC_SITE_URL=https://blog.stephenarthur.org
DATABASE_PATH=./data/blog.db
AUTH_SECRET=<openssl rand -base64 48>
ADMIN_EMAIL=you@stephenarthur.org
ADMIN_PASSWORD=<a real password>
ADMIN_NAME=Stephen Arthur
```

### 4. Build and start

```bash
mkdir -p logs data public/uploads
npm run db:push -- --force
npm run db:seed          # creates the admin user; omit later, it is idempotent
npm run build

pm2 start ecosystem.config.cjs
pm2 save
pm2 startup              # run the command it prints
```

### 5. Nginx and TLS

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/blog.stephenarthur.org
sudo ln -s /etc/nginx/sites-available/blog.stephenarthur.org /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d blog.stephenarthur.org
```

Certbot installs a renewal timer automatically.

### 6. Lock it down

```bash
sudo ufw allow OpenSSH && sudo ufw allow 'Nginx Full' && sudo ufw enable
sudo apt install -y unattended-upgrades
```

### Subsequent deploys

```bash
chmod +x deploy/*.sh   # once
./deploy/deploy.sh
```

That backs up the database, pulls, installs, applies schema changes, rebuilds
and reloads PM2 with zero downtime.

### Backups

```bash
crontab -e
# 0 3 * * * /var/www/blog/deploy/backup.sh >> /var/www/blog/logs/backup.log 2>&1
```

Keeps 30 days of gzipped database snapshots and upload archives in `./backups`.
Copy them off the server periodically — a backup on the same disk is not a backup.

---

## Replacing the demo content

The demo posts, categories, pages and comments come from
`scripts/demo-content.ts`. To start clean:

```bash
npm run db:reset -- --yes
npm run db:seed          # recreates the admin user and settings only if wiped
```

Demo cover images point at `picsum.photos`. Replace them with your own uploads
before going live — remote placeholders are fine for a preview and wrong for a
real site.

---

## Notes and gotchas

- **One process only.** The rate limiter is in-memory and SQLite is a single
  file, so run one PM2 instance (`exec_mode: fork`). This will serve a very
  large amount of read traffic; it is not a cluster setup.
- **`AUTH_SECRET` invalidates sessions.** Changing it signs everyone out.
- **Editor HTML is sanitised** on save and again on render (`src/lib/sanitize.ts`).
  If you need a new tag or attribute — an embed, say — add it to the allow-list
  there rather than disabling sanitising.
- **View counts** are recorded once per browser session, four seconds after load,
  and rate-limited to one per IP per post per hour.
- **`revalidate = 60`** on public pages. New posts appear within a minute;
  editing through the admin panel revalidates immediately.
