import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  MapPin,
  CreditCard,
  Truck,
  Star,
  ShieldCheck,
  Clock,
  Gift,
} from "lucide-react";

const STEPS = [
  {
    number: "01",
    Icon: ShoppingBag,
    title: "Parcours le catalogue",
    description:
      "Explore nos box par catégorie — Classique, Festif, Gourmand ou Healthy. Clique sur une box pour voir le détail du contenu.",
    detail: "8 box disponibles, dès 22,90 €",
  },
  {
    number: "02",
    Icon: MapPin,
    title: "Ajoute au panier & renseigne ta livraison",
    description:
      "Indique ton adresse complète. On livre dans toute notre zone (Bordeaux Métropole et communes alentour). La livraison est toujours gratuite. Vérifie que quelqu'un sera présent pour réceptionner.",
    detail: "Livraison 7j/7 — toujours gratuite",
  },
  {
    number: "03",
    Icon: Clock,
    title: "Choisis ton créneau",
    description:
      "Sélectionne le jour et l'heure qui t'arrangent : matin, après-midi ou soirée. Les créneaux disponibles s'affichent en temps réel.",
    detail: "5 créneaux par jour",
  },
  {
    number: "04",
    Icon: CreditCard,
    title: "Choisis ton mode de paiement",
    description:
      "Règle par carte bancaire (données chiffrées) ou en espèces à la réception de ta commande. Tu reçois un email de confirmation immédiatement.",
    detail: "Carte ou espèces",
  },
  {
    number: "05",
    Icon: Truck,
    title: "Réception & dégustation",
    description:
      "Ton livreur arrive dans le créneau choisi. Vérifie le contenu, signe le bon de livraison — et c'est parti pour l'apéro !",
    detail: "Emballage isotherme inclus",
  },
];

const FAQS = [
  {
    q: "Quelle est la zone de livraison ?",
    a: "Nous livrons dans Bordeaux et toute la Bordeaux Métropole : Mérignac, Pessac, Talence, Bègles, Villenave d'Ornon, Gradignan, Floirac, Cenon, Lormont, Le Bouscat, Bruges, Eysines, Blanquefort, Le Taillan, Parempuyre, Ambarès, Carbon-Blanc, Bassens, Artigues, Bouliac et autres communes de la zone. Consulte la carte ci-dessus pour le détail.",
  },
  {
    q: "Puis-je commander sans créer de compte ?",
    a: "Oui, absolument ! La création d'un compte est optionnelle. Elle te permet seulement d'activer le programme fidélité et de retrouver l'historique de tes commandes.",
  },
  {
    q: "Que se passe-t-il si je suis absent à la livraison ?",
    a: "Le livreur essaie de te joindre. Si personne ne répond, la commande est renvoyée à notre entrepôt et nous replanifions ensemble un nouveau créneau.",
  },
  {
    q: "Les produits contiennent-ils de l'alcool ?",
    a: "Certaines box contiennent de l'alcool (vins, cocktails pré-mixés). Conformément à la loi française, la vente est strictement réservée aux personnes majeures (+18 ans).",
  },
  {
    q: "Puis-je modifier ou annuler ma commande ?",
    a: "Les modifications et annulations sont possibles jusqu'à 2h avant le créneau de livraison. Contacte-nous par email ou chat.",
  },
  {
    q: "Comment fonctionne le programme fidélité ?",
    a: "Chaque euro dépensé = 1 point. À partir de 100 points tu passes en niveau Festif avec 10% de réduction. Le programme compte 4 niveaux.",
  },
];

