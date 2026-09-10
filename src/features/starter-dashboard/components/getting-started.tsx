import type { ProjectStatus } from "../lib/project-status";
import { getSteps } from "../lib/getting-started-steps";
import { GettingStartedStep } from "./getting-started-step";

export function GettingStarted({ status }: { status: ProjectStatus }) {
  const steps = getSteps(status);

  return (
    <ol className="space-y-0">
      {steps.map((step) => (
        <GettingStartedStep key={step.id} step={step} />
      ))}
    </ol>
  );
}
