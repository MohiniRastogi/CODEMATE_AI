export const SITE_URL = "https://codemateai.devorbitx.site";

/** Absolute canonical URL for a path (must start with "/"). */
export function canonicalUrl(path: string): string {
  return `${SITE_URL}${path}`;
}
