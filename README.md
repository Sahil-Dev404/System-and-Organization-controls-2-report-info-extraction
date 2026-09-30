# SOCLite

**SOC 2 Report Info Extraction** — a web app that reads SOC 2 report PDFs and turns them into structured, reviewable data.

Upload a SOC 2 PDF and SOCLite extracts:

- **Report metadata**: organization, report type, review period, trust services criteria
- **Auditor's opinion**
- **Control exceptions** (test failures noted by the auditor)
- **Subservice organizations** and their risk level
- **Complementary User Entity Controls (CUECs)**, mapped to your internal controls using TF-IDF cosine similarity and labelled `Mapped`, `Partial` or `Gap`

Results can be viewed in the browser and exported as **JSON** or a multi-sheet **Excel** workbook.

**Live demo:** [system-and-organization-controls-2.vercel.app](https://system-and-organization-controls-2.vercel.app)

---

## Features

- PDF text extraction with optional OCR fallback for scanned pages
- Section segmentation and rule-based extraction (no external LLM/API calls in the analysis pipeline)
- CUEC → internal control mapping via TF-IDF + cosine similarity
- Optional upload of your own internal controls CSV (a default list is bundled)
- Upload validation: `%PDF` magic-byte check and 50 MB size limit
- JSON and styled Excel export
- Minimal monochrome React UI with drag-and-drop upload, progress steps, stat cards and filterable tables

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | Python 3.10+, FastAPI, Uvicorn, Pydantic, openpyxl |
| Matching | TF-IDF + cosine similarity (scikit-learn) |
| Frontend | React, Vite |
| OCR (optional) | Tesseract |
| Deployment | Backend on Render (`render.yaml`), frontend on Vercel |

---

## Repository Structure

```
.
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI app, CORS, upload validation, routes
│   │   ├── pipeline.py           # PDF parsing, segmentation, extraction, CUEC mapping
│   │   ├── normalize.py          # Normalization and cleanup rules
│   │   ├── exporter.py           # JSON and Excel exporters
│   │   ├── schemas.py            # Pydantic response models
│   │   └── default_controls.csv  # Default internal controls
│   ├── tests/
│   │   └── test_pipeline.py      # Smoke test for the pipeline and response schema
│   └── requirements.txt          # Backend dependencies
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js            # Dev proxy: /api -> http://localhost:8000
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api.js                # API client (fetch + FormData)
│       ├── styles.css
│       └── components/           # Header, Hero, Dropzone, FileRow, ProgressSteps,
│                                 # ResultsHeader, StatCards, ReportDetails,
│                                 # ExceptionsTable, SubserviceTable, CuecTable,
│                                 # ErrorBanner, Footer
├── notebooks/                    # Exploration / experimentation notebooks
├── render.yaml                   # Render deployment config for the backend
├── requirements.txt              # (currently empty; use backend/requirements.txt)
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.10+ (Render deployment uses 3.11.9)
- Node.js 18+
- *(Optional)* [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) on your `PATH` for scanned PDFs

### 1. Run the backend

```bash
cd backend
python -m venv .venv

# Linux / macOS
source .venv/bin/activate
# Windows (PowerShell)
.venv\Scripts\Activate.ps1

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API is now at `http://localhost:8000` (interactive docs at `/docs`).

> **About OCR:** Tesseract is optional. It is only used when a page has very little native text (under 50 characters) and `tesseract` is found on the `PATH`. If it is missing, OCR is skipped and a notice is added to the response `warnings`.

### 2. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. In development, Vite proxies `/api/*` to `http://localhost:8000`.

### 3. Run the smoke test

```bash
# from the repository root
python backend/tests/test_pipeline.py
```

It runs `run_pipeline` on a sample PDF and checks the output against the response schema.

---

## API Reference

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Health check; reports whether OCR is available |
| `POST` | `/api/analyze` | Multipart upload: `file` (SOC 2 PDF, required) and `controls` (internal controls CSV, optional). Returns structured JSON and caches it for export |
| `GET` | `/api/export/{result_id}.json` | Download results as JSON |
| `GET` | `/api/export/{result_id}.xlsx` | Download an Excel workbook (`Metadata`, `Opinion`, `Exceptions`, `Subservice Orgs`, `CUECs & Mapping`) |

**Example**

```bash
curl -X POST http://localhost:8000/api/analyze \
  -F "file=@report.pdf" \
  -F "controls=@my_controls.csv"
```

---

## How It Works

1. **Upload & validate**: checks the PDF signature and size.
2. **Parse**: extracts text per page, using OCR only where needed.
3. **Segment**: splits the report into sections (opinion, exceptions, subservice orgs, CUECs, etc.).
4. **Extract & normalize**: pulls out fields and cleans them.
5. **Map CUECs**: vectorizes CUECs and internal controls with TF-IDF and scores them by cosine similarity.
6. **Return & export**: responds with JSON and enables JSON/Excel downloads.

### CUEC statuses

| Status | Meaning |
| --- | --- |
| `Mapped` | A strong match to an internal control |
| `Partial` | A weaker or incomplete match |
| `Gap` | No adequate internal control found |

---

## Deployment

- **Backend (Render):** `render.yaml` defines a `socrr-backend` web service with `rootDir: backend`, build command `pip install -r requirements.txt`, and start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, on Python 3.11.9.
- **Frontend (Vercel):** the deployed UI is at the demo link above. When frontend and backend are hosted separately, the frontend must be pointed at the deployed backend URL, and the backend CORS settings must allow the frontend origin.

## Privacy Note

When run locally, the analysis pipeline processes PDFs on your own machine and makes no calls to external AI or analytics services. Note that the public demo is hosted, so uploaded files are processed on the hosting provider's servers; use a local install for sensitive reports.

## Limitations

- Extraction is heuristic/rule-based; always review results against the source report.
- Scanned PDFs need Tesseract for best results.
- Formats vary between audit firms, so some fields may be missed or misclassified.

