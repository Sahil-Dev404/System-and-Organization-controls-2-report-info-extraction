from typing import List, Optional
from pydantic import BaseModel, Field


class MetadataSchema(BaseModel):
    org: str = ""
    system: str = ""
    report_type: str = "Type 2"
    period_start: str = "N/A"
    period_end: str = "N/A"
    auditor: str = "Unknown Auditor"
    criteria: List[str] = Field(default_factory=list)


class OpinionSchema(BaseModel):
    type: str = "Unqualified"
    qualifications: List[str] = Field(default_factory=list)
    emphasis_of_matter: List[str] = Field(default_factory=list)


class ExceptionItemSchema(BaseModel):
    control_id: str
    description: str
    criteria: str
    result: str
    details: str
    category: str
    management_response: str


class SubserviceOrgSchema(BaseModel):
    name: str
    method: str
    services: str
    csocs: List[str] = Field(default_factory=list)
    risk_flag: str  # "HIGH" or "LOW"


class CuecSchema(BaseModel):
    id: str
    text: str
    category: str
    mapped_control: str
    score: float
    status: str  # "Mapped", "Partially Mapped", or "Gap"


class CriteriaHealthItemSchema(BaseModel):
    category_id: str
    name: str
    principle: str
    total_controls: int = 0
    passed_controls: int = 0
    exception_count: int = 0
    health_score: float = 100.0
    status: str = "Optimal"  # "Optimal", "Attention", or "Critical"
    exceptions: List[str] = Field(default_factory=list)


class TrustCriteriaHealthSchema(BaseModel):
    overall_health: float = 100.0
    total_controls_tested: int = 0
    total_passed: int = 0
    total_exceptions: int = 0
    categories: List[CriteriaHealthItemSchema] = Field(default_factory=list)


class SummarySchema(BaseModel):
    exception_count: int = 0
    carve_out_count: int = 0
    cuec_total: int = 0
    cuec_mapped: int = 0
    cuec_partial: int = 0
    cuec_gap: int = 0


class AnalysisResponse(BaseModel):
    result_id: str = ""
    filename: str
    page_count: int
    processing_seconds: float
    warnings: List[str] = Field(default_factory=list)
    metadata: MetadataSchema
    opinion: OpinionSchema
    exceptions: List[ExceptionItemSchema]
    subservice_orgs: List[SubserviceOrgSchema]
    cuecs: List[CuecSchema]
    summary: SummarySchema
    criteria_health: Optional[TrustCriteriaHealthSchema] = None

