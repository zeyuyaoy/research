"use client";

import {ChevronRight, FileText} from "lucide-react";
import type {ProjectSummary} from "@/lib/archive";
import type {PhotoSet} from "@/lib/conferenceSlides";
import {formatResearchDate} from "@/lib/models";
import ConferenceCarousel from "./ConferenceCarousel";
import CopyLinkButton from "./CopyLinkButton";

function collectionDates(projects: ProjectSummary[]) {
    const years = projects
        .flatMap((project) => [project.startDate, project.endDate])
        .filter((value): value is string => Boolean(value))
        .map((value) => Number(value.slice(0, 4)))
        .filter(Number.isFinite);
    if (!years.length) {
        return null;
    }
    const min = String(Math.min(...years));
    const max = String(Math.max(...years));
    return min === max ? min : `${formatResearchDate(min)}–${formatResearchDate(max)}`;
}

export default function CollectionCard({
                                           id,
                                           name,
                                           description,
                                           projects,
                                           tags = [],
                                           photoSet,
                                           onTagSelect,
                                           selectedTags = [],
                                       }: {
    id: string;
    name: string;
    description: string;
    projects: ProjectSummary[];
    tags?: string[];
    selectedTags?: string[];
    photoSet?: PhotoSet;
    onTagSelect?: (tag: string) => void;
}) {
    const dates = collectionDates(projects);
    const areas = Array.from(
        new Set([...tags, ...projects.flatMap((project) => project.researchAreas)]),
    ).slice(0, 4);
    return (
        <div className="archive-entry collection-entry" id={`collection-${id}`}>
            <div className="entry-date">{dates || "Collection"}</div>
            <span className="entry-dot entry-dot-solid" aria-hidden/>
            <section className="collection-card" aria-labelledby={`collection-title-${id}`}>
                <div className="collection-top">
                    <div className="collection-copy">
                        <div className="project-card-heading">
                            <h2 id={`collection-title-${id}`}>
                                {name}
                                {dates ? <span> ({dates})</span> : null}
                            </h2>
                            <CopyLinkButton path={`/#collection-${id}`}/>
                        </div>
                        {description ? <p>{description}</p> : null}
                        {areas.length ? (
                            <div className="tag-row">
                                {areas.map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        aria-pressed={selectedTags.some(
                                            (value) => value.toLowerCase() === tag.toLowerCase(),
                                        )}
                                        onClick={() => onTagSelect?.(tag)}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        ) : null}
                    </div>
                    {photoSet?.slides.length ? (
                        <div className="collection-photo">
                            <ConferenceCarousel
                                slides={photoSet.slides}
                                sizes="(max-width: 359px) calc(100vw - 32px - 2rem - 2px), (max-width: 599px) calc(100vw - 48px - 2rem - 2px), (max-width: 699px) calc(100vw - 64px - 3rem - 2px), 300px"
                                caption={photoSet.title}
                                hideCaption
                            />
                        </div>
                    ) : null}
                </div>
                <div className="collection-desktop-outputs">
                    <h3>Research outputs ({projects.length})</h3>
                    <div className="collection-output-grid">
                        {projects.map((project) => (
                            <a key={project.slug} href={project.detailUrl}>
                                <FileText aria-hidden/>
                                <strong>{project.title}</strong>
                                <ChevronRight aria-hidden/>
                            </a>
                        ))}
                    </div>
                </div>
                <details className="collection-mobile-outputs" id={`collection-${id}-outputs`}>
                    <summary>
                        <FileText aria-hidden/>
                        <span>
                            {projects.length} research output{projects.length === 1 ? "" : "s"}
                        </span>
                        <ChevronRight aria-hidden/>
                    </summary>
                    <div>
                        {projects.map((project) => (
                            <a key={project.slug} href={project.detailUrl}>
                                {project.title}
                                <ChevronRight aria-hidden/>
                            </a>
                        ))}
                    </div>
                </details>
            </section>
        </div>
    );
}
