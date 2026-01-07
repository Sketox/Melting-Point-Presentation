const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface PredictionResponse {
  id: number;
  Tm_pred: number;
}

export interface HealthResponse {
  status: string;
}

// Health Check
export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) throw new Error('API no disponible');
  return response.json();
}

// Obtener predicción por ID
export async function predictById(id: number): Promise<PredictionResponse> {
  const response = await fetch(`${API_BASE_URL}/predict-by-id`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`ID ${id} no encontrado en el dataset`);
    }
    throw new Error('Error al obtener predicción');
  }
  
  return response.json();
}

// Obtener todas las predicciones
export async function predictAll(): Promise<PredictionResponse[]> {
  const response = await fetch(`${API_BASE_URL}/predict-all`);
  if (!response.ok) throw new Error('Error al obtener predicciones');
  return response.json();
}