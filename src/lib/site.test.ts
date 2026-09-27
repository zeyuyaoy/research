import {describe, expect, it} from "vitest";
import {projectDescription, researchJsonLd, site} from "./site";
import {parseMetadata, toPublicProject} from "./models";

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

describe("project preview descriptions", () => {
    it.each([
        ["  A short\n description. ", "Longer details.", "A short description."],
        [" \n ", " Longer\t details. ", "Longer details."],
        [null, null, "Explore Atlas, a research project by Peter."],
        ["", " \n ", "Explore Atlas, a research project by Peter."],
    ])(
        "selects and normalizes authored copy before falling back",
        (description, longDescription, expected) => {
            const project = {title: "Atlas", description, longDescription};
            const original = {...project};
            expect(projectDescription(project)).toBe(expected);
            expect(project).toEqual(original);
        },
    );

    it("keeps short previews intact and truncates long ones at a word boundary", () => {
        const exact = "x".repeat(180);
        expect(projectDescription({title: "Atlas", description: exact, longDescription: null})).toBe(
            exact,
        );
        const description = "A study of cells and their surroundings. ".repeat(10);
        const result = projectDescription({title: "Atlas", description, longDescription: null});
        expect(result.length).toBeLessThanOrEqual(180);
        expect(result.endsWith("…")).toBe(true);
        expect(description.startsWith(`${result.slice(0, -1)} `)).toBe(true);
    });

    it("bounds an unbroken token without splitting Unicode characters", () => {
        expect(
            projectDescription({title: "Atlas", description: "🧬".repeat(200), longDescription: null}),
        ).toBe(`${"🧬".repeat(179)}…`);
    });
});
