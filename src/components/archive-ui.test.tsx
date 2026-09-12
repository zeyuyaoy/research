import {fireEvent, render, screen, waitFor, within} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import {DEFAULT_ARCHIVE_STATE} from "@/lib/archive";
import type {ProjectView} from "@/lib/views";
import SearchableProjects from "./SearchableProjects";
import CopyLinkButton from "./CopyLinkButton";

const projects: ProjectView[] = [{
    slug: "atlas",
    target: "https://example.org",
    shortUrl: "/atlas",
    detailUrl: "/projects/atlas",
    title: "Protein atlas",
    description: "Spatial biology",
    tags: ["Biology"],
    researchAreas: ["Biology", "Spatial omics"],
    source: "manual",
    createdAt: "2024-01-01T00:00:00.000Z",
    startDate: "2023",
    endDate: "2024",
    githubRepo: null,
    photoSetId: null,
    organizations: [],
    artifacts: [{
        type: "website",
        title: "Primary link",
        url: "https://example.org",
        date: null,
        venue: null,
        featured: true
    }],
    searchText: "atlas spatial biology institute",
}];

describe("archive interactions", () => {
    it("focuses search with slash and keeps filters in the URL", async () => {
        window.history.replaceState({}, "", "/");
        const {container} = render(<SearchableProjects initialLinks={projects} availability="ready"
                                                       initialState={DEFAULT_ARCHIVE_STATE}/>);
        expect(within(container).getByRole("link", {name: /Portfolio/})).toHaveAttribute("href", "https://cytronicoder.com");
        expect(container.querySelector("footer.site-footer")).toBeNull();
        fireEvent.keyDown(document, {key: "/"});
        const input = within(container).getByRole("searchbox");
        expect(input).toHaveFocus();
        fireEvent.change(input, {target: {value: "atlas"}});
        await waitFor(() => expect(window.location.search).toContain("q=atlas"));
        fireEvent.click(within(container).getAllByRole("button", {name: "Biology"})[0]);
        expect(window.location.search).toContain("tag=Biology");
        expect(container.querySelector(".archive-count")).toHaveTextContent("1 of 1 projects");
    });

    it("announces copy success and failure", async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, "clipboard", {configurable: true, value: {writeText}});
        render(<CopyLinkButton path="/projects/atlas"/>);
        fireEvent.click(screen.getByRole("button", {name: "Copy link"}));
        await waitFor(() => expect(screen.getByText("Link copied")).toBeInTheDocument());
        expect(writeText).toHaveBeenCalledWith(expect.stringContaining("/projects/atlas"));
    });
});
