# API reference

## Authentication

```bash
curl https://your-site.example/api/auth \
  -H "x-admin-key: $ADMIN_KEY"
```

## Public discovery

### `GET /api/directory`

- `tag`: case-insensitive substring match
- `source`: `manual` or `orcid`
- `limit`: integer from 1–200; default 50
- `offset`: non-negative integer; default 0

```bash
curl "https://your-site.example/api/directory?tag=genomics&source=manual&limit=20"
```

Each project includes `slug`, `target`, `shortUrl`, both descriptions, tags, research areas, technologies, methods, organizations, collaborators, typed artifacts, source, dates, repository URL, photo-set ID, and timestamps.

### `GET /api/search`

```bash
curl "https://your-site.example/api/search?q=protein&tag=bioinformatics&source=orcid"
```

Search matches titles, descriptions, dates, tags and research areas, organizations, collaborators, methods, technologies, artifact metadata/domains, slug, target, and source. `tag` may be repeated or comma-separated and uses case-insensitive match-all semantics. Optional `year`, `source`, `sort` (`newest`, `oldest`, `title-asc`, or `title-desc`), `limit`, and `offset` parameters are supported. Results add a numeric `score` and plain-text `highlights` arrays.

## Projects

All project routes require authentication.

### Create: `POST /api/links`

```bash
curl -X POST https://your-site.example/api/links \
  -H "content-type: application/json" \
  -H "x-admin-key: $ADMIN_KEY" \
  -d '{
    "slug": "protein-localization",
    "target": "https://example.org/paper",
    "title": "Protein localization study",
    "description": "A concise project summary",
    "longDescription": "A longer account of the research and its results.",
    "tags": ["bioinformatics", "proteomics"],
    "researchAreas": ["computational biology"],
    "methods": ["sequence analysis"],
    "organizations": [{"name": "Example Institute", "role": "Host", "url": "https://example.org"}],
    "artifacts": [{"type": "publication", "title": "Paper", "url": "https://doi.org/10.1000/example", "date": "2025", "venue": "Example Journal", "featured": true}],
    "permanent": true,
    "startDate": "2024-06",
    "endDate": "2025",
    "githubRepo": "https://github.com/example/project",
    "photoSetId": "conference-2025"
  }'
```

`slug` and an HTTP(S) `target` are required. Titles are optional and fall back to the normalized slug; the server does not fetch the target page. A `{ "links": [...] }` body creates multiple projects and returns per-entry results.

### Update: `PUT /api/links`

Send `slug` and the fields to change. The slug itself is immutable. A project object, an array, or `{ "links": [...] }` is accepted.

### Read: `GET /api/links`

- `?slug=<slug>` returns one complete record.
- List mode accepts exact `tag`, `source`, substring `search`, `limit` up to 200, and `offset`.

### Tags on one project: `PATCH /api/links`

```json
{
  "slug": "protein-localization",
  "addTags": [
    "ml"
  ],
  "removeTags": [
    "draft"
  ]
}
```

### Delete: `DELETE /api/links`

Supply `slug`, comma-separated `slugs`, or `tag` in the query or JSON body. Project deletion also removes collection references.

## Collections

All `/api/collections` methods require authentication.

- `GET` lists collections.
- `POST` creates `{ id, name, description?, projects?, tags? }`.
- `PUT` updates supplied fields for an existing `id`.
- `PATCH` applies `{ id, addProjects?, removeProjects? }`.
- `DELETE ?id=<id>` removes a collection.

Project arrays are ordered and every referenced slug must exist. Unknown projects are rejected rather than creating disconnected collections.

## Tags

All `/api/tags` methods require authentication and reject unknown project slugs.

- `GET ?action=stats` returns tag/source totals.
- `GET ?action=suggest&prefix=bio` returns up to ten suggestions.
- `POST { slugs, tags }` adds tags.
- `PATCH { slugs, tags }` removes tags.
- `PATCH { oldTag, newTag }` renames a tag across projects.
- `DELETE { tag }` removes a tag across projects.

## Analytics

`GET /api/stats` requires authentication and returns only metrics supported by the stored data: `totalLinks`, `totalClicks`, `averageClicks`, `uniqueTags`, `sources`, `topProjects`, `topTags`, `tagDistribution`, and `generatedAt`.

Counts are all-time raw successful redirect requests. Historical week/month/year values cannot be reconstructed, so the API does not accept a period parameter.

## Export

`GET /api/export` requires authentication. `format` may be `json`, `csv`, or `yaml`; unknown values return `400`. Optional filters are `source`, `tag`, and `includeClicks=false`.

```bash
curl "https://your-site.example/api/export?format=csv" \
  -H "x-admin-key: $ADMIN_KEY" \
  -o research.csv
```

CSV strings that spreadsheet software could interpret as formulas are prefixed with an inert apostrophe, lists are comma-flattened, and structured entities/artifacts are JSON-encoded inside their cells. JSON and YAML preserve the structured model losslessly.

## Redirects and ORCID

`GET /<slug>` increments the all-time count best-effort, sets `noindex` and `no-store`, and returns `308` for permanent projects or `307` otherwise.

`GET /projects/<slug>` is the canonical, indexable project detail page and does not increment redirect counts.

When `ORCID_ID` is configured, the homepage imports public works from ORCID's v3 API. Responses are cached for one hour; malformed works are skipped individually, DOI URLs are normalized safely, and existing Redis metadata is preserved.
