import {ImageResponse} from "next/og";

export const size = {width: 1200, height: 630};
export const contentType = "image/png";

export default function Image() {
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
        <div style={{display: "flex", color: "#47705f", fontSize: 28, letterSpacing: 3, textTransform: "uppercase"}}>A
            growing body of work
        </div>
        <div style={{display: "flex", flexDirection: "column", gap: 28}}>
            <div style={{display: "flex", fontSize: 76, fontWeight: 700}}>Peter&#39;s Research Projects</div>
            <div style={{display: "flex", fontSize: 34, color: "#5d665f"}}>Projects, publications, talks, and research
                outputs.
            </div>
        </div>
        <div style={{display: "flex", fontSize: 24, color: "#47705f"}}>research.cytronicoder.com</div>
    </div>, size);
}
