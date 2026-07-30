import type { Attachment } from "./orders-store";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ThreadStatus = "en_attente" | "pris_en_charge" | "cloture";

export const THREAD_STATUS_LABELS: Record<ThreadStatus, string> = {
  en_attente: "Attente de prise en charge",
  pris_en_charge: "Pris en charge",
  cloture: "Clôturé",
};

export const THREAD_STATUS_COLORS: Record<ThreadStatus, string> = {
  en_attente: "#a89272",
  pris_en_charge: "#f59e0b",
  cloture: "#6b5540",
};

export interface ContactMessage {
  id: string;
  threadId: string;
  from: "client" | "admin";
  text: string;
  attachments: Attachment[];
  createdAt: string;
  read: boolean;
}

export interface ContactThread {
  id: string;
  clientName: string;
  clientPhone?: string;
  subject: string;
  status: ThreadStatus;
  messages: ContactMessage[];
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
}

// ─── Store ────────────────────────────────────────────────────────────────────

const MAX_THREADS = 500;

declare global {
  // eslint-disable-next-line no-var
  var __threadsStore: ContactThread[] | undefined;
}

function getStore(): ContactThread[] {
  if (!global.__threadsStore) global.__threadsStore = [];
  return global.__threadsStore;
}

let _idCounter = 2000;
function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${++_idCounter}`;
}

// ─── Threads CRUD ─────────────────────────────────────────────────────────────

export function createThread(data: {
  clientName: string;
  clientPhone?: string;
  subject: string;
  firstMessage: string;
  attachments?: Attachment[];
}): ContactThread {
  const store = getStore();
  const thread: ContactThread = {
    id: newId("thr"),
    clientName: data.clientName,
    clientPhone: data.clientPhone,
    subject: data.subject,
    status: "en_attente",
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.unshift(thread);
  if (store.length > MAX_THREADS) store.splice(MAX_THREADS);
  addContactMessage(thread.id, "client", data.firstMessage, data.attachments ?? []);
  return thread;
}

export function getThreads(archived = false): ContactThread[] {
  return getStore().filter((t) =>
    archived ? !!t.archivedAt : !t.archivedAt
  );
}

export function getThread(id: string): ContactThread | undefined {
  return getStore().find((t) => t.id === id);
}

export function updateThreadStatus(id: string, status: ThreadStatus): ContactThread | null {
  const thread = getThread(id);
  if (!thread) return null;
  thread.status = status;
  thread.updatedAt = new Date().toISOString();
  if (status === "cloture" && !thread.archivedAt) {
    thread.archivedAt = new Date().toISOString();
  }
  return thread;
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export function addContactMessage(
  threadId: string,
  from: "client" | "admin",
  text: string,
  attachments: Attachment[]
): ContactMessage | null {
  const thread = getThread(threadId);
  if (!thread) return null;
  const msg: ContactMessage = {
    id: newId("cmsg"),
    threadId,
    from,
    text,
    attachments,
    createdAt: new Date().toISOString(),
    read: from === "admin",
  };
  thread.messages.push(msg);
  thread.updatedAt = new Date().toISOString();
  return msg;
}

export function markThreadMessagesRead(threadId: string, asAdmin: boolean): void {
  const thread = getThread(threadId);
  if (!thread) return;
  thread.messages.forEach((m) => {
    if (asAdmin && m.from === "client") m.read = true;
    if (!asAdmin && m.from === "admin") m.read = true;
  });
}

export function countUnreadThreadMessages(asAdmin: boolean): number {
  return getThreads().reduce((sum, thread) => {
    const unread = thread.messages.filter((m) =>
      asAdmin ? m.from === "client" && !m.read : m.from === "admin" && !m.read
    ).length;
    return sum + unread;
  }, 0);
}
