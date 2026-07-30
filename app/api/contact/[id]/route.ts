import { NextRequest, NextResponse } from "next/server";
import { getThread, markThreadMessagesRead } from "@/lib/messages-store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const asAdmin = req.nextUrl.searchParams.get("admin") === "true";
  const thread = getThread(id);
  if (!thread) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  markThreadMessagesRead(id, asAdmin);
  return NextResponse.json(thread);
}
