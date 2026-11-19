import { serveManifest } from "@/lib/pwa-manifest";

export function GET() {
  return serveManifest("pt-BR");
}
