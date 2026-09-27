import type {MetadataRoute} from "next";
import {site} from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
    return Response.json(
        {
            name: site.name,
            short_name: "Workshed",
            description: site.description,
            icons: [
                {src: "/favicon-32x32.png", sizes: "32x32", type: "image/png"},
                {src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png"},
            ],
            theme_color: "#fdfbf8",
            background_color: "#fdfbf8",
            display: "standalone",
        } satisfies MetadataRoute.Manifest,
        {
            headers: {"Content-Type": "application/manifest+json"},
        },
    );
}
