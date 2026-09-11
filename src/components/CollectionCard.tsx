"use client";

import {ChevronDown} from "lucide-react";
import {useCallback, useId, useSyncExternalStore} from "react";
import type {ProjectView} from "@/app/page";
import type {PhotoSet} from "@/lib/conferenceSlides";
import {formatResearchDate} from "@/lib/models";
import ConferenceCarousel from "./ConferenceCarousel";
import ProjectCard from "./ProjectCard";

const COLLECTION_STATE_EVENT = "collection-state-change";
const collectionStateFallback = new Map<string, boolean>();

function readCollectionState(key: string) {
    const fallback = collectionStateFallback.get(key);
    if (fallback !== undefined) return fallback;
    try {
        return localStorage.getItem(key) !== "1";
    } catch {
        return true;
    }
}

function writeCollectionState(key: string, expanded: boolean) {
    collectionStateFallback.set(key, expanded);
    try {
        localStorage.setItem(key, expanded ? "0" : "1");
    } catch { /* Local storage is optional */
    }
    window.dispatchEvent(new CustomEvent(COLLECTION_STATE_EVENT, {detail: key}));
}

export default function CollectionCard({
                                           id,
                                           name,
                                           description,
                                           projects,
                                           tags = [],
                                           highlights = [],
                                           startDate,
                                           endDate,
                                           photoSet
                                       }: {
    id: string;
    name: string;
    description: string;
    projects: ProjectView[];
    tags?: string[];
    highlights?: string[];
    startDate?: string | null;
    endDate?: string | null;
    photoSet?: PhotoSet
}) {
    const storageKey = `collection:collapsed:${id}`;
    const subscribe = useCallback((onStoreChange: () => void) => {
        const handleStorage = (event: StorageEvent) => {
            if (event.key === storageKey) {
                collectionStateFallback.set(storageKey, event.newValue !== "1");
                onStoreChange();
            }
        };
        const handleLocalChange = (event: Event) => {
            if ((event as CustomEvent<string>).detail === storageKey) onStoreChange();
        };
        window.addEventListener("storage", handleStorage);
        window.addEventListener(COLLECTION_STATE_EVENT, handleLocalChange);
        return () => {
            window.removeEventListener("storage", handleStorage);
            window.removeEventListener(COLLECTION_STATE_EVENT, handleLocalChange);
        };
    }, [storageKey]);

    const getSnapshot = useCallback(() => readCollectionState(storageKey), [storageKey]);
    const expanded = useSyncExternalStore(subscribe, getSnapshot, () => true);
    const panelId = useId();
    const toggle = () => writeCollectionState(storageKey, !expanded);
    const start = formatResearchDate(startDate);
    const end = formatResearchDate(endDate);
    const dates = start && end && start !== end ? `${start}–${end}` : start || end;

    return (
        <section className="mb-8 rounded-xl border transition-shadow hover:shadow-md"
                 style={{borderColor: "var(--card-border)", backgroundColor: "var(--background-color)"}}>
            <button type="button" onClick={toggle} aria-expanded={expanded} aria-controls={panelId}
                    className="flex w-full items-start justify-between gap-4 rounded-xl p-6 text-left hover:opacity-85 focus-visible:outline-none focus-visible:ring-2">
                <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                        <span className="text-2xl font-bold">{name}</span>
                        {dates ? <span className="text-lg opacity-55">({dates})</span> : null}
                        {tags.map((tag) => <span key={tag} className="rounded-full border px-2 py-1 text-xs opacity-75"
                                                 style={{borderColor: "var(--card-border)"}}>{tag}</span>)}
                    </span>
                    {description ? <span className="mt-2 block text-lg opacity-70">{description}</span> : null}
                </span>
                <ChevronDown aria-hidden
                             className={`mt-1 h-5 w-5 shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}/>
            </button>

            {expanded ? <div id={panelId}>
                {photoSet?.slides.length ?
                    <div className="px-6 pb-4"><ConferenceCarousel slides={photoSet.slides} caption={photoSet.title}/>
                    </div> : null}
                <div className="grid grid-cols-1 items-start gap-4 p-6 pt-0 md:grid-cols-2">
                    {projects.map((project) =>
                        <div key={project.slug} className="space-y-4">
                            <ProjectCard project={{...project, tags: Array.from(new Set([...project.tags, ...tags]))}}
                                         highlights={highlights}/>
                            {project.photoSet?.slides.length ? <ConferenceCarousel slides={project.photoSet.slides}
                                                                                   caption={project.photoSet.title}/> : null}
                        </div>
                    )}
                </div>
            </div> : null}
        </section>
    );
}
