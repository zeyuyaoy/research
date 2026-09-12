"use client";

import {Moon, Sun} from "lucide-react";
import {useEffect, useState} from "react";

export function currentTheme(): "light" | "dark" {
    if (typeof window === "undefined") return "light";
    const saved = (() => {
        try {
            return localStorage.getItem("theme");
        } catch {
            return null;
        }
    })();
    return saved === "light" || saved === "dark" ? saved : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function setDocumentTheme(theme: "light" | "dark") {
    document.documentElement.dataset.theme = theme;
    try {
        localStorage.setItem("theme", theme);
    } catch { /* Optional storage. */
    }
    window.dispatchEvent(new CustomEvent("theme-change", {detail: theme}));
}

export default function ThemeToggle({compact = false}: { compact?: boolean }) {
    const [theme, setTheme] = useState<"light" | "dark" | null>(null);
    useEffect(() => {
        const sync = () => setTheme(currentTheme());
        sync();
        window.addEventListener("theme-change", sync);
        return () => window.removeEventListener("theme-change", sync);
    }, []);
    const nextTheme = theme === "dark" ? "light" : "dark";
    return <button type="button" disabled={!theme} onClick={() => setDocumentTheme(nextTheme)}
                   className={`icon-button ${compact ? "icon-button-compact" : ""}`}
                   aria-label={`Switch to ${nextTheme} mode`}>
        {theme === "dark" ? <Sun aria-hidden/> : <Moon aria-hidden/>}
    </button>;
}
