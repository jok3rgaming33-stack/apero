"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Eye,
  LogOut,
  RefreshCw,
  Trash2,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Clock,
  TrendingUp,
  Users,
  BarChart2,
  Shield,
  LayoutDashboard,
  ShoppingBag,
  Archive,
  MessageSquare,
  Bell,
} from "lucide-react";
import type { Order } from "@/lib/orders-store";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/orders-store";
import type { ContactThread } from "@/lib/messages-store";
import { THREAD_STATUS_LABELS, THREAD_STATUS_COLORS } from "@/lib/messages-store";
import OrderChat from "@/components/admin/order-chat";
import ThreadChat from "@/components/admin/thread-chat";

const ADMIN_SECRET = "aperomaison_admin_2026";

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = "dashboard" | "orders" | "archives" | "messages" | "archived_messages";

const TABS: { id: Tab; label: string; Icon: React.ElementType }[] = [
  { id: "dashboard",         label: "Tableau de bord",       Icon: LayoutDashboard },
  { id: "orders",            label: "Commandes en cours",    Icon: ShoppingBag },
  { id: "archives",          label: "Archives commandes",    Icon: Archive },
  { id: "messages",          label: "Messagerie",            Icon: MessageSquare },
  { id: "archived_messages", label: "Discussions archivées", Icon: Clock },
];

type Visit = {
  id: string;
  page: string;
  referrer: string;
  userAgent: string;
  ip: string;
  timestamp: string;
  date: string;
  time: string;
  device: "desktop" | "mobile" | "tablet" | "unknown";
  browser: string;
};

type Stats = {
  total: number;
  today: number;
  topPages: [string, number][];
  devices: { desktop: number; mobile: number; tablet: number; unknown: number };
  last7days: { date: string; count: number }[];
};

const PAGE_LABELS: Record<string, string> = {
  "/": "Accueil",
  "/aperos": "Nos formules",
  "/comment": "Comment ça marche",
  "/nous": "Nous",
  "/panier": "Panier",
  "/commande": "Tunnel de commande",
  "/compte": "Mon compte",
};

function DeviceIcon({ device }: { device: Visit["device"] }) {
  if (device === "mobile") return <Smartphone className="w-3.5 h-3.5" />;
  if (device === "tablet") return <Tablet className="w-3.5 h-3.5" />;
  if (device === "desktop") return <Monitor className="w-3.5 h-3.5" />;
  return <Globe className="w-3.5 h-3.5" />;
}

