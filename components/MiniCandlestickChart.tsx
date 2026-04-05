import { OHLCData } from '@/lib/data';
import { useMemo } from 'react';

interface MiniCandlestickChartProps {
  data: OHLCData[];
}

export default function MiniCandlestickChart({ data }: MiniCandlestickChartProps) {
  const { min, max } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    data.forEach(d => {
      if (d.low < min) min = d.low;
      if (d.high > max) max = d.high;
    });
    return { min, max };
  }, [data]);

  const range = max - min || 1;
  const padding = range * 0.1;
  const chartMin = min - padding;
  const chartMax = max + padding;
  const chartRange = chartMax - chartMin;

  const round = (val: number) => Math.round(val * 1000) / 1000;

  return (
    <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible" preserveAspectRatio="none">
      {data.map((d, i) => {
        const x = round((i / (data.length - 1)) * 100);
        const width = round(100 / data.length * 0.6); // 60% of available width
        
        const openY = round(40 - ((d.open - chartMin) / chartRange) * 40);
        const closeY = round(40 - ((d.close - chartMin) / chartRange) * 40);
        const highY = round(40 - ((d.high - chartMin) / chartRange) * 40);
        const lowY = round(40 - ((d.low - chartMin) / chartRange) * 40);

        const isUp = d.close >= d.open;
        const color = isUp ? 'var(--color-trade-up)' : 'var(--color-trade-down)';
        
        const bodyTop = round(Math.min(openY, closeY));
        const bodyHeight = round(Math.max(Math.abs(openY - closeY), 0.5)); // Minimum 0.5px height

        return (
          <g key={i}>
            {/* Wick */}
            <line
              x1={x}
              y1={highY}
              x2={x}
              y2={lowY}
              stroke={color}
              strokeWidth="0.5"
              opacity="0.5"
            />
            {/* Body */}
            <rect
              x={round(x - width / 2)}
              y={bodyTop}
              width={width}
              height={bodyHeight}
              fill={color}
              rx="0.5"
            />
          </g>
        );
      })}
    </svg>
  );
}
