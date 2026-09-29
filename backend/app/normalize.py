import re
from typing import Dict, Any, List

KNOWN_AUDIT_FIRMS = [
    "Ernst & Young LLP", "Ernst & Young", "EY", "KPMG",
    "PricewaterhouseCoopers", "PwC", "Deloitte & Touche", "Deloitte",
    "Schellman", "A-LIGN", "Coalfire", "BDO", "RSM",
    "Grant Thornton", "Moss Adams", "Crowe", "Baker Tilly",
    "KirkpatrickPrice", "Sensiba San Filippo", "Armanino", "Withum"
]

TRAILING_LABELS = [
    "system in scope", "system:", "service organization:", "scope system",
    "period", "report", "for the period", "throughout the period",
    "trust services categories", "trust services criteria", "audit period",
    "independent service auditor", "description of the system"
]


def collapse_whitespace(text: str) -> str:
    """Collapse newlines and repeated whitespace to single spaces."""
    if not isinstance(text, str):
        return text
    return re.sub(r"\s+", " ", text).strip()


def strip_trailing_labels(val: str) -> str:
    """Strip trailing label text from org/system values."""
    if not val:
        return ""
    val_clean = collapse_whitespace(val)
    val_lower = val_clean.lower()
    
    earliest_idx = len(val_clean)
    for label in TRAILING_LABELS:
        idx = val_lower.find(label)
        if idx != -1 and idx < earliest_idx:
            # Only cut if it's not the whole string itself
            if idx > 0:
                earliest_idx = idx

    result = val_clean[:earliest_idx].rstrip(" :-,/")
    return result if result else val_clean


def normalize_auditor(auditor_str: str) -> str:
    """Normalize auditor name, collapsing line breaks and snapping to KNOWN_AUDIT_FIRMS."""
    cleaned = collapse_whitespace(auditor_str)
    
    # Check for direct or close match in known firms
    for firm in KNOWN_AUDIT_FIRMS:
        if firm.lower() == cleaned.lower():
            return firm
        # Check substring / abbreviation matches
        if firm.lower() in cleaned.lower():
            # Special case EY / Ernst & Young
            if "ernst" in firm.lower() or "ey" == firm.lower():
                return "Ernst & Young LLP"
            return firm
            
    if "pwc" in cleaned.lower() or "pricewaterhouse" in cleaned.lower():
        return "PricewaterhouseCoopers"
    if "kpmg" in cleaned.lower():
        return "KPMG"
    if "deloitte" in cleaned.lower():
        return "Deloitte & Touche"
    if "schellman" in cleaned.lower():
        return "Schellman"
    if "a-lign" in cleaned.lower() or "align" in cleaned.lower():
        return "A-LIGN"

    return cleaned if cleaned else "Unknown Auditor"


def normalize_date_range(start_str: str, end_str: str) -> tuple[str, str]:
    """Format dates and preserve original date tokens."""
    s = collapse_whitespace(start_str) if start_str else "N/A"
    e = collapse_whitespace(end_str) if end_str else "N/A"
    return s, e


def normalize_all_strings(obj: Any) -> Any:
    """Recursively collapse whitespace in all string values."""
    if isinstance(obj, str):
        return collapse_whitespace(obj)
    elif isinstance(obj, list):
        return [normalize_all_strings(item) for item in obj]
    elif isinstance(obj, dict):
        return {k: normalize_all_strings(v) for k, v in obj.items()}
    return obj


