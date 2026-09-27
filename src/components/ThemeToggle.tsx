"use client";

import { useSyncExternalStore } from "react";
import { appearanceStore } from "@/lib/theme-store";

export default function ThemeToggle() {
  const value = useSyncExternalStore(
    appearanceStore.subscribe,
    appearanceStore.getSnapshot,
    appearanceStore.getServerSnapshot,
  );
  const dark = value.resolvedMode === "dark";
  return (
    <button
      type="button"
      className="icon-button theme-toggle"
      aria-label={`Switch to ${dark ? "light" : "dark"} mode`}
      aria-pressed={dark}
      title={`Switch to ${dark ? "light" : "dark"} mode`}
      onClick={appearanceStore.toggle}
    >
      <span aria-hidden>{dark ? "🌙" : "☀️"}</span>
    </button>
  );
}
