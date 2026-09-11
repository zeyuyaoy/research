import SearchableProjects from "@/components/SearchableProjects";
import {getPhotoSet, type PhotoSet} from "@/lib/conferenceSlides";
import {getDirectorySnapshot} from "@/lib/directory";
import {type CollectionRecord, type PublicProject, toPublicProject} from "@/lib/models";
import {getOrcidWorks} from "@/lib/orcid";
import {getRedisUrl} from "@/lib/redis";

export const dynamic = "force-dynamic";

export type ProjectView = PublicProject & { photoSet?: PhotoSet };
export type CollectionView = CollectionRecord & { photoSet?: PhotoSet };

export default async function Home() {
    let projects: ProjectView[] = [];
    let collections: CollectionView[] = [];
    let availability: "ready" | "unconfigured" | "unavailable" = getRedisUrl() ? "ready" : "unconfigured";

    if (availability === "ready") {
        try {
            const [{projects: storedProjects, collections: storedCollections}, orcidProjects] = await Promise.all([
                getDirectorySnapshot({fresh: true}),
                getOrcidWorks(process.env.ORCID_ID || ""),
            ]);
            const bySlug = new Map([...storedProjects, ...orcidProjects].map((project) => [project.slug, project]));
            projects = [...bySlug.values()].map((project) => ({
                ...toPublicProject(project),
                photoSet: getPhotoSet(project.metadata.photoSetId || project.slug)
            }));
            collections = storedCollections.map((collection) => ({
                ...collection,
                photoSet: getPhotoSet(collection.id)
            }));
        } catch (error) {
            console.error("Unable to load the research directory:", error instanceof Error ? error.message : "unknown error");
            availability = "unavailable";
        }
    }

    return (
        <main className="min-h-screen flex justify-center" style={{backgroundColor: "var(--background-color)"}}>
            <div className="max-w-4xl w-full mx-auto px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
                <SearchableProjects initialLinks={projects} initialCollections={collections}
                                    availability={availability}/>
            </div>
        </main>
    );
}
