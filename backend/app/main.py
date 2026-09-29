import os
import io
import uuid
import shutil
import logging
import tempfile
from pathlib import Path
from typing import Dict, Any, Optional
import pandas as pd

from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.responses import Response, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.concurrency import run_in_threadpool

from .schemas import AnalysisResponse
from .pipeline import run_pipeline
from .exporter import export_json, export_excel

# Configure console-only logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("SOCRR_Backend")

app = FastAPI(
    title="SOCRR-lite API",
    description="Offline SOC 2 Report Information Extraction and CUEC Mapping API",
    version="1.0.0"
)

# CORS: allow local dev origins, Vercel deployments, and custom configured origins
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "")
if allowed_origins_env.strip():
    allowed_origins = [o.strip() for o in allowed_origins_env.split(",") if o.strip()]
else:
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

# Automatically permit all Vercel preview and production domains (*.vercel.app)
allowed_origin_regex = os.getenv("ALLOWED_ORIGIN_REGEX", r"^https:\/\/.*\.vercel\.app$")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=allowed_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory result cache for exports
RESULTS_CACHE: Dict[str, Dict[str, Any]] = {}
MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB


@app.get("/")
def read_root() -> Dict[str, Any]:
    """Root endpoint confirming service status and providing API links."""
    return {
        "service": "SOCRR-lite API",
        "status": "online",
        "docs": "/docs",
        "health": "/api/health"
    }


@app.get("/api/health")
def get_health() -> Dict[str, Any]:
    """Health check endpoint indicating OCR availability and offline mode."""
    ocr_available = shutil.which("tesseract") is not None
    return {
        "status": "ok",
        "ocr_available": ocr_available,
        "offline": True
    }


@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_report(
    file: UploadFile = File(...),
    controls: Optional[UploadFile] = File(None)
):
    """
    Upload and analyze a SOC 2 PDF report.
    Validates PDF format, magic bytes, and file size.
    Processes the report in a background threadpool and caches result for export.
    """
    logger.info(f"Received file for analysis: filename={file.filename}, content_type={file.content_type}")

    # Validate filename extension
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Please upload a PDF file with a .pdf extension."
        )

    # Read and validate magic bytes and file size
    header = await file.read(4)
    if not header.startswith(b"%PDF"):
        raise HTTPException(
            status_code=400,
            detail="Invalid PDF file. Header magic bytes mismatch."
        )

    # Read remaining file content to check file size
    rest = await file.read()
    total_bytes = len(header) + len(rest)
    if total_bytes > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum allowed size of 50 MB (uploaded {total_bytes / (1024 * 1024):.1f} MB)."
        )

    full_content = header + rest

    # Optional custom controls CSV parsing
    controls_df = None
    if controls is not None and controls.filename:
        try:
            ctrl_bytes = await controls.read()
            if ctrl_bytes.strip():
                controls_df = pd.read_csv(io.BytesIO(ctrl_bytes))
                logger.info(f"Loaded custom controls CSV with {len(controls_df)} rows and columns: {list(controls_df.columns)}")
        except Exception as e:
            logger.warning(f"Failed to parse custom controls CSV: {e}")
            raise HTTPException(
                status_code=400,
                detail=f"Failed to parse custom controls CSV: {str(e)}"
            )

    # Save to a temporary file, run pipeline in threadpool, delete in finally
    temp_dir = tempfile.mkdtemp(prefix="socrr_")
    safe_name = os.path.basename(file.filename) or "uploaded_report.pdf"
    temp_pdf_path = os.path.join(temp_dir, safe_name)

    try:
        with open(temp_pdf_path, "wb") as f:
            f.write(full_content)

        logger.info(f"Running extraction pipeline on temporary file: {temp_pdf_path}")
        result = await run_in_threadpool(run_pipeline, temp_pdf_path, controls_df)

        result_id = str(uuid.uuid4())[:8]
        result["result_id"] = result_id

        # Cache in-memory for download export
        RESULTS_CACHE[result_id] = result

        logger.info(f"Analysis complete for {file.filename}. Assigned result_id={result_id}")
        return result

    except Exception as e:
        logger.error(f"Error during report analysis: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while processing the PDF: {str(e)}"
        )
    finally:
        try:
            if os.path.exists(temp_pdf_path):
                os.remove(temp_pdf_path)
            if os.path.exists(temp_dir):
                shutil.rmtree(temp_dir, ignore_errors=True)
        except Exception as cleanup_err:
            logger.warning(f"Error cleaning up temp directory {temp_dir}: {cleanup_err}")


@app.get("/api/export/{result_id}.json")
def download_json_export(result_id: str):
    """Download analysis results as formatted JSON."""
    result = RESULTS_CACHE.get(result_id)
    if not result:
        raise HTTPException(status_code=404, detail="Analysis result not found or expired.")

    json_bytes = export_json(result)
    orig_name = Path(result.get("filename", "report")).stem
    filename = f"{orig_name}_socrr_analysis.json"

    return Response(
        content=json_bytes,
        media_type="application/json",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )


@app.get("/api/export/{result_id}.xlsx")
def download_excel_export(result_id: str):
    """Download analysis results as a styled multi-sheet Excel file."""
    result = RESULTS_CACHE.get(result_id)
    if not result:
        raise HTTPException(status_code=404, detail="Analysis result not found or expired.")

    excel_bytes = export_excel(result)
    orig_name = Path(result.get("filename", "report")).stem
    filename = f"{orig_name}_socrr_summary.xlsx"

    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )
