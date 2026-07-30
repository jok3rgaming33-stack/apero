"use client";

import Image from "next/image";
import { Plus, Users, Star } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/lib/data";
import { CATEGORIES } from "@/lib/data";
import { useState } from "react";

interface Props {
  product: Product;
  onSelect?: (product: Product) => void;
}

export default function ProductCard({ product, onSelect }: Props) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const cat = CATEGORIES.find((c) => c.id === product.category);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <article
      className="group rounded-2xl overflow-hidden border cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg"
      style={{
        background: "#1a1208",
        borderColor: "#2e2010",
        boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
      }}
      onClick={() => onSelect?.(product)}
    >
      {/* Image */}
      <div className="relative h-32 sm:h-48 overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Badge */}
        {product.badge && (
          <span
            className="absolute top-2 left-2 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: "#f5c518", color: "#0f0b07" }}
          >
            {product.badge}
          </span>
        )}
        {/* Original price */}
        {product.originalPrice && (
          <span
            className="absolute top-2 right-2 text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full"
            style={{ background: "rgba(232,88,10,0.9)", color: "#fff" }}
          >
            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-4 flex flex-col flex-1">
        <h3 className="font-bold text-xs sm:text-base text-foreground mb-0.5 leading-tight line-clamp-2">
          {product.name}
        </h3>
        <p className="text-[11px] sm:text-xs mb-2 line-clamp-1" style={{ color: "#a89272" }}>
          {product.tagline}
        </p>

        {/* Popular badge — compact on mobile */}
        {product.popular && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3 h-3 fill-current" style={{ color: "#f5c518" }} />
            <span className="text-[10px] sm:text-xs" style={{ color: "#f5c518" }}>
              Populaire
            </span>
          </div>
        )}

        {/* Tags — max 2 on mobile, 3 on sm+ */}
        <div className="flex flex-wrap gap-1 mb-3">
          {product.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full"
              style={{ background: "#2a1f12", color: "#a89272" }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Price + CTA — always at bottom */}
        <div className="flex items-center justify-between mt-auto gap-1">
          <div className="min-w-0">
            <span className="text-sm sm:text-xl font-bold block leading-tight" style={{ color: "#f5c518" }}>
              {product.price.toFixed(2)} €
            </span>
            {product.originalPrice && (
              <span className="text-[10px] sm:text-sm line-through" style={{ color: "#6b5540" }}>
                {product.originalPrice.toFixed(2)} €
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-sm font-semibold transition-all active:scale-95 shrink-0"
            style={{
              background: added ? "#2D9A3E" : "#f5c518",
              color: "#0f0b07",
            }}
            aria-label={`Ajouter ${product.name} au panier`}
          >
            {added ? (
              <span className="text-[10px] sm:text-sm">OK !</span>
            ) : (
              <>
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Ajouter</span>
                <span className="sm:hidden">+</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
