import type { APIRoute } from "astro";

type BlogLanguage = "en" | "es";
type BlogFrontmatter = {
    title: string;
    date: string;
    lang: BlogLanguage;
    excerpt: string;
    draft?: boolean;
};
type BlogPost = {
    slug: string;
    frontmatter: BlogFrontmatter;
};

const escapeXml = (value: string) =>
    value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;");

const formatRssDate = (date: string) => new Date(date).toUTCString();

export const GET: APIRoute = ({ site }) => {
    const siteUrl = site ?? new URL("https://pozool.com");
    const postModules = import.meta.glob<{ frontmatter: BlogFrontmatter }>(
        "../../content/blog/*.md",
        {
            eager: true,
        },
    );

    const posts: BlogPost[] = Object.entries(postModules)
        .map(([path, post]) => ({
            slug: path.split("/").pop()?.replace(/\.md$/, "") ?? "",
            frontmatter: post.frontmatter,
        }))
        .filter((post) => post.slug && !post.frontmatter.draft)
        .sort(
            (a, b) =>
                new Date(b.frontmatter.date).getTime() -
                new Date(a.frontmatter.date).getTime(),
        );

    const feedUrl = new URL("/blog/rss.xml", siteUrl).toString();
    const blogUrl = new URL("/blog", siteUrl).toString();
    const lastBuildDate = posts[0]?.frontmatter.date
        ? formatRssDate(posts[0].frontmatter.date)
        : new Date().toUTCString();

    const items = posts
        .map((post) => {
            const postUrl = new URL(`/blog/${post.slug}`, siteUrl).toString();
            const { title, date, excerpt, lang } = post.frontmatter;

            return `
        <item>
            <title>${escapeXml(title)}</title>
            <link>${postUrl}</link>
            <guid isPermaLink="true">${postUrl}</guid>
            <description>${escapeXml(excerpt)}</description>
            <pubDate>${formatRssDate(date)}</pubDate>
            <category>${escapeXml(lang)}</category>
        </item>`;
        })
        .join("");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>Pozool Blog</title>
        <link>${blogUrl}</link>
        <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
        <description>Updates from the team building hospitality-first property management software.</description>
        <language>en</language>
        <lastBuildDate>${lastBuildDate}</lastBuildDate>${items}
    </channel>
</rss>`;

    return new Response(xml, {
        headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
        },
    });
};
