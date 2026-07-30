import { NextRequest, NextResponse } from "next/server";
import { getOrder, markOrderMessagesRead } from "@/lib/orders-store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const asAdmin = req.nextUrl.searchParams.get("admin") === "true";
  const order = getOrder(id);
  if (!order) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  markOrderMessagesRead(id, asAdmin);
  return NextResponse.json(order);
}
