"use client";

import Image from "next/image";
import { X, Plus, Minus, Users, CheckCircle2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/data";
import { CATEGORIES } from "@/lib/data";
import { useEffect, useState } from "react";

interface Props {
  product: Product;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: Props) {
  const { addItem, items, updateQuantity } = useCart();
  const cat = CATEGORIES.find((c) => c.id === product.category);
  const cartItem = items.find((i) => i.product.id === product.id);
  const [added, setAdded] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl overflow-hidden"
        style={{ background: "#1a1208", border: "1px solid #2e2010", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative h-64">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
          />
          {/* Badge */}
          {product.badge && (
            <span
              className="absolute top-4 left-4 text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: "#f5c518", color: "#0f0b07" }}
            >
              {product.badge}
            </span>
          )}
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: "rgba(15,11,7,0.8)" }}
            aria-label="Fermer"
          >
            <X className="w-4 h-4 text-foreground" />
          </button>
          {/* Cat pill */}
          {cat && (
            <span
              className="absolute bottom-4 left-4 text-xs font-semibold px-2.5 py-1 rounded-full text-white"
              style={{ background: cat.color }}
            >
              {cat.label}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2
                className="text-2xl font-bold text-foreground text-balance"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {product.name}
              </h2>
              <p className="text-sm mt-1" style={{ color: "#f5c518" }}>
                {product.tagline}
              </p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-bold" style={{ color: "#f5c518" }}>
                {product.price.toFixed(2)} €
              </div>
              {product.originalPrice && (
                <div className="text-sm line-through" style={{ color: "#6b5540" }}>
                  {product.originalPrice.toFixed(2)} €
                </div>
              )}
            </div>
          </div>

          {/* Serves */}
          <div className="flex items-center gap-1.5 mb-4">
            <Users className="w-4 h-4" style={{ color: "#a89272" }} />
            <span className="text-sm" style={{ color: "#a89272" }}>
              {product.serves}
            </span>
          </div>

          <p className="text-sm leading-relaxed mb-6" style={{ color: "#c4a882" }}>
            {product.description}
          </p>

          {/* Contents */}
          <div
            className="rounded-xl p-4 mb-6 border"
            style={{ background: "#0f0b07", borderColor: "#2e2010" }}
          >
            <h3 className="text-sm font-bold mb-3" style={{ color: "#f9f3e8" }}>
              Contenu de la box
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {product.contents.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: "#f5c518" }} />
                  <span className="text-xs" style={{ color: "#a89272" }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cart actions */}
          {cartItem ? (
            <div className="flex items-center gap-4">
              <div
                className="flex items-center gap-3 rounded-xl border"
                style={{ border: "1px solid #2e2010" }}
              >
                <button
                  onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                  className="w-10 h-10 flex items-center justify-center transition-colors"
                  style={{ color: "#f5c518" }}
                  aria-label="Diminuer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-base font-bold text-foreground w-6 text-center">
                  {cartItem.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center transition-colors"
                  style={{ color: "#f5c518" }}
                  aria-label="Augmenter"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-sm" style={{ color: "#a89272" }}>
                Dans ton panier
              </span>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              className="w-full py-3.5 rounded-xl font-bold text-base transition-all active:scale-95"
              style={{ background: added ? "#2D9A3E" : "#f5c518", color: "#0f0b07" }}
            >
              {added ? "Ajouté au panier !" : "Ajouter au panier"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
