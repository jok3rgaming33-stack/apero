import { NextRequest, NextResponse } from "next/server";
import { visitsStore } from "@/lib/visits-store";

function detectDevice(ua: string): "desktop" | "mobile" | "tablet" | "unknown" {
  if (!ua) return "unknown";
  const u = ua.toLowerCase();
  if (/tablet|ipad/.test(u)) return "tablet";
  if (/mobile|android|iphone|ipod|windows phone/.test(u)) return "mobile";
  if (/windows|macintosh|linux|x11/.test(u)) return "desktop";
  return "unknown";
}

function detectBrowser(ua: string): string {
  if (!ua) return "Inconnu";
  if (/edg\//i.test(ua)) return "Edge";
  if (/opr\//i.test(ua)) return "Opera";
  if (/chrome/i.test(ua)) return "Chrome";
  if (/safari/i.test(ua)) return "Safari";
  if (/firefox/i.test(ua)) return "Firefox";
  return "Autre";
}

// Ignore les visites internes (bots, admin lui-même)
const IGNORED_PATHS = ["/admin", "/api/"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const page: string = body.page ?? "/";

    // Ne pas tracker les pages admin et les appels API
    if (IGNORED_PATHS.some((p) => page.startsWith(p))) {
      return NextResponse.json({ ok: true });
    }

    const ua = req.headers.get("user-agent") ?? "";
    const referrer = body.referrer ?? "";
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      req.headers.get("x-real-ip") ??
      "unknown";

    visitsStore.add({
      page,
      referrer,
      userAgent: ua,
      ip,
      timestamp: new Date().toISOString(),
      device: detectDevice(ua),
      browser: detectBrowser(ua),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
