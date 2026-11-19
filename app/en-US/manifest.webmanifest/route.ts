import { serveManifest } from "@/lib/pwa-manifest";

export function GET() {
  return serveManifest("en-US");
}
