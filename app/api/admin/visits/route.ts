import { NextRequest, NextResponse } from "next/server";
import { visitsStore } from "@/lib/visits-store";

const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "aperomaison_admin_2026";

export async function GET(req: NextRequest) {
  const token = req.headers.get("x-admin-token");
  if (token !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  if (action === "clear") {
    visitsStore.clear();
    return NextResponse.json({ ok: true });
  }

  const all = visitsStore.getAll();
  const stats = visitsStore.stats();

  return NextResponse.json({ visits: all, stats });
}
