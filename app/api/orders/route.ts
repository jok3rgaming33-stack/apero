import { NextRequest, NextResponse } from "next/server";
import { createOrder, getOrders } from "@/lib/orders-store";

export async function GET(req: NextRequest) {
  const archived = req.nextUrl.searchParams.get("archived") === "true";
  return NextResponse.json(getOrders(archived));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientName, clientPhone, clientAddress, clientEmail, items } = body;
    if (!clientName || !clientPhone || !clientAddress || !items?.length) {
      return NextResponse.json({ error: "Champs manquants" }, { status: 400 });
    }
    const order = createOrder({ clientName, clientPhone, clientAddress, clientEmail, items });
    return NextResponse.json(order, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
