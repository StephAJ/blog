import Script from "next/script";

import { getSettings } from "@/lib/settings";

export async function AdSenseScript() {
  const settings = await getSettings();

  if (!settings.adsenseEnabled || !settings.adsenseClientId) return null;
  if (process.env.NODE_ENV !== "production") return null;

  return (
    <>
      <Script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${settings.adsenseClientId}`}
        crossOrigin="anonymous"
        strategy="afterInteractive"
      />
      {settings.adsenseAutoAds && (
        <Script id="adsense-auto" strategy="afterInteractive">
          {`(adsbygoogle = window.adsbygoogle || []).push({ google_ad_client: "${settings.adsenseClientId}", enable_page_level_ads: true });`}
        </Script>
      )}
    </>
  );
}
