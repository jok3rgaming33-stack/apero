import { NextRequest, NextResponse } from "next/server";
import { addOrderMessage, type Attachment } from "@/lib/orders-store";

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
  const msg = addOrderMessage(id, from, text ?? "", attachments ?? []);
  if (!msg) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
  return NextResponse.json(msg, { status: 201 });
}
