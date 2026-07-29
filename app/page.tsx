import Hero from "@/components/hero";
import CategoriesSection from "@/components/categories-section";
import HowItWorks from "@/components/how-it-works";
import ValuesSection from "@/components/values-section";

export default function Home() {
  return (
    <main>
      <Hero />
      <CategoriesSection />
      <HowItWorks />
      <ValuesSection />
    </main>
  );
}
