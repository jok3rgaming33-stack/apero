import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="border-t mt-20"
      style={{ background: "#0a0804", borderColor: "#2e2010" }}
    >
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🍸</span>
              <span
                className="text-lg font-bold"
                style={{ fontFamily: "var(--font-playfair)", color: "#f5c518" }}
              >
                ApéroMaison
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-4" style={{ color: "#7a5c3f" }}>
              L&apos;apéro, livré chez toi. Apéros gourmands, boissons fraîches et
              bonne humeur, livrés en un clin d&apos;œil.
            </p>
            <p className="text-xs" style={{ color: "#4a3520" }}>
              Licence IV • Vente d&apos;alcool interdite aux mineurs
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "#f9f3e8" }}>
              Navigation
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/aperos", label: "Nos formules" },
                { href: "/comment", label: "Comment ça marche ?" },
                { href: "/nous", label: "Notre histoire" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm transition-colors hover:text-primary"
                    style={{ color: "#7a5c3f" }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "#f9f3e8" }}>
              Mon compte
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/compte", label: "Se connecter" },
                { href: "/compte/inscription", label: "Créer un compte" },
                { href: "/compte/fidelite", label: "Programme fidélité" },
                { href: "/compte/commandes", label: "Mes commandes" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm transition-colors hover:text-primary"
                    style={{ color: "#7a5c3f" }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold mb-4" style={{ color: "#f9f3e8" }}>
              Informations
            </h3>
            <ul className="space-y-2">
              {[
                { href: "#", label: "Mentions légales" },
                { href: "#", label: "CGV" },
                { href: "#", label: "Politique de confidentialité" },
                { href: "#", label: "Contact" },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm transition-colors hover:text-primary"
                    style={{ color: "#7a5c3f" }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-10 pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderColor: "#2e2010" }}
        >
          <p className="text-xs" style={{ color: "#4a3520" }}>
            © 2026 - HeisenWeb - Créateur de solutions innovantes - Tous droits réservés - Reproduction interdite - brevet déposé.
          </p>
          <p className="text-xs" style={{ color: "#4a3520" }}>
            L&apos;abus d&apos;alcool est dangereux pour la santé — à consommer avec
            modération.
          </p>
        </div>
      </div>
    </footer>
  );
}
