export const UTILS = [
  { slug: "json-formatter", name: "JSON Formatter" },
  { slug: "json-validator", name: "JSON Validator" },
  { slug: "uuid-generator", name: "UUID Generator" },
  { slug: "hash-generator", name: "Hash Generator" },
  { slug: "base64-encoder", name: "Base64 Encoder" },
  { slug: "gradient-generator", name: "Gradient Generator" },
  { slug: "color-picker", name: "Color Picker" },
  { slug: "password-generator", name: "Password Generator" },
] as const;

export type UtilSlug = (typeof UTILS)[number]["slug"];

export function resolveUtil(input?: string | null) {
  return UTILS.find((u) => u.slug === input) ?? UTILS[0];
}
