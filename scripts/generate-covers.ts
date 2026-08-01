/**
 * Generates the demo cover images into public/uploads/demo.
 *
 * The demo used to point at picsum.photos, which meant every cover depended on
 * the server being able to reach the public internet at render time. Producing
 * them locally removes that dependency entirely.
 *
 * Run via `npm run db:seed` (which calls this first), or on its own:
 *   npx tsx scripts/generate-covers.ts
 */
import fs from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const OUT_DIR = path.resolve(process.cwd(), "public/uploads/demo");
const WIDTH = 1600;
const HEIGHT = 900;

function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function shift(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex);
  const move = (c: number) =>
    Math.round(amount < 0 ? c * (1 + amount) : c + (255 - c) * amount);
  return `rgb(${move(r)}, ${move(g)}, ${move(b)})`;
}

/** Deterministic pseudo-random in [0,1) so a given slug always looks the same. */
function seeded(slug: string) {
  let hash = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    hash ^= slug.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  let state = hash >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function coverSvg(slug: string, color: string) {
  const rand = seeded(slug);
  const angle = Math.round(rand() * 90);
  const dark = shift(color, -0.55);
  const mid = shift(color, -0.15);
  const light = shift(color, 0.25);

  const blobs = Array.from({ length: 4 }, () => {
    const cx = Math.round(rand() * WIDTH);
    const cy = Math.round(rand() * HEIGHT);
    const r = Math.round(180 + rand() * 340);
    const opacity = (0.12 + rand() * 0.2).toFixed(3);
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${light}" opacity="${opacity}" />`;
  }).join("");

  // A couple of large translucent slabs give the composition some structure
  // instead of leaving it a flat wash.
  const slabs = Array.from({ length: 2 }, () => {
    const x = Math.round(rand() * WIDTH * 0.8);
    const w = Math.round(WIDTH * (0.18 + rand() * 0.3));
    const skew = Math.round(-260 + rand() * 520);
    const opacity = (0.08 + rand() * 0.12).toFixed(3);
    return `<polygon points="${x},0 ${x + w},0 ${x + w + skew},${HEIGHT} ${x + skew},${HEIGHT}" fill="${light}" opacity="${opacity}" />`;
  }).join("");

  const bars = Array.from({ length: 3 }, () => {
    const x = Math.round(rand() * WIDTH);
    const w = Math.round(2 + rand() * 5);
    const opacity = (0.1 + rand() * 0.14).toFixed(3);
    return `<rect x="${x}" y="0" width="${w}" height="${HEIGHT}" fill="#fff" opacity="${opacity}" />`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="g" gradientTransform="rotate(${angle})">
      <stop offset="0%" stop-color="${mid}" />
      <stop offset="100%" stop-color="${dark}" />
    </linearGradient>
    <radialGradient id="glow" cx="30%" cy="25%" r="75%">
      <stop offset="0%" stop-color="${light}" stop-opacity="0.55" />
      <stop offset="100%" stop-color="${dark}" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#g)" />
  <g>${blobs}</g>
  <g>${slabs}</g>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)" />
  <g>${bars}</g>
</svg>`;
}

export type GeneratedCover = {
  url: string;
  filename: string;
  width: number;
  height: number;
  size: number;
};

export async function generateCovers(
  posts: { slug: string; color: string }[],
): Promise<Map<string, GeneratedCover>> {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const covers = new Map<string, GeneratedCover>();

  for (const { slug, color } of posts) {
    const filename = `${slug}.webp`;
    const file = path.join(OUT_DIR, filename);
    const info = await sharp(Buffer.from(coverSvg(slug, color)))
      .webp({ quality: 84 })
      .toFile(file);

    covers.set(slug, {
      url: `/uploads/demo/${filename}`,
      filename,
      width: info.width,
      height: info.height,
      size: info.size,
    });
  }

  return covers;
}

// Allow running standalone for a quick regeneration.
if (process.argv[1]?.endsWith("generate-covers.ts")) {
  const { demoPosts, demoCategories } = await import("./demo-content");
  const colorFor = new Map(demoCategories.map((c) => [c.name, c.color]));
  await generateCovers(
    demoPosts.map((p) => ({
      slug: p.slug,
      color: colorFor.get(p.category) ?? "#cf4227",
    })),
  );
  console.log(`✓ ${demoPosts.length} covers written to public/uploads/demo`);
}
