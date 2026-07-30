import { NextRequest, NextResponse } from "next/server";
import { addContactMessage, type Attachment } from "@/lib/messages-store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { from, text, attachments } = await req.json() as {
    from: "client" | "admin";
    text: string;
    attachments: Attachment[];
  };
  if (!from || (!text?.trim() && !attachments?.length)) {
    return NextResponse.json({ error: "Contenu manquant" }, { status: 400 });
  }
  const msg = addContactMessage(id, from, text ?? "", attachments ?? []);
  if (!msg) return NextResponse.json({ error: "Thread introuvable" }, { status: 404 });
  return NextResponse.json(msg, { status: 201 });
}
