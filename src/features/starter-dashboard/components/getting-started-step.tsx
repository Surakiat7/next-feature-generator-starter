import type { OnboardingStep, StepStatus } from "../lib/getting-started-steps";
import { CommandBlock } from "./command-block";

const STATUS_TONE: Record<StepStatus["tone"], string> = {
  ready: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  recommended: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  completed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  optional: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  "not-configured": "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
};

export function GettingStartedStep({ step }: { step: OnboardingStep }) {
  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {/* Number + connector */}
      <div className="flex flex-col items-center">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-white font-mono text-[11px] font-semibold text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          {step.number}
        </div>
        <div className="mt-1 w-px flex-1 bg-zinc-200 last:hidden dark:bg-zinc-800" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {step.title}
          </h3>
          {step.status && (
            <span
              className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${STATUS_TONE[step.status.tone]}`}
            >
              {step.status.text}
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-zinc-500">{step.description}</p>

        {step.commands?.map((command) => (
          <div key={command} className="mt-2">
            <CommandBlock command={command} />
          </div>
        ))}

        {step.urls && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {step.urls.map((u) => (
              <a
                key={u.href}
                href={u.href}
                target="_blank"
                rel="noreferrer"
                className="break-all rounded-md border border-zinc-200 bg-white px-2 py-1 font-mono text-[11px] text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {u.href}
              </a>
            ))}
          </div>
        )}

        {step.items && (
          <div className="mt-3 space-y-2">
            {step.items.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-900/40"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {item.name}
                  </span>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${STATUS_TONE[item.status.tone]}`}
                  >
                    {item.status.text}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-500">{item.description}</p>
                <div className="mt-2">
                  <CommandBlock command={item.command} />
                </div>
              </div>
            ))}
          </div>
        )}


      </div>
    </li>
  );
}
