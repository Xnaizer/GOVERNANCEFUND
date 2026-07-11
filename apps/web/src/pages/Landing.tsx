import { SmoothScroll } from "../providers/SmoothScroll";
import { LandingNav } from "../components/landing/LandingNav";
import { LandingHero } from "../components/landing/LandingHero";
import { TechMarquee } from "../components/landing/TechMarquee";
import { HeroShowcase } from "../components/landing/HeroShowcase";
import { FeatureShowcase } from "../components/landing/FeatureShowcase";
import { StickyInfo } from "../components/landing/StickyInfo";
import { ProgramFlow } from "../components/landing/ProgramFlow";
import { HoverFeature } from "../components/landing/HoverFeature";
import { StatsCards } from "../components/landing/StatsCards";
import { LandingFooter } from "../components/landing/LandingFooter";

export function Landing() {
  return (
    <SmoothScroll>
      <div className="bg-background">
        <LandingNav />
        <main>
          <LandingHero />
          <TechMarquee />
          <HeroShowcase />
          <FeatureShowcase />
          <StickyInfo />
          <ProgramFlow />
          <HoverFeature />
          <StatsCards />
          <LandingFooter />
        </main>
      </div>
    </SmoothScroll>
  );
}
