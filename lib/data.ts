export type Category =
  | "whisky"
  | "vodka"
  | "gin"
  | "rhum"
  | "vin"
  | "cognac"
  | "biere"
  | "liqueur";

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: Category;
  image: string;
  tags: string[];
  serves?: string;
  badge?: string;
  popular?: boolean;
  contents: string[];
}

export const CATEGORIES: { id: Category; label: string; color: string; image: string; description: string }[] = [
  { id: "whisky",  label: "Nos Whiskys",          color: "#b45309", image: "/cat-whisky.png",  description: "Blends, single malts, bourbons" },
  { id: "vodka",   label: "Nos Vodkas",            color: "#3b82f6", image: "/cat-vodka.png",   description: "Pures, premium et aromatisées" },
  { id: "gin",     label: "Nos Gins",              color: "#059669", image: "/cat-gin.png",     description: "Artisanaux, botaniques, classiques" },
  { id: "rhum",    label: "Nos Rhums",             color: "#dc2626", image: "/cat-rhum.png",    description: "Blancs, ambres, vieux et arrangés" },
  { id: "vin",     label: "Nos Vins & Champagnes", color: "#7c3aed", image: "/cat-vin.png",     description: "Rouges, blancs, rosés, bulles" },
  { id: "cognac",  label: "Nos Cognacs",           color: "#92400e", image: "/cat-cognac.png",  description: "VS, VSOP, XO et grande réserve" },
  { id: "biere",   label: "Nos Bières",            color: "#d97706", image: "/cat-biere.png",   description: "Craft, pression, du monde" },
  { id: "liqueur", label: "Nos Liqueurs",          color: "#db2777", image: "/cat-liqueur.png", description: "Crèmes, triple sec, amaretto" },
];

