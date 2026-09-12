"use client";

import {ArrowRight, ExternalLink, FolderOpen} from "lucide-react";
import React from "react";
import type {ProjectSummary} from "@/lib/archive";
import {formatResearchDate} from "@/lib/models";
import ArtifactLink from "./ArtifactLink";
import CopyLinkButton from "./CopyLinkButton";

function highlighted(text: string, terms: string[]): React.ReactNode {
    const normalized = terms.map((term) => term.trim()).filter(Boolean);
    if (!normalized.length) return text;
    const escaped = normalized.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
    const parts = text.split(new RegExp(`(${escaped})`, "gi"));
    const matches = new Set(normalized.map((term) => term.toLowerCase()));
    return parts.map((part, index) => matches.has(part.toLowerCase()) ?
        <mark key={`${part}-${index}`}>{part}</mark> :
        <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>);
}

function dateLabel(startDate: string | null, endDate: string | null) {
    const start = formatResearchDate(startDate);
    const end = formatResearchDate(endDate);
    if (start && end && start !== end) return `${start}–${end}`;
    return start || end;
}

export default function ProjectCard({project, highlights = [], onTagSelect}: {
    project: ProjectSummary;
    highlights?: string[];
    onTagSelect?: (tag: string) => void;
}) {
    const date = dateLabel(project.startDate, project.endDate);
    const artifacts = project.artifacts.filter((artifact) => artifact.featured).slice(0, 2);
    return <div className="archive-entry">
        <div className="entry-date">{date || "Undated"}</div>
        <span className="entry-dot" aria-hidden/>
        <article className="project-card">
            <div className="project-card-heading">
                <div><h2><a href={project.detailUrl}>{highlighted(project.title, highlights)}</a></h2>
                    {project.organizations.length ?
                        <p className="organization-line">{project.organizations.map((item) => item.name).join(" · ")}</p> : null}
                </div>
                <CopyLinkButton path={project.detailUrl}/>
            </div>
            {project.description ?
                <p className="project-description">{highlighted(project.description, highlights)}</p> : null}
            {project.researchAreas.length ? <div className="tag-row" aria-label="Research areas">
                {project.researchAreas.slice(0, 4).map((tag) => <button key={tag} type="button"
                                                                        onClick={() => onTagSelect?.(tag)}>{highlighted(tag, highlights)}</button>)}
                {project.researchAreas.length > 4 ? <span>+{project.researchAreas.length - 4}</span> : null}
            </div> : null}
            <div className="project-actions">
                <a className="primary-button project-primary" href={project.detailUrl}><FolderOpen aria-hidden/>View
                    project<ArrowRight aria-hidden/></a>
                {artifacts.map((artifact) => <ArtifactLink key={`${artifact.type}:${artifact.url || artifact.title}`}
                                                           artifact={artifact} compact/>)}
                {!artifacts.length ?
                    <a className="text-link" href={project.target} target="_blank" rel="noopener noreferrer">Primary
                        link<ExternalLink aria-hidden/><span
                            className="sr-only"> (opens in a new tab)</span></a> : null}
            </div>
        </article>
    </div>;
}

export {dateLabel, highlighted};
