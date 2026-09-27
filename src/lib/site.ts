import type { ProjectMetadata } from "./models";

export const site = {
  name: "Peter's workshed",
  url: "https://research.zeyuyaoy.com",
  portfolioUrl: "https://zeyuyaoy.com",
  githubUrl: "https://github.com/zeyuyaoy",
  resumeUrl: "https://zeyuyaoy.com/resume",
  description:
    "I'm Peter. This is where I share my research projects, publications, and talks. Browse by topic and explore the work behind them.",
} as const;

export const socialImage = {
  url: "/og-image.jpg",
  width: 2160,
  height: 1215,
  alt: "Peter giving a research presentation",
};

export function projectDescription(
  project: Pick<ProjectMetadata, "title" | "description" | "longDescription">,
) {
  const description = (
    [project.description, project.longDescription].find((value) => value?.trim()) ||
    `Explore ${project.title}, a research project by Peter.`
  )
    .replace(/\s+/g, " ")
    .trim();
  const characters = Array.from(description);
  if (characters.length <= 180) {
    return description;
  }
  const preview = characters.slice(0, 179).join("");
  const wordBoundary = preview.lastIndexOf(" ");
  return `${wordBoundary > 0 ? preview.slice(0, wordBoundary) : preview}…`;
}

export const researchJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "@id": `${site.url}/#research`,
  url: site.url,
  name: site.name,
  description: site.description,
  isPartOf: {
    "@type": "WebSite",
    "@id": `${site.portfolioUrl}/#website`,
    url: site.portfolioUrl,
    name: "Zeyu Yao",
  },
  author: { "@type": "Person", name: "Zeyu Yao", alternateName: "Peter", url: site.portfolioUrl },
};
