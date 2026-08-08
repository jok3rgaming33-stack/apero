"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Navigation,
  RotateCcw,
  BookMarked,
  CheckSquare,
  Square,
  EyeOff,
  Eye,
  Truck,
  Loader2,
  Route,
} from "lucide-react";
import type { Order } from "@/lib/orders-store";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/orders-store";
// CSS Leaflet obligatoire — sans lui les tuiles se fragmentent (256px mal positionnées).
import "leaflet/dist/leaflet.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type DeliveryDay = "today" | "j1" | "j2" | "j3plus" | "none";

interface StopOrder extends Order {
  day: DeliveryDay;
  lat: number | null;
  lng: number | null;
  geocoding: "pending" | "done" | "failed";
  selected: boolean;
}

const DAY_COLORS: Record<DeliveryDay, string> = {
  today:  "#ef4444",
  j1:     "#f97316",
  j2:     "#eab308",
  j3plus: "#22c55e",
  none:   "#6b7280",
};

const DAY_LABELS: Record<DeliveryDay, string> = {
  today:  "Aujourd'hui",
  j1:     "J+1",
  j2:     "J+2",
  j3plus: "J+3 et +",
  none:   "Sans date",
};

function assignDay(createdAt: string): DeliveryDay {
  const diffDays = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / 86_400_000
  );
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "j1";
  if (diffDays === 2) return "j2";
  if (diffDays >= 3) return "j3plus";
  return "none";
}

// ─── Geocoding via Nominatim (OpenStreetMap) ──────────────────────────────────

const geocodeCache = new Map<string, [number, number] | null>();

async function geocodeAddress(address: string): Promise<[number, number] | null> {
  if (geocodeCache.has(address)) return geocodeCache.get(address)!;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=fr`;
    const res = await fetch(url, { headers: { "Accept-Language": "fr" } });
    const data = await res.json();
    if (data?.[0]) {
      const coords: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      geocodeCache.set(address, coords);
      return coords;
    }
  } catch {
    // fallback below
  }
  // Deterministic offset around Bordeaux if geocoding fails
  let h = 0;
  for (let i = 0; i < address.length; i++) h = (h * 31 + address.charCodeAt(i)) | 0;
  const coords: [number, number] = [
    44.8378 + ((Math.abs(h) % 400) - 200) * 0.0003,
    -0.5792 + ((Math.abs(h >> 4) % 400) - 200) * 0.0004,
  ];
  geocodeCache.set(address, coords);
  return coords;
}

// ─── OSRM road routing ────────────────────────────────────────────────────────

interface OsrmResult {
  geometry: [number, number][]; // array of [lng, lat]
  distance: number;             // metres
  duration: number;             // seconds
}

async function fetchOsrmRoute(
  waypoints: [number, number][] // [lat, lng]
): Promise<OsrmResult | null> {
  if (waypoints.length < 2) return null;
  // OSRM expects lng,lat
  const coords = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(";");
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.code === "Ok" && data.routes?.[0]) {
      const route = data.routes[0];
      // GeoJSON geometry is [lng, lat], convert to [lat, lng] for Leaflet
      const geometry: [number, number][] = route.geometry.coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng]
      );
      return {
        geometry,
        distance: route.distance,
        duration: route.duration,
      };
    }
  } catch {
    // network failure — return null, polyline will be skipped
  }
  return null;
}

// ─── OSRM trip optimisation (TSP nearest neighbour via /trip endpoint) ─────────

async function fetchOsrmTrip(
  waypoints: [number, number][] // [lat, lng]
): Promise<{ geometry: [number, number][]; distance: number; duration: number; order: number[] } | null> {
  if (waypoints.length < 2) return null;
  const coords = waypoints.map(([lat, lng]) => `${lng},${lat}`).join(";");
  try {
    // source=first keeps departure as start; roundtrip=false for one-way tour
    const url = `https://router.project-osrm.org/trip/v1/driving/${coords}?source=first&roundtrip=false&overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.code === "Ok" && data.trips?.[0]) {
      const trip = data.trips[0];
      const geometry: [number, number][] = trip.geometry.coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng]
      );
      // waypoint_index tells us the optimised stop order
      const order: number[] = data.waypoints
        .sort((a: any, b: any) => a.waypoint_index - b.waypoint_index)
        .map((w: any) => w.trips_index ?? 0);
      return { geometry, distance: trip.distance, duration: trip.duration, order };
    }
  } catch {
    // fallback to sequential route
  }
  return null;
}

