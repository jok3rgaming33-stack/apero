import { NextRequest, NextResponse } from "next/server";
import { createThread, getThreads } from "@/lib/messages-store";

export async function GET(req: NextRequest) {
  const archived = req.nextUrl.searchParams.get("archived") === "true";
  return NextResponse.json(getThreads(archived));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientName, clientPhone, subject, firstMessage, attachments } = body;
    if (!clientName || !subject || !firstMessage?.trim()) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }
    const thread = createThread({ clientName, clientPhone, subject, firstMessage, attachments });
    return NextResponse.json(thread, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
