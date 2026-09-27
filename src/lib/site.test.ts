import { describe, expect, it } from "vitest";
import { researchJsonLd, site } from "./site";
import { parseMetadata, toPublicProject } from "./models";

describe("research site identity", () => {
  it("preserves authored resource URLs in public records", () => {
    const record = {
      slug: "atlas",
      target: "https://example.org/atlas?download=1#paper",
      source: "manual" as const,
      clicks: 0,
      metadata: parseMetadata("atlas", {
        description: "A published research atlas",
        artifacts: JSON.stringify([
          {
            title: "Article",
            type: "website",
            url: "https://example.org/article",
          },
        ]),
      }),
    };
    const result = toPublicProject(record);
    expect(result.target).toBe(record.target);
    expect(result.artifacts).toEqual(record.metadata.artifacts);
    expect(result.description).toBe(record.metadata.description);
  });

  it("identifies research as part of the parent website", () => {
    expect(site.url).toBe("https://research.zeyuyaoy.com");
    expect(researchJsonLd.url).toBe(site.url);
    expect(researchJsonLd.isPartOf.url).toBe(site.portfolioUrl);
  });
});
