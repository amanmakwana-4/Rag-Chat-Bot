/**
 * OutputViewer Component
 * UI upgraded — logic untouched
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
      <div className="flex flex-col h-full min-h-[420px] bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl">

        <div className="px-6 py-5 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
        </div>

        <div className="flex-1 flex items-center justify-center text-center p-10">
          <div>
            <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-2xl flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            <p className="text-gray-400 text-sm">
              AI generated or retrieved document will appear here
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl shadow-2xl">

      {/* HEADER */}
      <div className="px-6 py-5 border-b border-white/10 flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="text-sm text-gray-400 capitalize">
            {document.documentType?.replace(/_/g, ' ') || 'Document'}
          </p>
        </div>

        <button
          onClick={onClear}
          className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition"
        >
          ✕
        </button>
      </div>

      {/* DOCUMENT ID */}
      {document.documentId && (
        <div className="mx-6 mt-6 p-4 bg-blue-500/10 border border-blue-400/20 rounded-2xl">
          <p className="text-sm font-medium text-blue-300 mb-2">
            Document ID — save for retrieval
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <code className="px-3 py-1 bg-black/30 border border-white/10 rounded text-sm font-mono text-white">
              {document.documentId}
            </code>

            <button
              onClick={handleCopyId}
              className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-gray-200"
            >
              {copiedId ? 'Copied!' : 'Copy ID'}
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-2">
            Required to access this document later.
          </p>
        </div>
      )}

      {/* CONTENT */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="bg-black/30 border border-white/10 rounded-2xl p-6 min-h-[320px] max-h-[520px] overflow-auto whitespace-pre-wrap text-sm text-gray-200 leading-relaxed font-medium">
          {document.content}
        </div>
      </div>

      {/* ACTIONS */}
      <div className="px-6 py-4 border-t border-white/10">
        <div className="flex gap-3">
          <button
            onClick={handleCopyContent}
            className="flex-1 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-200 hover:bg-white/10 transition"
          >
            {copied ? 'Copied!' : 'Copy Content'}
          </button>

          <button
            onClick={handleDownload}
            className="flex-1 py-2 bg-gradient-to-r from-blue-500 to-emerald-400 text-white rounded-xl hover:scale-[1.02] transition shadow-lg"
          >
            Download
          </button>
        </div>
      </div>

    </div>
  )
}

export default OutputViewer
