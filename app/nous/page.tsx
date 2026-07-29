import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

const TEAM = [
  { name: "Lucas B.", role: "Fondateur & CEO", initials: "LB" },
  { name: "Manon T.", role: "Responsable qualité", initials: "MT" },
  { name: "Samir A.", role: "Logistique & livraisons", initials: "SA" },
];

const TIMELINE = [
  { year: "2022", text: "Première idée : commander son apéro comme une pizza, sans prise de tête." },
  { year: "2023", text: "Obtention de la Licence IV. Premières livraisons en Île-de-France." },
  { year: "2024", text: "Extension à 5 nouvelles villes. Lancement du programme fidélité." },
  { year: "2025", text: "ApéroMaison.fr — la nouvelle plateforme de commande en ligne." },
];

export default function NousPage() {
  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-16">
          <span
            className="inline-block text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
            style={{ background: "rgba(245,197,24,0.1)", color: "#f5c518", border: "1px solid rgba(245,197,24,0.2)" }}
          >
            Notre histoire
          </span>
          <h1
            className="text-4xl md:text-5xl font-bold mb-5 text-balance"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            L&apos;apéro, c&apos;est{" "}
            <span style={{ color: "#f5c518", fontStyle: "italic" }}>notre passion</span>
          </h1>
          <p className="max-w-xl mx-auto leading-relaxed" style={{ color: "#a89272" }}>
            ApéroMaison est né d&apos;une idée simple : pourquoi l&apos;apéro devrait-il
            être compliqué ? On voulait des produits de qualité, livrés rapidement, pour que
            la seule chose dont tu aies à t&apos;occuper soit de profiter.
          </p>
        </div>

        {/* Mission card */}
        <div
          className="rounded-2xl p-8 border mb-12 relative overflow-hidden"
          style={{ background: "#1a1208", borderColor: "#2e2010" }}
        >
          <div
            className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(245,197,24,0.07) 0%, transparent 70%)" }}
          />
          <h2
            className="text-2xl font-bold mb-4 relative"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Notre mission
          </h2>
          <p className="leading-relaxed relative" style={{ color: "#c4a882" }}>
            Rendre l&apos;apéro accessible, responsable et mémorable. Chaque box est construite
            avec des produits sélectionnés par nos équipes — fraîcheur, authenticité et plaisir
            avant tout. Nous travaillons uniquement avec des fournisseurs locaux et des
            producteurs engagés.
          </p>
        </div>

        {/* Timeline */}
        <div className="mb-16">
          <h2
            className="text-2xl font-bold mb-8"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Notre{" "}
            <span style={{ color: "#f5c518", fontStyle: "italic" }}>parcours</span>
          </h2>
          <div className="flex flex-col gap-4">
            {TIMELINE.map((t) => (
              <div key={t.year} className="flex gap-5 items-start">
                <div
                  className="w-16 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: "rgba(245,197,24,0.1)", color: "#f5c518", border: "1px solid rgba(245,197,24,0.2)" }}
                >
                  {t.year}
                </div>
                <p className="text-sm leading-relaxed pt-1" style={{ color: "#a89272" }}>
                  {t.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="mb-16">
          <h2
            className="text-2xl font-bold mb-8"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            L&apos;équipe
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="rounded-2xl p-6 border text-center"
                style={{ background: "#1a1208", borderColor: "#2e2010" }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold"
                  style={{ background: "rgba(245,197,24,0.12)", color: "#f5c518", border: "1.5px solid rgba(245,197,24,0.3)" }}
                >
                  {member.initials}
                </div>
                <h3 className="font-bold text-foreground">{member.name}</h3>
                <p className="text-xs mt-1" style={{ color: "#a89272" }}>{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values pills */}
        <div className="mb-16">
          <h2
            className="text-2xl font-bold mb-6"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Nos engagements
          </h2>
          <div className="flex flex-wrap gap-3">
            {[
              "Licence IV — conforme à la loi",
              "Produits frais et locaux",
              "Emballage éco-responsable",
              "Livraison 7j/7",
              "Contre la vente aux mineurs",
              "Consommation responsable",
              "Transparence des prix",
            ].map((v) => (
              <span
                key={v}
                className="px-4 py-2 rounded-full text-sm font-medium border"
                style={{ borderColor: "#2e2010", color: "#a89272", background: "#1a1208" }}
              >
                {v}
              </span>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div
          className="rounded-2xl p-8 border"
          style={{ background: "#1a1208", borderColor: "#2e2010" }}
        >
          <h2 className="text-xl font-bold mb-6" style={{ fontFamily: "var(--font-playfair)" }}>
            Nous contacter
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { Icon: Mail, label: "Email", value: "bonjour@aperomaison.fr" },
              { Icon: Phone, label: "Téléphone", value: "01 23 45 67 89" },
              { Icon: MapPin, label: "Adresse", value: "Paris, France" },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(245,197,24,0.1)" }}
                >
                  <Icon className="w-4 h-4" style={{ color: "#f5c518" }} />
                </div>
                <div>
                  <p className="text-xs" style={{ color: "#6b5540" }}>{label}</p>
                  <p className="text-sm font-medium text-foreground">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <Link
            href="/aperos"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all hover:opacity-90"
            style={{ background: "#f5c518", color: "#0f0b07" }}
          >
            Découvrir nos box
          </Link>
        </div>
      </div>
    </main>
  );
}
