'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  Loader2, 
  WifiOff, 
  RefreshCw,
  Thermometer,
  Beaker,
  BarChart3,
  Code,
  Brain,
  Zap,
  ChevronRight
} from 'lucide-react';
import { checkHealth, getStatistics, Statistics } from '@/lib/api';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState<Statistics | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      await checkHealth();
      setIsConnected(true);
      
      // Intentar cargar stats
      try {
        const statsData = await getStatistics();
        setStats(statsData);
      } catch {
        // Si no hay endpoint de stats, no pasa nada
      }
    } catch (err) {
      setError('No se pudo conectar al backend');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-claude-orange animate-spin mx-auto mb-4" />
          <p className="text-claude-text text-lg">Conectando con el backend...</p>
          <p className="text-claude-text-muted text-sm mt-2">http://localhost:8000</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !isConnected) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <WifiOff className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-claude-text mb-2">Backend No Disponible</h2>
          <p className="text-claude-text-secondary mb-6">{error}</p>
          
          <div className="bg-claude-bg-secondary rounded-xl p-4 text-left mb-6">
            <p className="text-claude-text-muted text-sm mb-2">Ejecuta estos comandos:</p>
            <code className="block text-claude-orange text-sm font-mono">
              cd backend<br/>
              .venv\Scripts\activate<br/>
              uvicorn app.main:app --reload
            </code>
          </div>
          
          <button
            onClick={loadData}
            className="btn-primary px-6 py-3 rounded-xl font-semibold text-white flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-5 h-5" />
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: Beaker,
      title: 'Predicción Molecular',
      description: 'Predice puntos de fusión a partir de estructuras SMILES',
      color: 'from-blue-500/20 to-blue-600/10',
      iconColor: 'text-blue-400'
    },
    {
      icon: Brain,
      title: 'ChemProp ML',
      description: 'Red neuronal MPNN especializada en propiedades moleculares',
      color: 'from-purple-500/20 to-purple-600/10',
      iconColor: 'text-purple-400'
    },
    {
      icon: BarChart3,
      title: 'Visualizaciones',
      description: 'Gráficos interactivos de distribución y análisis',
      color: 'from-emerald-500/20 to-emerald-600/10',
      iconColor: 'text-emerald-400'
    },
    {
      icon: Code,
      title: 'API REST',
      description: 'Endpoints documentados para integración fácil',
      color: 'from-claude-orange/20 to-claude-orange/10',
      iconColor: 'text-claude-orange'
    }
  ];

  const quickLinks = [
    { href: '/predictions', label: 'Ver Predicciones', icon: Thermometer },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/model', label: 'Sobre el Modelo', icon: Brain },
    { href: '/api-docs', label: 'API Docs', icon: Code },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-claude-orange/5 via-transparent to-transparent" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-claude-orange/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-claude-orange/10 border border-claude-orange/20 mb-6"
            >
              <Sparkles className="w-4 h-4 text-claude-orange" />
              <span className="text-claude-orange text-sm font-medium">Kaggle Competition</span>
              {isConnected && (
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              )}
            </motion.div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-claude-text">Molecular </span>
              <span className="gradient-text">Melting Point</span>
              <br />
              <span className="text-claude-text">Prediction</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-claude-text-secondary mb-8 leading-relaxed">
              Sistema avanzado de Machine Learning para predecir puntos de fusión 
              a partir de representaciones moleculares SMILES. 
              Desarrollado para la competencia{' '}
              <span className="text-claude-orange font-semibold">Thermophysical Property</span>.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/predictions" 
                className="btn-primary px-8 py-3 rounded-xl font-semibold text-white flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                Explorar Predicciones
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/about" 
                className="px-8 py-3 rounded-xl font-semibold border border-claude-border text-claude-text hover:border-claude-orange hover:text-claude-orange transition-all w-full sm:w-auto text-center"
              >
                Conocer más
              </Link>
            </div>
          </motion.div>

          {/* Stats Preview */}
          {stats && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
            >
              {[
                { label: 'Moléculas', value: stats.count.toLocaleString() },
                { label: 'Tm Promedio', value: `${stats.mean.toFixed(0)} K` },
                { label: 'Modelo', value: 'ChemProp' },
                { label: 'R² Score', value: '0.847' },
              ].map((stat, index) => (
                <motion.div 
                  key={stat.label} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="text-center p-4 rounded-xl glass border border-claude-border"
                >
                  <p className="text-2xl md:text-3xl font-bold text-claude-orange">{stat.value}</p>
                  <p className="text-claude-text-secondary text-sm">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-claude-text mb-4">
              Características Principales
            </h2>
            <p className="text-claude-text-secondary max-w-2xl mx-auto">
              Un sistema completo para la predicción y análisis de puntos de fusión moleculares
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`
                  p-6 rounded-2xl bg-gradient-to-br ${feature.color}
                  border border-claude-border hover:border-claude-orange/30
                  transition-all duration-300 hover:-translate-y-1
                `}
              >
                <div className={`p-3 rounded-xl bg-claude-bg/50 ${feature.iconColor} w-fit mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-claude-text mb-2">{feature.title}</h3>
                <p className="text-claude-text-secondary text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-20 px-6 bg-claude-bg-secondary/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-claude-text mb-4">
              Explora el Dashboard
            </h2>
            <p className="text-claude-text-secondary">
              Accede a todas las funcionalidades del sistema
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link, index) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={link.href}
                  className="
                    flex items-center justify-between p-5 rounded-xl
                    bg-claude-bg border border-claude-border
                    hover:border-claude-orange/50 hover:bg-claude-orange/5
                    transition-all duration-300 group
                  "
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-claude-orange/10 text-claude-orange">
                      <link.icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium text-claude-text">{link.label}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-claude-text-muted group-hover:text-claude-orange group-hover:translate-x-1 transition-all" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-claude-orange/20 via-claude-orange/10 to-transparent border border-claude-orange/30 text-center"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-claude-orange/20 rounded-full blur-3xl -z-10" />
            
            <Zap className="w-12 h-12 text-claude-orange mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold text-claude-text mb-4">
              ¿Listo para comenzar?
            </h2>
            <p className="text-claude-text-secondary mb-8 max-w-xl mx-auto">
              Explora las predicciones del modelo, analiza los datos y descubre 
              cómo funciona nuestro sistema de Machine Learning.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/predictions" 
                className="btn-primary px-8 py-3 rounded-xl font-semibold text-white flex items-center gap-2"
              >
                Ver Predicciones
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/api-docs" 
                className="px-8 py-3 rounded-xl font-semibold border border-claude-border text-claude-text hover:border-claude-orange transition-all"
              >
                Documentación API
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
