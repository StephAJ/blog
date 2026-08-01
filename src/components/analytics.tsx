import Script from "next/script";

import { getSettings } from "@/lib/settings";

/**
 * Renders whichever analytics providers are configured in Admin → Settings.
 * Nothing is loaded until an ID is filled in, so a fresh install ships zero
 * third-party scripts.
 */
export async function Analytics() {
  const settings = await getSettings();
  const isProd = process.env.NODE_ENV === "production";

  return (
    <>
      {settings.gtmContainerId && isProd && (
        <>
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${settings.gtmContainerId}');`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${settings.gtmContainerId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        </>
      )}

      {settings.gaMeasurementId && isProd && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${settings.gaMeasurementId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${settings.gaMeasurementId}', { anonymize_ip: true });`}
          </Script>
        </>
      )}

      {settings.plausibleDomain && isProd && (
        <Script
          defer
          data-domain={settings.plausibleDomain}
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      )}

      {settings.umamiWebsiteId && isProd && (
        <Script
          defer
          data-website-id={settings.umamiWebsiteId}
          src={settings.umamiScriptUrl ?? "https://cloud.umami.is/script.js"}
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
