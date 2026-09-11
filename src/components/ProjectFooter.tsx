export default function ProjectFooter({totalProjects}: { totalProjects: number }) {
    return (
        <footer className="mt-10 border-t pt-8 text-center" style={{borderColor: "var(--card-border)"}}>
            <p className="text-sm opacity-70">
                {totalProjects > 0 ? `${totalProjects} project${totalProjects === 1 ? "" : "s"} available. ` : ""}
                Visit my <a href="https://cytronicoder.com/resume" target="_blank" rel="noopener noreferrer"
                            className="font-semibold hover:underline"
                            style={{color: "var(--primary-color)"}}>resume</a> to see all my work.
            </p>
            <p className="mt-2 text-sm opacity-70">
                Find more on <a href="https://github.com/cytronicoder" target="_blank" rel="noopener noreferrer"
                                className="font-semibold hover:underline"
                                style={{color: "var(--primary-color)"}}>GitHub</a> and my <a
                href="https://cytronicoder.com" target="_blank" rel="noopener noreferrer"
                className="font-semibold hover:underline" style={{color: "var(--primary-color)"}}>portfolio</a>.
            </p>
        </footer>
    );
}
