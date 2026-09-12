"use client";

import {ArrowUpRight, Code2, FileText, Search} from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {useCallback, useEffect, useState} from "react";
import type {ProjectSummary} from "@/lib/archive";
import ThemeToggle from "./ThemeToggle";

const CommandPalette = dynamic(() => import("./CommandPalette"));

export default function SiteHeader({projects, onTagSelect, onClearFilters}: {
    projects: ProjectSummary[];
    onTagSelect?: (tag: string) => void;
    onClearFilters?: () => void;
}) {
    const [paletteOpen, setPaletteOpen] = useState(false);
    const closePalette = useCallback(() => setPaletteOpen(false), []);
    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
                event.preventDefault();
                setPaletteOpen(true);
            }
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, []);
    return <>
        <header className="site-header">
            <Link className="site-brand" href="/"><strong>Peter&#39;s Research Projects</strong><span>Per aspera ad astra!</span></Link>
            <nav aria-label="Primary navigation">
                <a href="https://cytronicoder.com/resume" target="_blank" rel="noopener noreferrer"><FileText
                    aria-hidden/>Resume<span className="sr-only"> (opens in a new tab)</span></a>
                <a href="https://github.com/cytronicoder" target="_blank" rel="noopener noreferrer"><Code2 aria-hidden/>GitHub<span
                    className="sr-only"> (opens in a new tab)</span></a>
                <a href="https://cytronicoder.com" target="_blank" rel="noopener noreferrer">Portfolio<ArrowUpRight
                    aria-hidden/><span className="sr-only"> (opens in a new tab)</span></a>
                <button type="button" className="icon-button command-trigger" aria-label="Open command palette"
                        onClick={() => setPaletteOpen(true)}><Search aria-hidden/></button>
                <ThemeToggle/>
            </nav>
        </header>
        {paletteOpen ? <CommandPalette open={paletteOpen} onClose={closePalette} projects={projects}
                                       onTagSelect={onTagSelect} onClearFilters={onClearFilters}/> : null}
    </>;
}
