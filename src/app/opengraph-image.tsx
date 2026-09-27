import {ImageResponse} from "next/og";
import {researchHostname} from "@/lib/site";

export const size = {width: 1200, height: 630};
export const contentType = "image/png";

export default function Image() {
    return new ImageResponse(<div style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#fdfbf8",
        color: "#2b2620",
        padding: "72px 84px",
        fontFamily: "sans-serif"
    }}>
        <div style={{display: "flex", color: "#496f61", fontSize: 28, letterSpacing: 3, textTransform: "uppercase"}}>A
            growing body of work
        </div>
        <div style={{display: "flex", flexDirection: "column", gap: 28}}>
            <div style={{display: "flex", fontSize: 76, fontWeight: 700}}>Zeyu Yao · Research</div>
            <div style={{display: "flex", fontSize: 34, color: "#6b6660"}}>Projects, publications, talks, and research
                outputs.
            </div>
        </div>
        <div style={{display: "flex", fontSize: 24, color: "#496f61"}}>{researchHostname}</div>
    </div>, size);
}
