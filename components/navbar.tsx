"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, User, Menu, X, Package } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import ContactWidget from "@/components/contact-widget";

const NAV_LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/aperos", label: "Nos formules" },
  { href: "/comment", label: "Comment ça marche ?" },
  { href: "/nous", label: "Nous" },
];

export default function Navbar() {
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{ background: "rgba(15,11,7,0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid #2e2010" }}
    >
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🍸</span>
          <span
            className="text-lg font-bold tracking-wide hidden sm:block"
            style={{ fontFamily: "var(--font-playfair)", color: "#f5c518" }}
          >
            ApéroMaison
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm transition-colors hover:text-primary"
              style={{ color: "#d4b896" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Suivi commande */}
          <Link
            href="/suivi"
            className="p-2 rounded-lg transition-colors hidden sm:flex items-center justify-center"
            style={{ color: "#a89272" }}
            aria-label="Suivi de commande"
            title="Suivre ma commande"
          >
            <Package className="w-5 h-5" />
          </Link>

          {/* Contact widget — positioned relative so the dropdown anchors correctly */}
          <div className="relative hidden sm:block">
            <ContactWidget />
          </div>

          <Link
            href="/compte"
            className="p-2 rounded-lg transition-colors hidden sm:flex items-center justify-center"
            style={{ color: "#a89272" }}
            aria-label="Mon compte"
          >
            <User className="w-5 h-5" />
          </Link>

          <Link
            href="/panier"
            className="relative p-2 rounded-lg transition-colors flex items-center justify-center"
            style={{ color: "#f5c518" }}
            aria-label={`Panier, ${totalItems} article${totalItems !== 1 ? "s" : ""}`}
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                style={{ background: "#f5c518", color: "#0f0b07" }}
              >
                {totalItems}
              </span>
            )}
          </Link>

          {/* Mobile menu toggle */}
          <button
            className="lg:hidden p-2 rounded-lg"
            style={{ color: "#a89272" }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className="lg:hidden border-t"
          style={{ background: "#1a1208", borderColor: "#2e2010" }}
        >
          <nav className="flex flex-col py-4 px-4 gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-3 px-4 rounded-lg text-sm transition-colors"
                style={{ color: "#d4b896" }}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 pt-2 border-t flex gap-2" style={{ borderColor: "#2e2010" }}>
              <Link
                href="/compte"
                className="flex-1 py-2.5 text-center text-sm rounded-lg border"
                style={{ borderColor: "#2e2010", color: "#a89272" }}
                onClick={() => setMobileOpen(false)}
              >
                Mon compte
              </Link>
              <Link
                href="/panier"
                className="flex-1 py-2.5 text-center text-sm rounded-lg font-semibold"
                style={{ background: "#f5c518", color: "#0f0b07" }}
                onClick={() => setMobileOpen(false)}
              >
                Panier {totalItems > 0 && `(${totalItems})`}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
