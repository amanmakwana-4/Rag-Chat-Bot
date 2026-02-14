/**
 * OutputViewer Component
 * Displays generated or retrieved medical documents
 */

import { useState } from 'react'

function OutputViewer({ document, onClear, title }) {
  const [copied, setCopied] = useState(false)
  const [copiedId, setCopiedId] = useState(false)

  const handleCopyContent = async () => {
    if (!document?.content) return
    
    try {
      await navigator.clipboard.writeText(document.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleCopyId = async () => {
    if (!document?.documentId) return
    
    try {
      await navigator.clipboard.writeText(document.documentId)
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownload = () => {
    if (!document?.content) return

    const blob = new Blob([document.content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement ? window.document.createElement('a') : { click: () => {} }
    
    const link = window.document.createElement('a')
    link.href = url
    link.download = `${document.documentType || 'document'}_${document.documentId || 'unknown'}.txt`
    window.document.body.appendChild(link)
    link.click()
    window.document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (!document) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full min-h-[400px] flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {title}
          </h2>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">
              {title === 'Generated Document' 
                ? 'Generated documents will appear here'
                : 'Retrieved documents will appear here'
              }
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {title}
            </h2>
            <p className="text-sm text-gray-500 mt-1 capitalize">
              {document.documentType?.replace(/_/g, ' ') || 'Document'}
            </p>
          </div>
          <button
            onClick={onClear}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Clear"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Document ID Alert */}
      {document.documentId && (
        <div className="mx-4 sm:mx-6 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-blue-800 mb-1">
                Document ID (Save This!)
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <code className="px-2 py-1 bg-white border border-blue-200 rounded text-sm font-mono text-blue-900 break-all">
                  {document.documentId}
                </code>
                <button
                  onClick={handleCopyId}
                  className="px-3 py-1 text-xs font-medium bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors flex items-center gap-1"
                >
                  {copiedId ? (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy ID
                    </>
                  )}
                </button>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                ⚠️ This ID is shown only once. Use it to retrieve this document later.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Document Content */}
      <div className="flex-1 p-4 sm:p-6 overflow-auto">
        <div className="document-output bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6 min-h-[300px] max-h-[500px] overflow-auto">
          {document.content}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleCopyContent}
            className="flex-1 py-2 px-4 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Content
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 py-2 px-4 bg-healthcare-600 text-white font-medium rounded-lg hover:bg-healthcare-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        </div>
      </div>
    </div>
  )
}

export default OutputViewer
