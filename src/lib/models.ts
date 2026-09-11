export type ProjectSource = "manual" | "orcid";

export interface ProjectMetadata {
    permanent: boolean;
    title: string;
    description: string | null;
    tags: string[];
    createdAt: string;
    updatedAt: string | null;
    startDate: string | null;
    endDate: string | null;
    githubRepo: string | null;
    photoSetId: string | null;
}

export interface ProjectRecord {
    slug: string;
    target: string;
    clicks: number;
    source: ProjectSource;
    metadata: ProjectMetadata;
}

export interface PublicProject {
    slug: string;
    target: string;
    shortUrl: string;
    title: string;
    description: string | null;
    tags: string[];
    source: ProjectSource;
    createdAt: string;
    updatedAt: string | null;
    startDate: string | null;
    endDate: string | null;
    githubRepo: string | null;
    photoSetId: string | null;
}

export interface CollectionRecord {
    id: string;
    name: string;
    description: string;
    projects: string[];
    tags: string[];
    createdAt: string;
    updatedAt: string | null;
}

export interface AnalyticsSummary {
    totalLinks: number;
    totalClicks: number;
    averageClicks: number;
    uniqueTags: number;
    sources: Record<ProjectSource, number>;
    topProjects: Array<{ slug: string; title: string; clicks: number }>;
    topTags: Array<{ tag: string; projects: number }>;
    tagDistribution: Record<string, number>;
    generatedAt: string;
}

export interface ProjectInput {
    slug: string;
    target?: string;
    permanent?: boolean;
    title?: string;
    description?: string;
    tags?: string[];
    startDate?: string;
    endDate?: string;
    githubRepo?: string;
    photoSetId?: string;
}

export interface CollectionInput {
    id: string;
    name?: string;
    description?: string;
    projects?: string[];
    tags?: string[];
}

export type ValidationResult<T> =
    | { success: true; data: T }
    | { success: false; error: string };

const SLUG_PATTERN = /^[a-z0-9][a-z0-9_-]*$/;
const DATE_PATTERN = /^\d{4}(?:-(?:0[1-9]|1[0-2])(?:-(?:0[1-9]|[12]\d|3[01]))?)?$/;

export function normalizeSlug(value: string): string {
    return value.trim().replace(/^\/+/, "").toLowerCase();
}

export function isValidSlug(value: string): boolean {
    return value.length <= 120 && SLUG_PATTERN.test(value);
}

export function normalizeTags(value: unknown): string[] {
    const values = Array.isArray(value)
        ? value
        : typeof value === "string"
            ? value.split(",")
            : [];
    return Array.from(
        new Set(
            values
                .filter((tag): tag is string => typeof tag === "string")
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0 && tag.length <= 80),
        ),
    );
}

export function isHttpUrl(value: string): boolean {
    try {
        const url = new URL(value);
        return (url.protocol === "http:" || url.protocol === "https:") && Boolean(url.hostname);
    } catch {
        return false;
    }
}

export function isValidDate(value: string): boolean {
    if (!DATE_PATTERN.test(value)) return false;
    if (value.length === 10) {
        const date = new Date(`${value}T00:00:00Z`);
        return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
    }
    return true;
}

function optionalString(value: unknown, maxLength: number): string | undefined {
    if (value === undefined) return undefined;
    if (typeof value !== "string") return undefined;
    return value.trim().slice(0, maxLength);
}

export function validateProjectInput(value: unknown, requireTarget: boolean): ValidationResult<ProjectInput> {
    if (!value || typeof value !== "object") return {success: false, error: "project must be an object"};
    const raw = value as Record<string, unknown>;
    if (typeof raw.slug !== "string") return {success: false, error: "slug is required"};
    const slug = normalizeSlug(raw.slug);
    if (!isValidSlug(slug)) return {
        success: false,
        error: "slug must contain only letters, numbers, hyphens, and underscores"
    };

    const target = optionalString(raw.target, 2048);
    if (requireTarget && !target) return {success: false, error: "target is required"};
    if (target !== undefined && !isHttpUrl(target)) return {
        success: false,
        error: "target must be a valid HTTP(S) URL"
    };
    const githubRepo = optionalString(raw.githubRepo, 2048);
    if (githubRepo && !isHttpUrl(githubRepo)) return {success: false, error: "githubRepo must be a valid HTTP(S) URL"};
    const startDate = optionalString(raw.startDate, 10);
    const endDate = optionalString(raw.endDate, 10);
    if (startDate && !isValidDate(startDate)) return {
        success: false,
        error: "startDate must use YYYY, YYYY-MM, or YYYY-MM-DD"
    };
    if (endDate && !isValidDate(endDate)) return {
        success: false,
        error: "endDate must use YYYY, YYYY-MM, or YYYY-MM-DD"
    };
    if (raw.permanent !== undefined && typeof raw.permanent !== "boolean") return {
        success: false,
        error: "permanent must be a boolean"
    };

    return {
        success: true, data: {
            slug,
            target,
            permanent: raw.permanent as boolean | undefined,
            title: optionalString(raw.title, 240),
            description: optionalString(raw.description, 4000),
            tags: raw.tags === undefined ? undefined : normalizeTags(raw.tags),
            startDate,
            endDate,
            githubRepo,
            photoSetId: optionalString(raw.photoSetId, 120),
        }
    };
}

