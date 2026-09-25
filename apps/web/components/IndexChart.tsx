'use client';

import React, { useState } from 'react';
import { DataPoint } from '../lib/housing/types';

interface IndexChartProps {
  series: DataPoint[];
  unit: string;
  baselinePeriod: string;
  baselineValue: number;
  targetPeriod?: string;
}

export function IndexChart({ series, unit, baselinePeriod, baselineValue, targetPeriod }: IndexChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);

  if (!series || series.length === 0) {
    return (
      <div className="p-8 text-center text-xs font-mono text-[#8A918E] bg-[#121514] border border-[#222725] rounded-lg">
        Data temporarily unavailable from sovereign registry
      </div>
    );
  }

  // Chart dimensions
  const width = 800;
  const height = 300;
  const paddingLeft = 65;
  const paddingRight = 45;
  const paddingTop = 30;
  const paddingBottom = 45;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Min and max calculation
  const values = series.map((d) => d.value);
  const rawMin = Math.min(...values, baselineValue);
  const rawMax = Math.max(...values, baselineValue);
  const range = rawMax - rawMin || 1;
  const yMin = rawMin - range * 0.1;
  const yMax = rawMax + range * 0.1;

  // Scales
  const getX = (index: number) => paddingLeft + (index / (series.length - 1)) * chartWidth;
  const getY = (val: number) => paddingTop + chartHeight - ((val - yMin) / (yMax - yMin)) * chartHeight;

  // Polyline points
  const points = series.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');
  const areaPoints = `${getX(0)},${paddingTop + chartHeight} ${points} ${getX(series.length - 1)},${
    paddingTop + chartHeight
  }`;

  // Baseline Y position
  const baselineY = getY(baselineValue);

  // Y-axis grid ticks (4 ticks)
  const yTicks = [0, 0.33, 0.66, 1].map((pct) => {
    const val = yMin + pct * (yMax - yMin);
    return {
      y: paddingTop + chartHeight - pct * chartHeight,
      value: val >= 10000 ? `${(val / 1000).toFixed(0)}k` : val.toFixed(1),
    };
  });

  return (
    <div className="w-full bg-[#121514] border border-[#222725] rounded-lg p-4 sm:p-6 font-mono">
      {/* Chart Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#222725] gap-3 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-[#F4F4F0] uppercase tracking-wider">
              UNDERLYING HOUSING INDEX
            </span>
            <span className="text-[10px] text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.2 rounded border border-[#10B981]/20">
              OFFICIAL BUREAU SERIES
            </span>
          </div>
          <span className="text-[11px] text-[#8A918E] block mt-0.5">
            Unit: {unit} • Real Historical Observations
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-0.5 bg-[#10B981]" />
            <span className="text-[11px] text-[#8A918E]">Official Observations</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-0.5 bg-amber-400 border-t border-dashed" />
            <span className="text-[11px] text-amber-400">Baseline ({baselinePeriod})</span>
          </div>
          {targetPeriod && (
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full border border-dashed border-[#10B981]" />
              <span className="text-[11px] text-[#10B981]">Target ({targetPeriod})</span>
            </div>
          )}
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative w-full aspect-[8/3] min-h-[220px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="indexChartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines & Y-axis labels */}
          {yTicks.map((tick, idx) => (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={tick.y}
                x2={width - paddingRight}
                y2={tick.y}
                stroke="#1E2321"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text
                x={paddingLeft - 10}
                y={tick.y + 3}
                fill="#565E5A"
                fontSize="10"
                textAnchor="end"
              >
                {tick.value}
              </text>
            </g>
          ))}

          {/* Baseline reference line */}
          <line
            x1={paddingLeft}
            y1={baselineY}
            x2={width - paddingRight}
            y2={baselineY}
            stroke="#F59E0B"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.8"
          />

          {/* Area gradient under line */}
          <polygon points={areaPoints} fill="url(#indexChartGradient)" />

          {/* Main Historical Line */}
          <polyline
            fill="none"
            stroke="#10B981"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />

          {/* Data Points */}
          {series.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.value);
            const isBaseline = d.period === baselinePeriod;
            return (
              <g key={d.period} className="cursor-pointer">
                <circle
                  cx={cx}
                  cy={cy}
                  r={isBaseline ? 5 : 3.5}
                  fill={isBaseline ? '#F59E0B' : '#121514'}
                  stroke={isBaseline ? '#F59E0B' : '#10B981'}
                  strokeWidth="2"
                  onMouseEnter={() => setHoveredPoint(d)}
                  className="transition-transform hover:scale-150"
                />
              </g>
            );
          })}

          {/* X-axis labels */}
          {series.map((d, i) => {
            const isFirst = i === 0;
            const isLast = i === series.length - 1;
            const isMid = i === Math.floor(series.length / 2);
            const isBaseline = d.period === baselinePeriod;

            if (!isFirst && !isLast && !isMid && !isBaseline) return null;

            return (
              <text
                key={d.period}
                x={getX(i)}
                y={height - 12}
                fill={d.period === baselinePeriod ? '#F59E0B' : '#8A918E'}
                fontSize="10"
                textAnchor="middle"
                fontWeight={d.period === baselinePeriod ? 'bold' : 'normal'}
              >
                {d.period}
              </text>
            );
          })}
        </svg>

        {/* Hover / Tooltip Detail */}
        {hoveredPoint && (
          <div className="absolute top-2 right-2 bg-[#1B201E] border border-[#2B322F] rounded p-2.5 text-xs shadow-xl animate-in fade-in duration-100">
            <div className="text-[10px] text-[#565E5A]">Period: {hoveredPoint.period}</div>
            <div className="text-[#F4F4F0] font-semibold mt-0.5">
              Official Observation: <span className="text-[#10B981] font-tabular">{hoveredPoint.formatted}</span>
            </div>
            {hoveredPoint.period === baselinePeriod && (
              <div className="text-[10px] text-amber-400 mt-1 font-medium">★ Contract Baseline Level</div>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[#1D2220] flex flex-wrap items-center justify-between text-[11px] text-[#565E5A]">
        <div>Data Authority: Sovereign National Statistical Agency</div>
        <div>Verified Time Series Observations: {series.length}</div>
      </div>
    </div>
  );
}
