export interface Prediction {
  id: number;
  smiles: string;
  Tm_pred: number;
}

export interface Statistics {
  count: number;
  mean: number;
  std: number;
  min: number;
  max: number;
  q25: number;
  median: number;
  q75: number;
}

export interface HistogramBin {
  range: string;
  count: number;
  min: number;
  max: number;
}

export interface MolecularFeatures {
  atomCount: number;
  hasRing: boolean;
  hasBenzene: boolean;
  hasHalogen: boolean;
  hasNitrogen: boolean;
  hasOxygen: boolean;
  hasSulfur: boolean;
  molecularWeight: number;
}

export interface EndpointInfo {
  name: string;
  method: 'GET' | 'POST';
  endpoint: string;
  description: string;
  requestBody?: string;
  responseExample: string;
}

export interface UserPrediction {
  id: string;
  user_id: string;
  username: string;
  smiles: string;
  tm_pred: number;
  tm_pred_celsius: number;
  compound_name?: string;
  notes?: string;
  is_favorite: boolean;
  created_at: string;
}

export interface SavePredictionData {
  smiles: string;
  tm_pred: number;
  compound_name?: string;
  notes?: string;
  is_favorite?: boolean;
}

export interface UpdatePredictionData {
  compound_name?: string;
  notes?: string;
  is_favorite?: boolean;
}
