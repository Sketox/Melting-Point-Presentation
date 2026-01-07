'use client';

import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface HistogramProps {
  data: {
    range: string;
    count: number;
    min: number;
    max: number;
  }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass rounded-xl p-4 shadow-lg border border-claude-border">
        <p className="text-claude-orange font-semibold mb-2">{data.range} K</p>
        <p className="text-claude-text">
          <span className="text-claude-text-secondary">Count: </span>
          <span className="font-bold">{data.count}</span> molecules
        </p>
        <p className="text-claude-text-muted text-sm mt-1">
          {(data.min - 273.15).toFixed(1)}°C - {(data.max - 273.15).toFixed(1)}°C
        </p>
      </div>
    );
  }
  return null;
};

export default function Histogram({ data }: HistogramProps) {
  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass rounded-2xl p-6 border border-claude-border"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-claude-text">
            Distribution of Predicted Melting Points
          </h3>
          <p className="text-claude-text-secondary text-sm mt-1">
            Histogram showing frequency distribution of Tm predictions
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-claude-orange/10 border border-claude-orange/20">
          <div className="w-3 h-3 rounded-full bg-claude-orange" />
          <span className="text-claude-orange text-sm font-medium">Kelvin (K)</span>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#3a3a3a" 
              vertical={false}
            />
            <XAxis 
              dataKey="range" 
              tick={{ fill: '#a0a0a0', fontSize: 11 }}
              tickLine={{ stroke: '#3a3a3a' }}
              axisLine={{ stroke: '#3a3a3a' }}
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis 
              tick={{ fill: '#a0a0a0', fontSize: 12 }}
              tickLine={{ stroke: '#3a3a3a' }}
              axisLine={{ stroke: '#3a3a3a' }}
              label={{ 
                value: 'Count', 
                angle: -90, 
                position: 'insideLeft',
                fill: '#a0a0a0',
                style: { textAnchor: 'middle' }
              }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(218, 119, 86, 0.1)' }} />
            <Bar 
              dataKey="count" 
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={`rgba(218, 119, 86, ${0.4 + (entry.count / maxCount) * 0.6})`}
                  stroke="rgba(218, 119, 86, 0.8)"
                  strokeWidth={1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex justify-center gap-8 text-sm text-claude-text-secondary">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-claude-orange/40" />
          <span>Lower frequency</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-claude-orange" />
          <span>Higher frequency</span>
        </div>
      </div>
    </motion.div>
  );
}
