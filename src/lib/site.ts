export const site = {
    url: "https://research.zeyuyaoy.com",
    portfolioUrl: "https://zeyuyaoy.com",
    githubUrl: "https://github.com/zeyuyaoy",
    resumeUrl: "https://zeyuyaoy.com/resume",
    description: "Research by Zeyu Yao (Peter): computational biology projects, publications, talks, and research outputs.",
} as const;

export const researchHostname = new URL(site.url).hostname;

export const researchJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${site.url}/#research`,
    url: site.url,
    name: "Research | Zeyu Yao",
    description: site.description,
    isPartOf: {"@type": "WebSite", "@id": `${site.portfolioUrl}/#website`, url: site.portfolioUrl, name: "Zeyu Yao"},
    author: {"@type": "Person", name: "Zeyu Yao", alternateName: "Peter", url: site.portfolioUrl},
};
