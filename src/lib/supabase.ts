/**
 * Cliente de Supabase para Next.js
 * Configuración del cliente para el frontend
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Obtener variables de entorno (pueden no estar configuradas)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Crear cliente de Supabase solo si las variables están configuradas
let supabaseClient: SupabaseClient | null = null

if (supabaseUrl && supabaseAnonKey) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
} else {
  console.warn(
    'Supabase no configurado. Las funcionalidades de Supabase no estarán disponibles. ' +
    'Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local'
  )
}

// Exportar cliente (puede ser null)
export const supabase = supabaseClient

// Tipos TypeScript para las tablas
export interface Compound {
  id: number
  compound_id: number
  smiles: string
  tm_real: number | null
  dataset_type: 'train' | 'test'
  created_at: string
  updated_at: string
}

export interface Prediction {
  id: number
  compound_id: number | null
  smiles: string
  tm_pred: number
  model_version: string
  created_at: string
}

export interface UserPrediction {
  id: number
  user_id: string | null
  smiles: string
  tm_pred: number
  session_id: string | null
  created_at: string
  metadata: Record<string, any>
}

export interface ModelMetadata {
  id: number
  model_version: string
  model_type: string
  mae: number
  rmse: number | null
  r2_score: number | null
  training_date: string | null
  num_folds: number | null
  description: string
  is_active: boolean
  created_at: string
}

// Funciones helper para consultas comunes
export const supabaseQueries = {
  /**
   * Obtiene todas las predicciones del test set
   */
  getAllPredictions: async () => {
    if (!supabase) {
      throw new Error('Supabase no está configurado')
    }
    
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .order('id', { ascending: true })
    
    if (error) throw error
    return data
  },

  /**
   * Obtiene una predicción por SMILES
   */
  getPredictionBySmiles: async (smiles: string) => {
    if (!supabase) {
      throw new Error('Supabase no está configurado')
    }
    
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('smiles', smiles)
      .single()
    
    if (error) throw error
    return data
  },

  /**
   * Obtiene estadísticas desde la vista
   */
  getStatistics: async () => {
    if (!supabase) {
      throw new Error('Supabase no está configurado')
    }
    
    const { data, error } = await supabase
      .from('model_statistics')
      .select('*')
      .single()
    
    if (error) throw error
    return data
  },

  /**
   * Obtiene distribución de temperaturas
   */
  getDistribution: async () => {
    if (!supabase) {
      throw new Error('Supabase no está configurado')
    }
    
    const { data, error } = await supabase
      .from('temperature_distribution')
      .select('*')
    
    if (error) throw error
    return data
  },

  /**
   * Guarda una predicción de usuario
   */
  saveUserPrediction: async (
    smiles: string,
    tm_pred: number,
    sessionId: string,
    metadata?: Record<string, any>
  ) => {
    if (!supabase) {
      throw new Error('Supabase no está configurado')
    }
    
    const { data, error } = await supabase
      .from('user_predictions')
      .insert({
        smiles,
        tm_pred,
        session_id: sessionId,
        metadata: metadata || {},
      })
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  /**
   * Obtiene predicciones de usuario por session_id
   */
  getUserPredictions: async (sessionId: string) => {
    if (!supabase) {
      throw new Error('Supabase no está configurado')
    }
    
    const { data, error } = await supabase
      .from('user_predictions')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  /**
   * Elimina una predicción de usuario
   */
  deleteUserPrediction: async (id: number) => {
    if (!supabase) {
      throw new Error('Supabase no está configurado')
    }
    
    const { error } = await supabase
      .from('user_predictions')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return true
  },

  /**
   * Obtiene metadata del modelo activo
   */
  getModelMetadata: async () => {
    if (!supabase) {
      throw new Error('Supabase no está configurado')
    }
    
    const { data, error } = await supabase
      .from('model_metadata')
      .select('*')
      .eq('is_active', true)
      .single()
    
    if (error) throw error
    return data
  },

  /**
   * Búsqueda de compuestos
   */
  searchCompounds: async (filters: {
    smiles?: string
    minTm?: number
    maxTm?: number
    datasetType?: 'train' | 'test'
    limit?: number
  }) => {
    if (!supabase) {
      throw new Error('Supabase no está configurado')
    }
    
    let query = supabase.from('compounds').select('*')
    
    if (filters.smiles) {
      query = query.ilike('smiles', `%${filters.smiles}%`)
    }
    
    if (filters.minTm !== undefined) {
      query = query.gte('tm_real', filters.minTm)
    }
    
    if (filters.maxTm !== undefined) {
      query = query.lte('tm_real', filters.maxTm)
    }
    
    if (filters.datasetType) {
      query = query.eq('dataset_type', filters.datasetType)
    }
    
    query = query.limit(filters.limit || 100)
    
    const { data, error } = await query
    
    if (error) throw error
    return data
  },
}
