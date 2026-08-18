import { performanceChart } from "@/data/mock-tracking";

const MAX = 50;
const Y_TICKS = [50, 40, 30, 20, 10, 0];

export function LineChart() {
  const lastIndex = performanceChart.length - 1;
  const points = performanceChart.map((item, index) => {
    const x = lastIndex === 0 ? 0 : (index / lastIndex) * 100;
    const y = 100 - (item.value / MAX) * 100;
    return { ...item, x, y };
  });

  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <div className="w-full min-w-0">
      <div className="flex w-full gap-3">
        <div
          className="flex h-[220px] w-8 shrink-0 flex-col justify-between py-0.5 text-right text-[10px] leading-none text-zinc-400 md:h-[260px]"
          aria-hidden="true"
        >
          {Y_TICKS.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>

        <div className="relative h-[220px] min-w-0 flex-1 md:h-[260px]">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
            role="img"
            aria-label="Gráfico de pedidos"
          >
            {Y_TICKS.map((tick) => {
              const y = 100 - (tick / MAX) * 100;
              return (
                <line
                  key={tick}
                  x1="0"
                  x2="100"
                  y1={y}
                  y2={y}
                  stroke="#f1f1f1"
                  strokeWidth="0.4"
                  vectorEffect="non-scaling-stroke"
                />
              );
            })}
            <path
              d={path}
              fill="none"
              stroke="#ff5c00"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          {points.map((point) => (
            <span
              key={point.label}
              className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand"
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
            />
          ))}
        </div>
      </div>

      <div className="mt-3 flex w-full pl-11">
        {points.map((point) => (
          <span
            key={point.label}
            className="flex-1 text-center text-[10px] text-zinc-400 first:text-left last:text-right"
          >
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
}
