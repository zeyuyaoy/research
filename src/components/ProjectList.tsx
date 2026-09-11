"use client";

import type {ProjectView} from "@/app/page";
import ConferenceCarousel from "./ConferenceCarousel";
import ProjectCard from "./ProjectCard";

export default function ProjectList({links, isSearching, highlights, availability, hasCollectionResults}: {
    links: ProjectView[];
    isSearching: boolean;
    highlights?: string[];
    availability: "ready" | "unconfigured" | "unavailable";
    hasCollectionResults: boolean
}) {
    if (!links.length && hasCollectionResults) return null;
    if (!links.length) {
        const message = isSearching
            ? "No projects match these filters."
            : availability === "unconfigured"
                ? "The research directory is not configured yet. Add a Redis URL to publish projects."
                : availability === "unavailable"
                    ? "The research directory is temporarily unavailable. Please try again later."
                    : "No projects are available yet.";
        return <div className="rounded-lg border p-10 text-center sm:p-16" role="status"
                    style={{backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)"}}><p
            className="text-base opacity-75 sm:text-lg">{message}</p></div>;
    }
    return <div className="space-y-6">{links.map((project) => <div key={project.slug} className="space-y-4"><ProjectCard
        project={project} highlights={highlights}/>{project.photoSet?.slides.length ?
        <ConferenceCarousel slides={project.photoSet.slides} caption={project.photoSet.title}/> : null}</div>)}</div>;
}
