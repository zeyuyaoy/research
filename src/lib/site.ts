export const site = {
    url: "https://research.zeyuyaoy.com",
    portfolioUrl: "https://zeyuyaoy.com",
    githubUrl: "https://github.com/zeyuyaoy",
    resumeUrl: "https://zeyuyaoy.com/resume",
} as const;

export const researchHostname = new URL(site.url).hostname;
