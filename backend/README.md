# SOCRR-lite Backend

FastAPI backend service for extracting metadata, auditor opinions, control exceptions, subservice risks, and CUEC mappings from SOC 2 report PDFs.

## Setup & Running

```bash
python -m venv .venv
# Activate virtual environment:
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Running Smoke Tests

```bash
python -m pytest tests/test_pipeline.py
# or
python tests/test_pipeline.py
```
