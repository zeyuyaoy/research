import type {Metadata} from "next";
import {ArrowLeft, ArrowUpRight, CalendarDays, FlaskConical, Users} from "lucide-react";
import {notFound} from "next/navigation";
import Link from "next/link";
import ArtifactLink from "@/components/ArtifactLink";
import ConferenceCarousel from "@/components/ConferenceCarousel";
import CopyLinkButton from "@/components/CopyLinkButton";
import SiteHeader from "@/components/SiteHeader";
import {effectiveArtifacts, relatedProjects, toProjectSummary} from "@/lib/archive";
import {getPhotoSet} from "@/lib/conferenceSlides";
import {getDirectorySnapshot, getProject} from "@/lib/directory";
import {formatResearchDate, toPublicProject} from "@/lib/models";

export const dynamic = "force-dynamic";

function dateLabel(start: string | null, end: string | null) {
    const startLabel = formatResearchDate(start);
    const endLabel = formatResearchDate(end);
    return startLabel && endLabel && startLabel !== endLabel ? `${startLabel}–${endLabel}` : startLabel || endLabel;
}

export async function generateMetadata({params}: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    try {
        const {slug} = await params;
        const record = await getProject(slug);
        if (!record) return {title: "Project not found"};
        const project = toPublicProject(record);
        const description = project.description || project.longDescription || undefined;
        const canonical = `/projects/${project.slug}`;
        return {
            title: project.title,
            description,
            alternates: {canonical},
            openGraph: {
                title: project.title,
                description,
                url: canonical,
                type: "article",
                images: [`${canonical}/opengraph-image`]
            },
            twitter: {
                card: "summary_large_image",
                title: project.title,
                description,
                images: [`${canonical}/opengraph-image`]
            },
        };
    } catch {
        return {title: "Research project"};
    }
}

export default async function ProjectPage({params}: { params: Promise<{ slug: string }> }) {
    const {slug} = await params;
    let record;
    let snapshot;
    try {
        [record, snapshot] = await Promise.all([getProject(slug), getDirectorySnapshot()]);
    } catch {
        notFound();
    }
    if (!record) notFound();

    const project = toPublicProject(record);
    const summary = toProjectSummary(record);
    const allSummaries = snapshot.projects.map(toProjectSummary);
    const related = relatedProjects(summary, allSummaries);
    const artifacts = effectiveArtifacts(project);
    const photoSet = getPhotoSet(project.photoSetId || project.slug);
    const date = dateLabel(project.startDate, project.endDate);
    const areas = Array.from(new Set([...project.researchAreas, ...project.tags]));
    const methods = [...project.methods, ...project.technologies];

    return <div className="site-shell">
        <div className="site-container">
            <SiteHeader projects={allSummaries}/>
            <main className="project-detail">
                <Link href="/" className="back-link"><ArrowLeft aria-hidden/>All research</Link>
                <header className="detail-hero">
                    <div className="detail-kicker">Research project</div>
                    <h1>{project.title}</h1>
                    {project.description ? <p className="detail-lede">{project.description}</p> : null}
                    <div className="detail-meta">
                        {date ? <span><CalendarDays aria-hidden/>{date}</span> : null}
                        {project.organizations.map((organization) => <span
                            key={organization.name}>{organization.name}</span>)}
                        <span
                            className="source-label">{project.source === "orcid" ? "ORCID record" : "Archive record"}</span>
                    </div>
                    {areas.length ? <div className="tag-row detail-tags">{areas.map((tag) => <a key={tag}
                                                                                                href={`/?tag=${encodeURIComponent(tag)}`}>{tag}</a>)}</div> : null}
                    <div className="detail-actions">
                        <a href={project.target} target="_blank" rel="noopener noreferrer" className="primary-button">Open
                            primary link <ArrowUpRight aria-hidden/><span
                                className="sr-only"> (opens in a new tab)</span></a>
                        <CopyLinkButton path={`/projects/${project.slug}`}/>
                    </div>
                </header>

                <div className="detail-layout">
                    <div className="detail-main">
                        {project.longDescription ? <section><h2>About this research</h2>
                            <div className="prose-copy">{project.longDescription.split("\n").map((line, index) => line ?
                                <p key={index}>{line}</p> : null)}</div>
                        </section> : null}
                        {photoSet?.slides.length ?
                            <section><h2>Project gallery</h2><ConferenceCarousel slides={photoSet.slides}
                                                                                 caption={photoSet.title}/>
                            </section> : null}
                        {artifacts.length ? <section><h2>Research outputs</h2>
                            <div className="artifact-grid">{artifacts.map((artifact) => <ArtifactLink
                                key={`${artifact.type}:${artifact.title}:${artifact.url}`} artifact={artifact}/>)}</div>
                        </section> : null}
                        {project.collaborators.length ? <section><h2>Collaborators</h2>
                            <div className="people-list">{project.collaborators.map((person) => <div key={person.name}>
                                <Users aria-hidden/><p><strong>{person.name}</strong>{person.role ?
                                <span>{person.role}</span> : null}</p>{person.url ?
                                <a href={person.url} target="_blank" rel="noopener noreferrer">Profile <ArrowUpRight
                                    aria-hidden/></a> : null}</div>)}</div>
                        </section> : null}
                    </div>
                    <aside className="detail-aside" aria-label="Project facts">
                        {areas.length ? <section><h2>Research areas</h2>
                            <ul>{areas.map((area) => <li key={area}><a
                                href={`/?tag=${encodeURIComponent(area)}`}>{area}</a></li>)}</ul>
                        </section> : null}
                        {methods.length ? <section><h2><FlaskConical aria-hidden/>Methods &amp; technologies</h2>
                            <ul>{methods.map((method) => <li key={method}>{method}</li>)}</ul>
                        </section> : null}
                        {project.organizations.length ? <section><h2>Organizations</h2>
                            <ul>{project.organizations.map((organization) => <li
                                key={organization.name}>{organization.url ? <a href={organization.url} target="_blank"
                                                                               rel="noopener noreferrer">{organization.name}</a> : organization.name}{organization.role ?
                                <small>{organization.role}</small> : null}</li>)}</ul>
                        </section> : null}
                    </aside>
                </div>

                {related.length ? <section className="related-research">
                    <div><p className="section-kicker">Continue exploring</p><h2>Related research</h2></div>
                    <div className="related-grid">{related.map((item) => <a key={item.slug}
                                                                            href={item.detailUrl}><span>{item.researchAreas.filter((area) => areas.some((value) => value.toLowerCase() === area.toLowerCase())).slice(0, 2).join(" · ")}</span><strong>{item.title}</strong>
                        <p>{item.description}</p><em>View project <ArrowUpRight aria-hidden/></em></a>)}</div>
                </section> : null}
            </main>
        </div>
    </div>;
}
