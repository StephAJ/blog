import { getSettings } from "@/lib/settings";

import { AdUnit } from "./ad-unit";

export type AdPlacement = "header" | "inArticle" | "sidebar" | "footer";

const SLOT_KEY = {
  header: "adSlotHeader",
  inArticle: "adSlotInArticle",
  sidebar: "adSlotSidebar",
  footer: "adSlotFooter",
} as const;

const FORMAT = {
  header: { format: "horizontal", minHeight: 90 },
  inArticle: { format: "fluid", minHeight: 250 },
  sidebar: { format: "rectangle", minHeight: 250 },
  footer: { format: "horizontal", minHeight: 90 },
} as const;

/**
 * Renders a Google AdSense unit if — and only if — AdSense is switched on and
 * a slot ID exists for this placement. Reserves height either way so enabling
 * ads later does not shift layout (CLS).
 */
export async function AdSlot({
  placement,
  className,
  label = true,
}: {
  placement: AdPlacement;
  className?: string;
  label?: boolean;
}) {
  const settings = await getSettings();
  const slot = settings[SLOT_KEY[placement]];

  if (!settings.adsenseEnabled || !settings.adsenseClientId || !slot) return null;

  const { format, minHeight } = FORMAT[placement];

  return (
    <aside
      className={className}
      aria-label="Advertisement"
      style={{ minHeight }}
    >
      {label && (
        <p className="eyebrow mb-2 text-center text-faint">Advertisement</p>
      )}
      <AdUnit client={settings.adsenseClientId} slot={slot} format={format} />
    </aside>
  );
}
