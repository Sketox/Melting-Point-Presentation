'use client';

import { useState, useEffect } from 'react';
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
  ScatterChart,
  Scatter,
  ReferenceLine,
  AreaChart,
  Area,
  PieChart,
  Pie,
} from 'recharts';
import { 
  Loader2, 
  WifiOff, 
  RefreshCw,
  BarChart3,
  TrendingUp,
  Thermometer,
  Hash,
  Sigma,
  TrendingDown,
  Activity,
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  predictAll, 
  checkHealth,
  Prediction,
  Statistics,
  HistogramBin,
  calculateStats,
  createHistogramData,
  kelvinToCelsius
} from '@/lib/api';

// Custom Tooltip for Histogram
const HistogramTooltip = ({ active, payload }: any) => {
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
          {kelvinToCelsius(data.min).toFixed(1)}°C - {kelvinToCelsius(data.max).toFixed(1)}°C
        </p>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Scatter
const ScatterTooltip = ({ active, payload }: any) => {
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
          {kelvinToCelsius(data.Tm_pred).toFixed(1)}°C
        </p>
        <p className="text-claude-text-muted text-xs mt-1">
          SMILES Length: {data.smilesLength} chars
        </p>
      </div>
    );
  }
  return null;
};

// Stat Card Component
function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'orange',
  delay = 0 
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  color?: 'orange' | 'blue' | 'green' | 'purple';
  delay?: number;
}) {
  const colorClasses = {
    orange: 'from-claude-orange/20 to-claude-orange/5 border-claude-orange/30',
    green: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
    blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
    purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30',
  };

  const iconColorClasses = {
    orange: 'text-claude-orange',
    green: 'text-emerald-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-sm hover:scale-[1.02] transition-transform cursor-default`}
    >
      <div className="relative z-10">
        <div className={`inline-flex p-3 rounded-xl bg-claude-bg/50 ${iconColorClasses[color]} mb-4`}>
          <Icon className="w-6 h-6" />
        </div>
        
        <h3 className="text-claude-text-secondary text-sm font-medium uppercase tracking-wider mb-1">
          {title}
        </h3>
        
        <p className="text-3xl font-bold text-claude-text mb-1">
          {typeof value === 'number' ? value.toLocaleString('en-US', { maximumFractionDigits: 2 }) : value}
        </p>
        
        {subtitle && (
          <p className="text-claude-text-muted text-sm">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}

export default function AnalyticsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [histogramData, setHistogramData] = useState<HistogramBin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await checkHealth();
      const data = await predictAll();
      setPredictions(data);
      setStats(calculateStats(data));
      setHistogramData(createHistogramData(data, 14));
    } catch (err) {
      setError('No se pudo conectar al backend');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-claude-orange animate-spin mx-auto mb-4" />
          <p className="text-claude-text">Cargando analytics...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <WifiOff className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-claude-text mb-2">Error de Conexión</h2>
          <p className="text-claude-text-secondary mb-6">{error}</p>
          <button onClick={loadData} className="btn-primary px-6 py-3 rounded-xl font-semibold text-white flex items-center gap-2 mx-auto">
            <RefreshCw className="w-5 h-5" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Prepare scatter data with molecular complexity
  const scatterData = predictions.map(p => {
    const smiles = p.smiles || `SMILES_${p.id}`;
    return {
      ...p,
      smilesLength: smiles.length,
      atomCount: (smiles.match(/[A-Z][a-z]?/g) || []).length,
    };
  });

  // Temperature distribution for pie chart
  const tempRanges = [
    { name: 'Muy Frío (<200K)', range: [0, 200], color: '#3b82f6' },
    { name: 'Frío (200-273K)', range: [200, 273], color: '#22c55e' },
    { name: 'Ambiente (273-373K)', range: [273, 373], color: '#eab308' },
    { name: 'Caliente (>373K)', range: [373, Infinity], color: '#da7756' },
  ];

  const pieData = tempRanges.map(range => ({
    name: range.name,
    value: predictions.filter(p => p.Tm_pred >= range.range[0] && p.Tm_pred < range.range[1]).length,
    color: range.color,
  })).filter(d => d.value > 0);

  const maxHistCount = Math.max(...histogramData.map(d => d.count));

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-claude-text mb-4 flex items-center gap-3">
          <BarChart3 className="w-10 h-10 text-claude-orange" />
          Analytics
        </h1>
        <p className="text-claude-text-secondary max-w-2xl">
          Visualizaciones y estadísticas del dataset de predicciones de puntos de fusión.
        </p>
      </motion.div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-12">
          <StatCard
            title="Total Muestras"
            value={stats.count}
            subtitle="moléculas en test set"
            icon={Hash}
            color="orange"
            delay={0}
          />
          <StatCard
            title="Tm Promedio"
            value={`${stats.mean.toFixed(2)} K`}
            subtitle={`≈ ${kelvinToCelsius(stats.mean).toFixed(1)}°C`}
            icon={Thermometer}
            color="blue"
            delay={0.1}
          />
          <StatCard
            title="Desv. Estándar"
            value={`±${stats.std.toFixed(2)} K`}
            subtitle="variación en predicciones"
            icon={Sigma}
            color="purple"
            delay={0.2}
          />
          <StatCard
            title="Tm Mínimo"
            value={`${stats.min.toFixed(2)} K`}
            subtitle={`≈ ${kelvinToCelsius(stats.min).toFixed(1)}°C`}
            icon={TrendingDown}
            color="blue"
            delay={0.3}
          />
          <StatCard
            title="Tm Máximo"
            value={`${stats.max.toFixed(2)} K`}
            subtitle={`≈ ${kelvinToCelsius(stats.max).toFixed(1)}°C`}
            icon={TrendingUp}
            color="orange"
            delay={0.4}
          />
          <StatCard
            title="Tm Mediana"
            value={`${stats.median.toFixed(2)} K`}
            subtitle={`≈ ${kelvinToCelsius(stats.median).toFixed(1)}°C`}
            icon={Activity}
            color="green"
            delay={0.5}
          />
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Histogram */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 border border-claude-border"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-claude-text">
                Distribución de Puntos de Fusión
              </h3>
              <p className="text-claude-text-secondary text-sm mt-1">
                Histograma de frecuencia de predicciones Tm
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-claude-orange/10 border border-claude-orange/20">
              <div className="w-3 h-3 rounded-full bg-claude-orange" />
              <span className="text-claude-orange text-sm font-medium">Kelvin (K)</span>
            </div>
          </div>

          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" vertical={false} />
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
                  label={{ value: 'Count', angle: -90, position: 'insideLeft', fill: '#a0a0a0' }}
                />
                <Tooltip content={<HistogramTooltip />} cursor={{ fill: 'rgba(218, 119, 86, 0.1)' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={50}>
                  {histogramData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={`rgba(218, 119, 86, ${0.4 + (entry.count / maxHistCount) * 0.6})`}
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
              <span>Menor frecuencia</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-claude-orange" />
              <span>Mayor frecuencia</span>
            </div>
          </div>
        </motion.div>

        {/* Scatter Plot - IMPROVED */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-6 border border-claude-border"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-claude-text flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-claude-orange" />
                Complejidad Molecular vs Tm
              </h3>
              <p className="text-claude-text-secondary text-sm mt-1">
                Relación entre longitud SMILES y punto de fusión
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
                  label={{ value: 'SMILES Length (chars)', position: 'bottom', fill: '#a0a0a0', offset: 0 }}
                  domain={['auto', 'auto']}
                />
                <YAxis
                  dataKey="Tm_pred"
                  type="number"
                  name="Tm"
                  tick={{ fill: '#a0a0a0', fontSize: 12 }}
                  tickLine={{ stroke: '#3a3a3a' }}
                  axisLine={{ stroke: '#3a3a3a' }}
                  label={{ value: 'Tm (K)', angle: -90, position: 'insideLeft', fill: '#a0a0a0' }}
                  domain={['auto', 'auto']}
                />
                <Tooltip content={<ScatterTooltip />} />
                {stats && (
                  <ReferenceLine
                    y={stats.mean}
                    stroke="#da7756"
                    strokeDasharray="5 5"
                    label={{ value: `Mean: ${stats.mean.toFixed(0)}K`, position: 'right', fill: '#da7756', fontSize: 12 }}
                  />
                )}
                <Scatter
                  data={scatterData}
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
              <span className="text-claude-text-secondary">Predicciones</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 border-t-2 border-dashed border-claude-orange" />
              <span className="text-claude-text-secondary">Media</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Second Row Charts */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Pie Chart - Temperature Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6 border border-claude-border"
        >
          <div className="flex items-center gap-3 mb-6">
            <PieChartIcon className="w-5 h-5 text-claude-orange" />
            <div>
              <h3 className="text-xl font-bold text-claude-text">
                Distribución por Rango de Temperatura
              </h3>
              <p className="text-claude-text-secondary text-sm">
                Categorización de moléculas por punto de fusión
              </p>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#1a1a1a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} moléculas`, 'Cantidad']}
                  contentStyle={{ 
                    backgroundColor: 'rgba(42, 42, 42, 0.9)', 
                    border: '1px solid #3a3a3a',
                    borderRadius: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {pieData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-claude-text-secondary text-sm">{entry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Area Chart - Cumulative Distribution */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6 border border-claude-border"
        >
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-5 h-5 text-claude-orange" />
            <div>
              <h3 className="text-xl font-bold text-claude-text">
                Distribución Acumulativa
              </h3>
              <p className="text-claude-text-secondary text-sm">
                Porcentaje acumulado de moléculas por Tm
              </p>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={histogramData.map((bin, index, arr) => {
                  const cumulative = arr.slice(0, index + 1).reduce((sum, b) => sum + b.count, 0);
                  const total = arr.reduce((sum, b) => sum + b.count, 0);
                  return {
                    ...bin,
                    cumulative: (cumulative / total * 100).toFixed(1),
                  };
                })}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
                <XAxis 
                  dataKey="range" 
                  tick={{ fill: '#a0a0a0', fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis 
                  tick={{ fill: '#a0a0a0', fontSize: 12 }}
                  label={{ value: '% Acumulado', angle: -90, position: 'insideLeft', fill: '#a0a0a0' }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, 'Acumulado']}
                  contentStyle={{ 
                    backgroundColor: 'rgba(42, 42, 42, 0.9)', 
                    border: '1px solid #3a3a3a',
                    borderRadius: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="#da7756" 
                  fill="url(#colorGradient)"
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#da7756" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#da7756" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
