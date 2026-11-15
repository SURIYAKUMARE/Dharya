import React, { useState } from 'react';
import { WeeklyProblemData } from '../../services/dashboardApiService';
import { TrendingUp, Calendar, ChevronDown } from 'lucide-react';

interface WeeklyProblemChartProps {
  data: WeeklyProblemData[];
}

export const WeeklyProblemChart: React.FC<WeeklyProblemChartProps> = ({ data }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [filterPeriod, setFilterPeriod] = useState<'Weekly' | 'Monthly'>('Weekly');

  const maxVal = Math.max(...data.map((d) => d.solved), 20);
  const chartHeight = 160;
  const chartWidth = 520;
  const paddingX = 30;
  const paddingY = 20;

  // Calculate coordinates for SVG curve
  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * (chartWidth - 2 * paddingX);
    const y = chartHeight - paddingY - (d.solved / maxVal) * (chartHeight - 2 * paddingY);
    return { x, y, data: d };
  });

  // Construct smooth SVG path (catmull-rom or bezier)
  const pathD = points.reduce((acc, curr, i, arr) => {
    if (i === 0) return `M ${curr.x} ${curr.y}`;
    const prev = arr[i - 1];
    const cpX = (prev.x + curr.x) / 2;
    return `${acc} C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
  }, '');

  // Fill gradient path under curve
  const fillD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F1F5F9] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0875E1] flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#172B4D]">
              Weekly Problem Solving Activity
            </h3>
            <p className="text-[11px] text-[#64748B]">Saturday to Friday timeline &amp; submissions</p>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="inline-flex p-1 bg-[#F4F9FC] rounded-xl border border-[#E2E8F0] self-start sm:self-auto">
          <button
            onClick={() => setFilterPeriod('Weekly')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterPeriod === 'Weekly'
                ? 'bg-white text-[#0875E1] shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setFilterPeriod('Monthly')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterPeriod === 'Monthly'
                ? 'bg-white text-[#0875E1] shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* SVG Interactive Line Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-44 sm:h-52 overflow-visible"
        >
          <defs>
            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0875E1" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#0875E1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Gridlines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = chartHeight - paddingY - pct * (chartHeight - 2 * paddingY);
            return (
              <line
                key={idx}
                x1={paddingX}
                y1={y}
                x2={chartWidth - paddingX}
                y2={y}
                stroke="#F1F5F9"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Area Fill */}
          <path d={fillD} fill="url(#blueGradient)" />

          {/* Primary Curve */}
          <path
            d={pathD}
            fill="none"
            stroke="#0875E1"
            strokeWidth="3.5"
            strokeLinecap="round"
            className="transition-all duration-300"
          />

          {/* Points & Interactive Tooltip triggers */}
          {points.map((pt, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <g key={i}>
                {/* Glow ring on hover */}
                {isHovered && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="12"
                    fill="#0875E1"
                    fillOpacity="0.15"
                    className="animate-pulse"
                  />
                )}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? '6' : '4.5'}
                  fill="#FFFFFF"
                  stroke="#0875E1"
                  strokeWidth={isHovered ? '3.5' : '2.5'}
                  className="cursor-pointer transition-all duration-150"
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredIdx !== null && points[hoveredIdx] && (
          <div
            className="absolute bg-[#172B4D] text-white px-2.5 py-1.5 rounded-xl text-[11px] shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full z-10 font-mono transition-all duration-150"
            style={{
              left: `${(points[hoveredIdx].x / chartWidth) * 100}%`,
              top: `${(points[hoveredIdx].y / chartHeight) * 100 - 10}%`
            }}
          >
            <div className="font-bold text-blue-300">
              {points[hoveredIdx].data.day}: {points[hoveredIdx].data.solved} Solved
            </div>
            <div className="text-[10px] text-slate-300">
              {points[hoveredIdx].data.submissions} submissions
            </div>
          </div>
        )}
      </div>

      {/* Days Axis */}
      <div className="flex items-center justify-between px-4 text-xs font-semibold text-[#64748B]">
        {data.map((d, i) => (
          <span
            key={i}
            className={`font-mono transition-colors ${
              hoveredIdx === i ? 'text-[#0875E1] font-bold scale-110' : ''
            }`}
          >
            {d.day}
          </span>
        ))}
      </div>
    </div>
  );
};
