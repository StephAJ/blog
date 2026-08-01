import { ImageResponse } from "next/og";

import { getSettings } from "@/lib/settings";

export const alt = "Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const settings = await getSettings();

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
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "#d9482b",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 42,
              fontWeight: 800,
            }}
          >
            {settings.siteName.charAt(0)}
          </div>
          <div style={{ fontSize: 34, fontWeight: 800, color: "#1a1917" }}>
            {settings.siteName}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 62,
            fontWeight: 800,
            lineHeight: 1.15,
            color: "#1a1917",
            letterSpacing: "-0.02em",
          }}
        >
          {settings.tagline}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 26,
            color: "#5c584f",
          }}
        >
          <span>{settings.siteUrl.replace(/^https?:\/\//, "")}</span>
          <span style={{ width: 120, height: 6, background: "#d9482b", borderRadius: 3 }} />
        </div>
      </div>
    ),
    size,
  );
}
