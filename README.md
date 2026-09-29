# SOCRR-lite

**SOCRR-lite** is a fully offline, privacy-first web application that analyzes System and Organization Controls 2 (SOC 2) report PDFs. It extracts key report metadata, auditor opinion, control exceptions, subservice organization risks, and Complementary User Entity Controls (CUECs), mapping CUECs to internal controls using TF-IDF cosine similarity.

All processing occurs 100% locally on your machine—no external APIs, no CDN fonts, no cloud analytics, and zero data leakage.

---

## Quickstart

### 1. Backend Setup (FastAPI)

Requirements: Python 3.10+

```bash
# Navigate to the backend directory
cd backend

# Create and activate a virtual environment
python -m venv .venv

# On Linux/macOS:
source .venv/bin/activate
# On Windows (PowerShell):
.venv\Scripts\Activate.ps1
# On Windows (CMD):
.venv\Scripts\activate.bat

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn app.main:app --reload --port 8000
```

> **Note on Tesseract OCR**: Tesseract OCR is strictly **optional**. It is only invoked if a page has sparse native text (< 50 characters) and `tesseract` is present on your system PATH (`shutil.which("tesseract")`). If Tesseract is not installed, OCR is skipped silently without failure, and a notice is appended to `warnings`.

### 2. Frontend Setup (React + Vite)

Requirements: Node.js 18+

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the local development server
npm run dev
```

Open your browser and navigate to: **[http://localhost:5173](http://localhost:5173)**

The frontend dev server includes a reverse proxy that routes `/api/*` requests directly to `http://localhost:8000`.

---

## Running Smoke Tests

A standalone smoke test verifies that `run_pipeline` executes cleanly against a sample PDF and conforms strictly to the response contract:

```bash
# From the repository root:
python backend/tests/test_pipeline.py
```

---

## Project Structure

```
socrr-lite/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app, CORS, upload validation, routes
│   │   ├── pipeline.py          # PDF parsing, section segmentation, extraction & mapping
│   │   ├── normalize.py         # Normalization & data cleanup rules
│   │   ├── exporter.py          # JSON and multi-sheet styled Excel (openpyxl) exporter
│   │   ├── schemas.py           # Pydantic response models
│   │   └── default_controls.csv # Default internal controls list (15 rows)
│   ├── tests/
│   │   └── test_pipeline.py     # Smoke test asserting schema keys & pipeline execution
│   ├── requirements.txt         # Backend Python dependencies
│   └── README.md
├── frontend/
│   ├── index.html               # Single-page HTML entry point (system fonts only)
│   ├── package.json             # Vite & React dependencies
│   ├── vite.config.js           # Vite dev proxy configuration (/api -> :8000)
│   └── src/
│       ├── main.jsx             # React root mount
│       ├── App.jsx              # Main application page
│       ├── api.js               # Offline API client (fetch with FormData)
│       ├── styles.css           # Monochrome design system (pure CSS, sharp corners)
│       └── components/
│           ├── Header.jsx       # Black square "S" logo & offline privacy notice
│           ├── Hero.jsx         # 52px bold headline & subtitle
│           ├── Dropzone.jsx     # Drag-and-drop PDF dropzone (inverted on drag-over)
│           ├── FileRow.jsx      # File badge, file size, Analyze/Clear, custom CSV toggle
│           ├── ProgressSteps.jsx# Animated 5-stage pipeline step tracker
│           ├── ResultsHeader.jsx# Results header with Download JSON/Excel actions
│           ├── StatCards.jsx    # 4 stat cards (Opinion, Exceptions, Subservices, CUEC Gaps)
│           ├── ReportDetails.jsx# 4-column metadata grid + Trust Criteria chips
│           ├── ExceptionsTable.jsx# Exceptions table with category chips & failure details
│           ├── SubserviceTable.jsx# Subservice orgs table with HIGH/LOW risk badges
│           ├── CuecTable.jsx    # CUEC mapping table with status filters & badges
│           ├── ErrorBanner.jsx  # Sharp 2px black bordered error notice with retry
│           └── Footer.jsx       # Bottom offline assurance footer
├── data/
│   ├── raw/                     # Sample and synthetic SOC 2 reports
│   └── internal_controls/       # Base internal controls list
├── models/
│   └── baseline_tfidf_logreg.pkl # Optional TF-IDF logistic regression model
└── README.md
```

---

## API Endpoints

- `GET /api/health` — Health check returning OCR availability status and offline mode confirmation.
- `POST /api/analyze` — Multipart form upload for SOC 2 PDF (`file`) and optional custom internal controls CSV (`controls`). Runs in a threadpool, validates magic bytes `%PDF` and maximum 50 MB file size. Returns the structured JSON schema and caches the result for export.
- `GET /api/export/{result_id}.json` — Download extraction results as formatted JSON.
- `GET /api/export/{result_id}.xlsx` — Download an Excel workbook with sheets: `Metadata`, `Opinion`, `Exceptions`, `Subservice Orgs`, and `CUECs & Mapping` featuring bold headers and auto-sized columns.

---

## Design System & Hard Constraints

- **Strict Monochrome**: `#000000`, `#ffffff`, and neutral greys (`#555555`, `#888888`, `#e5e5e5`). Zero accent colors, zero gradients (except diagonal hatching for Gap status), zero shadows.
- **Sharp Edges**: Maximum 0-2px border-radius across all buttons, tables, and cards.
- **Shape-Coded Statuses**:
  - `Mapped` = Solid black badge, white text
  - `Partial` = White badge, 2px solid black border, black text
  - `Gap` = Diagonal-hatched monochrome badge
  - `HIGH Risk` = Solid black badge, white text
  - `LOW Risk` = Outlined badge, black text
- **Inverted CUEC Gaps Card**: The 4th stat card uses a solid black background with white text to immediately highlight compliance gaps.
