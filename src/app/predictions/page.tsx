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
  Download,
  Database,
  FlaskConical,
  User,
  LogIn,
  Sliders,
} from 'lucide-react';
import {
  getAllData,
  predictById,
  checkHealth,
  createCompound,
  deleteCompound,
  validateSmiles,
  getCompoundName,
  getStoredUser,
  DataItem,
  User as UserType,
  kelvinToCelsius,
  MODEL_MAE,
  SOURCE_COLORS,
} from '@/lib/api';
import Link from 'next/link';

type SortField = 'id' | 'Tm_pred' | 'source';
type SortDirection = 'asc' | 'desc';
type SourceFilter = 'all' | 'train' | 'test' | 'user';

// Badge component for source
const SourceBadge = ({ source }: { source: 'train' | 'test' | 'user' }) => {
  const config = {
    train: { label: 'Real', icon: Database, color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    test: { label: 'Predicción', icon: FlaskConical, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
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

export default function PredictionsPage() {
  const [allData, setAllData] = useState<DataItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<DataItem | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newSmiles, setNewSmiles] = useState('');
  const [newName, setNewName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState<{ name: string; tm: number } | null>(null);
  const [isValidatingSmiles, setIsValidatingSmiles] = useState(false);
  const [smilesValidation, setSmilesValidation] = useState<{
    valid: boolean;
    error: string | null;
    canonical: string | null;
    atoms: number | null;
    weight: number | null;
  } | null>(null);
  const [detectedName, setDetectedName] = useState<string | null>(null);

  const [tableSearch, setTableSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [tempRange, setTempRange] = useState<[number, number]>([0, 9999]);
  const [tempRangeEnabled, setTempRangeEnabled] = useState(false);
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | number | null>(null);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const itemsPerPage = 20;

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Check auth
    const user = getStoredUser();
    setCurrentUser(user);

    try {
      await checkHealth();
      setIsConnected(true);

      const data = await getAllData();
      setAllData(data);
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

  // SMILES validation with debounce
  useEffect(() => {
    if (!newSmiles.trim()) {
      setSmilesValidation(null);
      setDetectedName(null);
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

        // Try to get compound name from PubChem
        if (result.valid && result.canonical_smiles) {
          try {
            const nameResult = await getCompoundName(result.canonical_smiles);
            if (nameResult.name !== 'Unknown') {
              setDetectedName(nameResult.name);
            }
          } catch {
            setDetectedName(null);
          }
        }
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

    // Search in local data first
    const found = allData.find(item => item.id === id);
    if (found) {
      setSearchResult(found);
      setIsSearching(false);
      return;
    }

    try {
      const data = await predictById(id);
      setSearchResult({ id: data.id, smiles: data.smiles || '', Tm_pred: data.Tm_pred, source: 'test' });
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Molécula no encontrada');
      setSearchResult(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddCompound = async () => {
    if (!currentUser) {
      setAddError('Debes iniciar sesión para agregar compuestos');
      return;
    }

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
    setAddSuccess(null);

    try {
      const newCompound = await createCompound(newSmiles, newName, currentUser.username);
      // Show success message with prediction
      setAddSuccess({ name: newCompound.name, tm: newCompound.Tm_pred });
      // Refresh data to include new compound from DB
      const data = await getAllData();
      setAllData(data);
      setNewSmiles('');
      setNewName('');
      setSmilesValidation(null);
      setDetectedName(null);
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
      setAllData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  // User's own compounds (from DB, filtered by current user)
  const myCompounds = useMemo(() => {
    if (!currentUser) return [];
    return allData.filter(item => item.source === 'user' && item.created_by === currentUser.username);
  }, [allData, currentUser]);

  const filteredAndSorted = useMemo(() => {
    let result = allData;

    // Filter by source
    if (sourceFilter !== 'all') {
      result = result.filter(item => item.source === sourceFilter);
    }

    // Filter by temperature range
    if (tempRangeEnabled) {
      result = result.filter(item => item.Tm_pred >= tempRange[0] && item.Tm_pred <= tempRange[1]);
    }

    // Filter by search
    if (tableSearch.trim()) {
      const search = tableSearch.toLowerCase();
      result = result.filter(item =>
        item.id.toString().includes(search) ||
        item.smiles.toLowerCase().includes(search) ||
        item.Tm_pred.toFixed(2).includes(search) ||
        (item.name && item.name.toLowerCase().includes(search))
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'id') {
        comparison = String(a.id).localeCompare(String(b.id), undefined, { numeric: true });
      } else if (sortField === 'Tm_pred') {
        comparison = a.Tm_pred - b.Tm_pred;
      } else if (sortField === 'source') {
        comparison = a.source.localeCompare(b.source);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [allData, tableSearch, sourceFilter, tempRange, tempRangeEnabled, sortField, sortDirection]);

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

  const copyToClipboard = async (text: string, id: string | number) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Nombre', 'SMILES', 'Tm (K)', 'Tm (°C)', 'Fuente'];
    const rows = filteredAndSorted.map(item => {
      return [
        item.id,
        `"${item.name || ''}"`,
        `"${item.smiles}"`,
        item.Tm_pred.toFixed(2),
        kelvinToCelsius(item.Tm_pred).toFixed(2),
        item.source
      ];
    });

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'melting_points_export.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4 opacity-40" />;
    return sortDirection === 'asc'
      ? <ChevronUp className="w-4 h-4 text-claude-orange" />
      : <ChevronDown className="w-4 h-4 text-claude-orange" />;
  };

  // Data bounds for range slider
  const dataBounds = useMemo(() => {
    if (allData.length === 0) return { min: 0, max: 1000 };
    const temps = allData.map(d => d.Tm_pred);
    return { min: Math.floor(Math.min(...temps)), max: Math.ceil(Math.max(...temps)) };
  }, [allData]);

  // Initialize range when data loads
  useEffect(() => {
    if (allData.length > 0 && tempRange[0] === 0 && tempRange[1] === 9999) {
      setTempRange([dataBounds.min, dataBounds.max]);
    }
  }, [allData.length, dataBounds]);

  // Stats by source
  const stats = useMemo(() => {
    const train = allData.filter(d => d.source === 'train').length;
    const test = allData.filter(d => d.source === 'test').length;
    const user = allData.filter(d => d.source === 'user').length;
    return { train, test, user, total: train + test + user };
  }, [allData]);

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
          <p className="text-claude-text-secondary mt-1">Sistema de toma de decisiones para puntos de fusión</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass rounded-xl p-4 border border-claude-border">
            <p className="text-claude-text-muted text-sm">Total</p>
            <p className="text-2xl font-bold text-claude-text">{stats.total.toLocaleString()}</p>
          </div>
          <div className="glass rounded-xl p-4 border border-emerald-500/30">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <p className="text-emerald-400 text-sm">Train (Real)</p>
            </div>
            <p className="text-2xl font-bold text-emerald-400">{stats.train.toLocaleString()}</p>
          </div>
          <div className="glass rounded-xl p-4 border border-blue-500/30">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-blue-400" />
              <p className="text-blue-400 text-sm">Test (Predicción)</p>
            </div>
            <p className="text-2xl font-bold text-blue-400">{stats.test.toLocaleString()}</p>
          </div>
          <div className="glass rounded-xl p-4 border border-orange-500/30">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-orange-400" />
              <p className="text-orange-400 text-sm">Usuario</p>
            </div>
            <p className="text-2xl font-bold text-orange-400">{stats.user.toLocaleString()}</p>
          </div>
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
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-claude-text-muted text-sm">ID #{searchResult.id}</p>
                      <SourceBadge source={searchResult.source} />
                    </div>
                    <p className="text-2xl font-bold text-claude-orange">{searchResult.Tm_pred.toFixed(2)} K</p>
                    <p className="text-claude-text-secondary">{kelvinToCelsius(searchResult.Tm_pred).toFixed(1)}°C</p>
                    {searchResult.smiles && (
                      <code className="text-xs text-claude-text-muted font-mono block mt-2 max-w-md truncate">{searchResult.smiles}</code>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-claude-text-muted">
                      {searchResult.source === 'train' ? 'Valor real' : 'Incertidumbre'}
                    </p>
                    <p className="text-claude-orange font-medium">
                      {searchResult.source === 'train' ? 'Medido' : `±${MODEL_MAE.toFixed(1)} K`}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Add Compound */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400"><Beaker className="w-5 h-5" /></div>
              <div>
                <h2 className="text-lg font-bold text-claude-text">Agregar Compuesto</h2>
                <p className="text-claude-text-muted text-xs">
                  {currentUser ? (
                    <><span className="text-orange-400">{currentUser.username}</span> &bull; {myCompounds.length} compuestos</>
                  ) : (
                    'Inicia sesión para agregar compuestos'
                  )}
                </p>
              </div>
            </div>
            {currentUser ? (
              <button onClick={() => setShowAddForm(!showAddForm)} className="px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 font-semibold hover:bg-orange-500/20 transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" />{showAddForm ? 'Cerrar' : 'Nuevo'}
              </button>
            ) : (
              <Link href="/login" className="px-4 py-2 rounded-xl bg-claude-orange/10 border border-claude-orange/30 text-claude-orange font-semibold hover:bg-claude-orange/20 transition-all flex items-center gap-2">
                <LogIn className="w-4 h-4" />Iniciar sesión
              </Link>
            )}
          </div>

          <AnimatePresence>
            {showAddForm && currentUser && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-4 rounded-xl bg-claude-bg border border-claude-border overflow-hidden">
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-claude-text-muted text-sm mb-1 block">Nombre</label>
                    <input type="text" placeholder="Ej: Aspirina" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-4 py-2.5 bg-claude-bg-secondary border border-claude-border rounded-xl text-claude-text placeholder:text-claude-text-muted focus:border-orange-400 transition-all" />
                    {detectedName && !newName && (
                      <button onClick={() => setNewName(detectedName)} className="text-xs text-orange-400 mt-1 hover:underline">
                        Usar nombre detectado: {detectedName}
                      </button>
                    )}
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

                <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 mb-4">
                  <Info className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-claude-text-secondary">Incertidumbre del modelo: <span className="text-orange-400 font-semibold">±{MODEL_MAE.toFixed(1)} K</span> (MAE combinado)</p>
                </div>

                <div className="flex gap-3">
                  <button onClick={handleAddCompound} disabled={isAdding || (smilesValidation !== null && !smilesValidation.valid)} className="px-4 py-2 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:opacity-50 flex items-center gap-2">
                    {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}Guardar
                  </button>
                  <button onClick={() => { setShowAddForm(false); setAddError(null); setNewSmiles(''); setNewName(''); setSmilesValidation(null); setDetectedName(null); }} className="px-4 py-2 rounded-xl border border-claude-border text-claude-text-secondary hover:text-claude-text">Cancelar</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success message after adding */}
          {addSuccess && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 mt-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-emerald-400 font-semibold">Compuesto agregado exitosamente</p>
                <p className="text-claude-text-secondary text-sm">
                  <span className="text-claude-text font-medium">{addSuccess.name}</span> — Punto de fusión predicho: <span className="text-orange-400 font-bold">{addSuccess.tm.toFixed(2)} K</span> ({kelvinToCelsius(addSuccess.tm).toFixed(1)}°C) ± {MODEL_MAE.toFixed(1)} K
                </p>
              </div>
              <button onClick={() => setAddSuccess(null)} className="ml-auto text-claude-text-muted hover:text-claude-text">
                <XCircle className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* User compounds list (only current user's compounds from DB) */}
          {currentUser && myCompounds.length > 0 && (
            <div className="space-y-2 mt-4">
              {myCompounds.map((compound) => (
                <div key={compound.id} className="flex items-center justify-between p-3 rounded-xl bg-claude-bg border border-claude-border">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs text-claude-text-muted font-mono">{compound.id}</span>
                      <span className="font-semibold text-claude-text">{compound.name || '-'}</span>
                      <span className="text-orange-400 font-bold">{compound.Tm_pred.toFixed(2)} K</span>
                      <SourceBadge source="user" />
                    </div>
                    <code className="text-xs text-claude-text-muted font-mono truncate block mt-1">{compound.smiles}</code>
                  </div>
                  <button onClick={() => handleDeleteCompound(String(compound.id))} className="p-2 rounded-lg text-claude-text-muted hover:text-red-400 hover:bg-red-400/10 ml-2"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Data Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass rounded-2xl border border-claude-border overflow-hidden">
          <div className="p-6 border-b border-claude-border">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-claude-text flex items-center gap-2"><Beaker className="w-5 h-5 text-claude-orange" />Todos los Datos</h2>
                <p className="text-claude-text-secondary text-sm mt-1">{filteredAndSorted.length.toLocaleString()} compuestos</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Source filter */}
                <div className="flex rounded-xl overflow-hidden border border-claude-border">
                  {(['all', 'train', 'test', 'user'] as SourceFilter[]).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => { setSourceFilter(filter); setCurrentPage(1); }}
                      className={`px-3 py-1.5 text-sm transition-colors ${
                        sourceFilter === filter
                          ? filter === 'train' ? 'bg-emerald-500/20 text-emerald-400'
                            : filter === 'test' ? 'bg-blue-500/20 text-blue-400'
                              : filter === 'user' ? 'bg-orange-500/20 text-orange-400'
                                : 'bg-claude-orange/20 text-claude-orange'
                          : 'text-claude-text-secondary hover:text-claude-text hover:bg-claude-bg-secondary'
                      }`}
                    >
                      {filter === 'all' ? 'Todos' : filter === 'train' ? 'Train' : filter === 'test' ? 'Test' : 'User'}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-claude-text-muted" />
                  <input type="text" placeholder="Filtrar..." value={tableSearch} onChange={(e) => { setTableSearch(e.target.value); setCurrentPage(1); }} className="w-40 pl-9 pr-3 py-1.5 bg-claude-bg border border-claude-border rounded-xl text-sm text-claude-text placeholder:text-claude-text-muted focus:border-claude-orange transition-all" />
                </div>

                {/* Export */}
                <button onClick={exportToCSV} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-claude-border text-claude-text-secondary hover:text-claude-orange hover:border-claude-orange transition-all text-sm">
                  <Download className="w-4 h-4" />CSV
                </button>
              </div>
            </div>

            {/* Temperature Range Filter */}
            <div className="mt-4 pt-4 border-t border-claude-border/50">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => { setTempRangeEnabled(!tempRangeEnabled); setCurrentPage(1); }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium transition-all ${
                    tempRangeEnabled
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'border-claude-border text-claude-text-secondary hover:text-claude-text hover:border-claude-border'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  Rango de Tm
                </button>

                {tempRangeEnabled && (
                  <span className="text-emerald-400 font-bold text-sm">
                    {filteredAndSorted.length.toLocaleString()} compuestos
                    <span className="text-claude-text-muted font-normal ml-1">
                      ({allData.length > 0 ? ((filteredAndSorted.length / allData.length) * 100).toFixed(1) : 0}%)
                    </span>
                  </span>
                )}
              </div>

              {tempRangeEnabled && (
                <div className="space-y-3">
                  {/* Slider */}
                  <div className="px-2 pt-2 pb-1">
                    <div className="range-slider">
                      <div
                        className="range-track"
                        style={{
                          left: `${((tempRange[0] - dataBounds.min) / (dataBounds.max - dataBounds.min)) * 100}%`,
                          right: `${100 - ((tempRange[1] - dataBounds.min) / (dataBounds.max - dataBounds.min)) * 100}%`,
                        }}
                      />
                      <input
                        type="range"
                        min={dataBounds.min}
                        max={dataBounds.max}
                        step={1}
                        value={tempRange[0]}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (val <= tempRange[1]) {
                            setTempRange([val, tempRange[1]]);
                            setCurrentPage(1);
                          }
                        }}
                      />
                      <input
                        type="range"
                        min={dataBounds.min}
                        max={dataBounds.max}
                        step={1}
                        value={tempRange[1]}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          if (val >= tempRange[0]) {
                            setTempRange([tempRange[0], val]);
                            setCurrentPage(1);
                          }
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-claude-text-muted">{dataBounds.min} K</span>
                      <span className="text-[10px] text-claude-text-muted">{dataBounds.max} K</span>
                    </div>
                  </div>

                  {/* Inputs */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="number"
                        min={dataBounds.min}
                        max={tempRange[1]}
                        value={tempRange[0]}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setTempRange([val, Math.max(val, tempRange[1])]);
                          setCurrentPage(1);
                        }}
                        className="w-full px-3 py-1.5 bg-claude-bg border border-claude-border rounded-xl text-sm text-claude-text text-center focus:border-emerald-400 transition-all"
                        placeholder="Min"
                      />
                      <span className="text-[10px] text-claude-text-muted block text-center mt-0.5">Min (K)</span>
                    </div>
                    <span className="text-claude-text-muted text-lg">–</span>
                    <div className="flex-1">
                      <input
                        type="number"
                        min={tempRange[0]}
                        max={dataBounds.max}
                        value={tempRange[1]}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setTempRange([Math.min(tempRange[0], val), val]);
                          setCurrentPage(1);
                        }}
                        className="w-full px-3 py-1.5 bg-claude-bg border border-claude-border rounded-xl text-sm text-claude-text text-center focus:border-emerald-400 transition-all"
                        placeholder="Max"
                      />
                      <span className="text-[10px] text-claude-text-muted block text-center mt-0.5">Max (K)</span>
                    </div>
                    <button
                      onClick={() => { setTempRange([dataBounds.min, dataBounds.max]); setCurrentPage(1); }}
                      className="px-2 py-1.5 rounded-xl border border-claude-border text-claude-text-muted hover:text-claude-text hover:border-claude-border text-xs transition-all"
                      title="Resetear rango"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[70px]" />
                <col className="w-[30%]" />
                <col />
                <col className="w-[170px]" />
                <col className="w-[110px]" />
                <col className="w-[70px]" />
              </colgroup>
              <thead>
                <tr className="border-b border-claude-border bg-claude-bg-secondary/50">
                  <th className="px-3 py-3 text-left cursor-pointer hover:bg-claude-orange/10" onClick={() => handleSort('id')}>
                    <div className="flex items-center gap-1 text-xs font-semibold text-claude-text-secondary uppercase">ID <SortIcon field="id" /></div>
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-claude-text-secondary uppercase">Nombre</th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-claude-text-secondary uppercase">SMILES</th>
                  <th className="px-3 py-3 text-left cursor-pointer hover:bg-claude-orange/10" onClick={() => handleSort('Tm_pred')}>
                    <div className="flex items-center gap-1 text-xs font-semibold text-claude-text-secondary uppercase whitespace-nowrap"><Thermometer className="w-4 h-4" />Tm <SortIcon field="Tm_pred" /></div>
                  </th>
                  <th className="px-3 py-3 text-left cursor-pointer hover:bg-claude-orange/10" onClick={() => handleSort('source')}>
                    <div className="flex items-center gap-1 text-xs font-semibold text-claude-text-secondary uppercase">Fuente <SortIcon field="source" /></div>
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-claude-text-secondary uppercase">Acc.</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {paginatedData.map((item, index) => (
                    <motion.tr key={`${item.source}-${item.id}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1, delay: index * 0.01 }} className="border-b border-claude-border/50 hover:bg-claude-orange/5">
                      <td className="px-3 py-3"><span className="px-2 py-1 rounded-lg bg-claude-bg-tertiary text-claude-text font-mono text-sm">{item.id}</span></td>
                      <td className="px-3 py-3">
                        <span className={`text-sm truncate block ${item.name ? 'text-claude-text' : 'text-claude-text-muted'}`} title={item.name || ''}>
                          {item.name || '-'}
                        </span>
                        {item.source === 'user' && item.created_by && (
                          <span className="text-[11px] text-orange-400/70 truncate block">por {item.created_by}</span>
                        )}
                      </td>
                      <td className="px-3 py-3"><code className="text-xs text-claude-text-muted font-mono truncate block" title={item.smiles}>{item.smiles || '-'}</code></td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="font-bold" style={{ color: SOURCE_COLORS[item.source] }}>{item.Tm_pred.toFixed(2)} K</span>
                        <span className="text-claude-text-muted text-xs ml-1">({kelvinToCelsius(item.Tm_pred).toFixed(1)}°C)</span>
                      </td>
                      <td className="px-3 py-3"><SourceBadge source={item.source} /></td>
                      <td className="px-3 py-3 text-center">
                        <button onClick={() => copyToClipboard(`${item.smiles}\t${item.Tm_pred.toFixed(2)}`, item.id)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-claude-border hover:border-claude-orange hover:text-claude-orange text-xs text-claude-text-secondary">
                          {copiedId === item.id ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-claude-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-claude-text-secondary text-sm">Mostrando {Math.min(((currentPage - 1) * itemsPerPage) + 1, filteredAndSorted.length)} a {Math.min(currentPage * itemsPerPage, filteredAndSorted.length)} de {filteredAndSorted.length.toLocaleString()}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="px-2 py-1 rounded-lg border border-claude-border text-claude-text-secondary hover:border-claude-orange disabled:opacity-40 text-sm">«</button>
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded-lg border border-claude-border text-claude-text-secondary hover:border-claude-orange disabled:opacity-40 text-sm">Anterior</button>
              <span className="px-3 py-1 text-claude-text-secondary text-sm">{currentPage} / {totalPages || 1}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 rounded-lg border border-claude-border text-claude-text-secondary hover:border-claude-orange disabled:opacity-40 text-sm">Siguiente</button>
              <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages || totalPages === 0} className="px-2 py-1 rounded-lg border border-claude-border text-claude-text-secondary hover:border-claude-orange disabled:opacity-40 text-sm">»</button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
