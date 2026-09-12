export default function Loading() {
    return <div className="site-shell">
        <div className="site-container loading-shell" aria-label="Loading research archive" aria-busy="true">
            <div className="skeleton skeleton-header"/>
            <div className="skeleton skeleton-search"/>
            {[0, 1, 2].map((item) => <div className="skeleton skeleton-card" key={item}/>)}</div>
    </div>;
}
