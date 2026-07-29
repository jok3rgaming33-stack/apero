"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";

const DELIVERY_FEE = 3.9;
const FREE_DELIVERY_THRESHOLD = 49;

export default function PanierPage() {
  const { items, updateQuantity, removeItem, totalPrice, totalItems } = useCart();

  const deliveryFee = totalPrice >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = totalPrice + deliveryFee;

  if (items.length === 0) {
    return (
      <main className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <ShoppingBag className="w-16 h-16 mx-auto mb-6" style={{ color: "#2e2010" }} />
          <h1
            className="text-2xl font-bold mb-3"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Ton panier est vide
          </h1>
          <p className="mb-8" style={{ color: "#a89272" }}>
            Découvre nos box apéro et compose ton apéro idéal.
          </p>
          <Link
            href="/aperos"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold"
            style={{ background: "#f5c518", color: "#0f0b07" }}
          >
            Voir nos apéros
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        <h1
          className="text-3xl md:text-4xl font-bold mb-8"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Mon{" "}
          <span style={{ color: "#f5c518", fontStyle: "italic" }}>panier</span>
          <span className="text-base font-normal ml-3" style={{ color: "#a89272" }}>
            ({totalItems} article{totalItems > 1 ? "s" : ""})
          </span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Free delivery banner */}
            {totalPrice < FREE_DELIVERY_THRESHOLD && (
              <div
                className="rounded-xl p-3 text-sm text-center"
                style={{ background: "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.2)", color: "#f5c518" }}
              >
                Plus que{" "}
                <strong>{(FREE_DELIVERY_THRESHOLD - totalPrice).toFixed(2)} €</strong>{" "}
                pour la livraison gratuite !
              </div>
            )}
            {totalPrice >= FREE_DELIVERY_THRESHOLD && (
              <div
                className="rounded-xl p-3 text-sm text-center"
                style={{ background: "rgba(45,154,62,0.1)", border: "1px solid rgba(45,154,62,0.3)", color: "#2D9A3E" }}
              >
                Livraison offerte !
              </div>
            )}

            {items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex gap-4 p-4 rounded-2xl border"
                style={{ background: "#1a1208", borderColor: "#2e2010" }}
              >
                {/* Image */}
                <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-foreground truncate">
                    {product.name}
                  </h3>
                  <p className="text-xs mt-0.5 mb-3" style={{ color: "#a89272" }}>
                    {product.serves}
                  </p>

                  <div className="flex items-center justify-between">
                    {/* Qty */}
                    <div
                      className="flex items-center gap-2 rounded-lg border"
                      style={{ borderColor: "#2e2010" }}
                    >
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center"
                        style={{ color: "#f5c518" }}
                        aria-label="Diminuer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-sm font-bold text-foreground w-4 text-center">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center"
                        style={{ color: "#f5c518" }}
                        aria-label="Augmenter"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold" style={{ color: "#f5c518" }}>
                        {(product.price * quantity).toFixed(2)} €
                      </span>
                      <button
                        onClick={() => removeItem(product.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                        style={{ color: "#6b5540" }}
                        aria-label="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div
            className="rounded-2xl p-6 border h-fit sticky top-24"
            style={{ background: "#1a1208", borderColor: "#2e2010" }}
          >
            <h2 className="font-bold text-lg text-foreground mb-5">Récapitulatif</h2>

            <div className="flex flex-col gap-3 mb-5 text-sm">
              <div className="flex justify-between">
                <span style={{ color: "#a89272" }}>Sous-total</span>
                <span className="text-foreground font-medium">{totalPrice.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "#a89272" }}>Livraison</span>
                <span
                  className="font-medium"
                  style={{ color: deliveryFee === 0 ? "#2D9A3E" : "#f9f3e8" }}
                >
                  {deliveryFee === 0 ? "Gratuite" : `${deliveryFee.toFixed(2)} €`}
                </span>
              </div>
              <div
                className="h-px"
                style={{ background: "#2e2010" }}
              />
              <div className="flex justify-between font-bold text-base">
                <span className="text-foreground">Total</span>
                <span style={{ color: "#f5c518" }}>{total.toFixed(2)} €</span>
              </div>
            </div>

            <Link
              href="/commande"
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-bold text-base transition-all hover:opacity-90 active:scale-95"
              style={{ background: "#f5c518", color: "#0f0b07" }}
            >
              Commander
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/aperos"
              className="block text-center mt-3 text-sm"
              style={{ color: "#a89272" }}
            >
              Continuer mes achats
            </Link>

            {/* Trust */}
            <div
              className="mt-5 pt-5 border-t text-xs text-center"
              style={{ borderColor: "#2e2010", color: "#6b5540" }}
            >
              Carte ou espèces à la livraison • Licence IV conforme
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
