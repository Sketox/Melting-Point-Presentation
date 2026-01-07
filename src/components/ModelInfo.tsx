'use client';

import { motion } from 'framer-motion';
import { 
  Brain, 
  Layers, 
  Target, 
  Zap,
  CheckCircle2,
  BarChart3
} from 'lucide-react';

interface ModelInfoProps {
  model: {
    name: string;
    type: string;
    architecture: string;
    features: string;
    target: string;
    folds: number;
    metrics: {
      rmse: number;
      mae: number;
      r2: number;
    };
  };
}

export default function ModelInfo({ model }: ModelInfoProps) {
  const infoItems = [
    { icon: Brain, label: 'Model Type', value: model.type },
    { icon: Layers, label: 'Architecture', value: model.architecture },
    { icon: Target, label: 'Target Variable', value: model.target },
    { icon: Zap, label: 'Input Features', value: model.features },
  ];

  const metrics = [
    { label: 'RMSE', value: model.metrics.rmse, unit: 'K', color: 'text-blue-400' },
    { label: 'MAE', value: model.metrics.mae, unit: 'K', color: 'text-emerald-400' },
    { label: 'R²', value: model.metrics.r2, unit: '', color: 'text-claude-orange' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="glass rounded-2xl border border-claude-border overflow-hidden"
    >
      <div className="p-6 border-b border-claude-border">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-purple-400">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-claude-text">{model.name} Model</h3>
            <p className="text-claude-text-secondary text-sm">
              Machine Learning model details and performance metrics
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Model Info Grid */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {infoItems.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              className="flex items-start gap-3 p-4 rounded-xl bg-claude-bg border border-claude-border"
            >
              <div className="p-2 rounded-lg bg-claude-bg-tertiary text-claude-text-secondary">
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-claude-text-muted text-sm">{item.label}</p>
                <p className="text-claude-text font-medium">{item.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Cross-validation info */}
        <div className="mb-8 p-4 rounded-xl bg-claude-orange/10 border border-claude-orange/20">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-claude-orange" />
            <span className="font-semibold text-claude-text">Cross-Validation</span>
          </div>
          <div className="flex items-center gap-2">
            {Array.from({ length: model.folds }, (_, i) => (
              <div
                key={i}
                className="flex-1 h-3 rounded-full bg-claude-orange/60"
                style={{ opacity: 0.4 + (i * 0.15) }}
              />
            ))}
          </div>
          <p className="text-claude-text-secondary text-sm mt-2">
            {model.folds}-Fold Cross-Validation for robust performance estimation
          </p>
        </div>

        {/* Performance Metrics */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-claude-text-secondary" />
            <span className="font-semibold text-claude-text">Performance Metrics</span>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {metrics.map((metric, index) => (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 + (0.1 * index) }}
                className="text-center p-4 rounded-xl bg-claude-bg border border-claude-border"
              >
                <p className={`text-3xl font-bold ${metric.color}`}>
                  {metric.value}
                  <span className="text-sm font-normal text-claude-text-muted ml-1">
                    {metric.unit}
                  </span>
                </p>
                <p className="text-claude-text-secondary text-sm mt-1">{metric.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
