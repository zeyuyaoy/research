import type { MetadataRoute } from "next";
import { getDirectorySnapshot } from "@/lib/directory";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects } = await getDirectorySnapshot();
  return [
    { url: site.url },
    ...projects.map(({ slug, metadata }) => {
      const updatedAt = metadata.updatedAt ? Date.parse(metadata.updatedAt) : NaN;
      return {
        url: `${site.url}/projects/${encodeURIComponent(slug)}`,
        ...(Number.isFinite(updatedAt) ? { lastModified: new Date(updatedAt) } : {}),
      };
    }),
  ];
}
