"use client";

import {Search} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {useCallback, useEffect, useState} from "react";
import type {ProjectSummary} from "@/lib/archive";
import {site} from "@/lib/site";
import ThemeToggle from "./ThemeToggle";

const CommandPalette = dynamic(() => import("./CommandPalette"));

export default function SiteHeader({
                                       projects,
                                       onTagSelect,
                                       onClearFilters,
                                   }: {
    projects: ProjectSummary[];
    onTagSelect?: (tag: string) => void;
    onClearFilters?: () => void;
}) {
    const [paletteOpen, setPaletteOpen] = useState(false);
    const closePalette = useCallback(() => setPaletteOpen(false), []);
    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                if (document.querySelector("dialog[open]")) {
                    return;
                }
                event.preventDefault();
                setPaletteOpen(true);
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);
    return (
        <>
            <header className="site-header">
                <div className="site-brand">
                    <a href={site.portfolioUrl} aria-label="Zeyu Yao — main site">
                        <strong>
                            Zeyu Yao <span lang="zh">姚则禹</span>
                        </strong>
                    </a>
                    <Link href="/" className="section-link">
                        Research
                    </Link>
                </div>
                <nav aria-label="Primary navigation">
                    <button
                        type="button"
                        className="icon-button command-trigger"
                        aria-label="Open command palette"
                        aria-keyshortcuts="Meta+K Control+K"
                        title="Search commands (⌘/Ctrl K)"
                        aria-haspopup="dialog"
                        aria-expanded={paletteOpen}
                        onClick={() => setPaletteOpen(true)}
                    >
                        <Search aria-hidden/>
                    </button>
                    <ThemeToggle/>
                </nav>
            </header>
            {paletteOpen ? (
                <CommandPalette
                    open={paletteOpen}
                    onClose={closePalette}
                    projects={projects}
                    onTagSelect={onTagSelect}
                    onClearFilters={onClearFilters}
                />
            ) : null}
        </>
    );
}
