"use client";

import {useDeferredValue, useMemo, useState} from "react";
import type {CollectionView, ProjectView} from "@/app/page";
import {researchTimestamp} from "@/lib/models";
import CollectionCard from "./CollectionCard";
import ProjectFooter from "./ProjectFooter";
import ProjectList from "./ProjectList";
import SearchBar from "./SearchBar";
import TagDirectory from "./TagDirectory";

type SortOption = "alphabetical-asc" | "alphabetical-desc" | "newest" | "oldest";

function compareProjects(a: ProjectView, b: ProjectView, sortBy: SortOption) {
    if (sortBy === "alphabetical-asc") return a.title.localeCompare(b.title);
    if (sortBy === "alphabetical-desc") return b.title.localeCompare(a.title);
    const dateA = researchTimestamp({startDate: a.startDate, endDate: a.endDate, createdAt: a.createdAt});
    const dateB = researchTimestamp({startDate: b.startDate, endDate: b.endDate, createdAt: b.createdAt});
    return sortBy === "newest" ? dateB - dateA || a.title.localeCompare(b.title) : dateA - dateB || a.title.localeCompare(b.title);
}

function compareCollections(a: CollectionView, b: CollectionView, sortBy: SortOption) {
    if (sortBy === "alphabetical-asc") return a.name.localeCompare(b.name);
    if (sortBy === "alphabetical-desc") return b.name.localeCompare(a.name);
    const dateA = Date.parse(a.updatedAt || a.createdAt);
    const dateB = Date.parse(b.updatedAt || b.createdAt);
    return sortBy === "newest" ? dateB - dateA || a.name.localeCompare(b.name) : dateA - dateB || a.name.localeCompare(b.name);
}

export default function SearchableProjects({
                                               initialLinks,
                                               initialCollections = [],
                                               availability,
                                           }: {
    initialLinks: ProjectView[];
    initialCollections?: CollectionView[];
    availability: "ready" | "unconfigured" | "unavailable";
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const deferredQuery = useDeferredValue(searchQuery.trim().toLowerCase());
    const [sourceFilter, setSourceFilter] = useState<"all" | "manual" | "orcid">("all");
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<SortOption>("alphabetical-asc");

    const model = useMemo(() => {
        const selected = selectedTag?.toLowerCase() || "";
        const sourceMatches = (project: ProjectView) => sourceFilter === "all" || project.source === sourceFilter;
        const searchMatches = (project: ProjectView) => !deferredQuery || [project.slug, project.target, project.title, project.description || "", ...project.tags].some((value) => value.toLowerCase().includes(deferredQuery));
        const tagMatches = (project: ProjectView) => !selected || project.tags.some((tag) => tag.toLowerCase() === selected);
        const filtered = initialLinks.filter((project) => sourceMatches(project) && searchMatches(project) && tagMatches(project)).toSorted((a, b) => compareProjects(a, b, sortBy));

        const collections = initialCollections.flatMap((collection) => {
            const ownSearchMatch = Boolean(deferredQuery) && [collection.name, collection.description].some((value) => value.toLowerCase().includes(deferredQuery));
            const ownTagMatch = Boolean(selected) && collection.tags.some((tag) => tag.toLowerCase() === selected);
            const members = initialLinks
                .filter((project) => collection.projects.includes(project.slug) && sourceMatches(project))
                .filter((project) => ownSearchMatch || ownTagMatch || (searchMatches(project) && tagMatches(project)))
                .toSorted((a, b) => compareProjects(a, b, sortBy));
            if (!members.length) return [];
            const years = members.flatMap((project) => [project.startDate, project.endDate]).filter((value): value is string => Boolean(value)).map((value) => Number(value.slice(0, 4))).filter(Number.isFinite);
            return [{
                ...collection,
                members,
                startDate: years.length ? String(Math.min(...years)) : null,
                endDate: years.length ? String(Math.max(...years)) : null
            }];
        }).toSorted((a, b) => compareCollections(a, b, sortBy));

        const grouped = new Set(collections.flatMap((collection) => collection.members.map((project) => project.slug)));
        const standalone = filtered.filter((project) => !grouped.has(project.slug));
        const visible = new Set([...grouped, ...standalone.map((project) => project.slug)]).size;
        return {collections, standalone, visible};
    }, [deferredQuery, initialCollections, initialLinks, selectedTag, sortBy, sourceFilter]);

    const hasOrcid = initialLinks.some((project) => project.source === "orcid");
    const hasManual = initialLinks.some((project) => project.source === "manual");
    const allTags = [...initialLinks.flatMap((project) => project.tags), ...initialCollections.flatMap((collection) => collection.tags)];
    const filtersActive = Boolean(searchQuery || selectedTag || sourceFilter !== "all");

    return (
        <>
            <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery}
                       resultsCount={filtersActive ? model.visible : undefined}/>
            <section aria-label="Directory controls"
                     className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {hasOrcid && hasManual ? (
                    <div role="group" aria-label="Project source"
                         className="inline-flex self-start rounded-lg border p-1"
                         style={{backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)"}}>
                        {(["all", "manual", "orcid"] as const).map((source) => (
                            <button key={source} type="button" aria-pressed={sourceFilter === source}
                                    onClick={() => setSourceFilter(source)}
                                    className="rounded-md px-3 py-1.5 text-sm font-semibold capitalize focus-visible:outline-none focus-visible:ring-2"
                                    style={{
                                        backgroundColor: sourceFilter === source ? "var(--primary-color)" : "transparent",
                                        color: sourceFilter === source ? "var(--on-primary)" : "var(--text-color)"
                                    }}>{source}</button>
                        ))}
                    </div>
                ) : <span/>}
                <label className="flex items-center gap-2 text-sm font-semibold" style={{color: "var(--text-color)"}}>
                    Sort by
                    <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)}
                            className="rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
                            style={{
                                backgroundColor: "var(--input-bg)",
                                borderColor: "var(--input-border)",
                                color: "var(--text-color)"
                            }}>
                        <option value="alphabetical-asc">Alphabetical (A–Z)</option>
                        <option value="alphabetical-desc">Alphabetical (Z–A)</option>
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                    </select>
                </label>
            </section>
            {allTags.length > 0 ?
                <TagDirectory allTags={allTags} selectedTag={selectedTag} onTagSelect={setSelectedTag}/> : null}
            {model.collections.map((collection) => <CollectionCard key={collection.id} {...collection}
                                                                   projects={collection.members}
                                                                   highlights={deferredQuery ? [deferredQuery] : []}/>)}
            <ProjectList links={model.standalone} isSearching={filtersActive}
                         highlights={deferredQuery ? [deferredQuery] : []} availability={availability}
                         hasCollectionResults={model.collections.length > 0}/>
            <ProjectFooter totalProjects={initialLinks.length}/>
        </>
    );
}
