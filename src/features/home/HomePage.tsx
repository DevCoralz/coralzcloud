import { Header } from "@/components/layout/Header";
import { HeroSection } from "./components/HeroSection";
import { HighlightsSection } from "./components/HighlightsSection";
import { ScrollCue } from "./components/ScrollCue";

export function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <Header />
      <HeroSection />
      <HighlightsSection />
      <ScrollCue />
    </main>
  );
}
