/**
 * Derives a full brand scale (and a readable accent-text tone for each theme)
 * from a single hex the user picks in Admin → Settings.
 *
 * The accent-text tones are searched rather than hard-coded so that whatever
 * colour is chosen still clears WCAG AA against the page background. Picking a
 * pale yellow should not silently produce unreadable links.
 */

type Rgb = { r: number; g: number; b: number };

const LIGHT_BG: Rgb = { r: 253, g: 252, b: 250 };
const DARK_BG: Rgb = { r: 16, g: 15, b: 14 };
const MIN_CONTRAST = 4.5;

export function parseHex(hex: string): Rgb | null {
  const clean = hex.trim().replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function toHex({ r, g, b }: Rgb) {
  const part = (c: number) =>
    Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, "0");
  return `#${part(r)}${part(g)}${part(b)}`;
}

function mix(color: Rgb, target: Rgb, amount: number): Rgb {
  return {
    r: color.r + (target.r - color.r) * amount,
    g: color.g + (target.g - color.g) * amount,
    b: color.b + (target.b - color.b) * amount,
  };
}

function relativeLuminance({ r, g, b }: Rgb) {
  const channel = (value: number) => {
    const v = value / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: Rgb, b: Rgb) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const WHITE: Rgb = { r: 255, g: 255, b: 255 };
const BLACK: Rgb = { r: 0, g: 0, b: 0 };

/** Walks toward black (or white) until the tone is readable on `bg`. */
function readableOn(base: Rgb, bg: Rgb, towards: Rgb) {
  for (let step = 0; step <= 20; step++) {
    const candidate = mix(base, towards, step * 0.05);
    if (contrastRatio(candidate, bg) >= MIN_CONTRAST) return candidate;
  }
  return towards;
}

/** The scale steps, expressed as a mix toward white (negative) or black. */
const STOPS: [number, number][] = [
  [50, -0.94],
  [100, -0.86],
  [200, -0.72],
  [300, -0.5],
  [400, -0.26],
  [500, -0.1],
  [600, 0],
  [700, 0.18],
  [800, 0.32],
  [900, 0.45],
  [950, 0.72],
];

export type ThemeVars = {
  scale: Record<string, string>;
  accentLight: string;
  accentDark: string;
  /** Readable foreground for text sitting on a solid brand-600 fill. */
  onBrand: string;
};

export function buildTheme(hex: string): ThemeVars {
  const base = parseHex(hex) ?? { r: 207, g: 66, b: 39 };

  const scale: Record<string, string> = {};
  for (const [stop, amount] of STOPS) {
    const colour =
      amount < 0 ? mix(base, WHITE, -amount) : mix(base, BLACK, amount);
    scale[String(stop)] = toHex(colour);
  }

  return {
    scale,
    accentLight: toHex(readableOn(base, LIGHT_BG, BLACK)),
    accentDark: toHex(readableOn(base, DARK_BG, WHITE)),
    onBrand:
      contrastRatio(base, WHITE) >= contrastRatio(base, BLACK)
        ? "#ffffff"
        : "#1a1917",
  };
}

/** Inline CSS that overrides the compiled Tailwind brand tokens at runtime. */
export function themeCss(hex: string) {
  const theme = buildTheme(hex);
  const scaleVars = Object.entries(theme.scale)
    .map(([stop, value]) => `--color-brand-${stop}:${value};`)
    .join("");

  return `:root{${scaleVars}--accent-text:${theme.accentLight};--on-brand:${theme.onBrand};}.dark{--accent-text:${theme.accentDark};}`;
}
