import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import {describe, expect, it, vi} from "vitest";
import type {ProjectSummary} from "@/lib/archive";
import CommandPalette from "./CommandPalette";

vi.mock("next/navigation", () => ({useRouter: () => ({push: vi.fn()})}));

const project: ProjectSummary = {
    slug: "atlas",
    target: "https://example.org",
    shortUrl: "/atlas",
    detailUrl: "/projects/atlas",
    title: "Protein atlas",
    description: "Spatial biology",
    tags: ["Biology"],
    researchAreas: ["Biology"],
    source: "manual",
    createdAt: "2025-01-01T00:00:00.000Z",
    startDate: "2024",
    endDate: "2025",
    githubRepo: null,
    photoSetId: null,
    organizations: [],
    artifacts: [],
    searchText: "protein atlas biology",
};

describe("command palette", () => {
    it("supports keyboard selection and restores focus on Escape", async () => {
        HTMLDialogElement.prototype.showModal = function () {
            this.setAttribute("open", "");
        };
        HTMLDialogElement.prototype.close = function () {
            this.removeAttribute("open");
        };
        const trigger = document.createElement("button");
        trigger.textContent = "Trigger";
        document.body.append(trigger);
        trigger.focus();
        const close = vi.fn();
        render(<CommandPalette open onClose={close} projects={[project]}/>);
        const input = await screen.findByRole("combobox", {name: "Search projects or run a command"});
        await waitFor(() => expect(input).toHaveFocus());
        fireEvent.change(input, {target: {value: "biology"}});
        fireEvent.keyDown(input, {key: "ArrowDown"});
        expect(input).toHaveAttribute("aria-activedescendant");
        fireEvent.keyDown(input, {key: "Escape"});
        await waitFor(() => expect(trigger).toHaveFocus());
        expect(close).toHaveBeenCalledOnce();
        trigger.remove();
    });
});
