/**
 * Store in-memory des visites.
 * En production, remplacer par une base de données (Neon, Supabase, etc.).
 * Les données persistent tant que le process Node.js tourne.
 */

export type Visit = {
  id: string;
  page: string;
  referrer: string;
  userAgent: string;
  ip: string;
  timestamp: string; // ISO
  date: string;      // YYYY-MM-DD
  time: string;      // HH:MM
  device: "desktop" | "mobile" | "tablet" | "unknown";
  browser: string;
};

// Singleton global (survit aux hot-reloads via globalThis)
const g = globalThis as typeof globalThis & { __visits?: Visit[] };
if (!g.__visits) g.__visits = [];

export const visitsStore = {
  add(visit: Omit<Visit, "id" | "date" | "time">) {
    const now = new Date(visit.timestamp);
    const entry: Visit = {
      ...visit,
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      date: now.toLocaleDateString("fr-FR"),
      time: now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
    };
    g.__visits!.unshift(entry); // plus récent en premier
    // Garde au max 2000 entrées
    if (g.__visits!.length > 2000) g.__visits!.length = 2000;
    return entry;
  },

  getAll(): Visit[] {
    return g.__visits ?? [];
  },

  clear() {
    g.__visits = [];
  },

  stats() {
    const all = g.__visits ?? [];
    const today = new Date().toLocaleDateString("fr-FR");
    const todayVisits = all.filter((v) => v.date === today);

    const pageCounts: Record<string, number> = {};
    for (const v of all) {
      pageCounts[v.page] = (pageCounts[v.page] ?? 0) + 1;
    }
    const topPages = Object.entries(pageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const deviceCounts = { desktop: 0, mobile: 0, tablet: 0, unknown: 0 };
    for (const v of all) deviceCounts[v.device]++;

    // Visites par jour sur les 7 derniers jours
    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days[d.toLocaleDateString("fr-FR")] = 0;
    }
    for (const v of all) {
      if (v.date in days) days[v.date]++;
    }

    return {
      total: all.length,
      today: todayVisits.length,
      topPages,
      devices: deviceCounts,
      last7days: Object.entries(days).map(([date, count]) => ({ date, count })),
    };
  },
};
