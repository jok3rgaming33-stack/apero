"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  MapPin,
  Search,
  Navigation,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Truck,
  Package,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Layers,
  Info,
} from "lucide-react";
import {
  DELIVERY_ZONES,
  STATUS_LABELS,
  STATUS_COLORS,
  getZoneByPostalCode,
  type DeliveryZone,
  type ZoneStatus,
} from "@/lib/delivery-zones";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MapProps {
  /** Mode intégré dans le formulaire de commande */
  compact?: boolean;
  /** Adresse pré-remplie depuis le formulaire de commande */
  prefilledAddress?: string;
  prefilledPostalCode?: string;
  /** Callback quand une zone valide est sélectionnée */
  onZoneSelected?: (zone: DeliveryZone | null) => void;
}

interface GeoResult {
  lat: number;
  lon: number;
  display_name: string;
  address: {
    postcode?: string;
    city?: string;
    town?: string;
    village?: string;
    road?: string;
    house_number?: string;
    state?: string;
  };
}

// ─── Zone status badge ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ZoneStatus }) {
  const color = STATUS_COLORS[status];
  const label = STATUS_LABELS[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ background: `${color}18`, color, border: `1px solid ${color}44` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

// ─── Zone info card ───────────────────────────────────────────────────────────

function ZoneCard({
  zone,
  highlight,
}: {
  zone: DeliveryZone;
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded-xl p-3 border transition-all"
      style={{
        background: highlight ? `${zone.color}12` : "#1a1208",
        borderColor: highlight ? zone.color : "#2e2010",
        boxShadow: highlight ? `0 0 0 1px ${zone.color}55` : "none",
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5"
            style={{ background: zone.color }}
          />
          <p className="text-sm font-semibold" style={{ color: "#f9f3e8" }}>
            {zone.name}
          </p>
        </div>
        <StatusBadge status={zone.status} />
      </div>
      <div
        className="grid grid-cols-3 gap-2 text-xs"
        style={{ color: "#a89272" }}
      >
        <div className="flex flex-col gap-0.5">
          <span style={{ color: "#6b5540" }}>Délai</span>
          <span className="font-semibold" style={{ color: "#f9f3e8" }}>
            ~{zone.eta} min
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span style={{ color: "#6b5540" }}>Frais</span>
          <span className="font-semibold" style={{ color: zone.fee === 0 ? "#2D9A3E" : "#f9f3e8" }}>
            {zone.fee === 0 ? "Gratuit" : `${zone.fee.toFixed(2)} €`}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span style={{ color: "#6b5540" }}>Min.</span>
          <span className="font-semibold" style={{ color: "#f9f3e8" }}>
            {zone.minOrder} €
          </span>
        </div>
      </div>
      {zone.codePostal.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {zone.codePostal.map((cp) => (
            <span
              key={cp}
              className="text-[10px] px-1.5 py-0.5 rounded"
              style={{ background: "#2a1f12", color: "#6b5540" }}
            >
              {cp}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function DeliveryMap({
  compact = false,
  prefilledAddress = "",
  prefilledPostalCode = "",
  onZoneSelected,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const polygonLayersRef = useRef<Map<string, any>>(new Map());
  const markerRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);

  const [searchQuery, setSearchQuery] = useState(prefilledAddress);
  const [searching, setSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<GeoResult | null>(null);
  const [detectedZone, setDetectedZone] = useState<DeliveryZone | null>(null);
  const [searchError, setSearchError] = useState("");

  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(!compact);
  const [showAllZones, setShowAllZones] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locating, setLocating] = useState(false);

  // ── Init Leaflet (client only) ──────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    let L: any;
    import("leaflet").then((mod) => {
      L = mod.default;

      // Fix default icon paths for Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Create map centred on Bordeaux
      const map = L.map(mapRef.current!, {
        center: [44.8378, -0.5792],
        zoom: compact ? 11 : 12,
        zoomControl: !compact,
        attributionControl: true,
        scrollWheelZoom: true,
      });

      // OpenStreetMap standard tiles (free, no auth required)
      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }
      ).addTo(map);

      // Draw delivery zones
      DELIVERY_ZONES.forEach((zone) => {
        const color = zone.color;
        const statusOpacity: Record<ZoneStatus, number> = {
          active: 0.18,
          busy: 0.12,
          unavailable: 0.07,
        };
        const fill = statusOpacity[zone.status];

        const poly = L.polygon(zone.polygon, {
          color,
          weight: 1.5,
          opacity: 0.7,
          fillColor: color,
          fillOpacity: fill,
          className: `delivery-zone zone-${zone.id}`,
        }).addTo(map);

        poly.on("mouseover", () => {
          setHoveredZone(zone.id);
          poly.setStyle({ fillOpacity: fill + 0.12, weight: 2.5, opacity: 1 });
        });
        poly.on("mouseout", () => {
          setHoveredZone((prev) => (prev === zone.id ? null : prev));
          poly.setStyle({ fillOpacity: fill, weight: 1.5, opacity: 0.7 });
        });
        poly.on("click", () => {
          setSelectedZone((prev) => (prev === zone.id ? null : zone.id));
          onZoneSelected?.(zone);
        });

        // Tooltip
        poly.bindTooltip(
          `<div style="background:#1a1208;border:1px solid ${color}55;color:#f9f3e8;padding:6px 10px;border-radius:8px;font-size:12px;font-weight:600">
            <span style="color:${color}">${zone.name}</span><br/>
            <span style="color:#a89272;font-weight:400">~${zone.eta} min · ${zone.fee === 0 ? "Gratuit" : zone.fee + " €"}</span>
          </div>`,
          { sticky: true, direction: "top", opacity: 1, className: "leaflet-apero-tooltip" }
        );

        polygonLayersRef.current.set(zone.id, poly);
      });

      // Custom depot/livreur markers
      const depotIcon = L.divIcon({
        className: "",
        html: `<div style="width:28px;height:28px;background:#f5c518;border-radius:50%;border:2px solid #0f0b07;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.5)">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f0b07" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
               </div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      const truckIcon = L.divIcon({
        className: "",
        html: `<div style="width:26px;height:26px;background:#E8580A;border-radius:50%;border:2px solid #0f0b07;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.5)">
                 <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
               </div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      // Static delivery points
      const STATIC_POINTS = [
        { lat: 44.8437, lng: -0.5736, icon: depotIcon, label: "Dépôt Principal — Bordeaux Centre" },
        { lat: 44.8610, lng: -0.5680, icon: truckIcon, label: "Livreur #1 — Secteur Centre" },
        { lat: 44.8490, lng: -0.6150, icon: truckIcon, label: "Livreur #2 — Secteur Ouest" },
        { lat: 44.8600, lng: -0.5050, icon: truckIcon, label: "Livreur #3 — Rive Droite" },
        { lat: 44.8850, lng: -0.5620, icon: depotIcon, label: "Hub Nord — Bacalan" },
      ];

      STATIC_POINTS.forEach(({ lat, lng, icon, label }) => {
        L.marker([lat, lng], { icon })
          .bindTooltip(
            `<div style="background:#1a1208;border:1px solid #2e2010;color:#f9f3e8;padding:5px 9px;border-radius:7px;font-size:11px">${label}</div>`,
            { direction: "top", opacity: 1, className: "leaflet-apero-tooltip" }
          )
          .addTo(map);
      });

      // Leaflet attribution control (bottom-right, tiny)
      L.control.attribution({ prefix: false, position: "bottomright" }).addTo(map);

      leafletMapRef.current = map;
      setMapReady(true);
    });

    return () => {
      leafletMapRef.current?.remove();
      leafletMapRef.current = null;
    };
  }, []);

  // ── Sync selected zone polygon style ───────────────────────────────────────
  useEffect(() => {
    polygonLayersRef.current.forEach((poly, zoneId) => {
      const zone = DELIVERY_ZONES.find((z) => z.id === zoneId);
      if (!zone) return;
      const fill =
        zone.status === "active" ? 0.18 : zone.status === "busy" ? 0.12 : 0.07;
      const isSelected = selectedZone === zoneId;
      poly.setStyle({
        fillOpacity: isSelected ? fill + 0.2 : fill,
        weight: isSelected ? 3 : 1.5,
        opacity: isSelected ? 1 : 0.7,
      });
    });
  }, [selectedZone]);

  // ── Geocode address ────────────────────────────────────────────────────────
  const geocode = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setSearching(true);
    setSearchError("");
    setDetectedZone(null);

    try {
      const encoded = encodeURIComponent(`${query}, Bordeaux, France`);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&addressdetails=1&limit=1&countrycodes=fr`,
        { headers: { "Accept-Language": "fr" } }
      );
      const data: GeoResult[] = await res.json();

      if (!data.length) {
        setSearchError("Adresse introuvable. Essaie avec le code postal.");
        setSearching(false);
        return;
      }

      const result = data[0];
      setSearchResult(result);

      const lat = parseFloat(result.lat as unknown as string);
      const lon = parseFloat(result.lon as unknown as string);

      // Find matching zone by postal code first, then by polygon
      const cp = result.address.postcode ?? "";
      let zone = getZoneByPostalCode(cp) ?? null;

      // Place pin on map
      if (leafletMapRef.current) {
        import("leaflet").then((mod) => {
          const L = mod.default;
          markerRef.current?.remove();

          const pinIcon = L.divIcon({
            className: "",
            html: `<div style="width:32px;height:32px;background:#f5c518;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid #0f0b07;box-shadow:0 4px 12px rgba(0,0,0,0.6)"></div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
          });

          markerRef.current = L.marker([lat, lon], { icon: pinIcon })
            .bindPopup(
              `<div style="background:#1a1208;color:#f9f3e8;padding:8px 12px;border-radius:10px;font-size:12px;min-width:160px">
                <b style="color:#f5c518">${result.address.road ?? "Adresse"} ${result.address.house_number ?? ""}</b><br/>
                <span style="color:#a89272">${result.address.city ?? result.address.town ?? "Bordeaux"} ${cp}</span><br/>
                ${zone ? `<span style="color:${zone.color};font-weight:600">${zone.name}</span>` : `<span style="color:#ef4444">Hors zone</span>`}
              </div>`,
              { className: "leaflet-apero-popup" }
            )
            .addTo(leafletMapRef.current)
            .openPopup();

          leafletMapRef.current.flyTo([lat, lon], 14, { duration: 1.2 });
        });
      }

      setDetectedZone(zone);
      onZoneSelected?.(zone);

      if (!zone) {
        setSearchError("Cette adresse est hors de notre zone de livraison.");
      } else {
        setSelectedZone(zone.id);
      }
    } catch {
      setSearchError("Erreur de connexion. Vérifie ta connexion internet.");
    }
    setSearching(false);
  }, [onZoneSelected]);

  // Auto-geocode when prefilled postal code changes
  useEffect(() => {
    if (prefilledPostalCode && mapReady) {
      const zone = getZoneByPostalCode(prefilledPostalCode);
      if (zone) {
        setDetectedZone(zone);
        setSelectedZone(zone.id);
        onZoneSelected?.(zone);
      }
    }
  }, [prefilledPostalCode, mapReady, onZoneSelected]);

  // ── Geolocation ────────────────────────────────────────────────────────────
  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);
        setLocating(false);

        if (leafletMapRef.current) {
          import("leaflet").then((mod) => {
            const L = mod.default;
            const pulseDot = L.divIcon({
              className: "",
              html: `<div style="width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 0 0 4px rgba(59,130,246,0.3)"></div>`,
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            });
            L.marker([latitude, longitude], { icon: pulseDot })
              .bindTooltip("Ma position", { direction: "top", opacity: 1 })
              .addTo(leafletMapRef.current);
            leafletMapRef.current.flyTo([latitude, longitude], 13, { duration: 1 });
          });
        }

        // Reverse geocode
        fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          { headers: { "Accept-Language": "fr" } }
        )
          .then((r) => r.json())
          .then((data) => {
            const cp = data.address?.postcode ?? "";
            const zone = getZoneByPostalCode(cp);
            setDetectedZone(zone ?? null);
            setSelectedZone(zone?.id ?? null);
            onZoneSelected?.(zone ?? null);
            if (data.address?.road) {
              setSearchQuery(
                `${data.address.road}${data.address.house_number ? " " + data.address.house_number : ""}, ${data.address.postcode ?? ""}`
              );
            }
          })
          .catch(() => {});
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  };

  const activeZones = DELIVERY_ZONES.filter((z) => z.status !== "unavailable");
  const displayedZones = showAllZones ? DELIVERY_ZONES : activeZones;
  const currentSelected = DELIVERY_ZONES.find((z) => z.id === selectedZone) ?? null;

  return (
    <div
      className="flex flex-col gap-0 rounded-2xl overflow-hidden border"
      style={{
        background: "#0f0b07",
        borderColor: "#2e2010",
        boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      {!compact && (
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "#2e2010", background: "#0d0906" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(245,197,24,0.12)" }}
            >
              <Truck className="w-4 h-4" style={{ color: "#f5c518" }} />
            </div>
            <div>
              <h2
                className="font-bold text-base"
                style={{ fontFamily: "var(--font-playfair)", color: "#f9f3e8" }}
              >
                Zone de livraison
              </h2>
              <p className="text-xs" style={{ color: "#6b5540" }}>
                Bordeaux Métropole · Livraison 7j/7 · 19h – 8h
              </p>
            </div>
          </div>

          {/* Stats chips */}
          <div className="hidden md:flex items-center gap-2">
            <span
              className="text-xs px-2.5 py-1 rounded-full font-semibold"
              style={{ background: "#2D9A3E18", color: "#2D9A3E", border: "1px solid #2D9A3E33" }}
            >
              {DELIVERY_ZONES.filter((z) => z.status === "active").length} zones actives
            </span>
            <span
              className="text-xs px-2.5 py-1 rounded-full font-semibold"
              style={{ background: "rgba(245,197,24,0.1)", color: "#f5c518", border: "1px solid rgba(245,197,24,0.2)" }}
            >
              ~30 livreurs actifs
            </span>
          </div>
        </div>
      )}

      {/* ── Search bar ─────────────────────────────────────────────────────── */}
      <div
        className="px-4 py-3 flex gap-2 items-center border-b"
        style={{ background: "#0d0906", borderColor: "#2e2010" }}
      >
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: "#6b5540" }}
          />
          <input
            type="text"
            placeholder="Saisis ton adresse pour vérifier la zone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.nativeEvent.isComposing) geocode(searchQuery);
            }}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-all"
            style={{
              background: "#1a1208",
              border: "1px solid #2e2010",
              color: "#f9f3e8",
            }}
          />
        </div>
        <button
          onClick={() => geocode(searchQuery)}
          disabled={searching || !searchQuery.trim()}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
          style={{ background: "#f5c518", color: "#0f0b07" }}
        >
          {searching ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">Vérifier</span>
        </button>
        <button
          onClick={handleLocate}
          disabled={locating}
          title="Utiliser ma position GPS"
          className="p-2 rounded-xl transition-all disabled:opacity-40"
          style={{ background: "#1a1208", border: "1px solid #2e2010", color: "#a89272" }}
        >
          {locating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* ── Search result banner ────────────────────────────────────────────── */}
      {(searchError || detectedZone) && (
        <div
          className="px-4 py-2.5 flex items-center gap-2.5 border-b text-sm"
          style={{
            borderColor: "#2e2010",
            background: detectedZone
              ? detectedZone.status === "active"
                ? "#2D9A3E12"
                : detectedZone.status === "busy"
                ? "#E8580A12"
                : "#ef444412"
              : "#ef444412",
          }}
        >
          {detectedZone ? (
            detectedZone.status !== "unavailable" ? (
              <CheckCircle2
                className="w-4 h-4 shrink-0"
                style={{ color: STATUS_COLORS[detectedZone.status] }}
              />
            ) : (
              <XCircle className="w-4 h-4 shrink-0" style={{ color: "#ef4444" }} />
            )
          ) : (
            <XCircle className="w-4 h-4 shrink-0" style={{ color: "#ef4444" }} />
          )}
          <p
            style={{
              color: detectedZone
                ? STATUS_COLORS[detectedZone.status]
                : "#ef4444",
            }}
          >
            {detectedZone
              ? detectedZone.status === "active"
                ? `Livraison disponible — ${detectedZone.name} · ~${detectedZone.eta} min${detectedZone.fee === 0 ? " · Gratuit" : ` · ${detectedZone.fee} €`}`
                : detectedZone.status === "busy"
                ? `Zone chargée — ${detectedZone.name} · Délai allongé (~${detectedZone.eta} min)`
                : `Zone indisponible ce soir — ${detectedZone.name}`
              : searchError}
          </p>
        </div>
      )}

      {/* ── Map + sidebar ──────────────────────────────────────────────────── */}
      <div className={`flex ${compact ? "flex-col" : "flex-row"} overflow-hidden`}>

        {/* Map */}
        <div
          className="relative flex-1"
          style={{ height: compact ? "260px" : "480px", minHeight: compact ? "220px" : "380px" }}
        >
          {/* Leaflet CSS */}
          <style>{`
            @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
            .leaflet-apero-tooltip .leaflet-tooltip { background:transparent!important;border:none!important;box-shadow:none!important;padding:0!important }
            .leaflet-apero-popup .leaflet-popup-content-wrapper { background:#1a1208!important;border:1px solid #2e2010!important;border-radius:12px!important;box-shadow:0 8px 24px rgba(0,0,0,0.5)!important;padding:0!important }
            .leaflet-apero-popup .leaflet-popup-tip { background:#1a1208!important }
            .leaflet-apero-popup .leaflet-popup-content { margin:0!important }
            .leaflet-container { background:#0a0703!important }
            .leaflet-control-zoom a { background:#1a1208!important;color:#a89272!important;border-color:#2e2010!important }
            .leaflet-control-zoom a:hover { background:#2a1f12!important;color:#f9f3e8!important }
          `}</style>

          <div ref={mapRef} className="w-full h-full" />

          {/* Loading overlay */}
          {!mapReady && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: "#0a0703" }}
            >
              <div className="flex flex-col items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: "#2e2010", borderTopColor: "#f5c518" }}
                />
                <p className="text-xs" style={{ color: "#6b5540" }}>
                  Chargement de la carte…
                </p>
              </div>
            </div>
          )}

          {/* Map controls overlay */}
          {mapReady && (
            <div className="absolute bottom-3 left-3 flex flex-col gap-2 z-[400]">
              <button
                onClick={() => setShowLegend((v) => !v)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{ background: "#1a1208cc", color: "#a89272", border: "1px solid #2e2010", backdropFilter: "blur(4px)" }}
              >
                <Layers className="w-3.5 h-3.5" />
                Légende
              </button>
            </div>
          )}

          {/* Map legend overlay */}
          {showLegend && mapReady && (
            <div
              className="absolute bottom-12 left-3 z-[400] rounded-xl p-3 flex flex-col gap-1.5 text-xs"
              style={{ background: "#1a1208ee", border: "1px solid #2e2010", backdropFilter: "blur(8px)", minWidth: 160 }}
            >
              <p className="font-semibold mb-1" style={{ color: "#f9f3e8" }}>Légende</p>
              {[
                { label: "Disponible", color: "#2D9A3E" },
                { label: "Chargé", color: "#E8580A" },
                { label: "Indisponible", color: "#6b5540" },
                { label: "Dépôt / Hub", color: "#f5c518", dot: true },
                { label: "Livreur actif", color: "#E8580A", dot: true },
                { label: "Ma position", color: "#3b82f6", dot: true },
              ].map(({ label, color, dot }) => (
                <div key={label} className="flex items-center gap-2">
                  {dot ? (
                    <span className="w-3 h-3 rounded-full border border-white/20" style={{ background: color }} />
                  ) : (
                    <span className="w-3 h-2 rounded" style={{ background: `${color}44`, border: `1px solid ${color}99` }} />
                  )}
                  <span style={{ color: "#a89272" }}>{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Sidebar zones ────────────────────────────────────────────────── */}
        {!compact && (
          <div
            className="w-72 shrink-0 overflow-y-auto flex flex-col border-l"
            style={{ borderColor: "#2e2010", background: "#0d0906" }}
          >
            {/* Selected zone detail */}
            {currentSelected && (
              <div className="px-3 py-3 border-b" style={{ borderColor: "#2e2010" }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#6b5540" }}>
                  Zone sélectionnée
                </p>
                <ZoneCard zone={currentSelected} highlight />
              </div>
            )}

            {/* Zone list header */}
            <div
              className="flex items-center justify-between px-3 py-2.5 border-b shrink-0"
              style={{ borderColor: "#2e2010" }}
            >
              <p className="text-xs font-semibold" style={{ color: "#a89272" }}>
                Toutes les zones ({DELIVERY_ZONES.length})
              </p>
              <button
                onClick={() => setShowAllZones((v) => !v)}
                className="flex items-center gap-1 text-[10px]"
                style={{ color: "#6b5540" }}
              >
                {showAllZones ? "Actives seulement" : "Tout afficher"}
                {showAllZones ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Zone cards */}
            <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-2">
              {displayedZones.map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => {
                    setSelectedZone((prev) => (prev === zone.id ? null : zone.id));
                    // Fly to zone centroid
                    if (leafletMapRef.current && zone.polygon.length > 0) {
                      const avgLat =
                        zone.polygon.reduce((s, [lat]) => s + lat, 0) / zone.polygon.length;
                      const avgLng =
                        zone.polygon.reduce((s, [, lng]) => s + lng, 0) / zone.polygon.length;
                      leafletMapRef.current.flyTo([avgLat, avgLng], 13, { duration: 0.8 });
                    }
                  }}
                  className="text-left w-full"
                >
                  <ZoneCard
                    zone={zone}
                    highlight={selectedZone === zone.id || hoveredZone === zone.id}
                  />
                </button>
              ))}
            </div>

            {/* Info footer */}
            <div
              className="px-3 py-3 border-t shrink-0"
              style={{ borderColor: "#2e2010" }}
            >
              <div className="flex items-start gap-2">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: "#6b5540" }} />
                <p className="text-[10px] leading-relaxed" style={{ color: "#6b5540" }}>
                  Les délais sont estimatifs et varient selon l&apos;affluence. La livraison est disponible 7j/7 de 19h à 8h. Frais offerts dès 30 €.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Compact mode : zone chips row ──────────────────────────────────── */}
      {compact && (
        <div
          className="px-3 py-2.5 flex gap-2 overflow-x-auto border-t"
          style={{ borderColor: "#2e2010", scrollbarWidth: "none" }}
        >
          {DELIVERY_ZONES.filter((z) => z.status !== "unavailable").map((zone) => (
            <button
              key={zone.id}
              onClick={() => {
                setSelectedZone((prev) => (prev === zone.id ? null : zone.id));
                onZoneSelected?.(zone);
                if (leafletMapRef.current && zone.polygon.length > 0) {
                  const avgLat = zone.polygon.reduce((s, [lat]) => s + lat, 0) / zone.polygon.length;
                  const avgLng = zone.polygon.reduce((s, [, lng]) => s + lng, 0) / zone.polygon.length;
                  leafletMapRef.current.flyTo([avgLat, avgLng], 13, { duration: 0.8 });
                }
              }}
              className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: selectedZone === zone.id ? `${zone.color}22` : "#1a1208",
                color: selectedZone === zone.id ? zone.color : "#a89272",
                border: `1px solid ${selectedZone === zone.id ? zone.color : "#2e2010"}`,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: zone.color }} />
              {zone.name.split(" /")[0]}
              {zone.status === "busy" && (
                <AlertTriangle className="w-3 h-3" style={{ color: "#E8580A" }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
