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

  const clearGeneratedDocument = () => {
    setGeneratedDocument(null)
  }

  const clearRetrievedDocument = () => {
    setRetrievedDocument(null)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Tab Navigation */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 sm:border-b border-gray-200">
            <button
              onClick={() => setActiveTab('generate')}
              className={`px-4 sm:px-6 py-3 text-sm font-medium rounded-lg sm:rounded-none sm:rounded-t-lg transition-colors ${
                activeTab === 'generate'
                  ? 'bg-healthcare-600 text-white sm:bg-white sm:text-healthcare-600 sm:border-b-2 sm:border-healthcare-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 sm:bg-transparent sm:hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Generate Document
              </span>
            </button>
            <button
              onClick={() => setActiveTab('retrieve')}
              className={`px-4 sm:px-6 py-3 text-sm font-medium rounded-lg sm:rounded-none sm:rounded-t-lg transition-colors ${
                activeTab === 'retrieve'
                  ? 'bg-healthcare-600 text-white sm:bg-white sm:text-healthcare-600 sm:border-b-2 sm:border-healthcare-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 sm:bg-transparent sm:hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Retrieve Document
              </span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {activeTab === 'generate' ? (
            <>
              <div className="order-1">
                <ContentForm onDocumentGenerated={handleDocumentGenerated} />
              </div>
              <div className="order-2">
                <OutputViewer 
                  document={generatedDocument} 
                  onClear={clearGeneratedDocument}
                  title="Generated Document"
                />
              </div>
            </>
          ) : (
            <>
              <div className="order-1">
                <DocumentLookup onDocumentRetrieved={handleDocumentRetrieved} />
              </div>
              <div className="order-2">
                <OutputViewer 
                  document={retrievedDocument} 
                  onClear={clearRetrievedDocument}
                  title="Retrieved Document"
                />
              </div>
            </>
          )}
        </div>

        {/* Privacy Notice */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Privacy-First Design</p>
              <p>
                Documents are retrievable <strong>only by Document ID</strong>. 
                We do not allow retrieval by patient name or medical condition to protect privacy.
                Save your Document ID securely — it is shown only once after generation.
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
