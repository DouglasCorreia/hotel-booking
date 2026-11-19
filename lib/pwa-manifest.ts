import type { MetadataRoute } from "next";
import type { Locale } from "@/lib/i18n/routing";

export function serveManifest(lang: Locale) {
  const manifest: MetadataRoute.Manifest = {
    name: "Lumina Hotels",
    short_name: "Lumina",
    description:
      lang === "en-US"
        ? "Explore destinations in Brazil, compare hotels, and try a simulated booking."
        : "Explore destinos do Brasil, compare hotéis e simule uma reserva.",
    lang,
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f8f9ff",
    theme_color: "#0051d5",
    icons: [
      {
        src: "/icons/lumina-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/lumina-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/lumina-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
  return Response.json(manifest, {
    headers: { "Content-Type": "application/manifest+json" },
  });
}
