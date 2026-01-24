'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Loader2, 
  WifiOff, 
  RefreshCw,
  Thermometer,
  ArrowRight,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Copy,
  Check,
  Beaker,
  Filter,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Info,
} from 'lucide-react';
import { 
  predictAll, 
  predictById, 
  checkHealth, 
  getPredictionsRange,
  getCompounds,
  createCompound,
  deleteCompound,
  validateSmiles,
  Prediction,
  Compound,
  kelvinToCelsius,
  MODEL_MAE,
} from '@/lib/api';

type SortField = 'id' | 'Tm_pred';
type SortDirection = 'asc' | 'desc';

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [compounds, setCompounds] = useState<Compound[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<Prediction | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const [minTm, setMinTm] = useState<number>(100);
  const [maxTm, setMaxTm] = useState<number>(600);
  const [isFilteringRange, setIsFilteringRange] = useState(false);
  const [rangeFilterActive, setRangeFilterActive] = useState(false);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSmiles, setNewSmiles] = useState('');
  const [newName, setNewName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [isValidatingSmiles, setIsValidatingSmiles] = useState(false);
  const [smilesValidation, setSmilesValidation] = useState<{
    valid: boolean;
    error: string | null;
    canonical: string | null;
    atoms: number | null;
    weight: number | null;
  } | null>(null);
  
  const [tableSearch, setTableSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const itemsPerPage = 15;

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await checkHealth();
      setIsConnected(true);
      
      const predsData = await predictAll();
      setPredictions(predsData);
      
      try {
        const compoundsResponse = await getCompounds();
        setCompounds(compoundsResponse.compounds || []);
      } catch {
        setCompounds([]);
      }
      
      if (predsData.length > 0) {
        const temps = predsData.map(p => p.Tm_pred);
        setMinTm(Math.floor(Math.min(...temps)));
        setMaxTm(Math.ceil(Math.max(...temps)));
      }
    } catch {
      setError('No se pudo conectar al backend');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!newSmiles.trim()) {
      setSmilesValidation(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsValidatingSmiles(true);
      try {
        const result = await validateSmiles(newSmiles);
        setSmilesValidation({
          valid: result.valid,
          error: result.error,
          canonical: result.canonical_smiles,
          atoms: result.num_atoms,
          weight: result.molecular_weight,
        });
      } catch {
        setSmilesValidation({
          valid: false,
          error: 'Error al validar SMILES',
          canonical: null,
          atoms: null,
          weight: null,
        });
      } finally {
        setIsValidatingSmiles(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [newSmiles]);

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
      setSearchError(err instanceof Error ? err.message : 'Molécula no encontrada');
      setSearchResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleRangeFilter = async () => {
    setIsFilteringRange(true);
    try {
      const response = await getPredictionsRange(minTm, maxTm);
      setPredictions(response.predictions);
      setRangeFilterActive(true);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error filtering:', err);
    } finally {
      setIsFilteringRange(false);
    }
  };

  const clearRangeFilter = async () => {
    setIsFilteringRange(true);
    try {
      const all = await predictAll();
      setPredictions(all);
      setRangeFilterActive(false);
      setCurrentPage(1);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsFilteringRange(false);
    }
  };

  const handleAddCompound = async () => {
    if (!newSmiles.trim() || !newName.trim()) {
      setAddError('SMILES y nombre son requeridos');
      return;
    }

    if (smilesValidation && !smilesValidation.valid) {
      setAddError(`SMILES inválido: ${smilesValidation.error}`);
      return;
    }
    
    setIsAdding(true);
    setAddError(null);
    
    try {
      const newCompound = await createCompound(newSmiles, newName);
      setCompounds(prev => [...prev, newCompound]);
      setNewSmiles('');
      setNewName('');
      setSmilesValidation(null);
      setShowAddForm(false);
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Error al agregar');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteCompound = async (id: string) => {
    try {
      await deleteCompound(id);
      setCompounds(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const filteredAndSorted = useMemo(() => {
    let result = predictions.filter(p => 
      p.id.toString().includes(tableSearch) ||
      p.Tm_pred.toFixed(2).includes(tableSearch)
    );

    result.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'id') comparison = a.id - b.id;
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

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-claude-orange animate-spin mb-4" />
          <p className="text-claude-text-secondary">Cargando predicciones...</p>
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
            <RefreshCw className="w-5 h-5" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-claude-text">Predicciones</h1>
          <p className="text-claude-text-secondary mt-1">Explorar y buscar predicciones de punto de fusión</p>
        </motion.div>

        {/* Search by ID */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6 border border-claude-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-claude-orange/20 text-claude-orange"><Search className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold text-claude-text">Buscar por ID</h2>
          </div>
          
          <div className="flex gap-3 mb-4">
            <input type="number" min="1" placeholder="ID de molécula (ej: 42)" value={searchId} onChange={(e) => setSearchId(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSearchById()} className="flex-1 px-4 py-2.5 bg-claude-bg border border-claude-border rounded-xl text-claude-text placeholder:text-claude-text-muted focus:border-claude-orange transition-all font-mono" />
            <button onClick={handleSearchById} disabled={isSearching || !searchId} className="btn-primary px-6 py-2.5 rounded-xl font-semibold text-white flex items-center gap-2 disabled:opacity-50">
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Buscar <ArrowRight className="w-5 h-5" /></>}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {searchError && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-4">
                <AlertCircle className="w-5 h-5 text-red-400" /><p className="text-red-400">{searchError}</p>
              </motion.div>
            )}
            {searchResult && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4 rounded-xl bg-gradient-to-r from-claude-orange/20 to-claude-orange/5 border border-claude-orange/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-claude-text-muted text-sm">Molécula #{searchResult.id}</p>
                    <p className="text-2xl font-bold text-claude-orange">{searchResult.Tm_pred.toFixed(2)} K</p>
                    <p className="text-claude-text-secondary">{kelvinToCelsius(searchResult.Tm_pred).toFixed(1)}°C</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-claude-text-muted">Incertidumbre</p>
                    <p className="text-claude-orange font-medium">±{MODEL_MAE.toFixed(1)} K</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Range Filter */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6 border border-claude-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400"><Filter className="w-5 h-5" /></div>
            <h2 className="text-lg font-bold text-claude-text">Filtrar por Rango</h2>
            {rangeFilterActive && <span className="ml-auto px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">Filtro activo</span>}
          </div>
          
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="text-claude-text-muted text-sm mb-1 block">Mín (K)</label>
              <input type="number" value={minTm} onChange={(e) => setMinTm(Number(e.target.value))} className="w-28 px-3 py-2 bg-claude-bg border border-claude-border rounded-xl text-claude-text focus:border-claude-orange transition-all" />
            </div>
            <div>
              <label className="text-claude-text-muted text-sm mb-1 block">Máx (K)</label>
              <input type="number" value={maxTm} onChange={(e) => setMaxTm(Number(e.target.value))} className="w-28 px-3 py-2 bg-claude-bg border border-claude-border rounded-xl text-claude-text focus:border-claude-orange transition-all" />
            </div>
            <button onClick={handleRangeFilter} disabled={isFilteringRange} className="px-4 py-2 rounded-xl bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center gap-2">
              {isFilteringRange ? <Loader2 className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}Aplicar
            </button>
            {rangeFilterActive && <button onClick={clearRangeFilter} className="px-4 py-2 rounded-xl border border-claude-border text-claude-text-secondary hover:text-claude-text transition-all">Limpiar</button>}
          </div>
        </motion.div>

        {/* User Compounds */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl p-6 border border-emerald-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400"><Beaker className="w-5 h-5" /></div>
              <div>
                <h2 className="text-lg font-bold text-claude-text">Mis Compuestos</h2>
                <p className="text-claude-text-muted text-xs">{compounds.length} compuestos agregados</p>
              </div>
            </div>
            <button onClick={() => setShowAddForm(!showAddForm)} className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold hover:bg-emerald-500/20 transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" />Agregar
            </button>
          </div>

          <AnimatePresence>
            {showAddForm && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 p-4 rounded-xl bg-claude-bg border border-claude-border overflow-hidden">
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-claude-text-muted text-sm mb-1 block">Nombre</label>
                    <input type="text" placeholder="Ej: Aspirina" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-4 py-2.5 bg-claude-bg-secondary border border-claude-border rounded-xl text-claude-text placeholder:text-claude-text-muted focus:border-emerald-400 transition-all" />
                  </div>
                  <div>
                    <label className="text-claude-text-muted text-sm mb-1 block">SMILES {isValidatingSmiles && <Loader2 className="w-3 h-3 inline ml-2 animate-spin" />}</label>
                    <div className="relative">
                      <input type="text" placeholder="Ej: CC(=O)OC1=CC=CC=C1C(=O)O" value={newSmiles} onChange={(e) => setNewSmiles(e.target.value)} className={`w-full px-4 py-2.5 pr-10 bg-claude-bg-secondary border rounded-xl text-claude-text font-mono text-sm placeholder:text-claude-text-muted transition-all ${smilesValidation ? smilesValidation.valid ? 'border-emerald-500' : 'border-red-500' : 'border-claude-border'}`} />
                      {smilesValidation && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {smilesValidation.valid ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
                        </div>
                      )}
                    </div>
                    {smilesValidation && (
                      <div className={`mt-2 text-xs ${smilesValidation.valid ? 'text-emerald-400' : 'text-red-400'}`}>
                        {smilesValidation.valid ? (
                          <span>✓ Válido • {smilesValidation.atoms} átomos • {smilesValidation.weight?.toFixed(1)} g/mol</span>
                        ) : (
                          <span>✗ {smilesValidation.error}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {addError && <p className="text-red-400 text-sm mb-3">{addError}</p>}
                
                <div className="flex items-start gap-2 p-3 rounded-lg bg-claude-orange/10 border border-claude-orange/20 mb-4">
                  <Info className="w-4 h-4 text-claude-orange flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-claude-text-secondary">Incertidumbre: <span className="text-claude-orange font-semibold">±{MODEL_MAE.toFixed(1)} K</span></p>
                </div>
                
                <div className="flex gap-3">
                  <button onClick={handleAddCompound} disabled={isAdding || (smilesValidation !== null && !smilesValidation.valid)} className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 disabled:opacity-50 flex items-center gap-2">
                    {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}Guardar
                  </button>
                  <button onClick={() => { setShowAddForm(false); setAddError(null); setNewSmiles(''); setNewName(''); setSmilesValidation(null); }} className="px-4 py-2 rounded-xl border border-claude-border text-claude-text-secondary hover:text-claude-text">Cancelar</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {compounds.length > 0 && (
            <div className="space-y-2">
              {compounds.map((compound) => (
                <div key={compound.id} className="flex items-center justify-between p-3 rounded-xl bg-claude-bg border border-claude-border">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs text-claude-text-muted font-mono">{compound.id}</span>
                      <span className="font-semibold text-claude-text">{compound.name}</span>
                      <span className="text-claude-orange font-bold">{compound.Tm_pred.toFixed(2)} K</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-claude-orange/10 text-claude-orange">{compound.uncertainty || `±${MODEL_MAE.toFixed(0)} K`}</span>
                    </div>
                    <code className="text-xs text-claude-text-muted font-mono truncate block mt-1">{compound.smiles}</code>
                  </div>
                  <button onClick={() => handleDeleteCompound(compound.id)} className="p-2 rounded-lg text-claude-text-muted hover:text-red-400 hover:bg-red-400/10 ml-2"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
          {compounds.length === 0 && !showAddForm && <p className="text-claude-text-muted text-sm text-center py-4">No hay compuestos agregados. Haz clic en "Agregar" para crear uno.</p>}
        </motion.div>

        {/* Predictions Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-2xl border border-claude-border overflow-hidden">
          <div className="p-6 border-b border-claude-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-claude-text flex items-center gap-2"><Beaker className="w-5 h-5 text-claude-orange" />Todas las Predicciones</h2>
                <p className="text-claude-text-secondary text-sm mt-1">{filteredAndSorted.length.toLocaleString()} moléculas</p>
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-claude-text-muted" />
                <input type="text" placeholder="Filtrar por ID o Tm..." value={tableSearch} onChange={(e) => { setTableSearch(e.target.value); setCurrentPage(1); }} className="w-full sm:w-64 pl-10 pr-4 py-2.5 bg-claude-bg border border-claude-border rounded-xl text-claude-text placeholder:text-claude-text-muted focus:border-claude-orange transition-all" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-claude-border bg-claude-orange/5">
                  <th className="px-6 py-4 text-left cursor-pointer hover:bg-claude-orange/10" onClick={() => handleSort('id')}>
                    <div className="flex items-center gap-2 text-xs font-semibold text-claude-text-secondary uppercase">ID <SortIcon field="id" /></div>
                  </th>
                  <th className="px-6 py-4 text-left cursor-pointer hover:bg-claude-orange/10" onClick={() => handleSort('Tm_pred')}>
                    <div className="flex items-center gap-2 text-xs font-semibold text-claude-text-secondary uppercase"><Thermometer className="w-4 h-4" />Punto de Fusión <SortIcon field="Tm_pred" /></div>
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-claude-text-secondary uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {paginatedData.map((prediction, index) => (
                    <motion.tr key={prediction.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1, delay: index * 0.01 }} className="border-b border-claude-border/50 hover:bg-claude-orange/5">
                      <td className="px-6 py-4"><span className="px-3 py-1.5 rounded-lg bg-claude-bg-tertiary text-claude-text font-mono text-sm font-bold">{prediction.id}</span></td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold text-claude-orange">{prediction.Tm_pred.toFixed(2)} K</span>
                          <span className="text-claude-text-muted text-sm">({kelvinToCelsius(prediction.Tm_pred).toFixed(1)}°C)</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => copyToClipboard(`ID: ${prediction.id}, Tm: ${prediction.Tm_pred.toFixed(2)} K`, prediction.id)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-claude-border hover:border-claude-orange hover:text-claude-orange text-sm text-claude-text-secondary">
                          {copiedId === prediction.id ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedId === prediction.id ? 'Copiado' : 'Copiar'}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-claude-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-claude-text-secondary text-sm">Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredAndSorted.length)} de {filteredAndSorted.length.toLocaleString()}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 rounded-lg border border-claude-border text-claude-text-secondary hover:border-claude-orange disabled:opacity-40 text-sm">Anterior</button>
              <span className="px-3 py-1.5 text-claude-text-secondary text-sm">{currentPage} / {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1.5 rounded-lg border border-claude-border text-claude-text-secondary hover:border-claude-orange disabled:opacity-40 text-sm">Siguiente</button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
