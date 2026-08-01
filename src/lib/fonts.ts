/**
 * Fonts are chosen at runtime from Admin → Settings, so they cannot go through
 * `next/font` (which resolves at build time). Instead the chosen families are
 * requested from Google Fonts and swapped into the same CSS variables the rest
 * of the design system already reads.
 *
 * Only names on this list are ever put into a stylesheet URL — the value comes
 * from the database, and an allow-list keeps that from becoming an injection
 * point.
 */

export const HEADING_FONTS = [
  "Plus Jakarta Sans",
  "Inter",
  "Manrope",
  "Space Grotesk",
  "Outfit",
  "DM Sans",
  "Sora",
  "Bricolage Grotesque",
  "Fraunces",
  "Playfair Display",
  "Instrument Serif",
  "Libre Baskerville",
] as const;

export const BODY_FONTS = [
  "Source Serif 4",
  "Lora",
  "Merriweather",
  "Crimson Pro",
  "Newsreader",
  "EB Garamond",
  "Inter",
  "DM Sans",
  "Karla",
  "Work Sans",
  "Nunito Sans",
  "IBM Plex Sans",
] as const;

const SERIF_FAMILIES = new Set([
  "Source Serif 4",
  "Lora",
  "Merriweather",
  "Crimson Pro",
  "Newsreader",
  "EB Garamond",
  "Fraunces",
  "Playfair Display",
  "Instrument Serif",
  "Libre Baskerville",
]);

const ALLOWED = new Set<string>([...HEADING_FONTS, ...BODY_FONTS]);

export function isAllowedFont(name: string | null | undefined): name is string {
  return typeof name === "string" && ALLOWED.has(name);
}

function stack(family: string) {
  const fallback = SERIF_FAMILIES.has(family)
    ? "ui-serif, Georgia, serif"
    : "ui-sans-serif, system-ui, sans-serif";
  return `"${family}", ${fallback}`;
}

/** A single Google Fonts stylesheet URL covering both chosen families. */
export function googleFontsHref(families: string[]) {
  const unique = [...new Set(families.filter(isAllowedFont))];
  if (unique.length === 0) return null;

  const params = unique
    .map(
      (family) =>
        `family=${encodeURIComponent(family).replace(/%20/g, "+")}:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400`,
    )
    .join("&");

  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

export type TypographySettings = {
  fontHeading: string;
  fontBody: string;
  headingWeight: number;
  headingTracking: string;
  bodyFontSize: number;
  bodyLineHeight: number;
  h1Size: number;
  h2Size: number;
  h3Size: number;
  h4Size: number;
};

/** Overrides the design-system variables the stylesheet already consumes. */
export function typographyCss(settings: TypographySettings) {
  const heading = isAllowedFont(settings.fontHeading)
    ? stack(settings.fontHeading)
    : null;
  const body = isAllowedFont(settings.fontBody) ? stack(settings.fontBody) : null;

  const rules = [
    heading ? `--font-sans:${heading};` : "",
    body ? `--font-serif:${body};` : "",
    `--heading-weight:${settings.headingWeight};`,
    `--heading-tracking:${settings.headingTracking};`,
    `--article-size:${settings.bodyFontSize}rem;`,
    `--article-leading:${settings.bodyLineHeight};`,
    `--h1-size:${settings.h1Size}rem;`,
    `--h2-size:${settings.h2Size}rem;`,
    `--h3-size:${settings.h3Size}rem;`,
    `--h4-size:${settings.h4Size}rem;`,
  ].join("");

  return `:root{${rules}}`;
}
