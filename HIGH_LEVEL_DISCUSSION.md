# Healthcare GenAI Content Generator
## High-Level Discussion Document

---

### 📌 Document Purpose
This document is prepared for **preliminary discussion** of the Healthcare GenAI project. This is not the final project submission but serves as a foundation for high-level review and feedback.

---

## 1. Problem Statement

### Current Challenges in Healthcare Content Generation
- Healthcare professionals spend significant time creating patient education materials manually
- Inconsistent quality and format of medical documents across departments
- Risk of outdated or inaccurate medical information being distributed
- Privacy concerns when handling patient data for document generation
- Lack of standardized templates for medical certificates and educational content

### Our Solution
A **RAG-powered (Retrieval-Augmented Generation)** Healthcare GenAI SaaS platform that generates medically accurate, standardized documents using only verified reference materials — ensuring no AI hallucination of medical facts.

---

## 2. Project Objectives

| # | Objective | Status |
|---|-----------|--------|
| 1 | Generate disease-specific educational content from verified sources | ✅ Implemented |
| 2 | Create draft medical certificates with proper compliance | ✅ Implemented |
| 3 | Ensure zero medical hallucination using RAG | ✅ Implemented |
| 4 | Privacy-first document retrieval (ID-based only) | ✅ Implemented |
| 5 | Safety layer blocking diagnosis/prescription | ✅ Implemented |
| 6 | Multi-tenant SaaS architecture | ✅ Ready |

---

## 3. Key Features Overview

### 🔹 RAG-Based Content Generation
- Uses **FAISS Vector Database** for semantic search
- Content generated **ONLY from reference materials**
- No general AI knowledge used for medical content
- If data is insufficient → fails safely with clear message

### 🔹 Document Types Supported
| Document Type | Requires Patient | Description |
|---------------|------------------|-------------|
| Disease Overview | No | Educational info about specific conditions |
| Medical Certificate | Yes | Draft certificate requiring clinician approval |
| Health Suggestions | No | Wellness and lifestyle tips |
| Educational Notes | No | Patient education materials |

### 🔹 Safety & Compliance Layer
- **NO diagnosis generation**
- **NO medication/prescription**
- **NO fitness determination**
- All medical certificates marked as **DRAFT ONLY**
- Mandatory clinician review disclaimer

### 🔹 Privacy-First Design
- Documents retrieved **ONLY by Document ID**
- No retrieval by patient name or condition
- Document ID shown only once after generation

---

## 4. Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| Axios | API Communication |

### Backend
| Technology | Purpose |
|------------|---------|
| Python 3.11+ | Backend Language |
| FastAPI | REST API Framework |
| FAISS | Vector Similarity Search |
| Sentence Transformers | Text Embeddings |
| MongoDB | Document Storage |
| OpenAI API | LLM Integration |

### Key Libraries
- **all-MiniLM-L6-v2** - Embedding model (384 dimensions)
- **gpt-3.5-turbo** - LLM for content generation

---

