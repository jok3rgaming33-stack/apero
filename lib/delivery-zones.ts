/**
 * Zones de livraison — Bordeaux Métropole et communes alentour.
 * Les polygones GeoJSON sont des approximations fidèles des limites communales.
 * Chaque zone contient : id, nom, code postal, couleur, statut, délai estimé,
 * frais de livraison et un polygone de points [lat, lng] représentant la frontière.
 */

export type ZoneStatus = "active" | "busy" | "unavailable";

export interface DeliveryZone {
  id: string;
  name: string;
  codePostal: string[];
  color: string;
  status: ZoneStatus;
  /** Délai moyen de livraison en minutes */
  eta: number;
  /** Frais de livraison en euros (0 = gratuit) */
  fee: number;
  /** Minimum de commande pour cette zone */
  minOrder: number;
  /** Polygone : tableau de [lat, lng] */
  polygon: [number, number][];
}

export interface DeliveryPoint {
  id: string;
  label: string;
  lat: number;
  lng: number;
  type: "depot" | "livreur" | "hub";
  active: boolean;
  zone: string;
}

// ─── Zones ────────────────────────────────────────────────────────────────────

export const DELIVERY_ZONES: DeliveryZone[] = [
  {
    id: "bordeaux-centre",
    name: "Bordeaux Centre",
    codePostal: ["33000", "33100", "33200", "33300"],
    color: "#f5c518",
    status: "active",
    eta: 25,
    fee: 0,
    minOrder: 20,
    polygon: [
      [44.8637, -0.5793],
      [44.8680, -0.5610],
      [44.8720, -0.5480],
      [44.8650, -0.5350],
      [44.8560, -0.5300],
      [44.8470, -0.5390],
      [44.8420, -0.5550],
      [44.8450, -0.5720],
      [44.8530, -0.5820],
      [44.8637, -0.5793],
    ],
  },
  {
    id: "bordeaux-nord",
    name: "Bordeaux Nord / Bacalan",
    codePostal: ["33300"],
    color: "#E8580A",
    status: "active",
    eta: 30,
    fee: 0,
    minOrder: 20,
    polygon: [
      [44.8720, -0.5480],
      [44.8800, -0.5600],
      [44.8870, -0.5680],
      [44.8920, -0.5730],
      [44.8950, -0.5600],
      [44.8890, -0.5420],
      [44.8800, -0.5370],
      [44.8720, -0.5480],
    ],
  },
  {
    id: "bordeaux-sud",
    name: "Bordeaux Sud / St-Jean",
    codePostal: ["33800"],
    color: "#E8580A",
    status: "active",
    eta: 30,
    fee: 0,
    minOrder: 20,
    polygon: [
      [44.8420, -0.5550],
      [44.8360, -0.5480],
      [44.8280, -0.5420],
      [44.8230, -0.5520],
      [44.8260, -0.5680],
      [44.8340, -0.5750],
      [44.8420, -0.5720],
      [44.8420, -0.5550],
    ],
  },
  {
    id: "merignac",
    name: "Mérignac",
    codePostal: ["33700"],
    color: "#059669",
    status: "active",
    eta: 35,
    fee: 1.5,
    minOrder: 25,
    polygon: [
      [44.8450, -0.6200],
      [44.8530, -0.6380],
      [44.8620, -0.6480],
      [44.8720, -0.6350],
      [44.8780, -0.6100],
      [44.8700, -0.5950],
      [44.8580, -0.5880],
      [44.8470, -0.5980],
      [44.8420, -0.6100],
      [44.8450, -0.6200],
    ],
  },
  {
    id: "pessac",
    name: "Pessac",
    codePostal: ["33600"],
    color: "#059669",
    status: "active",
    eta: 40,
    fee: 1.5,
    minOrder: 25,
    polygon: [
      [44.8050, -0.6280],
      [44.8120, -0.6450],
      [44.8220, -0.6550],
      [44.8380, -0.6450],
      [44.8420, -0.6200],
      [44.8300, -0.6050],
      [44.8150, -0.6050],
      [44.8050, -0.6180],
      [44.8050, -0.6280],
    ],
  },
  {
    id: "begles-villenave",
    name: "Bègles / Villenave",
    codePostal: ["33130", "33140"],
    color: "#3b82f6",
    status: "active",
    eta: 35,
    fee: 1.5,
    minOrder: 25,
    polygon: [
      [44.8100, -0.5500],
      [44.8050, -0.5350],
      [44.7980, -0.5280],
      [44.7900, -0.5380],
      [44.7880, -0.5550],
      [44.7950, -0.5680],
      [44.8050, -0.5680],
      [44.8100, -0.5500],
    ],
  },
  {
    id: "talence-gradignan",
    name: "Talence / Gradignan",
    codePostal: ["33400", "33170"],
    color: "#3b82f6",
    status: "active",
    eta: 40,
    fee: 2,
    minOrder: 30,
    polygon: [
      [44.8050, -0.5950],
      [44.8050, -0.6050],
      [44.7980, -0.6200],
      [44.7900, -0.6150],
      [44.7820, -0.5980],
      [44.7850, -0.5800],
      [44.7950, -0.5700],
      [44.8050, -0.5700],
      [44.8050, -0.5950],
    ],
  },
  {
    id: "lormont-cenon",
    name: "Lormont / Cenon / Floirac",
    codePostal: ["33310", "33150", "33270"],
    color: "#7c3aed",
    status: "active",
    eta: 35,
    fee: 1.5,
    minOrder: 25,
    polygon: [
      [44.8730, -0.5280],
      [44.8800, -0.5100],
      [44.8750, -0.4900],
      [44.8620, -0.4850],
      [44.8500, -0.4950],
      [44.8430, -0.5100],
      [44.8470, -0.5300],
      [44.8600, -0.5300],
      [44.8730, -0.5280],
    ],
  },
  {
    id: "bruges-eysines",
    name: "Bruges / Eysines / Le Bouscat",
    codePostal: ["33520", "33320", "33110"],
    color: "#db2777",
    status: "busy",
    eta: 50,
    fee: 2.5,
    minOrder: 30,
    polygon: [
      [44.8820, -0.5900],
      [44.8950, -0.5950],
      [44.9050, -0.5800],
      [44.9000, -0.5550],
      [44.8900, -0.5450],
      [44.8780, -0.5500],
      [44.8720, -0.5700],
      [44.8780, -0.5900],
      [44.8820, -0.5900],
    ],
  },
  {
    id: "carbon-blanc",
    name: "Carbon-Blanc / Bassens",
    codePostal: ["33560", "33530"],
    color: "#92400e",
    status: "unavailable",
    eta: 60,
    fee: 3,
    minOrder: 35,
    polygon: [
      [44.8950, -0.5000],
      [44.9050, -0.4900],
      [44.9100, -0.4700],
      [44.9000, -0.4580],
      [44.8880, -0.4650],
      [44.8830, -0.4850],
      [44.8880, -0.5000],
      [44.8950, -0.5000],
    ],
  },
];

