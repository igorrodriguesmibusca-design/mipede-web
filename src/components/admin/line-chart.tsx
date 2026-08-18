import { performanceChart } from "@/data/mock-tracking";

export function LineChart() {
  const width = 640;
  const height = 220;
  const padding = 36;
  const max = 50;
  const points = performanceChart.map((item, index) => {
    const x =
      padding +
      (index * (width - padding * 2)) / (performanceChart.length - 1);
    const y = height - padding - (item.value / max) * (height - padding * 2);
    return { ...item, x, y };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full" role="img" aria-label="Gráfico de pedidos">
      {[0, 10, 20, 30, 40, 50].map((tick) => {
        const y = height - padding - (tick / max) * (height - padding * 2);
        return (
          <g key={tick}>
            <line x1={padding} x2={width - 8} y1={y} y2={y} stroke="#f1f1f1" />
            <text x={4} y={y + 4} fontSize="10" fill="#9ca3af">
              {tick}
            </text>
          </g>
        );
      })}
      <path d={path} fill="none" stroke="#ff5c00" strokeWidth="2.5" />
      {points.map((point) => (
        <g key={point.label}>
          <circle cx={point.x} cy={point.y} r="4" fill="#ff5c00" />
          <text x={point.x} y={height - 10} textAnchor="middle" fontSize="10" fill="#9ca3af">
            {point.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
