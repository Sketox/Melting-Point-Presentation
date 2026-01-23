'use client';

import Link from 'next/link';
import { Flame, Github, ExternalLink, Mail, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-claude-border bg-claude-bg-secondary/50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-claude-orange to-claude-orange-dark flex items-center justify-center">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-claude-text">
                  Melting<span className="text-claude-orange">Point</span>
                </h3>
                <p className="text-xs text-claude-text-muted">ML Prediction System</p>
              </div>
            </div>
            <p className="text-claude-text-secondary text-sm max-w-md mb-4">
              Sistema de predicción de puntos de fusión moleculares utilizando 
              Machine Learning. Desarrollado para la competencia de Kaggle 
              "Thermophysical Property: Melting Point".
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/Sketox/Melting-Point"
                target="_blank"
                rel="noopener noreferrer"
                className="text-claude-text-muted hover:text-claude-orange transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://www.kaggle.com/competitions/melting-point"
                target="_blank"
                rel="noopener noreferrer"
                className="text-claude-text-muted hover:text-claude-orange transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-claude-text font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { href: '/', label: 'Home' },
                { href: '/predictions', label: 'Predictions' },
                { href: '/analytics', label: 'Analytics' },
                { href: '/model', label: 'Model Info' },
                { href: '/api-docs', label: 'API Docs' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-claude-text-secondary hover:text-claude-orange transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="text-claude-text font-semibold mb-4">Tech Stack</h4>
            <ul className="space-y-2">
              {[
                { label: 'Next.js 14', color: 'text-white' },
                { label: 'FastAPI', color: 'text-emerald-400' },
                { label: 'ChemProp', color: 'text-blue-400' },
                { label: 'Tailwind CSS', color: 'text-cyan-400' },
                { label: 'Recharts', color: 'text-purple-400' },
              ].map((tech) => (
                <li key={tech.label} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${tech.color} bg-current`} />
                  <span className="text-claude-text-secondary text-sm">{tech.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-claude-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-claude-text-muted text-sm flex items-center gap-1">
            © {currentYear} MeltingPoint. Made with
            <Heart className="w-4 h-4 text-claude-orange inline" />
            for Kaggle
          </p>
          <p className="text-claude-text-muted text-sm">
            <span className="text-claude-orange">Thermophysical Property</span> Competition
          </p>
        </div>
      </div>
    </footer>
  );
}
