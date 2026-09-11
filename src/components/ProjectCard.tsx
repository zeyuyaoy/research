import {GitFork} from "lucide-react";
import Image from "next/image";
import React from "react";
import type {PublicProject} from "@/lib/models";
import {formatResearchDate} from "@/lib/models";
import ShareButton from "./ShareButton";

function highlighted(text: string, terms: string[]): React.ReactNode {
    const normalized = terms.map((term) => term.trim()).filter(Boolean);
    if (!normalized.length) return text;
    const escaped = normalized.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
    const parts = text.split(new RegExp(`(${escaped})`, "gi"));
    const matches = new Set(normalized.map((term) => term.toLowerCase()));
    return parts.map((part, index) => matches.has(part.toLowerCase()) ?
        <mark key={`${part}-${index}`} className="rounded-sm bg-primary/20 text-inherit">{part}</mark> :
        <React.Fragment key={`${part}-${index}`}>{part}</React.Fragment>);
}

function dateLabel(startDate: string | null, endDate: string | null) {
    const start = formatResearchDate(startDate);
    const end = formatResearchDate(endDate);
    if (start && end && start !== end) return `${start}–${end}`;
    return start || end;
}

export default function ProjectCard({project, highlights = []}: { project: PublicProject; highlights?: string[] }) {
    const date = dateLabel(project.startDate, project.endDate);
    return (
        <article
            className="group relative rounded-lg border p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-within:ring-2"
            style={{backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)"}}>
            <div className="flex items-start justify-between gap-4">
                <a href={project.target} target="_blank" rel="noopener noreferrer"
                   className="min-w-0 flex-1 rounded-sm focus-visible:outline-none"
                   aria-label={`Open ${project.title}`}>
                    <div className="mb-2 flex items-start gap-3">
                        {project.source === "orcid" ? <Image src="/orcid.svg" alt="ORCID project" width={20} height={20}
                                                             className="mt-1"/> : null}
                        <h2 className="text-xl font-semibold leading-snug">{highlighted(project.title, highlights)}{date ?
                            <span className="ml-2 text-base font-normal opacity-55">({date})</span> : null}</h2>
                    </div>
                    {project.description ?
                        <p className="mb-3 line-clamp-3 text-sm opacity-75">{highlighted(project.description, highlights)}</p> : null}
                    {project.tags.length ? <div
                        className="mb-3 flex flex-wrap gap-2">{project.tags.toSorted((a, b) => a.localeCompare(b)).map((tag) =>
                        <span key={tag} className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{
                            backgroundColor: "var(--primary-soft)",
                            color: "var(--primary-color)"
                        }}>{highlighted(tag, highlights)}</span>)}</div> : null}
                    <p className="truncate font-mono text-xs opacity-50">{project.target}</p>
                </a>
                <ShareButton title={project.title} shortUrl={project.shortUrl}/>
            </div>
            {project.githubRepo ? <a href={project.githubRepo} target="_blank" rel="noopener noreferrer"
                                     className="absolute bottom-2 right-2 rounded-full p-2 opacity-60 hover:bg-black/5 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2"
                                     aria-label={`View ${project.title} repository on GitHub`}><GitFork aria-hidden
                                                                                                        className="h-6 w-6"/></a> : null}
        </article>
    );
}

export {dateLabel, highlighted};
