"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Send, Paperclip, X, CheckCircle, Clock, Truck, Package, AlertCircle } from "lucide-react";
import type { Order, OrderStatus } from "@/lib/orders-store";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/orders-store";
import type { Attachment } from "@/lib/orders-store";
import AttachmentUpload from "@/components/attachment-upload";

// ─── Status timeline ──────────────────────────────────────────────────────────

const STATUS_STEPS: { key: OrderStatus; icon: React.ElementType }[] = [
  { key: "en_attente",         icon: Clock },
  { key: "validee",            icon: CheckCircle },
  { key: "en_preparation",     icon: Package },
  { key: "livraison_en_cours", icon: Truck },
  { key: "livree",             icon: CheckCircle },
];

function StatusTimeline({ status }: { status: OrderStatus }) {
  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === status);
  return (
    <div className="flex items-center gap-0 w-full">
      {STATUS_STEPS.map((step, i) => {
        const done = i <= currentIdx;
        const current = i === currentIdx;
        const Icon = step.icon;
        return (
          <div key={step.key} className="flex-1 flex items-center">
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: done ? ORDER_STATUS_COLORS[status] : "#1e1610",
                  border: `2px solid ${done ? ORDER_STATUS_COLORS[status] : "#2e2010"}`,
                  boxShadow: current ? `0 0 12px ${ORDER_STATUS_COLORS[status]}60` : "none",
                }}
              >
                <Icon className="w-4 h-4" style={{ color: done ? "#0f0b07" : "#4a3a28" }} />
              </div>
              <span
                className="text-[9px] text-center leading-tight w-16"
                style={{ color: done ? ORDER_STATUS_COLORS[status] : "#4a3a28" }}
              >
                {ORDER_STATUS_LABELS[step.key]}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-1 mb-5"
                style={{ background: i < currentIdx ? ORDER_STATUS_COLORS[status] : "#2e2010" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SuiviPage() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("id") ?? "");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchOrder = useCallback(async (id: string) => {
    const res = await fetch(`/api/orders/${id}`);
    if (res.ok) setOrder(await res.json());
  }, []);

  // Auto-load from URL param on mount
  useEffect(() => {
    const urlId = searchParams.get("id");
    if (urlId) {
      setLoading(true);
      fetchOrder(urlId).finally(() => setLoading(false));
    }
  }, [searchParams, fetchOrder]);

  // Poll for updates every 4 seconds when an order is loaded
  useEffect(() => {
    if (!order) return;
    const id = setInterval(() => fetchOrder(order.id), 4000);
    return () => clearInterval(id);
  }, [order?.id, fetchOrder]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [order?.messages.length]);

  async function search() {
    if (!orderId.trim()) return;
    setLoading(true);
    setError("");
    const res = await fetch(`/api/orders/${orderId.trim()}`);
    if (res.ok) {
      setOrder(await res.json());
    } else {
      setError("Commande introuvable. Vérifiez votre numéro de commande.");
      setOrder(null);
    }
    setLoading(false);
  }

  async function sendMessage() {
    if (!order || (!text.trim() && !attachments.length)) return;
    setSending(true);
    const res = await fetch(`/api/orders/${order.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: "client", text, attachments }),
    });
    if (res.ok) {
      const fresh = await fetch(`/api/orders/${order.id}`);
      if (fresh.ok) setOrder(await fresh.json());
      setText("");
      setAttachments([]);
    }
    setSending(false);
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4" style={{ background: "#0a0703" }}>
      <div className="max-w-2xl mx-auto">

        {/* Title */}
        <h1
          className="text-3xl font-bold mb-2"
          style={{ fontFamily: "var(--font-playfair)", color: "#f9f3e8" }}
        >
          Suivi de <span style={{ color: "#f5c518", fontStyle: "italic" }}>commande</span>
        </h1>
        <p className="text-sm mb-8" style={{ color: "#6b5540" }}>
          Entrez votre numéro de commande pour accéder au suivi en temps réel.
        </p>

        {/* Search */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.nativeEvent.isComposing) search(); }}
            placeholder="ex: cmd-1234567890-1001"
            className="flex-1 px-4 py-3 rounded-xl text-sm outline-none"
            style={{ background: "#1a1208", border: "1px solid #2e2010", color: "#f9f3e8" }}
          />
          <button
            onClick={search}
            disabled={loading}
            className="px-5 py-3 rounded-xl font-bold text-sm disabled:opacity-50"
            style={{ background: "#f5c518", color: "#0f0b07" }}
          >
            {loading ? "..." : <Search className="w-4 h-4" />}
          </button>
        </div>

        {error && (
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl mb-6 text-sm"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {order && (
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ background: "#120d07", borderColor: "#2e2010" }}
          >
            {/* Order header */}
            <div className="px-6 py-5 border-b" style={{ borderColor: "#2e2010" }}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="font-bold text-sm" style={{ color: "#f9f3e8" }}>{order.clientName}</p>
                  <p className="text-xs font-mono mt-0.5" style={{ color: "#6b5540" }}>{order.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold" style={{ color: "#f5c518" }}>
                    {order.currentTotal.toFixed(2)} €
                  </p>
                  {order.originalTotal !== order.currentTotal && (
                    <p className="text-xs line-through" style={{ color: "#6b5540" }}>
                      {order.originalTotal.toFixed(2)} €
                    </p>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <StatusTimeline status={order.status} />

              {/* Points fidélité */}
              {order.status === "livree" && order.loyaltyPoints > 0 && (
                <div
                  className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl"
                  style={{ background: "rgba(45,154,62,0.1)", border: "1px solid rgba(45,154,62,0.2)" }}
                >
                  <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "#2D9A3E" }} />
                  <p className="text-xs" style={{ color: "#2D9A3E" }}>
                    Commande livrée — <strong>{order.loyaltyPoints} points fidélité</strong> ont été crédités sur votre compte.
                  </p>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="px-6 py-4 border-b" style={{ borderColor: "#2e2010" }}>
              <p className="text-xs font-semibold mb-3" style={{ color: "#a89272" }}>Produits</p>
              <div className="flex flex-col gap-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3">
                    <span className="text-xs flex-1 truncate" style={{ color: "#f9f3e8" }}>{item.name}</span>
                    <span className="text-xs" style={{ color: "#6b5540" }}>x{item.quantity}</span>
                    <span className="text-xs font-bold" style={{ color: "#f5c518" }}>
                      {(item.price * item.quantity).toFixed(2)} €
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex flex-col max-h-80 overflow-y-auto px-6 py-4 gap-3">
              {order.messages.map((msg) => {
                const isAdmin = msg.from === "admin";
                return (
                  <div key={msg.id} className={`flex flex-col gap-1 ${isAdmin ? "items-start" : "items-end"}`}>
                    <span className="text-[10px]" style={{ color: "#4a3a28" }}>
                      {isAdmin ? "Apéro Maison" : "Vous"} ·{" "}
                      {new Date(msg.createdAt).toLocaleString("fr-FR", {
                        day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                      })}
                    </span>
                    {msg.text && (
                      <div
                        className="max-w-sm rounded-2xl px-4 py-2.5 text-sm"
                        style={{
                          background: isAdmin ? "#1e1610" : "#f5c518",
                          color: isAdmin ? "#f9f3e8" : "#0f0b07",
                          border: isAdmin ? "1px solid #2e2010" : "none",
                          borderRadius: isAdmin ? "1rem 1rem 1rem 0.25rem" : "1rem 1rem 0.25rem 1rem",
                        }}
                      >
                        {msg.text}
                      </div>
                    )}
                    {msg.attachments?.map((att) => (
                      <ClientAttachment key={att.id} att={att} />
                    ))}
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Pending attachments */}
            {attachments.length > 0 && (
              <div className="flex gap-2 px-6 py-2 flex-wrap border-t" style={{ borderColor: "#2e2010" }}>
                {attachments.map((att) => (
                  <div key={att.id} className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg" style={{ background: "#1e1610", color: "#a89272", border: "1px solid #2e2010" }}>
                    <Paperclip className="w-3 h-3" />
                    <span className="max-w-[120px] truncate">{att.name}</span>
                    <button onClick={() => setAttachments((p) => p.filter((a) => a.id !== att.id))}>
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input */}
            {order.status !== "livree" && (
              <div
                className="flex items-end gap-2 px-4 py-3 border-t"
                style={{ borderColor: "#2e2010", background: "#0f0b07" }}
              >
                <AttachmentUpload onAttach={(att) => setAttachments((p) => [...p, att])}>
                  <button className="p-2 rounded-lg hover:opacity-70" style={{ color: "#6b5540" }}>
                    <Paperclip className="w-4 h-4" />
                  </button>
                </AttachmentUpload>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Envoyer un message à notre équipe..."
                  rows={1}
                  className="flex-1 resize-none text-sm outline-none rounded-xl px-3 py-2"
                  style={{ background: "#1e1610", border: "1px solid #2e2010", color: "#f9f3e8", maxHeight: 100 }}
                />
                <button
                  onClick={sendMessage}
                  disabled={sending || (!text.trim() && !attachments.length)}
                  className="p-2 rounded-xl active:scale-95 disabled:opacity-40 transition-all"
                  style={{ background: "#f5c518", color: "#0f0b07" }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ClientAttachment({ att }: { att: Attachment }) {
  const isImage = att.type.startsWith("image/");
  const isVideo = att.type.startsWith("video/");
  return (
    <div className="max-w-xs rounded-xl overflow-hidden border" style={{ borderColor: "#2e2010" }}>
      {isImage && <img src={att.data} alt={att.name} className="max-w-full max-h-48 object-cover" />}
      {isVideo && <video src={att.data} controls className="max-w-full max-h-48" />}
      {!isImage && !isVideo && (
        <a href={att.data} download={att.name} className="flex items-center gap-2 px-3 py-2 text-xs" style={{ color: "#a89272" }}>
          <Paperclip className="w-3 h-3" />{att.name}
        </a>
      )}
    </div>
  );
}
