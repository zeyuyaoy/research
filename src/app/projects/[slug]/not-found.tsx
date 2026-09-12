import Link from "next/link";

export default function ProjectNotFound() {
    return <div className="site-shell">
        <main className="site-container">
            <div className="empty-state" style={{margin: "18vh auto", maxWidth: 620}}>
                <p className="section-kicker">Research archive</p><h1>Project not found</h1>
                <p>This project may have moved or may only be available through its original short link.</p>
                <Link href="/" className="primary-button">Browse all research</Link>
            </div>
        </main>
    </div>;
}
