import {NextRequest, NextResponse} from "next/server";
import {jsonError, routeError} from "@/lib/api";
import {getDirectorySnapshot} from "@/lib/directory";
import {parsePagination, toPublicProject} from "@/lib/models";

function relevance(query: string, values: { slug: string; title: string; description: string | null; tags: string[] }) {
    if (!query) return 1;
    const q = query.toLowerCase();
    let score = 0;
    if (values.title.toLowerCase().includes(q)) score += values.title.toLowerCase().startsWith(q) ? 15 : 10;
    if (values.slug.toLowerCase().includes(q)) score += 8;
    if (values.description?.toLowerCase().includes(q)) score += 5;
    if (values.tags.some((tag) => tag.toLowerCase().includes(q))) score += 3;
    return score;
}

export async function GET(req: NextRequest) {
    try {
        const {searchParams} = new URL(req.url);
        const pagination = parsePagination(searchParams, {limit: 20, max: 100});
        if (!pagination.success) return jsonError(pagination.error, 400);
        const query = (searchParams.get("q") || "").trim();
        if (query.length > 200) return jsonError("q must be at most 200 characters", 400);
        const tags = (searchParams.get("tag") || "").split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean);
        if (tags.some((tag) => tag.length > 80)) return jsonError("tags must be at most 80 characters", 400);
        const source = searchParams.get("source");
        if (source && source !== "manual" && source !== "orcid") return jsonError("source must be manual or orcid", 400);
        if (!query && tags.length === 0 && !source) return jsonError("q, tag, or source is required", 400);
        const {projects} = await getDirectorySnapshot();
        const matches = projects.flatMap((project) => {
            if (source && project.source !== source) return [];
            if (tags.length && !tags.some((tag) => project.metadata.tags.some((value) => value.toLowerCase().includes(tag)))) return [];
            const score = relevance(query, {
                slug: project.slug,
                title: project.metadata.title,
                description: project.metadata.description,
                tags: project.metadata.tags
            });
            if (query && score === 0) return [];
            return [{
                ...toPublicProject(project), score, highlights: {
                    title: query && project.metadata.title.toLowerCase().includes(query.toLowerCase()) ? [query] : [],
                    description: query && project.metadata.description?.toLowerCase().includes(query.toLowerCase()) ? [query] : [],
                    tags: query ? project.metadata.tags.filter((tag) => tag.toLowerCase().includes(query.toLowerCase())) : [],
                }
            }];
        }).sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
        const {limit, offset} = pagination.data;
        return NextResponse.json({
            query: query || null,
            filters: {tags: tags.length ? tags : null, source: source || null},
            results: matches.slice(offset, offset + limit),
            pagination: {total: matches.length, limit, offset, hasMore: offset + limit < matches.length},
        }, {headers: {"Cache-Control": "public, s-maxage=30, stale-while-revalidate=120"}});
    } catch (error) {
        return routeError(error, "GET /api/search");
    }
}
