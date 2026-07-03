import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** App favicon: "GG" on the ink background. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#262322",
          color: "#f8f7f5",
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: -1,
          borderRadius: 14,
        }}
      >
        GG
      </div>
    ),
    size,
  );
}
