"use client";

import {FormEvent, useCallback, useEffect, useMemo, useState} from "react";
import type {AnalyticsSummary, CollectionRecord, ProjectRecord} from "@/lib/models";

type Tab = "projects" | "collections" | "analytics";
type ProjectForm = {
    slug: string; target: string; title: string; description: string; tags: string;
    permanent: boolean; startDate: string; endDate: string; githubRepo: string; photoSetId: string;
};
type CollectionForm = { id: string; name: string; description: string; tags: string; projects: string[] };

const EMPTY_PROJECT: ProjectForm = {
    slug: "",
    target: "",
    title: "",
    description: "",
    tags: "",
    permanent: false,
    startDate: "",
    endDate: "",
    githubRepo: "",
    photoSetId: ""
};
const EMPTY_COLLECTION: CollectionForm = {id: "", name: "", description: "", tags: "", projects: []};

function readAdminKey() {
    try {
        return sessionStorage.getItem("adminKey") || "";
    } catch {
        return "";
    }
}

function storeAdminKey(value: string) {
    try {
        sessionStorage.setItem("adminKey", value);
    } catch { /* Session storage is optional. */
    }
}

function removeAdminKey() {
    try {
        sessionStorage.removeItem("adminKey");
    } catch { /* Session storage is optional. */
    }
}

async function responseError(response: Response) {
    const payload = await response.json().catch(() => ({})) as { error?: string; details?: unknown };
    return payload.error || `Request failed with status ${response.status}`;
}

