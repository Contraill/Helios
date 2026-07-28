import { ImageResponse } from "next/og";

export const SOCIAL_IMAGE_ALT =
  "Helios Solar System atlas — worlds, motion and scale";
export const SOCIAL_IMAGE_SIZE = { width: 1200, height: 630 } as const;

export function createSocialImage(): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#05070b",
        color: "#f4f0e8",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -250,
          right: -110,
          display: "flex",
          width: 830,
          height: 830,
          border: "1px solid rgba(244, 240, 232, 0.18)",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -80,
          right: 60,
          display: "flex",
          width: 490,
          height: 490,
          border: "1px solid rgba(244, 240, 232, 0.13)",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 180,
          right: 280,
          display: "flex",
          width: 138,
          height: 138,
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 35% 30%, #fff4c7 0%, #f2bd63 38%, #9f431e 72%, #180906 100%)",
          boxShadow: "0 0 96px rgba(242, 189, 99, 0.42)",
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          padding: "72px 76px 64px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "rgba(244, 240, 232, 0.68)",
          }}
        >
          Solar System / Güneş Sistemi
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 142,
              fontWeight: 600,
              letterSpacing: "-0.07em",
              lineHeight: 0.9,
            }}
          >
            HELIOS
          </div>
          <div
            style={{
              display: "flex",
              width: 650,
              marginTop: 28,
              fontSize: 31,
              lineHeight: 1.35,
              color: "rgba(244, 240, 232, 0.78)",
            }}
          >
            Worlds, motion and scale — Dünyalar, hareket ve ölçek.
          </div>
        </div>
      </div>
    </div>,
    SOCIAL_IMAGE_SIZE,
  );
}
