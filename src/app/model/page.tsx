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
  Network
} from 'lucide-react';
import Link from 'next/link';

export default function ModelPage() {
  const modelSpecs = {
    name: 'ChemProp',
    type: 'Message Passing Neural Network (MPNN)',
    architecture: 'Graph Neural Network',
    features: 'Molecular SMILES → Graph',
    target: 'Melting Point (Tm) in Kelvin',
    folds: 5,
    metrics: {
      rmse: 42.15,
      mae: 31.28,
      r2: 0.847,
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
      title: 'Molecular Graph',
      description: 'El SMILES se convierte en un grafo molecular donde los nodos son átomos y las aristas son enlaces químicos',
      icon: Network,
      detail: 'Nodes: Atoms | Edges: Bonds',
    },
    {
      step: 3,
      title: 'Message Passing',
      description: 'La red neuronal propaga información entre átomos vecinos para aprender representaciones moleculares',
      icon: GitBranch,
      detail: '3 message passing steps',
    },
    {
      step: 4,
      title: 'Readout',
      description: 'Las representaciones atómicas se agregan para formar un vector de características molecular',
      icon: Layers,
      detail: 'Global pooling → 300D vector',
    },
    {
      step: 5,
      title: 'Prediction',
      description: 'Una red feed-forward predice el punto de fusión a partir del vector molecular',
      icon: Target,
      detail: 'FFN → Tm (Kelvin)',
    },
  ];

  const features = [
    {
      title: 'Atom Features',
      items: ['Atomic number', 'Degree', 'Formal charge', 'Chirality', 'Hybridization', 'Aromaticity', 'Ring membership'],
    },
    {
      title: 'Bond Features',
      items: ['Bond type (single/double/triple/aromatic)', 'Conjugation', 'Ring membership', 'Stereo configuration'],
    },
  ];

  const advantages = [
    {
      icon: Sparkles,
      title: 'No Feature Engineering',
      description: 'Aprende directamente de la estructura molecular sin necesidad de calcular descriptores manualmente',
    },
    {
      icon: Network,
      title: 'Estructura Aware',
      description: 'Captura relaciones espaciales y topológicas entre átomos en la molécula',
    },
    {
      icon: Cpu,
      title: 'Eficiente',
      description: 'Entrenamiento rápido con GPU y predicciones en milisegundos',
    },
    {
      icon: BarChart3,
      title: 'State-of-the-Art',
      description: 'Resultados competitivos en múltiples benchmarks de propiedades moleculares',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
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
              Modelo de ML
            </h1>
            <p className="text-claude-text-secondary">
              ChemProp - Message Passing Neural Network
            </p>
          </div>
        </div>
        <p className="text-claude-text-secondary max-w-3xl mt-4">
          Utilizamos <span className="text-purple-400 font-semibold">ChemProp</span>, 
          una red neuronal de grafos especializada en predicción de propiedades moleculares.
          El modelo aprende representaciones directamente de la estructura molecular
          sin necesidad de calcular descriptores químicos manualmente.
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
              { icon: Layers, label: 'Arquitectura', value: modelSpecs.architecture },
              { icon: Target, label: 'Target', value: modelSpecs.target },
              { icon: Zap, label: 'Input', value: modelSpecs.features },
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

          {/* Cross-validation */}
          <div className="mb-8 p-4 rounded-xl bg-claude-orange/10 border border-claude-orange/20">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-claude-orange" />
              <span className="font-semibold text-claude-text">Cross-Validation</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              {Array.from({ length: modelSpecs.folds }, (_, i) => (
                <div
                  key={i}
                  className="flex-1 h-4 rounded-full bg-claude-orange"
                  style={{ opacity: 0.4 + (i * 0.15) }}
                />
              ))}
            </div>
            <p className="text-claude-text-secondary text-sm">
              {modelSpecs.folds}-Fold Cross-Validation para estimación robusta del rendimiento
            </p>
          </div>

          {/* Metrics */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-claude-text-secondary" />
              <span className="font-semibold text-claude-text">Métricas de Rendimiento</span>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'RMSE', value: modelSpecs.metrics.rmse, unit: 'K', color: 'text-blue-400', desc: 'Root Mean Square Error' },
                { label: 'MAE', value: modelSpecs.metrics.mae, unit: 'K', color: 'text-emerald-400', desc: 'Mean Absolute Error' },
                { label: 'R²', value: modelSpecs.metrics.r2, unit: '', color: 'text-claude-orange', desc: 'Coefficient of Determination' },
              ].map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="text-center p-4 rounded-xl bg-claude-bg border border-claude-border"
                >
                  <p className={`text-3xl font-bold ${metric.color}`}>
                    {metric.value}
                    <span className="text-sm font-normal text-claude-text-muted ml-1">{metric.unit}</span>
                  </p>
                  <p className="text-claude-text-secondary text-sm mt-1">{metric.label}</p>
                  <p className="text-claude-text-muted text-xs mt-1">{metric.desc}</p>
                </motion.div>
              ))}
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
