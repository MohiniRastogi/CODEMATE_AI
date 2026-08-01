export const UTIL_CATEGORIES = ["Formatters", "Generators", "Converters"] as const;
export type UtilCategory = (typeof UTIL_CATEGORIES)[number];

export const UTILS = [
  { slug: "json-formatter", name: "JSON Formatter", category: "Formatters" },
  { slug: "json-validator", name: "JSON Validator", category: "Formatters" },
  { slug: "uuid-generator", name: "UUID Generator", category: "Generators" },
  { slug: "hash-generator", name: "Hash Generator", category: "Converters" },
  { slug: "base64-encoder", name: "Base64 Encoder", category: "Converters" },
  { slug: "gradient-generator", name: "Gradient Generator", category: "Generators" },
  { slug: "color-picker", name: "Color Picker", category: "Converters" },
  { slug: "password-generator", name: "Password Generator", category: "Generators" },
] as const;

export type UtilSlug = (typeof UTILS)[number]["slug"];

export function resolveUtil(input?: string | null) {
  return UTILS.find((u) => u.slug === input) ?? UTILS[0];
}
