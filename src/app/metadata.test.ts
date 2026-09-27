import {beforeEach, describe, expect, it, vi} from "vitest";
import {metadata} from "./layout";
import {generateMetadata} from "./projects/[slug]/page";
import robots from "./robots";
import sitemap from "./sitemap";
import {getDirectorySnapshot, getProject} from "@/lib/directory";
import {parseMetadata, type ProjectRecord} from "@/lib/models";

vi.mock("next/font/google", () => ({
    Nunito: () => ({variable: "--font-nunito"}),
    Comic_Neue: () => ({variable: "--font-comic"}),
}));
vi.mock("./globals.css", () => ({}));
vi.mock("./tokens.css", () => ({}));
vi.mock("./appearance.css", () => ({}));
vi.mock("@/lib/directory", () => ({getDirectorySnapshot: vi.fn(), getProject: vi.fn()}));

const origin = "https://research.zeyuyaoy.com";
const projects: ProjectRecord[] = ["garcia", "biorsp"].map((slug) => ({
    slug,
    target: "https://example.org/publication",
    clicks: 0,
    source: "manual",
    metadata: parseMetadata(slug, {title: slug, description: "Research project"}),
}));

describe("authoritative research metadata", () => {
    beforeEach(() => {
        vi.mocked(getDirectorySnapshot).mockReset();
        vi.mocked(getProject).mockReset();
    });

    it("sets the new base for homepage canonical and social URLs", () => {
        expect(new URL(metadata.metadataBase!).origin).toBe(origin);
        expect(metadata.alternates?.canonical).toBe("/");
        expect(metadata.openGraph).toMatchObject({url: "/", images: ["/opengraph-image"]});
        expect(metadata.twitter).toMatchObject({images: ["/opengraph-image"]});
    });

    it.each(projects)(
        "uses the canonical project path for $slug and its social images",
        async (project) => {
            vi.mocked(getProject).mockResolvedValue(project);
            const result = await generateMetadata({
                params: Promise.resolve({slug: project.slug}),
            });
            const path = `/projects/${project.slug}`;
            expect(result.alternates?.canonical).toBe(path);
            expect(new URL(path, metadata.metadataBase!).href).toBe(`${origin}${path}`);
            expect(result.openGraph).toMatchObject({
                url: path,
                images: [`${path}/opengraph-image`],
            });
            expect(result.twitter).toMatchObject({images: [`${path}/opengraph-image`]});
        },
    );

    it("lists the homepage and current project inventory only on the new domain", async () => {
        vi.mocked(getDirectorySnapshot).mockResolvedValue({projects, collections: []});
        expect(await sitemap()).toEqual([
            {url: origin},
            {url: `${origin}/projects/garcia`},
            {url: `${origin}/projects/biorsp`},
        ]);
        vi.mocked(getDirectorySnapshot).mockResolvedValue({
            projects: projects.slice(1),
            collections: [],
        });
        expect(await sitemap()).toEqual([{url: origin}, {url: `${origin}/projects/biorsp`}]);
    });

    it("does not publish a partial sitemap when the directory is unavailable", async () => {
        vi.mocked(getDirectorySnapshot).mockRejectedValue(new Error("Directory unavailable"));
        await expect(sitemap()).rejects.toThrow("Directory unavailable");
    });

    it("allows public crawling and advertises the authoritative sitemap", () => {
        expect(robots()).toEqual({
            rules: {userAgent: "*", allow: "/"},
            sitemap: `${origin}/sitemap.xml`,
        });
    });
});
