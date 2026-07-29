import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import SiteShell from "@/components/site-shell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "ApéroMaison — L'apéro, livré chez toi !",
  description:
    "Commande ton apéro en ligne : box de charcuterie, fromages, cocktails et snacks livrés à domicile. Livraison 7j/7. Licence IV & conforme.",
  keywords: ["apéro", "livraison", "box apéro", "charcuterie", "cocktail", "apéritif domicile"],
};

export const viewport: Viewport = {
  themeColor: "#0f0b07",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable} bg-background`}>
      <body className="font-sans antialiased min-h-screen">
          <Providers>
            <SiteShell>{children}</SiteShell>
          </Providers>
        </body>
    </html>
  );
}
