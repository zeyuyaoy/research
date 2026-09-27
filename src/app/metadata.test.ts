import { beforeEach, describe, expect, it, vi } from "vitest";
import { metadata } from "./layout";
import { metadata as adminMetadata } from "./admin/layout";
import { GET as manifest } from "./site.webmanifest/route";
import { generateMetadata } from "./projects/[slug]/page";
import robots from "./robots";
import sitemap from "./sitemap";
import { getDirectorySnapshot, getProject } from "@/lib/directory";
import { parseMetadata, type ProjectRecord } from "@/lib/models";
import { projectDescription, researchJsonLd, site } from "@/lib/site";

vi.mock("next/font/google", () => ({
  Nunito: () => ({ variable: "--font-nunito" }),
  Comic_Neue: () => ({ variable: "--font-comic" }),
}));
vi.mock("./globals.css", () => ({}));
vi.mock("./tokens.css", () => ({}));
vi.mock("./appearance.css", () => ({}));
vi.mock("@/lib/directory", () => ({ getDirectorySnapshot: vi.fn(), getProject: vi.fn() }));

const origin = "https://research.zeyuyaoy.com";
const projects: ProjectRecord[] = ["garcia", "biorsp"].map((slug) => ({
  slug,
  target: "https://example.org/publication",
  clicks: 0,
  source: "manual",
  metadata: parseMetadata(slug, { title: slug, description: "Research project" }),
}));

describe("authoritative research metadata", () => {
  beforeEach(() => {
    vi.mocked(getDirectorySnapshot).mockReset();
    vi.mocked(getProject).mockReset();
  });

  it("sets the new base for homepage canonical and social URLs", () => {
    expect(new URL(metadata.metadataBase!).origin).toBe(origin);
    expect(metadata.alternates?.canonical).toBe("/");
    const images = [
      {
        url: "/og-image.jpg",
        width: 2160,
        height: 1215,
        alt: "Peter giving a research presentation",
      },
    ];
    expect(metadata.robots).toEqual({ index: true, follow: true });
    expect(metadata.openGraph).toMatchObject({
      url: "/",
      siteName: site.name,
      locale: "en_US",
      images,
    });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      creator: "@zeyuyaoy",
      images,
    });
  });

  it("uses the agreed title and personal copy consistently while preserving author identity", async () => {
    expect(site.name).toBe("Peter's workshed");
    expect(site.description).toBe(
      "I'm Peter. This is where I share my research projects, publications, and talks. Browse by topic and explore the work behind them.",
    );
    expect(metadata.title).toEqual({ default: site.name, template: `%s | ${site.name}` });
    expect(metadata.description).toBe(site.description);
    expect(metadata.openGraph).toMatchObject({ title: site.name, description: site.description });
    expect(metadata.twitter).toMatchObject({ title: site.name, description: site.description });
    expect(researchJsonLd).toMatchObject({
      name: site.name,
      description: site.description,
      author: { name: "Zeyu Yao" },
    });
    expect(metadata.authors).toEqual([{ name: "Zeyu Yao", url: site.portfolioUrl }]);
    expect(metadata.manifest).toBe("/site.webmanifest");
    const response = manifest();
    expect(response.headers.get("content-type")).toBe("application/manifest+json");
    expect(await response.json()).toMatchObject({ name: site.name, description: site.description });
  });

  it.each(projects)(
    "uses the canonical project path for $slug and its social images",
    async (project) => {
      vi.mocked(getProject).mockResolvedValue(project);
      const result = await generateMetadata({
        params: Promise.resolve({ slug: project.slug }),
      });
      const path = `/projects/${project.slug}`;
      expect(result.alternates?.canonical).toBe(path);
      expect(new URL(path, metadata.metadataBase!).href).toBe(`${origin}${path}`);
      expect(result.openGraph).toMatchObject({
        url: path,
        locale: "en_US",
        siteName: site.name,
        images: [
          {
            url: "/og-image.jpg",
            width: 2160,
            height: 1215,
            alt: "Peter giving a research presentation",
          },
        ],
      });
      expect(result.twitter).toMatchObject({
        creator: "@zeyuyaoy",
        images: [
          {
            url: "/og-image.jpg",
            width: 2160,
            height: 1215,
            alt: "Peter giving a research presentation",
          },
        ],
      });
    },
  );

  it.each([
    { description: "Short description", longDescription: "Long description" },
    { description: "", longDescription: "Long description ".repeat(40) },
    { description: "", longDescription: "" },
  ])("uses the shared project description in search and social metadata", async (copy) => {
    const project = {
      ...projects[0],
      metadata: parseMetadata("garcia", { title: "Garcia", ...copy }),
    };
    vi.mocked(getProject).mockResolvedValue(project);
    const result = await generateMetadata({ params: Promise.resolve({ slug: "garcia" }) });
    const description = projectDescription(project.metadata);
    expect(result.description).toBe(description);
    expect(result.openGraph).toMatchObject({ description });
    expect(result.twitter).toMatchObject({ description });
  });

  it("keeps admin and missing or unavailable project pages out of search results", async () => {
    expect(adminMetadata).toMatchObject({
      title: "Peter's basement",
      robots: { index: false },
      alternates: { canonical: null },
    });
    vi.mocked(getProject).mockResolvedValue(null);
    expect(await generateMetadata({ params: Promise.resolve({ slug: "missing" }) })).toMatchObject({
      title: "Project not found",
      robots: { index: false },
      alternates: { canonical: null },
    });
    vi.mocked(getProject).mockRejectedValue(new Error("Directory unavailable"));
    expect(await generateMetadata({ params: Promise.resolve({ slug: "missing" }) })).toMatchObject({
      robots: { index: false },
      alternates: { canonical: null },
    });
  });

  it("lists the homepage and current project inventory only on the new domain", async () => {
    vi.mocked(getDirectorySnapshot).mockResolvedValue({ projects, collections: [] });
    expect(await sitemap()).toEqual([
      { url: origin },
      { url: `${origin}/projects/garcia` },
      { url: `${origin}/projects/biorsp` },
    ]);
    vi.mocked(getDirectorySnapshot).mockResolvedValue({
      projects: projects.slice(1),
      collections: [],
    });
    expect(await sitemap()).toEqual([{ url: origin }, { url: `${origin}/projects/biorsp` }]);
  });

  it("does not publish a partial sitemap when the directory is unavailable", async () => {
    vi.mocked(getDirectorySnapshot).mockRejectedValue(new Error("Directory unavailable"));
    await expect(sitemap()).rejects.toThrow("Directory unavailable");
  });

  it("includes only valid stored update timestamps without inventing freshness", async () => {
    const updatedAt = "2026-09-20T12:30:00.000Z";
    const records = [updatedAt, "not-a-date", null].map((value, index) => ({
      ...projects[0],
      slug: `project-${index}`,
      metadata: { ...projects[0].metadata, updatedAt: value },
    }));
    vi.mocked(getDirectorySnapshot).mockResolvedValue({ projects: records, collections: [] });
    expect(await sitemap()).toEqual([
      { url: origin },
      { url: `${origin}/projects/project-0`, lastModified: new Date(updatedAt) },
      { url: `${origin}/projects/project-1` },
      { url: `${origin}/projects/project-2` },
    ]);
  });

  it("allows public crawling and advertises the authoritative sitemap", () => {
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/", disallow: "/api/" },
      sitemap: `${origin}/sitemap.xml`,
    });
  });
});
