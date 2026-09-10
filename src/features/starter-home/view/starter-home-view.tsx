import { EnergyBackground } from "../components/energy-background";
import { Hero } from "../components/hero";

export function StarterHomeView() {
  return (
    <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden">
      <EnergyBackground />
      <Hero />
    </main>
  );
}
