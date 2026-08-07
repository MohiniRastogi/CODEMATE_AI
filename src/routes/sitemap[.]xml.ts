import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { SITE_URL } from "@/lib/seo";
import { LANGUAGE_CONFIGS } from "@/lib/languages";
import { UTILS } from "@/lib/devtools";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

// Last significant content update for these pages.
const CONTENT_LASTMOD = "2026-08-07";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "0.8", lastmod: CONTENT_LASTMOD },
          { path: "/app", changefreq: "weekly", priority: "1.0", lastmod: CONTENT_LASTMOD },
          { path: "/app/program", changefreq: "weekly", priority: "0.9", lastmod: CONTENT_LASTMOD },
          { path: "/app/project", changefreq: "weekly", priority: "0.9", lastmod: CONTENT_LASTMOD },
          { path: "/app/review", changefreq: "weekly", priority: "0.9", lastmod: CONTENT_LASTMOD },
          { path: "/app/convert", changefreq: "weekly", priority: "0.9", lastmod: CONTENT_LASTMOD },
          { path: "/app/notes", changefreq: "weekly", priority: "0.9", lastmod: CONTENT_LASTMOD },
          { path: "/app/interview", changefreq: "weekly", priority: "0.9", lastmod: CONTENT_LASTMOD },
          { path: "/app/utils", changefreq: "monthly", priority: "0.7", lastmod: CONTENT_LASTMOD },
          ...LANGUAGE_CONFIGS.map((l) => ({
            path: `/app/program?language=${l.slug}`,
            changefreq: "monthly" as const,
            priority: "0.8",
            lastmod: CONTENT_LASTMOD,
          })),
          ...UTILS.map((u) => ({
            path: `/app/utils?tool=${u.slug}`,
            changefreq: "monthly" as const,
            priority: "0.6",
            lastmod: CONTENT_LASTMOD,
          })),
          { path: "/app/legal?doc=privacy", changefreq: "yearly", priority: "0.3", lastmod: CONTENT_LASTMOD },
          { path: "/app/legal?doc=terms", changefreq: "yearly", priority: "0.3", lastmod: CONTENT_LASTMOD },
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${SITE_URL}${e.path.replace(/&/g, "&amp;")}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
