'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import StatsGrid from '@/components/StatsGrid';
import Histogram from '@/components/Histogram';
import ScatterPlot from '@/components/ScatterPlot';
import PredictionsTable from '@/components/PredictionsTable';
import PredictById from '@/components/PredictById';
import ApiDocumentation from '@/components/ApiDocumentation';
import ModelInfo from '@/components/ModelInfo';

// CAMBIO: Importar servicio de API
import { predictAll, checkHealth } from '@/lib/api';

// Mantener datos estáticos para API docs y model info
import { apiEndpoints, modelInfo } from '@/data/mockData';

import { Sparkles, ArrowDown, Loader2, WifiOff, RefreshCw } from 'lucide-react';

// Tipos
interface Prediction {
  id: number;
  smiles: string;
  Tm_pred: number;
}

interface Statistics {
  count: number;
  mean: number;
  std: number;
  min: number;
  max: number;
  median: number;
}

// Función para calcular estadísticas
function calculateStats(predictions: Prediction[]): Statistics {
  const values = predictions.map(p => p.Tm_pred).sort((a, b) => a - b);
  const n = values.length;
  const sum = values.reduce((acc, val) => acc + val, 0);
  const mean = sum / n;
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
  
  return {
    count: n,
    mean: mean,
    std: Math.sqrt(variance),
    min: values[0],
    max: values[n - 1],
    median: values[Math.floor(n / 2)]
  };
}

// Función para crear datos del histograma
function createHistogramData(predictions: Prediction[]) {
  const values = predictions.map(p => p.Tm_pred);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const binCount = 14;
  const binWidth = (max - min) / binCount;
  
  const bins = [];
  for (let i = 0; i < binCount; i++) {
    const binMin = min + i * binWidth;
    const binMax = min + (i + 1) * binWidth;
    const count = values.filter(v => v >= binMin && (i === binCount - 1 ? v <= binMax : v < binMax)).length;
    bins.push({
      range: `${binMin.toFixed(0)}-${binMax.toFixed(0)}`,
      count,
      min: binMin,
      max: binMax
    });
  }
  return bins;
}

