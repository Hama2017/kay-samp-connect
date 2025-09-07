import React from 'react';

interface ChartData {
  name: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: ChartData[];
  height?: number;
}

export function SimpleBarChart({ data, height = 200 }: BarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="w-full" style={{ height }}>
      <div className="flex items-end justify-between h-full p-4 bg-muted/20 rounded-lg">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center gap-2 flex-1">
            <div 
              className="w-8 bg-primary rounded-t transition-all duration-500 ease-out"
              style={{ 
                height: `${(item.value / maxValue) * (height - 60)}px`,
                backgroundColor: item.color || 'hsl(var(--primary))'
              }}
            />
            <span className="text-xs text-muted-foreground text-center">
              {item.name}
            </span>
            <span className="text-xs font-medium">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface PieChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  size?: number;
}

export function SimplePieChart({ data, size = 200 }: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercentage = 0;

  const createArcPath = (centerX: number, centerY: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", centerX, centerY,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} className="drop-shadow-sm">
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const startAngle = cumulativePercentage * 3.6;
          const endAngle = (cumulativePercentage + percentage) * 3.6;
          
          const path = createArcPath(size / 2, size / 2, size / 2 - 20, startAngle, endAngle);
          cumulativePercentage += percentage;

          return (
            <path
              key={index}
              d={path}
              fill={item.color}
              stroke="white"
              strokeWidth="2"
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
          );
        })}
        {/* Center circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 4}
          fill="hsl(var(--background))"
          stroke="hsl(var(--border))"
          strokeWidth="2"
        />
      </svg>
      
      <div className="flex flex-wrap justify-center gap-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm">{item.name}</span>
            <span className="text-sm font-medium">({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface LineChartProps {
  data: Array<{ name: string; value: number }>;
  height?: number;
}

export function SimpleLineChart({ data, height = 200 }: LineChartProps) {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue || 1;

  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((item.value - minValue) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full" style={{ height }}>
      <div className="relative h-full p-4 bg-muted/20 rounded-lg">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Area */}
          <polygon
            points={`0,100 ${points} 100,100`}
            fill="url(#lineGradient)"
            className="transition-all duration-500"
          />
          
          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            className="transition-all duration-500"
          />
          
          {/* Points */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - ((item.value - minValue) / range) * 100;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="2"
                fill="hsl(var(--primary))"
                className="hover:r-3 transition-all cursor-pointer"
              />
            );
          })}
        </svg>
        
        {/* Labels */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 pb-2">
          {data.map((item, index) => (
            <span key={index} className="text-xs text-muted-foreground">
              {item.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}