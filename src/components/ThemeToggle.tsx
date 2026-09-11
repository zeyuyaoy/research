"use client";

import {Moon, Sun} from "lucide-react";
import {useEffect, useState} from "react";

export default function ThemeToggle() {
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        let saved: string | null = null;
        try {
            saved = localStorage.getItem("theme");
        } catch { /* Local storage is optional */
        }

        const initial = saved === "light" || saved === "dark" ? saved : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        const timeout = window.setTimeout(() => {
            setTheme(initial);
            document.documentElement.dataset.theme = initial;
            setMounted(true);
        }, 0);

        return () => window.clearTimeout(timeout);
    }, []);

    const nextTheme = theme === "light" ? "dark" : "light";
    return <button type="button" disabled={!mounted} onClick={() => {
        setTheme(nextTheme);
        try {
            localStorage.setItem("theme", nextTheme);
        } catch { /* Local storage is optional */
        }

        window.dispatchEvent(new CustomEvent("theme-change", {detail: nextTheme}));
        document.documentElement.dataset.theme = nextTheme;
    }}
                   className="rounded-lg border p-3 transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 disabled:opacity-70"
                   style={{backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)"}}
                   aria-label={`Switch to ${nextTheme} mode`}>
        {theme === "light" ? <Moon aria-hidden className="h-5 w-5"/> : <Sun aria-hidden className="h-5 w-5"/>}
    </button>;
}
