import { existsSync, readFileSync } from "node:fs";
import { basename } from "node:path";
import { execFileSync } from "node:child_process";

const blogDirectory = "src/content/blog";
const webhookEnvName = "SLACK_WEBHOOK_URL";

loadEnvFile(".env");
loadEnvFile(".env.local");

const webhookUrl = process.env[webhookEnvName];
const siteUrl = process.env.SITE_URL ?? process.env.PUBLIC_SITE_URL ?? "https://pozool.com";

if (!webhookUrl) {
    console.log(`${webhookEnvName} is not set. Skipping Slack notification.`);
    process.exit(0);
}

const newPostPaths = getNewBlogPostPaths();

if (newPostPaths.length === 0) {
    console.log("No newly created blog posts found. Skipping Slack notification.");
    process.exit(0);
}

for (const postPath of newPostPaths) {
    const post = readBlogPost(postPath);

    if (post.draft) {
        console.log(`Skipping draft blog post: ${postPath}`);
        continue;
    }

    await sendSlackNotification(post);
    console.log(`Posted Slack notification for blog post: ${post.title}`);
}

function loadEnvFile(filePath) {
    if (!existsSync(filePath)) {
        return;
    }

    const lines = readFileSync(filePath, "utf8").split(/\r?\n/);

    for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
            continue;
        }

        const [key, ...valueParts] = trimmed.split("=");

        if (process.env[key]) {
            continue;
        }

        process.env[key] = stripQuotes(valueParts.join("="));
    }
}

function stripQuotes(value) {
    const trimmed = value.trim();
    const quote = trimmed[0];

    if ((quote === "\"" || quote === "'") && trimmed.at(-1) === quote) {
        return trimmed.slice(1, -1);
    }

    return trimmed;
}

function getNewBlogPostPaths() {
    const diffRanges = [
        process.env.BLOG_NOTIFY_GIT_RANGE,
        process.env.VERCEL_GIT_PREVIOUS_SHA && process.env.VERCEL_GIT_COMMIT_SHA
            ? `${process.env.VERCEL_GIT_PREVIOUS_SHA}..${process.env.VERCEL_GIT_COMMIT_SHA}`
            : undefined,
        "HEAD^..HEAD",
    ].filter(Boolean);

    for (const range of diffRanges) {
        const paths = getAddedMarkdownPaths(...range.split(" "));

        if (paths.length > 0) {
            return paths;
        }
    }

    return getAddedMarkdownPaths("--root", "HEAD");
}

function getAddedMarkdownPaths(...rangeArgs) {
    try {
        const args = [
            "diff",
            "--diff-filter=A",
            "--name-only",
            ...rangeArgs,
            "--",
            `${blogDirectory}/*.md`,
        ];
        const output = execFileSync("git", args, { encoding: "utf8" });

        return output
            .split(/\r?\n/)
            .map((path) => path.trim())
            .filter(Boolean);
    } catch {
        return [];
    }
}

function readBlogPost(postPath) {
    const rawPost = readFileSync(postPath, "utf8");
    const frontmatter = parseFrontmatter(rawPost);
    const slug = basename(postPath, ".md");
    const title = frontmatter.title ?? slug;
    const url = `${siteUrl.replace(/\/$/, "")}/blog/${slug}`;

    return {
        date: frontmatter.date,
        draft: frontmatter.draft === "true",
        excerpt: frontmatter.excerpt,
        lang: frontmatter.lang,
        slug,
        title,
        url,
    };
}

function parseFrontmatter(rawPost) {
    const match = rawPost.match(/^---\r?\n([\s\S]*?)\r?\n---/);

    if (!match) {
        return {};
    }

    return Object.fromEntries(
        match[1]
            .split(/\r?\n/)
            .map((line) => line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/))
            .filter(Boolean)
            .map((match) => [match[1], stripQuotes(match[2])]),
    );
}

async function sendSlackNotification(post) {
    const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            text: `New blog post published: ${post.title}`,
            blocks: [
                {
                    type: "header",
                    text: {
                        type: "plain_text",
                        text: "New blog post published",
                        emoji: true,
                    },
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*<${post.url}|${post.title}>*${formatMeta(post)}`,
                    },
                },
                ...(post.excerpt
                    ? [
                          {
                              type: "section",
                              text: {
                                  type: "mrkdwn",
                                  text: post.excerpt,
                              },
                          },
                      ]
                    : []),
            ],
        }),
    });

    if (!response.ok) {
        throw new Error(
            `Slack webhook request failed with ${response.status}: ${await response.text()}`,
        );
    }
}

function formatMeta(post) {
    const details = [post.date, post.lang?.toUpperCase()].filter(Boolean);

    return details.length > 0 ? `\n${details.join(" | ")}` : "";
}
