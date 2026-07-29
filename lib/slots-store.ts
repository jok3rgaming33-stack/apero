/**
 * Simulateur de créneaux réservés (côté client, en mémoire).
 * En production, ce store serait remplacé par un appel API / base de données.
 *
 * Règle de partage :
 * Un créneau déjà pris est indisponible SAUF si la nouvelle commande est
 * située à moins de 5 km d'une commande existante sur ce même créneau.
 * La proximité est approximée via le code postal (même code postal ≈ même zone).
 */

export interface BookedSlot {
  /** Clé unique : "dayIndex|slotLabel", ex: "0|19h00 – 19h30" */
  key: string;
  dayIndex: number;
  slotLabel: string;
  /** Code postal de la commande qui a réservé ce créneau */
  codePostal: string;
}

// Pré-peuplé avec quelques créneaux fictifs pour démonstration
const BOOKED_SLOTS: BookedSlot[] = [
  { key: "0|19h30 – 20h00", dayIndex: 0, slotLabel: "19h30 – 20h00", codePostal: "75008" },
  { key: "0|20h00 – 20h30", dayIndex: 0, slotLabel: "20h00 – 20h30", codePostal: "75001" },
  { key: "0|21h00 – 21h30", dayIndex: 0, slotLabel: "21h00 – 21h30", codePostal: "75012" },
  { key: "1|20h00 – 20h30", dayIndex: 1, slotLabel: "20h00 – 20h30", codePostal: "69001" },
];

export function getBookedSlots(): BookedSlot[] {
  return BOOKED_SLOTS;
}

export function bookSlot(dayIndex: number, slotLabel: string, codePostal: string): void {
  const key = `${dayIndex}|${slotLabel}`;
  // Évite les doublons
  if (!BOOKED_SLOTS.find((b) => b.key === key)) {
    BOOKED_SLOTS.push({ key, dayIndex, slotLabel, codePostal });
  }
}

/**
 * Détermine si un créneau est accessible pour le code postal du client.
 * Retourne true si le créneau est libre OU si une commande existante
 * est dans la même zone (même code postal = distance ≤ ~5 km).
 */
export function isSlotAccessible(
  dayIndex: number,
  slotLabel: string,
  clientCodePostal: string
): { accessible: boolean; sharedWith?: string } {
  const existing = BOOKED_SLOTS.find(
    (b) => b.dayIndex === dayIndex && b.slotLabel === slotLabel
  );

  if (!existing) return { accessible: true };

  // Même code postal = zone < 5 km — créneau partageable
  const sameZone = clientCodePostal.trim() !== "" &&
    existing.codePostal.trim().slice(0, 4) === clientCodePostal.trim().slice(0, 4);

  if (sameZone) {
    return { accessible: true, sharedWith: existing.codePostal };
  }

  return { accessible: false };
}
