'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Thermometer, ArrowRight, Loader2, AlertCircle, Atom } from 'lucide-react';

// CAMBIO: Importar el servicio de API
import { predictById as fetchPrediction } from '@/lib/api';

interface Prediction {
  id: number;
  smiles?: string;
  Tm_pred: number;
}

export default function PredictById() {
  const [inputId, setInputId] = useState('');
  const [result, setResult] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // CAMBIO: Ahora llama al backend real
  const handlePredict = async () => {
    const id = parseInt(inputId);
    if (isNaN(id) || id < 1) {
      setError('Por favor ingresa un ID válido');
      setResult(null);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // CAMBIO: Llamada real al backend
      const data = await fetchPrediction(id);
      setResult({
        id: data.id,
        Tm_pred: data.Tm_pred,
        smiles: undefined // El backend actual no devuelve SMILES
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass rounded-2xl border border-claude-border overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-claude-orange/20 text-claude-orange">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-claude-text">Predict by ID</h3>
            <p className="text-claude-text-secondary text-sm">
              Conectado al backend FastAPI
            </p>
          </div>
          {/* Indicador de conexión */}
          <div className="ml-auto flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400">Live</span>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <input
            type="number"
            min="1"
            placeholder="Enter ID (e.g., 42)"
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handlePredict()}
            className="flex-1 px-4 py-3 bg-claude-bg border border-claude-border rounded-xl text-claude-text placeholder:text-claude-text-muted focus:border-claude-orange transition-all font-mono"
          />
          <button
            onClick={handlePredict}
            disabled={isLoading || !inputId}
            className="btn-primary px-6 py-3 rounded-xl font-semibold text-white flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Predict <ArrowRight className="w-5 h-5" /></>}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-6"
            >
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="p-6 rounded-xl bg-gradient-to-br from-claude-orange/20 to-claude-orange/5 border border-claude-orange/30"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-claude-text-secondary text-sm mb-1">Molecule ID</p>
                  <p className="text-3xl font-bold text-claude-text">#{result.id}</p>
                </div>
                <div>
                  <p className="text-claude-text-secondary text-sm mb-1 flex items-center gap-2">
                    <Thermometer className="w-4 h-4" /> Predicted Melting Point
                  </p>
                  <p className="text-3xl font-bold text-claude-orange">{result.Tm_pred.toFixed(2)} K</p>
                  <p className="text-claude-text-muted">{(result.Tm_pred - 273.15).toFixed(1)}°C</p>
                </div>
              </div>

              {result.smiles && (
                <div className="mt-6 pt-6 border-t border-claude-orange/20">
                  <p className="text-claude-text-secondary text-sm mb-2 flex items-center gap-2">
                    <Atom className="w-4 h-4" /> SMILES Structure
                  </p>
                  <code className="block p-3 rounded-lg bg-claude-bg text-claude-text font-mono text-sm break-all border border-claude-border">
                    {result.smiles}
                  </code>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}