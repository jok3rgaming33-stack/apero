"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { PRODUCTS, CATEGORIES, type Category, type Product } from "@/lib/data";
import ProductCard from "@/components/product-card";
import ProductModal from "@/components/product-modal";

export default function AperosPage() {
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filtered = PRODUCTS.filter((p) => {
    const matchCat = activeCategory === "all" || p.category === activeCategory;
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <>
      <main className="pt-24 pb-20 min-h-screen">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-10">
            <h1
              className="text-4xl md:text-5xl font-bold mb-3 text-balance"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Nos{" "}
              <span style={{ color: "#f5c518", fontStyle: "italic" }}>formules</span>
            </h1>
            <p style={{ color: "#a89272" }}>
              Choisis la formule qui correspond à ton envie du moment.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#a89272" }} />
              <input
                type="search"
                placeholder="Rechercher une box..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "#1a1208", border: "1px solid #2e2010", color: "#f9f3e8" }}
              />
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory("all")}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: activeCategory === "all" ? "#f5c518" : "#1a1208",
                  color: activeCategory === "all" ? "#0f0b07" : "#a89272",
                  border: `1px solid ${activeCategory === "all" ? "#f5c518" : "#2e2010"}`,
                }}
              >
                Toutes
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: activeCategory === cat.id ? cat.color : "#1a1208",
                    color: activeCategory === cat.id ? "#fff" : "#a89272",
                    border: `1px solid ${activeCategory === cat.id ? cat.color : "#2e2010"}`,
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg" style={{ color: "#a89272" }}>
                Aucune box ne correspond à ta recherche.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelect={setSelectedProduct}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}
