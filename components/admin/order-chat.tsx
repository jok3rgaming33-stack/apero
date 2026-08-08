"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send, Paperclip, X, ChevronDown, Plus, Minus, Trash2,
} from "lucide-react";
import type {
  Order, OrderStatus, OrderItem,
} from "@/lib/orders-store";
import {
  ORDER_STATUS_LABELS, ORDER_STATUS_COLORS,
} from "@/lib/orders-store";
import AttachmentUpload from "@/components/attachment-upload";
import type { Attachment } from "@/lib/orders-store";

interface Props {
  order: Order;
  onUpdate: (updated: Order) => void;
}

const STATUSES: OrderStatus[] = [
  "en_attente", "validee", "en_preparation", "livraison_en_cours", "livree",
];

export default function OrderChat({ order, onUpdate }: Props) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [sending, setSending] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [editingItems, setEditingItems] = useState(false);
  const [draftItems, setDraftItems] = useState<OrderItem[]>(order.items);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [order.messages.length]);

  useEffect(() => {
    setDraftItems(order.items);
  }, [order.items]);

  async function sendMessage() {
    if (!text.trim() && !attachments.length) return;
    setSending(true);
    const res = await fetch(`/api/orders/${order.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: "admin", text, attachments }),
    });
    if (res.ok) {
      const fresh = await fetch(`/api/orders/${order.id}?admin=true`);
      if (fresh.ok) onUpdate(await fresh.json());
      setText("");
      setAttachments([]);
    }
    setSending(false);
  }

  async function changeStatus(status: OrderStatus) {
    setShowStatusMenu(false);
    const res = await fetch(`/api/orders/${order.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const fresh = await fetch(`/api/orders/${order.id}?admin=true`);
      if (fresh.ok) onUpdate(await fresh.json());
    }
  }

  async function saveItems() {
    const filtered = draftItems.filter((i) => i.quantity > 0);
    const res = await fetch(`/api/orders/${order.id}/items`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: filtered }),
    });
    if (res.ok) {
      const fresh = await fetch(`/api/orders/${order.id}?admin=true`);
      if (fresh.ok) onUpdate(await fresh.json());
      setEditingItems(false);
    }
  }

  function adjustQty(idx: number, delta: number) {
    setDraftItems((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
      )
    );
  }

  const statusColor = ORDER_STATUS_COLORS[order.status];

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f0b07" }}>

      {/* Header */}
      <div
        className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 border-b"
        style={{ borderColor: "#2e2010", background: "#120d07" }}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm" style={{ color: "#f9f3e8" }}>
              {order.clientName}
            </span>
            <span className="text-xs" style={{ color: "#6b5540" }}>{order.clientPhone}</span>
          </div>
          <p className="text-xs mt-0.5 break-words" style={{ color: "#6b5540" }}>
            {order.clientAddress}
          </p>
          <div className="flex items-center gap-2 sm:gap-3 mt-1 flex-wrap">
            <span className="text-[10px] sm:text-xs font-mono" style={{ color: "#6b5540" }}>{order.id}</span>
            <span className="text-xs" style={{ color: "#a89272" }}>
              Total : <strong style={{ color: "#f9f3e8" }}>{order.originalTotal.toFixed(2)} €</strong>
            </span>
            {order.currentTotal !== order.originalTotal && (
              <span className="text-xs" style={{ color: "#f5c518" }}>
                Actuel : <strong>{order.currentTotal.toFixed(2)} €</strong>
              </span>
            )}
            {order.loyaltyPoints > 0 && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "rgba(45,154,62,0.15)", color: "#2D9A3E" }}
              >
                +{order.loyaltyPoints} pts
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {/* Edit items */}
          <button
            onClick={() => setEditingItems((v) => !v)}
            className="text-xs px-2.5 sm:px-3 py-1.5 rounded-lg border transition-colors"
            style={{
              borderColor: editingItems ? "#f5c518" : "#2e2010",
              color: editingItems ? "#f5c518" : "#a89272",
              background: editingItems ? "rgba(245,197,24,0.07)" : "#1a1208",
            }}
          >
            {editingItems ? "Annuler" : "Modifier"}
          </button>

          {/* Status selector */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg border max-w-[11rem] sm:max-w-none"
              style={{ borderColor: statusColor, color: statusColor, background: `${statusColor}15` }}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: statusColor }}
              />
              <span className="truncate">{ORDER_STATUS_LABELS[order.status]}</span>
              <ChevronDown className="w-3 h-3 shrink-0" />
            </button>
            {showStatusMenu && (
              <div
                className="absolute right-0 top-full mt-1 z-50 rounded-xl border overflow-hidden shadow-2xl min-w-[200px] max-w-[min(280px,90vw)]"
                style={{ background: "#1a1208", borderColor: "#2e2010" }}
              >
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => changeStatus(s)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-xs hover:opacity-80 transition-opacity"
                    style={{
                      background: s === order.status ? `${ORDER_STATUS_COLORS[s]}15` : "transparent",
                      color: s === order.status ? ORDER_STATUS_COLORS[s] : "#a89272",
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: ORDER_STATUS_COLORS[s] }}
                    />
                    {ORDER_STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Item editor */}
      {editingItems && (
        <div
          className="border-b px-5 py-3"
          style={{ borderColor: "#2e2010", background: "#140f08" }}
        >
          <p className="text-xs font-semibold mb-3" style={{ color: "#f5c518" }}>
            Modifier les produits
          </p>
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
            {draftItems.map((item, idx) => (
              <div key={item.id} className="flex items-center gap-3">
                <span className="text-xs flex-1 truncate" style={{ color: "#f9f3e8" }}>
                  {item.name}
                </span>
                <span className="text-xs w-16 text-right" style={{ color: "#a89272" }}>
                  {item.price.toFixed(2)} €
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => adjustQty(idx, -1)}
                    className="w-6 h-6 rounded flex items-center justify-center"
                    style={{ background: "#2e2010", color: "#a89272" }}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold" style={{ color: "#f9f3e8" }}>
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => adjustQty(idx, 1)}
                    className="w-6 h-6 rounded flex items-center justify-center"
                    style={{ background: "#2e2010", color: "#a89272" }}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setDraftItems((prev) => prev.filter((_, i) => i !== idx))}
                    className="w-6 h-6 rounded flex items-center justify-center ml-1"
                    style={{ background: "#3a1010", color: "#ef4444" }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs" style={{ color: "#a89272" }}>
              Nouveau total :{" "}
              <strong style={{ color: "#f5c518" }}>
                {draftItems.reduce((s, i) => s + i.price * i.quantity, 0).toFixed(2)} €
              </strong>
            </span>
            <button
              onClick={saveItems}
              className="text-xs font-bold px-4 py-1.5 rounded-lg"
              style={{ background: "#f5c518", color: "#0f0b07" }}
            >
              Enregistrer
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-3 sm:px-5 py-3 sm:py-4 flex flex-col gap-3">
        {order.messages.map((msg) => {
          const isAdmin = msg.from === "admin";
          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 ${isAdmin ? "items-end" : "items-start"}`}
            >
              <span className="text-[10px]" style={{ color: "#4a3a28" }}>
                {isAdmin ? "Admin" : order.clientName} ·{" "}
                {new Date(msg.createdAt).toLocaleString("fr-FR", {
                  day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
                })}
              </span>
              {msg.text && (
                <div
                  className="max-w-xs rounded-2xl px-4 py-2.5 text-sm"
                  style={{
                    background: isAdmin ? "#f5c518" : "#1e1610",
                    color: isAdmin ? "#0f0b07" : "#f9f3e8",
                    border: isAdmin ? "none" : "1px solid #2e2010",
                    borderRadius: isAdmin
                      ? "1rem 1rem 0.25rem 1rem"
                      : "1rem 1rem 1rem 0.25rem",
                  }}
                >
                  {msg.text}
                </div>
              )}
              {msg.attachments?.map((att) => (
                <AttachmentPreview key={att.id} att={att} />
              ))}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Pending attachments */}
      {attachments.length > 0 && (
        <div className="flex gap-2 px-5 py-2 flex-wrap" style={{ borderTop: "1px solid #2e2010" }}>
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg"
              style={{ background: "#1e1610", color: "#a89272", border: "1px solid #2e2010" }}
            >
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
      <div
        className="flex items-end gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-t shrink-0"
        style={{ borderColor: "#2e2010", background: "#120d07" }}
      >
        <AttachmentUpload onAttach={(att) => setAttachments((p) => [...p, att])}>
          <button
            className="p-2 rounded-lg shrink-0 transition-colors hover:opacity-70"
            style={{ color: "#6b5540" }}
          >
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
          placeholder="Écrire un message..."
          rows={1}
          className="flex-1 resize-none text-sm outline-none rounded-xl px-3 py-2"
          style={{ background: "#1e1610", border: "1px solid #2e2010", color: "#f9f3e8", maxHeight: 120 }}
        />
        <button
          onClick={sendMessage}
          disabled={sending || (!text.trim() && !attachments.length)}
          className="p-2 rounded-xl shrink-0 transition-all active:scale-95 disabled:opacity-40"
          style={{ background: "#f5c518", color: "#0f0b07" }}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function AttachmentPreview({ att }: { att: Attachment }) {
  const isImage = att.type.startsWith("image/");
  const isVideo = att.type.startsWith("video/");
  return (
    <div
      className="max-w-xs rounded-xl overflow-hidden border"
      style={{ borderColor: "#2e2010" }}
    >
      {isImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={att.data} alt={att.name} className="max-w-full max-h-48 object-cover" />
      )}
      {isVideo && (
        <video src={att.data} controls className="max-w-full max-h-48" />
      )}
      {!isImage && !isVideo && (
        <a
          href={att.data}
          download={att.name}
          className="flex items-center gap-2 px-3 py-2 text-xs"
          style={{ color: "#a89272" }}
        >
          <Paperclip className="w-3 h-3" />
          {att.name}
        </a>
      )}
    </div>
  );
}
