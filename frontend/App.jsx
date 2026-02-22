import { useState } from 'react'
import Header from './components/Header'
import ContentForm from './components/ContentForm'
import OutputViewer from './components/OutputViewer'
import DocumentLookup from './components/DocumentLookup'
import Footer from './components/Footer'

function App() {
  const [generatedDocument, setGeneratedDocument] = useState(null)
  const [retrievedDocument, setRetrievedDocument] = useState(null)
  const [activeTab, setActiveTab] = useState('generate')

  const handleDocumentGenerated = (document) => {
    setGeneratedDocument(document)
  }

  const handleDocumentRetrieved = (document) => {
    setRetrievedDocument(document)
  }

  const clearGeneratedDocument = () => setGeneratedDocument(null)
  const clearRetrievedDocument = () => setRetrievedDocument(null)

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a] text-white relative overflow-hidden">

      {/* background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-emerald-900/20 to-cyan-900/30 blur-3xl opacity-50" />

      <Header />

      <main className="relative flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10">

        {/* TITLE */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Healthcare AI Workspace
          </h1>
          <p className="text-gray-400 mt-2">
            Generate and retrieve secure medical documents using AI
          </p>
        </div>

        {/* TAB SWITCH */}
        <div className="mb-8">
          <div className="flex gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 w-fit">

            <button
              onClick={() => setActiveTab('generate')}
              className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                activeTab === 'generate'
                  ? 'bg-gradient-to-r from-blue-500 to-emerald-400 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              Generate Content
            </button>

            <button
              onClick={() => setActiveTab('retrieve')}
              className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                activeTab === 'retrieve'
                  ? 'bg-gradient-to-r from-blue-500 to-emerald-400 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              Retrieve Document
            </button>

          </div>
        </div>

        {/* WORKSPACE */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-[0_0_60px_rgba(0,0,0,0.5)]">

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* LEFT */}
            <div className="lg:col-span-2">
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-3">
                {activeTab === 'generate' ? 'Content Input' : 'Document Retrieval'}
              </p>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                {activeTab === 'generate' ? (
                  <ContentForm onDocumentGenerated={handleDocumentGenerated} />
                ) : (
                  <DocumentLookup onDocumentRetrieved={handleDocumentRetrieved} />
                )}
              </div>
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-3">
              <p className="text-xs uppercase tracking-wider text-gray-400 mb-3">
                {activeTab === 'generate' ? 'AI Generated Output' : 'Retrieved Document'}
              </p>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 min-h-[420px]">
                {activeTab === 'generate' ? (
                  <OutputViewer
                    document={generatedDocument}
                    onClear={clearGeneratedDocument}
                    title="Generated Healthcare Document"
                  />
                ) : (
                  <OutputViewer
                    document={retrievedDocument}
                    onClear={clearRetrievedDocument}
                    title="Retrieved Document"
                  />
                )}
              </div>
            </div>

          </div>
        </div>

        {/* PRIVACY */}
        <div className="mt-10 bg-gradient-to-r from-blue-900/40 to-emerald-900/30 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
          <div className="flex gap-4 items-start">
            <div className="bg-white/10 p-2 rounded-lg">
              <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div>
              <p className="font-semibold text-blue-300 mb-1">Privacy-First System</p>
              <p className="text-sm text-gray-300">
                Documents are retrievable only by Document ID. No patient names
                or conditions are used for search to ensure medical privacy.
              </p>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  )
}

export default App
