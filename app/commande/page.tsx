"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronRight, MapPin, Clock, CreditCard, CheckCircle2, Banknote, ChevronDown, Info, Users } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { getBookedSlots, bookSlot, isSlotAccessible } from "@/lib/slots-store";
import Link from "next/link";

type Step = "livraison" | "creneau" | "paiement" | "confirmation";
type ActiveStep = Exclude<Step, "confirmation">;

/** Génère tous les créneaux de 19h00 à 08h00 (lendemain) par pas de 30 min */
function buildAllSlots(): { label: string; startH: number; startM: number }[] {
  const slots: { label: string; startH: number; startM: number }[] = [];
  // 19h00 → 23h30 (soirée)
  for (let h = 19; h <= 23; h++) {
    for (const m of [0, 30]) {
      const endH = m === 30 ? h + 1 : h;
      const endM = m === 30 ? 0 : 30;
      slots.push({
        label: `${String(h).padStart(2, "0")}h${String(m).padStart(2, "0")} – ${String(endH).padStart(2, "0")}h${String(endM).padStart(2, "0")}`,
        startH: h,
        startM: m,
      });
    }
  }
  // 00h00 → 07h30 (nuit)
  for (let h = 0; h <= 7; h++) {
    for (const m of [0, 30]) {
      if (h === 7 && m === 30) break;
      const endH = m === 30 ? h + 1 : h;
      const endM = m === 30 ? 0 : 30;
      slots.push({
        label: `${String(h).padStart(2, "0")}h${String(m).padStart(2, "0")} – ${String(endH).padStart(2, "0")}h${String(endM).padStart(2, "0")}`,
        startH: h,
        startM: m,
      });
    }
  }
  return slots;
}

const ALL_SLOTS = buildAllSlots();

export type SlotStatus =
  | { disabled: false; shared?: boolean }
  | { disabled: true; reason: "past" | "night_lock" | "taken" };

/** Retourne les créneaux disponibles selon le jour, l'heure actuelle et les réservations existantes */
function getAvailableSlots(
  dayIndex: number,
  clientCodePostal: string
): { label: string; status: SlotStatus }[] {
  const now = new Date();
  const minTotalMin = now.getHours() * 60 + now.getMinutes() + 30;

  return ALL_SLOTS.map((slot) => {
    const slotIsNight = slot.startH < 19;
    const slotTotalMin = slot.startH * 60 + slot.startM;

    // ── Règles horaires (aujourd'hui seulement) ──────────────────────────────
    if (dayIndex === 0) {
      if (slotIsNight) {
        return { label: slot.label, status: { disabled: true, reason: "night_lock" } };
      }
      if (slotTotalMin < minTotalMin) {
        return { label: slot.label, status: { disabled: true, reason: "past" } };
      }
    }

    // ── Règle de disponibilité / partage ─────────────────────────────────────
    const { accessible, sharedWith } = isSlotAccessible(dayIndex, slot.label, clientCodePostal);
    if (!accessible) {
      return { label: slot.label, status: { disabled: true, reason: "taken" } };
    }

    return { label: slot.label, status: { disabled: false, shared: !!sharedWith } };
  });
}

const DAYS = ["Aujourd'hui", "Demain", "Après-demain"];

const STEPS: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: "livraison", label: "Livraison", icon: <MapPin className="w-4 h-4" /> },
  { id: "creneau", label: "Créneau", icon: <Clock className="w-4 h-4" /> },
  { id: "paiement", label: "Paiement", icon: <CreditCard className="w-4 h-4" /> },
  { id: "confirmation", label: "Confirmation", icon: <CheckCircle2 className="w-4 h-4" /> },
];

