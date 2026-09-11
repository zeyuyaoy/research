"use client";

export default function TagDirectory({allTags, selectedTag, onTagSelect}: {
    allTags: string[];
    selectedTag: string | null;
    onTagSelect: (tag: string | null) => void
}) {
    const uniqueTags = Array.from(new Set(allTags)).sort((a, b) => a.localeCompare(b));
    return (
        <div className="mb-6" role="group" aria-label="Filter by tag">
            <div className="flex flex-wrap gap-2">
                {[null, ...uniqueTags].map((tag) => {
                    const selected = selectedTag === tag;
                    return <button key={tag || "all"} type="button" aria-pressed={selected}
                                   onClick={() => onTagSelect(selected && tag ? null : tag)}
                                   className="rounded-full px-3 py-1.5 text-sm font-semibold transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2"
                                   style={{
                                       backgroundColor: selected ? "var(--primary-color)" : "var(--input-bg)",
                                       color: selected ? "var(--on-primary)" : "var(--primary-color)",
                                       border: "1px solid var(--input-border)"
                                   }}>{tag || "All tags"}</button>;
                })}
            </div>
        </div>
    );
}
