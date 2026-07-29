import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "@/lib/data";

export default function CategoriesSection() {
  return (
    <section className="py-20 px-4" style={{ background: "#0f0b07" }}>
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#f5c518" }}>
            Notre sélection
          </p>
          <h2
            className="text-4xl md:text-5xl font-bold mb-3 text-balance"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Des moments, des amis, des{" "}
            <span style={{ color: "#f5c518", fontStyle: "italic" }}>formules</span>
          </h2>
          <p className="text-base" style={{ color: "#a89272" }}>
            Choisis ta vibe, on s&apos;occupe du reste.
          </p>
        </div>

        {/* Grid 4×2 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/aperos?cat=${cat.id}`}
              className="group relative rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1"
              style={{ borderColor: "#2e2010", background: "#1a1208" }}
            >
              {/* Image */}
              <div className="relative h-36 overflow-hidden">
                <Image
                  src={cat.image}
                  alt={cat.label}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: `linear-gradient(to top, #0f0b07dd 0%, transparent 55%)` }}
                />
                {/* Color accent top-left dot */}
                <div
                  className="absolute top-2.5 left-2.5 w-2 h-2 rounded-full"
                  style={{ background: cat.color }}
                />
              </div>

              {/* Label */}
              <div className="px-3 py-2.5">
                <p className="font-bold text-sm leading-tight" style={{ color: "#f9f3e8" }}>
                  {cat.label}
                </p>
                <p className="text-xs mt-0.5 leading-snug" style={{ color: "#6b5540" }}>
                  {cat.description}
                </p>
              </div>

              {/* Arrow on hover */}
              <div
                className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "#f5c518" }}
              >
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 10L10 2M10 2H4M10 2V8" stroke="#0f0b07" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/aperos"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm transition-all hover:opacity-90 hover:scale-105"
            style={{ background: "#f5c518", color: "#0f0b07" }}
          >
            Voir toutes les formules
          </Link>
        </div>

        {/* Trust badges */}
        <div
          className="mt-10 flex flex-wrap justify-center gap-6 pt-8 text-xs"
          style={{ borderTop: "1px solid #2e2010", color: "#6b5540" }}
        >
          {["Livraison 7j/7", "Licence IV & conforme", "Entre amis, que du bon", "Carte ou espèces"].map((t) => (
            <span key={t} className="flex items-center gap-1.5">
              <span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{ background: "#f5c518" }}
              />
              {t}
            </span>
          ))}
        </div>

      </div>
    </section>
  );
}
