'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Server, 
  Code, 
  Copy, 
  Check, 
  ChevronRight,
  Terminal,
  ExternalLink,
  Play,
  Zap
} from 'lucide-react';

interface Endpoint {
  name: string;
  method: 'GET' | 'POST' | 'DELETE';
  endpoint: string;
  description: string;
  requestBody?: string;
  responseExample: string;
  params?: { name: string; type: string; description: string }[];
}

const endpoints: Endpoint[] = [
  {
    name: 'Health Check',
    method: 'GET',
    endpoint: '/health',
    description: 'Verifica el estado del servidor y la disponibilidad del modelo ML',
    responseExample: `{
  "status": "healthy",
  "model_loaded": true,
  "dataset_loaded": true,
  "timestamp": "2024-01-15T10:30:00Z"
}`,
  },
  {
    name: 'Get Statistics',
    method: 'GET',
    endpoint: '/stats',
    description: 'Obtiene estadísticas descriptivas del dataset de predicciones',
    responseExample: `{
  "count": 831,
  "mean": 275.89,
  "std": 78.45,
  "min": 88.15,
  "max": 632.50,
  "median": 268.32
}`,
  },
  {
    name: 'Predict All',
    method: 'GET',
    endpoint: '/predict-all',
    description: 'Obtiene todas las predicciones del dataset de test',
    responseExample: `[
  {"id": 1, "smiles": "CC(=O)O", "Tm_pred": 289.5},
  {"id": 2, "smiles": "CCO", "Tm_pred": 156.2},
  ...
]`,
  },
  {
    name: 'Predict by ID',
    method: 'GET',
    endpoint: '/predict/{id}',
    description: 'Obtiene la predicción de una molécula específica por su ID',
    params: [
      { name: 'id', type: 'integer', description: 'ID de la molécula (1-831)' }
    ],
    responseExample: `{
  "id": 42,
  "smiles": "CC(C)CC1=CC=C(C=C1)C(C)C(=O)O",
  "Tm_pred": 347.25,
  "Tm_celsius": 74.10
}`,
  },
  {
    name: 'Get Histogram',
    method: 'GET',
    endpoint: '/histogram',
    description: 'Obtiene datos para el histograma de distribución de Tm',
    params: [
      { name: 'bins', type: 'integer', description: 'Número de bins (default: 14)' }
    ],
    responseExample: `[
  {"range": "88-127", "count": 45, "min": 88, "max": 127},
  {"range": "127-166", "count": 78, "min": 127, "max": 166},
  ...
]`,
  },
  {
    name: 'Filter by Range',
    method: 'GET',
    endpoint: '/filter/range',
    description: 'Filtra predicciones por rango de temperatura',
    params: [
      { name: 'min_tm', type: 'float', description: 'Temperatura mínima en Kelvin' },
      { name: 'max_tm', type: 'float', description: 'Temperatura máxima en Kelvin' }
    ],
    responseExample: `[
  {"id": 15, "smiles": "...", "Tm_pred": 280.5},
  {"id": 23, "smiles": "...", "Tm_pred": 295.3},
  ...
]`,
  },
  {
    name: 'Top Predictions',
    method: 'GET',
    endpoint: '/top/{n}',
    description: 'Obtiene las N predicciones más altas o bajas',
    params: [
      { name: 'n', type: 'integer', description: 'Número de resultados' },
      { name: 'order', type: 'string', description: 'highest o lowest' }
    ],
    responseExample: `[
  {"id": 156, "smiles": "...", "Tm_pred": 632.50},
  {"id": 89, "smiles": "...", "Tm_pred": 598.12},
  ...
]`,
  },
  {
    name: 'Get User Compounds',
    method: 'GET',
    endpoint: '/user-compounds',
    description: 'Lista todos los compuestos agregados por usuarios',
    responseExample: `[
  {
    "id": 1,
    "smiles": "CCO",
    "name": "Ethanol",
    "Tm_pred": 156.2,
    "created_at": "2024-01-15T10:30:00Z"
  }
]`,
  },
  {
    name: 'Add User Compound',
    method: 'POST',
    endpoint: '/user-compounds',
    description: 'Agrega un nuevo compuesto para predicción',
    requestBody: `{
  "smiles": "CCO",
  "name": "Ethanol"
}`,
    responseExample: `{
  "id": 1,
  "smiles": "CCO",
  "name": "Ethanol",
  "Tm_pred": 156.2,
  "created_at": "2024-01-15T10:30:00Z"
}`,
  },
  {
    name: 'Delete User Compound',
    method: 'DELETE',
    endpoint: '/user-compounds/{id}',
    description: 'Elimina un compuesto de usuario por ID',
    params: [
      { name: 'id', type: 'integer', description: 'ID del compuesto a eliminar' }
    ],
    responseExample: `{
  "message": "Compound deleted successfully"
}`,
  },
  {
    name: 'Model Info',
    method: 'GET',
    endpoint: '/model-info',
    description: 'Información sobre el modelo ML utilizado',
    responseExample: `{
  "name": "ChemProp",
  "type": "Message Passing Neural Network",
  "architecture": "Graph Neural Network",
  "features": "Molecular SMILES → Graph",
  "target": "Melting Point (Tm) in Kelvin",
  "folds": 5,
  "metrics": {
    "rmse": 42.15,
    "mae": 31.28,
    "r2": 0.847
  }
}`,
  },
];

