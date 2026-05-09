import type { APIRoute } from "astro";
import { isBlogLanguage, rssResponse } from "../../lib/blogRss";

export const GET: APIRoute = ({ site, url }) => {
    const requestedLang = url.searchParams.get("lang");
    const langFilter = isBlogLanguage(requestedLang) ? requestedLang : null;

    return rssResponse(site, langFilter);
};
