import { Info } from "lucide-react";

import type { FunnelStep } from "@/data/mock-analytics";
import { formatPercent, formatVariation } from "@/lib/utils";

type ComputedStep = FunnelStep & {
  accumulated: number;
  stepConversion: number | null;
  lost: number;
  abandon: number | null;
};

function compute(steps: FunnelStep[]): ComputedStep[] {
  const visits = steps[0]?.sessions ?? 0;
  return steps.map((step, index) => {
    const previous = index === 0 ? null : steps[index - 1].sessions;
    const lost = previous === null ? 0 : previous - step.sessions;
    return {
      ...step,
      accumulated: visits === 0 ? 0 : (step.sessions / visits) * 100,
      stepConversion: previous === null || previous === 0 ? null : (step.sessions / previous) * 100,
      lost,
      abandon: previous === null || previous === 0 ? null : (lost / previous) * 100,
    };
  });
}

export function ConversionFunnel({ steps }: { steps: FunnelStep[] }) {
  const computed = compute(steps);
  const visits = computed[0]?.sessions ?? 0;
  const completed = computed[computed.length - 1]?.sessions ?? 0;
  const general = visits === 0 ? 0 : (completed / visits) * 100;
  const drop = computed.slice(1).reduce((worst, step) => (step.lost > worst.lost ? step : worst), computed[1]);

  return (
    <section className="rounded-2xl border border-zinc-100 bg-white p-5">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Funil de conversão do cardápio</h2>
          <p className="text-sm text-subtle">
            Sessões únicas que avançam na ordem. Conversão geral:{" "}
            <span className="font-semibold text-ink">{formatPercent(general)}</span>
          </p>
        </div>
        <p
          className="max-w-sm rounded-xl bg-orange-50 px-3 py-2 text-xs text-orange-800"
          title="Principal ponto de abandono = maior volume de sessões perdidas entre duas etapas consecutivas."
        >
          A maior perda acontece entre a visualização do produto e a adição à sacola.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-5">
        {computed.map((step, index) => {
          const width = 100 - index * 10;
          const isDrop = drop && step.id === drop.id;
          return (
            <article
              key={step.id}
              className="rounded-2xl border border-zinc-100 bg-zinc-50 p-3"
              title={[
                `${step.name}`,
                `Acumulado: sessões da etapa ÷ visitas × 100`,
                `Entre etapas: etapa atual ÷ etapa anterior × 100`,
                `Abandono: (anterior - atual) ÷ anterior × 100`,
                `Variação: (atual - período anterior) ÷ período anterior × 100`,
              ].join(" · ")}
            >
              <div className="mb-3 flex h-24 items-end justify-center">
                <div
                  className={isDrop ? "rounded-lg bg-red-400" : "rounded-lg bg-brand"}
                  style={{ width: `${width}%`, height: `${Math.max(28, step.accumulated)}%` }}
                />
              </div>
              <p className="text-xs font-medium text-subtle">{index + 1}. {step.name}</p>
              <p className="mt-1 text-xl font-semibold">{step.sessions.toLocaleString("pt-BR")}</p>
              <p className="text-xs text-subtle">
                {formatPercent(step.accumulated)} das visitas
              </p>
              {step.stepConversion !== null ? (
                <p className="mt-1 text-xs text-success">
                  {formatPercent(step.stepConversion)} da etapa anterior
                </p>
              ) : (
                <p className="mt-1 text-xs text-subtle">Base do funil</p>
              )}
              {step.abandon !== null ? (
                <p className={`text-xs ${isDrop ? "font-semibold text-red-500" : "text-red-500"}`}>
                  −{step.lost.toLocaleString("pt-BR")} · {formatPercent(step.abandon)} abandono
                </p>
              ) : null}
              <p className="mt-1 text-[11px] text-zinc-400">
                vs período anterior: {formatVariation(step.sessions, step.previousSessions)}
              </p>
            </article>
          );
        })}
      </div>

      {drop ? (
        <p className="mt-4 flex items-start gap-2 text-xs text-subtle">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          Principal ponto de abandono: {drop.lost.toLocaleString("pt-BR")} sessões perdidas em “{drop.name}”.
        </p>
      ) : null}
    </section>
  );
}
