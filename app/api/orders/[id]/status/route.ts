import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus, type OrderStatus } from "@/lib/orders-store";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status } = await req.json() as { status: OrderStatus };
  const validStatuses: OrderStatus[] = [
    "en_attente", "validee", "en_preparation", "livraison_en_cours", "livree",
  ];
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }
  const order = updateOrderStatus(id, status);
  if (!order) return NextResponse.json({ error: "Introuvable" }, { status: 404 });
  return NextResponse.json(order);
}
