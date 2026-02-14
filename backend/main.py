"""
Healthcare GenAI SaaS - FastAPI Backend
Main application entry point with API endpoints
"""

import os
import uuid
from datetime import datetime
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient

from schemas import (
    GenerateRequest,
    GenerateResponse,
    DocumentResponse,
    PatientCreate,
    PatientResponse,
    DocumentType,
    PATIENT_DEPENDENT_TYPES
)
from rag import RAGEngine
from prompt_engine import PromptEngine
from safety import SafetyFilter

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Healthcare GenAI SaaS",
    description="AI-powered medical document generation with privacy-first design",
    version="1.0.0"
)

# CORS configuration for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "healthcare_genai")

# Global instances
db_client: Optional[AsyncIOMotorClient] = None
rag_engine: Optional[RAGEngine] = None
prompt_engine: Optional[PromptEngine] = None
safety_filter: Optional[SafetyFilter] = None


@app.on_event("startup")
async def startup_event():
    """Initialize connections and engines on startup"""
    global db_client, rag_engine, prompt_engine, safety_filter
    
    # Initialize MongoDB
    db_client = AsyncIOMotorClient(MONGODB_URL)
    
    # Initialize RAG engine
    rag_engine = RAGEngine()
    
    # Initialize Prompt engine
    prompt_engine = PromptEngine()
    
    # Initialize Safety filter
    safety_filter = SafetyFilter()
    
    print("✅ Healthcare GenAI Backend initialized successfully")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    global db_client
    if db_client:
        db_client.close()


def get_database():
    """Get database instance"""
    return db_client[DATABASE_NAME]


def generate_document_id() -> str:
    """Generate a secure, non-guessable document ID"""
    return str(uuid.uuid4())


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Healthcare GenAI SaaS",
        "version": "1.0.0"
    }


@app.post("/api/generate", response_model=GenerateResponse)
async def generate_document(request: GenerateRequest):
    """
    Generate a medical document using RAG.
    
    - Validates document type
    - Validates patient if required (Medical Certificate)
    - Runs RAG to retrieve relevant references
    - Generates document with LLM
    - Saves to MongoDB
    - Returns documentId + content
    """
    db = get_database()
    
    # Validate patient for patient-dependent documents
    if request.document_type in PATIENT_DEPENDENT_TYPES:
        if not request.patient_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{request.document_type.value} requires a valid patient ID"
            )
        
        # Check if patient exists
        patient = await db.patients.find_one({
            "patientId": request.patient_id,
            "hospitalId": request.hospital_id
        })
        
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Patient with ID '{request.patient_id}' not found in hospital '{request.hospital_id}'"
            )
    
    try:
        # Step 1: Retrieve relevant references using RAG with scoped retrieval
        # The new RAG engine filters by document_type and disease_name
        references, retrieval_status = rag_engine.retrieve(
            query=request.topic,
            hospital_id=request.hospital_id,
            document_type=request.document_type.value,
            disease_name=request.disease_name,
            top_k=5
        )
        
        # Determine if we have sufficient data for generation
        # Check if retrieval was successful (has references and status indicates retrieval)
        has_sufficient_data = len(references) > 0 and "Retrieved" in retrieval_status
        
        # Step 2: Build prompt with retrieved context
        prompt, prompt_has_data = prompt_engine.build_prompt(
            document_type=request.document_type,
            topic=request.topic,
            references=references,
            patient_id=request.patient_id if request.document_type in PATIENT_DEPENDENT_TYPES else None,
            disease_name=request.disease_name,
            retrieval_status=retrieval_status
        )
        
        # Use the more restrictive check - both retrieval and prompt must have data
        has_sufficient_data = has_sufficient_data and prompt_has_data
        
        # Step 3: Generate content using LLM (with disease-specific prompting)
        generated_text = await prompt_engine.generate(
            prompt=prompt,
            has_sufficient_data=has_sufficient_data,
            document_type=request.document_type,
            disease_name=request.disease_name
        )
        
        # Step 4: Apply safety filters
        filtered_text = safety_filter.filter(generated_text, request.document_type)
        
        # Step 5: Generate unique document ID
        document_id = generate_document_id()
        
        # Step 6: Save to MongoDB
        document = {
            "documentId": document_id,
            "hospitalId": request.hospital_id,
            "documentType": request.document_type.value,
            "topic": request.topic,
            "diseaseName": request.disease_name,
            "patientId": request.patient_id if request.document_type in PATIENT_DEPENDENT_TYPES else None,
            "generatedText": filtered_text,
            "createdAt": datetime.utcnow()
        }
        
        await db.documents.insert_one(document)
        
        return GenerateResponse(
            document_id=document_id,
            content=filtered_text,
            document_type=request.document_type.value,
            message="Document generated successfully. Save your Document ID - it will only be shown once."
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate document: {str(e)}"
        )