def normalize_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Apply all normalization rules to the raw pipeline output:
    1. Collapse whitespace in all strings.
    2. Strip trailing label text from org and system.
    3. Snap auditor to KNOWN_AUDIT_FIRMS.
    4. CUEC ids strip trailing commas/periods, deduplicate by normalized text, renumber if missing.
    5. Subservice orgs drop criteria codes/short names, dedupe by lowercase name, ensure risk_flag.
    6. Exceptions deduplicate by control_id, empty management_response -> 'Not provided'.
    7. Dates normalized.
    """
    # 1. Base whitespace cleanup
    payload = normalize_all_strings(payload)

    # 2. Metadata normalization
    meta = payload.get("metadata", {})
    if "org" in meta:
        meta["org"] = strip_trailing_labels(meta["org"])
    if "system" in meta:
        meta["system"] = strip_trailing_labels(meta["system"])
    if "auditor" in meta:
        meta["auditor"] = normalize_auditor(meta["auditor"])

    start_dt, end_dt = normalize_date_range(meta.get("period_start", ""), meta.get("period_end", ""))
    meta["period_start"] = start_dt
    meta["period_end"] = end_dt
    payload["metadata"] = meta

    # 3. Exceptions normalization
    raw_exceptions = payload.get("exceptions", [])
    deduped_exceptions = []
    seen_ctrl_ids = set()

    for exc in raw_exceptions:
        cid = exc.get("control_id", "").strip()
        if not cid:
            cid = f"CTL-EXC-{len(deduped_exceptions) + 1:02d}"
        if cid in seen_ctrl_ids:
            continue
        seen_ctrl_ids.add(cid)

        mgmt_resp = exc.get("management_response", "").strip()
        if not mgmt_resp:
            mgmt_resp = "Not provided"

        desc = exc.get("description", "").strip()
        crit = exc.get("criteria", "").strip()
        res = exc.get("result", "").strip()
        details = exc.get("details", "").strip() or res

        deduped_exceptions.append({
            "control_id": cid,
            "description": desc,
            "criteria": crit,
            "result": res,
            "details": details,
            "category": exc.get("category", "access_control"),
            "management_response": mgmt_resp
        })
    payload["exceptions"] = deduped_exceptions

    # 4. Subservice orgs normalization
    criteria_code_regex = re.compile(r"^(CC|A|C|PI|P)\d+(\.\d+)?$", re.IGNORECASE)
    raw_subservices = payload.get("subservice_orgs", [])
    deduped_subservices = []
    seen_sub_names = set()

    for sub in raw_subservices:
        name = sub.get("name", "").strip()
        if len(name) < 3 or criteria_code_regex.match(name):
            continue
        
        lower_name = name.lower()
        if lower_name in seen_sub_names:
            continue
        seen_sub_names.add(lower_name)

        method = sub.get("method", "Carve-Out").strip()
        is_carve = "carve" in method.lower()
        method_str = "Carve-Out" if is_carve else "Inclusive"
        risk_flag = "HIGH" if is_carve else "LOW"

        deduped_subservices.append({
            "name": name,
            "method": method_str,
            "services": sub.get("services", "Cloud infrastructure and data storage"),
            "csocs": sub.get("csocs", []),
            "risk_flag": risk_flag
        })
    payload["subservice_orgs"] = deduped_subservices

    # 5. CUECs normalization
    raw_cuecs = payload.get("cuecs", [])
    deduped_cuecs = []
    seen_cuec_texts = set()

    for idx, cuec in enumerate(raw_cuecs):
        raw_text = cuec.get("text", "").strip()
        norm_key = re.sub(r"[^\w\s]", "", raw_text.lower()).strip()
        if not norm_key or norm_key in seen_cuec_texts:
            continue
        seen_cuec_texts.add(norm_key)

        cid = cuec.get("id", "").strip()
        cid = re.sub(r"[,.:;]+$", "", cid)
        if not cid:
            cid = f"CUEC-{len(deduped_cuecs) + 1:02d}"

        score = float(cuec.get("score", 0.0))
        status = cuec.get("status", "Gap")
        mapped_ctrl = cuec.get("mapped_control", "No matching control")
        if status == "Gap" or not mapped_ctrl or mapped_ctrl == "NONE":
            mapped_ctrl = "No matching control"

        deduped_cuecs.append({
            "id": cid,
            "text": raw_text,
            "category": cuec.get("category", "access_control"),
            "mapped_control": mapped_ctrl,
            "score": round(score, 2),
            "status": status
        })
    payload["cuecs"] = deduped_cuecs

    # 6. Recompute Summary
    carve_outs = sum(1 for s in deduped_subservices if s["method"] == "Carve-Out")
    mapped_count = sum(1 for c in deduped_cuecs if c["status"] == "Mapped")
    partial_count = sum(1 for c in deduped_cuecs if c["status"] == "Partially Mapped")
    gap_count = sum(1 for c in deduped_cuecs if c["status"] == "Gap")

    payload["summary"] = {
        "exception_count": len(deduped_exceptions),
        "carve_out_count": carve_outs,
        "cuec_total": len(deduped_cuecs),
        "cuec_mapped": mapped_count,
        "cuec_partial": partial_count,
        "cuec_gap": gap_count
    }

    return payload
