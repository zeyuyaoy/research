"use client";

import {Search, X} from "lucide-react";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";

export default function SearchBar({searchQuery, onSearchChange, resultsCount}: {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    resultsCount?: number
}) {
    return (
        <header className="relative mb-6 pt-5 sm:pt-0">
            <Image src="/pet.png" alt="" aria-hidden width={60} height={60} priority
                   className="pointer-events-none absolute -top-10 right-14 z-10 hidden drop-shadow-sm sm:block"/>
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <label htmlFor="research-search" className="sr-only">Search research projects</label>
                    <Search aria-hidden className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 opacity-50"/>
                    <input id="research-search" type="search" placeholder="Search my research projects…"
                           value={searchQuery} onChange={(event) => onSearchChange(event.target.value)}
                           className="w-full rounded-lg border py-4 pl-12 pr-12 text-base transition-all focus-visible:outline-none focus-visible:ring-2 sm:text-lg"
                           style={{
                               backgroundColor: "var(--input-bg)",
                               borderColor: "var(--input-border)",
                               color: "var(--text-color)"
                           }}/>
                    {searchQuery ? <button type="button" onClick={() => onSearchChange("")}
                                           className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 opacity-60 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2"
                                           aria-label="Clear search"><X aria-hidden className="h-5 w-5"/>
                    </button> : null}
                </div>
                <ThemeToggle/>
            </div>
            {resultsCount !== undefined ? <p className="mt-3 text-sm opacity-70"
                                             aria-live="polite">{resultsCount} result{resultsCount === 1 ? "" : "s"} found</p> : null}
        </header>
    );
}
