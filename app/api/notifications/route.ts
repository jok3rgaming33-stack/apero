import { NextRequest, NextResponse } from "next/server";
import { countUnreadOrderMessages } from "@/lib/orders-store";
import { countUnreadThreadMessages } from "@/lib/messages-store";

// Returns unread counts for both client and admin badges
export async function GET(req: NextRequest) {
  const asAdmin = req.nextUrl.searchParams.get("admin") === "true";
  const orderId = req.nextUrl.searchParams.get("orderId");

  if (orderId) {
    // Per-order unread count for client polling
    const { getOrder } = await import("@/lib/orders-store");
    const order = getOrder(orderId);
    if (!order) return NextResponse.json({ unread: 0 });
    const unread = order.messages.filter(
      (m) => m.from === "admin" && !m.read
    ).length;
    return NextResponse.json({ unread });
  }

  return NextResponse.json({
    orderMessages: countUnreadOrderMessages(asAdmin),
    contactMessages: countUnreadThreadMessages(asAdmin),
    total: countUnreadOrderMessages(asAdmin) + countUnreadThreadMessages(asAdmin),
  });
}
