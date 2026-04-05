'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface MicroChartProps {
  data: { time: string; value: number }[];
}

export default function MicroChart({ data: initialData }: MicroChartProps) {
  const [data, setData] = useState(initialData);

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => {
        const lastValue = prevData[prevData.length - 1].value;
        // Random walk: change by -2 to +2
        const change = (Math.random() - 0.5) * 4;
        const newValue = Math.max(0, Math.min(100, lastValue + change));
        
        const newPoint = {
          time: new Date().toISOString(),
          value: newValue
        };

        // Keep the last 20 points
        return [...prevData.slice(1), newPoint];
      });
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  // Determine if trend is up or down to color the line
  const startValue = data[0]?.value || 0;
  const endValue = data[data.length - 1]?.value || 0;
  const isUp = endValue >= startValue;
  
  const strokeColor = isUp ? '#10b981' : '#ef4444'; // emerald-500 or red-500

  return (
    <div className="w-full h-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={strokeColor} 
            strokeWidth={2} 
            dot={false}
            isAnimationActive={true}
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
      {/* Subtle gradient fade at the bottom of the chart */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
    </div>
  );
}
