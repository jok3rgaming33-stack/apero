"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, X, ChevronDown } from "lucide-react";
import type { ContactThread, ThreadStatus } from "@/lib/messages-store";
import { THREAD_STATUS_LABELS, THREAD_STATUS_COLORS } from "@/lib/messages-store";
import AttachmentUpload from "@/components/attachment-upload";
import type { Attachment } from "@/lib/orders-store";

interface Props {
  thread: ContactThread;
  onUpdate: (updated: ContactThread) => void;
}

const STATUSES: ThreadStatus[] = ["en_attente", "pris_en_charge", "cloture"];

export default function ThreadChat({ thread, onUpdate }: Props) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [sending, setSending] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.messages.length]);

  async function sendMessage() {
    if (!text.trim() && !attachments.length) return;
    setSending(true);
    const res = await fetch(`/api/contact/${thread.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: "admin", text, attachments }),
    });
    if (res.ok) {
      const fresh = await fetch(`/api/contact/${thread.id}?admin=true`);
      if (fresh.ok) onUpdate(await fresh.json());
      setText("");
      setAttachments([]);
    }
    setSending(false);
  }

  async function changeStatus(status: ThreadStatus) {
    setShowStatusMenu(false);
    const res = await fetch(`/api/contact/${thread.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const fresh = await fetch(`/api/contact/${thread.id}?admin=true`);
      if (fresh.ok) onUpdate(await fresh.json());
    }
  }

  const statusColor = THREAD_STATUS_COLORS[thread.status];

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f0b07" }}>

      {/* Header */}
      <div
        className="flex items-start justify-between gap-4 px-5 py-4 border-b"
        style={{ borderColor: "#2e2010", background: "#120d07" }}
      >
        <div className="min-w-0">
          <span className="font-bold text-sm" style={{ color: "#f9f3e8" }}>
            {thread.clientName}
          </span>
          {thread.clientPhone && (
            <span className="text-xs ml-2" style={{ color: "#6b5540" }}>
              {thread.clientPhone}
            </span>
          )}
          <p className="text-xs mt-0.5 truncate" style={{ color: "#a89272" }}>
            {thread.subject}
          </p>
        </div>

        {/* Status selector */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowStatusMenu((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border"
            style={{ borderColor: statusColor, color: statusColor, background: `${statusColor}15` }}
          >
            <span className="w-2 h-2 rounded-full" style={{ background: statusColor }} />
            {THREAD_STATUS_LABELS[thread.status]}
            <ChevronDown className="w-3 h-3" />
          </button>
          {showStatusMenu && (
            <div
              className="absolute right-0 top-full mt-1 z-50 rounded-xl border overflow-hidden shadow-2xl min-w-[220px]"
              style={{ background: "#1a1208", borderColor: "#2e2010" }}
            >
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => changeStatus(s)}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-left text-xs hover:opacity-80 transition-opacity"
                  style={{
                    background: s === thread.status ? `${THREAD_STATUS_COLORS[s]}15` : "transparent",
                    color: s === thread.status ? THREAD_STATUS_COLORS[s] : "#a89272",
                  }}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: THREAD_STATUS_COLORS[s] }} />
                  {THREAD_STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
        {thread.messages.map((msg) => {
          const isAdmin = msg.from === "admin";
          return (
            <div key={msg.id} className={`flex flex-col gap-1 ${isAdmin ? "items-end" : "items-start"}`}>
              <span className="text-[10px]" style={{ color: "#4a3a28" }}>
                {isAdmin ? "Admin" : thread.clientName} ·{" "}
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
                    borderRadius: isAdmin ? "1rem 1rem 0.25rem 1rem" : "1rem 1rem 1rem 0.25rem",
                  }}
                >
                  {msg.text}
                </div>
              )}
              {msg.attachments?.map((att) => (
                <AttachmentBubble key={att.id} att={att} />
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
        className="flex items-end gap-2 px-4 py-3 border-t"
        style={{ borderColor: "#2e2010", background: "#120d07" }}
      >
        <AttachmentUpload onAttach={(att) => setAttachments((p) => [...p, att])}>
          <button className="p-2 rounded-lg shrink-0 hover:opacity-70" style={{ color: "#6b5540" }}>
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
          className="p-2 rounded-xl shrink-0 active:scale-95 disabled:opacity-40 transition-all"
          style={{ background: "#f5c518", color: "#0f0b07" }}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function AttachmentBubble({ att }: { att: Attachment }) {
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
