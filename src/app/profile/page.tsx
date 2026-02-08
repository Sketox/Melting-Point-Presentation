'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Loader2,
  User,
  Mail,
  Lock,
  Save,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import {
  getStoredUser,
  updateProfile,
  changePassword,
  setAuthData,
  getStoredToken,
  User as UserType,
} from '@/lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);

  // Profile form
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  // Password form
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored) {
      router.push('/login');
      return;
    }
    setUser(stored);
    setUsername(stored.username);
    setEmail(stored.email);
    setFullName(stored.full_name || '');
    setBio(stored.bio || '');
  }, [router]);

  const handleProfileSave = async () => {
    if (!user) return;
    setProfileLoading(true);
    setProfileMsg(null);
    try {
      const updated = await updateProfile({
        username: username !== user.username ? username : undefined,
        email: email !== user.email ? email : undefined,
        full_name: fullName || undefined,
        bio: bio || undefined,
      });
      // Update localStorage
      const token = getStoredToken();
      if (token) {
        const newUser: UserType = {
          id: updated.id || user.id,
          username: updated.username,
          email: updated.email,
          full_name: updated.full_name,
          bio: updated.bio,
          created_at: updated.created_at || user.created_at,
          predictions_count: updated.predictions_count ?? user.predictions_count,
          is_active: updated.is_active ?? user.is_active,
        };
        setAuthData(token, newUser);
        setUser(newUser);
      }
      setProfileMsg({ type: 'ok', text: 'Perfil actualizado correctamente' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err instanceof Error ? err.message : 'Error al actualizar' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setPwMsg(null);
    if (newPw !== confirmPw) {
      setPwMsg({ type: 'error', text: 'Las contrasenas no coinciden' });
      return;
    }
    if (newPw.length < 8) {
      setPwMsg({ type: 'error', text: 'La contrasena debe tener al menos 8 caracteres' });
      return;
    }
    setPwLoading(true);
    try {
      await changePassword(currentPw, newPw);
      setPwMsg({ type: 'ok', text: 'Contrasena cambiada correctamente' });
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
    } catch (err) {
      setPwMsg({ type: 'error', text: err instanceof Error ? err.message : 'Error al cambiar contrasena' });
    } finally {
      setPwLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-claude-orange animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/" className="inline-flex items-center gap-2 text-claude-text-secondary hover:text-claude-orange transition-colors text-sm mb-4">
            <ArrowLeft className="w-4 h-4" />Volver
          </Link>
          <h1 className="text-3xl font-bold text-claude-text">Editar Perfil</h1>
          <p className="text-claude-text-secondary mt-1">Administra tu cuenta y preferencias</p>
        </motion.div>

        {/* Profile Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 border border-claude-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-claude-orange/20 text-claude-orange">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-claude-text">Informacion Personal</h2>
          </div>

          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-claude-text-muted text-sm mb-1 block">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-claude-text-muted" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-claude-bg border border-claude-border rounded-xl text-claude-text focus:border-claude-orange transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="text-claude-text-muted text-sm mb-1 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-claude-text-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-claude-bg border border-claude-border rounded-xl text-claude-text focus:border-claude-orange transition-all"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-claude-text-muted text-sm mb-1 block">Nombre completo</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre completo"
                className="w-full px-3 py-2.5 bg-claude-bg border border-claude-border rounded-xl text-claude-text placeholder:text-claude-text-muted focus:border-claude-orange transition-all"
              />
            </div>

            <div>
              <label className="text-claude-text-muted text-sm mb-1 block">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Cuentanos sobre ti..."
                rows={3}
                className="w-full px-3 py-2.5 bg-claude-bg border border-claude-border rounded-xl text-claude-text placeholder:text-claude-text-muted focus:border-claude-orange transition-all resize-none"
              />
            </div>

            {profileMsg && (
              <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
                profileMsg.type === 'ok'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {profileMsg.type === 'ok' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {profileMsg.text}
              </div>
            )}

            <button
              onClick={handleProfileSave}
              disabled={profileLoading}
              className="px-6 py-2.5 rounded-xl btn-primary text-white font-semibold flex items-center gap-2 disabled:opacity-50"
            >
              {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar cambios
            </button>
          </div>
        </motion.div>

        {/* Change Password */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass rounded-2xl p-6 border border-claude-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-claude-text">Cambiar Contrasena</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-claude-text-muted text-sm mb-1 block">Contrasena actual</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-claude-text-muted" />
                <input
                  type="password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 bg-claude-bg border border-claude-border rounded-xl text-claude-text focus:border-blue-400 transition-all"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-claude-text-muted text-sm mb-1 block">Nueva contrasena</label>
                <input
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="Min. 8 caracteres, 1 mayuscula, 1 numero"
                  className="w-full px-3 py-2.5 bg-claude-bg border border-claude-border rounded-xl text-claude-text placeholder:text-claude-text-muted focus:border-blue-400 transition-all"
                />
              </div>
              <div>
                <label className="text-claude-text-muted text-sm mb-1 block">Confirmar contrasena</label>
                <input
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  className="w-full px-3 py-2.5 bg-claude-bg border border-claude-border rounded-xl text-claude-text focus:border-blue-400 transition-all"
                />
              </div>
            </div>

            {pwMsg && (
              <div className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
                pwMsg.type === 'ok'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {pwMsg.type === 'ok' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {pwMsg.text}
              </div>
            )}

            <button
              onClick={handlePasswordChange}
              disabled={pwLoading || !currentPw || !newPw || !confirmPw}
              className="px-6 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 font-semibold flex items-center gap-2 hover:bg-blue-500/20 disabled:opacity-50 transition-all"
            >
              {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Cambiar contrasena
            </button>
          </div>
        </motion.div>

        {/* Account Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6 border border-claude-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-claude-bg-tertiary text-claude-text-muted">
              <FileText className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-claude-text">Cuenta</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="p-3 rounded-xl bg-claude-bg border border-claude-border">
              <p className="text-claude-text-muted">Miembro desde</p>
              <p className="text-claude-text font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-claude-bg border border-claude-border">
              <p className="text-claude-text-muted">Predicciones</p>
              <p className="text-claude-text font-medium">{user.predictions_count}</p>
            </div>
            <div className="p-3 rounded-xl bg-claude-bg border border-claude-border">
              <p className="text-claude-text-muted">Estado</p>
              <p className={`font-medium ${user.is_active ? 'text-emerald-400' : 'text-red-400'}`}>
                {user.is_active ? 'Activo' : 'Inactivo'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
