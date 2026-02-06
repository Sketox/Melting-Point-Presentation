'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Flame, 
  Trophy,
  Target,
  Lightbulb,
  Users,
  Rocket,
  ExternalLink,
  Github,
  ArrowRight,
  CheckCircle,
  Beaker,
  Thermometer,
  Database,
  Code,
  BookOpen,
  Microscope
} from 'lucide-react';

export default function AboutPage() {
  const competitionInfo = {
    name: 'Thermophysical Property: Melting Point',
    platform: 'Kaggle',
    objective: 'Predecir puntos de fusión (Tm) en Kelvin para compuestos orgánicos',
    dataset: '2,662 train + 666 test moléculas con estructuras SMILES',
    metric: 'Mean Absolute Error (MAE)',
    link: 'https://www.kaggle.com/competitions/melting-point',
    result: 'MAE 22.80 K con modelo híbrido',
  };

  const whyMatters = [
    {
      icon: Beaker,
      title: 'Diseño de Fármacos',
      description: 'El punto de fusión es crucial para determinar la biodisponibilidad y formulación de medicamentos.',
    },
    {
      icon: Microscope,
      title: 'Ciencia de Materiales',
      description: 'Esencial para el desarrollo de nuevos materiales con propiedades térmicas específicas.',
    },
    {
      icon: Database,
      title: 'Screening Virtual',
      description: 'Permite filtrar millones de compuestos candidatos antes de síntesis experimental.',
    },
    {
      icon: Lightbulb,
      title: 'Reducción de Costos',
      description: 'Minimiza experimentos costosos al predecir propiedades computacionalmente.',
    },
  ];

  const techStack = [
    { name: 'Next.js 14', category: 'Frontend', color: 'bg-white/10' },
    { name: 'FastAPI', category: 'Backend', color: 'bg-emerald-500/20' },
    { name: 'ChemProp', category: 'D-MPNN', color: 'bg-purple-500/20' },
    { name: 'XGBoost', category: 'Ensemble', color: 'bg-blue-500/20' },
    { name: 'LightGBM', category: 'Ensemble', color: 'bg-cyan-500/20' },
    { name: 'RDKit', category: 'Química', color: 'bg-pink-500/20' },
    { name: 'Tailwind CSS', category: 'Styling', color: 'bg-teal-500/20' },
    { name: 'Recharts', category: 'Charts', color: 'bg-orange-500/20' },
  ];

  const timeline = [
    { phase: 'Análisis', description: 'Exploración del dataset y entendimiento del problema', done: true },
    { phase: 'ChemProp', description: 'Entrenamiento D-MPNN con 5-fold CV (MAE 28.85 K)', done: true },
    { phase: 'Ensemble', description: 'XGBoost + LightGBM con fingerprints (MAE 26.64 K)', done: true },
    { phase: 'Híbrido', description: 'Combinación óptima 20/80 (MAE 22.80 K Kaggle)', done: true },
    { phase: 'Dashboard', description: 'Sistema de toma de decisiones con visualizaciones', done: true },
    { phase: 'Producción', description: 'API REST + Frontend desplegado', done: true },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-claude-orange/10 border border-claude-orange/20 mb-6">
          <Trophy className="w-5 h-5 text-claude-orange" />
          <span className="text-claude-orange font-medium">Kaggle Competition Project</span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-claude-text mb-6">
          Sobre el Proyecto
        </h1>
        
        <p className="text-xl text-claude-text-secondary max-w-3xl mx-auto">
          Sistema de predicción de puntos de fusión moleculares desarrollado para 
          la competencia de Kaggle <span className="text-claude-orange font-semibold">"Thermophysical Property: Melting Point"</span>
        </p>
      </motion.div>

      {/* Competition Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl border border-claude-border overflow-hidden mb-12"
      >
        <div className="p-6 border-b border-claude-border bg-gradient-to-r from-claude-orange/10 to-transparent">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-claude-orange/20">
              <Trophy className="w-8 h-8 text-claude-orange" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-claude-text">{competitionInfo.name}</h2>
              <p className="text-claude-text-secondary">Kaggle Competition</p>
            </div>
            <a
              href={competitionInfo.link}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-claude-orange/10 border border-claude-orange/30 text-claude-orange hover:bg-claude-orange/20 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Ver en Kaggle
            </a>
          </div>
        </div>

        <div className="p-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-claude-bg border border-claude-border">
              <Target className="w-5 h-5 text-claude-orange mb-2" />
              <p className="text-claude-text-muted text-sm">Objetivo</p>
              <p className="text-claude-text font-medium">{competitionInfo.objective}</p>
            </div>
            <div className="p-4 rounded-xl bg-claude-bg border border-claude-border">
              <Database className="w-5 h-5 text-blue-400 mb-2" />
              <p className="text-claude-text-muted text-sm">Dataset</p>
              <p className="text-claude-text font-medium">{competitionInfo.dataset}</p>
            </div>
            <div className="p-4 rounded-xl bg-claude-bg border border-claude-border">
              <Thermometer className="w-5 h-5 text-emerald-400 mb-2" />
              <p className="text-claude-text-muted text-sm">Target</p>
              <p className="text-claude-text font-medium">Melting Point (K)</p>
            </div>
            <div className="p-4 rounded-xl bg-claude-bg border border-claude-border">
              <Target className="w-5 h-5 text-purple-400 mb-2" />
              <p className="text-claude-text-muted text-sm">Nuestro Resultado</p>
              <p className="text-claude-orange font-bold">{competitionInfo.result}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Why It Matters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold text-claude-text mb-6 flex items-center gap-3">
          <div className="w-1 h-8 bg-claude-orange rounded-full" />
          ¿Por qué es importante?
        </h2>
        
        <p className="text-claude-text-secondary mb-8 max-w-3xl">
          El punto de fusión es una propiedad termofísica fundamental que tiene aplicaciones 
          críticas en múltiples industrias. Poder predecirlo computacionalmente acelera 
          el descubrimiento de nuevos compuestos.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {whyMatters.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-claude-bg-secondary to-claude-bg border border-claude-border hover:border-claude-orange/30 transition-colors"
            >
              <div className="p-3 rounded-xl bg-claude-orange/10 text-claude-orange w-fit mb-4">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-claude-text mb-2">{item.title}</h3>
              <p className="text-claude-text-secondary text-sm">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold text-claude-text mb-6 flex items-center gap-3">
          <div className="w-1 h-8 bg-blue-500 rounded-full" />
          ¿Cómo funciona?
        </h2>

        <div className="glass rounded-2xl border border-claude-border p-6 md:p-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-400">1</span>
              </div>
              <h3 className="text-lg font-semibold text-claude-text mb-2">Entrada</h3>
              <p className="text-claude-text-secondary text-sm">
                El usuario proporciona una estructura molecular en formato SMILES o selecciona 
                una molécula del dataset.
              </p>
              <code className="block mt-3 p-2 rounded-lg bg-claude-bg text-blue-400 text-xs font-mono">
                CC(=O)O
              </code>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-400">2</span>
              </div>
              <h3 className="text-lg font-semibold text-claude-text mb-2">Procesamiento</h3>
              <p className="text-claude-text-secondary text-sm">
                El modelo híbrido usa ChemProp (grafo molecular) + Ensemble
                (fingerprints Morgan y MACCS).
              </p>
              <div className="mt-3 flex justify-center gap-2">
                <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 text-xs">D-MPNN</span>
                <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs">XGB</span>
                <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs">LGB</span>
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-claude-orange/20 border border-claude-orange/30 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-claude-orange">3</span>
              </div>
              <h3 className="text-lg font-semibold text-claude-text mb-2">Predicción</h3>
              <p className="text-claude-text-secondary text-sm">
                El modelo combina predicciones (20% ChemProp + 80% Ensemble) con incertidumbre ±22.8 K.
              </p>
              <div className="mt-3 p-2 rounded-lg bg-claude-orange/10 border border-claude-orange/30">
                <span className="text-claude-orange font-bold">289.5 ± 22.8 K</span>
                <span className="text-claude-text-muted text-xs ml-2">(16.4°C)</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Project Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold text-claude-text mb-6 flex items-center gap-3">
          <div className="w-1 h-8 bg-emerald-500 rounded-full" />
          Timeline del Proyecto
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {timeline.map((item, index) => (
            <motion.div
              key={item.phase}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className={`p-4 rounded-xl border ${
                item.done 
                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                  : 'bg-claude-bg border-claude-border'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                {item.done ? (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-claude-text-muted" />
                )}
                <span className="font-semibold text-claude-text">{item.phase}</span>
              </div>
              <p className="text-claude-text-secondary text-sm pl-8">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Tech Stack */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold text-claude-text mb-6 flex items-center gap-3">
          <div className="w-1 h-8 bg-purple-500 rounded-full" />
          Tech Stack
        </h2>

        <div className="flex flex-wrap gap-3">
          {techStack.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.05 }}
              className={`px-4 py-2 rounded-xl ${tech.color} border border-claude-border`}
            >
              <span className="text-claude-text font-medium">{tech.name}</span>
              <span className="text-claude-text-muted text-xs ml-2">({tech.category})</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center p-8 md:p-12 rounded-2xl bg-gradient-to-br from-claude-orange/20 via-claude-orange/10 to-transparent border border-claude-orange/30"
      >
        <Rocket className="w-12 h-12 text-claude-orange mx-auto mb-6" />
        <h2 className="text-2xl font-bold text-claude-text mb-4">
          ¿Listo para explorar?
        </h2>
        <p className="text-claude-text-secondary mb-8 max-w-xl mx-auto">
          Descubre las predicciones del modelo, explora los analytics o revisa la documentación de la API.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/predictions"
            className="btn-primary px-6 py-3 rounded-xl font-semibold text-white flex items-center gap-2"
          >
            Ver Predicciones
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="https://github.com/Sketox/Melting-Point"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-claude-border text-claude-text hover:border-claude-orange transition-colors"
          >
            <Github className="w-5 h-5" />
            Ver en GitHub
          </a>
        </div>
      </motion.div>
    </div>
  );
}
