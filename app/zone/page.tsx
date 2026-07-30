"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Truck,
  Clock,
  MapPin,
  CheckCircle2,
  Package,
  ChevronRight,
  Zap,
} from "lucide-react";
import Link from "next/link";
import {
  DELIVERY_ZONES,
  STATUS_COLORS,
  STATUS_LABELS,
  type DeliveryZone,
} from "@/lib/delivery-zones";

// Dynamic import — Leaflet is browser-only
const DeliveryMap = dynamic(() => import("@/components/delivery-map"), {
  ssr: false,
  loading: () => (
    <div
      className="rounded-2xl border flex items-center justify-center"
      style={{
        height: 560,
        background: "#0d0906",
        borderColor: "#2e2010",
      }}
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: "#2e2010", borderTopColor: "#f5c518" }}
        />
        <p className="text-xs" style={{ color: "#6b5540" }}>Chargement de la carte…</p>
      </div>
    </div>
  ),
});

// ─── Stats strip ─────────────────────────────────────────────────────────────

const STATS = [
  { icon: Truck,       label: "Livreurs actifs",   value: "~30" },
  { icon: Clock,       label: "Délai moyen",        value: "35 min" },
  { icon: MapPin,      label: "Zones couvertes",    value: `${DELIVERY_ZONES.length}` },
  { icon: Zap,         label: "Disponibilité",      value: "7j/7" },
];

export default function ZonePage() {
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);

  return (
    <main className="pt-24 pb-20 min-h-screen" style={{ background: "#0a0703" }}>
      <div className="max-w-7xl mx-auto px-4">

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider"
              style={{ background: "rgba(245,197,24,0.12)", color: "#f5c518", border: "1px solid rgba(245,197,24,0.2)" }}
            >
              Livraison
            </span>
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold mb-3 text-balance"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Zone de{" "}
            <span style={{ color: "#f5c518", fontStyle: "italic" }}>livraison</span>
          </h1>
          <p className="text-base max-w-xl" style={{ color: "#a89272" }}>
            Nous livrons sur toute la Bordeaux Métropole, 7j/7 de 19h à 8h.
            Saisis ton adresse ci-dessous pour vérifier la disponibilité et le délai estimé.
          </p>
        </div>

        {/* ── Stats ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {STATS.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-xl p-4 border flex items-center gap-3"
              style={{ background: "#1a1208", borderColor: "#2e2010" }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(245,197,24,0.1)" }}
              >
                <Icon className="w-4 h-4" style={{ color: "#f5c518" }} />
              </div>
              <div>
                <p className="font-bold text-lg leading-none" style={{ color: "#f9f3e8" }}>
                  {value}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#6b5540" }}>
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Map ─────────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <DeliveryMap onZoneSelected={setSelectedZone} />
        </div>

        {/* ── Zone result CTA ─────────────────────────────────────────────── */}
        {selectedZone && selectedZone.status !== "unavailable" && (
          <div
            className="rounded-2xl p-5 mb-8 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{
              background: `${selectedZone.color}12`,
              borderColor: `${selectedZone.color}55`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: `${selectedZone.color}22` }}
              >
                <CheckCircle2 className="w-5 h-5" style={{ color: selectedZone.color }} />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: "#f9f3e8" }}>
                  {selectedZone.name} — Livraison disponible
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#a89272" }}>
                  Délai ~{selectedZone.eta} min ·{" "}
                  {selectedZone.fee === 0
                    ? "Livraison gratuite"
                    : `Frais ${selectedZone.fee.toFixed(2)} €`}{" "}
                  · Commande min. {selectedZone.minOrder} €
                </p>
              </div>
            </div>
            <Link
              href="/aperos"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shrink-0"
              style={{ background: "#f5c518", color: "#0f0b07" }}
            >
              Commander maintenant
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* ── Zone table ──────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl border overflow-hidden mb-8"
          style={{ borderColor: "#2e2010" }}
        >
          <div
            className="px-5 py-4 border-b flex items-center gap-2"
            style={{ background: "#0d0906", borderColor: "#2e2010" }}
          >
            <Package className="w-4 h-4" style={{ color: "#f5c518" }} />
            <h2 className="font-semibold text-sm" style={{ color: "#f9f3e8" }}>
              Toutes les zones ({DELIVERY_ZONES.length})
            </h2>
          </div>

          {/* Table header */}
          <div
            className="hidden sm:grid grid-cols-5 px-5 py-2 text-xs border-b"
            style={{
              borderColor: "#2e2010",
              background: "#0f0b07",
              color: "#4a3a28",
            }}
          >
            <span>Zone</span>
            <span>Statut</span>
            <span>Délai estimé</span>
            <span>Frais livraison</span>
            <span>Commande min.</span>
          </div>

          {DELIVERY_ZONES.map((zone, i) => (
            <div
              key={zone.id}
              className="grid grid-cols-1 sm:grid-cols-5 items-center px-5 py-3.5 gap-2 sm:gap-0 border-b last:border-b-0 transition-colors hover:bg-white/[0.02]"
              style={{ borderColor: "#1a1208" }}
            >
              {/* Name */}
              <div className="flex items-center gap-2.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: zone.color }}
                />
                <span className="text-sm font-medium" style={{ color: "#f9f3e8" }}>
                  {zone.name}
                </span>
              </div>

              {/* Status */}
              <div className="sm:pl-0">
                <span
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold"
                  style={{
                    background: `${STATUS_COLORS[zone.status]}18`,
                    color: STATUS_COLORS[zone.status],
                    border: `1px solid ${STATUS_COLORS[zone.status]}33`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: STATUS_COLORS[zone.status] }}
                  />
                  {STATUS_LABELS[zone.status]}
                </span>
              </div>

              {/* ETA */}
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" style={{ color: "#6b5540" }} />
                <span className="text-sm" style={{ color: "#a89272" }}>~{zone.eta} min</span>
              </div>

              {/* Fee */}
              <div>
                <span
                  className="text-sm font-semibold"
                  style={{ color: zone.fee === 0 ? "#2D9A3E" : "#f9f3e8" }}
                >
                  {zone.fee === 0 ? "Gratuit" : `${zone.fee.toFixed(2)} €`}
                </span>
              </div>

              {/* Min order */}
              <div>
                <span className="text-sm" style={{ color: "#a89272" }}>
                  {zone.minOrder} €
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ── FAQ / conditions ────────────────────────────────────────────── */}
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              icon: Clock,
              title: "Horaires",
              body: "Livraisons disponibles tous les jours de 19h à 8h du matin (lendemain). Choisis ton créneau de 30 min lors de la commande.",
            },
            {
              icon: Truck,
              title: "Frais de livraison",
              body: "Gratuits pour les zones centre (Bordeaux intra-muros). Entre 1,50 € et 3 € pour les communes périphériques. Offerts dès 30 €.",
            },
            {
              icon: MapPin,
              title: "Hors zone ?",
              body: "Ta commune n'est pas couverte ? Contacte-nous via le bouton Message de la barre de navigation pour nous soumettre ta demande.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-xl p-4 border flex gap-3"
              style={{ background: "#1a1208", borderColor: "#2e2010" }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: "rgba(245,197,24,0.1)" }}
              >
                <Icon className="w-4 h-4" style={{ color: "#f5c518" }} />
              </div>
              <div>
                <p className="font-semibold text-sm mb-1" style={{ color: "#f9f3e8" }}>
                  {title}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "#a89272" }}>
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
