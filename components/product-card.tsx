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
      <div className="relative h-48 overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Badge */}
        {product.badge && (
          <span
            className="absolute top-3 left-3 text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background: "#f5c518", color: "#0f0b07" }}
          >
            {product.badge}
          </span>
        )}
        {/* Original price */}
        {product.originalPrice && (
          <span
            className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full"
            style={{ background: "rgba(232,88,10,0.9)", color: "#fff" }}
          >
            -{Math.round((1 - product.price / product.originalPrice) * 100)}%
          </span>
        )}
        {/* Category pill */}
        <span
          className="absolute bottom-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full text-white"
          style={{ background: cat?.color ?? "#555", opacity: 0.95 }}
        >
          {cat?.label}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-base text-foreground mb-0.5 text-balance">
          {product.name}
        </h3>
        <p className="text-xs mb-2" style={{ color: "#a89272" }}>
          {product.tagline}
        </p>

        {/* Serves */}
        <div className="flex items-center gap-1 mb-3">
          <Users className="w-3.5 h-3.5" style={{ color: "#a89272" }} />
          <span className="text-xs" style={{ color: "#a89272" }}>
            {product.serves}
          </span>
          {product.popular && (
            <>
              <span className="mx-1" style={{ color: "#2e2010" }}>•</span>
              <Star className="w-3.5 h-3.5 fill-current" style={{ color: "#f5c518" }} />
              <span className="text-xs" style={{ color: "#f5c518" }}>
                Populaire
              </span>
            </>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {product.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: "#2a1f12", color: "#a89272" }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold" style={{ color: "#f5c518" }}>
              {product.price.toFixed(2)} €
            </span>
            {product.originalPrice && (
              <span className="text-sm ml-1.5 line-through" style={{ color: "#6b5540" }}>
                {product.originalPrice.toFixed(2)} €
              </span>
            )}
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={{
              background: added ? "#2D9A3E" : "#f5c518",
              color: "#0f0b07",
            }}
            aria-label={`Ajouter ${product.name} au panier`}
          >
            {added ? (
              "Ajouté !"
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Ajouter
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