export function validateCollectionInput(value: unknown, requireName: boolean): ValidationResult<CollectionInput> {
    if (!value || typeof value !== "object") return {success: false, error: "collection must be an object"};
    const raw = value as Record<string, unknown>;
    if (typeof raw.id !== "string") return {success: false, error: "id is required"};
    const id = normalizeSlug(raw.id);
    if (!isValidSlug(id)) return {
        success: false,
        error: "id must contain only letters, numbers, hyphens, and underscores"
    };
    const name = optionalString(raw.name, 240);
    if (requireName && !name) return {success: false, error: "name is required"};
    const projects = raw.projects === undefined ? undefined : normalizeTags(raw.projects).map(normalizeSlug);
    if (projects?.some((project) => !isValidSlug(project))) return {
        success: false,
        error: "projects contains an invalid slug"
    };
    return {
        success: true, data: {
            id,
            name,
            description: optionalString(raw.description, 4000),
            projects,
            tags: raw.tags === undefined ? undefined : normalizeTags(raw.tags),
        }
    };
}

export function parseMetadata(slug: string, meta: Record<string, string>): ProjectMetadata {
    return {
        permanent: meta.permanent === "1",
        title: meta.title?.trim() || slug,
        description: meta.description?.trim() || null,
        tags: normalizeTags(meta.tags),
        createdAt: meta.createdAt || new Date(0).toISOString(),
        updatedAt: meta.updatedAt || null,
        startDate: meta.startDate || null,
        endDate: meta.endDate || null,
        githubRepo: meta.githubRepo || null,
        photoSetId: meta.photoSetId || null,
    };
}

export function serializeProjectMetadata(input: ProjectInput, existing?: Record<string, string>): Record<string, string> {
    const now = new Date().toISOString();
    return {
        permanent: input.permanent === undefined ? existing?.permanent || "0" : input.permanent ? "1" : "0",
        title: input.title === undefined ? existing?.title || input.slug : input.title || input.slug,
        description: input.description === undefined ? existing?.description || "" : input.description,
        tags: input.tags === undefined ? existing?.tags || "" : input.tags.join(","),
        startDate: input.startDate === undefined ? existing?.startDate || "" : input.startDate,
        endDate: input.endDate === undefined ? existing?.endDate || "" : input.endDate,
        githubRepo: input.githubRepo === undefined ? existing?.githubRepo || "" : input.githubRepo,
        photoSetId: input.photoSetId === undefined ? existing?.photoSetId || "" : input.photoSetId,
        createdAt: existing?.createdAt || now,
        updatedAt: existing ? now : "",
    };
}

export function parseCollection(id: string, data: Record<string, string>): CollectionRecord {
    return {
        id,
        name: data.name || id,
        description: data.description || "",
        projects: normalizeTags(data.projects).map(normalizeSlug),
        tags: normalizeTags(data.tags),
        createdAt: data.createdAt || new Date(0).toISOString(),
        updatedAt: data.updatedAt || null,
    };
}

export function projectSource(slug: string): ProjectSource {
    return slug.startsWith("orcid-") ? "orcid" : "manual";
}

export function toPublicProject(project: ProjectRecord): PublicProject {
    return {
        slug: project.slug,
        target: project.target,
        shortUrl: `/${project.slug}`,
        title: project.metadata.title,
        description: project.metadata.description,
        tags: project.metadata.tags,
        source: project.source,
        createdAt: project.metadata.createdAt,
        updatedAt: project.metadata.updatedAt,
        startDate: project.metadata.startDate,
        endDate: project.metadata.endDate,
        githubRepo: project.metadata.githubRepo,
        photoSetId: project.metadata.photoSetId,
    };
}

export function parsePagination(searchParams: URLSearchParams, defaults: {
    limit: number;
    max: number
}): ValidationResult<{ limit: number; offset: number }> {
    const rawLimit = searchParams.get("limit");
    const rawOffset = searchParams.get("offset");
    const limit = rawLimit === null ? defaults.limit : Number(rawLimit);
    const offset = rawOffset === null ? 0 : Number(rawOffset);
    if (!Number.isInteger(limit) || limit < 1 || limit > defaults.max) return {
        success: false,
        error: `limit must be an integer from 1 to ${defaults.max}`
    };
    if (!Number.isInteger(offset) || offset < 0) return {
        success: false,
        error: "offset must be a non-negative integer"
    };
    return {success: true, data: {limit, offset}};
}

export function formatResearchDate(value: string | null | undefined): string | null {
    if (!value || !isValidDate(value)) return null;
    if (value.length === 4) return value;
    const [year, month] = value.split("-");
    const label = new Intl.DateTimeFormat("en", {
        month: "short",
        timeZone: "UTC"
    }).format(new Date(`${year}-${month}-01T00:00:00Z`));
    return `${label} ${year}`;
}

export function researchTimestamp(project: Pick<ProjectMetadata, "startDate" | "endDate" | "createdAt">): number {
    const value = project.endDate || project.startDate || project.createdAt;
    const normalized = value.length === 4 ? `${value}-01-01` : value.length === 7 ? `${value}-01` : value;
    const timestamp = Date.parse(normalized);
    return Number.isNaN(timestamp) ? 0 : timestamp;
}
