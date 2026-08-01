/**
 * Splits rendered article HTML so an ad (or any block) can sit mid-article
 * rather than only above and below it. Splits after the Nth top-level
 * paragraph; returns a single chunk when the article is too short to bother.
 */
export function splitForMidRoll(html: string, afterParagraph = 3) {
  const matches = [...html.matchAll(/<\/p>/gi)];
  if (matches.length < afterParagraph + 3) return [html] as const;

  const target = matches[afterParagraph - 1];
  const index = (target.index ?? 0) + target[0].length;
  return [html.slice(0, index), html.slice(index)] as const;
}
