import { NextRequest, NextResponse } from "next/server";
import { updateOrderItems, type OrderItem } from "@/lib/orders-store";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { items } = await req.json() as { items: OrderItem[] };
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Items invalides" }, { status: 400 });
  }
  const order = updateOrderItems(id, items);
  if (!order) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(order);
}
