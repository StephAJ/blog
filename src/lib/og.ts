/** Builds the URL of the generated social card for pages without their own image. */
export function ogImageUrl(
  base: string,
  options: { title: string; label?: string; meta?: string; color?: string },
) {
  const params = new URLSearchParams({ title: options.title });
  if (options.label) params.set("label", options.label);
  if (options.meta) params.set("meta", options.meta);
  if (options.color) params.set("color", options.color);
  return `${base}/api/og?${params.toString()}`;
}