export default function ApiDocsPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const baseUrl = 'http://localhost:8000';

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const generateCurlCommand = (endpoint: Endpoint): string => {
    if (endpoint.method === 'GET') {
      return `curl -X GET "${baseUrl}${endpoint.endpoint}"`;
    }
    if (endpoint.method === 'DELETE') {
      return `curl -X DELETE "${baseUrl}${endpoint.endpoint}"`;
    }
    return `curl -X POST "${baseUrl}${endpoint.endpoint}" \\
  -H "Content-Type: application/json" \\
  -d '${endpoint.requestBody}'`;
  };

  const methodColors = {
    GET: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    POST: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    DELETE: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-2xl bg-claude-orange/20 border border-claude-orange/30">
            <Server className="w-10 h-10 text-claude-orange" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-claude-text">
              API Documentation
            </h1>
            <p className="text-claude-text-secondary">
              FastAPI REST Endpoints
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 mt-6">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-claude-bg border border-claude-border">
            <Zap className="w-4 h-4 text-claude-orange" />
            <span className="text-claude-text-secondary text-sm">Base URL:</span>
            <code className="text-claude-orange font-mono">{baseUrl}</code>
          </div>
          <a
            href={`${baseUrl}/docs`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Swagger UI
          </a>
          <a
            href={`${baseUrl}/redoc`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            ReDoc
          </a>
        </div>
      </motion.div>

      {/* Quick Start */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl border border-claude-border p-6 mb-8"
      >
        <h2 className="text-xl font-bold text-claude-text mb-4 flex items-center gap-2">
          <Play className="w-5 h-5 text-claude-orange" />
          Quick Start
        </h2>
        
        <div className="space-y-4">
          <div>
            <p className="text-claude-text-secondary text-sm mb-2">1. Inicia el servidor:</p>
            <div className="relative">
              <code className="block p-4 rounded-xl bg-claude-bg border border-claude-border text-sm font-mono text-claude-text">
                uvicorn app.main:app --reload --port 8000
              </code>
            </div>
          </div>
          
          <div>
            <p className="text-claude-text-secondary text-sm mb-2">2. Prueba el health check:</p>
            <div className="relative">
              <code className="block p-4 rounded-xl bg-claude-bg border border-claude-border text-sm font-mono text-emerald-400">
                curl http://localhost:8000/health
              </code>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Endpoints */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl border border-claude-border overflow-hidden"
      >
        <div className="p-6 border-b border-claude-border">
          <h2 className="text-xl font-bold text-claude-text flex items-center gap-2">
            <Code className="w-5 h-5 text-claude-orange" />
            Endpoints ({endpoints.length})
          </h2>
        </div>

        <div className="divide-y divide-claude-border">
          {endpoints.map((endpoint, index) => (
            <div key={index}>
              <button
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                className="w-full p-4 md:p-6 flex items-center justify-between hover:bg-claude-orange/5 transition-colors text-left"
              >
                <div className="flex items-center gap-3 md:gap-4 flex-wrap">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${methodColors[endpoint.method]}`}>
                    {endpoint.method}
                  </span>
                  <code className="text-claude-text font-mono text-sm">{endpoint.endpoint}</code>
                  <span className="text-claude-text-secondary text-sm hidden md:inline">— {endpoint.name}</span>
                </div>
                <ChevronRight 
                  className={`w-5 h-5 text-claude-text-muted transition-transform flex-shrink-0 ${expandedIndex === index ? 'rotate-90' : ''}`} 
                />
              </button>

              {expandedIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="px-4 md:px-6 pb-6"
                >
                  <p className="text-claude-text-secondary mb-4">{endpoint.description}</p>

                  {/* Parameters */}
                  {endpoint.params && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-claude-text mb-2">Parameters</p>
                      <div className="space-y-2">
                        {endpoint.params.map((param) => (
                          <div key={param.name} className="flex items-start gap-3 p-3 rounded-lg bg-claude-bg border border-claude-border">
                            <code className="text-claude-orange text-sm font-mono">{param.name}</code>
                            <span className="text-claude-text-muted text-xs px-2 py-0.5 rounded bg-claude-bg-tertiary">{param.type}</span>
                            <span className="text-claude-text-secondary text-sm">{param.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Request Body */}
                  {endpoint.requestBody && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-claude-text mb-2 flex items-center gap-2">
                        <Code className="w-4 h-4" /> Request Body
                      </p>
                      <pre className="p-4 rounded-lg bg-claude-bg border border-claude-border overflow-x-auto">
                        <code className="text-sm text-blue-400">{endpoint.requestBody}</code>
                      </pre>
                    </div>
                  )}

                  {/* Response */}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-claude-text mb-2 flex items-center gap-2">
                      <Terminal className="w-4 h-4" /> Response Example
                    </p>
                    <pre className="p-4 rounded-lg bg-claude-bg border border-claude-border overflow-x-auto">
                      <code className="text-sm text-emerald-400">{endpoint.responseExample}</code>
                    </pre>
                  </div>

                  {/* cURL */}
                  <div>
                    <p className="text-sm font-semibold text-claude-text mb-2 flex items-center gap-2">
                      <Terminal className="w-4 h-4" /> cURL
                    </p>
                    <div className="relative">
                      <pre className="p-4 rounded-lg bg-claude-bg border border-claude-border overflow-x-auto pr-12">
                        <code className="text-sm text-claude-orange">{generateCurlCommand(endpoint)}</code>
                      </pre>
                      <button
                        onClick={() => copyToClipboard(generateCurlCommand(endpoint), index)}
                        className="absolute top-3 right-3 p-2 rounded-lg hover:bg-claude-border transition-colors"
                      >
                        {copiedIndex === index ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-claude-text-muted" />
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Error Codes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 glass rounded-2xl border border-claude-border p-6"
      >
        <h2 className="text-xl font-bold text-claude-text mb-4">HTTP Status Codes</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { code: '200', description: 'OK - Request successful', color: 'text-emerald-400' },
            { code: '400', description: 'Bad Request - Invalid input', color: 'text-yellow-400' },
            { code: '404', description: 'Not Found - Resource not found', color: 'text-orange-400' },
            { code: '500', description: 'Server Error - Internal error', color: 'text-red-400' },
          ].map((status) => (
            <div key={status.code} className="p-4 rounded-xl bg-claude-bg border border-claude-border">
              <span className={`text-2xl font-bold ${status.color}`}>{status.code}</span>
              <p className="text-claude-text-secondary text-sm mt-1">{status.description}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
