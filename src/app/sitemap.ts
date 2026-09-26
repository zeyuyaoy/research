import type {MetadataRoute} from "next";
import {getDirectorySnapshot} from "@/lib/directory";
import {site} from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Let data failures fail the request instead of publishing an incomplete sitemap.
    const {projects} = await getDirectorySnapshot();
    return [
        {url: site.url},
        ...projects.map(({slug}) => ({url: `${site.url}/projects/${encodeURIComponent(slug)}`})),
    ];
}
