"use client";

import { useState, useEffect } from "react";
import { Search, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PRODUCTS, CATEGORIES, type Category, type Product } from "@/lib/data";
import ProductCard from "@/components/product-card";
import ProductModal from "@/components/product-modal";

export default function AperosPage() {
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<Category | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const cat = searchParams.get("cat") as Category | null;
    if (cat && CATEGORIES.some((c) => c.id === cat)) {
      setActiveCategory(cat);
    }
  }, [searchParams]);

  const matchesSearch = (p: Product) =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));

  // In "all" mode, get categories that have at least one result
  const visibleCategories =
    activeCategory === "all"
      ? CATEGORIES.filter((cat) =>
          PRODUCTS.some((p) => p.category === cat.id && matchesSearch(p))
        )
      : CATEGORIES.filter((c) => c.id === activeCategory);

  const totalResults = PRODUCTS.filter(
    (p) =>
      (activeCategory === "all" || p.category === activeCategory) &&
      matchesSearch(p)
  ).length;

  return (
    <>
      <main className="pt-24 pb-20 min-h-screen" style={{ background: "#0f0b07" }}>
        <div className="max-w-7xl mx-auto px-4">

          {/* ── Page header ───────────────────────────────────────────── */}
          <div className="mb-10">
            <h1
              className="text-4xl md:text-5xl font-bold mb-2 text-balance"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Nos{" "}
              <span style={{ color: "#f5c518", fontStyle: "italic" }}>formules</span>
            </h1>
            <p style={{ color: "#a89272" }}>
              Choisis la formule qui correspond à ton envie du moment.
            </p>
          </div>

          {/* ── Sticky filter bar ─────────────────────────────────────── */}
          <div
            className="sticky top-16 z-20 -mx-4 px-4 pt-3 pb-2 mb-8"
            style={{ background: "#0f0b07", borderBottom: "1px solid #2e2010" }}
          >
            {/* Row 1 : search + result count */}
            <div className="flex items-center gap-3 mb-2">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                  style={{ color: "#6b5540" }}
                />
                <input
                  type="search"
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none"
                  style={{ background: "#1a1208", border: "1px solid #2e2010", color: "#f9f3e8" }}
                />
              </div>
              {(search || activeCategory !== "all") && (
                <p className="shrink-0 text-xs whitespace-nowrap" style={{ color: "#6b5540" }}>
                  {totalResults} résultat{totalResults !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            {/* Row 2 : category pills — horizontally scrollable, no wrap */}
            <div
              className="flex gap-2 overflow-x-auto pb-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <button
                onClick={() => setActiveCategory("all")}
                className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all"
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
                  className="shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5"
                  style={{
                    background: activeCategory === cat.id ? cat.color : "#1a1208",
                    color: activeCategory === cat.id ? "#fff" : "#a89272",
                    border: `1px solid ${activeCategory === cat.id ? cat.color : "#2e2010"}`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: activeCategory === cat.id ? "#fff" : cat.color }}
                  />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── No results ────────────────────────────────────────────── */}
          {totalResults === 0 && (
            <div className="text-center py-24">
              <p className="text-base" style={{ color: "#a89272" }}>
                Aucune formule ne correspond à ta recherche.
              </p>
              <button
                onClick={() => { setSearch(""); setActiveCategory("all"); }}
                className="mt-4 text-sm underline"
                style={{ color: "#f5c518" }}
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}

          {/* ── Category sections ─────────────────────────────────────── */}
          <div className="flex flex-col gap-16">
            {visibleCategories.map((cat) => {
              const catProducts = PRODUCTS.filter(
                (p) => p.category === cat.id && matchesSearch(p)
              );

              return (
                <section key={cat.id} id={cat.id}>

                  {/* Section header */}
                  <div
                    className="flex items-center justify-between mb-4 pb-3"
                    style={{ borderBottom: `2px solid ${cat.color}33` }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Thumbnail — hidden on small mobile, visible sm+ */}
                      <div
                        className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border hidden sm:block"
                        style={{ borderColor: `${cat.color}44` }}
                      >
                        <Image
                          src={cat.image}
                          alt={cat.label}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Color bar accent — mobile only */}
                      <div
                        className="w-1 h-8 rounded-full shrink-0 sm:hidden"
                        style={{ background: cat.color }}
                      />

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2
                            className="text-base sm:text-xl font-bold leading-tight"
                            style={{ fontFamily: "var(--font-playfair)", color: "#f9f3e8" }}
                          >
                            {cat.label}
                          </h2>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-semibold whitespace-nowrap"
                            style={{ background: `${cat.color}22`, color: cat.color }}
                          >
                            {catProducts.length} produit{catProducts.length > 1 ? "s" : ""}
                          </span>
                        </div>
                        <p className="text-xs mt-0.5 truncate" style={{ color: "#6b5540" }}>
                          {cat.description}
                        </p>
                      </div>
                    </div>

                    {/* "Voir tout" link — only in "all" mode */}
                    {activeCategory === "all" && (
                      <button
                        onClick={() => setActiveCategory(cat.id)}
                        className="flex items-center gap-0.5 text-xs font-semibold shrink-0 ml-2 transition-opacity hover:opacity-70"
                        style={{ color: cat.color }}
                      >
                        Voir tout
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Product grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {catProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onSelect={setSelectedProduct}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

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