export default function CommentPage() {
  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4">

        {/* Header */}
        <div className="text-center mb-16">
          <span
            className="inline-block text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
            style={{ background: "rgba(245,197,24,0.1)", color: "#f5c518", border: "1px solid rgba(245,197,24,0.2)" }}
          >
            Simple en 5 étapes
          </span>
          <h1
            className="text-4xl md:text-5xl font-bold mb-4 text-balance"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Comment ça{" "}
            <span style={{ color: "#f5c518", fontStyle: "italic" }}>marche ?</span>
          </h1>
          <p style={{ color: "#a89272" }}>
            Commander ton apéro n&apos;a jamais été aussi simple.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-5 sm:left-6 top-10 bottom-10 w-px hidden md:block"
            style={{ background: "linear-gradient(180deg, #f5c518, #2e2010)" }}
          />

          <div className="flex flex-col gap-5">
            {STEPS.map((step, i) => (
              <div key={step.number} className="flex gap-4 items-start">
                {/* Icon circle */}
                <div
                  className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{
                    background: i === 0 ? "#f5c518" : "#1a1208",
                    border: `2px solid ${i === 0 ? "#f5c518" : "#2e2010"}`,
                  }}
                >
                  <step.Icon
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    style={{ color: i === 0 ? "#0f0b07" : "#f5c518" }}
                  />
                </div>

                {/* Content */}
                <div
                  className="flex-1 rounded-2xl p-4 sm:p-5 border min-w-0"
                  style={{ background: "#1a1208", borderColor: "#2e2010" }}
                >
                  {/* Step label + detail badge — stacked on mobile */}
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold" style={{ color: "#f5c518" }}>
                      Étape {step.number}
                    </span>
                    <span
                      className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(245,197,24,0.1)", color: "#f5c518", border: "1px solid rgba(245,197,24,0.2)" }}
                    >
                      {step.detail}
                    </span>
                  </div>
                  <h2 className="font-bold text-sm sm:text-lg text-foreground leading-snug mb-2">
                    {step.title}
                  </h2>
                  <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "#a89272" }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16">
          {[
            { Icon: ShieldCheck, title: "Licence IV", desc: "Conforme à la législation française sur la vente d'alcool." },
            { Icon: Star, title: "Qualité garantie", desc: "Produits frais, sélectionnés avec soin à chaque commande." },
            { Icon: Gift, title: "Programme fidélité", desc: "Gagne des points et accède à des avantages exclusifs." },
          ].map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl p-5 border text-center"
              style={{ background: "#1a1208", borderColor: "#2e2010" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                style={{ background: "rgba(245,197,24,0.1)" }}
              >
                <Icon className="w-5 h-5" style={{ color: "#f5c518" }} />
              </div>
              <h3 className="font-bold text-sm text-foreground mb-1">{title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "#a89272" }}>{desc}</p>
            </div>
          ))}
        </div>

        {/* Delivery zone map */}
        <div className="mt-16">
          <div className="text-center mb-6">
            <span
              className="inline-block text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 rounded-full"
              style={{ background: "rgba(245,197,24,0.1)", color: "#f5c518", border: "1px solid rgba(245,197,24,0.2)" }}
            >
              Zone de livraison
            </span>
            <h2
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Les communes où nous{" "}
              <span style={{ color: "#f5c518", fontStyle: "italic" }}>livrons</span>
            </h2>
            <p className="text-sm" style={{ color: "#a89272" }}>
              Bordeaux Métropole et communes alentour —{" "}
              <span style={{ color: "#2D9A3E" }} className="font-semibold">livraison toujours gratuite</span>
            </p>
          </div>

          <div
            className="rounded-2xl overflow-hidden border"
            style={{ borderColor: "#2e2010" }}
          >
            <Image
              src="/zone-livraison.jpg"
              alt="Carte des communes livrées par ApéroMaison — Bordeaux Métropole"
              width={1024}
              height={1024}
              className="w-full h-auto"
              priority
            />
          </div>

          {/* Communes list */}
          <div
            className="mt-4 rounded-xl p-4 border"
            style={{ background: "#1a1208", borderColor: "#2e2010" }}
          >
            <p className="text-xs font-semibold mb-3" style={{ color: "#a89272" }}>
              Communes desservies
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "Bordeaux", "Mérignac", "Pessac", "Talence", "Bègles",
                "Villenave d'Ornon", "Gradignan", "Floirac", "Cenon", "Lormont",
                "Le Bouscat", "Bruges", "Eysines", "Le Haillan", "Blanquefort",
                "Le Taillan-Médoc", "Parempuyre", "Ambarès-et-Lagrave", "Carbon-Blanc",
                "Bassens", "Artigues", "Bouliac", "Saint-Aubin-de-Médoc",
                "Saint-Médard-en-Jalles", "Martignas-sur-Jalle", "Ambès",
                "Saint-Louis-de-Montferrand", "Saint-Vincent-de-Paul",
              ].map((commune) => (
                <span
                  key={commune}
                  className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(245,197,24,0.07)", border: "1px solid rgba(245,197,24,0.15)", color: "#a89272" }}
                >
                  {commune}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2
            className="text-2xl font-bold mb-8 text-center"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Questions{" "}
            <span style={{ color: "#f5c518", fontStyle: "italic" }}>fréquentes</span>
          </h2>
          <div className="flex flex-col gap-4">
            {FAQS.map((faq) => (
              <div
                key={faq.q}
                className="rounded-xl p-5 border"
                style={{ background: "#1a1208", borderColor: "#2e2010" }}
              >
                <h3 className="font-bold text-sm text-foreground mb-2">{faq.q}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#a89272" }}>
                  {faq.a}
                </p>
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
            Commander maintenant
          </Link>
        </div>
      </div>
    </main>
  );
}
