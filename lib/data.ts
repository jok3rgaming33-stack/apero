export type Category = "classique" | "festif" | "gourmand" | "healthy";

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
  serves: string;
  badge?: string;
  popular?: boolean;
  contents: string[];
}

export const CATEGORIES: { id: Category; label: string; color: string; icon: string; description: string }[] = [
  {
    id: "classique",
    label: "Classique",
    color: "#E8580A",
    icon: "🍷",
    description: "Les essentiels pour un apéro entre potes",
  },
  {
    id: "festif",
    label: "Festif",
    color: "#8B3FC9",
    icon: "🍹",
    description: "Cocktails, chips & bonne humeur",
  },
  {
    id: "gourmand",
    label: "Gourmand",
    color: "#2D9A3E",
    icon: "🧀",
    description: "Fromages, tapas & découvertes",
  },
  {
    id: "healthy",
    label: "Léger & Healthy",
    color: "#1A7CC5",
    icon: "🥗",
    description: "Apéro sain, plaisir intact",
  },
];

export const PRODUCTS: Product[] = [
  {
    id: "box-classique-s",
    name: "Box Classique Solo",
    tagline: "L'essentiel, rien de plus.",
    description:
      "La box parfaite pour une soirée en solo ou en duo. Charcuterie sélectionnée, fromages affinés, pain grillé et accompagnements.",
    price: 24.9,
    category: "classique",
    image: "/box-classique.png",
    tags: ["Charcuterie", "Fromage", "Pain"],
    serves: "1–2 personnes",
    contents: ["Jambon sec 80g", "Saucisson 60g", "Comté affiné 60g", "Brie 50g", "Crackers artisans", "Olives 40g", "Moutarde ancienne"],
  },
  {
    id: "box-classique-l",
    name: "Box Classique Groupe",
    tagline: "Pour partager sans compter.",
    description:
      "Version XL de notre classique pour 4 à 6 personnes. Idéale pour les soirées spontanées.",
    price: 54.9,
    originalPrice: 62.0,
    category: "classique",
    image: "/box-classique.png",
    tags: ["Charcuterie", "Fromage", "Pain", "Vin"],
    serves: "4–6 personnes",
    popular: true,
    badge: "Best-seller",
    contents: ["Jambon sec 200g", "Chorizo 100g", "Saucisson 150g", "Plateau 4 fromages", "Baguette artisane", "Olives & cornichons", "Rillettes canard 80g", "2 bouteilles de vin rouge"],
  },
  {
    id: "box-festif-m",
    name: "Box Fiesta",
    tagline: "La fête commence ici.",
    description:
      "Cocktails pré-mixés, chips premium, dips et snacks festifs. Pour une ambiance garantie.",
    price: 34.9,
    category: "festif",
    image: "/box-festif.png",
    tags: ["Cocktails", "Chips", "Dips"],
    serves: "2–4 personnes",
    badge: "Nouveau",
    contents: ["2 cocktails pré-mixés 25cl", "Chips artisanales 3 saveurs", "Guacamole maison 120g", "Salsa tomate 100g", "Nachos 150g", "Popcorn sucré-salé 80g"],
  },
  {
    id: "box-festif-xl",
    name: "Box Fiesta XL",
    tagline: "Quand l'apéro dure toute la nuit.",
    description:
      "La box festive version XXL pour une soirée qui commence fort et finit tard.",
    price: 64.9,
    originalPrice: 75.0,
    category: "festif",
    image: "/box-festif.png",
    tags: ["Cocktails", "Chips", "Dips", "Shooters"],
    serves: "6–8 personnes",
    popular: true,
    badge: "Populaire",
    contents: ["4 cocktails pré-mixés 25cl", "6 mini-shooters", "3 saveurs chips premium", "Guacamole & salsa maison", "Nachos 300g", "Mini-burgers 8 pièces", "Plateau charcuterie festif"],
  },
  {
    id: "box-gourmand-m",
    name: "Box Épicurienne",
    tagline: "Pour les vrais gourmets.",
    description:
      "Un voyage gastronomique en format apéro. Fromages affinés, tapas espagnols et accompagnements d'exception.",
    price: 42.9,
    category: "gourmand",
    image: "/box-gourmand.png",
    tags: ["Fromages", "Tapas", "Découverte"],
    serves: "2–4 personnes",
    contents: ["Plateau 5 fromages artisans", "Jambon Ibérique 60g", "Chorizo ibérique 50g", "Figues au sirop", "Miel de fleurs 30g", "Crackers graines", "Noix du Périgord"],
  },
  {
    id: "box-gourmand-premium",
    name: "Box Grand Épicurien",
    tagline: "L'apéro comme au restaurant.",
    description:
      "Notre sélection haut de gamme pour impressionner vos invités. Produits d'exception, présentation soignée.",
    price: 79.9,
    originalPrice: 95.0,
    category: "gourmand",
    image: "/box-gourmand.png",
    tags: ["Premium", "Fromages", "Foie Gras"],
    serves: "4–6 personnes",
    popular: true,
    badge: "Premium",
    contents: ["7 fromages affinés sélection Maître Affineur", "Foie gras mi-cuit 80g", "Jambon Ibérique Bellota 100g", "Chutney figue & noix", "Pain brioché grillé", "Champagne 37.5cl", "Tuiles au parmesan"],
  },
  {
    id: "box-healthy-m",
    name: "Box Green Apéro",
    tagline: "Plaisir sans culpabilité.",
    description:
      "Un apéro léger et coloré, tout en saveurs. Crudités, houmous, tzatziki et bouchées healthy.",
    price: 22.9,
    category: "healthy",
    image: "/box-healthy.png",
    tags: ["Crudités", "Houmous", "Vegan"],
    serves: "2–3 personnes",
    badge: "Vegan",
    contents: ["Crudités colorées 300g", "Houmous maison 120g", "Tzatziki 100g", "Guacamole 80g", "Crackers sans gluten", "Noix mélangées 60g", "Eau pétillante aromatisée 2x33cl"],
  },
  {
    id: "box-healthy-l",
    name: "Box Wellness Party",
    tagline: "On peut fêter ça sainement.",
    description:
      "La grande version healthy pour les soirées où l'on veut se faire plaisir sans compromis.",
    price: 44.9,
    category: "healthy",
    image: "/box-healthy.png",
    tags: ["Crudités", "Dips", "Sans alcool"],
    serves: "4–6 personnes",
    contents: ["Plateau crudités XXL 600g", "4 dips variés maison", "Wraps légumes 4 pièces", "Buddha bowl snacks", "Chips de légumes 80g", "Boissons sans alcool 4x33cl", "Fruits frais de saison 200g"],
  },
];


export const LOYALTY_TIERS = [
  { name: "Apéritif", minPoints: 0, maxPoints: 99, color: "#a89272", perks: ["5% de réduction sur commande"] },
  { name: "Festif", minPoints: 100, maxPoints: 299, color: "#f5c518", perks: ["10% de réduction", "Livraison offerte 1x/mois"] },
  { name: "Premium", minPoints: 300, maxPoints: 599, color: "#E8580A", perks: ["15% de réduction", "Livraison toujours offerte", "Box surprise trimestrielle"] },
  { name: "VIP", minPoints: 600, maxPoints: Infinity, color: "#8B3FC9", perks: ["20% de réduction", "Livraison prioritaire", "Box VIP mensuelle", "Invitation events exclusifs"] },
];
