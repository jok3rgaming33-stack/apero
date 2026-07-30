// ─── Types ────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | "en_attente"
  | "validee"
  | "en_preparation"
  | "livraison_en_cours"
  | "livree";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  en_attente: "En attente de validation",
  validee: "Validée",
  en_preparation: "En cours de préparation",
  livraison_en_cours: "Livraison en cours",
  livree: "Livrée",
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  en_attente: "#a89272",
  validee: "#3b82f6",
  en_preparation: "#f59e0b",
  livraison_en_cours: "#8b5cf6",
  livree: "#2D9A3E",
};

export interface Attachment {
  id: string;
  name: string;
  type: string; // mime type
  size: number;
  data: string; // base64
  uploadedAt: string;
  uploadedBy: "client" | "admin";
}

export interface OrderMessage {
  id: string;
  orderId: string;
  from: "client" | "admin";
  text: string;
  attachments: Attachment[];
  createdAt: string;
  read: boolean;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  clientEmail?: string;
  items: OrderItem[];
  originalTotal: number;
  currentTotal: number;
  status: OrderStatus;
  messages: OrderMessage[];
  loyaltyPoints: number;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
  deliveryDate?: string;
  notes?: string;
}

// ─── Store ────────────────────────────────────────────────────────────────────

const MAX_ORDERS = 500;

declare global {
  // eslint-disable-next-line no-var
  var __ordersStore: Order[] | undefined;
}

function getStore(): Order[] {
  if (!global.__ordersStore) global.__ordersStore = [];
  return global.__ordersStore;
}

let _idCounter = 1000;
function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${++_idCounter}`;
}

// ─── Orders CRUD ──────────────────────────────────────────────────────────────

export function createOrder(data: {
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  clientEmail?: string;
  items: OrderItem[];
}): Order {
  const store = getStore();
  const total = data.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const order: Order = {
    id: newId("cmd"),
    clientName: data.clientName,
    clientPhone: data.clientPhone,
    clientAddress: data.clientAddress,
    clientEmail: data.clientEmail,
    items: data.items,
    originalTotal: total,
    currentTotal: total,
    status: "en_attente",
    messages: [],
    loyaltyPoints: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  store.unshift(order);
  if (store.length > MAX_ORDERS) store.splice(MAX_ORDERS);
  // System message
  addOrderMessage(order.id, "admin", "Commande reçue — en attente de validation.", []);
  return order;
}

export function getOrders(archived = false): Order[] {
  return getStore().filter((o) =>
    archived ? !!o.archivedAt : !o.archivedAt
  );
}

export function getOrder(id: string): Order | undefined {
  return getStore().find((o) => o.id === id);
}

export function updateOrderStatus(id: string, status: OrderStatus): Order | null {
  const order = getOrder(id);
  if (!order) return null;
  const prev = order.status;
  order.status = status;
  order.updatedAt = new Date().toISOString();
  // Archive when delivered
  if (status === "livree" && !order.archivedAt) {
    order.archivedAt = new Date().toISOString();
    order.loyaltyPoints = Math.floor(order.currentTotal);
  }
  if (prev !== status) {
    const label = ORDER_STATUS_LABELS[status];
    const extra = status === "livree"
      ? ` Vous avez gagné ${order.loyaltyPoints} points fidélité.`
      : "";
    addOrderMessage(id, "admin", `Statut mis à jour : ${label}.${extra}`, []);
  }
  return order;
}

export function updateOrderItems(id: string, items: OrderItem[]): Order | null {
  const order = getOrder(id);
  if (!order) return null;
  order.items = items;
  order.currentTotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  order.updatedAt = new Date().toISOString();
  addOrderMessage(id, "admin", `Commande modifiée — nouveau total : ${order.currentTotal.toFixed(2)} €.`, []);
  return order;
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export function addOrderMessage(
  orderId: string,
  from: "client" | "admin",
  text: string,
  attachments: Attachment[]
): OrderMessage | null {
  const order = getOrder(orderId);
  if (!order) return null;
  const msg: OrderMessage = {
    id: newId("msg"),
    orderId,
    from,
    text,
    attachments,
    createdAt: new Date().toISOString(),
    read: from === "admin", // admin messages start read; client messages start unread
  };
  order.messages.push(msg);
  order.updatedAt = new Date().toISOString();
  return msg;
}

export function markOrderMessagesRead(orderId: string, asAdmin: boolean): void {
  const order = getOrder(orderId);
  if (!order) return;
  order.messages.forEach((m) => {
    if (asAdmin && m.from === "client") m.read = true;
    if (!asAdmin && m.from === "admin") m.read = true;
  });
}

export function countUnreadOrderMessages(asAdmin: boolean): number {
  return getOrders().reduce((sum, order) => {
    const unread = order.messages.filter((m) =>
      asAdmin ? m.from === "client" && !m.read : m.from === "admin" && !m.read
    ).length;
    return sum + unread;
  }, 0);
}
