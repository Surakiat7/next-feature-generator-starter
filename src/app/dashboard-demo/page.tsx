import { StarterDashboardView } from "@/features/starter-dashboard";

// Reflect the actual project state on every request (reads the source tree).
export const dynamic = "force-dynamic";

export default function StarterDashboardPage() {
  return <StarterDashboardView />;
}
