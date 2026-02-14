# Healthcare GenAI SaaS

A production-ready, mobile-first Healthcare GenAI Content Generation platform built with React, FastAPI, FAISS, and MongoDB.

## 🏥 Overview

This system assists healthcare professionals and users in generating structured medical documents while strictly enforcing privacy, safety, and industry standards.

**Key Principle:** This is a RAG-based system that generates content ONLY from provided reference materials. It does NOT use general AI knowledge and fails safely when data is insufficient.

### Key Features

- **RAG-Powered Document Generation** - Uses FAISS vector database with strict reference-only content
- **Privacy-First Design** - Documents retrievable only by secure Document ID
- **Safety Compliance Layer** - Blocks diagnosis, medications, and fitness determinations
- **Disease-Specific Content** - Scoped retrieval ensures disease queries return disease-specific data
- **Mobile-First Responsive UI** - Works seamlessly on all devices
- **Multi-Tenant Architecture** - Ready for SaaS deployment

## 📋 Document Types

### Patient-DEPENDENT (require valid patient)
- **Medical Certificate (DRAFT ONLY)** - Requires clinician review and signature

### Patient-INDEPENDENT
- **Disease Overview** - Educational information about specific conditions (Hypertension, Diabetes, Respiratory Health)
- **General Health Suggestions** - Wellness and lifestyle tips
- **Educational Medical Notes** - Patient education materials

## 🛡️ Safety & Compliance

### Medical Certificate Rules (Non-Negotiable)
- Generated as **DRAFT ONLY**
- Contains **NO diagnosis**
- Contains **NO treatment or medication**
- Contains **NO fitness/unfitness decision**
- Uses placeholders for patient and doctor fields
- Includes mandatory clinician review disclaimer

### RAG Safety Rules (Non-Negotiable)
- Content generated **ONLY from reference materials**
- **NO general AI knowledge** used for medical content
- **NO hallucination** - if data is missing, system fails safely
- Clear "Insufficient reference data" message when data unavailable
- Source transparency in all outputs

### Privacy Rules
- Documents retrieved **ONLY by Document ID**
- **NO retrieval by patient name**
- **NO retrieval by disease/condition**
- Document ID shown **only once** after generation

## 🚀 Quick Start

### Prerequisites

- Python 3.9+ (tested with Python 3.11/3.12)
- Node.js 18+
- MongoDB (local installation or MongoDB Atlas)

### Step 1: Start MongoDB

**Option A: Local MongoDB**
```bash
# Windows (if installed as service)
net start MongoDB

# Or run mongod directly
mongod --dbpath /path/to/data
```

**Option B: MongoDB Atlas**
- Create a free cluster at https://cloud.mongodb.com
- Get your connection string

### Step 2: Backend Setup

```powershell
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Or for Command Prompt:
# venv\Scripts\activate.bat

# Install dependencies
pip install -r requirements.txt

# Copy environment file
copy .env.example .env

# Edit .env with your settings (see Configuration section below)
# At minimum, update MONGODB_URL if using Atlas

# Start the server
python main.py
```

Backend will run at: **http://localhost:8000**

You should see:
```
🔄 Loading embedding model: all-MiniLM-L6-v2
📊 Building index for hospital: demo_hospital
  ✅ Processed disease: diabetes (X chunks)
  ✅ Processed disease: hypertension (X chunks)
  ✅ Processed disease: respiratory_health (X chunks)
  ...
✅ Healthcare GenAI Backend initialized successfully
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 3: Frontend Setup

```powershell
# Open new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run at: **http://localhost:5173**

### Step 4: Test the Application

1. Open http://localhost:5173 in your browser
2. Select "Disease Overview" as document type
3. Select "Hypertension" as the disease
4. Enter a topic like "Understanding blood pressure"
5. Click "Generate Document"
6. Save the Document ID shown!

## ⚙️ Configuration

### Backend Environment Variables (.env)

```env
# MongoDB Configuration
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=healthcare_genai

# OpenAI-Compatible LLM API
# Leave OPENAI_API_KEY empty to use built-in demo responses
OPENAI_API_KEY=
OPENAI_API_BASE=https://api.openai.com/v1
LLM_MODEL=gpt-3.5-turbo
MAX_TOKENS=1500
TEMPERATURE=0.3

# Embedding Model (for FAISS)
EMBEDDING_MODEL=all-MiniLM-L6-v2

# Server
HOST=0.0.0.0
PORT=8000
```

**Demo Mode:** If `OPENAI_API_KEY` is empty, the system uses high-quality built-in demo responses that demonstrate proper disease-specific content generation.

## 📁 Project Structure

