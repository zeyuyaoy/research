Hey! This is a searchable repository for my research projects built with Next.js, Redis, and React. However, you can also use it as a template for your own research site.

This app allows you to organize research projects with tags, descriptions, and links, making them easily discoverable through a clean search interface.

### Features

- Search, source filters, tags, research-date sorting, collections, light/dark themes, and responsive layouts
- Accessible project sharing, collection disclosures, and conference carousels
- Redis-backed project, collection, metadata, and click records
- Optional cached ORCID import with per-record validation and safe DOI fallbacks
- Shared-key admin dashboard with project and collection CRUD, ordering, pagination, exports, and all-time analytics
- Public directory/search APIs and authenticated management APIs

### Requirements

- Node.js 20.9 or newer
- pnpm 10.12.1 (the version pinned by `packageManager`)
- Redis 6 or newer; use an authenticated TLS connection in production

### Local setup

```bash
git clone https://github.com/zeyuyaoy/research.git
cd research
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

Configure `.env.local` before opening the site:

```env
RESEARCH_REDIS_URL=redis://localhost:6379
ADMIN_KEY=replace-with-a-long-random-secret
ORCID_ID=0000-0000-0000-0000
```

Open the local site at `http://localhost:3000`; the dashboard is at `/admin`.

### Data model

- `link:<slug>` — canonical HTTP(S) target
- `meta:<slug>` — hash containing `title`, `description`, comma-separated `tags`, `permanent`, `createdAt`, `updatedAt`, `startDate`, `endDate`, `githubRepo`, and optional `photoSetId`
- `count:<slug>` — all-time successful redirect count
- `collection:<id>` — hash containing `name`, `description`, comma-separated ordered `projects`, comma-separated `tags`, and timestamps

Dates accept `YYYY`, `YYYY-MM`, or `YYYY-MM-DD`. Deleting a project also removes its slug from collections. Photo sets are defined in `src/data/photoSets.yml`; a project uses its `photoSetId` or, by default, its slug.

ORCID responses are cached for one hour.

### Quality checks

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm check
```

### Deployment

Deploy to any Node-compatible Next.js host. For Vercel, import the repository and configure `RESEARCH_REDIS_URL`, `ADMIN_KEY`, and optionally `ORCID_ID`. Verify that Redis uses TLS, authentication, persistence, and backups appropriate for the deployment. Configure rate limiting or WAF controls at the hosting edge for the public search, directory, and redirect routes.

The application sends anonymous product telemetry through Vercel Analytics.

See [API.md](API.md) for endpoint contracts and examples.
