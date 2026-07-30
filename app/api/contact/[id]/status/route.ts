import { NextRequest, NextResponse } from "next/server";
import { updateThreadStatus, type ThreadStatus } from "@/lib/messages-store";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status } = await req.json() as { status: ThreadStatus };
  const valid: ThreadStatus[] = ["en_attente", "pris_en_charge", "cloture"];
  if (!valid.includes(status)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }
  const thread = updateThreadStatus(id, status);
  if (!thread) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(thread);
}
