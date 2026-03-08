//------------------------------------------------------------
// src/app/manifest.js
// Dynamic PWA manifest - changes name/icons for TEST vs PROD
//------------------------------------------------------------

export default function manifest() {
  // Check if this is the TEST project by URL or custom env var
  const vercelUrl = process.env.VERCEL_URL || "";
  const isTest = vercelUrl.includes("nttt-test") || process.env.NEXT_PUBLIC_IS_TEST === "true";
  const isProduction = !isTest;

  return {
    name: isProduction ? "Name That Tango Tune" : "NTTT (TEST)",
    short_name: isProduction ? "NTTT" : "NTTT-T",
    description: "Learn to identify tango orchestras, singers, and songs by ear",
    start_url: "/",
    display: "standalone",
    background_color: isProduction ? "#1a1a2e" : "#2e1a1a", // Reddish for TEST
    theme_color: isProduction ? "#D4AF37" : "#FF6B6B", // Red/coral for TEST
    orientation: "portrait-primary",
    icons: [
      {
        src: isProduction ? "/icons/icon-192x192.png" : "/icons/icon-192x192-test.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: isProduction ? "/icons/icon-512x512.png" : "/icons/icon-512x512-test.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: isProduction ? "/icons/icon-512x512.png" : "/icons/icon-512x512-test.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["education", "music", "games"],
    lang: "en",
    dir: "ltr",
  };
}
