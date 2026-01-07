import { Prediction, Statistics, HistogramBin, MolecularFeatures } from './types';

// Parse CSV data
export function parseCSV(csvText: string): Prediction[] {
  const lines = csvText.trim().split('\n');
  const predictions: Prediction[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Handle SMILES that might contain commas (though unlikely)
    const lastCommaIndex = line.lastIndexOf(',');
    const smiles = line.substring(0, lastCommaIndex);
    const target = parseFloat(line.substring(lastCommaIndex + 1));
    
    predictions.push({
      id: i,
      smiles: smiles,
      Tm_pred: target
    });
  }
  
  return predictions;
}

// Calculate statistics
export function calculateStatistics(predictions: Prediction[]): Statistics {
  const values = predictions.map(p => p.Tm_pred).sort((a, b) => a - b);
  const n = values.length;
  
  const sum = values.reduce((acc, val) => acc + val, 0);
  const mean = sum / n;
  
  const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
  const std = Math.sqrt(variance);
  
  return {
    count: n,
    mean: mean,
    std: std,
    min: values[0],
    max: values[n - 1],
    q25: values[Math.floor(n * 0.25)],
    median: values[Math.floor(n * 0.5)],
    q75: values[Math.floor(n * 0.75)]
  };
}

// Create histogram bins
export function createHistogramBins(predictions: Prediction[], binCount: number = 20): HistogramBin[] {
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
      count: count,
      min: binMin,
      max: binMax
    });
  }
  
  return bins;
}

// Extract basic molecular features from SMILES
export function extractMolecularFeatures(smiles: string): MolecularFeatures {
  // Simple heuristic-based feature extraction
  const atomPattern = /[A-Z][a-z]?/g;
  const atoms = smiles.match(atomPattern) || [];
  
  // Count carbons and other atoms (simplified)
  let carbonCount = (smiles.match(/C(?![l])/g) || []).length;
  let hydrogenEstimate = carbonCount * 2; // Very rough estimate
  
  // Molecular weight estimation (very simplified)
  const atomWeights: Record<string, number> = {
    'C': 12, 'H': 1, 'O': 16, 'N': 14, 'S': 32, 'F': 19, 
    'Cl': 35.5, 'Br': 80, 'I': 127, 'P': 31, 'Si': 28
  };
  
  let mw = 0;
  for (const atom of atoms) {
    mw += atomWeights[atom] || 12;
  }
  mw += hydrogenEstimate; // Add estimated hydrogens
  
  return {
    atomCount: atoms.length,
    hasRing: smiles.includes('1') || smiles.includes('2'),
    hasBenzene: smiles.toLowerCase().includes('c1ccccc1') || smiles.includes('c1cc'),
    hasHalogen: /[FClBrI]/.test(smiles),
    hasNitrogen: smiles.includes('N') || smiles.includes('n'),
    hasOxygen: smiles.includes('O') || smiles.includes('o'),
    hasSulfur: smiles.includes('S') || smiles.includes('s'),
    molecularWeight: mw
  };
}

// Get functional group description
export function getFunctionalGroups(smiles: string): string[] {
  const groups: string[] = [];
  
  if (smiles.includes('C(=O)O') || smiles.includes('C(O)=O')) groups.push('Carboxylic Acid');
  if (smiles.includes('C(=O)N') || smiles.includes('NC=O')) groups.push('Amide');
  if (smiles.includes('C(=O)C') && !smiles.includes('C(=O)O')) groups.push('Ketone');
  if (smiles.includes('C=O') && !smiles.includes('C(=O)')) groups.push('Aldehyde');
  if (smiles.includes('COC') || smiles.includes('OC')) groups.push('Ether');
  if (/O[^C=]/.test(smiles) || smiles.endsWith('O')) groups.push('Alcohol/Hydroxyl');
  if (smiles.includes('N(=O)=O') || smiles.includes('[N+]([O-])=O')) groups.push('Nitro');
  if (smiles.includes('C#N') || smiles.includes('N#C')) groups.push('Nitrile');
  if (smiles.includes('c1') || smiles.includes('C1')) groups.push('Cyclic');
  if (smiles.includes('C=C') || smiles.includes('c=c')) groups.push('Alkene');
  if (smiles.includes('C#C')) groups.push('Alkyne');
  if (smiles.includes('S')) groups.push('Sulfur-containing');
  if (/[FClBrI]/.test(smiles)) groups.push('Halogenated');
  
  return groups.length > 0 ? groups : ['Hydrocarbon'];
}

// Format temperature in Kelvin to Celsius
export function kelvinToCelsius(kelvin: number): number {
  return kelvin - 273.15;
}

// Format numbers with locale
export function formatNumber(num: number, decimals: number = 2): string {
  return num.toLocaleString('en-US', { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  });
}

// Get color based on temperature (for heatmap-style visualization)
export function getTemperatureColor(temp: number, min: number, max: number): string {
  const normalized = (temp - min) / (max - min);
  
  // Blue (cold) to Orange (hot)
  if (normalized < 0.5) {
    const intensity = normalized * 2;
    return `rgba(100, ${150 + intensity * 50}, 255, ${0.3 + normalized * 0.4})`;
  } else {
    const intensity = (normalized - 0.5) * 2;
    return `rgba(218, ${119 - intensity * 50}, ${86 - intensity * 50}, ${0.5 + intensity * 0.5})`;
  }
}

// Search predictions by SMILES substring
export function searchPredictions(predictions: Prediction[], query: string): Prediction[] {
  const lowerQuery = query.toLowerCase();
  return predictions.filter(p => 
    p.smiles.toLowerCase().includes(lowerQuery) ||
    p.id.toString().includes(query)
  );
}

// Sort predictions
export function sortPredictions(
  predictions: Prediction[], 
  sortBy: 'id' | 'smiles' | 'Tm_pred', 
  ascending: boolean = true
): Prediction[] {
  return [...predictions].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'id') comparison = a.id - b.id;
    else if (sortBy === 'smiles') comparison = a.smiles.localeCompare(b.smiles);
    else if (sortBy === 'Tm_pred') comparison = a.Tm_pred - b.Tm_pred;
    return ascending ? comparison : -comparison;
  });
}
