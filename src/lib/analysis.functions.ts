import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";

import { articleInputSchema, comparisonInputSchema } from "./analysis.schema";
import { analyzeArticleText, compareArticles } from "./analysis.server";
import { fetchArticleFromUrl } from "./article-fetch.server";

export const analyzeArticle = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => articleInputSchema.parse(data))
  .handler(async ({ data }) => analyzeArticleText(data, getRequest().signal));

export const compareCoverage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => comparisonInputSchema.parse(data))
  .handler(async ({ data }) => compareArticles(data, getRequest().signal));

export const fetchArticle = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ url: z.string().trim().min(8).max(2000) }).parse(data))
  .handler(async ({ data }) => fetchArticleFromUrl(data.url));