export default function CommandePage() {
  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState<Step>("livraison");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [form, setForm] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    adresse: "",
    ville: "",
    codePostal: "",
    etage: "",
    instructions: "",
    day: 0,
    slot: "",
    codePromo: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    cardName: "",
  });

  const availableSlots = useMemo(
    () => getAvailableSlots(form.day, form.codePostal),
    [form.day, form.codePostal]
  );
  const nightSlotCount = availableSlots.filter(
    (s) => s.status.disabled && (s.status as { disabled: true; reason: string }).reason === "night_lock"
  ).length;
  const selectedSlotStatus = availableSlots.find((s) => s.label === form.slot)?.status;

  const total = totalPrice;
  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const handleConfirm = useCallback(async () => {
    if (form.slot) bookSlot(form.day, form.slot, form.codePostal);
    // Build cart items for the order
    const orderItems = items.map(({ product, quantity }) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image ?? "",
    }));
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: `${form.prenom} ${form.nom}`.trim(),
          clientPhone: form.telephone,
          clientAddress: `${form.adresse}, ${form.codePostal} ${form.ville}`,
          clientEmail: form.email,
          items: orderItems,
        }),
      });
      if (res.ok) {
        const order = await res.json();
        setOrderId(order.id);
      }
    } catch {
      // silently proceed even if API fails
    }
    clearCart();
    setStep("confirmation");
  }, [form, items, clearCart]);

  if (step === "confirmation") {
    return (
      <main className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: "rgba(45,154,62,0.15)", border: "2px solid #2D9A3E" }}
          >
            <CheckCircle2 className="w-10 h-10" style={{ color: "#2D9A3E" }} />
          </div>
          <h1
            className="text-3xl font-bold mb-3"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Commande{" "}
            <span style={{ color: "#f5c518", fontStyle: "italic" }}>confirmée !</span>
          </h1>
          <p className="mb-2" style={{ color: "#a89272" }}>
            Un email de confirmation a été envoyé à{" "}
            <strong className="text-foreground">{form.email || "ton adresse"}</strong>.
          </p>
          <p className="text-sm mb-4" style={{ color: "#a89272" }}>
            Ton apéro sera livré{" "}
            <strong className="text-foreground">
              {DAYS[form.day]} entre {form.slot || "le créneau choisi"}
            </strong>
            .
          </p>
          {orderId && (
            <div
              className="rounded-xl p-4 mb-6 text-left"
              style={{ background: "#1a1208", border: "1px solid #2e2010" }}
            >
              <p className="text-xs mb-1" style={{ color: "#6b5540" }}>Numéro de commande</p>
              <p className="font-mono text-sm font-bold mb-3" style={{ color: "#f5c518" }}>{orderId}</p>
              <Link
                href={`/suivi?id=${orderId}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg"
                style={{ background: "rgba(245,197,24,0.1)", color: "#f5c518", border: "1px solid rgba(245,197,24,0.2)" }}
              >
                Suivre ma commande en temps réel
              </Link>
            </div>
          )}
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold"
            style={{ background: "#f5c518", color: "#0f0b07" }}
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </main>
    );
  }

  const isActiveStep = (s: Step): s is ActiveStep => s !== "confirmation";
  if (items.length === 0 && isActiveStep(step)) {
    return (
      <main className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4" style={{ color: "#a89272" }}>
            Ton panier est vide.
          </p>
          <Link
            href="/aperos"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold"
            style={{ background: "#f5c518", color: "#0f0b07" }}
          >
            Voir nos apéros
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4">
        <h1
          className="text-3xl font-bold mb-8"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Commander
        </h1>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.filter((s) => s.id !== "confirmation").map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: i <= stepIndex ? "#f5c518" : "#2e2010",
                    color: i <= stepIndex ? "#0f0b07" : "#6b5540",
                  }}
                >
                  {i < stepIndex ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span
                  className="text-xs font-medium hidden sm:block"
                  style={{ color: i <= stepIndex ? "#f5c518" : "#6b5540" }}
                >
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div
                  className="flex-1 h-px mx-1"
                  style={{ background: i < stepIndex ? "#f5c518" : "#2e2010" }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            {step === "livraison" && (
              <div
                className="rounded-2xl p-6 border"
                style={{ background: "#1a1208", borderColor: "#2e2010" }}
              >
                <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
                  <MapPin className="w-5 h-5" style={{ color: "#f5c518" }} />
                  Adresse de livraison
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: "prenom", label: "Prénom", type: "text", placeholder: "Jean" },
                    { key: "nom", label: "Nom", type: "text", placeholder: "Dupont" },
                    { key: "email", label: "Email", type: "email", placeholder: "jean@email.fr", full: true },
                    { key: "telephone", label: "Téléphone", type: "tel", placeholder: "06 12 34 56 78" },
                    { key: "adresse", label: "Adresse", type: "text", placeholder: "12 rue de la Paix", full: true },
                    { key: "codePostal", label: "Code postal", type: "text", placeholder: "75001" },
                    { key: "ville", label: "Ville", type: "text", placeholder: "Paris" },
                    { key: "etage", label: "Étage / Digicode (optionnel)", type: "text", placeholder: "2ème, code 1234" },
                  ].map(({ key, label, type, placeholder, full }) => (
                    <div key={key} className={full ? "sm:col-span-2" : ""}>
                      <label className="block text-xs font-medium mb-1.5" style={{ color: "#a89272" }}>
                        {label}
                      </label>
                      <input
                        type={type}
                        placeholder={placeholder}
                        value={form[key as keyof typeof form] as string}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                        style={{ background: "#0f0b07", border: "1px solid #2e2010", color: "#f9f3e8" }}
                      />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium mb-1.5" style={{ color: "#a89272" }}>
                      Instructions de livraison (optionnel)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Laisser en loge, sonner fort..."
                      value={form.instructions}
                      onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
                      style={{ background: "#0f0b07", border: "1px solid #2e2010", color: "#f9f3e8" }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => setStep("creneau")}
                  disabled={!form.prenom || !form.adresse || !form.ville || !form.email}
                  className="mt-6 w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-40"
                  style={{ background: "#f5c518", color: "#0f0b07" }}
                >
                  Continuer <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {step === "creneau" && (
              <div
                className="rounded-2xl p-6 border"
                style={{ background: "#1a1208", borderColor: "#2e2010" }}
              >
                <h2 className="font-bold text-lg mb-2 flex items-center gap-2">
                  <Clock className="w-5 h-5" style={{ color: "#f5c518" }} />
                  Créneau de livraison
                </h2>
                <p className="text-xs mb-6" style={{ color: "#6b5540" }}>
                  Créneaux disponibles de 19h00 à 08h00 par tranches de 30 minutes.
                </p>

                {/* Day select */}
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#a89272" }}>
                  Jour de livraison
                </label>
                <div className="relative mb-5">
                  <select
                    value={form.day}
                    onChange={(e) => setForm({ ...form, day: Number(e.target.value), slot: "" })}
                    className="w-full appearance-none px-4 py-3 rounded-xl text-sm font-semibold outline-none pr-10"
                    style={{ background: "#0f0b07", border: "1px solid #2e2010", color: "#f9f3e8" }}
                  >
                    {DAYS.map((day, i) => (
                      <option key={day} value={i}>
                        {day}{i > 0 ? " — Précommande" : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#6b5540" }} />
                </div>

                {/* Preorder badge for demain / après-demain */}
                {form.day > 0 && (
                  <div
                    className="flex items-start gap-2 rounded-xl p-3 mb-5 text-xs"
                    style={{ background: "rgba(245,197,24,0.06)", border: "1px solid rgba(245,197,24,0.15)" }}
                  >
                    <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#f5c518" }} />
                    <span style={{ color: "#a89272" }}>
                      <strong style={{ color: "#f5c518" }}>Précommande</strong> — En commandant à l&apos;avance, tu t&apos;assures un créneau et une livraison rapide le jour choisi. Tous les créneaux de 19h00 à 08h00 sont disponibles.
                    </span>
                  </div>
                )}

                {/* Slot select */}
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#a89272" }}>
                  Créneau horaire
                  {!form.codePostal && (
                    <span className="ml-2 font-normal" style={{ color: "#6b5540" }}>
                      (renseigne ton code postal à l&apos;étape précédente pour voir la disponibilité exacte)
                    </span>
                  )}
                </label>
                <div className="relative mb-2">
                  <select
                    value={form.slot}
                    onChange={(e) => setForm({ ...form, slot: e.target.value })}
                    className="w-full appearance-none px-4 py-3 rounded-xl text-sm font-semibold outline-none pr-10"
                    style={{
                      background: "#0f0b07",
                      border: `1px solid ${form.slot ? "#f5c518" : "#2e2010"}`,
                      color: form.slot ? "#f9f3e8" : "#6b5540",
                    }}
                  >
                    <option value="">-- Choisir un créneau --</option>
                    {availableSlots.map((s) => {
                      const st = s.status;
                      const isDisabled = st.disabled;
                      const suffix = isDisabled
                        ? st.reason === "night_lock"
                          ? "  ·  Nuit — après verrouillage"
                          : st.reason === "past"
                          ? "  ·  Créneau passé"
                          : "  ·  Complet"
                        : !st.disabled && st.shared
                        ? "  ·  Mutualisé (zone proche)"
                        : "";
                      return (
                        <option key={s.label} value={isDisabled ? "" : s.label} disabled={isDisabled}>
                          {s.label}{suffix}
                        </option>
                      );
                    })}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#6b5540" }} />
                </div>

                {/* Shared slot notice */}
                {form.slot && selectedSlotStatus && !selectedSlotStatus.disabled && (selectedSlotStatus as { disabled: false; shared?: boolean }).shared && (
                  <div
                    className="flex items-start gap-2 rounded-xl p-3 mb-3 text-xs mt-2"
                    style={{ background: "rgba(45,154,62,0.07)", border: "1px solid rgba(45,154,62,0.25)" }}
                  >
                    <Users className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#2D9A3E" }} />
                    <span style={{ color: "#2D9A3E" }}>
                      Une commande est déjà prévue dans ta zone sur ce créneau — le livreur passera dans ton secteur, ta livraison est bien confirmée.
                    </span>
                  </div>
                )}

                {/* Night slots notice (today only) */}
                {form.day === 0 && nightSlotCount > 0 && (
                  <div
                    className="flex items-start gap-2 rounded-xl p-3 mb-3 text-xs mt-2"
                    style={{ background: "rgba(107,85,64,0.15)", border: "1px solid #2e2010" }}
                  >
                    <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#a89272" }} />
                    <span style={{ color: "#6b5540" }}>
                      Les créneaux de nuit (00h00 – 08h00) sont accessibles uniquement après verrouillage d&apos;une commande. Pour les réserver dès maintenant, sélectionne <strong style={{ color: "#a89272" }}>Demain</strong> ou <strong style={{ color: "#a89272" }}>Après-demain</strong>.
                    </span>
                  </div>
                )}

                {/* Disclaimer */}
                <div
                  className="flex items-start gap-2 rounded-xl p-3 mb-6 text-xs mt-3"
                  style={{ background: "rgba(245,197,24,0.04)", border: "1px solid rgba(245,197,24,0.1)" }}
                >
                  <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#f5c518" }} />
                  <span style={{ color: "#6b5540" }}>
                    Le vendeur s&apos;engage à faire tout son possible pour respecter le créneau choisi. Des événements extérieurs (circulation, météo, volume de commandes) peuvent exceptionnellement engendrer un retard. Nous vous en informerons par SMS ou email dès que possible.
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep("livraison")}
                    className="flex-1 py-3.5 rounded-xl font-semibold border"
                    style={{ borderColor: "#2e2010", color: "#a89272" }}
                  >
                    Retour
                  </button>
                  <button
                    onClick={() => setStep("paiement")}
                    disabled={!form.slot}
                    className="flex-[2] py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-40"
                    style={{ background: "#f5c518", color: "#0f0b07" }}
                  >
                    Continuer <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === "paiement" && (
              <div
                className="rounded-2xl p-6 border"
                style={{ background: "#1a1208", borderColor: "#2e2010" }}
              >
                <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" style={{ color: "#f5c518" }} />
                  Mode de paiement
                </h2>

                {/* Payment method selector */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    onClick={() => setPaymentMethod("card")}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all"
                    style={{
                      background: paymentMethod === "card" ? "rgba(245,197,24,0.1)" : "#0f0b07",
                      borderColor: paymentMethod === "card" ? "#f5c518" : "#2e2010",
                    }}
                  >
                    <CreditCard className="w-6 h-6" style={{ color: paymentMethod === "card" ? "#f5c518" : "#6b5540" }} />
                    <span className="text-sm font-semibold" style={{ color: paymentMethod === "card" ? "#f5c518" : "#a89272" }}>
                      Carte bancaire
                    </span>
                    <span className="text-xs" style={{ color: "#6b5540" }}>CB, Visa, Mastercard</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("cash")}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all"
                    style={{
                      background: paymentMethod === "cash" ? "rgba(245,197,24,0.1)" : "#0f0b07",
                      borderColor: paymentMethod === "cash" ? "#f5c518" : "#2e2010",
                    }}
                  >
                    <Banknote className="w-6 h-6" style={{ color: paymentMethod === "cash" ? "#f5c518" : "#6b5540" }} />
                    <span className="text-sm font-semibold" style={{ color: paymentMethod === "cash" ? "#f5c518" : "#a89272" }}>
                      Espèces
                    </span>
                    <span className="text-xs" style={{ color: "#6b5540" }}>À la livraison</span>
                  </button>
                </div>

                {/* Card fields */}
                {paymentMethod === "card" && (
                  <div className="flex flex-col gap-4 mb-6">
                    {[
                      { key: "cardName", label: "Nom sur la carte", type: "text", placeholder: "Jean Dupont" },
                      { key: "cardNumber", label: "Numéro de carte", type: "text", placeholder: "1234 5678 9012 3456" },
                    ].map(({ key, label, type, placeholder }) => (
                      <div key={key}>
                        <label className="block text-xs font-medium mb-1.5" style={{ color: "#a89272" }}>
                          {label}
                        </label>
                        <input
                          type={type}
                          placeholder={placeholder}
                          value={form[key as keyof typeof form] as string}
                          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                          style={{ background: "#0f0b07", border: "1px solid #2e2010", color: "#f9f3e8" }}
                        />
                      </div>
                    ))}
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { key: "cardExpiry", label: "Expiration", placeholder: "MM/AA" },
                        { key: "cardCvc", label: "CVC", placeholder: "123" },
                      ].map(({ key, label, placeholder }) => (
                        <div key={key}>
                          <label className="block text-xs font-medium mb-1.5" style={{ color: "#a89272" }}>
                            {label}
                          </label>
                          <input
                            type="text"
                            placeholder={placeholder}
                            value={form[key as keyof typeof form] as string}
                            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                            style={{ background: "#0f0b07", border: "1px solid #2e2010", color: "#f9f3e8" }}
                          />
                        </div>
                      ))}
                    </div>
                    <div
                      className="rounded-xl p-3 text-xs text-center"
                      style={{ background: "rgba(245,197,24,0.06)", border: "1px solid rgba(245,197,24,0.15)", color: "#a89272" }}
                    >
                      Paiement sécurisé • Données chiffrées • Aucune donnée stockée
                    </div>
                  </div>
                )}

                {/* Cash info */}
                {paymentMethod === "cash" && (
                  <div className="mb-6">
                    <div
                      className="rounded-xl p-4 mb-4"
                      style={{ background: "rgba(245,197,24,0.07)", border: "1px solid rgba(245,197,24,0.2)" }}
                    >
                      <p className="text-sm font-semibold mb-2" style={{ color: "#f5c518" }}>
                        Paiement en espèces à la livraison
                      </p>
                      <ul className="flex flex-col gap-1.5">
                        {[
                          `Prépare la somme exacte de ${total.toFixed(2)} € si possible.`,
                          "Le livreur ne peut pas garantir de rendu de monnaie pour les grosses coupures (> 50 €).",
                          "Le paiement s'effectue au moment de la remise de la commande.",
                          "Un reçu vous sera remis sur place.",
                        ].map((line) => (
                          <li key={line} className="text-xs flex items-start gap-2" style={{ color: "#a89272" }}>
                            <span className="mt-0.5 shrink-0" style={{ color: "#f5c518" }}>•</span>
                            {line}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div
                      className="rounded-xl p-3 text-xs text-center"
                      style={{ background: "rgba(45,154,62,0.07)", border: "1px solid rgba(45,154,62,0.25)", color: "#2D9A3E" }}
                    >
                      Aucun prépaiement requis — vous réglez uniquement à la réception
                    </div>
                  </div>
                )}

                {/* Promo code */}
                <div className="mb-6">
                  <label className="block text-xs font-medium mb-1.5" style={{ color: "#a89272" }}>
                    Code promo (optionnel)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="APERO2024"
                      value={form.codePromo}
                      onChange={(e) => setForm({ ...form, codePromo: e.target.value })}
                      className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none uppercase"
                      style={{ background: "#0f0b07", border: "1px solid #2e2010", color: "#f9f3e8" }}
                    />
                    <button
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold border"
                      style={{ borderColor: "#2e2010", color: "#a89272" }}
                    >
                      Appliquer
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep("creneau")}
                    className="flex-1 py-3.5 rounded-xl font-semibold border"
                    style={{ borderColor: "#2e2010", color: "#a89272" }}
                  >
                    Retour
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={paymentMethod === "card" && (!form.cardNumber || !form.cardExpiry || !form.cardCvc)}
                    className="flex-[2] py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-40"
                    style={{ background: "#f5c518", color: "#0f0b07" }}
                  >
                    {paymentMethod === "cash" ? (
                      <>
                        <Banknote className="w-4 h-4" /> Confirmer — payer à la livraison
                      </>
                    ) : (
                      <>Payer {total.toFixed(2)} €</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div
            className="rounded-2xl p-5 border h-fit sticky top-24"
            style={{ background: "#1a1208", borderColor: "#2e2010" }}
          >
            <h2 className="font-bold text-base text-foreground mb-4">Ma commande</h2>
            <div className="flex flex-col gap-2 mb-4">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between text-sm">
                  <span style={{ color: "#a89272" }}>
                    {product.name}{" "}
                    <span style={{ color: "#6b5540" }}>×{quantity}</span>
                  </span>
                  <span className="text-foreground font-medium">
                    {(product.price * quantity).toFixed(2)} €
                  </span>
                </div>
              ))}
            </div>
            <div className="h-px mb-4" style={{ background: "#2e2010" }} />
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: "#a89272" }}>Livraison</span>
                <span style={{ color: "#2D9A3E" }} className="font-semibold">Gratuite</span>
              </div>
              <div
                className="rounded-lg px-3 py-2 text-xs"
                style={{ background: "rgba(45,154,62,0.07)", border: "1px solid rgba(45,154,62,0.2)", color: "#2D9A3E" }}
              >
                Livraison toujours offerte dans toute notre zone
              </div>
              <div className="flex justify-between font-bold text-base mt-1">
                <span>Total</span>
                <span style={{ color: "#f5c518" }}>{total.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
