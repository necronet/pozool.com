import type { APIRoute } from "astro";
import { rssResponse } from "../../lib/blogRss";

export const GET: APIRoute = ({ site }) => rssResponse(site, "es");
