'use client';

import { motion } from 'framer-motion';
import { 
  Thermometer, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Hash,
  Sigma
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: 'orange' | 'green' | 'blue' | 'purple';
  delay?: number;
}

const colorClasses = {
  orange: 'from-claude-orange/20 to-claude-orange/5 border-claude-orange/30',
  green: 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
  blue: 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
  purple: 'from-purple-500/20 to-purple-500/5 border-purple-500/30',
};

const iconColorClasses = {
  orange: 'text-claude-orange',
  green: 'text-emerald-400',
  blue: 'text-blue-400',
  purple: 'text-purple-400',
};

function StatCard({ title, value, subtitle, icon, color = 'orange', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`
        relative overflow-hidden rounded-2xl p-6
        bg-gradient-to-br ${colorClasses[color]}
        border backdrop-blur-sm
        card-glow cursor-default
      `}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <div className={`w-full h-full ${iconColorClasses[color]}`}>
          {icon}
        </div>
      </div>

      <div className="relative z-10">
        <div className={`inline-flex p-3 rounded-xl bg-claude-bg/50 ${iconColorClasses[color]} mb-4`}>
          {icon}
        </div>
        
        <h3 className="text-claude-text-secondary text-sm font-medium uppercase tracking-wider mb-1">
          {title}
        </h3>
        
        <p className="text-3xl font-bold text-claude-text mb-1">
          {typeof value === 'number' ? value.toLocaleString('es-ES', { maximumFractionDigits: 2 }) : value}
        </p>
        
        {subtitle && (
          <p className="text-claude-text-muted text-sm">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}

interface StatsGridProps {
  stats: {
    count: number;
    mean: number;
    std: number;
    min: number;
    max: number;
    median: number;
    q25?: number;
    q75?: number;
  };
}

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatCard
        title="Total Muestras"
        value={stats.count}
        subtitle="moléculas en test set"
        icon={<Hash className="w-6 h-6" />}
        color="orange"
        delay={0}
      />
      <StatCard
        title="Tm Promedio"
        value={`${stats.mean.toFixed(2)} K`}
        subtitle={`≈ ${(stats.mean - 273.15).toFixed(1)}°C`}
        icon={<Thermometer className="w-6 h-6" />}
        color="blue"
        delay={0.1}
      />
      <StatCard
        title="Desv. Estándar"
        value={`±${stats.std.toFixed(2)} K`}
        subtitle="variación en predicciones"
        icon={<Sigma className="w-6 h-6" />}
        color="purple"
        delay={0.2}
      />
      <StatCard
        title="Tm Mínimo"
        value={`${stats.min.toFixed(2)} K`}
        subtitle={`≈ ${(stats.min - 273.15).toFixed(1)}°C`}
        icon={<TrendingDown className="w-6 h-6" />}
        color="blue"
        delay={0.3}
      />
      <StatCard
        title="Tm Máximo"
        value={`${stats.max.toFixed(2)} K`}
        subtitle={`≈ ${(stats.max - 273.15).toFixed(1)}°C`}
        icon={<TrendingUp className="w-6 h-6" />}
        color="orange"
        delay={0.4}
      />
      <StatCard
        title="Tm Mediana"
        value={`${stats.median.toFixed(2)} K`}
        subtitle={`≈ ${(stats.median - 273.15).toFixed(1)}°C`}
        icon={<Activity className="w-6 h-6" />}
        color="green"
        delay={0.5}
      />
    </div>
  );
}