'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Loader2, 
  WifiOff, 
  RefreshCw,
  Thermometer,
  ArrowRight,
  AlertCircle,
  Atom,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Copy,
  Check,
  Beaker,
  Filter
} from 'lucide-react';
import { 
  predictAll, 
  predictById, 
  checkHealth, 
  Prediction,
  kelvinToCelsius 
} from '@/lib/api';

type SortField = 'id' | 'smiles' | 'Tm_pred';
type SortDirection = 'asc' | 'desc';

export default function PredictionsPage() {
  // State
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  // Search by ID
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<Prediction | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // Table state
  const [tableSearch, setTableSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const itemsPerPage = 15;

  // Load data
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await checkHealth();
      setIsConnected(true);
      
      const data = await predictAll();
      setPredictions(data);
    } catch (err) {
      setError('No se pudo conectar al backend');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Search by ID handler
  const handleSearchById = async () => {
    const id = parseInt(searchId);
    if (isNaN(id) || id < 1) {
      setSearchError('Por favor ingresa un ID válido');
      setSearchResult(null);
      return;
    }
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      const data = await predictById(id);
      setSearchResult(data);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Error desconocido');
      setSearchResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  // Table filtering and sorting
  const filteredAndSorted = useMemo(() => {
    let result = predictions.filter(p => 
      (p.smiles?.toLowerCase() || '').includes(tableSearch.toLowerCase()) ||
      p.id.toString().includes(tableSearch) ||
      p.Tm_pred.toFixed(2).includes(tableSearch)
    );

    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'id') comparison = a.id - b.id;
      else if (sortField === 'smiles') comparison = (a.smiles || '').localeCompare(b.smiles || '');
      else if (sortField === 'Tm_pred') comparison = a.Tm_pred - b.Tm_pred;
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [predictions, tableSearch, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const paginatedData = filteredAndSorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const copyToClipboard = async (text: string, id: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 opacity-40" />;
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-claude-orange" />
      : <ChevronDown className="w-4 h-4 text-claude-orange" />;
  };

  const getTemperatureColor = (temp: number) => {
    const min = Math.min(...predictions.map(p => p.Tm_pred));
    const max = Math.max(...predictions.map(p => p.Tm_pred));
    const normalized = (temp - min) / (max - min);
    if (normalized < 0.33) return 'text-blue-400';
    if (normalized < 0.66) return 'text-claude-text';
    return 'text-claude-orange';
  };

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-claude-orange animate-spin mx-auto mb-4" />
          <p className="text-claude-text">Cargando predicciones...</p>
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
          <button
            onClick={loadData}
            className="btn-primary px-6 py-3 rounded-xl font-semibold text-white flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-5 h-5" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-claude-text mb-4">
          Predicciones
        </h1>
        <p className="text-claude-text-secondary max-w-2xl">
          Explora todas las predicciones de puntos de fusión del dataset. 
          Busca por ID o filtra la tabla para encontrar moléculas específicas.
        </p>
      </motion.div>

      {/* Predict by ID Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl border border-claude-border p-6 mb-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-claude-orange/20 text-claude-orange">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-claude-text">Buscar por ID</h2>
            <p className="text-claude-text-secondary text-sm">
              Obtén la predicción de una molécula específica
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="text-xs text-claude-text-muted">{isConnected ? 'Conectado' : 'Desconectado'}</span>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <input
            type="number"
            min="1"
            placeholder="Ingresa el ID (ej: 42)"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearchById()}
            className="flex-1 px-4 py-3 bg-claude-bg border border-claude-border rounded-xl text-claude-text placeholder:text-claude-text-muted focus:border-claude-orange transition-all font-mono"
          />
          <button
            onClick={handleSearchById}
            disabled={isSearching || !searchId}
            className="btn-primary px-6 py-3 rounded-xl font-semibold text-white flex items-center gap-2 disabled:opacity-50"
          >
            {isSearching ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Buscar
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {searchError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30"
            >
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">{searchError}</p>
            </motion.div>
          )}

          {searchResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 rounded-xl bg-gradient-to-br from-claude-orange/20 to-claude-orange/5 border border-claude-orange/30"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-claude-text-secondary text-sm mb-1">Molecule ID</p>
                  <p className="text-3xl font-bold text-claude-text">#{searchResult.id}</p>
                </div>
                <div>
                  <p className="text-claude-text-secondary text-sm mb-1 flex items-center gap-2">
                    <Thermometer className="w-4 h-4" /> Predicted Melting Point
                  </p>
                  <p className="text-3xl font-bold text-claude-orange">{searchResult.Tm_pred.toFixed(2)} K</p>
                  <p className="text-claude-text-muted">{kelvinToCelsius(searchResult.Tm_pred).toFixed(1)}°C</p>
                </div>
              </div>

              {searchResult.smiles && (
                <div className="mt-6 pt-6 border-t border-claude-orange/20">
                  <p className="text-claude-text-secondary text-sm mb-2 flex items-center gap-2">
                    <Atom className="w-4 h-4" /> SMILES Structure
                  </p>
                  <code className="block p-3 rounded-lg bg-claude-bg text-claude-text font-mono text-sm break-all border border-claude-border">
                    {searchResult.smiles}
                  </code>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Predictions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl border border-claude-border overflow-hidden"
      >
        {/* Table Header */}
        <div className="p-6 border-b border-claude-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-claude-text flex items-center gap-2">
                <Beaker className="w-5 h-5 text-claude-orange" />
                Todas las Predicciones
              </h2>
              <p className="text-claude-text-secondary text-sm mt-1">
                {filteredAndSorted.length} moléculas encontradas
              </p>
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-claude-text-muted" />
              <input
                type="text"
                placeholder="Filtrar por SMILES, ID o Tm..."
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-80 pl-10 pr-4 py-2.5 bg-claude-bg border border-claude-border rounded-xl text-claude-text placeholder:text-claude-text-muted focus:border-claude-orange transition-all"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-claude-border bg-claude-orange/5">
                <th 
                  className="px-6 py-4 text-left cursor-pointer hover:bg-claude-orange/10 transition-colors"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-claude-text-secondary uppercase tracking-wider">
                    ID
                    <SortIcon field="id" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left cursor-pointer hover:bg-claude-orange/10 transition-colors"
                  onClick={() => handleSort('smiles')}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-claude-text-secondary uppercase tracking-wider">
                    SMILES Structure
                    <SortIcon field="smiles" />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left cursor-pointer hover:bg-claude-orange/10 transition-colors"
                  onClick={() => handleSort('Tm_pred')}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-claude-text-secondary uppercase tracking-wider">
                    <Thermometer className="w-4 h-4" />
                    Predicted Tm
                    <SortIcon field="Tm_pred" />
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-claude-text-secondary uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {paginatedData.map((prediction, index) => (
                  <motion.tr
                    key={prediction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    className="border-b border-claude-border/50 hover:bg-claude-orange/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-claude-bg-tertiary text-claude-text font-mono font-bold text-sm">
                        {prediction.id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-claude-text-secondary bg-claude-bg px-3 py-1.5 rounded-lg border border-claude-border text-xs font-mono">
                        {(prediction.smiles || `SMILES_${prediction.id}`).length > 45 
                          ? `${(prediction.smiles || `SMILES_${prediction.id}`).substring(0, 45)}...` 
                          : prediction.smiles || `SMILES_${prediction.id}`}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className={`text-lg font-bold ${predictions.length > 0 ? getTemperatureColor(prediction.Tm_pred) : 'text-claude-text'}`}>
                          {prediction.Tm_pred.toFixed(2)} K
                        </span>
                        <span className="text-claude-text-muted text-sm">
                          {kelvinToCelsius(prediction.Tm_pred).toFixed(1)}°C
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => copyToClipboard(prediction.smiles || `ID:${prediction.id}`, prediction.id)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-claude-border hover:border-claude-orange hover:bg-claude-orange/10 transition-all text-sm text-claude-text-secondary hover:text-claude-orange"
                      >
                        {copiedId === prediction.id ? (
                          <>
                            <Check className="w-4 h-4 text-green-400" />
                            <span className="text-green-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-claude-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-claude-text-secondary text-sm">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredAndSorted.length)} de {filteredAndSorted.length}
          </p>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-claude-border text-claude-text-secondary hover:text-claude-text hover:border-claude-orange hover:bg-claude-orange/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Anterior
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg font-medium transition-all ${
                      currentPage === pageNum 
                        ? 'bg-claude-orange text-white' 
                        : 'border border-claude-border text-claude-text-secondary hover:border-claude-orange'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-claude-border text-claude-text-secondary hover:text-claude-text hover:border-claude-orange hover:bg-claude-orange/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Siguiente
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
