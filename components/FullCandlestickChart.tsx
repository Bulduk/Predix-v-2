import { OHLCData } from '@/lib/data';
import { useMemo, useState } from 'react';

interface FullCandlestickChartProps {
  data: OHLCData[];
}

export default function FullCandlestickChart({ data }: FullCandlestickChartProps) {
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '1h' | '1d'>('1h');

  const { min, max, maxVolume } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    let maxVolume = 0;
    data.forEach(d => {
      if (d.low < min) min = d.low;
      if (d.high > max) max = d.high;
      if (d.volume > maxVolume) maxVolume = d.volume;
    });
    return { min, max, maxVolume };
  }, [data]);

  const range = max - min || 1;
  const padding = range * 0.1;
  const chartMin = min - padding;
  const chartMax = max + padding;
  const chartRange = chartMax - chartMin;

  return (
    <div className="w-full h-full flex flex-col">
      {/* Timeframe Selector */}
      <div className="flex gap-2 mb-2">
        {['1m', '5m', '1h', '1d'].map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf as any)}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${
              timeframe === tf
                ? 'bg-theme-primary text-white'
                : 'bg-bg-surface text-text-secondary hover:text-text-primary'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Chart Area */}
      <div className="flex-1 relative border border-border-color rounded-xl bg-bg-surface overflow-hidden">
        {/* Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="w-full h-px bg-text-primary" />
          ))}
        </div>

        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible" preserveAspectRatio="none">
          {/* Volume Bars (Background) */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const width = 100 / data.length * 0.8;
            const volumeHeight = (d.volume / maxVolume) * 20; // Max 20% height
            const isUp = d.close >= d.open;
            const color = isUp ? 'var(--color-trade-up)' : 'var(--color-trade-down)';

            return (
              <rect
                key={`vol-${i}`}
                x={x - width / 2}
                y={100 - volumeHeight}
                width={width}
                height={volumeHeight}
                fill={color}
                opacity="0.2"
              />
            );
          })}

          {/* Candlesticks */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const width = 100 / data.length * 0.6;
            
            // Map prices to 0-80 range (leaving bottom 20 for volume)
            const mapY = (val: number) => 80 - ((val - chartMin) / chartRange) * 80;
            
            const openY = mapY(d.open);
            const closeY = mapY(d.close);
            const highY = mapY(d.high);
            const lowY = mapY(d.low);

            const isUp = d.close >= d.open;
            const color = isUp ? 'var(--color-trade-up)' : 'var(--color-trade-down)';
            
            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.max(Math.abs(openY - closeY), 0.5);

            return (
              <g key={`candle-${i}`}>
                {/* Wick */}
                <line
                  x1={x}
                  y1={highY}
                  x2={x}
                  y2={lowY}
                  stroke={color}
                  strokeWidth="0.5"
                />
                {/* Body */}
                <rect
                  x={x - width / 2}
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

        {/* Current Price Label */}
        <div className="absolute right-0 top-[20%] pr-2 pointer-events-none">
          <span className="bg-theme-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
            {(data[data.length - 1].close).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
