import {ImageResponse} from "next/og";
import {getProject} from "@/lib/directory";
import {projectDescription, researchHostname} from "@/lib/site";

export const size = {width: 1200, height: 630};
export const contentType = "image/png";
export const alt = "Research project by Peter";

export default async function Image({params}: { params: Promise<{ slug: string }> }) {
    const {slug} = await params;
    let project = null;
    try {
        project = await getProject(slug);
    } catch {
    }
    const title = project?.metadata.title || "Research project";
    const description = projectDescription(
        project?.metadata || {title, description: null, longDescription: null},
    );
    return new ImageResponse(
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                background: "#fdfbf8",
                color: "#2b2620",
                padding: "72px 84px",
                fontFamily: "sans-serif",
            }}
        >
            <div
                style={{
                    display: "flex",
                    color: "#496f61",
                    fontSize: 28,
                    letterSpacing: 3,
                    textTransform: "uppercase",
                }}
            >
                Research archive
            </div>
            <div style={{display: "flex", flexDirection: "column", gap: 28}}>
                <div
                    style={{
                        display: "block",
                        fontSize: 56,
                        fontWeight: 700,
                        maxWidth: 1040,
                        lineHeight: 1.08,
                        lineClamp: 3,
                    }}
                >
                    {title}
                </div>
                <div
                    style={{
                        display: "block",
                        fontSize: 30,
                        color: "#6b6660",
                        maxWidth: 900,
                        lineHeight: 1.4,
                        lineClamp: 3,
                    }}
                >
                    {description}
                </div>
            </div>
            <div style={{display: "flex", fontSize: 24, color: "#496f61"}}>{researchHostname}</div>
        </div>,
        size,
    );
}
