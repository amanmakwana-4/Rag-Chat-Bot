/**
 * DocumentLookup Component
 * UI upgraded — logic unchanged
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
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h2 className="text-xl font-semibold text-white">
          Secure Document Retrieval
        </h2>
        <p className="text-sm text-gray-400">
          Access medical documents using encrypted Document ID
        </p>
      </div>

      {/* PRIVACY CARD */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl">
        <p className="text-sm font-medium text-white mb-1">
          Privacy-First Access
        </p>
        <p className="text-sm text-gray-400">
          Documents are retrievable only through their unique ID.
          Patient names, diseases, and other identifiers are never searchable.
        </p>
      </div>

      {/* ERROR */}
      {error && (
        <div className="bg-red-500/10 border border-red-400/30 text-red-300 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-7">

        {/* DOCUMENT ID INPUT */}
        <div>
          <label className="text-sm text-gray-300 mb-2 block">
            Document ID
          </label>

          <input
            type="text"
            value={documentId}
            onChange={(e) => {
              setDocumentId(e.target.value)
              setError(null)
            }}
            placeholder="a1b2c3d4-e5f6-7890-abcd-ef1234567890"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />

          <p className="mt-2 text-xs text-gray-500">
            Enter the unique ID shown after document generation
          </p>
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={isLoading || !documentId.trim()}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-emerald-400 hover:scale-[1.01] transition-all duration-300 text-white font-semibold rounded-xl shadow-lg"
        >
          {isLoading ? 'Retrieving Document…' : 'Retrieve Document'}
        </button>

        {/* HELP SECTION */}
        <div className="pt-5 border-t border-white/10 space-y-2 text-sm text-gray-400">
          <p className="font-medium text-white">Need a Document ID?</p>
          <p>• Generated instantly when a document is created</p>
          <p>• Displayed only once for privacy protection</p>
          <p>• If lost, the document must be generated again</p>
        </div>

      </form>
    </div>
  )
}

export default DocumentLookup