## 5. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE                           │
│                  (React + Tailwind CSS)                     │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND API LAYER                         │
│                      (FastAPI)                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ RAG Engine  │  │   Prompt    │  │   Safety Filter     │  │
│  │   (FAISS)   │  │   Engine    │  │   (Compliance)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   MongoDB    │   │  OpenAI API  │   │ Knowledge    │
│  (Storage)   │   │    (LLM)     │   │ Base (Files) │
└──────────────┘   └──────────────┘   └──────────────┘
```

---

## 6. RAG Pipeline Flow

```
User Query → Category Scoping → Chunk Filtering → Semantic Search → 
Prompt Construction → LLM Generation → Safety Filtering → Output
```

### Step-by-Step:
1. **Query Processing** - Extract document type and disease name
2. **Category Scoping** - Map document type to allowed content categories
3. **Chunk Filtering** - Filter chunks by disease/category (prevents cross-contamination)
4. **Semantic Search** - FAISS finds top-K relevant chunks
5. **Prompt Construction** - Build structured prompt with references
6. **LLM Generation** - Generate content using GPT-3.5-turbo
7. **Safety Filtering** - Block any prohibited content
8. **Output** - Return document with ID for future retrieval

---

## 7. Supported Diseases (Demo)

| Disease | Content Available |
|---------|-------------------|
| Hypertension | Overview, Risk Factors, Management |
| Diabetes | Overview, Types, Lifestyle Tips |
| Respiratory Health | Asthma, COPD, Breathing Exercises |

*Extensible to any number of diseases by adding reference files*

---

## 8. Demo Flow

### Scenario 1: Generate Disease Overview
1. User selects "Disease Overview" 
2. Selects disease: "Hypertension"
3. Enters topic: "Understanding blood pressure"
4. System retrieves hypertension-specific chunks
5. Generates educational content
6. Returns Document ID for future access

### Scenario 2: Generate Medical Certificate (Draft)
1. User selects "Medical Certificate"
2. Selects existing patient from dropdown
3. System generates DRAFT certificate
4. Certificate contains placeholders for:
   - Doctor's signature
   - Diagnosis (TO BE FILLED BY CLINICIAN)
   - Treatment recommendations
5. Includes mandatory disclaimer

### Scenario 3: Document Retrieval
1. User enters Document ID
2. System retrieves document (ID-based only)
3. Privacy protected - no name/disease search

---

## 9. Safety Rules (Non-Negotiable)

### Medical Certificate Constraints
```
❌ Never contains actual diagnosis
❌ Never contains medication names
❌ Never declares patient fit/unfit
✅ Always marked as DRAFT
✅ Always requires clinician signature
✅ Always includes disclaimer
```

### RAG Content Constraints
```
❌ No general AI medical knowledge
❌ No hallucinated facts
✅ Only verified reference materials
✅ Clear "insufficient data" messages
✅ Source transparency
```

---

## 10. Future Scope / Enhancement Ideas

| Enhancement | Description | Priority |
|-------------|-------------|----------|
| Multi-language Support | Generate content in regional languages | High |
| Voice Input | Speech-to-text for queries | Medium |
| PDF Export | Download documents as formatted PDFs | High |
| Audit Logging | Track all document generations | High |
| Role-Based Access | Different permissions for staff levels | Medium |
| Analytics Dashboard | Usage statistics and insights | Low |

---

## 11. Discussion Points

### Open Questions for Review:
1. **Scope Expansion** - Which additional document types should be prioritized?
2. **Integration** - Should we integrate with existing Hospital Information Systems?
3. **Deployment** - Cloud preference (AWS/Azure/GCP)?
4. **Compliance** - Any specific regional healthcare regulations to consider?
5. **Scaling** - Expected number of concurrent users/hospitals?

---

## 12. Live Demo Plan

| Step | Action | Expected Output |
|------|--------|-----------------|
| 1 | Start backend server | Server running on port 8000 |
| 2 | Start frontend | UI accessible on port 5173 |
| 3 | Generate Disease Overview | Educational content with Document ID |
| 4 | Show safety filter | Demonstrate blocked content |
| 5 | Retrieve by Document ID | Show privacy-first retrieval |
| 6 | Show reference materials | Demonstrate RAG source files |

---

## 13. Team & Contact

| Role | Responsibility |
|------|---------------|
| Project Lead | Architecture & Design |
| Backend Developer | FastAPI, RAG, Safety Layer |
| Frontend Developer | React UI, API Integration |
| Data Engineer | FAISS Indexing, Embeddings |

---

## 14. Quick Commands Reference

```powershell
# Backend
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python main.py

# Frontend
cd frontend
npm install
npm run dev
```

---

### Document Version
- **Version:** 1.0 (Discussion Draft)
- **Date:** February 18, 2026
- **Purpose:** High-Level Project Discussion

---

*This document is for preliminary discussion purposes. Detailed Low-Level Design (LLD) documentation is available separately.*
