'use client';

import { motion } from 'framer-motion';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface Prediction {
  id: number;
  smiles: string;
  Tm_pred: number;
}

interface ScatterPlotProps {
  predictions: Prediction[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass rounded-xl p-4 shadow-lg border border-claude-border">
        <p className="text-claude-orange font-semibold mb-1">ID: {data.id}</p>
        <p className="text-claude-text text-sm mb-1">
          <span className="text-claude-text-secondary">Tm: </span>
          <span className="font-bold">{data.Tm_pred.toFixed(2)} K</span>
        </p>
        <p className="text-claude-text-muted text-xs">
          Atoms: ~{data.atomCount}
        </p>
      </div>
    );
  }
  return null;
};

export default function ScatterPlot({ predictions }: ScatterPlotProps) {
  // Calculate approximate atom count from SMILES
  const dataWithFeatures = predictions.map(p => {
    const atomPattern = /[A-Z][a-z]?/g;
    const atoms = p.smiles.match(atomPattern) || [];
    return {
      ...p,
      atomCount: atoms.length,
      smilesLength: p.smiles.length,
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass rounded-2xl p-6 border border-claude-border"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-claude-text flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-claude-orange" />
            Molecular Complexity vs Melting Point
          </h3>
          <p className="text-claude-text-secondary text-sm mt-1">
            Scatter plot showing relationship between SMILES length and predicted Tm
          </p>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
            <XAxis
              dataKey="smilesLength"
              type="number"
              name="SMILES Length"
              tick={{ fill: '#a0a0a0', fontSize: 12 }}
              tickLine={{ stroke: '#3a3a3a' }}
              axisLine={{ stroke: '#3a3a3a' }}
              label={{
                value: 'SMILES Length (chars)',
                position: 'bottom',
                fill: '#a0a0a0',
                offset: 0,
              }}
            />
            <YAxis
              dataKey="Tm_pred"
              type="number"
              name="Tm"
              tick={{ fill: '#a0a0a0', fontSize: 12 }}
              tickLine={{ stroke: '#3a3a3a' }}
              axisLine={{ stroke: '#3a3a3a' }}
              label={{
                value: 'Tm (K)',
                angle: -90,
                position: 'insideLeft',
                fill: '#a0a0a0',
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine
              y={275.89}
              stroke="#da7756"
              strokeDasharray="5 5"
              label={{
                value: 'Mean',
                position: 'right',
                fill: '#da7756',
                fontSize: 12,
              }}
            />
            <Scatter
              data={dataWithFeatures}
              fill="rgba(218, 119, 86, 0.6)"
              stroke="rgba(218, 119, 86, 0.9)"
              strokeWidth={1}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-claude-orange/60 border border-claude-orange" />
          <span className="text-claude-text-secondary">Predictions</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-0.5 bg-claude-orange" style={{ borderStyle: 'dashed' }} />
          <span className="text-claude-text-secondary">Mean Tm (275.89 K)</span>
        </div>
      </div>
    </motion.div>
  );
}
