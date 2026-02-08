'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LogIn,
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  Flame,
  ArrowRight
} from 'lucide-react';
import { login } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      router.push('/predictions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-claude-orange/20 border border-claude-orange/30 mb-4">
            <Flame className="w-8 h-8 text-claude-orange" />
          </div>
          <h1 className="text-3xl font-bold text-claude-text mb-2">
            Iniciar Sesión
          </h1>
          <p className="text-claude-text-secondary">
            Accede a tu cuenta para guardar predicciones
          </p>
        </div>

        {/* Form Card */}
        <div className="glass rounded-2xl border border-claude-border p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-red-400 text-sm">{error}</span>
              </motion.div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-claude-text mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-claude-text-muted" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@email.com"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-claude-bg border border-claude-border text-claude-text placeholder-claude-text-muted focus:outline-none focus:border-claude-orange transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-claude-text mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-claude-text-muted" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-claude-bg border border-claude-border text-claude-text placeholder-claude-text-muted focus:outline-none focus:border-claude-orange transition-colors"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-claude-orange hover:bg-claude-orange/90 text-white font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-claude-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-claude-bg-secondary text-claude-text-muted">
                ¿No tienes cuenta?
              </span>
            </div>
          </div>

          {/* Register Link */}
          <Link
            href="/register"
            className="w-full py-3 px-4 rounded-xl border border-claude-border hover:border-claude-orange text-claude-text font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            Crear cuenta
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Info Note */}
        <p className="text-center text-claude-text-muted text-sm mt-6">
          Al iniciar sesión, podrás guardar tus predicciones y acceder a ellas desde cualquier dispositivo.
        </p>
      </motion.div>
    </div>
  );
}
