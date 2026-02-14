/**
 * ContentForm Component
 * Form for generating medical documents with RAG
 */

import { useState, useEffect } from 'react'
import { generateDocument, listPatients, createPatient } from '../services/api'

// Document types configuration
const DOCUMENT_TYPES = [
  {
    type: 'medical_certificate',
    label: 'Medical Certificate (DRAFT)',
    requires_patient: true,
    requires_disease: false,
    description: 'Draft medical certificate requiring clinician review',
    icon: '📋'
  },
  {
    type: 'disease_overview',
    label: 'Disease Overview',
    requires_patient: false,
    requires_disease: true,
    description: 'Educational overview of a specific disease or condition',
    icon: '🔬'
  },
  {
    type: 'health_suggestions',
    label: 'General Health Suggestions',
    requires_patient: false,
    requires_disease: false,
    description: 'General wellness and health tips',
    icon: '💡'
  },
  {
    type: 'educational_notes',
    label: 'Educational Medical Notes',
    requires_patient: false,
    requires_disease: false,
    description: 'Educational content for patient understanding',
    icon: '📚'
  }
]

// Available diseases for disease-specific content
const AVAILABLE_DISEASES = [
  {
    id: 'hypertension',
    label: 'Hypertension (High Blood Pressure)',
    description: 'Educational content about blood pressure management',
    icon: '❤️'
  },
  {
    id: 'diabetes',
    label: 'Type 2 Diabetes',
    description: 'Information about diabetes management and lifestyle',
    icon: '🩸'
  },
  {
    id: 'respiratory_health',
    label: 'Respiratory Health',
    description: 'Content about respiratory conditions and lung health',
    icon: '🫁'
  }
]

