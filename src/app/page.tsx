import {after} from "next/server";
import SearchableProjects from "@/components/SearchableProjects";
import {parseArchiveState, toProjectSummary} from "@/lib/archive";
import {getPhotoSet} from "@/lib/conferenceSlides";
import {getDirectorySnapshot} from "@/lib/directory";
import {getOrcidWorks} from "@/lib/orcid";
import {getRedisUrl} from "@/lib/redis";
import type {CollectionView, ProjectView} from "@/lib/views";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

function toUrlSearchParams(input: SearchParams) {
    const params = new URLSearchParams();
    Object.entries(input).forEach(([key, value]) => {
        if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
        else if (value !== undefined) params.set(key, value);
    });
    return params;
}

export default async function Home({searchParams}: { searchParams: Promise<SearchParams> }) {
    let projects: ProjectView[] = [];
    let collections: CollectionView[] = [];
    let availability: "ready" | "unconfigured" | "unavailable" = getRedisUrl() ? "ready" : "unconfigured";

    if (availability === "ready") {
        try {
            const snapshot = await getDirectorySnapshot();
            projects = snapshot.projects.map((project) => ({
                ...toProjectSummary(project),
                photoSet: getPhotoSet(project.metadata.photoSetId || project.slug),
            }));
            collections = snapshot.collections.map((collection) => ({
                ...collection,
                photoSet: getPhotoSet(collection.id)
            }));

            const orcidId = process.env.ORCID_ID;
            if (orcidId) after(async () => {
                await getOrcidWorks(orcidId);
            });
        } catch (error) {
            console.error("Unable to load the research directory:", error instanceof Error ? error.message : "unknown error");
            availability = "unavailable";
        }
    }

    const initialState = parseArchiveState(toUrlSearchParams(await searchParams));
    return (
        <div className="site-shell">
            <div className="site-container">
                <SearchableProjects initialLinks={projects} initialCollections={collections}
                                    availability={availability} initialState={initialState}/>
            </div>
        </div>
    );
}
