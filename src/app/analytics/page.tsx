'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Legend,
  ComposedChart,
  Line,
  AreaChart,
  Area,
} from 'recharts';
import {
  Loader2,
  WifiOff,
  RefreshCw,
  BarChart3,
  Thermometer,
  TrendingUp,
  AlertCircle,
  Database,
  User,
  Sliders,
  Atom,
  Beaker,
  FlaskConical,
  Layers,
} from 'lucide-react';
import {
  checkHealth,
  getStatistics,
  getDistribution,
  getByFunctionalGroup,
  getByMoleculeSize,
  getAllData,
  Statistics,
  DistributionCategory,
  FunctionalGroupStats,
  MoleculeSizeGroup,
  DataItem,
  kelvinToCelsius,
  SOURCE_COLORS,
  MODEL_MAE,
} from '@/lib/api';

// Scatter Tooltip
const ScatterTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-claude-bg-secondary rounded-xl p-3 shadow-lg border border-claude-border text-sm">
        <p className="text-claude-text-muted">ID: {data.id}</p>
        <p className="font-semibold" style={{ color: SOURCE_COLORS[data.source as keyof typeof SOURCE_COLORS] }}>
          Tm: {data.Tm_pred.toFixed(2)} K ({kelvinToCelsius(data.Tm_pred).toFixed(1)}°C)
        </p>
        <p className="text-claude-text-muted">SMILES: {data.smiles?.substring(0, 30)}...</p>
        <p className="text-xs mt-1 capitalize">Fuente: {data.source === 'train' ? 'Train (Real)' : data.source === 'test' ? 'Test (Predicción)' : 'Usuario'}</p>
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const [stats, setStats] = useState<Statistics | null>(null);
  const [distribution, setDistribution] = useState<DistributionCategory[]>([]);
  const [functionalGroups, setFunctionalGroups] = useState<FunctionalGroupStats[]>([]);
  const [moleculeSizes, setMoleculeSizes] = useState<MoleculeSizeGroup[]>([]);
  const [allData, setAllData] = useState<DataItem[]>([]);

  // Filters
  const [tempRange, setTempRange] = useState<[number, number]>([100, 600]);
  const [sourceFilter, setSourceFilter] = useState<'all' | 'train' | 'test' | 'user'>('all');

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await checkHealth();
      setIsConnected(true);

      const [statsData, distData, fgData, msData, dataAll] = await Promise.all([
        getStatistics(),
        getDistribution(),
        getByFunctionalGroup(),
        getByMoleculeSize(),
        getAllData(),
      ]);

      setStats(statsData);
      setDistribution(distData.categories || []);
      setFunctionalGroups(fgData.groups || []);
      setMoleculeSizes(msData.size_groups || []);
      setAllData(dataAll || []);

      // Set initial range based on data
      if (dataAll && dataAll.length > 0) {
        const temps = dataAll.map(d => d.Tm_pred);
        setTempRange([Math.floor(Math.min(...temps)), Math.ceil(Math.max(...temps))]);
      }
    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError('No se pudo conectar al backend');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Stats by source
  const sourceStats = useMemo(() => {
    const train = allData.filter(d => d.source === 'train');
    const test = allData.filter(d => d.source === 'test');
    const user = allData.filter(d => d.source === 'user');

    const calcStats = (data: DataItem[]) => {
      if (data.length === 0) return { count: 0, mean: 0, std: 0, min: 0, max: 0, median: 0, q1: 0, q3: 0 };
      const temps = data.map(d => d.Tm_pred).sort((a, b) => a - b);
      const mean = temps.reduce((a, b) => a + b, 0) / temps.length;
      const variance = temps.reduce((sum, t) => sum + Math.pow(t - mean, 2), 0) / temps.length;
      const q1Idx = Math.floor(temps.length * 0.25);
      const medIdx = Math.floor(temps.length * 0.5);
      const q3Idx = Math.floor(temps.length * 0.75);
      return {
        count: data.length,
        mean,
        std: Math.sqrt(variance),
        min: temps[0],
        max: temps[temps.length - 1],
        median: temps[medIdx],
        q1: temps[q1Idx],
        q3: temps[q3Idx],
      };
    };

    return {
      train: calcStats(train),
      test: calcStats(test),
      user: calcStats(user),
      total: calcStats(allData),
    };
  }, [allData]);

  // Data for distribution by source (filtered)
  const distributionBySource = useMemo(() => {
    const bins = [
      { range: [0, 150], name: '<150K' },
      { range: [150, 200], name: '150-200K' },
      { range: [200, 250], name: '200-250K' },
      { range: [250, 300], name: '250-300K' },
      { range: [300, 350], name: '300-350K' },
      { range: [350, 400], name: '350-400K' },
      { range: [400, 500], name: '400-500K' },
      { range: [500, 1000], name: '>500K' },
    ];

    const filteredData = sourceFilter === 'all' ? allData : allData.filter(d => d.source === sourceFilter);

    return bins.map(bin => {
      const train = filteredData.filter(d => d.source === 'train' && d.Tm_pred >= bin.range[0] && d.Tm_pred < bin.range[1]).length;
      const test = filteredData.filter(d => d.source === 'test' && d.Tm_pred >= bin.range[0] && d.Tm_pred < bin.range[1]).length;
      const user = filteredData.filter(d => d.source === 'user' && d.Tm_pred >= bin.range[0] && d.Tm_pred < bin.range[1]).length;
      return { name: bin.name, train, test, user, total: train + test + user };
    });
  }, [allData, sourceFilter]);

  // Scatter data (sampled for performance, respects source filter)
  const scatterData = useMemo(() => {
    const sampleSize = 300;
    const sample = (data: DataItem[], size: number) => {
      if (data.length <= size) return data;
      const step = Math.ceil(data.length / size);
      return data.filter((_, i) => i % step === 0);
    };

    if (sourceFilter !== 'all') {
      const sourceData = allData.filter(d => d.source === sourceFilter);
      return sample(sourceData, sampleSize * 2).map(d => ({
        ...d,
        smilesLength: d.smiles?.length || 0,
      }));
    }

    const train = sample(allData.filter(d => d.source === 'train'), sampleSize);
    const test = sample(allData.filter(d => d.source === 'test'), sampleSize);
    const user = allData.filter(d => d.source === 'user');

    return [...train, ...test, ...user].map(d => ({
      ...d,
      smilesLength: d.smiles?.length || 0,
    }));
  }, [allData, sourceFilter]);

  // Filtered data by range AND source
  const filteredData = useMemo(() => {
    let data = allData;
    if (sourceFilter !== 'all') {
      data = data.filter(d => d.source === sourceFilter);
    }
    return data.filter(d => d.Tm_pred >= tempRange[0] && d.Tm_pred <= tempRange[1]);
  }, [allData, tempRange, sourceFilter]);

  // Functional groups data for visualization
  const topFunctionalGroups = useMemo(() => {
    return functionalGroups
      .filter(g => g.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [functionalGroups]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-claude-orange animate-spin mb-4" />
          <p className="text-claude-text-secondary">Cargando analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <WifiOff className="w-16 h-16 text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-claude-text mb-2">Sin conexión</h2>
          <p className="text-claude-text-secondary mb-6">{error}</p>
          <button onClick={loadData} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-claude-orange text-white font-semibold hover:bg-claude-orange-dark transition-colors">
            <RefreshCw className="w-5 h-5" />Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-claude-text flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-claude-orange" />Analytics
          </h1>
          <p className="text-claude-text-secondary mt-1">Sistema de apoyo a la toma de decisiones</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
          <span className="text-sm text-claude-text-muted">{allData.length.toLocaleString()} compuestos</span>
          <button onClick={loadData} className="p-2 rounded-lg hover:bg-claude-bg-tertiary transition-colors" title="Actualizar datos">
            <RefreshCw className="w-4 h-4 text-claude-text-muted" />
          </button>
        </div>
      </motion.div>

      {/* ========================================== */}
      {/* SECCION 1: Resumen del Dataset Consolidado */}
      {/* ========================================== */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 border border-claude-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-claude-orange/20 text-claude-orange">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-claude-text">Resumen del Dataset</h2>
            <p className="text-claude-text-secondary text-sm">Estadísticas por fuente de datos y distribución comparativa</p>
          </div>
        </div>

        {/* Stats Cards por Fuente */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Train */}
          <div className="p-4 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/5">
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-emerald-400">Train (Datos Reales)</h3>
            </div>
            <p className="text-3xl font-bold text-emerald-400 mb-2">{sourceStats.train.count.toLocaleString()}</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-claude-text-secondary">
              <p>Media: <span className="text-emerald-400 font-medium">{sourceStats.train.mean.toFixed(1)} K</span></p>
              <p>Mediana: <span className="text-emerald-400 font-medium">{sourceStats.train.median.toFixed(1)} K</span></p>
              <p>Min: <span className="text-emerald-400 font-medium">{sourceStats.train.min.toFixed(0)} K</span></p>
              <p>Max: <span className="text-emerald-400 font-medium">{sourceStats.train.max.toFixed(0)} K</span></p>
              <p>Std: <span className="text-emerald-400 font-medium">±{sourceStats.train.std.toFixed(1)} K</span></p>
              <p>IQR: <span className="text-emerald-400 font-medium">{(sourceStats.train.q3 - sourceStats.train.q1).toFixed(1)} K</span></p>
            </div>
          </div>

          {/* Test */}
          <div className="p-4 rounded-xl border-2 border-blue-500/30 bg-blue-500/5">
            <div className="flex items-center gap-2 mb-3">
              <FlaskConical className="w-5 h-5 text-blue-400" />
              <h3 className="font-bold text-blue-400">Test (Predicciones)</h3>
            </div>
            <p className="text-3xl font-bold text-blue-400 mb-2">{sourceStats.test.count.toLocaleString()}</p>
            <div className="grid grid-cols-2 gap-2 text-sm text-claude-text-secondary">
              <p>Media: <span className="text-blue-400 font-medium">{sourceStats.test.mean.toFixed(1)} K</span></p>
              <p>Mediana: <span className="text-blue-400 font-medium">{sourceStats.test.median.toFixed(1)} K</span></p>
              <p>Min: <span className="text-blue-400 font-medium">{sourceStats.test.min.toFixed(0)} K</span></p>
              <p>Max: <span className="text-blue-400 font-medium">{sourceStats.test.max.toFixed(0)} K</span></p>
              <p>MAE: <span className="text-blue-400 font-medium">±{MODEL_MAE} K</span></p>
              <p>IQR: <span className="text-blue-400 font-medium">{(sourceStats.test.q3 - sourceStats.test.q1).toFixed(1)} K</span></p>
            </div>
          </div>

          {/* Usuario */}
          <div className="p-4 rounded-xl border-2 border-orange-500/30 bg-orange-500/5">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-5 h-5 text-orange-400" />
              <h3 className="font-bold text-orange-400">Usuario (Tus compuestos)</h3>
            </div>
            <p className="text-3xl font-bold text-orange-400 mb-2">{sourceStats.user.count.toLocaleString()}</p>
            {sourceStats.user.count > 0 ? (
              <div className="grid grid-cols-2 gap-2 text-sm text-claude-text-secondary">
                <p>Media: <span className="text-orange-400 font-medium">{sourceStats.user.mean.toFixed(1)} K</span></p>
                <p>Mediana: <span className="text-orange-400 font-medium">{sourceStats.user.median.toFixed(1)} K</span></p>
                <p>Min: <span className="text-orange-400 font-medium">{sourceStats.user.min.toFixed(0)} K</span></p>
                <p>Max: <span className="text-orange-400 font-medium">{sourceStats.user.max.toFixed(0)} K</span></p>
                <p>Std: <span className="text-orange-400 font-medium">±{sourceStats.user.std.toFixed(1)} K</span></p>
                <p>IQR: <span className="text-orange-400 font-medium">{(sourceStats.user.q3 - sourceStats.user.q1).toFixed(1)} K</span></p>
              </div>
            ) : (
              <p className="text-sm text-claude-text-secondary">Agrega compuestos en la pagina de Predictions</p>
            )}
          </div>
        </div>

        {/* Box Plot Visual */}
        <div className="mt-4 p-4 rounded-xl bg-claude-bg-secondary">
          <p className="text-sm text-claude-text-muted mb-4 font-medium">Comparación de Distribuciones (Box Plot)</p>
          <div className="grid grid-cols-3 gap-6">
            {(['train', 'test', 'user'] as const).map((source) => {
              const s = sourceStats[source];
              const color = SOURCE_COLORS[source];
              const range = sourceStats.total.max - sourceStats.total.min;
              if (s.count === 0) return (
                <div key={source} className="text-center text-claude-text-muted text-sm">Sin datos</div>
              );

              const toPercent = (val: number) => ((val - sourceStats.total.min) / range) * 100;

              return (
                <div key={source} className="relative h-32">
                  <p className="text-xs text-center mb-2" style={{ color }}>{source === 'train' ? 'Train' : source === 'test' ? 'Test' : 'Usuario'}</p>
                  <div className="relative h-20 mx-4">
                    {/* Whisker line */}
                    <div
                      className="absolute w-0.5 bg-claude-text-muted"
                      style={{
                        left: '50%',
                        top: `${100 - toPercent(s.max)}%`,
                        height: `${toPercent(s.max) - toPercent(s.min)}%`,
                        transform: 'translateX(-50%)',
                      }}
                    />
                    {/* Box (Q1-Q3) */}
                    <div
                      className="absolute left-1/4 right-1/4 rounded"
                      style={{
                        backgroundColor: `${color}40`,
                        border: `2px solid ${color}`,
                        top: `${100 - toPercent(s.q3)}%`,
                        height: `${toPercent(s.q3) - toPercent(s.q1)}%`,
                      }}
                    />
                    {/* Median line */}
                    <div
                      className="absolute left-1/4 right-1/4 h-0.5"
                      style={{
                        backgroundColor: color,
                        top: `${100 - toPercent(s.median)}%`,
                      }}
                    />
                    {/* Min whisker */}
                    <div
                      className="absolute left-1/3 right-1/3 h-0.5 bg-claude-text-muted"
                      style={{ top: `${100 - toPercent(s.min)}%` }}
                    />
                    {/* Max whisker */}
                    <div
                      className="absolute left-1/3 right-1/3 h-0.5 bg-claude-text-muted"
                      style={{ top: `${100 - toPercent(s.max)}%` }}
                    />
                  </div>
                  <div className="text-xs text-center mt-2 text-claude-text-muted">
                    <span style={{ color }}>{s.median.toFixed(0)} K</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-claude-text-muted mt-2 px-4">
            <span>{sourceStats.total.min.toFixed(0)} K</span>
            <span>{sourceStats.total.max.toFixed(0)} K</span>
          </div>
        </div>
      </motion.div>

      {/* ========================================== */}
      {/* SECCION 2: Filtro Global */}
      {/* ========================================== */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-4 border border-claude-border">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-claude-text font-medium">Filtrar gráficos por fuente:</span>
          <div className="flex rounded-xl overflow-hidden border border-claude-border">
            {(['all', 'train', 'test', 'user'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setSourceFilter(filter)}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  sourceFilter === filter
                    ? filter === 'train' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                      : filter === 'test' ? 'bg-blue-500/20 text-blue-400 border-blue-500'
                        : filter === 'user' ? 'bg-orange-500/20 text-orange-400 border-orange-500'
                          : 'bg-claude-orange/20 text-claude-orange border-claude-orange'
                    : 'text-claude-text-secondary hover:text-claude-text hover:bg-claude-bg-secondary'
                }`}
              >
                {filter === 'all' ? 'Todos' : filter === 'train' ? 'Train' : filter === 'test' ? 'Test' : 'Usuario'}
              </button>
            ))}
          </div>
          {sourceFilter !== 'all' && (
            <span className="text-sm text-claude-text-muted">
              Mostrando {allData.filter(d => d.source === sourceFilter).length.toLocaleString()} compuestos
            </span>
          )}
        </div>
      </motion.div>

      {/* ========================================== */}
      {/* SECCION 3: Distribución y Scatter Plot */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Histogram */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 border border-claude-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
              <Thermometer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-claude-text">Distribución por Temperatura</h3>
              <p className="text-claude-text-secondary text-xs">Histograma por rango de Tm</p>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionBySource} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
                <XAxis dataKey="name" tick={{ fill: '#a0a0a0', fontSize: 10 }} />
                <YAxis tick={{ fill: '#a0a0a0', fontSize: 11 }} />
                <Tooltip content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-claude-bg-secondary rounded-xl p-3 shadow-lg border border-claude-border text-sm">
                        <p className="font-bold text-claude-text mb-2">{label}</p>
                        {payload.map((p: any) => (
                          <p key={p.name} style={{ color: p.fill }}>
                            {p.name === 'train' ? 'Train' : p.name === 'test' ? 'Test' : 'Usuario'}: {p.value}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }} />
                <Legend formatter={(value) => value === 'train' ? 'Train' : value === 'test' ? 'Test' : 'Usuario'} />
                {(sourceFilter === 'all' || sourceFilter === 'train') && <Bar dataKey="train" stackId="a" fill={SOURCE_COLORS.train} />}
                {(sourceFilter === 'all' || sourceFilter === 'test') && <Bar dataKey="test" stackId="a" fill={SOURCE_COLORS.test} />}
                {(sourceFilter === 'all' || sourceFilter === 'user') && <Bar dataKey="user" stackId="a" fill={SOURCE_COLORS.user} />}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Scatter Plot */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 border border-claude-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-claude-text">Complejidad vs Tm</h3>
              <p className="text-claude-text-secondary text-xs">Longitud SMILES como proxy de complejidad</p>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
                <XAxis
                  dataKey="smilesLength"
                  name="SMILES Length"
                  type="number"
                  tick={{ fill: '#a0a0a0', fontSize: 11 }}
                  label={{ value: 'Longitud SMILES', position: 'bottom', fill: '#a0a0a0', fontSize: 11, dy: 10 }}
                />
                <YAxis
                  dataKey="Tm_pred"
                  name="Tm (K)"
                  tick={{ fill: '#a0a0a0', fontSize: 11 }}
                />
                <Tooltip content={<ScatterTooltip />} />
                <Legend formatter={(value) => value === 'train' ? 'Train' : value === 'test' ? 'Test' : 'Usuario'} />
                {(sourceFilter === 'all' || sourceFilter === 'train') && (
                  <Scatter name="train" data={scatterData.filter(d => d.source === 'train')} fill={SOURCE_COLORS.train} opacity={0.6} />
                )}
                {(sourceFilter === 'all' || sourceFilter === 'test') && (
                  <Scatter name="test" data={scatterData.filter(d => d.source === 'test')} fill={SOURCE_COLORS.test} opacity={0.6} />
                )}
                {(sourceFilter === 'all' || sourceFilter === 'user') && (
                  <Scatter name="user" data={scatterData.filter(d => d.source === 'user')} fill={SOURCE_COLORS.user} opacity={1} />
                )}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* ========================================== */}
      {/* SECCION 4: Análisis Químico */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Functional Groups Chart */}
        {topFunctionalGroups.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 border border-claude-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400">
                <Beaker className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-claude-text">Grupos Funcionales</h3>
                <p className="text-claude-text-secondary text-xs">Top 10 grupos y su Tm promedio</p>
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={topFunctionalGroups} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" horizontal={true} vertical={false} />
                  <XAxis type="number" tick={{ fill: '#a0a0a0', fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#a0a0a0', fontSize: 10 }} width={75} />
                  <Tooltip content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-claude-bg-secondary rounded-xl p-3 shadow-lg border border-claude-border text-sm">
                          <p className="font-bold text-claude-text mb-1">{data.name}</p>
                          <p className="text-pink-400">Compuestos: {data.count}</p>
                          <p className="text-claude-orange">Tm promedio: {data.avg_tm.toFixed(1)} K</p>
                          <p className="text-claude-text-muted">Rango: {data.min_tm.toFixed(0)} - {data.max_tm.toFixed(0)} K</p>
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <Bar dataKey="count" name="Cantidad" fill="#f472b6" barSize={16} />
                  <Line type="monotone" dataKey="avg_tm" name="Tm Prom (K)" stroke="#E07A3A" strokeWidth={2} dot={{ fill: '#E07A3A', r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 text-xs">
              <p className="text-claude-text-secondary">
                <strong className="text-pink-400">Interpretación:</strong> Grupos polares (OH, NH2) aumentan Tm por puentes de hidrógeno.
              </p>
            </div>
          </motion.div>
        )}

        {/* Molecule Size Chart */}
        {moleculeSizes.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 border border-claude-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                <Atom className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-claude-text">Tamaño Molecular</h3>
                <p className="text-claude-text-secondary text-xs">Relación tamaño-Tm</p>
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={moleculeSizes} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" />
                  <XAxis dataKey="name" tick={{ fill: '#a0a0a0', fontSize: 10 }} />
                  <YAxis yAxisId="left" tick={{ fill: '#a0a0a0', fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#a0a0a0', fontSize: 11 }} />
                  <Tooltip content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-claude-bg-secondary rounded-xl p-3 shadow-lg border border-claude-border text-sm">
                          <p className="font-bold text-claude-text mb-1">{data.name}</p>
                          <p className="text-cyan-400">Compuestos: {data.count}</p>
                          <p className="text-claude-orange">Tm promedio: {data.avg_tm.toFixed(1)} K</p>
                        </div>
                      );
                    }
                    return null;
                  }} />
                  <Legend />
                  <Area yAxisId="left" type="monotone" dataKey="count" name="Cantidad" fill="#22d3d1" fillOpacity={0.3} stroke="#22d3d1" />
                  <Line yAxisId="right" type="monotone" dataKey="avg_tm" name="Tm Prom (K)" stroke="#E07A3A" strokeWidth={2} dot={{ fill: '#E07A3A', r: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs">
              <p className="text-claude-text-secondary">
                <strong className="text-cyan-400">Interpretación:</strong> Moléculas más grandes tienen Tm más alto (fuerzas de van der Waals).
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* ========================================== */}
      {/* SECCION 5: Selector de Rango Interactivo */}
      {/* ========================================== */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 border border-claude-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-claude-text">Selector de Rango Interactivo</h3>
            <p className="text-claude-text-secondary text-sm">Filtra compuestos por rango de temperatura</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 mb-6">
          <div>
            <label className="text-claude-text-muted text-sm block mb-1">Mínimo (K)</label>
            <input
              type="number"
              value={tempRange[0]}
              onChange={(e) => setTempRange([Number(e.target.value), tempRange[1]])}
              className="w-28 px-3 py-2 bg-claude-bg border border-claude-border rounded-xl text-claude-text focus:border-emerald-400 transition-all"
            />
          </div>
          <div className="text-2xl text-claude-text-muted">→</div>
          <div>
            <label className="text-claude-text-muted text-sm block mb-1">Máximo (K)</label>
            <input
              type="number"
              value={tempRange[1]}
              onChange={(e) => setTempRange([tempRange[0], Number(e.target.value)])}
              className="w-28 px-3 py-2 bg-claude-bg border border-claude-border rounded-xl text-claude-text focus:border-emerald-400 transition-all"
            />
          </div>
          <div className="flex-1 text-right">
            <p className="text-claude-text-muted text-sm mb-1">Compuestos en rango</p>
            <p className="text-3xl font-bold text-emerald-400">
              {filteredData.length.toLocaleString()}
              <span className="text-sm font-normal text-claude-text-muted ml-2">
                ({((filteredData.length / allData.length) * 100).toFixed(1)}%)
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <p className="text-emerald-400 text-2xl font-bold">{filteredData.filter(d => d.source === 'train').length}</p>
            <p className="text-sm text-claude-text-muted">Train</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30">
            <p className="text-blue-400 text-2xl font-bold">{filteredData.filter(d => d.source === 'test').length}</p>
            <p className="text-sm text-claude-text-muted">Test</p>
          </div>
          <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/30">
            <p className="text-orange-400 text-2xl font-bold">{filteredData.filter(d => d.source === 'user').length}</p>
            <p className="text-sm text-claude-text-muted">Usuario</p>
          </div>
        </div>
      </motion.div>

      {/* ========================================== */}
      {/* NOTA FINAL: Guía de Interpretación */}
      {/* ========================================== */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start gap-3 p-4 rounded-xl bg-claude-orange/10 border border-claude-orange/20">
        <AlertCircle className="w-5 h-5 text-claude-orange flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="text-claude-text font-medium">Guía para Toma de Decisiones</p>
          <ul className="text-claude-text-secondary mt-2 space-y-1 list-disc list-inside">
            <li><span className="text-emerald-400 font-medium">Train (verde)</span>: Valores de Tm medidos experimentalmente - referencia confiable.</li>
            <li><span className="text-blue-400 font-medium">Test (azul)</span>: Predicciones del modelo con incertidumbre <strong>±{MODEL_MAE.toFixed(1)} K</strong>.</li>
            <li><span className="text-orange-400 font-medium">Usuario (naranja)</span>: Tus compuestos - compara con el dataset para evaluar confiabilidad.</li>
            <li>Predicciones dentro del rango del dataset son más confiables que extrapolaciones.</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
