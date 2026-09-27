import {ArrowLeft, ArrowUpRight} from "lucide-react";
import {site} from "@/lib/site";
import AppearanceSettings from "./AppearanceSettings";

export default function SiteFooter() {
    return (
        <footer className="site-footer">
            <a className="footer-home" href={site.portfolioUrl}>
                <ArrowLeft aria-hidden/>
                Back to Peter&apos;s portfolio
            </a>
            <nav aria-label="More from Peter">
                <a href={site.resumeUrl}>
                    Resume
                    <ArrowUpRight aria-hidden/>
                </a>
                <a href={site.githubUrl} target="_blank" rel="noopener noreferrer">
                    GitHub
                    <ArrowUpRight aria-hidden/>
                    <span className="sr-only"> (opens in a new tab)</span>
                </a>
            </nav>
            <AppearanceSettings/>
        </footer>
    );
}
