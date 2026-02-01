/**
 * Utilidades químicas para generar nombres descriptivos de compuestos
 * basados en SMILES
 */

export function generateCompoundName(smiles: string): string {
  if (!smiles) return 'Compuesto desconocido';

  const features: string[] = [];
  const length = smiles.length;
  
  // Detectar grupos funcionales y características
  const hasAromatic = /c1/.test(smiles) || /c2/.test(smiles);
  const hasOH = /O[^C=]/.test(smiles) && smiles.includes('O');
  const hasCOOH = /C\(=O\)O/.test(smiles);
  const hasNH2 = /N/.test(smiles);
  const hasF = /F/.test(smiles);
  const hasCl = /Cl/.test(smiles);
  const hasBr = /Br/.test(smiles);
  const hasI = /I/.test(smiles);
  const hasS = /S/.test(smiles);
  const hasP = /P/.test(smiles);
  const hasDoubleBond = /=/.test(smiles);
  const hasTripleBond = /#/.test(smiles);
  const hasCarbonyl = /C=O/.test(smiles) || /O=C/.test(smiles);
  const hasEster = /C\(=O\)O/.test(smiles) && /OC/.test(smiles);
  
  // Contar átomos de carbono aproximados
  const carbonCount = (smiles.match(/C/g) || []).length;
  
  // Generar nombre descriptivo
  if (hasCOOH) {
    features.push('Ácido carboxílico');
  } else if (hasEster) {
    features.push('Éster');
  } else if (hasCarbonyl) {
    features.push('Cetona/Aldehído');
  }
  
  if (hasAromatic) {
    features.push('aromático');
  }
  
  if (hasOH && !hasCOOH) {
    features.push('con grupo hidroxilo');
  }
  
  if (hasNH2) {
    features.push('con amina');
  }
  
  const halogens = [];
  if (hasF) halogens.push('F');
  if (hasCl) halogens.push('Cl');
  if (hasBr) halogens.push('Br');
  if (hasI) halogens.push('I');
  
  if (halogens.length > 0) {
    features.push(`halogenado (${halogens.join(', ')})`);
  }
  
  if (hasS) {
    features.push('con azufre');
  }
  
  if (hasP) {
    features.push('con fósforo');
  }
  
  if (hasTripleBond) {
    features.push('con triple enlace');
  } else if (hasDoubleBond && !hasCarbonyl) {
    features.push('insaturado');
  }
  
  // Clasificar por tamaño
  let sizeClass = '';
  if (carbonCount <= 5) {
    sizeClass = 'pequeño';
  } else if (carbonCount <= 15) {
    sizeClass = 'mediano';
  } else {
    sizeClass = 'grande';
  }
  
  // Construir nombre final
  if (features.length === 0) {
    return `Hidrocarburo ${sizeClass} (C${carbonCount})`;
  }
  
  const baseName = features[0];
  const additionalFeatures = features.slice(1);
  
  if (additionalFeatures.length > 0) {
    return `${baseName} ${additionalFeatures.join(', ')}`;
  }
  
  return baseName;
}

export function getSmilesAbbreviation(smiles: string, maxLength: number = 30): string {
  if (smiles.length <= maxLength) {
    return smiles;
  }
  return smiles.substring(0, maxLength) + '...';
}

export function getMolecularFormulaHint(smiles: string): string {
  const elements: Record<string, number> = {};
  
  // Contar elementos comunes
  const carbonCount = (smiles.match(/C/g) || []).length;
  const oxygenCount = (smiles.match(/O/g) || []).length;
  const nitrogenCount = (smiles.match(/N/g) || []).length;
  const sulfurCount = (smiles.match(/S/g) || []).length;
  const fluorineCount = (smiles.match(/F/g) || []).length;
  const chlorineCount = (smiles.match(/Cl/g) || []).length;
  const bromineCount = (smiles.match(/Br/g) || []).length;
  
  let formula = '';
  if (carbonCount > 0) formula += `C${carbonCount > 1 ? carbonCount : ''}`;
  // Nota: Esta es una estimación muy simplificada, no es precisa
  
  if (!formula) return 'Fórmula aproximada no disponible';
  
  return formula + '...';
}
