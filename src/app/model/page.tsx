'use client';

import { motion } from 'framer-motion';
import { 
  Brain, 
  Layers, 
  Target, 
  Zap,
  CheckCircle2,
  BarChart3,
  GitBranch,
  Database,
  Cpu,
  ArrowRight,
  Sparkles,
  FlaskConical,
  Atom,
  Network,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function ModelPage() {
  // Real metrics from trained model - Hybrid model
  const modelSpecs = {
    name: 'Modelo Híbrido',
    type: 'ChemProp D-MPNN + Ensemble (XGB+LGB)',
    architecture: 'Graph Neural Network + Gradient Boosting',
    features: 'SMILES → Graph + Morgan FP + MACCS Keys',
    target: 'Punto de Fusión (Tm) en Kelvin',
    folds: 5,
    epochs: 50,
    hiddenSize: 300,
    depth: 6,
    dropout: 0.1,
    batchSize: 32,
    // Hybrid model composition
    chempropWeight: 0.20,
    ensembleWeight: 0.80,
    metrics: {
      mae: 22.80,  // Kaggle test MAE
      maeStd: 3.16,
      chempropMae: 28.85,
      ensembleMae: 26.64,
      foldMetrics: [
        { fold: 0, valMae: 29.63, testMae: 26.15, bestEpoch: 30 },
        { fold: 1, valMae: 29.26, testMae: 27.64, bestEpoch: 41 },
        { fold: 2, valMae: 27.22, testMae: 35.03, bestEpoch: 45 },
        { fold: 3, valMae: 26.57, testMae: 27.35, bestEpoch: 48 },
        { fold: 4, valMae: 31.31, testMae: 28.09, bestEpoch: 28 },
      ]
    },
  };

  const pipeline = [
    {
      step: 1,
      title: 'Input SMILES',
      description: 'La estructura molecular se representa como una cadena de texto en formato SMILES (Simplified Molecular Input Line Entry System)',
      icon: FlaskConical,
      example: 'CC(=O)OC1=CC=CC=C1C(=O)O',
    },
    {
      step: 2,
      title: 'Grafo Molecular',
      description: 'El SMILES se convierte en un grafo molecular donde los nodos son átomos y las aristas son enlaces químicos',
      icon: Network,
      detail: 'Nodos: Átomos | Aristas: Enlaces',
    },
    {
      step: 3,
      title: 'Message Passing',
      description: 'La red neuronal propaga información entre átomos vecinos durante 6 iteraciones para aprender representaciones moleculares',
      icon: GitBranch,
      detail: `${modelSpecs.depth} pasos de propagación de mensajes`,
    },
    {
      step: 4,
      title: 'Readout',
      description: 'Las representaciones atómicas se agregan para formar un vector de características molecular',
      icon: Layers,
      detail: `Global pooling → vector de ${modelSpecs.hiddenSize}D`,
    },
    {
      step: 5,
      title: 'Predicción Híbrida',
      description: 'ChemProp + Ensemble se combinan (20%/80%) para predecir el punto de fusión final',
      icon: Target,
      detail: 'Combinación óptima → Tm (Kelvin) ± 22.8 K',
    },
  ];

  const features = [
    {
      title: 'Características Atómicas',
      items: ['Número atómico', 'Grado (conectividad)', 'Carga formal', 'Quiralidad', 'Hibridación', 'Aromaticidad', 'Pertenencia a anillo'],
    },
    {
      title: 'Características de Enlace',
      items: ['Tipo de enlace (simple/doble/triple/aromático)', 'Conjugación', 'Pertenencia a anillo', 'Configuración estéreo'],
    },
  ];

  const advantages = [
    {
      icon: Sparkles,
      title: 'Sin Feature Engineering',
      description: 'Aprende directamente de la estructura molecular sin necesidad de calcular descriptores manualmente',
    },
    {
      icon: Network,
      title: 'Entiende la Estructura',
      description: 'Captura relaciones espaciales y topológicas entre átomos en la molécula',
    },
    {
      icon: Cpu,
      title: 'Eficiente',
      description: 'Entrenamiento rápido con GPU y predicciones en segundos',
    },
    {
      icon: BarChart3,
      title: 'Estado del Arte',
      description: 'Resultados competitivos en múltiples benchmarks de propiedades moleculares',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
            <Brain className="w-10 h-10 text-purple-400" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-claude-text">
              Modelo Híbrido de Machine Learning
            </h1>
            <p className="text-claude-text-secondary">
              ChemProp D-MPNN + Ensemble (XGBoost + LightGBM)
            </p>
          </div>
        </div>
        <p className="text-claude-text-secondary max-w-3xl mt-4">
          Utilizamos un <span className="text-purple-400 font-semibold">modelo híbrido</span> que combina
          ChemProp (red neuronal de grafos) con un ensemble de gradient boosting.
          Esta combinación logra <span className="text-claude-orange font-semibold">MAE de 22.80 K</span> en
          el test set de Kaggle, superior a cualquier modelo individual.
        </p>
      </motion.div>

      {/* Model Specs Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl border border-claude-border overflow-hidden mb-12"
      >
        <div className="p-6 border-b border-claude-border bg-gradient-to-r from-purple-500/10 to-transparent">
          <h2 className="text-xl font-bold text-claude-text flex items-center gap-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            Especificaciones del Modelo
          </h2>
        </div>
        
        <div className="p-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Brain, label: 'Tipo', value: modelSpecs.type },
              { icon: Layers, label: 'Hidden Size', value: `${modelSpecs.hiddenSize} dimensiones` },
              { icon: GitBranch, label: 'Profundidad', value: `${modelSpecs.depth} capas` },
              { icon: Target, label: 'Dropout', value: `${modelSpecs.dropout * 100}%` },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="p-4 rounded-xl bg-claude-bg border border-claude-border"
              >
                <div className="flex items-center gap-2 mb-2">
                  <item.icon className="w-4 h-4 text-claude-text-muted" />
                  <span className="text-claude-text-muted text-sm">{item.label}</span>
                </div>
                <p className="text-claude-text font-medium text-sm">{item.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Training Config */}
          <div className="mb-8 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-5 h-5 text-blue-400" />
              <span className="font-semibold text-claude-text">Configuración de Entrenamiento</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <p className="text-claude-text-muted text-sm">Epochs</p>
                <p className="text-claude-text font-bold">{modelSpecs.epochs}</p>
              </div>
              <div>
                <p className="text-claude-text-muted text-sm">Batch Size</p>
                <p className="text-claude-text font-bold">{modelSpecs.batchSize}</p>
              </div>
              <div>
                <p className="text-claude-text-muted text-sm">Métrica</p>
                <p className="text-claude-text font-bold">MAE (Mean Absolute Error)</p>
              </div>
            </div>
          </div>

          {/* Cross-validation */}
          <div className="mb-8 p-4 rounded-xl bg-claude-orange/10 border border-claude-orange/20">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-claude-orange" />
              <span className="font-semibold text-claude-text">Validación Cruzada de 5 Folds</span>
            </div>
            <div className="flex items-center gap-2 mb-4">
              {modelSpecs.metrics.foldMetrics.map((fold, i) => (
                <div
                  key={i}
                  className="flex-1 h-4 rounded-full bg-claude-orange relative group cursor-pointer"
                  style={{ opacity: 0.4 + (i * 0.15) }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-claude-bg-secondary px-2 py-1 rounded text-xs whitespace-nowrap border border-claude-border z-10">
                    Fold {fold.fold}: {fold.testMae.toFixed(2)} K
                  </div>
                </div>
              ))}
            </div>
            
            {/* Fold details table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-claude-text-muted">
                    <th className="text-left py-2">Fold</th>
                    <th className="text-right py-2">Val MAE</th>
                    <th className="text-right py-2">Test MAE</th>
                    <th className="text-right py-2">Mejor Epoch</th>
                  </tr>
                </thead>
                <tbody>
                  {modelSpecs.metrics.foldMetrics.map((fold) => (
                    <tr key={fold.fold} className="border-t border-claude-border/50">
                      <td className="py-2 text-claude-text">Fold {fold.fold}</td>
                      <td className="py-2 text-right text-claude-text-secondary">{fold.valMae.toFixed(2)} K</td>
                      <td className="py-2 text-right text-claude-orange font-medium">{fold.testMae.toFixed(2)} K</td>
                      <td className="py-2 text-right text-claude-text-muted">{fold.bestEpoch}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Final Metrics */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-claude-text-secondary" />
              <span className="font-semibold text-claude-text">Métricas del Modelo Híbrido</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center p-6 rounded-xl bg-gradient-to-br from-claude-orange/20 to-claude-orange/5 border border-claude-orange/30"
              >
                <p className="text-4xl font-bold text-claude-orange">
                  {modelSpecs.metrics.mae}
                  <span className="text-lg font-normal text-claude-text-muted ml-1">K</span>
                </p>
                <p className="text-claude-text-secondary text-sm mt-1">MAE Híbrido (Kaggle)</p>
                <p className="text-claude-text-muted text-xs mt-1">20% ChemProp + 80% Ensemble</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30"
              >
                <p className="text-4xl font-bold text-purple-400">
                  {modelSpecs.metrics.chempropMae}
                  <span className="text-lg font-normal text-claude-text-muted ml-1">K</span>
                </p>
                <p className="text-claude-text-secondary text-sm mt-1">MAE ChemProp</p>
                <p className="text-claude-text-muted text-xs mt-1">Solo D-MPNN</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center p-6 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30"
              >
                <p className="text-4xl font-bold text-emerald-400">
                  {modelSpecs.metrics.ensembleMae}
                  <span className="text-lg font-normal text-claude-text-muted ml-1">K</span>
                </p>
                <p className="text-claude-text-secondary text-sm mt-1">MAE Ensemble</p>
                <p className="text-claude-text-muted text-xs mt-1">XGB + LGB</p>
              </motion.div>
            </div>

            {/* Uncertainty note */}
            <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-claude-text-secondary">
                Todas las predicciones incluyen una <span className="text-yellow-400 font-semibold">incertidumbre de ±22.80 K</span> basada en el MAE del modelo híbrido validado en Kaggle.
                Este es el error esperado en datos nuevos similares al dataset de entrenamiento.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Pipeline Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold text-claude-text mb-6 flex items-center gap-3">
          <div className="w-1 h-8 bg-purple-500 rounded-full" />
          Pipeline de Predicción
        </h2>
        
        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-8 top-16 bottom-16 w-0.5 bg-gradient-to-b from-purple-500 via-blue-500 to-claude-orange hidden md:block" />
          
          <div className="space-y-6">
            {pipeline.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="relative flex gap-6"
              >
                {/* Step number */}
                <div className="relative z-10 flex-shrink-0">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-purple-400" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 glass rounded-2xl border border-claude-border p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm font-bold">
                      Paso {step.step}
                    </span>
                    <h3 className="text-lg font-bold text-claude-text">{step.title}</h3>
                  </div>
                  <p className="text-claude-text-secondary mb-3">{step.description}</p>
                  {step.example && (
                    <code className="block p-3 rounded-lg bg-claude-bg text-claude-orange font-mono text-sm border border-claude-border">
                      {step.example}
                    </code>
                  )}
                  {step.detail && (
                    <p className="text-claude-text-muted text-sm mt-2 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      {step.detail}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold text-claude-text mb-6 flex items-center gap-3">
          <div className="w-1 h-8 bg-blue-500 rounded-full" />
          Características Moleculares
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="glass rounded-2xl border border-claude-border p-6"
            >
              <h3 className="text-lg font-bold text-claude-text mb-4 flex items-center gap-2">
                <Atom className="w-5 h-5 text-blue-400" />
                {feature.title}
              </h3>
              <ul className="space-y-2">
                {feature.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-claude-text-secondary text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Advantages Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold text-claude-text mb-6 flex items-center gap-3">
          <div className="w-1 h-8 bg-emerald-500 rounded-full" />
          Ventajas de ChemProp
        </h2>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {advantages.map((adv, index) => (
            <motion.div
              key={adv.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 hover:border-emerald-500/40 transition-colors"
            >
              <adv.icon className="w-8 h-8 text-emerald-400 mb-4" />
              <h3 className="text-lg font-semibold text-claude-text mb-2">{adv.title}</h3>
              <p className="text-claude-text-secondary text-sm">{adv.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-center p-8 rounded-2xl bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-emerald-500/10 border border-claude-border"
      >
        <h3 className="text-xl font-bold text-claude-text mb-4">
          ¿Quieres ver el modelo en acción?
        </h3>
        <p className="text-claude-text-secondary mb-6">
          Explora las predicciones y visualiza los resultados del modelo
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/predictions"
            className="btn-primary px-6 py-3 rounded-xl font-semibold text-white flex items-center gap-2"
          >
            Ver Predicciones
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            href="/analytics"
            className="px-6 py-3 rounded-xl font-semibold border border-claude-border text-claude-text hover:border-purple-500 transition-colors"
          >
            Analytics
          </Link>
        </div>
      </motion.div>
    </div>
  );
}