"use client";

import {Search, X} from "lucide-react";
import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {type ArchiveState, projectMatchesYear, type ProjectSummary} from "@/lib/archive";

export default function FilterDrawer({open, onClose, state, projects, onApply, onClear}: {
    open: boolean;
    onClose: () => void;
    state: ArchiveState;
    projects: ProjectSummary[];
    onApply: (state: ArchiveState) => void;
    onClear: () => void;
}) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const previousFocus = useRef<HTMLElement | null>(null);
    const [draft, setDraft] = useState(state);
    const [tagQuery, setTagQuery] = useState("");
    const dismiss = useCallback(() => {
        const previous = previousFocus.current;
        if (dialogRef.current?.open) dialogRef.current.close();
        onClose();
        window.setTimeout(() => previous?.focus(), 0);
    }, [onClose]);
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) {
            previousFocus.current = document.activeElement as HTMLElement | null;
            dialog.showModal();
            document.body.classList.add("dialog-open");
        } else if (!open && dialog.open) dialog.close();
        return () => document.body.classList.remove("dialog-open");
    }, [open]);
    const tags = useMemo(() => Array.from(new Set(projects.flatMap((project) => project.researchAreas)))
        .filter((tag) => tag.toLowerCase().includes(tagQuery.toLowerCase())).sort((a, b) => a.localeCompare(b)), [projects, tagQuery]);
    const years = useMemo(() => Array.from(new Set(projects.flatMap((project) => [project.startDate, project.endDate])
        .filter((date): date is string => Boolean(date)).map((date) => date.slice(0, 4)))).sort((a, b) => b.localeCompare(a)), [projects]);
    const visible = useMemo(() => projects.filter((project) => {
        if (draft.source !== "all" && project.source !== draft.source) return false;
        if (draft.year && !projectMatchesYear(project, draft.year)) return false;
        const areas = new Set(project.researchAreas.map((tag) => tag.toLowerCase()));
        return draft.tags.every((tag) => areas.has(tag.toLowerCase()));
    }).length, [draft.source, draft.tags, draft.year, projects]);
    const active = draft.tags.length + (draft.source === "all" ? 0 : 1) + (draft.year ? 1 : 0);
    return <dialog ref={dialogRef} className="filter-dialog" aria-labelledby="filter-title"
                   onCancel={(event) => {
                       event.preventDefault();
                       dismiss();
                   }}>
        <header>
            <div><h2 id="filter-title">Filter research</h2>{active ? <span>{active} active</span> : null}</div>
            <button className="icon-button" type="button" onClick={dismiss} aria-label="Close filters"><X aria-hidden/>
            </button>
        </header>
        <div className="filter-body">
            <fieldset>
                <legend>Source</legend>
                <div className="filter-options-inline">
                    {(["all", "manual", "orcid"] as const).map((source) => <label key={source}><input type="radio"
                                                                                                      name="source"
                                                                                                      checked={draft.source === source}
                                                                                                      onChange={() => setDraft((current) => ({
                                                                                                          ...current,
                                                                                                          source
                                                                                                      }))}/><span>{source === "all" ? "All" : source === "orcid" ? "ORCID" : "Manual"}</span></label>)}
                </div>
            </fieldset>
            <fieldset>
                <legend>Research areas</legend>
                <label className="filter-search"><Search aria-hidden/><span
                    className="sr-only">Find a research area</span>
                    <input value={tagQuery} onChange={(event) => setTagQuery(event.target.value)}
                           placeholder="Find a research area…"/></label>
                <div className="filter-checks">{tags.map((tag) => {
                    const checked = draft.tags.some((selected) => selected.toLowerCase() === tag.toLowerCase());
                    return <label key={tag}><input type="checkbox" checked={checked}
                                                   onChange={() => setDraft((current) => ({
                                                       ...current,
                                                       tags: checked ? current.tags.filter((selected) => selected.toLowerCase() !== tag.toLowerCase()) : [...current.tags, tag]
                                                   }))}/><span>{tag}</span></label>;
                })}</div>
            </fieldset>
            <label className="filter-year"><strong>Year</strong><select value={draft.year || ""}
                                                                        onChange={(event) => setDraft((current) => ({
                                                                            ...current,
                                                                            year: event.target.value || null
                                                                        }))}>
                <option value="">Any year</option>
                {years.map((year) => <option key={year} value={year}>{year}</option>)}
            </select></label>
        </div>
        <footer>
            <button type="button" className="secondary-button" onClick={() => {
                onClear();
                dismiss();
            }}>Clear all
            </button>
            <button type="button" className="primary-button" onClick={() => {
                onApply(draft);
                dismiss();
            }}>Show {visible} project{visible === 1 ? "" : "s"}</button>
        </footer>
    </dialog>;
}
