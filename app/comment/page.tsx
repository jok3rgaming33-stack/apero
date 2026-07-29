import Link from "next/link";
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
      "Indique ton adresse complète. On livre partout en France métropolitaine. Vérifie que quelqu'un sera présent pour réceptionner.",
    detail: "Livraison 7j/7",
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
    title: "Paie en sécurité",
    description:
      "Règlement par carte bancaire. Toutes les données sont chiffrées. Tu reçois un email de confirmation immédiatement.",
    detail: "Paiement 100% sécurisé",
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
    a: "Nous livrons actuellement en Île-de-France et dans les grandes agglomérations françaises. La couverture s'étend régulièrement.",
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
            className="absolute left-6 top-8 bottom-8 w-px hidden md:block"
            style={{ background: "linear-gradient(180deg, #f5c518, #2e2010)" }}
          />

          <div className="flex flex-col gap-6">
            {STEPS.map((step, i) => (
              <div key={step.number} className="flex gap-6 items-start">
                {/* Icon circle */}
                <div
                  className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: i === 0 ? "#f5c518" : "#1a1208",
                    border: `2px solid ${i === 0 ? "#f5c518" : "#2e2010"}`,
                  }}
                >
                  <step.Icon
                    className="w-5 h-5"
                    style={{ color: i === 0 ? "#0f0b07" : "#f5c518" }}
                  />
                </div>

                {/* Content */}
                <div
                  className="flex-1 rounded-2xl p-5 border"
                  style={{ background: "#1a1208", borderColor: "#2e2010" }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-xs font-bold" style={{ color: "#f5c518" }}>
                        Étape {step.number}
                      </span>
                      <h2 className="font-bold text-lg text-foreground leading-tight">
                        {step.title}
                      </h2>
                    </div>
                    <span
                      className="text-xs px-2.5 py-1 rounded-full shrink-0"
                      style={{ background: "rgba(245,197,24,0.1)", color: "#f5c518", border: "1px solid rgba(245,197,24,0.2)" }}
                    >
                      {step.detail}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: "#a89272" }}>
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
