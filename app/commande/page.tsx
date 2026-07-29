"use client";

import { useState } from "react";
import { ChevronRight, MapPin, Clock, CreditCard, CheckCircle2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import Link from "next/link";

type Step = "livraison" | "creneau" | "paiement" | "confirmation";

const TIME_SLOTS = [
  "12h00 – 14h00",
  "14h00 – 16h00",
  "16h00 – 18h00",
  "18h00 – 20h00",
  "20h00 – 22h00",
];

const DAYS = ["Aujourd'hui", "Demain", "Après-demain"];

const DELIVERY_FEE = 3.9;
const FREE_DELIVERY_THRESHOLD = 49;

const STEPS: { id: Step; label: string; icon: React.ReactNode }[] = [
  { id: "livraison", label: "Livraison", icon: <MapPin className="w-4 h-4" /> },
  { id: "creneau", label: "Créneau", icon: <Clock className="w-4 h-4" /> },
  { id: "paiement", label: "Paiement", icon: <CreditCard className="w-4 h-4" /> },
  { id: "confirmation", label: "Confirmation", icon: <CheckCircle2 className="w-4 h-4" /> },
];

export default function CommandePage() {
  const { items, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState<Step>("livraison");
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

  const deliveryFee = totalPrice >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = totalPrice + deliveryFee;
  const stepIndex = STEPS.findIndex((s) => s.id === step);

  const handleConfirm = () => {
    clearCart();
    setStep("confirmation");
  };

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
          <p className="text-sm mb-8" style={{ color: "#a89272" }}>
            Ton apéro sera livré{" "}
            <strong className="text-foreground">
              {DAYS[form.day]} entre {form.slot || "le créneau choisi"}
            </strong>
            .
          </p>
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

  if (items.length === 0 && step !== "confirmation") {
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
                <h2 className="font-bold text-lg mb-5 flex items-center gap-2">
                  <Clock className="w-5 h-5" style={{ color: "#f5c518" }} />
                  Créneau de livraison
                </h2>

                {/* Day */}
                <p className="text-sm font-medium mb-3" style={{ color: "#a89272" }}>
                  Jour de livraison
                </p>
                <div className="flex gap-3 mb-6">
                  {DAYS.map((day, i) => (
                    <button
                      key={day}
                      onClick={() => setForm({ ...form, day: i })}
                      className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        background: form.day === i ? "#f5c518" : "#0f0b07",
                        color: form.day === i ? "#0f0b07" : "#a89272",
                        border: `1px solid ${form.day === i ? "#f5c518" : "#2e2010"}`,
                      }}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                {/* Time slot */}
                <p className="text-sm font-medium mb-3" style={{ color: "#a89272" }}>
                  Heure de livraison
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setForm({ ...form, slot })}
                      className="py-3 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        background: form.slot === slot ? "#f5c518" : "#0f0b07",
                        color: form.slot === slot ? "#0f0b07" : "#a89272",
                        border: `1px solid ${form.slot === slot ? "#f5c518" : "#2e2010"}`,
                      }}
                    >
                      {slot}
                    </button>
                  ))}
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
                  Paiement sécurisé
                </h2>

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

                  {/* Code promo */}
                  <div>
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
                </div>

                <div
                  className="rounded-xl p-3 mb-5 text-xs text-center"
                  style={{ background: "rgba(245,197,24,0.06)", border: "1px solid rgba(245,197,24,0.15)", color: "#a89272" }}
                >
                  Paiement sécurisé • Données chiffrées • Aucune donnée stockée
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
                    disabled={!form.cardNumber || !form.cardExpiry || !form.cardCvc}
                    className="flex-[2] py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-40"
                    style={{ background: "#f5c518", color: "#0f0b07" }}
                  >
                    Payer {total.toFixed(2)} €
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
                <span style={{ color: deliveryFee === 0 ? "#2D9A3E" : "#f9f3e8" }}>
                  {deliveryFee === 0 ? "Gratuite" : `${deliveryFee.toFixed(2)} €`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-base">
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
