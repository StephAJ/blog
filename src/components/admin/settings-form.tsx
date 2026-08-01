"use client";

import { AlertCircle, Check, Save } from "lucide-react";
import { useActionState, useState } from "react";

import { saveSettings } from "@/app/admin/actions/settings";
import type { ActionState } from "@/app/admin/actions/posts";
import type { Settings } from "@/db/schema";
import { BODY_FONTS, HEADING_FONTS } from "@/lib/fonts";
import { buildTheme } from "@/lib/theme";

import { ImagePicker } from "./image-picker";
import { SubmitButton } from "./submit-button";
import { Card, Field, Toggle, inputClass } from "./ui";

const SECTIONS = [
  { id: "identity", label: "Site identity" },
  { id: "appearance", label: "Theme & colour" },
  { id: "typography", label: "Typography" },
  { id: "about", label: "About box" },
  { id: "social", label: "Social links" },
  { id: "seo", label: "SEO" },
  { id: "analytics", label: "Analytics" },
  { id: "adsense", label: "AdSense" },
  { id: "email", label: "Email & SMTP" },
  { id: "engagement", label: "Homepage & engagement" },
];

const PRESET_COLOURS = [
  "#cf4227", "#2563eb", "#0f766e", "#7c3aed",
  "#db2777", "#16a34a", "#ea580c", "#0891b2",
];

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveSettings, {});
  const [brandColor, setBrandColor] = useState(settings.brandColor);

  const value = (key: keyof Settings) => (settings[key] as string | null) ?? "";
  const theme = buildTheme(brandColor);

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

        {/* ----------------------------------------------- Appearance */}
        <Card
          title="Theme & colour"
          description="One colour drives buttons, links, badges and accents across the whole site."
        >
          <div id="appearance" className="scroll-mt-6 space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="color"
                name="brandColor"
                value={brandColor}
                onChange={(event) => setBrandColor(event.target.value)}
                aria-label="Theme colour"
                className="size-12 shrink-0 cursor-pointer rounded-lg border hairline bg-transparent"
              />
              <input
                value={brandColor}
                onChange={(event) => setBrandColor(event.target.value)}
                aria-label="Theme colour hex"
                className={`${inputClass} w-32 font-mono text-xs uppercase`}
              />
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLOURS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setBrandColor(preset)}
                    aria-label={`Use ${preset}`}
                    style={{ backgroundColor: preset }}
                    data-active={brandColor.toLowerCase() === preset}
                    className="size-7 rounded-full ring-offset-2 ring-offset-[var(--surface-card)] transition hover:scale-110 data-[active=true]:ring-2"
                  />
                ))}
              </div>
            </div>

            <div className="rounded-lg border hairline p-4">
              <p className="eyebrow mb-3 text-faint">Live preview</p>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold"
                  style={{ backgroundColor: theme.scale["600"], color: theme.onBrand }}
                >
                  Primary button
                </span>
                <span
                  className="rounded-full px-2.5 py-1 text-[0.6875rem] font-bold tracking-[0.14em] uppercase"
                  style={{
                    backgroundColor: theme.scale["100"],
                    color: theme.accentLight,
                  }}
                >
                  Category
                </span>
                <span
                  className="text-sm font-semibold underline"
                  style={{ color: theme.accentLight }}
                >
                  A link in light mode
                </span>
                <span
                  className="rounded-lg px-3 py-1.5 text-sm font-semibold"
                  style={{ backgroundColor: "#100f0e", color: theme.accentDark }}
                >
                  A link in dark mode
                </span>
              </div>
              <p className="mt-3 text-xs text-faint">
                Link tones are darkened or lightened automatically so they stay
                readable on both backgrounds, whatever colour you pick.
              </p>
            </div>

            <div className="flex flex-wrap gap-1">
              {Object.entries(theme.scale).map(([stop, hex]) => (
                <span key={stop} className="text-center">
                  <span
                    className="block size-9 rounded-md border hairline"
                    style={{ backgroundColor: hex }}
                    title={`brand-${stop} ${hex}`}
                  />
                  <span className="mt-1 block text-[0.625rem] text-faint">{stop}</span>
                </span>
              ))}
            </div>
          </div>
        </Card>

        {/* ----------------------------------------------- Typography */}
        <Card
          title="Typography"
          description="Applies to every post and page. Sizes are in rem — 1rem is 16px."
        >
          <div id="typography" className="grid gap-4 scroll-mt-6 sm:grid-cols-2">
            <Field
              label="Heading font"
              htmlFor="fontHeading"
              hint="Used for the site name, headings and UI."
            >
              <select
                id="fontHeading"
                name="fontHeading"
                defaultValue={settings.fontHeading}
                className={inputClass}
              >
                {HEADING_FONTS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Body font"
              htmlFor="fontBody"
              hint="Used for article text."
            >
              <select
                id="fontBody"
                name="fontBody"
                defaultValue={settings.fontBody}
                className={inputClass}
              >
                {BODY_FONTS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Heading weight" htmlFor="headingWeight">
              <select
                id="headingWeight"
                name="headingWeight"
                defaultValue={settings.headingWeight}
                className={inputClass}
              >
                {[400, 500, 600, 700, 800, 900].map((weight) => (
                  <option key={weight} value={weight}>
                    {weight}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Heading letter spacing"
              htmlFor="headingTracking"
              hint="e.g. -0.022em for tight, 0 for neutral."
            >
              <input
                id="headingTracking"
                name="headingTracking"
                defaultValue={settings.headingTracking}
                className={`${inputClass} font-mono text-xs`}
              />
            </Field>

            <Field label="Body size (rem)" htmlFor="bodyFontSize" hint="0.9 – 1.6">
              <input
                id="bodyFontSize"
                name="bodyFontSize"
                type="number"
                step="any"
                min={0.9}
                max={1.6}
                defaultValue={settings.bodyFontSize}
                className={inputClass}
              />
            </Field>

            <Field label="Body line height" htmlFor="bodyLineHeight" hint="1.3 – 2.2">
              <input
                id="bodyLineHeight"
                name="bodyLineHeight"
                type="number"
                step="any"
                min={1.3}
                max={2.2}
                defaultValue={settings.bodyLineHeight}
                className={inputClass}
              />
            </Field>

            {(
              [
                ["h1Size", "H1 / post title (rem)", 1.5, 5],
                ["h2Size", "H2 (rem)", 1.1, 3.5],
                ["h3Size", "H3 (rem)", 1, 3],
                ["h4Size", "H4 (rem)", 0.9, 2.5],
              ] as const
            ).map(([key, label, min, max]) => (
              <Field key={key} label={label} htmlFor={key}>
                <input
                  id={key}
                  name={key}
                  type="number"
                  step="any"
                  min={min}
                  max={max}
                  defaultValue={settings[key] as number}
                  className={inputClass}
                />
              </Field>
            ))}
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

        {/* ---------------------------------------------------- Email */}
        <Card
          title="Email & SMTP"
          description="Needed to email subscribers. Use an app password, never your account password."
        >
          <div id="email" className="grid gap-4 scroll-mt-6 sm:grid-cols-2">
            <Field
              label="SMTP host"
              htmlFor="smtpHost"
              hint="e.g. smtp.gmail.com, smtp.resend.com"
            >
              <input
                id="smtpHost"
                name="smtpHost"
                defaultValue={value("smtpHost")}
                className={inputClass}
              />
            </Field>

            <Field label="Port" htmlFor="smtpPort" hint="587 for STARTTLS, 465 for TLS.">
              <input
                id="smtpPort"
                name="smtpPort"
                type="number"
                min={1}
                max={65535}
                defaultValue={settings.smtpPort}
                className={inputClass}
              />
            </Field>

            <Field label="Username" htmlFor="smtpUser">
              <input
                id="smtpUser"
                name="smtpUser"
                autoComplete="off"
                defaultValue={value("smtpUser")}
                className={inputClass}
              />
            </Field>

            <Field
              label="Password"
              htmlFor="smtpPassword"
              hint={
                settings.smtpPassword
                  ? "Saved. Leave blank to keep the current password."
                  : "Stored in the database — restrict access to the server."
              }
            >
              <input
                id="smtpPassword"
                name="smtpPassword"
                type="password"
                autoComplete="new-password"
                placeholder={settings.smtpPassword ? "••••••••••" : ""}
                className={inputClass}
              />
            </Field>

            <Field label="From name" htmlFor="smtpFromName">
              <input
                id="smtpFromName"
                name="smtpFromName"
                defaultValue={value("smtpFromName")}
                placeholder={settings.siteName}
                className={inputClass}
              />
            </Field>

            <Field
              label="From address"
              htmlFor="smtpFromEmail"
              hint="Must be an address the SMTP account is allowed to send as."
            >
              <input
                id="smtpFromEmail"
                name="smtpFromEmail"
                type="email"
                defaultValue={value("smtpFromEmail")}
                className={inputClass}
              />
            </Field>

            <div className="space-y-3 sm:col-span-2">
              <Toggle
                name="smtpSecure"
                label="Force implicit TLS"
                hint="Leave off for port 587. Port 465 turns this on automatically."
                defaultChecked={settings.smtpSecure}
              />
              <Toggle
                name="notifyOnPublish"
                label="Email subscribers when a post is published"
                hint="Sends once, the first time a post goes live. Never re-sends on edit."
                defaultChecked={settings.notifyOnPublish}
              />
            </div>
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
