import { EnergyBackground } from "../components/energy-background";
import { GeneratorSimulator } from "../components/generator-simulator";
import { Hero } from "../components/hero";
import { HeroSection } from "../components/hero-section";

export function StarterHomeView() {
  return (
    <main className="relative grid flex-1 grid-cols-1 grid-rows-1 place-items-center overflow-hidden">
      <EnergyBackground />
      <Hero />
      {/* <div className="relative border-t border-zinc-200 bg-zinc-100/80 dark:border-zinc-800 dark:bg-zinc-900/50 lg:border-t-0 lg:border-l">
        <GeneratorSimulator />
      </div> */}
    </main>
  );
}
