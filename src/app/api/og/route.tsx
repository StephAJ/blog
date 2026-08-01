import { ImageResponse } from "next/og";

import { getSettings } from "@/lib/settings";

export const runtime = "nodejs";

const clamp = (value: string | null, max: number) =>
  (value ?? "").slice(0, max).trim();

/**
 * Social card generator. Used whenever a post has no cover image of its own —
 * see `ogImageUrl()` in lib/og.ts for the callers.
 */
export async function GET(request: Request) {
  const settings = await getSettings();
  const params = new URL(request.url).searchParams;

  const title = clamp(params.get("title"), 130) || settings.siteName;
  const label = clamp(params.get("label"), 30) || settings.siteName;
  const meta = clamp(params.get("meta"), 60) || settings.tagline;
  const color = /^#[0-9a-fA-F]{6}$/.test(params.get("color") ?? "")
    ? params.get("color")!
    : "#d9482b";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fdfcfa",
          padding: "68px",
          fontFamily: "sans-serif",
          borderTop: `18px solid ${color}`,
        }}
      >
        <div style={{ display: "flex" }}>
          <div
            style={{
              display: "flex",
              padding: "8px 20px",
              borderRadius: 999,
              background: color,
              color: "#fff",
              fontSize: 21,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            {label}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: title.length > 72 ? 50 : 64,
            fontWeight: 800,
            lineHeight: 1.14,
            color: "#1a1917",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 24,
            color: "#5c584f",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "#d9482b",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 26,
                fontWeight: 800,
              }}
            >
              {settings.siteName.charAt(0)}
            </div>
            <span style={{ fontWeight: 700, color: "#1a1917" }}>
              {settings.siteName}
            </span>
          </div>
          <span>{meta}</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { "Cache-Control": "public, max-age=86400, immutable" },
    },
  );
}