// ─── Points de livraison actifs (livreurs, dépôts) ───────────────────────────

export const DELIVERY_POINTS: DeliveryPoint[] = [
  {
    id: "depot-1",
    label: "Dépôt Principal — Bordeaux Centre",
    lat: 44.8558,
    lng: -0.5792,
    type: "depot",
    active: true,
    zone: "bordeaux-centre",
  },
  {
    id: "livreur-1",
    label: "Livreur #1 — Secteur Centre",
    lat: 44.8610,
    lng: -0.5680,
    type: "livreur",
    active: true,
    zone: "bordeaux-centre",
  },
  {
    id: "livreur-2",
    label: "Livreur #2 — Secteur Ouest",
    lat: 44.8490,
    lng: -0.6150,
    type: "livreur",
    active: true,
    zone: "merignac",
  },
  {
    id: "livreur-3",
    label: "Livreur #3 — Rive Droite",
    lat: 44.8600,
    lng: -0.5050,
    type: "livreur",
    active: true,
    zone: "lormont-cenon",
  },
  {
    id: "hub-nord",
    label: "Hub Nord — Bacalan",
    lat: 44.8850,
    lng: -0.5620,
    type: "hub",
    active: true,
    zone: "bordeaux-nord",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Point-in-polygon (ray casting) pour [lat, lng] */
export function isPointInZone(
  lat: number,
  lng: number,
  zone: DeliveryZone
): boolean {
  const poly = zone.polygon;
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [yi, xi] = poly[i];
    const [yj, xj] = poly[j];
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Retourne la zone correspondant à un code postal */
export function getZoneByPostalCode(cp: string): DeliveryZone | null {
  return (
    DELIVERY_ZONES.find((z) =>
      z.codePostal.some((c) => c.startsWith(cp.slice(0, 4)))
    ) ?? null
  );
}

export const STATUS_LABELS: Record<ZoneStatus, string> = {
  active: "Disponible",
  busy: "Chargé — délai allongé",
  unavailable: "Indisponible ce soir",
};

export const STATUS_COLORS: Record<ZoneStatus, string> = {
  active: "#2D9A3E",
  busy: "#E8580A",
  unavailable: "#ef4444",
};
