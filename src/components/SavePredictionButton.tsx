'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Save, Loader2, Check, X, Star, Sparkles } from 'lucide-react';
import { savePrediction, SavePredictionData } from '@/lib/api';
import { fetchCompoundNameBySmiles } from '@/lib/pubchem';

interface SavePredictionButtonProps {
  smiles: string;
  tmPred: number;
  defaultCompoundName?: string;
}

export default function SavePredictionButton({
  smiles,
  tmPred,
  defaultCompoundName = '',
}: SavePredictionButtonProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearchingName, setIsSearchingName] = useState(false);

  const [formData, setFormData] = useState({
    compound_name: defaultCompoundName,
    notes: '',
    is_favorite: false,
  });

  const handleSearchCompoundName = async () => {
    setIsSearchingName(true);
    setError(null);
    
    try {
      const name = await fetchCompoundNameBySmiles(smiles);
      if (name) {
        setFormData({ ...formData, compound_name: name });
      } else {
        setError('No se encontró el nombre del compuesto en PubChem');
      }
    } catch (err: any) {
      setError('Error al buscar nombre del compuesto');
    } finally {
      setIsSearchingName(false);
    }
  };

  if (!user) {
    return null; // No mostrar si no está autenticado
  }

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const data: SavePredictionData = {
        smiles,
        tm_pred: tmPred,
        compound_name: formData.compound_name || undefined,
        notes: formData.notes || undefined,
        is_favorite: formData.is_favorite,
      };

      await savePrediction(data);
      setSaved(true);
      setTimeout(() => {
        setIsOpen(false);
        setSaved(false);
        setFormData({ compound_name: '', notes: '', is_favorite: false });
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Error al guardar predicción');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Save className="h-4 w-4" />
        Guardar Predicción
      </button>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 space-y-4">
      {saved ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            ¡Predicción Guardada!
          </h3>
          <p className="text-gray-600">
            Puedes verla en "Mis Predicciones"
          </p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              Guardar Predicción
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SMILES
              </label>
              <div className="px-3 py-2 bg-gray-50 rounded-lg font-mono text-sm text-gray-600 break-all">
                {smiles}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Punto de Fusión
              </label>
              <div className="px-3 py-2 bg-blue-50 rounded-lg text-blue-900 font-semibold">
                {(tmPred - 273.15).toFixed(2)}°C ({tmPred.toFixed(2)} K)
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Compuesto (opcional)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={formData.compound_name}
                  onChange={(e) =>
                    setFormData({ ...formData, compound_name: e.target.value })
                  }
                  placeholder="Ej: Aspirina, Etanol..."
                  className="flex-1 px-3 py-2 bg-white border-2 border-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-500"
                />
                <button
                  type="button"
                  onClick={handleSearchCompoundName}
                  disabled={isSearchingName}
                  className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                  title="Buscar nombre automáticamente en PubChem"
                >
                  {isSearchingName ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {isSearchingName ? 'Buscando...' : 'Auto'}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Click en "Auto" para buscar el nombre automáticamente en PubChem
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas (opcional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
                placeholder="Agrega notas sobre este compuesto..."
                maxLength={500}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.notes.length}/500 caracteres
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_favorite"
                checked={formData.is_favorite}
                onChange={(e) =>
                  setFormData({ ...formData, is_favorite: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_favorite" className="text-sm text-gray-700 flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                Marcar como favorito
              </label>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Guardar
                  </>
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                disabled={isSaving}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
