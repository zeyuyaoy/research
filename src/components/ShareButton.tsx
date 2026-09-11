"use client";

import {Check, Copy, ExternalLink, Share2} from "lucide-react";
import {useEffect, useId, useRef, useState} from "react";
import {createPortal} from "react-dom";

export default function ShareButton({title, shortUrl}: { title: string; shortUrl: string }) {
    const id = useId();
    const menuId = `${id}-share-menu`;
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [position, setPosition] = useState({top: 0, right: 8});
    const triggerRef = useRef<HTMLButtonElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const close = (restoreFocus = false) => {
        setOpen(false);
        if (restoreFocus) window.setTimeout(() => triggerRef.current?.focus(), 0);
    };

    const fullUrl = () => `${window.location.origin}${shortUrl}`;
    const openExternal = (url: string) => {
        window.open(url, "_blank", "noopener,noreferrer");
        close(true);
    };

    useEffect(() => {
        const closeOther = (event: Event) => {
            if ((event as CustomEvent<string>).detail !== id) setOpen(false);
        };
        window.addEventListener("research-share-open", closeOther);
        return () => window.removeEventListener("research-share-open", closeOther);
    }, [id]);

    useEffect(() => {
        if (!open) return;
        const updatePosition = () => {
            const rect = triggerRef.current?.getBoundingClientRect();
            if (rect) setPosition({top: rect.bottom + 8, right: Math.max(8, window.innerWidth - rect.right)});
        };
        const onPointer = (event: PointerEvent) => {
            const target = event.target as Node;
            if (!triggerRef.current?.contains(target) && !menuRef.current?.contains(target)) close();
        };
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") close(true);
        };
        updatePosition();
        document.addEventListener("pointerdown", onPointer);
        document.addEventListener("keydown", onKey);
        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition, true);
        window.setTimeout(() => menuRef.current?.querySelector<HTMLButtonElement>("button")?.focus(), 0);
        return () => {
            document.removeEventListener("pointerdown", onPointer);
            document.removeEventListener("keydown", onKey);
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition, true);
        };
    }, [open]);

    const menu = open ? <div ref={menuRef} id={menuId} role="menu" aria-label={`Share ${title}`}
                             className="fixed z-[100] min-w-44 rounded-lg border p-2 shadow-xl" style={{
        top: position.top,
        right: position.right,
        backgroundColor: "var(--card-bg)",
        borderColor: "var(--card-border)"
    }}>
        <button role="menuitem" type="button" onClick={async () => {
            try {
                await navigator.clipboard.writeText(fullUrl());
                setMessage("Link copied");
            } catch {
                setMessage("Unable to copy link");
            }
        }}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2">{message === "Link copied" ?
            <Check aria-hidden className="h-4 w-4"/> : <Copy aria-hidden className="h-4 w-4"/>}Copy link
        </button>
        <div className="my-1 border-t" style={{borderColor: "var(--card-border)"}}/>
        <button role="menuitem" type="button"
                onClick={() => openExternal(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out “${title}”: ${fullUrl()}`)}`)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2">
            <ExternalLink aria-hidden className="h-4 w-4"/>Share on X
        </button>
        <button role="menuitem" type="button"
                onClick={() => openExternal(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl())}`)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2">
            <ExternalLink aria-hidden className="h-4 w-4"/>Share on LinkedIn
        </button>
    </div> : null;

    return <div className="shrink-0">
        <button ref={triggerRef} type="button" aria-label={`Share ${title}`} aria-haspopup="menu" aria-controls={menuId}
                aria-expanded={open} onClick={() => {
            const next = !open;
            setOpen(next);
            setMessage("");
            if (next) window.dispatchEvent(new CustomEvent("research-share-open", {detail: id}));
        }}
                className="rounded-full p-2 opacity-70 hover:bg-black/5 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2">
            <Share2 aria-hidden className="h-4 w-4"/></button>
        <span className="sr-only" aria-live="polite">{message}</span>
        {menu && typeof document !== "undefined" ? createPortal(menu, document.body) : null}
    </div>;
}
