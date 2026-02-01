'use client';

import { useAuth, useRequireAuth } from '@/contexts/AuthContext';
import { User, Mail, Calendar, Database, Activity } from 'lucide-react';

export default function ProfilePage() {
  const { isAuthenticated, isLoading } = useRequireAuth('/auth/login');
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-claude-orange"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{user.username}</h1>
                <p className="text-blue-100">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                <Mail className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-gray-900">{user.email}</p>
                </div>
              </div>

              {/* Full Name */}
              {user.full_name && (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                  <User className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Nombre Completo</p>
                    <p className="text-gray-900">{user.full_name}</p>
                  </div>
                </div>
              )}

              {/* Created At */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Miembro desde</p>
                  <p className="text-gray-900">
                    {new Date(user.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Predictions Count */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                <Database className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Predicciones Guardadas</p>
                  <p className="text-gray-900 text-2xl font-bold">{user.predictions_count}</p>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                <Activity className="w-5 h-5 text-blue-600 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Estado</p>
                  <p className="text-gray-900">
                    {user.is_active ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        Inactivo
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Bio */}
              {user.bio && (
                <div className="md:col-span-2 flex items-start gap-3 p-4 rounded-lg bg-gray-50">
                  <User className="w-5 h-5 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500">Biografía</p>
                    <p className="text-gray-900 mt-1">{user.bio}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
