'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { generateCompoundName } from '@/lib/chemUtils';
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
import {
  Loader2,
  WifiOff,
  RefreshCw,
  BarChart3,
  Thermometer,
  FlaskConical,
  Layers,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  checkHealth,
  getStatistics,
  getDistribution,
  getByFunctionalGroup,
  getByMoleculeSize,
  predictAll,
  Statistics,
  DistributionCategory,
  FunctionalGroupStats,
  MoleculeSizeGroup,
  Prediction,
  kelvinToCelsius,
} from '@/lib/api';

// Colores para los gráficos
const DISTRIBUTION_COLORS = ['#60a5fa', '#4ade80', '#f5a623', '#da7756', '#a78bfa'];
const FUNCTIONAL_COLORS = ['#da7756', '#f5a623', '#4ade80', '#60a5fa', '#a78bfa', '#f472b6'];

// Custom Tooltip para gráficos
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-claude-bg-secondary rounded-xl p-4 shadow-lg border border-claude-border">
        <p className="text-claude-orange font-semibold mb-2">{data.name || data.fullName || label}</p>
        <p className="text-claude-text">
          <span className="text-claude-text-secondary">Cantidad: </span>
          <span className="font-bold">{data.count}</span>
        </p>
        {data.percentage !== undefined && (
          <p className="text-claude-text-muted text-sm">
            {data.percentage.toFixed(1)}% del total
          </p>
        )}
        {data.avg_tm !== undefined && (
          <p className="text-claude-text-muted text-sm mt-1">
            Tm promedio: {data.avg_tm.toFixed(1)} K ({kelvinToCelsius(data.avg_tm).toFixed(1)}°C)
          </p>
        )}
        {data.description && (
          <p className="text-claude-text-muted text-xs mt-1 italic">
            {data.description}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  // Estados de datos
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Datos
  const [stats, setStats] = useState<Statistics | null>(null);
  const [distribution, setDistribution] = useState<DistributionCategory[]>([]);
  const [functionalGroups, setFunctionalGroups] = useState<FunctionalGroupStats[]>([]);
  const [moleculeSizes, setMoleculeSizes] = useState<MoleculeSizeGroup[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  // UI state
  const [showPredictionsList, setShowPredictionsList] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await checkHealth();
      setIsConnected(true);

      // Cargar todos los datos en paralelo
      const [statsData, distData, funcData, sizeData, predsData] = await Promise.all([
        getStatistics(),
        getDistribution(),
        getByFunctionalGroup(),
        getByMoleculeSize(),
        predictAll(),
      ]);

      setStats(statsData);
      setDistribution(distData.categories || []);
      setFunctionalGroups(funcData.groups || []);
      setMoleculeSizes(sizeData.size_groups || []);
      setPredictions(predsData || []);
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

  // Estado de carga
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

  // Estado de error
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <WifiOff className="w-16 h-16 text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-claude-text mb-2">Sin conexión</h2>
          <p className="text-claude-text-secondary mb-6">{error}</p>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-claude-orange text-white font-semibold hover:bg-claude-orange-dark transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Preparar datos para gráfico de distribución (nombres más cortos para el eje Y)
  const distributionChartData = distribution.map((cat) => ({
    ...cat,
    shortName: cat.name.split(' ')[0] + (cat.name.includes('(') ? '' : ''), // "Muy bajo (<150K)" -> "Muy"
    fullName: cat.name,
  }));

  // Preparar datos para gráfico de grupos funcionales (nombres más cortos)
  const functionalGroupsChartData = functionalGroups.map((group) => ({
    ...group,
    shortName: group.name.split(' ')[0], // "Alcohols (OH)" -> "Alcohols"
    fullName: group.name,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-claude-text flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-claude-orange" />
            Analytics
          </h1>
          <p className="text-claude-text-secondary mt-1">
            Análisis estadístico de las predicciones de punto de fusión
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
          <span className="text-sm text-claude-text-muted">
            {stats?.count.toLocaleString()} moléculas
          </span>
          <button
            onClick={loadData}
            className="p-2 rounded-lg hover:bg-claude-bg-tertiary transition-colors"
            title="Actualizar datos"
          >
            <RefreshCw className="w-4 h-4 text-claude-text-muted" />
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="glass rounded-xl p-4 border border-claude-border">
            <p className="text-claude-text-muted text-sm">Total</p>
            <p className="text-2xl font-bold text-claude-text">{stats.count.toLocaleString()}</p>
            <p className="text-xs text-claude-text-muted">moléculas</p>
          </div>
          <div className="glass rounded-xl p-4 border border-claude-border">
            <p className="text-claude-text-muted text-sm">Media</p>
            <p className="text-2xl font-bold text-claude-orange">{stats.mean.toFixed(1)} K</p>
            <p className="text-xs text-claude-text-muted">{kelvinToCelsius(stats.mean).toFixed(1)}°C</p>
          </div>
          <div className="glass rounded-xl p-4 border border-claude-border">
            <p className="text-claude-text-muted text-sm">Mínimo</p>
            <p className="text-2xl font-bold text-blue-400">{stats.min.toFixed(1)} K</p>
            <p className="text-xs text-claude-text-muted">{kelvinToCelsius(stats.min).toFixed(1)}°C</p>
          </div>
          <div className="glass rounded-xl p-4 border border-claude-border">
            <p className="text-claude-text-muted text-sm">Máximo</p>
            <p className="text-2xl font-bold text-red-400">{stats.max.toFixed(1)} K</p>
            <p className="text-xs text-claude-text-muted">{kelvinToCelsius(stats.max).toFixed(1)}°C</p>
          </div>
        </motion.div>
      )}

      {/* Segunda fila de stats */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="glass rounded-xl p-4 border border-claude-border">
            <p className="text-claude-text-muted text-sm">Mediana</p>
            <p className="text-xl font-bold text-claude-text">{stats.median.toFixed(1)} K</p>
          </div>
          <div className="glass rounded-xl p-4 border border-claude-border">
            <p className="text-claude-text-muted text-sm">Desv. Estándar</p>
            <p className="text-xl font-bold text-claude-text">±{stats.std.toFixed(1)} K</p>
          </div>
          <div className="glass rounded-xl p-4 border border-claude-border">
            <p className="text-claude-text-muted text-sm">Q25</p>
            <p className="text-xl font-bold text-claude-text">{stats.q25.toFixed(1)} K</p>
          </div>
          <div className="glass rounded-xl p-4 border border-claude-border">
            <p className="text-claude-text-muted text-sm">Q75</p>
            <p className="text-xl font-bold text-claude-text">{stats.q75.toFixed(1)} K</p>
          </div>
        </motion.div>
      )}

      {/* Distribution Chart - BAR CHART */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-6 border border-claude-border"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-claude-orange/20 text-claude-orange">
            <Thermometer className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-claude-text">Distribución por Temperatura</h3>
            <p className="text-claude-text-secondary text-sm">
              Categorización por rango de Tm ({stats?.count} moléculas)
            </p>
          </div>
        </div>

        {/* Descripción explicativa */}
        <div className="mb-4 p-4 rounded-xl bg-claude-bg-tertiary/50 border border-claude-border/50">
          <p className="text-sm text-claude-text-secondary leading-relaxed">
            <span className="font-semibold text-claude-text">¿Qué representa este gráfico?</span><br />
            Muestra la distribución del conjunto de datos de prueba clasificando las moléculas según su punto de fusión predicho. 
          </p>
          <ul className="mt-2 space-y-1 text-sm text-claude-text-secondary ml-4">
            <li className="flex items-start gap-2">
              <span className="text-claude-orange mt-0.5">•</span>
              <span><strong className="text-claude-text">Representatividad:</strong> El modelo es más preciso en rangos con más ejemplos (Medio: 250-350K)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">•</span>
              <span><strong className="text-claude-text">Limitaciones:</strong> Mayor incertidumbre en temperaturas extremas por tener pocos datos de entrenamiento</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-400 mt-0.5">•</span>
              <span><strong className="text-claude-text">Aplicabilidad:</strong> Define el rango donde las predicciones son más confiables</span>
            </li>
          </ul>
        </div>

        {distribution.length > 0 ? (
          <>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={distributionChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" horizontal={true} vertical={false} />
                  <XAxis 
                    type="number" 
                    tick={{ fill: '#a0a0a0', fontSize: 12 }} 
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fill: '#a0a0a0', fontSize: 11 }}
                    width={110}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {distributionChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={DISTRIBUTION_COLORS[index % DISTRIBUTION_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Leyenda con interpretación */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              {distribution.map((cat, index) => {
                const interpretations: Record<string, string> = {
                  'Muy bajo (<150K)': 'Gases/líquidos volátiles',
                  'Bajo (150-250K)': 'Líquidos/sólidos blandos',
                  'Medio (250-350K)': 'Moléculas orgánicas típicas',
                  'Alto (350-450K)': 'Sólidos cristalinos estables',
                  'Muy alto (>450K)': 'Compuestos excepcionales'
                };
                
                return (
                  <div key={cat.name} className="flex items-start gap-2 p-3 rounded-lg bg-claude-bg-tertiary/50 border border-claude-border/30">
                    <div
                      className="w-3 h-3 rounded flex-shrink-0 mt-1"
                      style={{ backgroundColor: DISTRIBUTION_COLORS[index % DISTRIBUTION_COLORS.length] }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-claude-text font-semibold">{cat.name}</span>
                      </div>
                      <div className="text-claude-text-muted text-xs mt-0.5">
                        {cat.count} moléculas ({cat.percentage.toFixed(1)}%)
                      </div>
                      <div className="text-claude-text-secondary text-xs mt-1 italic">
                        {interpretations[cat.name] || 'Otro rango'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="h-80 flex items-center justify-center text-claude-text-muted">
            No hay datos de distribución disponibles
          </div>
        )}
      </motion.div>

      {/* Functional Groups Chart - BAR CHART */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-6 border border-claude-border"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-claude-text">Grupos Funcionales</h3>
            <p className="text-claude-text-secondary text-sm">
              Distribución por tipo de grupo químico
            </p>
          </div>
        </div>

        {functionalGroups.length > 0 ? (
          <>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={functionalGroupsChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" horizontal={true} vertical={false} />
                  <XAxis 
                    type="number" 
                    tick={{ fill: '#a0a0a0', fontSize: 12 }} 
                    tickFormatter={(value) => value.toLocaleString()}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fill: '#a0a0a0', fontSize: 11 }}
                    width={140}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {functionalGroupsChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={FUNCTIONAL_COLORS[index % FUNCTIONAL_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Tabla de detalles */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-claude-border">
                    <th className="text-left py-2 text-claude-text-muted font-medium">Grupo</th>
                    <th className="text-right py-2 text-claude-text-muted font-medium">Cantidad</th>
                    <th className="text-right py-2 text-claude-text-muted font-medium">Tm Promedio</th>
                    <th className="text-right py-2 text-claude-text-muted font-medium hidden sm:table-cell">Rango</th>
                  </tr>
                </thead>
                <tbody>
                  {functionalGroups.map((group, index) => (
                    <tr key={group.name} className="border-b border-claude-border/50 hover:bg-claude-bg-tertiary/50">
                      <td className="py-2 flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded flex-shrink-0"
                          style={{ backgroundColor: FUNCTIONAL_COLORS[index % FUNCTIONAL_COLORS.length] }}
                        />
                        <span className="text-claude-text">{group.name}</span>
                      </td>
                      <td className="text-right py-2 text-claude-text-secondary">{group.count.toLocaleString()}</td>
                      <td className="text-right py-2 text-claude-orange font-medium">{group.avg_tm.toFixed(1)} K</td>
                      <td className="text-right py-2 text-claude-text-muted text-xs hidden sm:table-cell">
                        {group.min_tm.toFixed(0)} - {group.max_tm.toFixed(0)} K
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="h-80 flex items-center justify-center text-claude-text-muted">
            No hay datos de grupos funcionales disponibles
          </div>
        )}
      </motion.div>

      {/* Molecule Size Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass rounded-2xl p-6 border border-claude-border"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-claude-text">Tamaño Molecular</h3>
            <p className="text-claude-text-secondary text-sm">
              Distribución por número de átomos
            </p>
          </div>
        </div>

        {moleculeSizes.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={moleculeSizes} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a3a3a" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#a0a0a0', fontSize: 10 }} 
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  tick={{ fill: '#a0a0a0', fontSize: 12 }} 
                  tickFormatter={(value) => value.toLocaleString()}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#a78bfa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-claude-text-muted">
            No hay datos de tamaño molecular disponibles
          </div>
        )}
      </motion.div>

      {/* Lista de Todas las Predicciones (Test Set) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-2xl border border-claude-border overflow-hidden"
      >
        <button
          onClick={() => setShowPredictionsList(!showPredictionsList)}
          className="w-full p-6 flex items-center justify-between hover:bg-claude-orange/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-claude-text">Todas las Predicciones del Test</h3>
              <p className="text-claude-text-secondary text-sm">
                {predictions.length.toLocaleString()} compuestos predichos (sin compuestos de usuario)
              </p>
            </div>
          </div>
          {showPredictionsList ? (
            <ChevronUp className="w-6 h-6 text-claude-text-muted" />
          ) : (
            <ChevronDown className="w-6 h-6 text-claude-text-muted" />
          )}
        </button>

        {showPredictionsList && (
          <div className="border-t border-claude-border max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-claude-bg-secondary">
                <tr className="border-b border-claude-border">
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-claude-text-muted uppercase">ID</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-claude-text-muted uppercase">Nombre del Compuesto</th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-claude-text-muted uppercase">Tm (K)</th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-semibold text-claude-text-muted uppercase">Tm (°C)</th>
                </tr>
              </thead>
              <tbody>
                {predictions.map((pred) => (
                  <tr key={pred.id} className="border-b border-claude-border/50 hover:bg-claude-orange/5">
                    <td className="px-4 sm:px-6 py-3">
                      <span className="px-2 py-1 rounded bg-claude-bg-tertiary text-claude-text font-mono text-sm">
                        {pred.id}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      <span className="text-claude-text text-sm">{generateCompoundName(pred.smiles || '')}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-right">
                      <span className="text-claude-orange font-bold">{pred.Tm_pred.toFixed(2)}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-right text-claude-text-muted">
                      {kelvinToCelsius(pred.Tm_pred).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Nota sobre el modelo */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex items-start gap-3 p-4 rounded-xl bg-claude-orange/10 border border-claude-orange/20"
      >
        <AlertCircle className="w-5 h-5 text-claude-orange flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="text-claude-text font-medium">Sobre las predicciones</p>
          <p className="text-claude-text-secondary mt-1">
            El modelo ChemProp D-MPNN tiene un MAE de <span className="text-claude-orange font-semibold">±28.85 K</span> (5-fold CV).
            Esto significa que las predicciones pueden variar aproximadamente ±29 K del valor real.
          </p>
        </div>
      </motion.div>
    </div>
  );
}