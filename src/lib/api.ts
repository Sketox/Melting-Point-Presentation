// src/lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ============================================
// TIPOS
// ============================================

export interface Prediction {
  id: number;
  Tm_pred: number;
  smiles?: string;
}

export interface Statistics {
  count: number;
  mean: number;
  std: number;
  min: number;
  max: number;
  median: number;
  q25: number;
  q75: number;
  variance: number;
  range: number;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  dataset_size: number;
}

export interface ModelInfo {
  name: string;
  type: string;
  mae: number;
  mae_std: number;
  folds: number;
  epochs: number;
  hidden_size: number;
  depth: number;
  uncertainty_interval: string;
}

export interface ValidateSmilesResponse {
  valid: boolean;
  canonical_smiles: string | null;
  num_atoms: number | null;
  molecular_weight: number | null;
  error: string | null;
  warning?: string;
}

export interface Compound {
  id: string;
  smiles: string;
  name: string;
  Tm_pred: number;
  Tm_celsius: number;
  uncertainty?: string;
  created_at: string;
  source: string;
}

export interface CompoundsListResponse {
  total: number;
  compounds: Compound[];
}

export interface RangeFilter {
  min_tm: number;
  max_tm: number;
}

export interface RangeResponse {
  filter: RangeFilter;
  count: number;
  percentage: number;
  predictions: Prediction[];
}

export interface FunctionalGroupStats {
  name: string;
  pattern: string;
  count: number;
  avg_tm: number;
  min_tm: number;
  max_tm: number;
}

export interface FunctionalGroupsResponse {
  total_molecules: number;
  groups: FunctionalGroupStats[];
  note?: string;
}

export interface DistributionCategory {
  name: string;
  description: string;
  range_min: number;
  range_max: number;
  count: number;
  percentage: number;
}

export interface DistributionResponse {
  total: number;
  categories: DistributionCategory[];
}

export interface MoleculeSizeGroup {
  name: string;
  smiles_length_min: number;
  smiles_length_max: number;
  count: number;
  avg_tm: number;
  min_tm: number;
  max_tm: number;
}

export interface MoleculeSizeResponse {
  total_molecules: number;
  size_groups: MoleculeSizeGroup[];
  note?: string;
}

// ============================================
// API CLIENT
// ============================================

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Error desconocido' }));
      throw new ApiError(response.status, error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(0, 'No se pudo conectar al servidor');
  }
}

// ============================================
// INFO ENDPOINTS
// ============================================

export async function checkHealth(): Promise<HealthResponse> {
  return fetchApi<HealthResponse>('/health');
}

export async function getModelInfo(): Promise<ModelInfo> {
  return fetchApi<ModelInfo>('/model-info');
}

// ============================================
// VALIDATION ENDPOINTS
// ============================================

export async function validateSmiles(smiles: string): Promise<ValidateSmilesResponse> {
  return fetchApi<ValidateSmilesResponse>('/validate-smiles', {
    method: 'POST',
    body: JSON.stringify({ smiles }),
  });
}

// ============================================
// PREDICTIONS ENDPOINTS
// ============================================

export async function predictAll(): Promise<Prediction[]> {
  return fetchApi<Prediction[]>('/predict-all');
}

export async function predictById(id: number): Promise<Prediction> {
  return fetchApi<Prediction>('/predict-by-id', {
    method: 'POST',
    body: JSON.stringify({ id }),
  });
}

// ============================================
// ANALYTICS ENDPOINTS
// ============================================

export async function getStatistics(): Promise<Statistics> {
  return fetchApi<Statistics>('/stats');
}

export async function getPredictionsRange(minTm: number, maxTm: number): Promise<RangeResponse> {
  return fetchApi<RangeResponse>(`/predictions/range?min_tm=${minTm}&max_tm=${maxTm}`);
}

export async function getByFunctionalGroup(): Promise<FunctionalGroupsResponse> {
  return fetchApi<FunctionalGroupsResponse>('/predictions/by-functional-group');
}

export async function getDistribution(): Promise<DistributionResponse> {
  return fetchApi<DistributionResponse>('/predictions/distribution');
}

export async function getByMoleculeSize(): Promise<MoleculeSizeResponse> {
  return fetchApi<MoleculeSizeResponse>('/predictions/by-molecule-size');
}

// ============================================
// USER COMPOUNDS ENDPOINTS
// ============================================

export async function getCompounds(): Promise<CompoundsListResponse> {
  return fetchApi<CompoundsListResponse>('/compounds');
}

export async function createCompound(smiles: string, name: string): Promise<Compound> {
  return fetchApi<Compound>('/compounds', {
    method: 'POST',
    body: JSON.stringify({ smiles, name }),
  });
}

export async function deleteCompound(id: string): Promise<void> {
  return fetchApi<void>(`/compounds/${id}`, {
    method: 'DELETE',
  });
}

// ============================================
// UTILIDADES
// ============================================

export function kelvinToCelsius(kelvin: number): number {
  return kelvin - 273.15;
}

// Constantes del modelo
export const MODEL_MAE = 28.85;
export const MODEL_MAE_STD = 3.16;
