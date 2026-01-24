# 🔥 Melting Point Dashboard

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-2.x-8884d8?style=for-the-badge)

**Interactive dashboard for molecular melting point predictions**

[Demo](#-pages) • [Installation](#-installation) • [Structure](#-project-structure) • [API Client](#-api-client)

</div>

---

## 📋 Description

Modern dashboard built with **Next.js 14** to visualize and analyze molecular melting point predictions. Connects to the FastAPI backend to retrieve predictions from the trained ChemProp D-MPNN model.

### ✨ Features

- 🎨 **Modern Design** - Dark theme inspired by Claude (Anthropic)
- 📊 **Interactive Visualizations** - Charts with Recharts
- 🔬 **Real-time SMILES Validation** - Debounced validation with visual feedback
- 💾 **Compound Management** - Create, view, and delete custom compounds
- 📱 **Responsive** - Adapted for mobile, tablet, and desktop
- ⚡ **Smooth Animations** - Framer Motion for fluid transitions

---

## 🎯 Pages

| Page | Route | Description |
|------|-------|-------------|
| **Home** | `/` | Hero section, statistics, features overview |
| **Predictions** | `/predictions` | Search by ID, filters, user compounds, data table |
| **Analytics** | `/analytics` | Distribution charts, functional groups, statistics |
| **Model** | `/model` | ChemProp architecture, metrics (MAE: 28.85 ± 3.16 K) |
| **About** | `/about` | Project information and Kaggle competition |
| **API Docs** | `/api-docs` | Endpoint documentation with examples |

---

## 🚀 Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend running on `http://localhost:8000`

### Step by Step

```bash
# 1. Navigate to frontend directory
cd MeltingPoint/frontend

# 2. Install dependencies
npm install

# 3. Configure environment variable (optional)
# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# 4. Run in development mode
npm run dev

# 5. Open in browser
# http://localhost:3000
```

### Available Scripts

```bash
npm run dev      # Development with hot-reload
npm run build    # Production build
npm run start    # Production server
npm run lint     # Code verification
```

---

## 🎨 Color Theme

Palette inspired by Claude (Anthropic):

| Color | CSS Variable | Hex | Usage |
|-------|-------------|-----|-------|
| **Orange** | `--claude-orange` | `#da7756` | Accents, CTAs |
| **Orange Dark** | `--claude-orange-dark` | `#c45a3a` | Hover states |
| **Background** | `--claude-bg` | `#1a1a1a` | Main background |
| **Secondary BG** | `--claude-bg-secondary` | `#2a2a2a` | Cards |
| **Text** | `--claude-text` | `#f5f5f5` | Primary text |
| **Text Secondary** | `--claude-text-secondary` | `#a0a0a0` | Secondary text |
| **Border** | `--claude-border` | `#3a3a3a` | Borders |

---

## 📁 Project Structure

```
frontend/
├── 📁 src/
│   ├── 📁 app/
│   │   ├── globals.css       # Global styles, Claude theme
│   │   ├── layout.tsx        # Main layout (Navbar, Footer)
│   │   ├── page.tsx          # Home page
│   │   ├── 📁 predictions/
│   │   │   └── page.tsx      # Search, filters, user compounds
│   │   ├── 📁 analytics/
│   │   │   └── page.tsx      # Charts and statistics
│   │   ├── 📁 model/
│   │   │   └── page.tsx      # ChemProp model info
│   │   ├── 📁 about/
│   │   │   └── page.tsx      # About the project
│   │   └── 📁 api-docs/
│   │       └── page.tsx      # API documentation
│   │
│   ├── 📁 components/
│   │   ├── Navbar.tsx        # Responsive navigation
│   │   ├── Footer.tsx        # Page footer
│   │   ├── StatsGrid.tsx     # Statistics cards
│   │   ├── Histogram.tsx     # Distribution chart
│   │   ├── ScatterPlot.tsx   # Scatter plot
│   │   ├── PredictionsTable.tsx  # Interactive table
│   │   ├── PredictById.tsx   # Search by ID
│   │   └── ApiDocumentation.tsx  # API docs
│   │
│   └── 📁 lib/
│       └── api.ts            # API client, types, utilities
│
├── tailwind.config.ts
├── next.config.js
├── package.json
├── CLAUDE.md
└── README.md
```

---

## 🔌 API Client

### Configuration

```typescript
// src/lib/api.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const MODEL_MAE = 28.85;      // Model uncertainty in K
export const MODEL_MAE_STD = 3.16;   // Standard deviation
```

### Main Functions

```typescript
// Health & Info
checkHealth(): Promise<HealthResponse>
getModelInfo(): Promise<ModelInfo>

// SMILES Validation
validateSmiles(smiles: string): Promise<ValidateSmilesResponse>

// Predictions
predictAll(): Promise<Prediction[]>
predictById(id: number): Promise<Prediction>

// Analytics
getStatistics(): Promise<Statistics>
getDistribution(): Promise<DistributionResponse>
getByFunctionalGroup(): Promise<FunctionalGroupsResponse>
getByMoleculeSize(): Promise<MoleculeSizeResponse>
getPredictionsRange(min: number, max: number): Promise<RangeResponse>

// User Compounds
getCompounds(): Promise<CompoundsListResponse>
createCompound(smiles: string, name: string): Promise<Compound>
deleteCompound(id: string): Promise<void>

// Utilities
kelvinToCelsius(k: number): number  // k - 273.15
```

### Main Types

```typescript
interface Prediction {
  id: number;
  Tm_pred: number;
  smiles?: string;
}

interface Compound {
  id: string;           // "USR_001"
  smiles: string;
  name: string;
  Tm_pred: number;      // Kelvin
  Tm_celsius: number;   // Celsius
  uncertainty: string;  // "±28.9 K"
  created_at: string;
  source: string;
}

interface Statistics {
  count: number;
  mean: number;
  std: number;
  min: number;
  max: number;
  median: number;
  q25: number;
  q75: number;
}

interface ValidateSmilesResponse {
  valid: boolean;
  canonical_smiles?: string;
  num_atoms?: number;
  molecular_weight?: number;
  error?: string;
}
```

---

## 🔬 Real-time SMILES Validation

### Implementation with Debounce

```typescript
const [newSmiles, setNewSmiles] = useState('');
const [smilesValidation, setSmilesValidation] = useState<ValidateSmilesResponse | null>(null);

// 500ms debounce
useEffect(() => {
  if (!newSmiles.trim()) {
    setSmilesValidation(null);
    return;
  }
  
  const timeout = setTimeout(async () => {
    const result = await validateSmiles(newSmiles);
    setSmilesValidation(result);
  }, 500);
  
  return () => clearTimeout(timeout);
}, [newSmiles]);
```

### Visual Indicators

- ✅ **Green border** - Valid SMILES
- ❌ **Red border** - Invalid SMILES
- ℹ️ Shows atom count and molecular weight when valid

---

## 📦 Main Dependencies

```json
{
  "next": "14.2.x",
  "react": "18.2.x",
  "typescript": "5.x",
  "tailwindcss": "3.x",
  "framer-motion": "10.x",
  "recharts": "2.x",
  "lucide-react": "0.x"
}
```

---

## ⚠️ Important Notes

1. **Uncertainty**: Always display ±28.9 K on user compound predictions
2. **Validation**: Check `smilesValidation?.valid` before enabling "Save"
3. **Backend**: Ensure it's running on port 8000 before starting frontend
4. **Container**: Each page must include its own `max-w-7xl mx-auto px-4...` container

---

## 🔧 Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| "Cannot connect to server" | Backend not available | Run `uvicorn app.main:app --reload` |
| Prediction shows 161 K for water | ChemProp not working | Run `patch_chemprop_torch.py` in backend |
| Content stuck to edges | Missing container | Add `max-w-7xl mx-auto px-4 py-8` |
| Empty charts | Data not loaded | Check loading/error states |

---

## 📄 License

MIT License

---

<div align="center">

**Developed for the Kaggle Thermophysical Property Competition** 🔥

</div>