function ContentForm({ onDocumentGenerated }) {
  const [documentType, setDocumentType] = useState('')
  const [diseaseName, setDiseaseName] = useState('')
  const [topic, setTopic] = useState('')
  const [patientId, setPatientId] = useState('')
  const [patients, setPatients] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showPatientForm, setShowPatientForm] = useState(false)
  const [newPatientId, setNewPatientId] = useState('')
  const [newPatientName, setNewPatientName] = useState('')
  const [patientCreating, setPatientCreating] = useState(false)

  const selectedType = DOCUMENT_TYPES.find(t => t.type === documentType)
  const requiresPatient = selectedType?.requires_patient || false
  const requiresDisease = selectedType?.requires_disease || false
  const selectedDisease = AVAILABLE_DISEASES.find(d => d.id === diseaseName)

  // Load patients when Medical Certificate is selected
  useEffect(() => {
    if (requiresPatient) {
      loadPatients()
    }
  }, [requiresPatient])

  const loadPatients = async () => {
    try {
      const response = await listPatients()
      setPatients(response.patients || [])
    } catch (err) {
      console.error('Failed to load patients:', err)
    }
  }

  const handleCreatePatient = async (e) => {
    e.preventDefault()
    if (!newPatientId.trim() || !newPatientName.trim()) return

    setPatientCreating(true)
    try {
      await createPatient({
        patient_id: newPatientId.trim(),
        name: newPatientName.trim()
      })
      await loadPatients()
      setPatientId(newPatientId.trim())
      setNewPatientId('')
      setNewPatientName('')
      setShowPatientForm(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setPatientCreating(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!documentType) {
      setError('Please select a document type')
      return
    }
    if (requiresDisease && !diseaseName) {
      setError('Please select a disease for Disease Overview')
      return
    }
    if (!topic.trim()) {
      setError('Please enter a topic')
      return
    }
    if (requiresPatient && !patientId) {
      setError('Medical Certificate requires a valid patient ID')
      return
    }

    setIsLoading(true)

    try {
      const result = await generateDocument({
        document_type: documentType,
        topic: topic.trim(),
        disease_name: requiresDisease ? diseaseName : null,
        patient_id: requiresPatient ? patientId : null
      })

      onDocumentGenerated({
        documentId: result.document_id,
        content: result.content,
        documentType: result.document_type,
        message: result.message
      })

      // Clear form on success
      setTopic('')
      if (!requiresPatient) {
        setPatientId('')
      }
      if (!requiresDisease) {
        setDiseaseName('')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Form Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-healthcare-50 to-white">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-healthcare-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Generate Document
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Create AI-generated medical documents using RAG
        </p>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
        {/* Error Display */}
        {error && (
          <div className="alert-error rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Document Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Type <span className="text-red-500">*</span>
          </label>
          <select
            value={documentType}
            onChange={(e) => {
              setDocumentType(e.target.value)
              setError(null)
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-healthcare-500 focus:border-transparent transition-all"
            required
          >
            <option value="">Select document type...</option>
            {DOCUMENT_TYPES.map((type) => (
              <option key={type.type} value={type.type}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
          
          {/* Type Description */}
          {selectedType && (
            <p className="mt-2 text-sm text-gray-500 flex items-center gap-2">
              <span className="text-lg">{selectedType.icon}</span>
              {selectedType.description}
            </p>
          )}
        </div>

        {/* Disease Selection (Conditional - for Disease Overview) */}
        {requiresDisease && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3 mb-4">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-800">Disease Selection</p>
                <p className="text-sm text-blue-700">
                  Select a disease to get targeted educational content
                </p>
              </div>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Disease / Condition <span className="text-red-500">*</span>
            </label>
            <select
              value={diseaseName}
              onChange={(e) => setDiseaseName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-healthcare-500 focus:border-transparent"
              required
            >
              <option value="">Select disease...</option>
              {AVAILABLE_DISEASES.map((disease) => (
                <option key={disease.id} value={disease.id}>
                  {disease.icon} {disease.label}
                </option>
              ))}
            </select>
            
            {/* Disease Description */}
            {selectedDisease && (
              <p className="mt-2 text-sm text-blue-600 flex items-center gap-2">
                <span className="text-lg">{selectedDisease.icon}</span>
                {selectedDisease.description}
              </p>
            )}
          </div>
        )}

        {/* Patient ID (Conditional) */}
        {requiresPatient && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3 mb-4">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-amber-800">Patient Required</p>
                <p className="text-sm text-amber-700">
                  Medical Certificate requires a valid patient ID
                </p>
              </div>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient ID <span className="text-red-500">*</span>
            </label>
            
            {patients.length > 0 ? (
              <select
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-healthcare-500 focus:border-transparent"
                required
              >
                <option value="">Select patient...</option>
                {patients.map((patient) => (
                  <option key={patient.patientId} value={patient.patientId}>
                    {patient.patientId} - {patient.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-gray-600 mb-3">No patients found. Create one below.</p>
            )}

            {/* Create Patient Button/Form */}
            {!showPatientForm ? (
              <button
                type="button"
                onClick={() => setShowPatientForm(true)}
                className="mt-3 text-sm text-healthcare-600 hover:text-healthcare-700 font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Patient
              </button>
            ) : (
              <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
                <h4 className="text-sm font-medium text-gray-800 mb-3">New Patient</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newPatientId}
                    onChange={(e) => setNewPatientId(e.target.value)}
                    placeholder="Patient ID (e.g., P001)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    placeholder="Patient Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCreatePatient}
                      disabled={patientCreating}
                      className="px-4 py-2 bg-healthcare-600 text-white text-sm font-medium rounded-lg hover:bg-healthcare-700 disabled:opacity-50"
                    >
                      {patientCreating ? 'Creating...' : 'Create Patient'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPatientForm(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Topic Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Topic / Subject <span className="text-red-500">*</span>
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={
              documentType === 'medical_certificate'
                ? "e.g., Rest period for recovery, Follow-up appointment attendance..."
                : documentType === 'disease_overview'
                ? "e.g., Type 2 Diabetes, Hypertension, Respiratory health..."
                : documentType === 'health_suggestions'
                ? "e.g., Stress management, Sleep hygiene, Heart health..."
                : "e.g., Understanding your condition, Post-procedure care..."
            }
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-healthcare-500 focus:border-transparent resize-none"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Be specific about the topic for better AI-generated content
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !documentType || !topic.trim() || (requiresPatient && !patientId) || (requiresDisease && !diseaseName)}
          className="w-full py-3 px-4 bg-healthcare-600 hover:bg-healthcare-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating with RAG...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Document
            </>
          )}
        </button>

        {/* Medical Certificate Warning */}
        {documentType === 'medical_certificate' && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-xs text-gray-600">
              <strong>Note:</strong> Medical Certificates are generated as <strong>DRAFT ONLY</strong>. 
              They contain no diagnosis, treatment, or fitness determination. 
              Clinician review and signature is required before use.
            </p>
          </div>
        )}
      </form>
    </div>
  )
}

export default ContentForm
