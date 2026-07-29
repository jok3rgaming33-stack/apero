"use client";

import { useState } from "react";
import { useAge } from "@/lib/age-context";
import { ShieldCheck, AlertTriangle } from "lucide-react";

export default function AgeGate() {
  const { ageVerified, verify, refuse } = useAge();
  const [refused, setRefused] = useState(false);

  if (ageVerified) return null;

  if (refused) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ background: "#0f0b07" }}
      >
        <div className="text-center max-w-sm px-6">
          <AlertTriangle className="w-16 h-16 mx-auto mb-6 text-destructive" />
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Accès refusé
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Vous devez avoir au moins 18 ans pour accéder à ce site. La vente
            d&apos;alcool aux mineurs est interdite en France.
          </p>
          <button
            onClick={() => setRefused(false)}
            className="mt-6 text-sm text-muted-foreground underline"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundImage: "url('/age-gate-bg.png')", backgroundSize: "cover", backgroundPosition: "center" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0" style={{ background: "rgba(15,11,7,0.88)" }} />

      <div
        className="relative z-10 w-full max-w-md mx-4 rounded-2xl p-8 border"
        style={{ background: "rgba(26,18,8,0.95)", borderColor: "#2e2010" }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="text-3xl">🍸</span>
          <span
            className="text-xl font-bold tracking-wide"
            style={{ fontFamily: "var(--font-playfair)", color: "#f5c518" }}
          >
            ApéroMaison
          </span>
        </div>

        {/* Icon */}
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{ background: "rgba(245,197,24,0.12)", border: "1.5px solid #f5c518" }}
        >
          <ShieldCheck className="w-8 h-8" style={{ color: "#f5c518" }} />
        </div>

        <h1 className="text-2xl font-bold text-center text-foreground mb-2" style={{ fontFamily: "var(--font-playfair)" }}>
          Vérification de l&apos;âge
        </h1>
        <p className="text-center text-muted-foreground text-sm mb-8 leading-relaxed">
          Ce site propose la vente d&apos;alcool. Conformément à la loi française,
          l&apos;accès est strictement réservé aux personnes majeures.
        </p>

        <div
          className="rounded-xl p-4 mb-8 text-sm text-center"
          style={{ background: "rgba(245,197,24,0.08)", border: "1px solid rgba(245,197,24,0.2)" }}
        >
          <span style={{ color: "#f5c518" }} className="font-semibold">
            Avez-vous 18 ans ou plus ?
          </span>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={verify}
            className="w-full py-3.5 rounded-xl font-bold text-base transition-all hover:opacity-90 active:scale-95"
            style={{ background: "#f5c518", color: "#0f0b07" }}
          >
            Oui, j&apos;ai 18 ans ou plus
          </button>
          <button
            onClick={() => setRefused(true)}
            className="w-full py-3.5 rounded-xl font-medium text-base transition-all border"
            style={{ borderColor: "#2e2010", color: "#a89272", background: "transparent" }}
          >
            Non, j&apos;ai moins de 18 ans
          </button>
        </div>

        <p className="text-xs text-center mt-6" style={{ color: "#6b5540" }}>
          En confirmant votre âge, vous acceptez que ce site vous propose des
          produits alcoolisés. L&apos;abus d&apos;alcool est dangereux pour la santé,
          à consommer avec modération.
        </p>
      </div>
    </div>
  );
}
