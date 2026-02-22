/**
 * ContentForm Component
 * UI upgraded — logic untouched
 */

import { useState, useEffect } from 'react'
import { generateDocument, listPatients, createPatient } from '../services/api'

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

const AVAILABLE_DISEASES = [
  { id: 'hypertension', label: 'Hypertension (High Blood Pressure)', icon: '❤️' },
  { id: 'diabetes', label: 'Type 2 Diabetes', icon: '🩸' },
  { id: 'respiratory_health', label: 'Respiratory Health', icon: '🫁' }
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

  useEffect(() => {
    if (requiresPatient) loadPatients()
  }, [requiresPatient])

  const loadPatients = async () => {
    try {
      const response = await listPatients()
      setPatients(response.patients || [])
    } catch (err) {
      console.error('Failed to load patients:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!documentType) return setError('Please select a document type')
    if (requiresDisease && !diseaseName) return setError('Please select a disease')
    if (!topic.trim()) return setError('Please enter a topic')
    if (requiresPatient && !patientId) return setError('Patient ID required')

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

      setTopic('')
      if (!requiresPatient) setPatientId('')
      if (!requiresDisease) setDiseaseName('')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-xl font-semibold text-white">
          Generate Medical Content
        </h2>
        <p className="text-sm text-gray-400">
          AI-powered document generation using clinical knowledge
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-500/10 border border-red-400/30 text-red-300 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-7">

        {/* DOCUMENT TYPE CARDS */}
        <div>
          <p className="text-sm font-medium text-gray-300 mb-3">
            Select Document Type
          </p>

          <div className="grid grid-cols-1 gap-3">
            {DOCUMENT_TYPES.map((type) => (
              <div
                key={type.type}
                onClick={() => setDocumentType(type.type)}
                className={`cursor-pointer p-4 rounded-2xl border transition-all duration-300 ${
                  documentType === type.type
                    ? 'border-blue-400 bg-blue-500/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-xl">{type.icon}</div>
                  <div>
                    <p className="font-medium text-white text-sm">
                      {type.label}
                    </p>
                    <p className="text-xs text-gray-400">
                      {type.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DISEASE */}
        {requiresDisease && (
          <div>
            <label className="text-sm text-gray-300 mb-2 block">
              Select Disease
            </label>

            <select
              value={diseaseName}
              onChange={(e) => setDiseaseName(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose disease</option>
              {AVAILABLE_DISEASES.map(d => (
                <option key={d.id} value={d.id}>
                  {d.icon} {d.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* TOPIC */}
        <div>
          <label className="text-sm text-gray-300 mb-2 block">
            Topic
          </label>

          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={4}
            placeholder="Describe what you want the AI to generate..."
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-emerald-400 hover:scale-[1.01] transition-all duration-300 text-white font-semibold rounded-xl shadow-lg"
        >
          {isLoading ? 'Generating…' : 'Generate Healthcare Document'}
        </button>

      </form>
    </div>
  )
}

export default ContentForm
