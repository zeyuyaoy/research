"use client";

import {ArrowRight, ChevronRight, FileText, FolderOpen} from "lucide-react";
import type {ProjectView} from "@/lib/views";
import type {PhotoSet} from "@/lib/conferenceSlides";
import {formatResearchDate} from "@/lib/models";
import ConferenceCarousel from "./ConferenceCarousel";
import CopyLinkButton from "./CopyLinkButton";

function collectionDates(projects: ProjectView[]) {
    const years = projects.flatMap((project) => [project.startDate, project.endDate]).filter((value): value is string => Boolean(value))
        .map((value) => Number(value.slice(0, 4))).filter(Number.isFinite);
    if (!years.length) return null;
    const min = String(Math.min(...years));
    const max = String(Math.max(...years));
    return min === max ? min : `${formatResearchDate(min)}–${formatResearchDate(max)}`;
}

export default function CollectionCard({id, name, description, projects, tags = [], photoSet, onTagSelect}: {
    id: string;
    name: string;
    description: string;
    projects: ProjectView[];
    tags?: string[];
    photoSet?: PhotoSet;
    onTagSelect?: (tag: string) => void;
}) {
    const dates = collectionDates(projects);
    const areas = Array.from(new Set([...tags, ...projects.flatMap((project) => project.researchAreas)])).slice(0, 4);
    const members = projects.slice(0, 4);
    return <div className="archive-entry collection-entry" id={`collection-${id}`}>
        <div className="entry-date">{dates || "Collection"}</div>
        <span className="entry-dot entry-dot-solid" aria-hidden/>
        <section className="collection-card" aria-labelledby={`collection-title-${id}`}>
            <div className="collection-top">
                <div className="collection-copy">
                    <div className="project-card-heading"><h2 id={`collection-title-${id}`}>{name}{dates ?
                        <span> ({dates})</span> : null}</h2>
                        <CopyLinkButton path={`/#collection-${id}`}/></div>
                    {description ? <p>{description}</p> : null}
                    {areas.length ? <div className="tag-row">{areas.map((tag) => <button key={tag} type="button"
                                                                                         onClick={() => onTagSelect?.(tag)}>{tag}</button>)}</div> : null}
                </div>
                {photoSet?.slides.length ?
                    <div className="collection-photo"><ConferenceCarousel slides={photoSet.slides}
                                                                          caption={photoSet.title} hideCaption/>
                    </div> : null}
            </div>
            <div className="collection-desktop-outputs">
                <h3>Research outputs ({projects.length})</h3>
                <div className="collection-output-grid">{members.map((project) => <a key={project.slug}
                                                                                     href={project.detailUrl}>
                    <FileText aria-hidden/><strong>{project.title}</strong><ChevronRight aria-hidden/>
                </a>)}</div>
            </div>
            <details className="collection-mobile-outputs">
                <summary><FileText
                    aria-hidden/><span>{projects.length} research output{projects.length === 1 ? "" : "s"}</span><ChevronRight
                    aria-hidden/></summary>
                <div>{members.map((project) => <a key={project.slug}
                                                  href={project.detailUrl}>{project.title}<ChevronRight
                    aria-hidden/></a>)}</div>
            </details>
            <a className="primary-button collection-mobile-action" href={`#collection-${id}-outputs`}
               onClick={(event) => {
                   event.preventDefault();
                   (event.currentTarget.previousElementSibling as HTMLDetailsElement | null)?.setAttribute("open", "");
               }}><FolderOpen aria-hidden/>View collection<ArrowRight aria-hidden/></a>
        </section>
    </div>;
}
