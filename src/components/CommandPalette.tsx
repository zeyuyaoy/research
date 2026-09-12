"use client";

import {Code2, ExternalLink, FileText, FilterX, Moon, Search, Tag} from "lucide-react";
import {useCallback, useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {compareProjectSummaries, type ProjectSummary} from "@/lib/archive";
import {currentTheme, setDocumentTheme} from "./ThemeToggle";

type PaletteItem = {
    id: string;
    group: "Projects" | "Filter by research area" | "Actions" | "External links";
    label: string;
    detail?: string;
    icon: typeof FileText;
    run: () => void;
};

const EXTERNAL_LINKS = [
    {label: "Resume", href: "https://cytronicoder.com/resume"},
    {label: "GitHub", href: "https://github.com/cytronicoder"},
    {label: "Portfolio", href: "https://cytronicoder.com"},
];

export default function CommandPalette({open, onClose, projects, onTagSelect, onClearFilters}: {
    open: boolean;
    onClose: () => void;
    projects: ProjectSummary[];
    onTagSelect?: (tag: string) => void;
    onClearFilters?: () => void;
}) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const previousFocus = useRef<HTMLElement | null>(null);
    const [query, setQuery] = useState("");
    const [active, setActive] = useState(0);
    const router = useRouter();
    const dismiss = useCallback(() => {
        const previous = previousFocus.current;
        if (dialogRef.current?.open) dialogRef.current.close();
        onClose();
        window.setTimeout(() => previous?.focus(), 0);
    }, [onClose]);

    const items = (() => {
        const q = query.trim().toLowerCase();
        const closeThen = (run: () => void) => () => {
            onClose();
            run();
        };
        const projectItems: PaletteItem[] = projects.filter((project) => !q || q.split(/\s+/).every((term) => project.searchText.includes(term)))
            .toSorted((a, b) => compareProjectSummaries(a, b, "newest")).slice(0, q ? 6 : 3).map((project) => ({
                id: `project:${project.slug}`, group: "Projects", label: project.title,
                detail: [project.endDate || project.startDate, project.researchAreas.slice(0, 2).join(" · ")].filter(Boolean).join(" · "),
                icon: FileText, run: closeThen(() => router.push(project.detailUrl)),
            }));
        const tags = Array.from(new Set(projects.flatMap((project) => project.researchAreas)))
            .filter((tag) => !q || tag.toLowerCase().includes(q)).sort((a, b) => a.localeCompare(b)).slice(0, q ? 6 : 3);
        const tagItems: PaletteItem[] = tags.map((value) => ({
            id: `tag:${value}`, group: "Filter by research area", label: value, icon: Tag,
            run: closeThen(() => onTagSelect ? onTagSelect(value) : router.push(`/?tag=${encodeURIComponent(value)}`)),
        }));
        const actions: PaletteItem[] = ([
            {
                id: "clear",
                group: "Actions",
                label: "Clear all filters",
                icon: FilterX,
                run: closeThen(() => onClearFilters ? onClearFilters() : router.push("/"))
            },
            {
                id: "theme",
                group: "Actions",
                label: `Switch to ${currentTheme() === "dark" ? "light" : "dark"} theme`,
                icon: Moon,
                run: closeThen(() => setDocumentTheme(currentTheme() === "dark" ? "light" : "dark"))
            },
        ] satisfies PaletteItem[]).filter((item) => !q || item.label.toLowerCase().includes(q));
        const links: PaletteItem[] = EXTERNAL_LINKS.filter((link) => !q || link.label.toLowerCase().includes(q)).map((link) => ({
            id: `link:${link.label}`,
            group: "External links",
            label: link.label,
            icon: link.label === "GitHub" ? Code2 : ExternalLink,
            run: closeThen(() => window.open(link.href, "_blank", "noopener,noreferrer")),
        }));
        return [...projectItems, ...tagItems, ...actions, ...links];
    })();

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) {
            previousFocus.current = document.activeElement as HTMLElement | null;
            dialog.showModal();
            document.body.classList.add("dialog-open");
            window.setTimeout(() => inputRef.current?.focus(), 0);
        } else if (!open && dialog.open) dialog.close();
        return () => {
            document.body.classList.remove("dialog-open");
            previousFocus.current?.focus();
        };
    }, [open]);

    const groups = ["Projects", "Filter by research area", "Actions", "External links"] as const;
    return <dialog ref={dialogRef} className="command-dialog" aria-label="Research command palette"
                   onCancel={(event) => {
                       event.preventDefault();
                       dismiss();
                   }}>
        <div className="command-search">
            <Search aria-hidden/>
            <label className="sr-only" htmlFor="command-search">Search projects or run a command</label>
            <input ref={inputRef} id="command-search" value={query} onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
            }}
                   placeholder="Search projects or run a command…" autoComplete="off" role="combobox"
                   aria-expanded="true" aria-controls="command-results" aria-activedescendant={items[active]?.id}
                   onKeyDown={(event) => {
                       if (event.key === "ArrowDown") {
                           event.preventDefault();
                           setActive((value) => Math.min(value + 1, items.length - 1));
                       }
                       if (event.key === "ArrowUp") {
                           event.preventDefault();
                           setActive((value) => Math.max(value - 1, 0));
                       }
                       if (event.key === "Enter" && items[active]) {
                           event.preventDefault();
                           items[active].run();
                       }
                       if (event.key === "Escape") {
                           event.preventDefault();
                           dismiss();
                       }
                   }}/>
            <kbd>Esc</kbd>
        </div>
        <div id="command-results" role="listbox" className="command-results">
            {groups.map((group) => {
                const entries = items.filter((item) => item.group === group);
                if (!entries.length) return null;
                return <section key={group} aria-labelledby={`command-${group.replaceAll(" ", "-")}`}>
                    <h2 id={`command-${group.replaceAll(" ", "-")}`}>{group}</h2>
                    {entries.map((item) => {
                        const index = items.indexOf(item);
                        const Icon = item.icon;
                        return <button key={item.id} id={item.id} type="button" role="option"
                                       aria-selected={index === active}
                                       className="command-item" onMouseEnter={() => setActive(index)}
                                       onClick={item.run}>
                            <Icon aria-hidden/><span><strong>{item.label}</strong>{item.detail ?
                            <small>{item.detail}</small> : null}</span>
                            {item.group === "External links" ?
                                <ExternalLink aria-hidden className="command-trailing"/> : null}
                        </button>;
                    })}
                </section>;
            })}
            {!items.length ? <p className="command-empty">No matching projects or commands.</p> : null}
        </div>
        <footer className="command-help"><span>↑↓ Navigate</span><span>↵ Select</span><span>Esc Close</span></footer>
    </dialog>;
}