function TextField({label, value, onChange, required, type = "text", placeholder, disabled}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    type?: string;
    placeholder?: string;
    disabled?: boolean
}) {
    return <label className="grid gap-1 text-sm font-semibold"><span>{label}{required ? " *" : ""}</span><input
        type={type} required={required} disabled={disabled} value={value}
        onChange={(event) => onChange(event.target.value)} placeholder={placeholder}
        className="rounded-lg border px-3 py-2.5 font-normal disabled:opacity-60"
        style={{backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)"}}/></label>;
}

type ProjectEditorProps = {
    initial: ProjectForm;
    editing: boolean;
    onCancel: () => void;
    onSave: (form: ProjectForm) => Promise<void>;
    busy: boolean
};

function ProjectEditor(props: ProjectEditorProps) {
    return <ProjectEditorState key={props.initial.slug || "new-project"} {...props} />;
}

function ProjectEditorState({initial, editing, onCancel, onSave, busy}: ProjectEditorProps) {
    const [form, setForm] = useState(initial);
    const field = <K extends keyof ProjectForm>(key: K, value: ProjectForm[K]) => setForm((current) => ({
        ...current,
        [key]: value
    }));
    return <form onSubmit={(event) => {
        event.preventDefault();
        void onSave(form);
    }} className="grid gap-4 rounded-xl border p-5"
                 style={{backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)"}}>
        <div><h2 className="text-xl font-bold">{editing ? "Edit project" : "Add project"}</h2><p
            className="text-sm opacity-65">Titles are never fetched from external URLs; an empty title uses the
            slug.</p></div>
        <div className="grid gap-4 md:grid-cols-2"><TextField label="Slug" value={form.slug}
                                                              onChange={(value) => field("slug", value)} required
                                                              disabled={editing} placeholder="project-slug"/><TextField
            label="Target URL" value={form.target} onChange={(value) => field("target", value)} required type="url"
            placeholder="https://…"/></div>
        <TextField label="Title" value={form.title} onChange={(value) => field("title", value)}
                   placeholder="Optional display title"/>
        <label className="grid gap-1 text-sm font-semibold"><span>Description</span><textarea rows={4}
                                                                                              value={form.description}
                                                                                              onChange={(event) => field("description", event.target.value)}
                                                                                              className="rounded-lg border px-3 py-2.5 font-normal"
                                                                                              style={{
                                                                                                  backgroundColor: "var(--input-bg)",
                                                                                                  borderColor: "var(--input-border)"
                                                                                              }}/></label>
        <TextField label="Tags" value={form.tags} onChange={(value) => field("tags", value)}
                   placeholder="bioinformatics, software"/>
        <div className="grid gap-4 md:grid-cols-2"><TextField label="Start date" value={form.startDate}
                                                              onChange={(value) => field("startDate", value)}
                                                              placeholder="YYYY, YYYY-MM, or YYYY-MM-DD"/><TextField
            label="End date" value={form.endDate} onChange={(value) => field("endDate", value)}
            placeholder="YYYY, YYYY-MM, or YYYY-MM-DD"/></div>
        <div className="grid gap-4 md:grid-cols-2"><TextField label="Repository URL" value={form.githubRepo}
                                                              onChange={(value) => field("githubRepo", value)}
                                                              type="url" placeholder="https://github.com/…"/><TextField
            label="Photo set ID" value={form.photoSetId} onChange={(value) => field("photoSetId", value)}
            placeholder="Defaults to the project slug"/></div>
        <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.permanent}
                                                                                onChange={(event) => field("permanent", event.target.checked)}/>Permanent
            redirect (308)</label>
        <p className="text-xs opacity-60">Source: {form.slug.toLowerCase().startsWith("orcid-") ? "ORCID" : "Manual"}</p>
        <div className="flex justify-end gap-2">
            <button type="button" onClick={onCancel} className="rounded-lg border px-4 py-2 font-semibold"
                    style={{borderColor: "var(--card-border)"}}>Cancel
            </button>
            <button disabled={busy} type="submit" className="rounded-lg px-4 py-2 font-semibold disabled:opacity-50"
                    style={{
                        backgroundColor: "var(--button-primary)",
                        color: "var(--on-primary)"
                    }}>{busy ? "Saving…" : "Save project"}</button>
        </div>
    </form>;
}

type CollectionEditorProps = {
    initial: CollectionForm;
    editing: boolean;
    projects: ProjectRecord[];
    onCancel: () => void;
    onSave: (form: CollectionForm) => Promise<void>;
    busy: boolean
};

function CollectionEditor(props: CollectionEditorProps) {
    return <CollectionEditorState key={props.initial.id || "new-collection"} {...props} />;
}

function CollectionEditorState({initial, editing, projects, onCancel, onSave, busy}: CollectionEditorProps) {
    const [form, setForm] = useState(initial);
    const move = (index: number, direction: -1 | 1) => setForm((current) => {
        const next = [...current.projects];
        const target = index + direction;
        if (target < 0 || target >= next.length) return current;
        [next[index], next[target]] = [next[target], next[index]];
        return {...current, projects: next};
    });
    const bySlug = new Map(projects.map((project) => [project.slug, project]));
    const orderedProjects = [
        ...form.projects.map((slug) => bySlug.get(slug)).filter((project): project is ProjectRecord => Boolean(project)),
        ...projects.filter((project) => !form.projects.includes(project.slug)),
    ];
    return <form onSubmit={(event) => {
        event.preventDefault();
        void onSave(form);
    }} className="grid gap-4 rounded-xl border p-5"
                 style={{backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)"}}>
        <div><h2 className="text-xl font-bold">{editing ? "Edit collection" : "Add collection"}</h2><p
            className="text-sm opacity-65">Choose existing projects and arrange their public order.</p></div>
        <div className="grid gap-4 md:grid-cols-2"><TextField label="Collection ID" value={form.id}
                                                              onChange={(id) => setForm((current) => ({
                                                                  ...current,
                                                                  id
                                                              }))} required disabled={editing}/><TextField label="Name"
                                                                                                           value={form.name}
                                                                                                           onChange={(name) => setForm((current) => ({
                                                                                                               ...current,
                                                                                                               name
                                                                                                           }))}
                                                                                                           required/>
        </div>
        <label className="grid gap-1 text-sm font-semibold"><span>Description</span><textarea rows={3}
                                                                                              value={form.description}
                                                                                              onChange={(event) => setForm((current) => ({
                                                                                                  ...current,
                                                                                                  description: event.target.value
                                                                                              }))}
                                                                                              className="rounded-lg border px-3 py-2.5 font-normal"
                                                                                              style={{
                                                                                                  backgroundColor: "var(--input-bg)",
                                                                                                  borderColor: "var(--input-border)"
                                                                                              }}/></label>
        <TextField label="Collection tags" value={form.tags}
                   onChange={(tags) => setForm((current) => ({...current, tags}))} placeholder="group, topic"/>
        <fieldset className="grid gap-2">
            <legend className="text-sm font-semibold">Projects</legend>
            {orderedProjects.map((project) => {
                const selected = form.projects.includes(project.slug);
                return <label key={project.slug} className="flex items-center gap-3 rounded-lg border px-3 py-2"
                              style={{borderColor: "var(--card-border)"}}><input type="checkbox" checked={selected}
                                                                                 onChange={() => setForm((current) => ({
                                                                                     ...current,
                                                                                     projects: selected ? current.projects.filter((slug) => slug !== project.slug) : [...current.projects, project.slug]
                                                                                 }))}/><span
                    className="min-w-0 flex-1 truncate">{project.metadata.title}</span>{selected ?
                    <span className="flex gap-1"><button type="button" aria-label={`Move ${project.metadata.title} up`}
                                                         onClick={() => move(form.projects.indexOf(project.slug), -1)}
                                                         className="rounded border px-2">↑</button><button type="button"
                                                                                                           aria-label={`Move ${project.metadata.title} down`}
                                                                                                           onClick={() => move(form.projects.indexOf(project.slug), 1)}
                                                                                                           className="rounded border px-2">↓</button></span> : null}
                </label>;
            })}</fieldset>
        <div className="flex justify-end gap-2">
            <button type="button" onClick={onCancel} className="rounded-lg border px-4 py-2 font-semibold"
                    style={{borderColor: "var(--card-border)"}}>Cancel
            </button>
            <button disabled={busy} type="submit" className="rounded-lg px-4 py-2 font-semibold disabled:opacity-50"
                    style={{
                        backgroundColor: "var(--button-primary)",
                        color: "var(--on-primary)"
                    }}>{busy ? "Saving…" : "Save collection"}</button>
        </div>
    </form>;
}

export default function AdminPage() {
    const [adminKey, setAdminKey] = useState("");
    const [authenticated, setAuthenticated] = useState(false);
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [tab, setTab] = useState<Tab>("projects");
    const [projects, setProjects] = useState<ProjectRecord[]>([]);
    const [projectChoices, setProjectChoices] = useState<ProjectRecord[]>([]);
    const [collections, setCollections] = useState<CollectionRecord[]>([]);
    const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);
    const [projectForm, setProjectForm] = useState<ProjectForm | null>(null);
    const [collectionForm, setCollectionForm] = useState<CollectionForm | null>(null);
    const [busy, setBusy] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const pageSize = 20;

    const logout = useCallback(() => {
        removeAdminKey();
        setAdminKey("");
        setAuthenticated(false);
        setProjects([]);
        setCollections([]);
        setAnalytics(null);
    }, []);
    const request = useCallback(async (path: string, init?: RequestInit) => {
        const response = await fetch(path, {
            ...init,
            headers: {"Content-Type": "application/json", "x-admin-key": adminKey, ...(init?.headers || {})},
            cache: "no-store"
        });
        if (response.status === 401) logout();
        if (!response.ok) throw new Error(await responseError(response));
        return response;
    }, [adminKey, logout]);
    const loadProjects = useCallback(async (nextOffset = 0) => {
        const response = await request(`/api/links?limit=${pageSize}&offset=${nextOffset}`);
        const payload = await response.json() as { links: ProjectRecord[]; pagination: { total: number } };
        setProjects(payload.links);
        setTotal(payload.pagination.total);
        setOffset(nextOffset);
    }, [request]);
    const loadProjectChoices = useCallback(async () => {
        const collected: ProjectRecord[] = [];
        let nextOffset = 0;
        let hasMore = true;
        while (hasMore) {
            const response = await request(`/api/links?limit=200&offset=${nextOffset}`);
            const payload = await response.json() as { links: ProjectRecord[]; pagination: { hasMore: boolean } };
            collected.push(...payload.links);
            hasMore = payload.pagination.hasMore;
            nextOffset += 200;
        }
        setProjectChoices(collected);
    }, [request]);
    const loadCollections = useCallback(async () => {
        const response = await request("/api/collections");
        setCollections(((await response.json()) as { collections: CollectionRecord[] }).collections);
    }, [request]);

    useEffect(() => {
        const stored = readAdminKey();
        if (!stored) {
            const timeout = window.setTimeout(() => setCheckingAuth(false), 0);
            return () => window.clearTimeout(timeout);
        }
        const controller = new AbortController();
        fetch("/api/auth", {
            headers: {"x-admin-key": stored},
            cache: "no-store",
            signal: controller.signal
        }).then((response) => {
            if (!response.ok) throw new Error("Session expired");
            setAdminKey(stored);
            setAuthenticated(true);
        }).catch((caught) => {
            if (!(caught instanceof DOMException && caught.name === "AbortError")) removeAdminKey();
        }).finally(() => {
            if (!controller.signal.aborted) setCheckingAuth(false);
        });
        return () => controller.abort();
    }, []);
    useEffect(() => {
        if (!authenticated || !adminKey) return;
        const timeout = window.setTimeout(() => {
            Promise.all([loadProjects(0), loadProjectChoices(), loadCollections()]).catch((caught: Error) => setError(caught.message));
        }, 0);
        return () => window.clearTimeout(timeout);
    }, [adminKey, authenticated, loadCollections, loadProjectChoices, loadProjects]);

    const allProjectChoices = useMemo(() => {
        const map = new Map(projectChoices.map((project) => [project.slug, project]));
        return [...map.values()].toSorted((a, b) => a.metadata.title.localeCompare(b.metadata.title));
    }, [projectChoices]);

    const login = async (event: FormEvent) => {
        event.preventDefault();
        setError("");
        setBusy("login");
        try {
            const response = await fetch("/api/auth", {headers: {"x-admin-key": adminKey}, cache: "no-store"});
            if (!response.ok) {
                setError(await responseError(response));
                return;
            }
            storeAdminKey(adminKey);
            setAuthenticated(true);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Unable to sign in");
        } finally {
            setBusy(null);
        }
    };

    const saveProject = async (form: ProjectForm) => {
        const editing = Boolean(projects.find((project) => project.slug === form.slug));
        setBusy(`project:${form.slug || "new"}`);
        setError("");
        setNotice("");
        try {
            await request("/api/links", {
                method: editing ? "PUT" : "POST",
                body: JSON.stringify({...form, tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean)})
            });
            setProjectForm(null);
            setNotice(editing ? "Project updated." : "Project created.");
            await Promise.all([loadProjects(editing ? offset : 0), loadProjectChoices(), loadCollections()]);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Unable to save project");
        } finally {
            setBusy(null);
        }
    };
    const saveCollection = async (form: CollectionForm) => {
        const editing = collections.some((collection) => collection.id === form.id);
        setBusy(`collection:${form.id || "new"}`);
        setError("");
        setNotice("");
        try {
            await request("/api/collections", {
                method: editing ? "PUT" : "POST",
                body: JSON.stringify({...form, tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean)})
            });
            setCollectionForm(null);
            setNotice(editing ? "Collection updated." : "Collection created.");
            await loadCollections();
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Unable to save collection");
        } finally {
            setBusy(null);
        }
    };
    const remove = async (kind: "project" | "collection", id: string) => {
        if (!window.confirm(`Delete ${kind} “${id}”?`)) return;
        setBusy(`${kind}:${id}`);
        setError("");
        setNotice("");
        try {
            await request(kind === "project" ? `/api/links?slug=${encodeURIComponent(id)}` : `/api/collections?id=${encodeURIComponent(id)}`, {method: "DELETE"});
            setNotice(`${kind === "project" ? "Project" : "Collection"} deleted.`);
            await Promise.all([loadProjects(Math.max(0, offset - (projects.length === 1 ? pageSize : 0))), loadProjectChoices(), loadCollections()]);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : `Unable to delete ${kind}`);
        } finally {
            setBusy(null);
        }
    };
    const loadAnalytics = async () => {
        setAnalyticsLoading(true);
        setError("");
        try {
            setAnalytics(await (await request("/api/stats")).json() as AnalyticsSummary);
        } catch (caught) {
            setError(caught instanceof Error ? caught.message : "Unable to load analytics");
        } finally {
            setAnalyticsLoading(false);
        }
    };

    if (checkingAuth) return <main className="grid min-h-screen place-items-center"><p role="status">Checking your
        session…</p></main>;
    if (!authenticated) return <main className="grid min-h-screen place-items-center px-4"
                                     style={{backgroundColor: "var(--background-color)"}}>
        <form onSubmit={login} className="grid w-full max-w-sm gap-4 rounded-xl border p-6 shadow-lg"
              style={{backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)"}}>
            <div><h1 className="text-2xl font-bold">Research admin</h1><p className="text-sm opacity-65">Use the
                deployment’s shared administrator key.</p></div>
            <TextField label="Admin key" value={adminKey} onChange={setAdminKey} required type="password"/>{error ?
            <p role="alert" className="rounded-lg border p-3 text-sm" style={{
                color: "var(--error-text)",
                backgroundColor: "var(--error-bg)",
                borderColor: "var(--error-border)"
            }}>{error}</p> : null}
            <button disabled={busy === "login"} className="rounded-lg px-4 py-2.5 font-bold disabled:opacity-50"
                    style={{
                        backgroundColor: "var(--button-primary)",
                        color: "var(--on-primary)"
                    }}>{busy === "login" ? "Signing in…" : "Sign in"}</button>
        </form>
    </main>;

    return <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8"
                 style={{backgroundColor: "var(--background-color)"}}>
        <div className="mx-auto max-w-6xl space-y-6">
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div><h1 className="text-3xl font-bold">Research admin</h1><p className="opacity-65">Manage the public
                    directory and all-time analytics.</p></div>
                <button onClick={logout} className="rounded-lg border px-4 py-2 font-semibold"
                        style={{borderColor: "var(--card-border)"}}>Sign out
                </button>
            </header>
            <nav aria-label="Admin sections" className="flex gap-2 border-b"
                 style={{borderColor: "var(--card-border)"}}>{(["projects", "collections", "analytics"] as Tab[]).map((value) =>
                <button key={value} onClick={() => {
                    setTab(value);
                    setProjectForm(null);
                    setCollectionForm(null);
                    if (value === "analytics" && !analytics) void loadAnalytics();
                }} aria-current={tab === value ? "page" : undefined}
                        className="border-b-2 px-4 py-3 font-semibold capitalize" style={{
                    borderColor: tab === value ? "var(--primary-color)" : "transparent",
                    color: tab === value ? "var(--primary-color)" : "var(--text-color)"
                }}>{value}</button>)}</nav>
            {error ? <div role="alert" className="rounded-lg border p-3" style={{
                color: "var(--error-text)",
                backgroundColor: "var(--error-bg)",
                borderColor: "var(--error-border)"
            }}>{error}
                <button onClick={() => setError("")} className="ml-3 underline">Dismiss</button>
            </div> : null}
            {notice ? <div role="status" className="rounded-lg border p-3" style={{
                backgroundColor: "var(--primary-soft)",
                borderColor: "var(--primary-color)"
            }}>{notice}</div> : null}

            {tab === "projects" ? <section className="space-y-4">
                {projectForm ? <ProjectEditor initial={projectForm}
                                              editing={projects.some((project) => project.slug === projectForm.slug)}
                                              onCancel={() => setProjectForm(null)} onSave={saveProject}
                                              busy={busy?.startsWith("project:") || false}/> :
                    <button onClick={() => setProjectForm({...EMPTY_PROJECT})}
                            className="rounded-lg px-4 py-2 font-bold"
                            style={{backgroundColor: "var(--button-primary)", color: "var(--on-primary)"}}>Add
                        project</button>}
                <div className="overflow-x-auto rounded-xl border"
                     style={{borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)"}}>
                    <table className="w-full min-w-180 text-left">
                        <thead className="border-b text-sm" style={{borderColor: "var(--card-border)"}}>
                        <tr>
                            <th className="p-4">Project</th>
                            <th className="p-4">Source</th>
                            <th className="p-4">Clicks</th>
                            <th className="p-4">Tags</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody>{projects.map((project) => <tr key={project.slug} className="border-b last:border-0"
                                                              style={{borderColor: "var(--card-border)"}}>
                            <td className="p-4"><p className="font-bold">{project.metadata.title}</p><p
                                className="font-mono text-xs opacity-60">/{project.slug}</p></td>
                            <td className="p-4 capitalize">{project.source}</td>
                            <td className="p-4">{project.clicks}</td>
                            <td className="p-4 text-sm">{project.metadata.tags.join(", ") || "—"}</td>
                            <td className="p-4 text-right">
                                <button onClick={() => setProjectForm({
                                    slug: project.slug,
                                    target: project.target,
                                    title: project.metadata.title,
                                    description: project.metadata.description || "",
                                    tags: project.metadata.tags.join(", "),
                                    permanent: project.metadata.permanent,
                                    startDate: project.metadata.startDate || "",
                                    endDate: project.metadata.endDate || "",
                                    githubRepo: project.metadata.githubRepo || "",
                                    photoSetId: project.metadata.photoSetId || ""
                                })} className="mr-3 font-semibold underline">Edit
                                </button>
                                <button disabled={busy === `project:${project.slug}`}
                                        onClick={() => void remove("project", project.slug)}
                                        className="font-semibold underline disabled:opacity-50"
                                        style={{color: "var(--error-text)"}}>{busy === `project:${project.slug}` ? "Deleting…" : "Delete"}</button>
                            </td>
                        </tr>)}</tbody>
                    </table>
                    {!projects.length ? <p className="p-8 text-center opacity-65">No projects on this page.</p> : null}
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span>{total ? `${offset + 1}–${Math.min(offset + pageSize, total)} of ${total}` : "0 projects"}</span><span
                    className="flex gap-2"><button disabled={offset === 0}
                                                   onClick={() => void loadProjects(Math.max(0, offset - pageSize))}
                                                   className="rounded border px-3 py-2 disabled:opacity-40">Previous</button><button
                    disabled={offset + pageSize >= total} onClick={() => void loadProjects(offset + pageSize)}
                    className="rounded border px-3 py-2 disabled:opacity-40">Next</button></span></div>
            </section> : null}

            {tab === "collections" ? <section className="space-y-4">{collectionForm ?
                <CollectionEditor initial={collectionForm}
                                  editing={collections.some((collection) => collection.id === collectionForm.id)}
                                  projects={allProjectChoices} onCancel={() => setCollectionForm(null)}
                                  onSave={saveCollection} busy={busy?.startsWith("collection:") || false}/> :
                <button onClick={() => setCollectionForm({...EMPTY_COLLECTION})}
                        className="rounded-lg px-4 py-2 font-bold"
                        style={{backgroundColor: "var(--button-primary)", color: "var(--on-primary)"}}>Add
                    collection</button>}
                <div className="grid gap-4">{collections.map((collection) => <article key={collection.id}
                                                                                      className="rounded-xl border p-5"
                                                                                      style={{
                                                                                          backgroundColor: "var(--card-bg)",
                                                                                          borderColor: "var(--card-border)"
                                                                                      }}>
                    <div className="flex items-start justify-between gap-4">
                        <div><h2 className="text-xl font-bold">{collection.name}</h2><p
                            className="opacity-70">{collection.description}</p><p
                            className="mt-2 text-sm">{collection.projects.length} projects
                            · {collection.tags.join(", ") || "no collection tags"}</p></div>
                        <div className="shrink-0">
                            <button onClick={() => setCollectionForm({
                                id: collection.id,
                                name: collection.name,
                                description: collection.description,
                                tags: collection.tags.join(", "),
                                projects: collection.projects
                            })} className="mr-3 font-semibold underline">Edit
                            </button>
                            <button disabled={busy === `collection:${collection.id}`}
                                    onClick={() => void remove("collection", collection.id)}
                                    className="font-semibold underline disabled:opacity-50"
                                    style={{color: "var(--error-text)"}}>Delete
                            </button>
                        </div>
                    </div>
                </article>)}{!collections.length ? <p className="rounded-xl border p-8 text-center opacity-65"
                                                      style={{borderColor: "var(--card-border)"}}>No collections
                    yet.</p> : null}</div>
            </section> : null}

            {tab === "analytics" ? <section className="space-y-5">
                <div className="flex items-center justify-between">
                    <div><h2 className="text-xl font-bold">All-time analytics</h2><p className="text-sm opacity-65">Raw
                        successful redirect counts since each project was created.</p></div>
                    <button onClick={() => void loadAnalytics()}
                            className="rounded-lg border px-4 py-2 font-semibold">Refresh
                    </button>
                </div>
                {analyticsLoading ? <p role="status">Loading analytics…</p> : analytics ? <>
                    <div
                        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["Projects", analytics.totalLinks], ["Clicks", analytics.totalClicks], ["Average clicks", analytics.averageClicks], ["Unique tags", analytics.uniqueTags]].map(([label, value]) =>
                        <div key={String(label)} className="rounded-xl border p-5"
                             style={{backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)"}}><p
                            className="text-sm opacity-65">{label}</p><p className="text-3xl font-bold">{value}</p>
                        </div>)}</div>
                    <div className="grid gap-4 lg:grid-cols-2">
                        <div className="rounded-xl border p-5"
                             style={{backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)"}}><h3
                            className="mb-3 font-bold">Top projects</h3>
                            <ol className="space-y-2">{analytics.topProjects.map((project) => <li key={project.slug}
                                                                                                  className="flex justify-between gap-3">
                                <span className="truncate">{project.title}</span><strong>{project.clicks}</strong>
                            </li>)}</ol>
                        </div>
                        <div className="rounded-xl border p-5"
                             style={{backgroundColor: "var(--card-bg)", borderColor: "var(--card-border)"}}><h3
                            className="mb-3 font-bold">Top tags</h3>
                            <ol className="space-y-2">{analytics.topTags.map((tag) => <li key={tag.tag}
                                                                                          className="flex justify-between gap-3">
                                <span>{tag.tag}</span><strong>{tag.projects}</strong></li>)}</ol>
                        </div>
                    </div>
                </> : <p>No analytics available.</p>}</section> : null}
        </div>
    </main>;
}
