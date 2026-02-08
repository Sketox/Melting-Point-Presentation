'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  WifiOff,
  RefreshCw,
  Search,
  FileText,
  Download,
  Beaker,
  Thermometer,
  Database,
  FlaskConical,
  User,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import {
  getAllData,
  recommendSimilar,
  getReportUrl,
  DataItem,
  SimilarCompound,
  kelvinToCelsius,
  MODEL_MAE,
  SOURCE_COLORS,
} from '@/lib/api';

const SourceBadge = ({ source }: { source: 'train' | 'test' | 'user' }) => {
  const config = {
    train: { label: 'Real', icon: Database, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    test: { label: 'Prediccion', icon: FlaskConical, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    user: { label: 'Usuario', icon: User, color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  };
  const { label, icon: Icon, color } = config[source];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

export default function DecisionSupportPage() {
  const [allData, setAllData] = useState<DataItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Compound selection
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selected, setSelected] = useState<DataItem | null>(null);

  // Recommendations
  const [recommendations, setRecommendations] = useState<SimilarCompound[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAllData();
      setAllData(data);
    } catch {
      setError('No se pudo conectar al backend');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter compounds for dropdown
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return allData.slice(0, 20);
    const q = searchQuery.toLowerCase();
    return allData
      .filter(d =>
        String(d.id).includes(q) ||
        d.smiles.toLowerCase().includes(q) ||
        (d.name && d.name.toLowerCase().includes(q))
      )
      .slice(0, 20);
  }, [allData, searchQuery]);

  const handleSelect = (item: DataItem) => {
    setSelected(item);
    setSearchQuery('');
    setShowDropdown(false);
    // Reset previous results
    setRecommendations([]);
    setHasSearched(false);
    setSearchError(null);
  };

  const handleSearchAlternatives = async () => {
    if (!selected) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      const res = await recommendSimilar(selected.smiles, selected.Tm_pred);
      setRecommendations(res.results || []);
      setHasSearched(true);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Error al buscar alternativas');
    } finally {
      setIsSearching(false);
    }
  };

  const handleDownloadReport = () => {
    if (!selected) return;
    window.open(getReportUrl(selected.id), '_blank');
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-claude-orange animate-spin mb-4" />
          <p className="text-claude-text-secondary">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <WifiOff className="w-16 h-16 text-red-400 mb-4" />
          <h2 className="text-2xl font-bold text-claude-text mb-2">Sin conexion</h2>
          <p className="text-claude-text-secondary mb-6">{error}</p>
          <button onClick={loadData} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-claude-orange text-white font-semibold hover:bg-claude-orange-dark transition-colors">
            <RefreshCw className="w-5 h-5" />Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-claude-text">Decision Support</h1>
          <p className="text-claude-text-secondary mt-1">Busca alternativas similares y genera reportes tecnicos</p>
        </motion.div>

        {/* Compound Selector */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 border border-claude-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-claude-orange/20 text-claude-orange">
              <Beaker className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-claude-text">Seleccionar Compuesto</h2>
              <p className="text-claude-text-secondary text-sm">Busca por ID, nombre o SMILES</p>
            </div>
          </div>

          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-claude-text-muted" />
              <input
                type="text"
                placeholder="Ej: 42, Aspirina, CC(=O)O..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                className="w-full pl-11 pr-10 py-3 bg-claude-bg border border-claude-border rounded-xl text-claude-text placeholder:text-claude-text-muted focus:border-claude-orange transition-all"
              />
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-claude-text-muted" />
            </div>

            {/* Dropdown */}
            <AnimatePresence>
              {showDropdown && filteredOptions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute z-20 w-full mt-1 max-h-64 overflow-y-auto bg-claude-bg-secondary border border-claude-border rounded-xl shadow-xl"
                >
                  {filteredOptions.map((item) => (
                    <button
                      key={`${item.source}-${item.id}`}
                      onClick={() => handleSelect(item)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-claude-orange/10 transition-colors text-left border-b border-claude-border/30 last:border-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-claude-text-muted text-xs font-mono shrink-0">#{item.id}</span>
                        <span className="text-claude-text text-sm truncate">
                          {item.name || item.smiles}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-sm font-medium" style={{ color: SOURCE_COLORS[item.source] }}>
                          {item.Tm_pred.toFixed(1)} K
                        </span>
                        <SourceBadge source={item.source} />
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Click outside to close */}
          {showDropdown && (
            <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
          )}

          {/* Selected compound card */}
          <AnimatePresence>
            {selected && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 rounded-xl bg-gradient-to-r from-claude-orange/10 to-transparent border border-claude-orange/20 overflow-hidden"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-claude-text-muted text-sm">#{selected.id}</p>
                      <SourceBadge source={selected.source} />
                    </div>
                    <p className="text-claude-text font-semibold">
                      {selected.name || 'Sin nombre'}
                    </p>
                    <code className="text-xs text-claude-text-muted font-mono block mt-1 max-w-md truncate">
                      {selected.smiles}
                    </code>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold" style={{ color: SOURCE_COLORS[selected.source] }}>
                      {selected.Tm_pred.toFixed(2)} K
                    </p>
                    <p className="text-claude-text-secondary text-sm">
                      {kelvinToCelsius(selected.Tm_pred).toFixed(1)}°C
                    </p>
                    <p className="text-xs text-claude-text-muted mt-1">
                      {selected.source === 'train' ? 'Valor medido' : `±${MODEL_MAE} K`}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Sections only visible when compound is selected */}
        {selected && (
          <>
            {/* SECTION A: Recommendations */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6 border border-claude-border">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                    <Search className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-claude-text">Alternativas Similares</h2>
                    <p className="text-claude-text-secondary text-sm">Compuestos con estructura y propiedades similares</p>
                  </div>
                </div>
                <button
                  onClick={handleSearchAlternatives}
                  disabled={isSearching}
                  className="px-5 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-semibold hover:bg-blue-500/20 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Buscar alternativas
                </button>
              </div>

              {searchError && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-4">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-red-400 text-sm">{searchError}</p>
                </div>
              )}

              {hasSearched && recommendations.length === 0 && !searchError && (
                <div className="text-center py-8 text-claude-text-muted">
                  No se encontraron compuestos similares con los criterios actuales.
                </div>
              )}

              {recommendations.length > 0 && (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {recommendations.map((rec, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 rounded-xl bg-claude-bg border border-claude-border hover:border-blue-500/30 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-blue-400 font-bold text-lg">
                          {(rec.similarity * 100).toFixed(1)}%
                        </span>
                        <SourceBadge source={rec.source} />
                      </div>
                      <div className="mb-2">
                        <div className="flex items-center gap-1.5">
                          <Thermometer className="w-4 h-4 text-claude-text-muted" />
                          <span className="font-bold" style={{ color: SOURCE_COLORS[rec.source] }}>
                            {rec.Tm_pred.toFixed(2)} K
                          </span>
                          <span className="text-claude-text-muted text-xs">
                            ({kelvinToCelsius(rec.Tm_pred).toFixed(1)}°C)
                          </span>
                        </div>
                      </div>
                      {rec.name && (
                        <p className="text-sm text-claude-text-secondary mb-1">{rec.name}</p>
                      )}
                      <code className="text-[11px] text-claude-text-muted font-mono block truncate" title={rec.smiles}>
                        {rec.smiles}
                      </code>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* SECTION B: Technical Report */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6 border border-claude-border">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-claude-orange/20 text-claude-orange">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-claude-text">Reporte Tecnico</h2>
                  <p className="text-claude-text-secondary text-sm">Documento PDF con el analisis completo</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-claude-bg border border-claude-border mb-4">
                <p className="text-claude-text-secondary text-sm leading-relaxed">
                  El reporte incluye los datos del compuesto, la prediccion del punto de fusion
                  con su incertidumbre (±{MODEL_MAE} K), informacion estructural y contexto
                  estadistico respecto al dataset de referencia.
                </p>
              </div>

              <button
                onClick={handleDownloadReport}
                className="w-full py-3.5 rounded-xl btn-primary text-white font-semibold text-lg flex items-center justify-center gap-3 transition-all"
              >
                <Download className="w-5 h-5" />
                Descargar PDF
              </button>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
