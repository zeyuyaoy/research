import {ImageResponse} from "next/og";
import {getProject} from "@/lib/directory";

export const size = {width: 1200, height: 630};
export const contentType = "image/png";

export default async function Image({params}: { params: Promise<{ slug: string }> }) {
    const {slug} = await params;
    let project = null;
    try {
        project = await getProject(slug);
    } catch { /* Render a stable fallback. */
    }
    const title = project?.metadata.title || "Research project";
    const description = project?.metadata.description || "Peter's research archive";
    return new ImageResponse(<div style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#f7f5ef",
        color: "#17211d",
        padding: "72px 84px",
        fontFamily: "sans-serif"
    }}>
        <div style={{
            display: "flex",
            color: "#47705f",
            fontSize: 28,
            letterSpacing: 3,
            textTransform: "uppercase"
        }}>Research archive
        </div>
        <div style={{display: "flex", flexDirection: "column", gap: 28}}>
            <div
                style={{display: "flex", fontSize: 70, fontWeight: 700, maxWidth: 1040, lineHeight: 1.08}}>{title}</div>
            <div style={{
                display: "flex",
                fontSize: 30,
                color: "#5d665f",
                maxWidth: 900,
                lineHeight: 1.4
            }}>{description}</div>
        </div>
        <div style={{display: "flex", fontSize: 24, color: "#47705f"}}>research.cytronicoder.com</div>
    </div>, size);
}
