import { googleFontsHref, typographyCss } from "@/lib/fonts";
import { getSettings } from "@/lib/settings";
import { themeCss } from "@/lib/theme";

/**
 * Emits the runtime brand colour and typography overrides, plus the webfont
 * stylesheet for whichever families are configured. Rendered in <head> so the
 * variables land before first paint and nothing flashes the built-in defaults.
 */
export async function Appearance() {
  const settings = await getSettings();

  const fontsHref = googleFontsHref([settings.fontHeading, settings.fontBody]);
  const css = `${themeCss(settings.brandColor)}${typographyCss(settings)}`;

  return (
    <>
      {fontsHref && (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link rel="stylesheet" href={fontsHref} />
        </>
      )}
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </>
  );
}
