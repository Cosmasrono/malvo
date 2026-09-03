import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0e1218",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "72px 80px",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Dot grid background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.12) 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#047a55",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              fontWeight: 700,
              color: "white",
            }}
          >
            M
          </div>
          <span style={{ color: "white", fontSize: 24, fontWeight: 700 }}>
            {site.name}
          </span>
        </div>

        {/* Tagline */}
        <p
          style={{
            color: "white",
            fontSize: 52,
            fontWeight: 800,
            lineHeight: 1.1,
            maxWidth: 800,
            margin: 0,
          }}
        >
          {site.tagline}
        </p>

        {/* Location pill */}
        <div
          style={{
            marginTop: 40,
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: "#34d399",
            fontSize: 20,
            fontWeight: 600,
          }}
        >
          <span>📍</span>
          <span>
            {site.address.area} · {site.address.city}
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
