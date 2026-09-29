import os
import sys
from pathlib import Path
import pytest
import pandas as pd

# Add backend directory to sys.path so app modules can be imported
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.pipeline import run_pipeline


def test_pipeline_smoke():
    """Smoke test running run_pipeline on a sample PDF and asserting all schema keys exist."""
    # Find sample PDF in workspace
    project_root = backend_dir.parent
    sample_pdf = project_root / "data" / "raw" / "synthetic_acme_soc2.pdf"
    
    assert sample_pdf.exists(), f"Sample PDF not found at {sample_pdf}"

    default_controls_path = backend_dir / "app" / "default_controls.csv"
    controls_df = pd.read_csv(default_controls_path) if default_controls_path.exists() else None

    result = run_pipeline(str(sample_pdf), controls_df)

    # 1. Assert top-level keys required by contract
    required_keys = [
        "filename",
        "page_count",
        "processing_seconds",
        "warnings",
        "metadata",
        "opinion",
        "exceptions",
        "subservice_orgs",
        "cuecs",
        "summary"
    ]
    for key in required_keys:
        assert key in result, f"Missing key in pipeline response: {key}"

    # 2. Assert metadata subkeys
    meta_keys = ["org", "system", "report_type", "period_start", "period_end", "auditor", "criteria"]
    for mk in meta_keys:
        assert mk in result["metadata"], f"Missing metadata key: {mk}"

    # 3. Assert opinion subkeys
    opinion_keys = ["type", "qualifications", "emphasis_of_matter"]
    for ok in opinion_keys:
        assert ok in result["opinion"], f"Missing opinion key: {ok}"

    # 4. Assert summary subkeys
    summary_keys = ["exception_count", "carve_out_count", "cuec_total", "cuec_mapped", "cuec_partial", "cuec_gap"]
    for sk in summary_keys:
        assert sk in result["summary"], f"Missing summary key: {sk}"

    # 5. Assert values sanity
    assert result["page_count"] > 0
    assert result["processing_seconds"] > 0
    assert len(result["metadata"]["org"]) > 0
    assert len(result["metadata"]["system"]) > 0
    assert result["opinion"]["type"] in ["Unqualified", "Qualified", "Adverse", "Disclaimer"]
    assert isinstance(result["exceptions"], list)
    assert isinstance(result["subservice_orgs"], list)
    assert isinstance(result["cuecs"], list)

    print("\n[SMOKE TEST PASSED] Pipeline result conforms to schema contract!")


if __name__ == "__main__":
    test_pipeline_smoke()
