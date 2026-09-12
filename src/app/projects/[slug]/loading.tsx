export default function LoadingProject() {
    return <div className="site-shell">
        <div className="site-container loading-shell" aria-label="Loading research project" aria-busy="true">
            <div className="skeleton skeleton-header"/>
            <div className="skeleton skeleton-title"/>
            <div className="skeleton skeleton-card"/>
        </div>
    </div>;
}