// ─── Login screen ────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (username === "admin" && password === "admin1234.") {
      onLogin();
    } else {
      setError("Identifiants incorrects.");
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#0a0703" }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 border"
        style={{ background: "#110e07", borderColor: "#2e2010" }}
      >
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.2)" }}
          >
            <Shield className="w-5 h-5" style={{ color: "#f5c518" }} />
          </div>
          <div>
            <p className="font-bold" style={{ color: "#f9f3e8" }}>ApéroMaison</p>
            <p className="text-xs" style={{ color: "#6b5540" }}>Espace administrateur</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#a89272" }}>
              Nom d&apos;utilisateur
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: "#0f0b07", border: "1px solid #2e2010", color: "#f9f3e8" }}
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "#a89272" }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
              className="w-full px-4 py-3 rounded-xl text-sm outline-none"
              style={{ background: "#0f0b07", border: "1px solid #2e2010", color: "#f9f3e8" }}
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-xs text-center py-2 rounded-xl" style={{ background: "rgba(220,38,38,0.1)", color: "#f87171", border: "1px solid rgba(220,38,38,0.2)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold text-sm mt-2"
            style={{ background: "#f5c518", color: "#0f0b07" }}
          >
            Accéder au tableau de bord
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, accent }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; accent?: string;
}) {
  return (
    <div
      className="rounded-2xl p-5 border flex flex-col gap-3"
      style={{ background: "#110e07", borderColor: "#2e2010" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: "#6b5540" }}>{label}</span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(245,197,24,0.08)" }}
        >
          <Icon className="w-4 h-4" style={{ color: accent ?? "#f5c518" }} />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold" style={{ color: "#f9f3e8" }}>{value}</p>
        {sub && <p className="text-xs mt-1" style={{ color: "#6b5540" }}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── Mini bar chart ──────────────────────────────────────────────────────────
function MiniBarChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map((d) => (
        <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-sm transition-all"
            style={{
              height: `${Math.max((d.count / max) * 56, d.count > 0 ? 4 : 0)}px`,
              background: d.count > 0 ? "#f5c518" : "#2e2010",
              opacity: d.count > 0 ? 1 : 0.4,
            }}
          />
          <span className="text-[9px]" style={{ color: "#6b5540" }}>
            {d.date.slice(0, 5)}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [pageFilter, setPageFilter] = useState("all");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/visits", {
        headers: { "x-admin-token": ADMIN_SECRET },
      });
      const data = await res.json();
      setVisits(data.visits ?? []);
      setStats(data.stats ?? null);
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-refresh toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  async function handleClear() {
    if (!confirm("Supprimer tous les logs de visites ?")) return;
    await fetch("/api/admin/visits?action=clear", {
      headers: { "x-admin-token": ADMIN_SECRET },
    });
    fetchData();
  }

  const filtered = visits.filter((v) => {
    const matchText = filter
      ? v.page.includes(filter) || v.ip.includes(filter) || v.browser.toLowerCase().includes(filter.toLowerCase())
      : true;
    const matchPage = pageFilter === "all" ? true : v.page === pageFilter;
    const matchDevice = deviceFilter === "all" ? true : v.device === deviceFilter;
    return matchText && matchPage && matchDevice;
  });

  const uniquePages = [...new Set(visits.map((v) => v.page))].sort();

  return (
    <div className="min-h-screen" style={{ background: "#0a0703", color: "#f9f3e8" }}>
      {/* Header */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b"
        style={{ background: "#0a0703", borderColor: "#1e1608" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(245,197,24,0.1)" }}
          >
            <BarChart2 className="w-4 h-4" style={{ color: "#f5c518" }} />
          </div>
          <div>
            <span className="font-bold text-sm">Admin</span>
            <span className="text-xs ml-2" style={{ color: "#6b5540" }}>ApéroMaison</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: "#6b5540" }}>
            Mis à jour à {lastRefresh.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </span>
          <button
            onClick={fetchData}
            className="p-2 rounded-lg border"
            style={{ borderColor: "#2e2010", color: "#a89272" }}
            title="Rafraîchir"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border"
            style={{ borderColor: "#2e2010", color: "#a89272" }}
          >
            <LogOut className="w-3.5 h-3.5" /> Déconnexion
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col gap-8">

        {/* Stats */}
        {stats && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Visites totales" value={stats.total} icon={Eye} />
              <StatCard label="Visites aujourd'hui" value={stats.today} icon={TrendingUp} accent="#2D9A3E" />
              <StatCard
                label="Appareils desktop"
                value={stats.devices.desktop}
                sub={`Mobile: ${stats.devices.mobile} · Tablette: ${stats.devices.tablet}`}
                icon={Monitor}
              />
              <StatCard
                label="Pages uniques"
                value={uniquePages.length}
                sub="routes visitées"
                icon={Users}
              />
            </div>

            {/* Last 7 days chart + top pages */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div
                className="rounded-2xl p-5 border"
                style={{ background: "#110e07", borderColor: "#2e2010" }}
              >
                <p className="text-sm font-semibold mb-4" style={{ color: "#a89272" }}>
                  Visites — 7 derniers jours
                </p>
                <MiniBarChart data={stats.last7days} />
              </div>

              <div
                className="rounded-2xl p-5 border"
                style={{ background: "#110e07", borderColor: "#2e2010" }}
              >
                <p className="text-sm font-semibold mb-4" style={{ color: "#a89272" }}>
                  Pages les plus visitées
                </p>
                <div className="flex flex-col gap-2">
                  {stats.topPages.slice(0, 6).map(([page, count]) => {
                    const maxCount = stats.topPages[0]?.[1] ?? 1;
                    return (
                      <div key={page} className="flex items-center gap-3">
                        <span className="text-xs w-36 truncate" style={{ color: "#a89272" }}>
                          {PAGE_LABELS[page] ?? page}
                        </span>
                        <div className="flex-1 rounded-full h-1.5" style={{ background: "#1e1608" }}>
                          <div
                            className="h-1.5 rounded-full"
                            style={{ width: `${(count / maxCount) * 100}%`, background: "#f5c518" }}
                          />
                        </div>
                        <span className="text-xs font-bold w-6 text-right" style={{ color: "#f5c518" }}>
                          {count}
                        </span>
                      </div>
                    );
                  })}
                  {stats.topPages.length === 0 && (
                    <p className="text-xs" style={{ color: "#6b5540" }}>Aucune donnée</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Logs table */}
        <div
          className="rounded-2xl border overflow-hidden"
          style={{ background: "#110e07", borderColor: "#2e2010" }}
        >
          {/* Table header with filters */}
          <div className="flex flex-wrap items-center gap-3 p-4 border-b" style={{ borderColor: "#1e1608" }}>
            <p className="text-sm font-semibold flex-1" style={{ color: "#f9f3e8" }}>
              Journal des visites
              <span className="ml-2 text-xs font-normal" style={{ color: "#6b5540" }}>
                {filtered.length} entrée{filtered.length > 1 ? "s" : ""}
              </span>
            </p>

            <input
              type="text"
              placeholder="Rechercher (page, IP, navigateur...)"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs outline-none w-52"
              style={{ background: "#0f0b07", border: "1px solid #2e2010", color: "#f9f3e8" }}
            />

            <select
              value={pageFilter}
              onChange={(e) => setPageFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs outline-none"
              style={{ background: "#0f0b07", border: "1px solid #2e2010", color: "#a89272" }}
            >
              <option value="all">Toutes les pages</option>
              {uniquePages.map((p) => (
                <option key={p} value={p}>{PAGE_LABELS[p] ?? p}</option>
              ))}
            </select>

            <select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-xs outline-none"
              style={{ background: "#0f0b07", border: "1px solid #2e2010", color: "#a89272" }}
            >
              <option value="all">Tous appareils</option>
              <option value="desktop">Desktop</option>
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablette</option>
            </select>

            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border"
              style={{ borderColor: "#2e2010", color: "#6b5540" }}
            >
              <Trash2 className="w-3.5 h-3.5" /> Effacer
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: "#0f0b07" }}>
                  {["Date", "Heure", "Page", "Appareil", "Navigateur", "IP", "Référent"].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left font-semibold"
                      style={{ color: "#6b5540", borderBottom: "1px solid #1e1608" }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center" style={{ color: "#6b5540" }}>
                      {loading ? "Chargement..." : "Aucune visite enregistrée pour le moment."}
                    </td>
                  </tr>
                )}
                {filtered.map((v, i) => (
                  <tr
                    key={v.id}
                    style={{
                      background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)",
                      borderBottom: "1px solid #1a1208",
                    }}
                  >
                    <td className="px-4 py-2.5" style={{ color: "#a89272" }}>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 shrink-0" style={{ color: "#6b5540" }} />
                        {v.date}
                      </div>
                    </td>
                    <td className="px-4 py-2.5" style={{ color: "#6b5540" }}>{v.time}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className="px-2 py-0.5 rounded-full font-medium"
                        style={{ background: "rgba(245,197,24,0.08)", color: "#f5c518" }}
                      >
                        {PAGE_LABELS[v.page] ?? v.page}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1.5" style={{ color: "#a89272" }}>
                        <DeviceIcon device={v.device} />
                        <span className="capitalize">{v.device}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5" style={{ color: "#a89272" }}>{v.browser}</td>
                    <td className="px-4 py-2.5 font-mono" style={{ color: "#6b5540" }}>
                      {v.ip === "unknown" ? "—" : v.ip}
                    </td>
                    <td className="px-4 py-2.5 max-w-xs truncate" style={{ color: "#6b5540" }}>
                      {v.referrer ? (
                        <span title={v.referrer}>{v.referrer.replace(/^https?:\/\//, "").slice(0, 40)}</span>
                      ) : (
                        <span style={{ color: "#3a2d1e" }}>Direct</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Orders panel ─────────────────────────────────────────────────────────────

function OrdersPanel({
  orders,
  selectedId,
  onSelect,
  onUpdate,
}: {
  orders: Order[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUpdate: (o: Order) => void;
}) {
  const selected = orders.find((o) => o.id === selectedId) ?? null;
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* List */}
      <div
        className="w-72 shrink-0 overflow-y-auto border-r flex flex-col"
        style={{ borderColor: "#2e2010", background: "#0d0906" }}
      >
        <div className="px-4 py-3 border-b shrink-0" style={{ borderColor: "#2e2010" }}>
          <p className="text-xs" style={{ color: "#6b5540" }}>{orders.length} commande(s)</p>
        </div>
        {orders.length === 0 && (
          <p className="text-xs text-center py-10" style={{ color: "#4a3a28" }}>Aucune commande</p>
        )}
        {orders.map((order) => {
          const unread = order.messages.filter((m) => m.from === "client" && !m.read).length;
          const active = selectedId === order.id;
          return (
            <button
              key={order.id}
              onClick={() => onSelect(order.id)}
              className="flex flex-col gap-1.5 px-4 py-3 border-b text-left"
              style={{ borderColor: "#1a1208", background: active ? "rgba(245,197,24,0.07)" : "transparent" }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold truncate" style={{ color: "#f9f3e8" }}>
                  {order.clientName}
                </span>
                {unread > 0 && (
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0" style={{ background: "#ef4444", color: "#fff" }}>
                    {unread}
                  </span>
                )}
              </div>
              <span
                className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full self-start"
                style={{ background: `${ORDER_STATUS_COLORS[order.status]}20`, color: ORDER_STATUS_COLORS[order.status] }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: ORDER_STATUS_COLORS[order.status] }} />
                {ORDER_STATUS_LABELS[order.status]}
              </span>
              <div className="flex items-center justify-between">
                <span className="text-[10px]" style={{ color: "#6b5540" }}>{fmtDate(order.createdAt)}</span>
                <span className="text-[10px] font-bold" style={{ color: "#f5c518" }}>{order.currentTotal.toFixed(2)} €</span>
              </div>
            </button>
          );
        })}
      </div>
      {/* Chat */}
      <div className="flex-1 overflow-hidden">
        {selected ? (
          <OrderChat key={selected.id} order={selected} onUpdate={onUpdate} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm" style={{ color: "#4a3a28" }}>Sélectionner une commande</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Threads panel ────────────────────────────────────────────────────────────

function ThreadsPanel({
  threads,
  selectedId,
  onSelect,
  onUpdate,
}: {
  threads: ContactThread[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUpdate: (t: ContactThread) => void;
}) {
  const selected = threads.find((t) => t.id === selectedId) ?? null;
  return (
    <div className="flex flex-1 overflow-hidden">
      <div
        className="w-72 shrink-0 overflow-y-auto border-r flex flex-col"
        style={{ borderColor: "#2e2010", background: "#0d0906" }}
      >
        <div className="px-4 py-3 border-b shrink-0" style={{ borderColor: "#2e2010" }}>
          <p className="text-xs" style={{ color: "#6b5540" }}>{threads.length} discussion(s)</p>
        </div>
        {threads.length === 0 && (
          <p className="text-xs text-center py-10" style={{ color: "#4a3a28" }}>Aucune discussion</p>
        )}
        {threads.map((thread) => {
          const unread = thread.messages.filter((m) => m.from === "client" && !m.read).length;
          const active = selectedId === thread.id;
          return (
            <button
              key={thread.id}
              onClick={() => onSelect(thread.id)}
              className="flex flex-col gap-1.5 px-4 py-3 border-b text-left"
              style={{ borderColor: "#1a1208", background: active ? "rgba(245,197,24,0.07)" : "transparent" }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold truncate" style={{ color: "#f9f3e8" }}>
                  {thread.clientName}
                </span>
                {unread > 0 && (
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0" style={{ background: "#ef4444", color: "#fff" }}>
                    {unread}
                  </span>
                )}
              </div>
              <p className="text-[10px] truncate" style={{ color: "#a89272" }}>{thread.subject}</p>
              <div className="flex items-center justify-between gap-2">
                <span
                  className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full"
                  style={{ background: `${THREAD_STATUS_COLORS[thread.status]}20`, color: THREAD_STATUS_COLORS[thread.status] }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: THREAD_STATUS_COLORS[thread.status] }} />
                  {THREAD_STATUS_LABELS[thread.status]}
                </span>
                <span className="text-[10px]" style={{ color: "#6b5540" }}>{fmtDate(thread.createdAt)}</span>
              </div>
            </button>
          );
        })}
      </div>
      <div className="flex-1 overflow-hidden">
        {selected ? (
          <ThreadChat key={selected.id} thread={selected} onUpdate={onUpdate} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-sm" style={{ color: "#4a3a28" }}>Sélectionner une discussion</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>("dashboard");

  const [orders, setOrders] = useState<Order[]>([]);
  const [archivedOrders, setArchivedOrders] = useState<Order[]>([]);
  const [threads, setThreads] = useState<ContactThread[]>([]);
  const [archivedThreads, setArchivedThreads] = useState<ContactThread[]>([]);
  const [notifications, setNotifications] = useState({ orderMessages: 0, contactMessages: 0, total: 0 });

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  // Vérifie si déjà connecté (sessionStorage)
  useEffect(() => {
    if (sessionStorage.getItem("admin_authed") === "1") setAuthed(true);
  }, []);

  const fetchOrders = useCallback(async () => {
    const [active, archived, notifs] = await Promise.all([
      fetch("/api/orders").then((r) => r.json()),
      fetch("/api/orders?archived=true").then((r) => r.json()),
      fetch("/api/notifications?admin=true").then((r) => r.json()),
    ]);
    setOrders(Array.isArray(active) ? active : []);
    setArchivedOrders(Array.isArray(archived) ? archived : []);
    setNotifications(notifs);
  }, []);

  const fetchThreads = useCallback(async () => {
    const [active, archived] = await Promise.all([
      fetch("/api/contact").then((r) => r.json()),
      fetch("/api/contact?archived=true").then((r) => r.json()),
    ]);
    setThreads(Array.isArray(active) ? active : []);
    setArchivedThreads(Array.isArray(archived) ? archived : []);
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetchOrders();
    fetchThreads();
    const id = setInterval(() => { fetchOrders(); fetchThreads(); }, 4000);
    return () => clearInterval(id);
  }, [authed, fetchOrders, fetchThreads]);

  function handleLogin() {
    sessionStorage.setItem("admin_authed", "1");
    setAuthed(true);
  }

  function handleLogout() {
    sessionStorage.removeItem("admin_authed");
    setAuthed(false);
  }

  if (!authed) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#0a0703" }}>

      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <aside
        className="w-56 shrink-0 flex flex-col border-r"
        style={{ background: "#0f0b07", borderColor: "#2e2010" }}
      >
        <div className="px-5 py-5 border-b" style={{ borderColor: "#2e2010" }}>
          <p className="font-bold text-base" style={{ fontFamily: "var(--font-playfair)", color: "#f9f3e8" }}>
            Apéro<span style={{ color: "#f5c518" }}>Maison</span>
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#6b5540" }}>Administration</p>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          {TABS.map(({ id, label, Icon }) => {
            const badge =
              id === "orders" ? notifications.orderMessages :
              id === "messages" ? notifications.contactMessages : 0;
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all"
                style={{
                  background: active ? "rgba(245,197,24,0.1)" : "transparent",
                  color: active ? "#f5c518" : "#a89272",
                  border: active ? "1px solid rgba(245,197,24,0.2)" : "1px solid transparent",
                }}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1 text-xs font-medium">{label}</span>
                {badge > 0 && (
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: "#ef4444", color: "#fff" }}>
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t" style={{ borderColor: "#2e2010" }}>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 w-full rounded-xl text-sm hover:opacity-70 transition-opacity"
            style={{ color: "#6b5540" }}
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <header
          className="flex items-center justify-between px-6 py-4 border-b shrink-0"
          style={{ borderColor: "#2e2010", background: "#0f0b07" }}
        >
          <h2 className="font-semibold text-sm" style={{ color: "#f9f3e8" }}>
            {TABS.find((t) => t.id === tab)?.label}
          </h2>
          <div className="flex items-center gap-3">
            {notifications.total > 0 && (
              <div className="relative">
                <Bell className="w-4 h-4" style={{ color: "#a89272" }} />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ background: "#ef4444", color: "#fff" }}>
                  {notifications.total > 9 ? "9+" : notifications.total}
                </span>
              </div>
            )}
            <span className="text-xs" style={{ color: "#6b5540" }}>admin</span>
          </div>
        </header>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden flex flex-col">

          {tab === "dashboard" && (
            <div className="flex-1 overflow-y-auto">
              <Dashboard onLogout={handleLogout} />
            </div>
          )}

          {tab === "orders" && (
            <OrdersPanel
              orders={orders}
              selectedId={selectedOrderId}
              onSelect={setSelectedOrderId}
              onUpdate={(updated) => setOrders((prev) => prev.map((o) => o.id === updated.id ? updated : o))}
            />
          )}

          {tab === "archives" && (
            <OrdersPanel
              orders={archivedOrders}
              selectedId={selectedOrderId}
              onSelect={setSelectedOrderId}
              onUpdate={(updated) => setArchivedOrders((prev) => prev.map((o) => o.id === updated.id ? updated : o))}
            />
          )}

          {tab === "messages" && (
            <ThreadsPanel
              threads={threads}
              selectedId={selectedThreadId}
              onSelect={setSelectedThreadId}
              onUpdate={(updated) => setThreads((prev) => prev.map((t) => t.id === updated.id ? updated : t))}
            />
          )}

          {tab === "archived_messages" && (
            <ThreadsPanel
              threads={archivedThreads}
              selectedId={selectedThreadId}
              onSelect={setSelectedThreadId}
              onUpdate={(updated) => setArchivedThreads((prev) => prev.map((t) => t.id === updated.id ? updated : t))}
            />
          )}

        </div>
      </div>
    </div>
  );
}
