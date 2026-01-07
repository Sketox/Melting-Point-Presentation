'use client';

import { motion } from 'framer-motion';
import { Flame, Github, ExternalLink } from 'lucide-react';

export default function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 glass border-b border-claude-border"
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-claude-orange to-claude-orange-dark flex items-center justify-center">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -inset-1 bg-claude-orange/30 rounded-xl blur-md -z-10" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-claude-text">
                Melting<span className="text-claude-orange">Point</span>
              </h1>
              <p className="text-xs text-claude-text-muted">Kaggle Competition</p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#stats" className="text-claude-text-secondary hover:text-claude-orange transition-colors text-sm font-medium">
              Statistics
            </a>
            <a href="#predictions" className="text-claude-text-secondary hover:text-claude-orange transition-colors text-sm font-medium">
              Predictions
            </a>
            <a href="#model" className="text-claude-text-secondary hover:text-claude-orange transition-colors text-sm font-medium">
              Model
            </a>
            <a href="#api" className="text-claude-text-secondary hover:text-claude-orange transition-colors text-sm font-medium">
              API
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <a
              href="https://www.kaggle.com/competitions/melting-point"
              target="_blank"
              rel="noopener noreferrer"
              className="
                hidden sm:flex items-center gap-2 px-4 py-2 
                rounded-lg border border-claude-border
                text-claude-text-secondary hover:text-claude-text
                hover:border-claude-orange transition-all text-sm
              "
            >
              <ExternalLink className="w-4 h-4" />
              Kaggle
            </a>
            <a
              href="https://github.com/Sketox/Melting-Point"
              target="_blank"
              rel="noopener noreferrer"
              className="
                flex items-center gap-2 px-4 py-2 
                rounded-lg bg-claude-orange/10 border border-claude-orange/20
                text-claude-orange hover:bg-claude-orange/20
                transition-all text-sm font-medium
              "
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
