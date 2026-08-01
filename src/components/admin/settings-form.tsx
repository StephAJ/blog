"use client";

import { AlertCircle, Check, Save } from "lucide-react";
import { useActionState } from "react";

import { saveSettings } from "@/app/admin/actions/settings";
import type { ActionState } from "@/app/admin/actions/posts";
import type { Settings } from "@/db/schema";

import { ImagePicker } from "./image-picker";
import { SubmitButton } from "./submit-button";
import { Card, Field, Toggle, inputClass } from "./ui";

const SECTIONS = [
  { id: "identity", label: "Site identity" },
  { id: "about", label: "About box" },
  { id: "social", label: "Social links" },
  { id: "seo", label: "SEO" },
  { id: "analytics", label: "Analytics" },
  { id: "adsense", label: "AdSense" },
  { id: "engagement", label: "Homepage & engagement" },
];

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveSettings, {});

  const value = (key: keyof Settings) => (settings[key] as string | null) ?? "";

  return (
    <form action={formAction} className="grid gap-6 xl:grid-cols-[14rem_1fr]">
      <nav aria-label="Settings sections" className="hidden xl:block">
        <ul className="sticky top-6 space-y-0.5">
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="block rounded-lg px-3 py-2 text-sm font-semibold text-body transition hover:surface-subtle hover:text-accent"
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="min-w-0 space-y-6">
        {/* ------------------------------------------------- Identity */}
        <Card title="Site identity" className="scroll-mt-6" >
          <div id="identity" className="grid gap-4 sm:grid-cols-2">
            <Field label="Site name" htmlFor="siteName" required>
              <input
                id="siteName"
                name="siteName"
                defaultValue={settings.siteName}
                required
                className={inputClass}
              />
            </Field>

            <Field label="Tagline" htmlFor="tagline" hint="Shown in the header strip.">
              <input
                id="tagline"
                name="tagline"
                defaultValue={settings.tagline}
                className={inputClass}
              />
            </Field>

            <Field
              label="Description"
              htmlFor="description"
              hint="Default meta description for the homepage and feeds."
              className="sm:col-span-2"
            >
              <textarea
                id="description"
                name="description"
                defaultValue={settings.description}
                rows={2}
                maxLength={320}
                className={`${inputClass} resize-y`}
              />
            </Field>

            <Field
              label="Site URL"
              htmlFor="siteUrl"
              hint="Used for canonical URLs, sitemap and RSS."
            >
              <input
                id="siteUrl"
                name="siteUrl"
                type="url"
                defaultValue={settings.siteUrl}
                className={inputClass}
              />
            </Field>

            <Field
              label="Posts per page"
              htmlFor="postsPerPage"
              hint="Between 3 and 48."
            >
              <input
                id="postsPerPage"
                name="postsPerPage"
                type="number"
                min={3}
                max={48}
                defaultValue={settings.postsPerPage}
                className={inputClass}
              />
            </Field>

            <Field label="Copyright line" htmlFor="copyright">
              <input
                id="copyright"
                name="copyright"
                defaultValue={value("copyright")}
                className={inputClass}
              />
            </Field>

            <Field label="Footer note" htmlFor="footerNote">
              <input
                id="footerNote"
                name="footerNote"
                defaultValue={value("footerNote")}
                className={inputClass}
              />
            </Field>

            <ImagePicker name="logoUrl" defaultValue={value("logoUrl")} label="Logo" />
            <ImagePicker
              name="defaultOgImage"
              defaultValue={value("defaultOgImage")}
              label="Default social image"
            />

            <Field
              label="Favicon URL"
              htmlFor="faviconUrl"
              hint="Leave blank to use the built-in mark."
              className="sm:col-span-2"
            >
              <input
                id="faviconUrl"
                name="faviconUrl"
                defaultValue={value("faviconUrl")}
                className={inputClass}
              />
            </Field>
          </div>
        </Card>

        {/* ---------------------------------------------------- About */}
        <Card title="About box" description="Appears at the top of the sidebar.">
          <div id="about" className="grid gap-4 scroll-mt-6 sm:grid-cols-2">
            <Field label="Heading" htmlFor="aboutHeading">
              <input
                id="aboutHeading"
                name="aboutHeading"
                defaultValue={settings.aboutHeading}
                className={inputClass}
              />
            </Field>

            <ImagePicker
              name="aboutImage"
              defaultValue={value("aboutImage")}
              label="Portrait"
            />

            <Field
              label="Text"
              htmlFor="aboutText"
              hint="Leave blank to hide the box entirely."
              className="sm:col-span-2"
            >
              <textarea
                id="aboutText"
                name="aboutText"
                defaultValue={value("aboutText")}
                rows={3}
                maxLength={600}
                className={`${inputClass} resize-y`}
              />
            </Field>
          </div>
        </Card>

        {/* --------------------------------------------------- Social */}
        <Card title="Social links" description="Blank fields are hidden from the site.">
          <div id="social" className="grid gap-4 scroll-mt-6 sm:grid-cols-2">
            {[
              ["twitterUrl", "X / Twitter URL"],
              ["twitterHandle", "X handle (e.g. @you)"],
              ["instagramUrl", "Instagram URL"],
              ["facebookUrl", "Facebook URL"],
              ["linkedinUrl", "LinkedIn URL"],
              ["githubUrl", "GitHub URL"],
              ["youtubeUrl", "YouTube URL"],
              ["contactEmail", "Contact email"],
            ].map(([key, label]) => (
              <Field key={key} label={label} htmlFor={key}>
                <input
                  id={key}
                  name={key}
                  defaultValue={value(key as keyof Settings)}
                  className={inputClass}
                />
              </Field>
            ))}
          </div>
        </Card>

        {/* ------------------------------------------------------ SEO */}
        <Card title="SEO">
          <div id="seo" className="grid gap-4 scroll-mt-6 sm:grid-cols-2">
            <Field
              label="Title template"
              htmlFor="metaTitleTemplate"
              hint="%s is the page title, %site% is the site name."
              className="sm:col-span-2"
            >
              <input
                id="metaTitleTemplate"
                name="metaTitleTemplate"
                defaultValue={settings.metaTitleTemplate}
                className={`${inputClass} font-mono text-xs`}
              />
            </Field>

            <Field
              label="Google Search Console token"
              htmlFor="googleSiteVerification"
              hint="The content value of the verification meta tag."
            >
              <input
                id="googleSiteVerification"
                name="googleSiteVerification"
                defaultValue={value("googleSiteVerification")}
                className={inputClass}
              />
            </Field>

            <Field label="Bing verification token" htmlFor="bingSiteVerification">
              <input
                id="bingSiteVerification"
                name="bingSiteVerification"
                defaultValue={value("bingSiteVerification")}
                className={inputClass}
              />
            </Field>

            <Field
              label="Extra robots.txt rules"
              htmlFor="robotsExtra"
              hint="Appended verbatim to the generated robots.txt."
              className="sm:col-span-2"
            >
              <textarea
                id="robotsExtra"
                name="robotsExtra"
                defaultValue={value("robotsExtra")}
                rows={3}
                className={`${inputClass} resize-y font-mono text-xs`}
              />
            </Field>
          </div>
        </Card>

        {/* ------------------------------------------------ Analytics */}
        <Card
          title="Analytics"
          description="Scripts load in production only, so local development stays clean."
        >
          <div id="analytics" className="grid gap-4 scroll-mt-6 sm:grid-cols-2">
            <Field
              label="GA4 measurement ID"
              htmlFor="gaMeasurementId"
              hint="Looks like G-XXXXXXXXXX."
            >
              <input
                id="gaMeasurementId"
                name="gaMeasurementId"
                defaultValue={value("gaMeasurementId")}
                placeholder="G-XXXXXXXXXX"
                className={inputClass}
              />
            </Field>

            <Field
              label="Google Tag Manager ID"
              htmlFor="gtmContainerId"
              hint="Looks like GTM-XXXXXXX."
            >
              <input
                id="gtmContainerId"
                name="gtmContainerId"
                defaultValue={value("gtmContainerId")}
                placeholder="GTM-XXXXXXX"
                className={inputClass}
              />
            </Field>

            <Field
              label="Plausible domain"
              htmlFor="plausibleDomain"
              hint="e.g. blog.stephenarthur.org"
            >
              <input
                id="plausibleDomain"
                name="plausibleDomain"
                defaultValue={value("plausibleDomain")}
                className={inputClass}
              />
            </Field>

            <Field label="Umami website ID" htmlFor="umamiWebsiteId">
              <input
                id="umamiWebsiteId"
                name="umamiWebsiteId"
                defaultValue={value("umamiWebsiteId")}
                className={inputClass}
              />
            </Field>

            <Field
              label="Umami script URL"
              htmlFor="umamiScriptUrl"
              hint="Only needed when self-hosting Umami."
              className="sm:col-span-2"
            >
              <input
                id="umamiScriptUrl"
                name="umamiScriptUrl"
                defaultValue={value("umamiScriptUrl")}
                className={inputClass}
              />
            </Field>
          </div>
        </Card>

        {/* -------------------------------------------------- AdSense */}
        <Card
          title="Google AdSense"
          description="Ad units render only when AdSense is on, a client ID exists and the slot has an ID."
        >
          <div id="adsense" className="space-y-4 scroll-mt-6">
            <Toggle
              name="adsenseEnabled"
              label="Enable AdSense"
              hint="Turns on the loader script and every filled slot."
              defaultChecked={settings.adsenseEnabled}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Publisher ID"
                htmlFor="adsenseClientId"
                hint="Looks like ca-pub-0000000000000000."
                className="sm:col-span-2"
              >
                <input
                  id="adsenseClientId"
                  name="adsenseClientId"
                  defaultValue={value("adsenseClientId")}
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                  className={inputClass}
                />
              </Field>

              <Field label="Header slot ID" htmlFor="adSlotHeader">
                <input
                  id="adSlotHeader"
                  name="adSlotHeader"
                  defaultValue={value("adSlotHeader")}
                  className={inputClass}
                />
              </Field>
              <Field label="In-article slot ID" htmlFor="adSlotInArticle">
                <input
                  id="adSlotInArticle"
                  name="adSlotInArticle"
                  defaultValue={value("adSlotInArticle")}
                  className={inputClass}
                />
              </Field>
              <Field label="Sidebar slot ID" htmlFor="adSlotSidebar">
                <input
                  id="adSlotSidebar"
                  name="adSlotSidebar"
                  defaultValue={value("adSlotSidebar")}
                  className={inputClass}
                />
              </Field>
              <Field label="Footer slot ID" htmlFor="adSlotFooter">
                <input
                  id="adSlotFooter"
                  name="adSlotFooter"
                  defaultValue={value("adSlotFooter")}
                  className={inputClass}
                />
              </Field>
            </div>

            <Toggle
              name="adsenseAutoAds"
              label="Also run Auto ads"
              hint="Lets Google place extra units automatically. Can hurt layout."
              defaultChecked={settings.adsenseAutoAds}
            />

            <Field
              label="ads.txt contents"
              htmlFor="adsTxt"
              hint="Served at /ads.txt. Paste the line AdSense gives you."
            >
              <textarea
                id="adsTxt"
                name="adsTxt"
                defaultValue={value("adsTxt")}
                rows={3}
                className={`${inputClass} resize-y font-mono text-xs`}
              />
            </Field>
          </div>
        </Card>

        {/* ----------------------------------------------- Engagement */}
        <Card title="Homepage & engagement">
          <div id="engagement" className="space-y-3 scroll-mt-6">
            <Toggle
              name="trendingEnabled"
              label="Show the trending strip"
              hint="The ranked bar of most-read posts across the top of the feed."
              defaultChecked={settings.trendingEnabled}
            />
            <Toggle
              name="commentsEnabled"
              label="Enable comments"
              hint="Turn off to hide the form and existing comments site-wide."
              defaultChecked={settings.commentsEnabled}
            />
            <Toggle
              name="commentsAutoApprove"
              label="Publish comments immediately"
              hint="Leave off to moderate everything first — recommended."
              defaultChecked={settings.commentsAutoApprove}
            />
            <Toggle
              name="newsletterEnabled"
              label="Show newsletter signup"
              hint="Collects emails into the Subscribers table."
              defaultChecked={settings.newsletterEnabled}
            />
          </div>
        </Card>

        <div className="sticky bottom-4 flex items-center gap-3 rounded-xl border hairline surface px-4 py-3 shadow-lift">
          <SubmitButton icon={<Save size={15} />}>Save settings</SubmitButton>

          {state.error && (
            <p className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle size={15} /> {state.error}
            </p>
          )}
          {state.message && !state.error && (
            <p className="flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
              <Check size={15} /> {state.message}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
