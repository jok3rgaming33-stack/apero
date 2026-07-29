import Link from "next/link";
import Image from "next/image";
import { CATEGORIES } from "@/lib/data";

const CAT_IMAGES: Record<string, string> = {
  classique: "/box-classique.png",
  festif: "/box-festif.png",
  gourmand: "/box-gourmand.png",
  healthy: "/box-healthy.png",
};

export default function CategoriesSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <h2
          className="text-4xl md:text-5xl font-bold mb-3 text-balance"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Des moments, des amis, des{" "}
          <span style={{ color: "#f5c518", fontStyle: "italic" }}>apéros</span>
        </h2>
        <p className="text-base" style={{ color: "#a89272" }}>
          Choisis ta vibe, on s&apos;occupe du reste.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={`/aperos?categorie=${cat.id}`}
            className="group relative rounded-2xl overflow-hidden aspect-[3/4] block"
            style={{ background: cat.color }}
          >
            <Image
              src={CAT_IMAGES[cat.id]}
              alt={cat.label}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            {/* Overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(0deg, ${cat.color}ee 0%, ${cat.color}44 50%, transparent 100%)`,
              }}
            />
            {/* Content */}
            <div className="absolute inset-x-0 bottom-0 p-4">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full mb-2"
                style={{ background: cat.color, color: "#fff", border: "1px solid rgba(255,255,255,0.3)" }}
              >
                {cat.label}
              </span>
              <h3 className="text-lg font-bold text-white leading-tight text-balance">
                {cat.description}
              </h3>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center mt-8">
        <Link
          href="/aperos"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all border"
          style={{ borderColor: "#f5c518", color: "#f5c518", background: "rgba(245,197,24,0.07)" }}
        >
          Voir toutes les box
        </Link>
      </div>
    </section>
  );
}
