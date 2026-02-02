'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Heart, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  Search, 
  Star,
  Filter,
  Plus,
  Beaker,
  Calendar,
  Thermometer,
  Eye,
  Loader2,
  Sparkles,
} from 'lucide-react';
import {
  getMyPredictions,
  deletePrediction,
  updatePrediction,
  searchPredictionsBySmiles,
  UserPrediction,
  UpdatePredictionData,
} from '@/lib/api';
import { fetchCompoundNameBySmiles } from '@/lib/pubchem';

export default function MyPredictionsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [predictions, setPredictions] = useState<UserPrediction[]>([]);
  const [filteredPredictions, setFilteredPredictions] = useState<UserPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [searchSmiles, setSearchSmiles] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    compound_name: '',
    notes: '',
    is_favorite: false,
  });
  const [isSearchingName, setIsSearchingName] = useState(false);
  const [currentSmiles, setCurrentSmiles] = useState<string>('');
  
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Redirect si no está autenticado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  const loadPredictions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMyPredictions(0, 100, favoritesOnly);
      setPredictions(data);
      setFilteredPredictions(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar predicciones');
      console.error('Error loading predictions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [favoritesOnly]);

  // Cargar predicciones
  useEffect(() => {
    if (user) {
      loadPredictions();
    }
  }, [user, loadPredictions]);

  const handleSearch = async () => {
    if (!searchSmiles.trim()) {
      setFilteredPredictions(predictions);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await searchPredictionsBySmiles(searchSmiles);
      setFilteredPredictions(results);
    } catch (err: any) {
      setError(err.message || 'Error en búsqueda');
    } finally {
      setIsSearching(false);
    }
  };

  const handleEdit = (prediction: UserPrediction) => {
    setEditingId(prediction.id);
    setCurrentSmiles(prediction.smiles);
    setEditForm({
      compound_name: prediction.compound_name || '',
      notes: prediction.notes || '',
      is_favorite: prediction.is_favorite,
    });
  };

  const handleSearchCompoundName = async () => {
    if (!currentSmiles) return;
    
    setIsSearchingName(true);
    try {
      const name = await fetchCompoundNameBySmiles(currentSmiles);
      if (name) {
        setEditForm({ ...editForm, compound_name: name });
      } else {
        setError('No se encontró el nombre del compuesto en PubChem');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err: any) {
      setError('Error al buscar nombre del compuesto');
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsSearchingName(false);
    }
  };

  const handleSaveEdit = async (predictionId: string) => {
    try {
      const updateData: UpdatePredictionData = {
        compound_name: editForm.compound_name || undefined,
        notes: editForm.notes || undefined,
        is_favorite: editForm.is_favorite,
      };
      
      await updatePrediction(predictionId, updateData);
      await loadPredictions();
      setEditingId(null);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({ compound_name: '', notes: '', is_favorite: false });
  };

  const handleToggleFavorite = async (prediction: UserPrediction) => {
    try {
      await updatePrediction(prediction.id, {
        is_favorite: !prediction.is_favorite,
      });
      await loadPredictions();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar favorito');
    }
  };

  const handleDelete = async (predictionId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta predicción?')) {
      return;
    }
    
    setDeletingId(predictionId);
    try {
      await deletePrediction(predictionId);
      await loadPredictions();
    } catch (err: any) {
      setError(err.message || 'Error al eliminar');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Beaker className="h-10 w-10 text-blue-600" />
            Mis Predicciones Guardadas
          </h1>
          <p className="text-gray-600">
            Gestiona tus predicciones de puntos de fusión guardadas
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search by SMILES */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar por SMILES
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchSmiles}
                  onChange={(e) => setSearchSmiles(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Ej: CCO, c1ccccc1"
                  className="flex-1 px-4 py-2 bg-white border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-500"
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSearching ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                  Buscar
                </button>
              </div>
            </div>

            {/* Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtros
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSearchSmiles('');
                    setFilteredPredictions(predictions);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Limpiar búsqueda
                </button>
                <button
                  onClick={() => setFavoritesOnly(!favoritesOnly)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    favoritesOnly
                      ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-400'
                      : 'border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Star className={`h-5 w-5 ${favoritesOnly ? 'fill-yellow-500' : ''}`} />
                  Solo Favoritos
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="mb-6 text-gray-600">
              Mostrando {filteredPredictions.length} de {predictions.length} predicciones
            </div>

            {/* Predictions Grid */}
            {filteredPredictions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <Beaker className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No hay predicciones guardadas
                </h3>
                <p className="text-gray-500">
                  Ve a la página de predicciones para guardar tus primeros resultados
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredPredictions.map((prediction) => (
                  <div
                    key={prediction.id}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
                  >
                    {editingId === prediction.id ? (
                      /* Edit Mode */
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre del Compuesto
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editForm.compound_name}
                              onChange={(e) =>
                                setEditForm({ ...editForm, compound_name: e.target.value })
                              }
                              className="flex-1 px-3 py-2 bg-white border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-500"
                              placeholder="Ej: Aspirina, Etanol..."
                            />
                            <button
                              type="button"
                              onClick={handleSearchCompoundName}
                              disabled={isSearchingName}
                              className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                              title="Buscar nombre automáticamente en PubChem"
                            >
                              {isSearchingName ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Sparkles className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Click en ✨ para buscar automáticamente en PubChem
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notas
                          </label>
                          <textarea
                            value={editForm.notes}
                            onChange={(e) =>
                              setEditForm({ ...editForm, notes: e.target.value })
                            }
                            rows={3}
                            className="w-full px-3 py-2 bg-white border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-500"
                            placeholder="Agrega notas sobre este compuesto..."
                            maxLength={500}
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            {editForm.notes.length}/500 caracteres
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editForm.is_favorite}
                            onChange={(e) =>
                              setEditForm({ ...editForm, is_favorite: e.target.checked })
                            }
                            className="w-4 h-4"
                          />
                          <label className="text-sm text-gray-700">Marcar como favorito</label>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveEdit(prediction.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                          >
                            <Save className="h-4 w-4" />
                            Guardar
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 flex items-center gap-2"
                          >
                            <X className="h-4 w-4" />
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* View Mode */
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            {prediction.compound_name ? (
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {prediction.compound_name}
                              </h3>
                            ) : (
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-base font-medium text-gray-500 italic">
                                  Sin nombre asignado
                                </h3>
                                <button
                                  onClick={() => handleEdit(prediction)}
                                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                                >
                                  Agregar nombre
                                </button>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                              <Calendar className="h-4 w-4" />
                              {formatDate(prediction.created_at)}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleToggleFavorite(prediction)}
                              className={`p-2 rounded-lg transition-colors ${
                                prediction.is_favorite
                                  ? 'text-yellow-500 hover:bg-yellow-50'
                                  : 'text-gray-400 hover:bg-gray-100'
                              }`}
                              title={prediction.is_favorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                            >
                              <Star
                                className={`h-5 w-5 ${
                                  prediction.is_favorite ? 'fill-yellow-500' : ''
                                }`}
                              />
                            </button>
                            <button
                              onClick={() => handleEdit(prediction)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Editar"
                            >
                              <Edit2 className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(prediction.id)}
                              disabled={deletingId === prediction.id}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                              title="Eliminar"
                            >
                              {deletingId === prediction.id ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <Trash2 className="h-5 w-5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-sm text-gray-600 mb-1">SMILES</div>
                            <div className="font-mono text-sm text-gray-900 break-all">
                              {prediction.smiles}
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                              <Thermometer className="h-4 w-4" />
                              Punto de Fusión
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                              {prediction.tm_pred_celsius.toFixed(2)}°C
                            </div>
                            <div className="text-sm text-gray-500">
                              {prediction.tm_pred.toFixed(2)} K
                            </div>
                          </div>
                        </div>

                        {prediction.notes && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <div className="text-sm font-medium text-gray-700 mb-1">Notas:</div>
                            <div className="text-sm text-gray-600 whitespace-pre-wrap">
                              {prediction.notes}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
