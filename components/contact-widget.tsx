"use client";

import { useState, useRef, useEffect } from "react";
import { X, Send, Paperclip, MessageCircle, CheckCircle } from "lucide-react";
import type { ContactThread } from "@/lib/messages-store";
import { THREAD_STATUS_LABELS, THREAD_STATUS_COLORS } from "@/lib/messages-store";
import type { Attachment } from "@/lib/orders-store";
import AttachmentUpload from "@/components/attachment-upload";

type Step = "form" | "chat";

export default function ContactWidget() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [thread, setThread] = useState<ContactThread | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [formAttachments, setFormAttachments] = useState<Attachment[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Chat state
  const [text, setText] = useState("");
  const [chatAttachments, setChatAttachments] = useState<Attachment[]>([]);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Poll for replies when a thread is open
  useEffect(() => {
    if (!thread) return;
    const id = setInterval(async () => {
      const res = await fetch(`/api/contact/${thread.id}`);
      if (res.ok) setThread(await res.json());
    }, 4000);
    return () => clearInterval(id);
  }, [thread?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length]);

  async function submitForm() {
    if (!name.trim() || !subject.trim() || !message.trim()) {
      setFormError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setSubmitting(true);
    setFormError("");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: name,
        clientPhone: phone,
        subject,
        firstMessage: message,
        attachments: formAttachments,
      }),
    });
    if (res.ok) {
      const t: ContactThread = await res.json();
      setThread(t);
      setStep("chat");
    } else {
      setFormError("Une erreur est survenue. Réessayez.");
    }
    setSubmitting(false);
  }

  async function sendChatMessage() {
    if (!thread || (!text.trim() && !chatAttachments.length)) return;
    setSending(true);
    const res = await fetch(`/api/contact/${thread.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: "client", text, attachments: chatAttachments }),
    });
    if (res.ok) {
      const fresh = await fetch(`/api/contact/${thread.id}`);
      if (fresh.ok) setThread(await fresh.json());
      setText("");
      setChatAttachments([]);
    }
    setSending(false);
  }

  const statusColor = thread ? THREAD_STATUS_COLORS[thread.status] : "#a89272";

  return (
    <>
      {/* FAB button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center w-10 h-10 rounded-full transition-all active:scale-95"
        style={{ background: open ? "#f5c518" : "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.25)" }}
        aria-label="Ouvrir le formulaire de contact"
      >
        {open ? (
          <X className="w-4 h-4" style={{ color: "#0f0b07" }} />
        ) : (
          <MessageCircle className="w-4 h-4" style={{ color: "#f5c518" }} />
        )}
      </button>

      {/* Modal */}
      {open && (
        <div
          className="absolute right-0 top-14 w-80 rounded-2xl border shadow-2xl overflow-hidden z-50 flex flex-col"
          style={{ background: "#120d07", borderColor: "#2e2010", maxHeight: 520 }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b shrink-0"
            style={{ borderColor: "#2e2010", background: "#0f0b07" }}
          >
            <div>
              <p className="text-sm font-bold" style={{ color: "#f9f3e8" }}>Contact</p>
              {thread && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] mt-0.5"
                  style={{ color: statusColor }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor }} />
                  {THREAD_STATUS_LABELS[thread.status]}
                </span>
              )}
            </div>
            <button onClick={() => setOpen(false)} style={{ color: "#6b5540" }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Form step ── */}
          {step === "form" && (
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              <div>
                <label className="block text-[10px] font-semibold mb-1" style={{ color: "#a89272" }}>
                  Nom <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom"
                  className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                  style={{ background: "#1a1208", border: "1px solid #2e2010", color: "#f9f3e8" }}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold mb-1" style={{ color: "#a89272" }}>
                  Téléphone
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Optionnel"
                  className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                  style={{ background: "#1a1208", border: "1px solid #2e2010", color: "#f9f3e8" }}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold mb-1" style={{ color: "#a89272" }}>
                  Sujet <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Objet de votre message"
                  className="w-full px-3 py-2 rounded-xl text-xs outline-none"
                  style={{ background: "#1a1208", border: "1px solid #2e2010", color: "#f9f3e8" }}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold mb-1" style={{ color: "#a89272" }}>
                  Message <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Votre message..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl text-xs outline-none resize-none"
                  style={{ background: "#1a1208", border: "1px solid #2e2010", color: "#f9f3e8" }}
                />
              </div>

              {/* Attachments */}
              <div className="flex items-center gap-2">
                <AttachmentUpload onAttach={(att) => setFormAttachments((p) => [...p, att])}>
                  <button className="flex items-center gap-1.5 text-[10px] px-2 py-1.5 rounded-lg border" style={{ borderColor: "#2e2010", color: "#a89272" }}>
                    <Paperclip className="w-3 h-3" />
                    Pièce jointe
                  </button>
                </AttachmentUpload>
              </div>
              {formAttachments.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {formAttachments.map((att) => (
                    <div key={att.id} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg" style={{ background: "#1e1610", color: "#a89272", border: "1px solid #2e2010" }}>
                      <span className="max-w-[100px] truncate">{att.name}</span>
                      <button onClick={() => setFormAttachments((p) => p.filter((a) => a.id !== att.id))}>
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {formError && (
                <p className="text-[10px]" style={{ color: "#ef4444" }}>{formError}</p>
              )}

              <button
                onClick={submitForm}
                disabled={submitting}
                className="w-full py-2.5 rounded-xl text-xs font-bold mt-1 disabled:opacity-50"
                style={{ background: "#f5c518", color: "#0f0b07" }}
              >
                {submitting ? "Envoi..." : "Envoyer le message"}
              </button>
            </div>
          )}

          {/* ── Chat step ── */}
          {step === "chat" && thread && (
            <>
              {/* Confirmation banner */}
              {thread.messages.length <= 1 && (
                <div
                  className="flex items-center gap-2 px-4 py-2 text-[10px]"
                  style={{ background: "rgba(45,154,62,0.1)", color: "#2D9A3E", borderBottom: "1px solid rgba(45,154,62,0.2)" }}
                >
                  <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                  Votre message a été envoyé. Notre équipe vous répondra rapidement.
                </div>
              )}

              <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
                {thread.messages.map((msg) => {
                  const isAdmin = msg.from === "admin";
                  return (
                    <div key={msg.id} className={`flex flex-col gap-0.5 ${isAdmin ? "items-start" : "items-end"}`}>
                      <span className="text-[9px]" style={{ color: "#4a3a28" }}>
                        {isAdmin ? "Apéro Maison" : "Vous"} ·{" "}
                        {new Date(msg.createdAt).toLocaleString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {msg.text && (
                        <div
                          className="max-w-[220px] rounded-2xl px-3 py-2 text-[11px]"
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
                        <SmallAttachment key={att.id} att={att} />
                      ))}
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Pending chat attachments */}
              {chatAttachments.length > 0 && (
                <div className="flex flex-wrap gap-1.5 px-4 pb-1">
                  {chatAttachments.map((att) => (
                    <div key={att.id} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg" style={{ background: "#1e1610", color: "#a89272", border: "1px solid #2e2010" }}>
                      <span className="max-w-[80px] truncate">{att.name}</span>
                      <button onClick={() => setChatAttachments((p) => p.filter((a) => a.id !== att.id))}>
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {thread.status !== "cloture" && (
                <div className="flex items-end gap-2 px-3 py-2 border-t shrink-0" style={{ borderColor: "#2e2010" }}>
                  <AttachmentUpload onAttach={(att) => setChatAttachments((p) => [...p, att])}>
                    <button className="p-1.5 hover:opacity-70" style={{ color: "#6b5540" }}>
                      <Paperclip className="w-3.5 h-3.5" />
                    </button>
                  </AttachmentUpload>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                        e.preventDefault();
                        sendChatMessage();
                      }
                    }}
                    placeholder="Répondre..."
                    rows={1}
                    className="flex-1 resize-none text-xs outline-none rounded-xl px-3 py-1.5"
                    style={{ background: "#1a1208", border: "1px solid #2e2010", color: "#f9f3e8", maxHeight: 80 }}
                  />
                  <button
                    onClick={sendChatMessage}
                    disabled={sending || (!text.trim() && !chatAttachments.length)}
                    className="p-1.5 rounded-xl active:scale-95 disabled:opacity-40 transition-all"
                    style={{ background: "#f5c518", color: "#0f0b07" }}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {thread.status === "cloture" && (
                <div className="px-4 py-2 text-[10px] text-center border-t shrink-0" style={{ borderColor: "#2e2010", color: "#6b5540" }}>
                  Cette discussion est clôturée.
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
}

function SmallAttachment({ att }: { att: Attachment }) {
  const isImage = att.type.startsWith("image/");
  if (isImage) {
    return <img src={att.data} alt={att.name} className="max-w-[150px] max-h-28 rounded-xl object-cover" />;
  }
  return (
    <a href={att.data} download={att.name} className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg" style={{ background: "#1e1610", color: "#a89272", border: "1px solid #2e2010" }}>
      <Paperclip className="w-3 h-3" />{att.name}
    </a>
  );
}
