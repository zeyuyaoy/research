import {fireEvent, render, screen} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import type {PublicProject} from "@/lib/models";
import ConferenceCarousel from "./ConferenceCarousel";
import ProjectCard from "./ProjectCard";
import ShareButton from "./ShareButton";
import TagDirectory from "./TagDirectory";

const project: PublicProject = {
    slug: "safe-project",
    target: "https://example.org",
    shortUrl: "/safe-project",
    title: "Safe <script>title</script>",
    description: "Research description",
    tags: ["biology"],
    source: "manual",
    createdAt: "2025-01-01T00:00:00.000Z",
    updatedAt: null,
    startDate: "2024",
    endDate: "2025",
    githubRepo: "https://github.com/example/repo",
    photoSetId: null,
};

describe("public controls", () => {
    it("renders highlighted stored text as inert text", () => {
        const {container} = render(<ProjectCard project={project} highlights={["safe"]}/>);
        expect(screen.getByRole("heading")).toHaveTextContent("Safe <script>title</script>");
        expect(container.querySelector("script")).toBeNull();
    });

    it("exposes selected tag state", () => {
        const onSelect = vi.fn();
        render(<TagDirectory allTags={["biology"]} selectedTag="biology" onTagSelect={onSelect}/>);
        const button = screen.getByRole("button", {name: "biology"});
        expect(button).toHaveAttribute("aria-pressed", "true");
        fireEvent.click(button);
        expect(onSelect).toHaveBeenCalledWith(null);
    });

    it("keeps a manual carousel pause until the user resumes it", () => {
        render(<ConferenceCarousel slides={[
            {src: "/first.jpeg", alt: "First study presentation"},
            {src: "/second.jpeg", alt: "Second study presentation"},
        ]}/>);
        fireEvent.click(screen.getByRole("button", {name: "Pause slideshow"}));
        expect(screen.getByRole("button", {name: "Resume slideshow"})).toBeInTheDocument();
        fireEvent.mouseLeave(screen.getByRole("region", {name: "Conference photos"}));
        expect(screen.getByRole("button", {name: "Resume slideshow"})).toBeInTheDocument();
    });

    it("closes the share menu with Escape and restores trigger focus", async () => {
        render(<ShareButton title="Safe project" shortUrl="/safe-project"/>);
        const trigger = screen.getByRole("button", {name: "Share Safe project"});
        fireEvent.click(trigger);
        expect(screen.getByRole("menu", {name: "Share Safe project"})).toBeInTheDocument();
        fireEvent.keyDown(document, {key: "Escape"});
        await new Promise((resolve) => window.setTimeout(resolve, 0));
        expect(screen.queryByRole("menu", {name: "Share Safe project"})).not.toBeInTheDocument();
        expect(trigger).toHaveFocus();
    });
});
