'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserPlus,
  Mail,
  Lock,
  User,
  AlertCircle,
  Loader2,
  Flame,
  ArrowRight,
  Check,
  X
} from 'lucide-react';
import { register } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Password validation
  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    number: /\d/.test(formData.password)
  };
  const passwordValid = passwordChecks.length && passwordChecks.uppercase && passwordChecks.number;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!passwordValid) {
      setError('La contraseña no cumple con los requisitos');
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      router.push('/predictions');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const PasswordCheck = ({ valid, text }: { valid: boolean; text: string }) => (
    <div className={`flex items-center gap-2 text-sm ${valid ? 'text-emerald-400' : 'text-claude-text-muted'}`}>
      {valid ? (
        <Check className="w-4 h-4" />
      ) : (
        <X className="w-4 h-4" />
      )}
      {text}
    </div>
  );

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
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
            Crear Cuenta
          </h1>
          <p className="text-claude-text-secondary">
            Regístrate para guardar tus predicciones
          </p>
        </div>

        {/* Form Card */}
        <div className="glass rounded-2xl border border-claude-border p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
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

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-claude-text mb-2">
                Usuario <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-claude-text-muted" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="usuario123"
                  required
                  minLength={3}
                  maxLength={50}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-claude-bg border border-claude-border text-claude-text placeholder-claude-text-muted focus:outline-none focus:border-claude-orange transition-colors"
                />
              </div>
              <p className="text-claude-text-muted text-xs mt-1">
                Solo letras, números, _ y -
              </p>
            </div>

            {/* Full Name Field */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-claude-text mb-2">
                Nombre completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-claude-text-muted" />
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Juan Pérez"
                  maxLength={100}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-claude-bg border border-claude-border text-claude-text placeholder-claude-text-muted focus:outline-none focus:border-claude-orange transition-colors"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-claude-text mb-2">
                Email <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-claude-text-muted" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="usuario@email.com"
                  required
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-claude-bg border border-claude-border text-claude-text placeholder-claude-text-muted focus:outline-none focus:border-claude-orange transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-claude-text mb-2">
                Contraseña <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-claude-text-muted" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-claude-bg border border-claude-border text-claude-text placeholder-claude-text-muted focus:outline-none focus:border-claude-orange transition-colors"
                />
              </div>

              {/* Password Requirements */}
              <div className="mt-3 space-y-1">
                <PasswordCheck valid={passwordChecks.length} text="Mínimo 8 caracteres" />
                <PasswordCheck valid={passwordChecks.uppercase} text="Al menos una mayúscula" />
                <PasswordCheck valid={passwordChecks.number} text="Al menos un número" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !passwordValid}
              className="w-full py-3 px-4 rounded-xl bg-claude-orange hover:bg-claude-orange/90 text-white font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Crear Cuenta
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
                ¿Ya tienes cuenta?
              </span>
            </div>
          </div>

          {/* Login Link */}
          <Link
            href="/login"
            className="w-full py-3 px-4 rounded-xl border border-claude-border hover:border-claude-orange text-claude-text font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            Iniciar sesión
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Info Note */}
        <p className="text-center text-claude-text-muted text-sm mt-6">
          Al crear una cuenta, podrás guardar predicciones personalizadas y acceder a estadísticas de tu actividad.
        </p>
      </motion.div>
    </div>
  );
}
