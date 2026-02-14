/**
 * Header Component
 * Healthcare GenAI SaaS branding and navigation
 */

function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 healthcare-gradient rounded-xl flex items-center justify-center shadow-lg">
                <svg 
                  className="w-6 h-6 sm:w-7 sm:h-7 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                Healthcare GenAI
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 hidden sm:block">
                AI-Powered Medical Document Generation
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Demo Hospital
            </div>
            
            {/* Info Button */}
            <button 
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="About Healthcare GenAI"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Status Bar */}
      <div className="sm:hidden px-4 pb-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium w-fit">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          Demo Hospital Active
        </div>
      </div>
    </header>
  )
}

export default Header