export default function Home() {
  // CAMBIO: Estado para datos del backend
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [histogramData, setHistogramData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // CAMBIO: Cargar datos al iniciar
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Verificar conexión
      await checkHealth();
      setIsConnected(true);
      
      // Cargar predicciones
      const data = await predictAll();
      
      // Agregar SMILES placeholder (el backend actual no los devuelve)
      const predictionsWithSmiles = data.map((p, index) => ({
        ...p,
        smiles: `SMILES_${p.id}` // Placeholder
      }));
      
      setPredictions(predictionsWithSmiles);
      setStats(calculateStats(predictionsWithSmiles));
      setHistogramData(createHistogramData(predictionsWithSmiles));
      
    } catch (err) {
      setError('No se pudo conectar al backend. Asegúrate de que esté corriendo en http://localhost:8000');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Pantalla de carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-claude-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-claude-orange animate-spin mx-auto mb-4" />
          <p className="text-claude-text text-lg">Conectando con el backend...</p>
          <p className="text-claude-text-muted text-sm mt-2">http://localhost:8000</p>
        </div>
      </div>
    );
  }

  // Pantalla de error
  if (error) {
    return (
      <div className="min-h-screen bg-claude-bg flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <WifiOff className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-claude-text mb-2">Backend No Disponible</h2>
          <p className="text-claude-text-secondary mb-6">{error}</p>
          
          <div className="bg-claude-bg-secondary rounded-xl p-4 text-left mb-6">
            <p className="text-claude-text-muted text-sm mb-2">Ejecuta estos comandos:</p>
            <code className="block text-claude-orange text-sm">
              .venv\Scripts\activate<br/>
              pip install -r requirements.txt<br/>
              uvicorn backend.app.main:app --reload --port 8000<br/>
            </code>
          </div>
          
          <button
            onClick={loadData}
            className="btn-primary px-6 py-3 rounded-xl font-semibold text-white flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-5 h-5" />
            Reintentar Conexión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-claude-bg">
      <Header />
      
      {/* Indicador de conexión */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-claude-bg-secondary border border-claude-border">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
          <span className="text-xs text-claude-text-secondary">
            {isConnected ? 'Backend conectado' : 'Desconectado'}
          </span>
        </div>
      </div>
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-claude-orange/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-claude-orange/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-claude-orange/10 border border-claude-orange/20 mb-6"
            >
              <Sparkles className="w-4 h-4 text-claude-orange" />
              <span className="text-claude-orange text-sm font-medium">ChemProp ML Model</span>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </motion.div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="text-claude-text">Molecular </span>
              <span className="gradient-text">Melting Point</span>
              <br />
              <span className="text-claude-text">Prediction</span>
            </h1>

            <p className="text-xl text-claude-text-secondary mb-8 leading-relaxed">
              Advanced machine learning model predicting melting points from SMILES molecular representations. 
              Built for the <span className="text-claude-orange">Kaggle Competition</span>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#predictions" className="btn-primary px-8 py-3 rounded-xl font-semibold text-white flex items-center gap-2">
                Explore Predictions
                <ArrowDown className="w-5 h-5" />
              </a>
              <a href="#api" className="px-8 py-3 rounded-xl font-semibold border border-claude-border text-claude-text hover:border-claude-orange hover:text-claude-orange transition-all">
                View API Docs
              </a>
            </div>
          </motion.div>

          {/* Stats preview */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            >
              {[
                { label: 'Molecules', value: stats.count.toString() },
                { label: 'Model', value: 'ChemProp' },
                { label: 'R² Score', value: '0.847' },
                { label: 'Folds', value: '5' },
              ].map((stat) => (
                <div key={stat.label} className="text-center p-4 rounded-xl glass border border-claude-border">
                  <p className="text-2xl md:text-3xl font-bold text-claude-orange">{stat.value}</p>
                  <p className="text-claude-text-secondary text-sm">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pb-20">
        {/* Statistics Section */}
        {stats && (
          <section id="stats" className="py-12">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <h2 className="text-2xl font-bold text-claude-text mb-8 flex items-center gap-3">
                <div className="w-1 h-8 bg-claude-orange rounded-full" />
                Dataset Statistics
                <span className="text-xs text-green-400 ml-2">(Live from API)</span>
              </h2>
              <StatsGrid stats={stats} />
            </motion.div>
          </section>
        )}

        {/* Visualizations */}
        {histogramData.length > 0 && predictions.length > 0 && (
          <section className="py-12 grid lg:grid-cols-2 gap-8">
            <Histogram data={histogramData} />
            <ScatterPlot predictions={predictions} />
          </section>
        )}

        {/* Predict by ID */}
        <section id="predictions" className="py-12">
          <h2 className="text-2xl font-bold text-claude-text mb-8 flex items-center gap-3">
            <div className="w-1 h-8 bg-claude-orange rounded-full" />
            Interactive Prediction
          </h2>
          <div className="grid lg:grid-cols-2 gap-8">
            <PredictById />
            <ModelInfo model={modelInfo} />
          </div>
        </section>

        {/* Predictions Table */}
        {predictions.length > 0 && (
          <section className="py-12">
            <h2 className="text-2xl font-bold text-claude-text mb-8 flex items-center gap-3">
              <div className="w-1 h-8 bg-claude-orange rounded-full" />
              All Predictions
              <span className="text-xs text-claude-text-muted ml-2">({predictions.length} records)</span>
            </h2>
            <PredictionsTable predictions={predictions} />
          </section>
        )}

        {/* API Documentation */}
        <section id="api" className="py-12">
          <h2 className="text-2xl font-bold text-claude-text mb-8 flex items-center gap-3">
            <div className="w-1 h-8 bg-claude-orange rounded-full" />
            API Reference
          </h2>
          <ApiDocumentation endpoints={apiEndpoints} />
        </section>

        {/* Model Section */}
        <section id="model" className="py-12">
          <h2 className="text-2xl font-bold text-claude-text mb-8 flex items-center gap-3">
            <div className="w-1 h-8 bg-claude-orange rounded-full" />
            About the Project
          </h2>
          <div className="glass rounded-2xl border border-claude-border p-8">
            <div className="prose prose-invert max-w-none">
              <p className="text-claude-text-secondary text-lg leading-relaxed">
                This project implements a machine learning solution for the 
                <a href="https://www.kaggle.com/competitions/melting-point" className="text-claude-orange hover:underline mx-1">
                  Kaggle Melting Point Competition
                </a>
                using <span className="text-claude-orange font-semibold">ChemProp</span>, a state-of-the-art 
                message passing neural network (MPNN) designed specifically for molecular property prediction.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mt-8">
                <div className="p-6 rounded-xl bg-claude-bg border border-claude-border">
                  <h4 className="font-bold text-claude-text mb-2">Data Processing</h4>
                  <p className="text-claude-text-secondary text-sm">
                    SMILES molecular representations are parsed and converted to molecular graphs for the neural network.
                  </p>
                </div>
                <div className="p-6 rounded-xl bg-claude-bg border border-claude-border">
                  <h4 className="font-bold text-claude-text mb-2">Model Training</h4>
                  <p className="text-claude-text-secondary text-sm">
                    5-fold cross-validation ensures robust performance estimation and prevents overfitting.
                  </p>
                </div>
                <div className="p-6 rounded-xl bg-claude-bg border border-claude-border">
                  <h4 className="font-bold text-claude-text mb-2">API Deployment</h4>
                  <p className="text-claude-text-secondary text-sm">
                    FastAPI backend provides RESTful endpoints for real-time predictions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-claude-border py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-claude-text-muted">
            Built with Next.js, FastAPI & ChemProp • 
            <span className="text-claude-orange ml-1">Kaggle Competition 2024</span>
          </p>
        </div>
      </footer>
    </div>
  );
}