# 🔥 Melting Point Predictor

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi)
![ChemProp](https://img.shields.io/badge/ChemProp-MPNN-orange?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

**Predicción de puntos de fusión moleculares usando Machine Learning**

[Demo](#-demo) • [Instalación](#-instalación) • [API](#-api-endpoints) • [Modelo](#-modelo-ml) • [Estructura](#-estructura-del-proyecto)

</div>

---

## 📋 Descripción

Este proyecto implementa una solución completa de Machine Learning para la competencia [Kaggle Melting Point](https://www.kaggle.com/competitions/melting-point), que consiste en predecir el punto de fusión (Tm) de moléculas a partir de su representación SMILES.

### Características principales:

- 🧠 **Modelo ChemProp** - Red neuronal de paso de mensajes (MPNN) especializada en propiedades moleculares
- 🚀 **API REST** - Backend FastAPI con endpoints para predicciones individuales y masivas
- 🎨 **Dashboard Interactivo** - Frontend Next.js con visualizaciones y estadísticas en tiempo real
- 📊 **Visualizaciones** - Histogramas, scatter plots y tablas interactivas con Recharts

---

## 🎯 Demo

### Vista del Dashboard

El dashboard incluye:

| Sección | Descripción |
|---------|-------------|
| **Hero** | Presentación del proyecto con métricas clave |
| **Estadísticas** | Cards con count, mean, std, min, max, median |
| **Histograma** | Distribución de predicciones de Tm |
| **Scatter Plot** | Complejidad molecular vs punto de fusión |
| **Predicción por ID** | Búsqueda interactiva de moléculas |
| **Tabla de Datos** | Todas las predicciones con búsqueda y paginación |
| **Documentación API** | Referencia de endpoints con ejemplos cURL |

---

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+ 
- Python 3.10+
- npm o yarn

### Frontend (Next.js)

```bash
# 1. Clonar o descomprimir el proyecto
cd melting-point-dashboard

# 2. Instalar dependencias
npm install

# 3. Ejecutar en modo desarrollo
npm run dev

# 4. Abrir en el navegador
# http://localhost:3000
```

### Backend (FastAPI)

```bash
# 1. Navegar al directorio backend
cd backend

# 2. Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# o en Windows: venv\Scripts\activate

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Ejecutar el servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 5. Documentación automática disponible en:
# http://localhost:8000/docs (Swagger UI)
# http://localhost:8000/redoc (ReDoc)
```

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:8000
```

### Endpoints Disponibles

#### 1. Health Check
Verifica el estado del servidor y la disponibilidad del modelo.

```http
GET /health
```

**Response:**
```json
{
  "status": "ok"
}
```

---

#### 2. Predict by ID
Obtiene la predicción del punto de fusión para un ID específico del dataset de test.

```http
POST /predict-by-id
Content-Type: application/json
```

**Request Body:**
```json
{
  "id": 1
}
```

**Response:**
```json
{
  "id": 1,
  "Tm_pred": 341.51
}
```

**Ejemplo cURL:**
```bash
curl -X POST "http://localhost:8000/predict-by-id" \
  -H "Content-Type: application/json" \
  -d '{"id": 1}'
```

---

#### 3. Predict All
Obtiene todas las predicciones del dataset de test completo.

```http
GET /predict-all
```

**Response:**
```json
[
  { "id": 1, "Tm_pred": 341.51 },
  { "id": 2, "Tm_pred": 372.55 },
  { "id": 3, "Tm_pred": 205.82 },
  ...
]
```

**Ejemplo cURL:**
```bash
curl -X GET "http://localhost:8000/predict-all"
```

---

## 🧠 Modelo ML

### ChemProp (D-MPNN)

El modelo utiliza **ChemProp**, una implementación de redes neuronales de paso de mensajes dirigidos (D-MPNN) diseñada específicamente para la predicción de propiedades moleculares.

### Arquitectura

```
SMILES Input → Molecular Graph → Message Passing → Readout → Prediction
     ↓              ↓                  ↓            ↓          ↓
  "CCO..."    Atoms + Bonds      Neural Network   Pooling    Tm (K)
```

### Características del Modelo

| Parámetro | Valor |
|-----------|-------|
| **Tipo** | Message Passing Neural Network (MPNN) |
| **Arquitectura** | Directed MPNN (D-MPNN) |
| **Validación** | 5-Fold Cross-Validation |
| **Input** | SMILES (Simplified Molecular Input Line Entry System) |
| **Output** | Punto de fusión en Kelvin (K) |

### Métricas de Rendimiento

| Métrica | Valor |
|---------|-------|
| **RMSE** | 42.3 K |
| **MAE** | 31.8 K |
| **R²** | 0.847 |

### Entrenamiento

El modelo fue entrenado con validación cruzada de 5 folds para garantizar robustez:

```
📁 models/
├── 📁 model_chemprop/
│   ├── 📁 fold_0/
│   ├── 📁 fold_1/
│   ├── 📁 fold_2/
│   ├── 📁 fold_3/
│   ├── 📁 fold_4/
│   ├── args.json
│   └── test_scores.csv
└── model.joblib
```

---

## 📁 Estructura del Proyecto

```
MeltingPoint/
│
├── 📁 backend/                    # API FastAPI
│   ├── 📁 app/
│   │   ├── __init__.py
│   │   ├── config.py             # Configuración de rutas
│   │   ├── main.py               # Endpoints FastAPI
│   │   ├── ml_service.py         # Servicio de ML
│   │   └── schemas.py            # Esquemas Pydantic
│   │
│   └── 📁 models/
│       ├── 📁 model_chemprop/    # Modelo ChemProp entrenado
│       └── model.joblib          # Modelo serializado
│
├── 📁 frontend/                   # Dashboard Next.js
│   ├── 📁 src/
│   │   ├── 📁 app/
│   │   │   ├── globals.css       # Estilos globales
│   │   │   ├── layout.tsx        # Layout principal
│   │   │   └── page.tsx          # Página principal
│   │   │
│   │   ├── 📁 components/
│   │   │   ├── Header.tsx        # Navegación
│   │   │   ├── StatsGrid.tsx     # Tarjetas de estadísticas
│   │   │   ├── Histogram.tsx     # Gráfico de distribución
│   │   │   ├── ScatterPlot.tsx   # Scatter plot
│   │   │   ├── PredictionsTable.tsx  # Tabla interactiva
│   │   │   ├── PredictById.tsx   # Búsqueda por ID
│   │   │   ├── ModelInfo.tsx     # Info del modelo
│   │   │   └── ApiDocumentation.tsx  # Docs de API
│   │   │
│   │   ├── 📁 data/
│   │   │   └── mockData.ts       # Datos de ejemplo
│   │   │
│   │   └── 📁 lib/
│   │       ├── types.ts          # Tipos TypeScript
│   │       └── utils.ts          # Funciones auxiliares
│   │
│   ├── tailwind.config.js        # Config Tailwind
│   ├── next.config.js            # Config Next.js
│   └── package.json
│
├── 📁 data/
│   ├── 📁 raw/                   # Datos originales
│   │   ├── train.csv
│   │   ├── test.csv
│   │   └── sample_submission.csv
│   │
│   └── 📁 processed/             # Datos procesados
│       ├── train_processed.csv
│       ├── test_processed.csv
│       └── chemprop_test_preds.csv
│
├── 📁 notebooks/                  # Jupyter notebooks
├── 📁 src/                        # Scripts de entrenamiento
└── 📁 reports/                    # Reportes y figuras
```

---

## 🎨 Tecnologías Utilizadas

### Frontend
- **Next.js 14** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utilitarios
- **Framer Motion** - Animaciones
- **Recharts** - Visualizaciones de datos
- **Lucide React** - Iconos

### Backend
- **FastAPI** - Framework API moderno y rápido
- **Pydantic** - Validación de datos
- **Pandas** - Manipulación de datos
- **Joblib** - Serialización del modelo
- **ChemProp** - Modelo de ML

### Machine Learning
- **ChemProp** - D-MPNN para propiedades moleculares
- **RDKit** - Procesamiento de moléculas (opcional)
- **Scikit-learn** - Métricas y utilidades

---

## 🖌️ Paleta de Colores

El dashboard utiliza una paleta inspirada en Claude de Anthropic:

| Color | Hex | Uso |
|-------|-----|-----|
| **Background** | `#1a1a1a` | Fondo principal |
| **Secondary BG** | `#2a2a2a` | Cards y componentes |
| **Orange** | `#da7756` | Acentos y CTAs |
| **Orange Light** | `#e89b7f` | Hover states |
| **Text** | `#f5f5f5` | Texto principal |
| **Text Secondary** | `#a0a0a0` | Texto secundario |
| **Border** | `#404040` | Bordes |

---

## 📊 Dataset

### Estadísticas del Dataset de Test

| Métrica | Valor |
|---------|-------|
| **Total de muestras** | 667 moléculas |
| **Media (Tm)** | 275.89 K (2.74°C) |
| **Desviación estándar** | 82.45 K |
| **Mínimo** | 88.33 K (-184.82°C) |
| **Máximo** | 632.45 K (359.30°C) |
| **Mediana** | 268.59 K (-4.56°C) |

### Formato de Datos

**Input (SMILES):**
```
CCOC(=O)c1ccc(O)cc1
```

**Output (Tm predicho):**
```
341.51 K (68.36°C)
```

---

## 🛠️ Scripts Disponibles

### Frontend

```bash
npm run dev      # Desarrollo con hot-reload
npm run build    # Build de producción
npm run start    # Servidor de producción
npm run lint     # Verificar código
```

### Backend

```bash
# Desarrollo
uvicorn app.main:app --reload

# Producción
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## 🔧 Configuración

### Variables de Entorno (Backend)

Crear archivo `.env` en el directorio backend:

```env
MODEL_PATH=./models/model.joblib
TEST_PROCESSED_PATH=../data/processed/test_processed.csv
```

### Configuración del Frontend

El frontend se conecta al backend en `http://localhost:8000`. Para cambiar esto, modificar las llamadas fetch en los componentes o crear un archivo de configuración.

---

## 📝 Uso de la API con Python

```python
import requests

# Health check
response = requests.get("http://localhost:8000/health")
print(response.json())  # {"status": "ok"}

# Predicción por ID
response = requests.post(
    "http://localhost:8000/predict-by-id",
    json={"id": 42}
)
print(response.json())  # {"id": 42, "Tm_pred": 234.76}

# Todas las predicciones
response = requests.get("http://localhost:8000/predict-all")
predictions = response.json()
print(f"Total: {len(predictions)} predicciones")
```

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 🙏 Agradecimientos

- [Kaggle](https://www.kaggle.com/) por la competencia y dataset
- [ChemProp](https://github.com/chemprop/chemprop) por el modelo MPNN
- [Anthropic](https://www.anthropic.com/) por la inspiración del diseño

---

<div align="center">

**Hecho con 🔥 para la competencia Kaggle Melting Point**

[⬆ Volver arriba](#-melting-point-predictor)

</div>