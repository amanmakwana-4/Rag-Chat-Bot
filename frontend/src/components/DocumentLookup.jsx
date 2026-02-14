/**
 * DocumentLookup Component
 * Retrieve documents by Document ID only (privacy-first design)
 */

import { useState } from 'react'
import { getDocument } from '../services/api'

function DocumentLookup({ onDocumentRetrieved }) {
  const [documentId, setDocumentId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const trimmedId = documentId.trim()
    if (!trimmedId) {
      setError('Please enter a Document ID')
      return
    }

    // Basic UUID format validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(trimmedId)) {
      setError('Invalid Document ID format. Please check and try again.')
      return
    }

    setIsLoading(true)

    try {
      const result = await getDocument(trimmedId)
      onDocumentRetrieved({
        documentId: result.document_id,
        content: result.content,
        documentType: result.document_type,
        topic: result.topic,
        createdAt: result.created_at
      })
      setDocumentId('')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-healthcare-50 to-white">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-5 h-5 text-healthcare-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Retrieve Document
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Enter your Document ID to retrieve a previously generated document
        </p>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-5">
        {/* Privacy Notice */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-gray-800">Privacy-First Retrieval</p>
              <p className="text-sm text-gray-600 mt-1">
                For your protection, documents can <strong>only</strong> be retrieved using their unique Document ID. 
                We do not support retrieval by patient name, disease, or any other identifier.
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert-error rounded-lg flex items-start gap-3">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Document ID Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={documentId}
            onChange={(e) => {
              setDocumentId(e.target.value)
              setError(null)
            }}
            placeholder="e.g., a1b2c3d4-e5f6-7890-abcd-ef1234567890"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-healthcare-500 focus:border-transparent font-mono text-sm"
            required
          />
          <p className="mt-2 text-xs text-gray-500">
            Enter the complete Document ID that was shown when the document was generated
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !documentId.trim()}
          className="w-full py-3 px-4 bg-healthcare-600 hover:bg-healthcare-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Retrieving...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Retrieve Document
            </>
          )}
        </button>

        {/* Help Text */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Don't have a Document ID?</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-healthcare-600">•</span>
              <span>Document IDs are generated when you create a new document</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-healthcare-600">•</span>
              <span>The ID is shown <strong>only once</strong> after generation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-healthcare-600">•</span>
              <span>If you've lost your Document ID, you'll need to generate a new document</span>
            </li>
          </ul>
        </div>
      </form>
    </div>
  )
}

export default DocumentLookup
