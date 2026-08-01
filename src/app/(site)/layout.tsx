import { JsonLd } from "@/components/json-ld";
import { BackToTop } from "@/components/site/back-to-top";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { getSettings, siteUrl } from "@/lib/settings";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  const base = siteUrl(settings.siteUrl);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-200 focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>

      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <BackToTop />

      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": `${base}/#website`,
            url: base,
            name: settings.siteName,
            description: settings.description,
            inLanguage: "en",
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `${base}/search?q={search_term_string}`,
              },
              "query-input": "required name=search_term_string",
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": `${base}/#organization`,
            name: settings.siteName,
            url: base,
            ...(settings.logoUrl ? { logo: settings.logoUrl } : {}),
            sameAs: [
              settings.twitterUrl,
              settings.facebookUrl,
              settings.instagramUrl,
              settings.linkedinUrl,
              settings.githubUrl,
              settings.youtubeUrl,
            ].filter(Boolean),
          },
        ]}
      />
    </>
  );
}
