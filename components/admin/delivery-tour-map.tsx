"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Navigation,
  RotateCcw,
  BookMarked,
  CheckSquare,
  Square,
  EyeOff,
  Truck,
} from "lucide-react";
import type { Order } from "@/lib/orders-store";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/orders-store";

// ─── Types ────────────────────────────────────────────────────────────────────

type DeliveryDay = "today" | "j1" | "j2" | "j3plus" | "none";

interface StopOrder extends Order {
  day: DeliveryDay;
  lat: number | null;
  lng: number | null;
  geocoded: boolean;
  selected: boolean;
  stopIndex: number | null; // null = not in route
}

const DAY_COLORS: Record<DeliveryDay, string> = {
  today:  "#ef4444",  // rouge — aujourd'hui
  j1:     "#f97316",  // orange — J+1
  j2:     "#eab308",  // jaune — J+2
  j3plus: "#22c55e",  // vert — J+3+
  none:   "#6b7280",  // gris — sans date
};

const DAY_LABELS: Record<DeliveryDay, string> = {
  today:  "Aujourd'hui",
  j1:     "J+1",
  j2:     "J+2",
  j3plus: "J+3 et +",
  none:   "Sans date",
};

// Rough geocode from address string — for demo uses a simple hash-based offset
function estimateCoords(address: string): [number, number] {
  // Seed a deterministic offset from address string
  let hash = 0;
  for (let i = 0; i < address.length; i++) hash = (hash * 31 + address.charCodeAt(i)) | 0;
  const latOff = ((Math.abs(hash) % 400) - 200) * 0.0003;
  const lngOff = ((Math.abs(hash >> 4) % 400) - 200) * 0.0004;
  return [44.8378 + latOff, -0.5792 + lngOff];
}

function assignDay(createdAt: string): DeliveryDay {
  const created = new Date(createdAt);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - created.getTime()) / 86400000);
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "j1";
  if (diffDays === 2) return "j2";
  if (diffDays >= 3) return "j3plus";
  return "none";
}

// ─── Itinerary sidebar stop card ──────────────────────────────────────────────

