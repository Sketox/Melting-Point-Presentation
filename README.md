# Melting Point Dashboard

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-2.x-8884d8?style=for-the-badge)

**Interactive dashboard for molecular melting point predictions**

[Pages](#pages) | [Installation](#installation) | [Structure](#project-structure) | [API Client](#api-client)

</div>

---

## Description

Modern dashboard built with **Next.js 14** to visualize and analyze molecular melting point predictions. Connects to the FastAPI backend to retrieve predictions from the hybrid model (ChemProp D-MPNN + XGB+LGB Ensemble, MAE 22.80 K).

### Features

- **Modern Design** - Dark theme inspired by Claude (Anthropic)
- **Interactive Visualizations** - Charts with Recharts
- **Real-time SMILES Validation** - Debounced validation with visual feedback
- **Compound Management** - Create, view, and delete custom compounds
- **Three Data Sources** - Train (green), Test (blue), User (orange)
- **Responsive** - Adapted for mobile, tablet, and desktop
- **Smooth Animations** - Framer Motion for fluid transitions

---

## Pages

| Page | Route | Description |
|------|-------|-------------|
| **Home** | `/` | Hero section, statistics, features overview |
| **Predictions** | `/predictions` | Unified table with source filter, search, user compounds |
| **Analytics** | `/analytics` | Distribution charts, functional groups, statistics by source |
| **Model** | `/model` | Hybrid model architecture, metrics (MAE: 22.80 K) |
| **About** | `/about` | Project information and Kaggle competition |
| **API Docs** | `/api-docs` | Endpoint documentation with examples |

---

## Installation

### Prerequisites

- **Node.js 18+**
- **npm** or yarn
- **Backend running** on `http://localhost:8000` (see [backend README](../MeltingPoint/README.md))

### Step by Step

```bash
# 1. Navigate to frontend directory
cd melting-point-dashboard

# 2. Install dependencies
npm install

# 3. Run in development mode
npm run dev

# 4. Open in browser
# http://localhost:3000
```

### Available Scripts

```bash
npm run dev      # Development with hot-reload
npm run build    # Production build
npm run start    # Production server
npm run lint     # Code verification
```

### Environment Variables (optional)

Create `.env.local` to customize the API URL:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Color Theme

Palette inspired by Claude (Anthropic):

| Color | CSS Variable | Hex | Usage |
|-------|-------------|-----|-------|
| **Orange** | `--claude-orange` | `#E07A3A` | Accents, CTAs |
| **Background** | `--claude-bg` | `#1a1a1a` | Main background |
| **Secondary BG** | `--claude-bg-secondary` | `#242424` | Cards |
| **Text** | `--claude-text` | `#f5f5f5` | Primary text |
| **Border** | `--claude-border` | `#333333` | Borders |

### Source Color Coding

| Source | Color | Hex | Description |
|--------|-------|-----|-------------|
| **Train** | Green | `#4ade80` | 2,662 compounds with real measured Tm |
| **Test** | Blue | `#60a5fa` | 666 compounds with predicted Tm |
| **User** | Orange | `#f5a623` | User-added compounds |

---

## Project Structure

```
melting-point-dashboard/
├── src/
│   ├── app/
│   │   ├── globals.css       # Global styles, Claude theme
│   │   ├── layout.tsx        # Main layout (Navbar, Footer)
│   │   ├── page.tsx          # Home page
│   │   ├── predictions/      # Search, filters, user compounds
│   │   ├── analytics/        # Charts and statistics
│   │   ├── model/            # Model info
│   │   ├── about/            # About the project
│   │   ├── api-docs/         # API documentation
│   │   ├── login/            # Login page
│   │   └── register/         # Register page
│   ├── components/
│   │   ├── Navbar.tsx        # Responsive navigation
│   │   ├── Footer.tsx        # Page footer
│   │   ├── StatsGrid.tsx     # Statistics cards
│   │   ├── Histogram.tsx     # Distribution chart
│   │   ├── ScatterPlot.tsx   # Scatter plot
│   │   └── PredictionsTable.tsx  # Interactive table
│   └── lib/
│       └── api.ts            # API client, types, utilities
├── tailwind.config.ts
├── next.config.js
├── package.json
├── CLAUDE.md
└── README.md
```

---

## API Client

### Configuration

```typescript
// src/lib/api.ts
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const MODEL_MAE = 22.80;  // Hybrid model uncertainty in K

export const SOURCE_COLORS = {
  train: '#4ade80',  // Green - real data
  test: '#60a5fa',   // Blue - predictions
  user: '#f5a623',   // Orange - user compounds
};
```

### Main Functions

```typescript
// Health & Info
checkHealth(): Promise<HealthResponse>
getModelInfo(): Promise<ModelInfo>

// SMILES Validation
validateSmiles(smiles: string): Promise<ValidateSmilesResponse>

// Data
getAllData(): Promise<DataItem[]>        // Train + Test + User combined
getCompoundName(smiles: string): Promise<CompoundNameResponse>

// Predictions
predictAll(): Promise<Prediction[]>
predictById(id: number): Promise<Prediction>

// Analytics
getStatistics(): Promise<Statistics>
getDistribution(): Promise<DistributionResponse>
getByFunctionalGroup(): Promise<FunctionalGroupsResponse>
getByMoleculeSize(): Promise<MoleculeSizeResponse>

// User Compounds
getCompounds(): Promise<CompoundsListResponse>
createCompound(smiles: string, name: string): Promise<Compound>
deleteCompound(id: string): Promise<void>
```

---

## Dependencies

```json
{
  "next": "14.0.3",
  "react": "^18.2.0",
  "typescript": "^5.2.2",
  "tailwindcss": "^3.3.5",
  "framer-motion": "^10.16.4",
  "recharts": "^2.9.3",
  "lucide-react": "^0.292.0"
}
```

---

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| "Cannot connect to server" | Backend not running | Start backend on port 8000 first |
| Prediction shows 161 K for water | ChemProp not patched | Run `patch_chemprop_torch.py` in backend |
| Empty charts | Data not loaded | Check backend is running and responding |
| `npm install` fails | Node version too old | Use Node.js 18+ |

---

## License

MIT License

---

<div align="center">

**Developed for the Kaggle Thermophysical Property Competition**

</div>
