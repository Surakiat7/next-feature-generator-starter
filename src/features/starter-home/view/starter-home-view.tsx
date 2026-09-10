import { EnergyBackground } from "../components/energy-background";
import { Hero } from "../components/hero";

export function StarterHomeView() {
  return (
    <main className="relative grid flex-1 grid-cols-1 grid-rows-1 place-items-center overflow-hidden">
      <EnergyBackground />
      <Hero />
    </main>
  );
}