function StopCard({
  stop,
  index,
  onToggle,
  onRemove,
}: {
  stop: StopOrder;
  index: number;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const dayColor = DAY_COLORS[stop.day];
  const statusColor = ORDER_STATUS_COLORS[stop.status];
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 border-b"
      style={{ borderColor: "#1e1510" }}
    >
      {/* Stop number bubble */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
        style={{ background: dayColor, color: "#fff" }}
      >
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-semibold truncate"
          style={{ color: "#f9f3e8" }}
        >
          {stop.clientName}
        </p>
        <p
          className="text-[10px] truncate mt-0.5"
          style={{ color: "#a89272" }}
        >
          {stop.clientAddress}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full"
            style={{
              background: `${statusColor}18`,
              color: statusColor,
              border: `1px solid ${statusColor}33`,
            }}
          >
            {ORDER_STATUS_LABELS[stop.status]}
          </span>
          <span
            className="text-[10px] font-bold"
            style={{ color: "#f5c518" }}
          >
            {stop.currentTotal.toFixed(2)} €
          </span>
        </div>
      </div>
      <button
        onClick={() => onRemove(stop.id)}
        className="shrink-0 p-1 rounded opacity-50 hover:opacity-100 transition-opacity"
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
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const departureMarkerRef = useRef<any>(null);
  const stopMarkersRef = useRef<Map<string, any>>(new Map());
  const routeLayerRef = useRef<any>(null);

  const [departure, setDeparture] = useState<[number, number]>([44.8558, -0.5792]);
  const [stops, setStops] = useState<StopOrder[]>([]);
  const [routeKm, setRouteKm] = useState(0);
  const [mapReady, setMapReady] = useState(false);
  const [savedRoute, setSavedRoute] = useState<string | null>(null);
  const [hiddenDelivered, setHiddenDelivered] = useState(true);

  // Build stop list from orders (exclude "livree" by default)
  useEffect(() => {
    const activeOrders = hiddenDelivered
      ? orders.filter((o) => o.status !== "livree")
      : orders;

    setStops(
      activeOrders.map((o) => {
        const [lat, lng] = estimateCoords(o.clientAddress ?? o.clientName);
        const day = assignDay(o.createdAt);
        return {
          ...o,
          day,
          lat,
          lng,
          geocoded: true,
          selected: false,
          stopIndex: null,
        };
      })
    );
  }, [orders, hiddenDelivered]);

  // ── Init Leaflet ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    import("leaflet").then((mod) => {
      const L = mod.default;

      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        center: departure,
        zoom: 12,
        scrollWheelZoom: true,
      });

      // OpenStreetMap standard tiles — free, no auth
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Draggable departure marker (red)
      const depIcon = L.divIcon({
        className: "",
        html: `<div style="width:22px;height:22px;background:#ef4444;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.5);cursor:grab"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const depMarker = L.marker(departure, { icon: depIcon, draggable: true })
        .bindTooltip(
          `<div style="background:#1a1208;color:#f9f3e8;padding:5px 9px;border-radius:7px;font-size:11px;border:1px solid #2e2010"><b style="color:#ef4444">Point de départ</b><br/><span style="color:#a89272">Glisse pour déplacer</span></div>`,
          { direction: "top", opacity: 1, permanent: false }
        )
        .addTo(map);

      depMarker.on("dragend", (e: any) => {
        const { lat, lng } = e.target.getLatLng();
        setDeparture([lat, lng]);
      });

      map.on("click", (e: any) => {
        const { lat, lng } = e.latlng;
        depMarker.setLatLng([lat, lng]);
        setDeparture([lat, lng]);
      });

      departureMarkerRef.current = depMarker;
      leafletMapRef.current = map;
      setMapReady(true);
    });

    return () => {
      leafletMapRef.current?.remove();
      leafletMapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Render stop markers when stops change ───────────────────────────────────
  useEffect(() => {
    if (!mapReady || !leafletMapRef.current) return;

    import("leaflet").then((mod) => {
      const L = mod.default;
      const map = leafletMapRef.current;

      // Clear old markers
      stopMarkersRef.current.forEach((m) => m.remove());
      stopMarkersRef.current.clear();

      const selectedStops = stops.filter((s) => s.selected && s.lat && s.lng);
      const unselectedStops = stops.filter((s) => !s.selected && s.lat && s.lng);

      // Draw selected stops as numbered markers
      selectedStops.forEach((stop, idx) => {
        const color = DAY_COLORS[stop.day];
        const icon = L.divIcon({
          className: "",
          html: `<div style="width:28px;height:28px;background:${color};border-radius:50%;border:2px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:12px;box-shadow:0 2px 8px rgba(0,0,0,0.5)">${idx + 1}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        const marker = L.marker([stop.lat!, stop.lng!], { icon })
          .bindTooltip(
            `<div style="background:#1a1208;color:#f9f3e8;padding:6px 10px;border-radius:8px;font-size:11px;border:1px solid #2e2010;min-width:140px">
              <b style="color:${color}">#${idx + 1} — ${stop.clientName}</b><br/>
              <span style="color:#a89272">${stop.clientAddress}</span><br/>
              <span style="color:#f5c518;font-weight:600">${stop.currentTotal.toFixed(2)} €</span>
            </div>`,
            { direction: "top", opacity: 1 }
          )
          .addTo(map);
        stopMarkersRef.current.set(stop.id, marker);
      });

      // Draw unselected stops as small dim dots
      unselectedStops.forEach((stop) => {
        const color = DAY_COLORS[stop.day];
        const icon = L.divIcon({
          className: "",
          html: `<div style="width:14px;height:14px;background:${color};border-radius:50%;border:1.5px solid #fff;opacity:0.55;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });
        const marker = L.marker([stop.lat!, stop.lng!], { icon })
          .bindTooltip(
            `<div style="background:#1a1208;color:#f9f3e8;padding:5px 9px;border-radius:7px;font-size:11px;border:1px solid #2e2010">${stop.clientName} — clic pour sélectionner</div>`,
            { direction: "top", opacity: 1 }
          )
          .addTo(map);

        marker.on("click", () => {
          setStops((prev) =>
            prev.map((s) => (s.id === stop.id ? { ...s, selected: true } : s))
          );
        });
        stopMarkersRef.current.set(stop.id, marker);
      });

      // ── Draw route polyline (departure → selected stops in order) ──────────
      if (routeLayerRef.current) {
        routeLayerRef.current.remove();
        routeLayerRef.current = null;
      }

      if (selectedStops.length > 0) {
        const pts: [number, number][] = [
          departure,
          ...selectedStops.map((s) => [s.lat!, s.lng!] as [number, number]),
        ];
        routeLayerRef.current = L.polyline(pts, {
          color: "#f5c518",
          weight: 3,
          opacity: 0.85,
          dashArray: "6 4",
        }).addTo(map);

        // Compute rough km (Haversine sum)
        let km = 0;
        for (let i = 0; i < pts.length - 1; i++) {
          const [lat1, lng1] = pts[i];
          const [lat2, lng2] = pts[i + 1];
          const R = 6371;
          const dLat = ((lat2 - lat1) * Math.PI) / 180;
          const dLng = ((lng2 - lng1) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((lat1 * Math.PI) / 180) *
              Math.cos((lat2 * Math.PI) / 180) *
              Math.sin(dLng / 2) ** 2;
          km += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        }
        setRouteKm(km);
      } else {
        setRouteKm(0);
      }
    });
  }, [stops, mapReady, departure]);

  const selectedStops = stops.filter((s) => s.selected);
  const totalDelivered = orders.filter((o) => o.status === "livree").length;

  const handleSelectAll = () =>
    setStops((prev) => prev.map((s) => ({ ...s, selected: true })));
  const handleDeselectAll = () =>
    setStops((prev) => prev.map((s) => ({ ...s, selected: false })));
  const handleRemoveFromRoute = (id: string) =>
    setStops((prev) =>
      prev.map((s) => (s.id === id ? { ...s, selected: false } : s))
    );
  const handleSave = () => {
    const names = selectedStops.map((s) => s.clientName).join(", ");
    setSavedRoute(names || null);
  };
  const handleReset = () => {
    setDeparture([44.8558, -0.5792]);
    setStops((prev) => prev.map((s) => ({ ...s, selected: false })));
    if (departureMarkerRef.current && leafletMapRef.current) {
      departureMarkerRef.current.setLatLng([44.8558, -0.5792]);
      leafletMapRef.current.flyTo([44.8378, -0.5792], 12, { duration: 0.8 });
    }
  };

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{ background: "#0a0703" }}
    >
      {/* ── Header ──────────────────────────────────────────────────────────── */}
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
            Clique sur la carte (ou glisse le point rouge) pour définir ton point de départ, puis choisis les commandes à assurer.
          </p>
        </div>
      </div>

      {/* ── Day legend ──────────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-4 px-5 py-2.5 border-b shrink-0 flex-wrap"
        style={{ background: "#0d0906", borderColor: "#1a1208" }}
      >
        {/* Departure */}
        <div className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-full border-2 border-white"
            style={{ background: "#ef4444" }}
          />
          <span className="text-xs" style={{ color: "#f9f3e8" }}>
            Départ
          </span>
        </div>
        {(Object.keys(DAY_LABELS) as DeliveryDay[]).map((d) => (
          <div key={d} className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: DAY_COLORS[d] }}
            />
            <span className="text-xs" style={{ color: "#a89272" }}>
              {DAY_LABELS[d]}
            </span>
          </div>
        ))}
      </div>

      {/* ── Map + Sidebar ────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Map */}
        <div className="flex-1 relative">
          <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
          {!mapReady && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: "#0a0703" }}
            >
              <div
                className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: "#2e2010", borderTopColor: "#f5c518" }}
              />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div
          className="w-72 shrink-0 flex flex-col border-l overflow-hidden"
          style={{ background: "#0f0b07", borderColor: "#2e2010" }}
        >
          {/* Sidebar header */}
          <div
            className="px-4 py-3 border-b shrink-0"
            style={{ borderColor: "#2e2010" }}
          >
            <div className="flex items-center justify-between mb-1">
              <h3
                className="font-bold text-sm"
                style={{ color: "#f9f3e8" }}
              >
                Itinéraire optimisé
              </h3>
            </div>
            <p className="text-xs" style={{ color: "#6b5540" }}>
              {selectedStops.length} arrêt{selectedStops.length !== 1 ? "s" : ""}
              &nbsp;·&nbsp;~{routeKm.toFixed(1)} km par la route
            </p>
          </div>

          {/* Action buttons */}
          <div
            className="flex items-center gap-1.5 px-3 py-2.5 border-b shrink-0"
            style={{ borderColor: "#1a1208" }}
          >
            <button
              onClick={handleSelectAll}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:opacity-80"
              style={{ background: "#1a1208", border: "1px solid #2e2010", color: "#f9f3e8" }}
            >
              <CheckSquare className="w-3 h-3" />
              Tout sélectionner
            </button>
            <button
              onClick={handleDeselectAll}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:opacity-80"
              style={{ background: "#1a1208", border: "1px solid #2e2010", color: "#f9f3e8" }}
            >
              <Square className="w-3 h-3" />
              Tout retirer
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:opacity-80 ml-auto"
              style={{ background: savedRoute ? "#2D9A3E22" : "#1a1208", border: `1px solid ${savedRoute ? "#2D9A3E55" : "#2e2010"}`, color: savedRoute ? "#2D9A3E" : "#a89272" }}
            >
              <BookMarked className="w-3 h-3" />
              {savedRoute ? "Sauvegardé" : "Mémoriser"}
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg transition-all hover:opacity-80"
              style={{ background: "#1a1208", border: "1px solid #2e2010", color: "#6b5540" }}
              title="Réinitialiser"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Stop list */}
          <div className="flex-1 overflow-y-auto">
            {selectedStops.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center"
              >
                <Navigation
                  className="w-8 h-8 opacity-20"
                  style={{ color: "#f5c518" }}
                />
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
                  onToggle={(id) =>
                    setStops((prev) =>
                      prev.map((s) =>
                        s.id === id ? { ...s, selected: !s.selected } : s
                      )
                    )
                  }
                  onRemove={handleRemoveFromRoute}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Footer bar ──────────────────────────────────────────────────────── */}
      {totalDelivered > 0 && hiddenDelivered && (
        <div
          className="flex items-center justify-between px-5 py-2.5 border-t shrink-0"
          style={{ borderColor: "#1a1208", background: "#0d0906" }}
        >
          <div className="flex items-center gap-2">
            <EyeOff className="w-3.5 h-3.5" style={{ color: "#6b5540" }} />
            <p className="text-xs" style={{ color: "#6b5540" }}>
              <span style={{ color: "#a89272" }}>
                {totalDelivered} commande{totalDelivered > 1 ? "s" : ""} livrée{totalDelivered > 1 ? "s" : ""} masquée{totalDelivered > 1 ? "s" : ""} de la carte
              </span>
              {" "}(visible dans Archives commandes).
            </p>
          </div>
          <button
            onClick={() => setHiddenDelivered(false)}
            className="text-[11px] underline shrink-0 transition-opacity hover:opacity-70"
            style={{ color: "#f5c518" }}
          >
            Afficher
          </button>
        </div>
      )}
    </div>
  );
}
