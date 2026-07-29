"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Truck, ShieldCheck, Star } from "lucide-react";

const TRUST_BADGES = [
  { icon: <Truck className="w-4 h-4" />, label: "Livraison 7j/7" },
  { icon: <ShieldCheck className="w-4 h-4" />, label: "100% légal & responsable" },
  { icon: <Star className="w-4 h-4 fill-current" />, label: "Qualité garantie" },
];

const TICKER_ITEMS = [
  "Livraison 7j/7",
  "Licence IV & conforme",
  "Entre amis, que du bon",
  "Paiement sécurisé",
  "Produits de qualité",
  "100% légal & responsable",
];

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/hero-apero.png"
          alt="Groupe d'amis qui trinquent lors d'un apéro"
          fill
          priority
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(15,11,7,0.92) 0%, rgba(15,11,7,0.7) 50%, rgba(15,11,7,0.3) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(0deg, rgba(15,11,7,1) 0%, transparent 40%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex items-center pt-16">
        <div className="max-w-7xl mx-auto px-4 w-full py-20">
          <div className="max-w-xl">
            {/* Promo pill */}
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
              style={{ background: "rgba(245,197,24,0.15)", border: "1px solid rgba(245,197,24,0.3)", color: "#f5c518" }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#f5c518" }} />
              L&apos;apéro, livré chez toi !
            </div>

            <h1
              className="text-5xl md:text-7xl font-bold leading-tight mb-6 text-balance"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              <span className="text-foreground">La fête</span>
              <br />
              <span style={{ color: "#f5c518", fontStyle: "italic" }}>vient à toi !</span>
            </h1>

            <p className="text-base md:text-lg mb-8 leading-relaxed" style={{ color: "#c4a882" }}>
              Apéros gourmands, boissons fraîches et bonne humeur,
              livrés chez toi en un clin d&apos;œil.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 mb-10">
              {TRUST_BADGES.map((b) => (
                <div key={b.label} className="flex items-center gap-1.5">
                  <span style={{ color: "#f5c518" }}>{b.icon}</span>
                  <span className="text-sm font-medium" style={{ color: "#c4a882" }}>
                    {b.label}
                  </span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/aperos"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-base transition-all hover:opacity-90 active:scale-95"
                style={{ background: "#f5c518", color: "#0f0b07" }}
              >
                Découvrir nos formules
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/comment"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-base transition-all border"
                style={{ borderColor: "#2e2010", color: "#f9f3e8", background: "rgba(255,255,255,0.05)" }}
              >
                Voir les promos
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Ticker */}
      <div
        className="relative z-10 border-t overflow-hidden"
        style={{ borderColor: "#2e2010", background: "rgba(26,18,8,0.9)" }}
      >
        <div className="py-3 flex">
          <div className="ticker-track flex items-center gap-8 whitespace-nowrap">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="flex items-center gap-2 text-sm" style={{ color: "#a89272" }}>
                <span style={{ color: "#f5c518" }}>✦</span>
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