// ─── Stop card ────────────────────────────────────────────────────────────────

function StopCard({
  stop,
  index,
  onRemove,
}: {
  stop: StopOrder;
  index: number;
  onRemove: (id: string) => void;
}) {
  const color = DAY_COLORS[stop.day];
  const statusColor = ORDER_STATUS_COLORS[stop.status];
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 border-b"
      style={{ borderColor: "#1e1510" }}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
        style={{ background: color, color: "#fff" }}
      >
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold truncate" style={{ color: "#f9f3e8" }}>
          {stop.clientName}
        </p>
        <p className="text-[10px] truncate mt-0.5" style={{ color: "#a89272" }}>
          {stop.clientAddress}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{ background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}33` }}
          >
            {ORDER_STATUS_LABELS[stop.status]}
          </span>
          <span className="text-[10px] font-bold" style={{ color: "#f5c518" }}>
            {stop.currentTotal.toFixed(2)} €
          </span>
        </div>
      </div>
      <button
        onClick={() => onRemove(stop.id)}
        className="shrink-0 p-1 rounded opacity-50 hover:opacity-100 transition-opacity mt-0.5"
        style={{ color: "#a89272" }}
        title="Retirer de l'itinéraire"
      >
        <EyeOff className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DeliveryTourMap({ orders }: { orders: Order[] }) {
  const mapRef            = useRef<HTMLDivElement>(null);
  const leafletMapRef     = useRef<any>(null);
  const depMarkerRef      = useRef<any>(null);
  const stopMarkersRef    = useRef<Map<string, any>>(new Map());
  const routeLayerRef     = useRef<any>(null);

  const [departure, setDeparture]   = useState<[number, number]>([44.8558, -0.5792]);
  const [stops, setStops]           = useState<StopOrder[]>([]);
  const [routeKm, setRouteKm]       = useState(0);
  const [routeMins, setRouteMins]   = useState(0);
  const [mapReady, setMapReady]     = useState(false);
  const [routingBusy, setRoutingBusy] = useState(false);
  const [savedRoute, setSavedRoute] = useState<string | null>(null);
  const [hiddenDelivered, setHiddenDelivered] = useState(true);
  const [optimised, setOptimised]   = useState(false);

  // ── Build stop list from orders ──────────────────────────────────────────────
  useEffect(() => {
    const source = hiddenDelivered
      ? orders.filter((o) => o.status !== "livree")
      : orders;

    setStops((prev) => {
      const prevMap = new Map(prev.map((s) => [s.id, s]));
      return source.map((o) => {
        const existing = prevMap.get(o.id);
        return {
          ...o,
          day: assignDay(o.createdAt),
          lat: existing?.lat ?? null,
          lng: existing?.lng ?? null,
          geocoding: existing?.geocoding ?? "pending",
          selected: existing?.selected ?? false,
        };
      });
    });
  }, [orders, hiddenDelivered]);

  // ── Geocode pending stops ────────────────────────────────────────────────────
  useEffect(() => {
    const pending = stops.filter((s) => s.geocoding === "pending");
    if (pending.length === 0) return;

    pending.forEach(async (stop) => {
      const coords = await geocodeAddress(stop.clientAddress ?? stop.clientName);
      setStops((prev) =>
        prev.map((s) =>
          s.id === stop.id
            ? { ...s, lat: coords?.[0] ?? null, lng: coords?.[1] ?? null, geocoding: coords ? "done" : "failed" }
            : s
        )
      );
    });
  }, [stops]);

  // ── Init Leaflet map ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;
    let cancelled = false;
    let ro: ResizeObserver | null = null;

    import("leaflet").then((mod) => {
      if (cancelled || !mapRef.current || leafletMapRef.current) return;
      const L = mod.default;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current, {
        center: departure,
        zoom: 12,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      // Departure marker — red, draggable (style Apero)
      const depIcon = L.divIcon({
        className: "apero-map-icon",
        html: `<div style="width:24px;height:24px;background:#ef4444;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,0.5);cursor:grab;display:flex;align-items:center;justify-content:center">
          <div style="width:6px;height:6px;background:#fff;border-radius:50%"></div>
        </div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const depMarker = L.marker(departure, { icon: depIcon, draggable: true })
        .bindTooltip(
          `<div style="background:#1a1208;color:#f9f3e8;padding:5px 9px;border-radius:7px;font-size:11px;border:1px solid #2e2010">
            <b style="color:#ef4444">Point de départ</b><br/>
            <span style="color:#a89272">Glisse ou clique sur la carte</span>
          </div>`,
          { direction: "top", opacity: 1 }
        )
        .addTo(map);

      depMarker.on("dragend", (e: any) => {
        const { lat, lng } = e.target.getLatLng();
        setDeparture([lat, lng]);
      });

      // Clicking the map repositions departure
      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        depMarker.setLatLng([lat, lng]);
        setDeparture([lat, lng]);
      });

      depMarkerRef.current = depMarker;
      leafletMapRef.current = map;
      setMapReady(true);

      // Critical: recalcule la taille des tuiles une fois le conteneur mesuré
      // (évite le rendu « tuiles en damiers » vu en prod).
      const fixSize = () => {
        try {
          map.invalidateSize({ animate: false });
        } catch {
          /* ignore */
        }
      };
      requestAnimationFrame(() => {
        fixSize();
        setTimeout(fixSize, 50);
        setTimeout(fixSize, 250);
        setTimeout(fixSize, 600);
      });

      if (typeof ResizeObserver !== "undefined" && mapRef.current) {
        ro = new ResizeObserver(() => fixSize());
        ro.observe(mapRef.current);
      }
      window.addEventListener("resize", fixSize);
      (map as any)._aperoFixSize = fixSize;
      (map as any)._aperoOnResize = () => fixSize();
    });

    return () => {
      cancelled = true;
      ro?.disconnect();
      const map = leafletMapRef.current;
      if (map) {
        const onResize = (map as any)._aperoOnResize as (() => void) | undefined;
        if (onResize) window.removeEventListener("resize", onResize);
        map.remove();
      }
      leafletMapRef.current = null;
      depMarkerRef.current = null;
      setMapReady(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Render stop markers & road route ────────────────────────────────────────
  const renderMarkersAndRoute = useCallback(async () => {
    if (!mapReady || !leafletMapRef.current) return;

    const L = (await import("leaflet")).default;
    const map = leafletMapRef.current;

    // Clear previous markers
    stopMarkersRef.current.forEach((m) => m.remove());
    stopMarkersRef.current.clear();

    const selected = stops.filter((s) => s.selected && s.lat && s.lng);
    const unselected = stops.filter((s) => !s.selected && s.lat && s.lng);

    // Numbered selected markers
    selected.forEach((stop, idx) => {
      const color = DAY_COLORS[stop.day];
      const icon = L.divIcon({
        className: "apero-map-icon",
        html: `<div style="width:30px;height:30px;background:${color};border-radius:50%;border:2.5px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:13px;box-shadow:0 2px 10px rgba(0,0,0,0.55)">${idx + 1}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
      const m = L.marker([stop.lat!, stop.lng!], { icon })
        .bindTooltip(
          `<div style="background:#1a1208;color:#f9f3e8;padding:7px 11px;border-radius:9px;font-size:12px;border:1px solid #2e2010;min-width:160px">
            <b style="color:${color}">#${idx + 1} — ${stop.clientName}</b><br/>
            <span style="color:#a89272;font-size:10px">${stop.clientAddress}</span><br/>
            <span style="color:#f5c518;font-weight:700">${stop.currentTotal.toFixed(2)} €</span>
          </div>`,
          { direction: "top", opacity: 1 }
        )
        .addTo(map);
      stopMarkersRef.current.set(stop.id, m);
    });

    // Small dim dots for unselected
    unselected.forEach((stop) => {
      const color = DAY_COLORS[stop.day];
      const icon = L.divIcon({
        className: "apero-map-icon",
        html: `<div style="width:14px;height:14px;background:${color};border-radius:50%;border:1.5px solid rgba(255,255,255,0.6);opacity:0.5;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      const m = L.marker([stop.lat!, stop.lng!], { icon })
        .bindTooltip(
          `<div style="background:#1a1208;color:#f9f3e8;padding:5px 9px;border-radius:7px;font-size:11px;border:1px solid #2e2010">
            <b>${stop.clientName}</b><br/>
            <span style="color:#a89272">Clic pour ajouter à la tournée</span>
          </div>`,
          { direction: "top", opacity: 1 }
        )
        .addTo(map);
      m.on("click", () =>
        setStops((prev) => prev.map((s) => s.id === stop.id ? { ...s, selected: true } : s))
      );
      stopMarkersRef.current.set(stop.id, m);
    });

    // Remove old route layer
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    if (selected.length === 0) {
      setRouteKm(0);
      setRouteMins(0);
      return;
    }

    // Build waypoints: departure + selected stops (in current order)
    const waypoints: [number, number][] = [
      departure,
      ...selected.map((s) => [s.lat!, s.lng!] as [number, number]),
    ];

    setRoutingBusy(true);
    const result = await fetchOsrmRoute(waypoints);
    setRoutingBusy(false);

    if (result) {
      routeLayerRef.current = L.polyline(result.geometry, {
        color: "#f5c518",
        weight: 4,
        opacity: 0.9,
        dashArray: undefined, // solid line = road route
      }).addTo(map);

      setRouteKm(result.distance / 1000);
      setRouteMins(Math.round(result.duration / 60));

      // Cadre la vue départ + arrêts (comme BB33)
      try {
        const pts: [number, number][] = [
          departure,
          ...selected.map((s) => [s.lat!, s.lng!] as [number, number]),
        ];
        if (pts.length > 1) {
          map.fitBounds(pts, { padding: [48, 48], maxZoom: 14 });
        }
      } catch {
        /* ignore */
      }
    }

    // Recalcule la grille de tuiles après mise à jour des layers
    try {
      map.invalidateSize({ animate: false });
    } catch {
      /* ignore */
    }
  }, [stops, mapReady, departure]);

  useEffect(() => {
    renderMarkersAndRoute();
  }, [renderMarkersAndRoute]);

  // ── Optimise route order via OSRM /trip ──────────────────────────────────────
  const handleOptimise = useCallback(async () => {
    const selected = stops.filter((s) => s.selected && s.lat && s.lng);
    if (selected.length < 2) return;

    const waypoints: [number, number][] = [
      departure,
      ...selected.map((s) => [s.lat!, s.lng!] as [number, number]),
    ];

    setRoutingBusy(true);
    const result = await fetchOsrmTrip(waypoints);
    setRoutingBusy(false);

    if (!result) return;

    // Reorder selected stops according to OSRM trip order (skip index 0 = departure)
    const stopOrder = result.order.slice(1).map((i) => i - 1); // 0-indexed into selected
    const reordered = stopOrder
      .map((i) => selected[i])
      .filter(Boolean);

    if (reordered.length !== selected.length) return; // safety

    // Rebuild stops array preserving unselected
    const unselected = stops.filter((s) => !s.selected);
    setStops([
      ...reordered.map((s) => ({ ...s, selected: true })),
      ...unselected,
    ]);
    setOptimised(true);
  }, [stops, departure]);

  const selectedStops  = stops.filter((s) => s.selected);
  const totalDelivered = orders.filter((o) => o.status === "livree").length;
  const geocodingCount = stops.filter((s) => s.geocoding === "pending").length;

  const handleSelectAll   = () => setStops((p) => p.map((s) => ({ ...s, selected: true })));
  const handleDeselectAll = () => { setStops((p) => p.map((s) => ({ ...s, selected: false }))); setOptimised(false); };
  const handleRemove      = (id: string) => setStops((p) => p.map((s) => s.id === id ? { ...s, selected: false } : s));
  const handleSave        = () => setSavedRoute(selectedStops.map((s) => s.clientName).join(", ") || null);
  const handleReset       = () => {
    const home: [number, number] = [44.8558, -0.5792];
    setDeparture(home);
    setOptimised(false);
    setStops((p) => p.map((s) => ({ ...s, selected: false })));
    if (depMarkerRef.current && leafletMapRef.current) {
      depMarkerRef.current.setLatLng(home);
      leafletMapRef.current.flyTo([44.8378, -0.5792], 12, { duration: 0.8 });
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: "#0a0703" }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-5 py-4 border-b shrink-0"
        style={{ background: "#0f0b07", borderColor: "#2e2010" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "rgba(245,197,24,0.12)" }}
        >
          <Truck className="w-4 h-4" style={{ color: "#f5c518" }} />
        </div>
        <div className="flex-1 min-w-0">
          <h2
            className="font-bold text-base leading-tight"
            style={{ fontFamily: "var(--font-playfair)", color: "#f9f3e8" }}
          >
            Tournée de livraison
          </h2>
          <p className="text-xs" style={{ color: "#6b5540" }}>
            Clique sur la carte (ou glisse le point rouge) pour définir le point de départ, puis sélectionne les commandes.
          </p>
        </div>
        {geocodingCount > 0 && (
          <div className="flex items-center gap-1.5 shrink-0">
            <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: "#f5c518" }} />
            <span className="text-xs" style={{ color: "#6b5540" }}>
              Géocodage ({geocodingCount})
            </span>
          </div>
        )}
      </div>

      {/* ── Day legend ────────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-4 px-5 py-2.5 border-b shrink-0 flex-wrap"
        style={{ background: "#0d0906", borderColor: "#1a1208" }}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border-2 border-white" style={{ background: "#ef4444" }} />
          <span className="text-xs" style={{ color: "#f9f3e8" }}>Départ</span>
        </div>
        {(Object.keys(DAY_LABELS) as DeliveryDay[]).map((d) => (
          <div key={d} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ background: DAY_COLORS[d] }} />
            <span className="text-xs" style={{ color: "#a89272" }}>{DAY_LABELS[d]}</span>
          </div>
        ))}
      </div>

      {/* ── Map + Sidebar (hauteur min comme BB33 pour un rendu tuiles correct) ── */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">

        {/* Map — conteneur avec hauteur réelle (évite height:100% sur parent flou) */}
        <div
          className="relative min-h-[420px] w-full flex-1 overflow-hidden lg:min-h-0"
          style={{ background: "#0d0906" }}
        >
          <div
            ref={mapRef}
            className="absolute inset-0 z-0 h-full w-full"
            style={{ background: "#0d0906" }}
            aria-label="Carte tournée de livraison"
          />
          {/* Styles Leaflet adaptés au thème Apero (fond sombre, pas de tuiles cassées) */}
          <style
            dangerouslySetInnerHTML={{
              __html: `
            .leaflet-container {
              background: #0d0906 !important;
              font: inherit;
              width: 100% !important;
              height: 100% !important;
            }
            .leaflet-control-attribution {
              background: rgba(15, 11, 7, 0.85) !important;
              color: #6b5540 !important;
            }
            .leaflet-control-attribution a {
              color: #a89272 !important;
            }
            .apero-map-icon {
              background: transparent !important;
              border: none !important;
            }
            .leaflet-tooltip {
              background: transparent !important;
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
            }
            .leaflet-tooltip-top:before {
              display: none !important;
            }
          `,
            }}
          />
          {!mapReady && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center"
              style={{ background: "#0a0703" }}
            >
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#f5c518" }} />
            </div>
          )}
          {routingBusy && (
            <div
              className="absolute left-1/2 top-3 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold"
              style={{ background: "#1a1208", border: "1px solid #2e2010", color: "#f5c518" }}
            >
              <Loader2 className="w-3 h-3 animate-spin" />
              Calcul de l&apos;itinéraire…
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div
          className="flex max-h-[42vh] w-full shrink-0 flex-col overflow-hidden border-t lg:max-h-none lg:w-72 lg:border-l lg:border-t-0"
          style={{
            background: "#0f0b07",
            borderColor: "#2e2010",
          }}
        >
          {/* Sidebar header */}
          <div className="px-4 py-3 border-b shrink-0" style={{ borderColor: "#2e2010" }}>
            <h3 className="font-bold text-sm mb-1" style={{ color: "#f9f3e8" }}>
              Itinéraire optimisé
            </h3>
            <p className="text-xs" style={{ color: "#6b5540" }}>
              {selectedStops.length} arrêt{selectedStops.length !== 1 ? "s" : ""}
              &nbsp;·&nbsp;{routingBusy ? "…" : `~${routeKm.toFixed(1)} km`}
              {routeMins > 0 && !routingBusy && ` · ~${routeMins} min`}
            </p>
            {optimised && (
              <p className="text-[10px] mt-0.5 font-semibold" style={{ color: "#22c55e" }}>
                Ordre optimisé par OSRM
              </p>
            )}
          </div>

          {/* Actions */}
          <div
            className="flex items-center gap-1.5 px-3 py-2.5 border-b shrink-0 flex-wrap"
            style={{ borderColor: "#1a1208" }}
          >
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold hover:opacity-80 transition-opacity"
              style={{ background: "#1a1208", border: "1px solid #2e2010", color: "#f9f3e8" }}
            >
              <CheckSquare className="w-3 h-3" />
              Tout sélectionner
            </button>
            <button
              onClick={handleDeselectAll}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold hover:opacity-80 transition-opacity"
              style={{ background: "#1a1208", border: "1px solid #2e2010", color: "#f9f3e8" }}
            >
              <Square className="w-3 h-3" />
              Tout retirer
            </button>
            <button
              onClick={handleOptimise}
              disabled={selectedStops.length < 2 || routingBusy}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold hover:opacity-80 transition-opacity disabled:opacity-40"
              style={{ background: "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.25)", color: "#f5c518" }}
              title="Optimiser l'ordre des arrêts par la route"
            >
              <Route className="w-3 h-3" />
              Optimiser
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold hover:opacity-80 transition-opacity"
              style={{
                background: savedRoute ? "#2D9A3E22" : "#1a1208",
                border: `1px solid ${savedRoute ? "#2D9A3E55" : "#2e2010"}`,
                color: savedRoute ? "#2D9A3E" : "#a89272",
              }}
            >
              <BookMarked className="w-3 h-3" />
              {savedRoute ? "Sauvegardé" : "Mémoriser"}
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg hover:opacity-80 transition-opacity"
              style={{ background: "#1a1208", border: "1px solid #2e2010", color: "#6b5540" }}
              title="Réinitialiser"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Stop list */}
          <div className="min-h-0 flex-1 overflow-y-auto lg:max-h-none" style={{ maxHeight: "none" }}>
            {selectedStops.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
                <Navigation className="w-8 h-8 opacity-20" style={{ color: "#f5c518" }} />
                <p className="text-sm" style={{ color: "#4a3a28" }}>
                  Aucune commande à livrer pour le moment.
                </p>
                <p className="text-xs" style={{ color: "#3a2a18" }}>
                  Clique sur un marqueur de la carte pour l&apos;ajouter à la tournée.
                </p>
              </div>
            ) : (
              selectedStops.map((stop, idx) => (
                <StopCard
                  key={stop.id}
                  stop={stop}
                  index={idx}
                  onRemove={handleRemove}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      {totalDelivered > 0 && (
        <div
          className="flex items-center justify-between px-5 py-2.5 border-t shrink-0"
          style={{ borderColor: "#1a1208", background: "#0d0906" }}
        >
          <div className="flex items-center gap-2">
            <EyeOff className="w-3.5 h-3.5" style={{ color: "#6b5540" }} />
            <p className="text-xs" style={{ color: "#6b5540" }}>
              {totalDelivered} commande{totalDelivered > 1 ? "s" : ""} livrée{totalDelivered > 1 ? "s" : ""} masquée{totalDelivered > 1 ? "s" : ""} de la carte.
            </p>
          </div>
          <button
            onClick={() => setHiddenDelivered((p) => !p)}
            className="flex items-center gap-1.5 text-xs hover:opacity-80 transition-opacity"
            style={{ color: "#f5c518" }}
          >
            {hiddenDelivered ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {hiddenDelivered ? "Afficher" : "Masquer"}
          </button>
        </div>
      )}
    </div>
  );
}