export const PRODUCTS: Product[] = [
  // ── WHISKYS ────────────────────────────────────────────────────────────────
  {
    id: "w1",
    name: "Johnnie Walker Black Label 70cl",
    tagline: "Le blend écossais incontournable.",
    description: "Vieilli 12 ans minimum, ce blend conjugue fumée douce, fruits secs et épices avec une finale longue et chaleureuse.",
    price: 34.90,
    category: "whisky",
    image: "/cat-whisky.png",
    tags: ["Blend", "12 ans", "Ecosse"],
    badge: "Best-seller",
    popular: true,
    contents: ["1 bouteille 70cl", "Fiche de dégustation"],
  },
  {
    id: "w2",
    name: "Glenfiddich 12 ans 70cl",
    tagline: "Le single malt le plus vendu au monde.",
    description: "Fruité, frais et délicat. Notes de poire mûre, crème et chêne doux. La porte d'entrée idéale dans l'univers des single malts.",
    price: 42.90,
    category: "whisky",
    image: "/cat-whisky.png",
    tags: ["Single Malt", "12 ans", "Speyside"],
    badge: "Single Malt",
    contents: ["1 bouteille 70cl", "Fiche de dégustation"],
  },
  {
    id: "w3",
    name: "Jack Daniel's Old N°7 70cl",
    tagline: "Tennessee Whiskey, l'original.",
    description: "Filtré au charbon de bois d'érable selon la méthode Lincoln County. Saveurs de vanille, caramel grillé et banane.",
    price: 29.90,
    category: "whisky",
    image: "/cat-whisky.png",
    tags: ["Tennessee", "Bourbon", "USA"],
    popular: true,
    contents: ["1 bouteille 70cl"],
  },
  {
    id: "w4",
    name: "Coffret Dégustation Whisky x3",
    tagline: "Tour du monde en trois verres.",
    description: "Un blend irlandais, un single malt écossais et un bourbon américain pour explorer tous les grands styles de whisky.",
    price: 54.90,
    category: "whisky",
    image: "/cat-whisky.png",
    tags: ["Coffret", "Dégustation", "3 styles"],
    badge: "Coffret",
    serves: "2–4 personnes",
    contents: ["3 mignonettes 20cl (blend / single malt / bourbon)", "Guide de dégustation illustré", "2 verres à whisky tulipe"],
  },

  // ── VODKAS ─────────────────────────────────────────────────────────────────
  {
    id: "v1",
    name: "Absolut Vodka 70cl",
    tagline: "La référence suédoise depuis 1879.",
    description: "Distillée en continu à Åhus, Suède. Pure, nette, légèrement crémeuse avec une pointe de grain. Incontournable en cocktail.",
    price: 22.90,
    category: "vodka",
    image: "/cat-vodka.png",
    tags: ["Suède", "Pure", "Cocktail"],
    popular: true,
    contents: ["1 bouteille 70cl"],
  },
  {
    id: "v2",
    name: "Grey Goose 70cl",
    tagline: "La vodka française premium.",
    description: "Distillée en Charente à partir de blé français. Texture onctueuse, douceur céréalière, finale nette et élégante.",
    price: 38.90,
    category: "vodka",
    image: "/cat-vodka.png",
    tags: ["France", "Premium", "Blé"],
    badge: "Premium",
    popular: true,
    contents: ["1 bouteille 70cl", "Recettes de cocktails"],
  },
  {
    id: "v3",
    name: "Kit Soirée Vodka Cocktails",
    tagline: "Tout pour une soirée cocktails réussie.",
    description: "Vodka + jus + sodas + glaçons : tout le nécessaire pour préparer vos cocktails maison sans stress.",
    price: 34.90,
    category: "vodka",
    image: "/cat-vodka.png",
    tags: ["Kit", "Cocktail", "Soirée"],
    badge: "Kit cocktail",
    serves: "4–6 personnes",
    contents: ["Absolut 70cl", "Jus de cranberry 1L", "Soda citron 50cl", "Glaçons 1kg", "Fiches recettes"],
  },

  // ── GINS ───────────────────────────────────────────────────────────────────
  {
    id: "g1",
    name: "Hendrick's Gin 70cl",
    tagline: "Le gin à la rose et au concombre.",
    description: "Distillé en Écosse avec des pétales de rose bulgare et du concombre. Floral, doux, frais. La star des gin tonics.",
    price: 36.90,
    category: "gin",
    image: "/cat-gin.png",
    tags: ["Ecosse", "Floral", "Premium"],
    badge: "Signature",
    popular: true,
    contents: ["1 bouteille 70cl"],
  },
  {
    id: "g2",
    name: "Monkey 47 50cl",
    tagline: "47 botaniques, une complexité rare.",
    description: "Gin de la Forêt-Noire allemande distillé avec 47 plantes et épices dont la prune sauvage locale. Aromatique et complexe.",
    price: 44.90,
    category: "gin",
    image: "/cat-gin.png",
    tags: ["Allemagne", "Artisanal", "47 botaniques"],
    badge: "Artisanal",
    contents: ["1 bouteille 50cl", "Fiche des 47 botaniques"],
  },
  {
    id: "g3",
    name: "Kit G&T Maison",
    tagline: "Le gin tonic parfait livré chez toi.",
    description: "Gin + tonics premium + garnitures fraîches : tout pour réussir un gin tonic de qualité bar sans quitter son canapé.",
    price: 32.90,
    category: "gin",
    image: "/cat-gin.png",
    tags: ["Kit", "G&T", "Garnitures"],
    badge: "Kit G&T",
    serves: "2–4 personnes",
    contents: ["Tanqueray 70cl", "Fever-Tree Tonic x4", "Citron vert x2", "Concombre", "Grains de poivre rose", "Fiches recettes"],
  },

  // ── RHUMS ──────────────────────────────────────────────────────────────────
  {
    id: "r1",
    name: "Diplomatico Reserva 70cl",
    tagline: "Le rhum vénézuélien d'exception.",
    description: "Vieilli 12 ans en fûts de bourbon et sherry. Riche, vanillé, notes de caramel, fruits confits et chocolat noir.",
    price: 39.90,
    category: "rhum",
    image: "/cat-rhum.png",
    tags: ["Venezuela", "12 ans", "Vieux"],
    popular: true,
    contents: ["1 bouteille 70cl"],
  },
  {
    id: "r2",
    name: "Havana Club 7 ans 70cl",
    tagline: "L'âme de Cuba dans votre verre.",
    description: "Rhum cubain vieilli 7 ans. Notes de bois fumé, vanille douce et tabac. Idéal en rhum-cola ou nature sur glace.",
    price: 26.90,
    category: "rhum",
    image: "/cat-rhum.png",
    tags: ["Cuba", "7 ans", "Ambré"],
    badge: "Cuba Libre",
    contents: ["1 bouteille 70cl"],
  },
  {
    id: "r3",
    name: "Kit Mojito XL",
    tagline: "8 mojitos maison, sans effort.",
    description: "Rhum blanc, menthe fraîche, citrons verts, sucre de canne et eau gazeuse — tout y est pour des mojitos dignes d'un bar cubain.",
    price: 29.90,
    category: "rhum",
    image: "/cat-rhum.png",
    tags: ["Kit", "Mojito", "Cocktail"],
    badge: "Kit Mojito",
    serves: "4–6 personnes",
    popular: true,
    contents: ["Rhum blanc Bacardi 70cl", "Menthe fraîche", "Citrons verts x6", "Sucre de canne 250g", "Eau gazeuse 1L", "Glaçons 1kg"],
  },

  // ── VINS & CHAMPAGNES ──────────────────────────────────────────────────────
  {
    id: "c1",
    name: "Champagne Moët & Chandon 75cl",
    tagline: "Le champagne de toutes les célébrations.",
    description: "Bulles fines et persistantes, notes de pomme verte, pêche blanche et brioche grillée. La référence absolue pour fêter.",
    price: 49.90,
    category: "vin",
    image: "/cat-vin.png",
    tags: ["Champagne", "Brut", "Festif"],
    badge: "Champagne",
    popular: true,
    contents: ["1 bouteille 75cl"],
  },
  {
    id: "c2",
    name: "Coffret Vins Rouge Blanc Rosé",
    tagline: "Une sélection pour tous les goûts.",
    description: "Un Bordeaux rouge structuré, un Sancerre blanc minéral et un Provence rosé frais. Parfait pour satisfaire toute la tablée.",
    price: 38.90,
    category: "vin",
    image: "/cat-vin.png",
    tags: ["Coffret", "3 couleurs", "France"],
    badge: "Coffret",
    serves: "4–6 personnes",
    contents: ["Bordeaux rouge 75cl", "Sancerre blanc 75cl", "Provence rosé 75cl"],
  },
  {
    id: "c3",
    name: "Prosecco DOC 75cl",
    tagline: "L'apéritif pétillant à l'italienne.",
    description: "Léger, fruité, avec des notes de pomme golden, poire et fleurs blanches. Frais et festif, l'entrée en matière idéale.",
    price: 18.90,
    category: "vin",
    image: "/cat-vin.png",
    tags: ["Italie", "Pétillant", "Apéritif"],
    badge: "Pétillant",
    contents: ["1 bouteille 75cl"],
  },

  // ── COGNACS ────────────────────────────────────────────────────────────────
  {
    id: "co1",
    name: "Hennessy VS 70cl",
    tagline: "Le cognac le plus vendu au monde.",
    description: "Assemblage de 40 eaux-de-vie. Fruité, légèrement boisé avec une finale douce et chaleureuse. La référence accessible.",
    price: 36.90,
    category: "cognac",
    image: "/cat-cognac.png",
    tags: ["VS", "Charente", "Incontournable"],
    popular: true,
    contents: ["1 bouteille 70cl"],
  },
  {
    id: "co2",
    name: "Rémy Martin VSOP 70cl",
    tagline: "Fine Champagne, la quintessence du cognac.",
    description: "Vieilli 4 à 12 ans en fûts de chêne du Limousin. Rond et complexe, notes d'abricot, vanille, fleurs et épices douces.",
    price: 48.90,
    category: "cognac",
    image: "/cat-cognac.png",
    tags: ["VSOP", "Fine Champagne", "4–12 ans"],
    badge: "VSOP",
    contents: ["1 bouteille 70cl", "Fiche de dégustation"],
  },

  // ── BIERES ─────────────────────────────────────────────────────────────────
  {
    id: "b1",
    name: "Sélection Craft Française x6",
    tagline: "6 bières, 6 surprises artisanales.",
    description: "Sélection tournante de brasseries françaises indépendantes : IPA fruitée, blonde douce, ambrée maltée, stout chocolaté et plus.",
    price: 18.90,
    category: "biere",
    image: "/cat-biere.png",
    tags: ["Craft", "France", "Artisanal"],
    badge: "Artisanal",
    popular: true,
    contents: ["6 bières 33cl (sélection variable)", "Fiche descriptive des brasseries"],
  },
  {
    id: "b2",
    name: "Pack Coronita x12 + Citrons",
    tagline: "La bière apéro par excellence.",
    description: "12 Coronita bien fraîches avec leurs incontournables citrons verts. Simple, rafraîchissant, efficace.",
    price: 22.90,
    category: "biere",
    image: "/cat-biere.png",
    tags: ["Mexique", "Légère", "Apéro"],
    badge: "Best-seller",
    contents: ["12 Coronita 35,5cl", "Citrons verts x6"],
  },
  {
    id: "b3",
    name: "Coffret Bières du Monde x8",
    tagline: "Un tour du monde en 8 bouteilles.",
    description: "Irlande, Mexique, Japon, Allemagne, Belgique, USA, Tchéquie et France — 8 bières iconiques pour explorer le monde.",
    price: 26.90,
    category: "biere",
    image: "/cat-biere.png",
    tags: ["Monde", "Découverte", "Dégustation"],
    badge: "Découverte",
    serves: "4–6 personnes",
    contents: ["8 bières 33cl variées", "Guide de dégustation illustré"],
  },

  // ── LIQUEURS ───────────────────────────────────────────────────────────────
  {
    id: "l1",
    name: "Baileys Original 70cl",
    tagline: "La crème irlandaise iconique.",
    description: "Mélange onctueux de crème fraîche irlandaise et de whiskey irlandais. Chocolatée, douce et réconfortante. Nature ou sur glace.",
    price: 19.90,
    category: "liqueur",
    image: "/cat-liqueur.png",
    tags: ["Irlande", "Crème", "Whiskey"],
    popular: true,
    contents: ["1 bouteille 70cl"],
  },
  {
    id: "l2",
    name: "Cointreau 70cl",
    tagline: "Triple sec d'exception depuis 1875.",
    description: "Zestes d'oranges douces et amères macérés et distillés. Fin, élégant, indispensable dans le Margarita, le Cosmopolitan et le Sidecar.",
    price: 24.90,
    category: "liqueur",
    image: "/cat-liqueur.png",
    tags: ["Triple sec", "Orange", "Cocktail"],
    badge: "Cocktail",
    contents: ["1 bouteille 70cl"],
  },
  {
    id: "l3",
    name: "Coffret Liqueurs Découverte x3",
    tagline: "Trois liqueurs, trois univers.",
    description: "Sélection surprise : une liqueur de fruits, une crémeuse et une aromatique pour découvrir la diversité des liqueurs artisanales.",
    price: 34.90,
    category: "liqueur",
    image: "/cat-liqueur.png",
    tags: ["Coffret", "Découverte", "Artisanal"],
    badge: "Coffret",
    serves: "2–4 personnes",
    contents: ["3 mignonettes 20cl (sélection surprise)", "Fiches de dégustation", "Suggestions de cocktails"],
  },
];


export const LOYALTY_TIERS = [
  { name: "Apéritif", minPoints: 0, maxPoints: 99, color: "#a89272", perks: ["5% de réduction sur commande"] },
  { name: "Festif", minPoints: 100, maxPoints: 299, color: "#f5c518", perks: ["10% de réduction", "Livraison offerte 1x/mois"] },
  { name: "Premium", minPoints: 300, maxPoints: 599, color: "#E8580A", perks: ["15% de réduction", "Livraison toujours offerte", "Box surprise trimestrielle"] },
  { name: "VIP", minPoints: 600, maxPoints: Infinity, color: "#8B3FC9", perks: ["20% de réduction", "Livraison prioritaire", "Box VIP mensuelle", "Invitation events exclusifs"] },
];
