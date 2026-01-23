// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Prediction {
  id: number;
  smiles: string;
  Tm_pred: number;
  Tm_celsius?: number;
}

export interface Statistics {
  count: number;
  mean: number;
  std: number;
  min: number;
  max: number;
  median: number;
}

export interface HistogramBin {
  range: string;
  count: number;
  min: number;
  max: number;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  dataset_loaded: boolean;
  timestamp: string;
}

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

export async function checkHealth(): Promise<HealthResponse> {
  return fetchApi<HealthResponse>('/health');
}

export async function predictAll(): Promise<Prediction[]> {
  return fetchApi<Prediction[]>('/predict-all');
}

export async function predictById(id: number): Promise<Prediction> {
  return fetchApi<Prediction>(`/predict/${id}`);
}

export async function getStatistics(): Promise<Statistics> {
  return fetchApi<Statistics>('/stats');
}

export async function getHistogram(bins: number = 14): Promise<HistogramBin[]> {
  return fetchApi<HistogramBin[]>(`/histogram?bins=${bins}`);
}

export function kelvinToCelsius(kelvin: number): number {
  return kelvin - 273.15;
}

export function calculateStats(predictions: Prediction[]): Statistics {
  const values = predictions.map(p => p.Tm_pred).sort((a, b) => a - b);
  const n = values.length;
  const sum = values.reduce((acc, val) => acc + val, 0);
  const mean = sum / n;
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
  
  return {
    count: n,
    mean,
    std: Math.sqrt(variance),
    min: values[0],
    max: values[n - 1],
    median: values[Math.floor(n / 2)]
  };
}

export function createHistogramData(predictions: Prediction[], binCount: number = 14): HistogramBin[] {
  const values = predictions.map(p => p.Tm_pred);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const binWidth = (max - min) / binCount;
  
  const bins: HistogramBin[] = [];
  for (let i = 0; i < binCount; i++) {
    const binMin = min + i * binWidth;
    const binMax = min + (i + 1) * binWidth;
    const count = values.filter(v => v >= binMin && (i === binCount - 1 ? v <= binMax : v < binMax)).length;
    bins.push({
      range: `${binMin.toFixed(0)}-${binMax.toFixed(0)}`,
      count,
      min: binMin,
      max: binMax
    });
  }
  return bins;
}