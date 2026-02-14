"""
Pydantic schemas for request/response validation
"""

from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class DocumentType(str, Enum):
    """Available document types"""
    MEDICAL_CERTIFICATE = "medical_certificate"
    DISEASE_OVERVIEW = "disease_overview"
    HEALTH_SUGGESTIONS = "health_suggestions"
    EDUCATIONAL_NOTES = "educational_notes"


# Patient-dependent document types that require valid patient ID
PATIENT_DEPENDENT_TYPES = [DocumentType.MEDICAL_CERTIFICATE]


class GenerateRequest(BaseModel):
    """Request schema for document generation"""
    document_type: DocumentType = Field(
        ...,
        description="Type of document to generate"
    )
    topic: str = Field(
        ...,
        min_length=3,
        max_length=500,
        description="Topic or subject for the document"
    )
    disease_name: Optional[str] = Field(
        default=None,
        description="Specific disease name for targeted retrieval (e.g., 'hypertension', 'diabetes')"
    )
    hospital_id: str = Field(
        default="demo_hospital",
        description="Hospital/tenant identifier"
    )
    patient_id: Optional[str] = Field(
        default=None,
        description="Patient ID (required for Medical Certificate)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "document_type": "disease_overview",
                "topic": "Understanding and managing high blood pressure",
                "disease_name": "hypertension",
                "hospital_id": "demo_hospital",
                "patient_id": None
            }
        }


class GenerateResponse(BaseModel):
    """Response schema for document generation"""
    document_id: str = Field(
        ...,
        description="Unique document ID for retrieval"
    )
    content: str = Field(
        ...,
        description="Generated document content"
    )
    document_type: str = Field(
        ...,
        description="Type of document generated"
    )
    message: str = Field(
        ...,
        description="Status message"
    )


class DocumentResponse(BaseModel):
    """Response schema for document retrieval"""
    document_id: str
    document_type: str
    topic: str
    content: str
    created_at: str


class PatientCreate(BaseModel):
    """Request schema for creating a patient"""
    patient_id: str = Field(
        ...,
        min_length=1,
        description="Unique patient identifier"
    )
    name: str = Field(
        ...,
        min_length=1,
        description="Patient name"
    )
    hospital_id: str = Field(
        default="demo_hospital",
        description="Hospital/tenant identifier"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "patient_id": "P001",
                "name": "John Doe",
                "hospital_id": "demo_hospital"
            }
        }


class PatientResponse(BaseModel):
    """Response schema for patient operations"""
    patient_id: str
    name: str
    hospital_id: str
    message: str


class ErrorResponse(BaseModel):
    """Error response schema"""
    detail: str
