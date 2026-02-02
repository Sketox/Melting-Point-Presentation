/**
 * Utilidades para buscar información de compuestos en PubChem
 */

export interface PubChemCompoundInfo {
  name: string | null;
  iupacName: string | null;
  molecularFormula: string | null;
  molecularWeight: number | null;
}

/**
 * Busca el nombre de un compuesto por su SMILES usando la API de PubChem
 */
export async function fetchCompoundNameBySmiles(smiles: string): Promise<string | null> {
  try {
    // Buscar por SMILES en PubChem
    const searchUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smiles)}/property/Title,IUPACName/JSON`;
    
    const response = await fetch(searchUrl, {
      signal: AbortSignal.timeout(5000), // 5 segundos timeout
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    // Priorizar nombre común (Title) sobre nombre IUPAC
    const title = data.PropertyTable?.Properties?.[0]?.Title;
    const iupacName = data.PropertyTable?.Properties?.[0]?.IUPACName;
    
    return title || iupacName || null;
  } catch (error) {
    console.error('Error fetching compound name from PubChem:', error);
    return null;
  }
}

/**
 * Busca información completa de un compuesto por SMILES
 */
export async function fetchCompoundInfo(smiles: string): Promise<PubChemCompoundInfo | null> {
  try {
    const searchUrl = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smiles)}/property/Title,IUPACName,MolecularFormula,MolecularWeight/JSON`;
    
    const response = await fetch(searchUrl, {
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    const props = data.PropertyTable?.Properties?.[0];
    
    if (!props) {
      return null;
    }
    
    return {
      name: props.Title || null,
      iupacName: props.IUPACName || null,
      molecularFormula: props.MolecularFormula || null,
      molecularWeight: props.MolecularWeight || null,
    };
  } catch (error) {
    console.error('Error fetching compound info from PubChem:', error);
    return null;
  }
}
