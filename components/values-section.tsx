import Link from "next/link";
import { Scale, Leaf, Heart, Zap } from "lucide-react";

const VALUES = [
  {
    icon: <Scale className="w-6 h-6" />,
    title: "Légal & responsable",
    description: "Licence IV, code de la route, éthique. On est sérieux sur les règles.",
  },
  {
    icon: <Leaf className="w-6 h-6" />,
    title: "Qualité",
    description: "Produits sélectionnés avec soin. Fraîcheur et authenticité garanties.",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Esprit festif",
    description: "Le plaisir avant tout. On est là pour que ta soirée soit réussie.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Rapide & simple",
    description: "Quelques clics suffisent. Ton apéro arrive sans prise de tête.",
  },
];

export default function ValuesSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left: values */}
        <div>
          <span
            className="inline-block text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
            style={{ background: "rgba(245,197,24,0.1)", color: "#f5c518", border: "1px solid rgba(245,197,24,0.2)" }}
          >
            Nos valeurs
          </span>
          <h2
            className="text-4xl md:text-5xl font-bold mb-8 text-balance"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Plus qu&apos;un service,{" "}
            <span style={{ color: "#f5c518", fontStyle: "italic" }}>un état d&apos;esprit</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="flex gap-4 p-4 rounded-xl border"
                style={{ background: "#1a1208", borderColor: "#2e2010" }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(245,197,24,0.1)", color: "#f5c518" }}
                >
                  {v.icon}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground mb-1">{v.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "#a89272" }}>
                    {v.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: CTA card */}
        <div
          className="rounded-2xl p-8 border relative overflow-hidden"
          style={{ background: "#1a1208", borderColor: "#2e2010" }}
        >
          {/* Decorative glow */}
          <div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(245,197,24,0.08) 0%, transparent 70%)" }}
          />

          <div className="relative z-10">
            <div className="text-5xl mb-6">🥂</div>
            <h3
              className="text-3xl font-bold mb-3"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Prêt à lancer{" "}
              <span style={{ color: "#f5c518", fontStyle: "italic" }}>l&apos;apéro ?</span>
            </h3>
            <p className="mb-6 leading-relaxed" style={{ color: "#a89272" }}>
              Rejoins des centaines de fêtards qui commandent leur apéro en
              quelques clics. Livraison rapide, qualité premium.
            </p>
            <Link
              href="/aperos"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-base transition-all hover:opacity-90 active:scale-95"
              style={{ background: "#f5c518", color: "#0f0b07" }}
            >
              C&apos;est parti !
            </Link>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t" style={{ borderColor: "#2e2010" }}>
              {[
                { value: "500+", label: "Commandes" },
                { value: "4.9★", label: "Note moyenne" },
                { value: "7j/7", label: "Disponible" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-xl font-bold" style={{ color: "#f5c518" }}>{s.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: "#a89272" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
