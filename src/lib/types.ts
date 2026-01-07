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
