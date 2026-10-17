import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  return Response.json(
    {
      name: site.name,
      short_name: "Workshed",
      description: site.description,
      icons: [
        { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
        { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      theme_color: "#fdfbf8",
      background_color: "#fdfbf8",
      display: "standalone",
    } satisfies MetadataRoute.Manifest,
    {
      headers: { "Content-Type": "application/manifest+json" },
    },
  );
}
