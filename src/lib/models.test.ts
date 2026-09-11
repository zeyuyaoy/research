import {describe, expect, it} from "vitest";
import {
    formatResearchDate,
    isHttpUrl,
    isValidDate,
    normalizeTags,
    parsePagination,
    serializeProjectMetadata,
    validateCollectionInput,
    validateProjectInput
} from "./models";

describe("project validation", () => {
    it("normalizes compatible project input without fetching metadata", () => {
        const parsed = validateProjectInput({
            slug: "/My-Study",
            target: "https://example.org/paper",
            tags: "Bioinformatics, Bioinformatics, AI",
            startDate: "2025-09"
        }, true);
        expect(parsed).toEqual({
            success: true,
            data: expect.objectContaining({slug: "my-study", tags: ["Bioinformatics", "AI"], startDate: "2025-09"})
        });
        if (parsed.success) expect(serializeProjectMetadata(parsed.data).title).toBe("my-study");
    });

    it("rejects unsafe URLs and impossible dates", () => {
        expect(isHttpUrl("file:///etc/passwd")).toBe(false);
        expect(validateProjectInput({slug: "x", target: "javascript:alert(1)"}, true).success).toBe(false);
        expect(isValidDate("2025-02-31")).toBe(false);
    });

    it("keeps valid partial dates and formats them without inventing present state", () => {
        expect(isValidDate("2025")).toBe(true);
        expect(isValidDate("2025-07")).toBe(true);
        expect(formatResearchDate("2025-07")).toBe("Jul 2025");
        expect(formatResearchDate("2025")).toBe("2025");
    });
});

describe("collection and query validation", () => {
    it("normalizes collection projects and tags", () => {
        expect(validateCollectionInput({
            id: "Group-One",
            name: "Group",
            projects: ["A", "b"],
            tags: "genomics, data"
        }, true)).toEqual({
            success: true,
            data: {
                id: "group-one",
                name: "Group",
                description: undefined,
                projects: ["a", "b"],
                tags: ["genomics", "data"]
            }
        });
        expect(normalizeTags([" a ", "a", "b"])).toEqual(["a", "b"]);
    });

    it("rejects unbounded or invalid pagination", () => {
        expect(parsePagination(new URLSearchParams("limit=-1"), {limit: 20, max: 100}).success).toBe(false);
        expect(parsePagination(new URLSearchParams("limit=20&offset=10"), {limit: 5, max: 100})).toEqual({
            success: true,
            data: {limit: 20, offset: 10}
        });
    });
});
