const STEPS = [
  {
    number: "01",
    title: "Choisis ta box",
    description:
      "Parcours notre catalogue et sélectionne la box qui correspond à ton envie du moment.",
    icon: "🛍️",
  },
  {
    number: "02",
    title: "Indique la livraison",
    description:
      "Renseigne ton adresse et choisis un créneau de livraison. Disponible 7j/7.",
    icon: "📍",
  },
  {
    number: "03",
    title: "Paie en toute sécurité",
    description:
      "Règlement sécurisé par carte bancaire. Aucune surprise sur la facture.",
    icon: "💳",
  },
  {
    number: "04",
    title: "Profite !",
    description:
      "Ton apéro arrive chez toi. Plus qu'à trinquer avec tes amis !",
    icon: "🥂",
  },
];

export default function HowItWorks() {
  return (
    <section
      className="py-20 border-y"
      style={{ background: "#0a0804", borderColor: "#2e2010" }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-14">
          <span
            className="inline-block text-xs font-bold uppercase tracking-widest mb-3 px-3 py-1 rounded-full"
            style={{ background: "rgba(245,197,24,0.1)", color: "#f5c518", border: "1px solid rgba(245,197,24,0.2)" }}
          >
            Simple & rapide
          </span>
          <h2
            className="text-4xl md:text-5xl font-bold text-balance"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Comment ça{" "}
            <span style={{ color: "#f5c518", fontStyle: "italic" }}>marche ?</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connecting line (desktop) */}
          <div
            className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px"
            style={{ background: "linear-gradient(90deg, transparent, #f5c518, transparent)" }}
          />

          {STEPS.map((step) => (
            <div
              key={step.number}
              className="relative flex flex-col items-center text-center p-6 rounded-2xl border"
              style={{ background: "#1a1208", borderColor: "#2e2010" }}
            >
              {/* Number */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4 text-3xl"
                style={{ background: "rgba(245,197,24,0.1)", border: "1.5px solid rgba(245,197,24,0.3)" }}
              >
                {step.icon}
              </div>
              <span className="text-xs font-bold mb-1" style={{ color: "#f5c518" }}>
                Étape {step.number}
              </span>
              <h3 className="text-base font-bold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#a89272" }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