@app.get("/api/document/{document_id}", response_model=DocumentResponse)
async def get_document(document_id: str):
    """
    Retrieve a document by its unique document ID.
    
    PRIVACY: Documents can ONLY be retrieved by documentId.
    No retrieval by patient name, disease, or any other identifier.
    """
    db = get_database()
    
    document = await db.documents.find_one({"documentId": document_id})
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found. Please check your Document ID."
        )
    
    return DocumentResponse(
        document_id=document["documentId"],
        document_type=document["documentType"],
        topic=document["topic"],
        content=document["generatedText"],
        created_at=document["createdAt"].isoformat()
    )


@app.post("/api/patients", response_model=PatientResponse)
async def create_patient(patient: PatientCreate):
    """
    Create a new patient record.
    Used for demo purposes to test Medical Certificate generation.
    """
    db = get_database()
    
    # Check if patient already exists
    existing = await db.patients.find_one({
        "patientId": patient.patient_id,
        "hospitalId": patient.hospital_id
    })
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Patient with this ID already exists"
        )
    
    patient_doc = {
        "patientId": patient.patient_id,
        "name": patient.name,
        "hospitalId": patient.hospital_id,
        "createdAt": datetime.utcnow()
    }
    
    await db.patients.insert_one(patient_doc)
    
    return PatientResponse(
        patient_id=patient.patient_id,
        name=patient.name,
        hospital_id=patient.hospital_id,
        message="Patient created successfully"
    )


@app.get("/api/patients/{hospital_id}")
async def list_patients(hospital_id: str):
    """
    List all patients for a hospital (demo purposes only).
    Returns only patient IDs and names for selection.
    """
    db = get_database()
    
    patients = await db.patients.find(
        {"hospitalId": hospital_id},
        {"_id": 0, "patientId": 1, "name": 1}
    ).to_list(100)
    
    return {"patients": patients}


@app.get("/api/document-types")
async def get_document_types():
    """Get available document types with their requirements"""
    return {
        "document_types": [
            {
                "type": "medical_certificate",
                "label": "Medical Certificate (DRAFT)",
                "requires_patient": True,
                "description": "Draft medical certificate requiring clinician review"
            },
            {
                "type": "disease_overview",
                "label": "Disease Overview",
                "requires_patient": False,
                "requires_disease": True,
                "description": "Educational overview of a specific disease or condition"
            },
            {
                "type": "health_suggestions",
                "label": "General Health Suggestions",
                "requires_patient": False,
                "description": "General wellness and health tips"
            },
            {
                "type": "educational_notes",
                "label": "Educational Medical Notes",
                "requires_patient": False,
                "description": "Educational content for patient understanding"
            }
        ],
        "available_diseases": [
            {
                "id": "hypertension",
                "label": "Hypertension (High Blood Pressure)",
                "description": "Educational content about blood pressure management"
            },
            {
                "id": "diabetes",
                "label": "Type 2 Diabetes",
                "description": "Information about diabetes management and lifestyle"
            },
            {
                "id": "respiratory_health",
                "label": "Respiratory Health",
                "description": "Content about respiratory conditions and lung health"
            }
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