```
RAGProject/
├── backend/
│   ├── main.py              # FastAPI application & endpoints
│   ├── prompt_engine.py     # LLM prompt construction with RAG rules
│   ├── rag.py               # FAISS vector search with category filtering
│   ├── safety.py            # Compliance filters (no diagnosis, etc.)
│   ├── schemas.py           # Pydantic request/response models
│   ├── data/
│   │   └── demo_hospital/
│   │       ├── diseases/
│   │       │   ├── hypertension.txt
│   │       │   ├── diabetes.txt
│   │       │   └── respiratory_health.txt
│   │       ├── templates/
│   │       │   └── medical_certificate_template.txt
│   │       ├── guidelines/
│   │       │   ├── disease_overview_guidelines.txt
│   │       │   └── patient_education_guidelines.txt
│   │       ├── wellness/
│   │       │   └── preventive_health.txt
│   │       └── disclaimers.txt
│   ├── indexes/             # FAISS indexes (auto-generated)
│   ├── requirements.txt
│   ├── .env.example
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Header.jsx       # App header with branding
    │   │   ├── ContentForm.jsx  # Document generation form
    │   │   ├── OutputViewer.jsx # Display generated content
    │   │   ├── DocumentLookup.jsx # Retrieve by Document ID
    │   │   └── Footer.jsx       # App footer
    │   ├── services/
    │   │   └── api.js           # Axios API client
    │   ├── App.jsx              # Main app component
    │   ├── main.jsx             # React entry point
    │   └── index.css            # Tailwind CSS imports
    ├── tailwind.config.js
    ├── vite.config.js
    ├── package.json
    └── index.html
```

## 🔌 API Endpoints

### Generate Document
```http
POST /api/generate
Content-Type: application/json

{
  "document_type": "disease_overview",
  "topic": "Understanding and managing high blood pressure",
  "disease_name": "hypertension",
  "hospital_id": "demo_hospital",
  "patient_id": null
}
```

**Response:**
```json
{
  "document_id": "DOC-abc123...",
  "content": "# Hypertension Overview\n\n...",
  "document_type": "disease_overview",
  "message": "Document generated successfully. Save your Document ID."
}
```

### Retrieve Document (by ID only)
```http
GET /api/document/{document_id}
```

### List Document Types
```http
GET /api/document-types
```

### Patient Management (for Medical Certificate)
```http
POST /api/patients
GET /api/patients/{hospital_id}
```

## 🔒 RAG Architecture

### Category-Based Scoped Retrieval

The RAG system uses metadata filtering to ensure queries return appropriate content:

| Document Type | Searches These Categories |
|---------------|--------------------------|
| Disease Overview | `diseases/` only (filtered by disease name) |
| Medical Certificate | `templates/` + `disclaimers/` |
| Health Suggestions | `wellness/` + `guidelines/` |
| Educational Notes | `guidelines/` + `wellness/` |

**Why This Matters:** When you query "Hypertension", the system ONLY searches hypertension-specific disease files, not guidelines or templates. This prevents generic content.

### What FAISS Stores (Allowed)
- Disease-specific educational content
- Document templates
- Medical wording guidelines
- Public health information
- Disclaimers

### What FAISS NEVER Stores
- Patient data
- User input
- Generated documents
- Personal health information

### RAG Configuration
- Chunk size: ~250 words
- TOP_K: 5 references (enforced at search level)
- Embedding model: all-MiniLM-L6-v2 (sentence-transformers)
- Index: FAISS IndexFlatIP (Inner Product for normalized vectors)

## 🏢 Multi-Tenant (SaaS) Design

The system is designed for multi-tenant deployment:
- Each hospital has isolated data via `hospitalId`
- Separate FAISS indexes per hospital
- Separate data folders: `data/{hospital_id}/`
- No code changes needed for new tenants
- Demo uses `demo_hospital` as default tenant

## 📱 Mobile-First UI

- Fully responsive design (mobile → tablet → desktop)
- Touch-friendly controls
- Healthcare professional aesthetic (teal/green theme)
- Clear form validation and error states
- Loading indicators during generation

## ⚠️ Important Notices

1. **Medical Certificates** are DRAFTS only - require clinician signature
2. **AI-generated content** is for educational/administrative purposes only
3. **Not a substitute** for professional medical advice
4. **Save Document IDs** - they are shown only once
5. **RAG-only content** - system will not generate content without reference data

## 🧪 Testing

### Using curl

**Create a Test Patient:**
```bash
curl -X POST http://localhost:8000/api/patients \
  -H "Content-Type: application/json" \
  -d "{\"patient_id\": \"P001\", \"name\": \"Test Patient\", \"hospital_id\": \"demo_hospital\"}"
```

**Generate Disease Overview:**
```bash
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d "{\"document_type\": \"disease_overview\", \"topic\": \"Blood pressure management\", \"disease_name\": \"hypertension\"}"
```

**Generate Medical Certificate (requires patient):**
```bash
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d "{\"document_type\": \"medical_certificate\", \"topic\": \"Rest period for recovery\", \"patient_id\": \"P001\"}"
```

**Retrieve Document:**
```bash
curl http://localhost:8000/api/document/DOC-your-document-id
```

## 🔧 Troubleshooting

### "Import could not be resolved" errors
These are IDE warnings. Run `pip install -r requirements.txt` to install packages.

### MongoDB connection failed
- Ensure MongoDB is running
- Check MONGODB_URL in .env
- For Atlas, ensure IP whitelist includes your IP

### FAISS index not building
- Check that `data/demo_hospital/` folder exists with .txt files
- Check console for error messages during startup

### Frontend can't connect to backend
- Ensure backend is running on port 8000
- Check vite.config.js proxy settings
- Check browser console for CORS errors

## 📄 License

This project is for demonstration purposes. Ensure compliance with healthcare regulations (HIPAA, GDPR, etc.) before production deployment.

---

**Built with:** React + Vite, FastAPI, FAISS, MongoDB, Tailwind CSS, sentence-transformers
#   R a g - C h a t - B o t  
 