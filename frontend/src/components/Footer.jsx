/**
 * Footer Component
 * Healthcare GenAI SaaS footer with disclaimers
 */

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      {/* Disclaimer Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Healthcare Disclaimer</p>
              <p>
                This application generates AI-assisted content for <strong>educational and administrative purposes only</strong>.
                All generated documents are NOT a substitute for professional medical advice, diagnosis, or treatment.
                Medical Certificates are generated as DRAFTS only and require clinician review and signature.
                Always consult qualified healthcare providers for medical decisions.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Content */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 healthcare-gradient rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700">Healthcare GenAI SaaS</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span>Privacy-First Design</span>
            <span className="hidden sm:inline">•</span>
            <span>RAG-Powered</span>
            <span className="hidden sm:inline">•</span>
            <span>HIPAA-Aware</span>
          </div>

          {/* Copyright */}
          <p className="text-sm text-gray-500">
            © {currentYear} Healthcare GenAI
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
