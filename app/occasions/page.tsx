import Link from "next/link";
import { OCCASIONS, PRODUCTS, CATEGORIES } from "@/lib/data";

const OCCASION_RECO: Record<string, string[]> = {
  anniversaire: ["box-festif-xl", "box-gourmand-premium", "box-classique-l"],
  soiree:       ["box-classique-l", "box-festif-m", "box-gourmand-m"],
  bureau:       ["box-classique-s", "box-healthy-m", "box-gourmand-m"],
  romantique:   ["box-gourmand-premium", "box-classique-s", "box-healthy-m"],
  sport:        ["box-festif-m", "box-classique-s", "box-healthy-l"],
  barbecue:     ["box-classique-l", "box-festif-xl", "box-gourmand-m"],
};

const CAT_COLORS: Record<string, string> = {
  classique: "#E8580A",
  festif:    "#8B3FC9",
  gourmand:  "#2D9A3E",
  healthy:   "#1A7CC5",
};

export default function OccasionsPage() {
  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-14">
          <span
            className="inline-block text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
            style={{ background: "rgba(245,197,24,0.1)", color: "#f5c518", border: "1px solid rgba(245,197,24,0.2)" }}
          >
            Toutes les occasions
          </span>
          <h1
            className="text-4xl md:text-5xl font-bold mb-4 text-balance"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Pour chaque{" "}
            <span style={{ color: "#f5c518", fontStyle: "italic" }}>moment</span>
          </h1>
          <p style={{ color: "#a89272" }}>
            Trouve la box idéale selon l&apos;occasion du soir.
          </p>
        </div>

        {/* Occasions grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {OCCASIONS.map((occ) => {
            const recoIds = OCCASION_RECO[occ.id] ?? [];
            const recoProducts = recoIds
              .map((id) => PRODUCTS.find((p) => p.id === id))
              .filter(Boolean) as typeof PRODUCTS;

            return (
              <div
                key={occ.id}
                className="rounded-2xl p-6 border flex flex-col"
                style={{ background: "#1a1208", borderColor: "#2e2010" }}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{ background: "rgba(245,197,24,0.1)", border: "1px solid rgba(245,197,24,0.2)" }}
                  >
                    {occ.icon}
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-foreground leading-tight">
                      {occ.label}
                    </h2>
                    <p className="text-sm" style={{ color: "#a89272" }}>
                      {occ.description}
                    </p>
                  </div>
                </div>

                {/* Reco list */}
                <div className="flex flex-col gap-2 flex-1">
                  {recoProducts.map((p) => {
                    const catColor = CAT_COLORS[p.category] ?? "#888";
                    const catLabel = CATEGORIES.find((c) => c.id === p.category)?.label ?? "";
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl"
                        style={{ background: "#0f0b07" }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="text-xs px-2 py-0.5 rounded-full shrink-0 font-semibold text-white"
                            style={{ background: catColor }}
                          >
                            {catLabel}
                          </span>
                          <span className="text-sm text-foreground truncate">{p.name}</span>
                        </div>
                        <span className="text-sm font-bold shrink-0" style={{ color: "#f5c518" }}>
                          {p.price.toFixed(2)} €
                        </span>
                      </div>
                    );
                  })}
                </div>

                <Link
                  href={`/aperos?categorie=all`}
                  className="mt-5 block text-center py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary"
                  style={{ borderColor: "#2e2010", color: "#a89272" }}
                >
                  Voir toutes les box
                </Link>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p
            className="text-2xl font-bold mb-6"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Tu ne sais pas encore ?{" "}
            <span style={{ color: "#f5c518", fontStyle: "italic" }}>On t&apos;aide.</span>
          </p>
          <Link
            href="/aperos"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all hover:opacity-90"
            style={{ background: "#f5c518", color: "#0f0b07" }}
          >
            Voir tout le catalogue
          </Link>
        </div>
      </div>
    </main>
  );
}
