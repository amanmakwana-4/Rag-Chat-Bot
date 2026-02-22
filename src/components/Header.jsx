/**
 * Premium Healthcare AI Header
 * Bold • Clean • Product-grade
 */

import { motion } from "framer-motion"

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#020617]/80 backdrop-blur-xl">

      {/* glow line */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex items-center justify-between h-16 sm:h-20">

          {/* LEFT : LOGO + BRAND */}
          <div className="flex items-center gap-4">

            {/* Logo */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.35 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-emerald-400 blur-xl opacity-40 rounded-2xl" />

              <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 flex items-center justify-center shadow-xl">
                <svg 
                  className="w-6 h-6 text-[#020617]" 
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
            </motion.div>

            {/* Brand */}
            <div className="leading-tight">
              <h1 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
                Healthcare GenAI
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">
                Clinical intelligence workspace
              </p>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4">

            {/* STATUS */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300"
            >
              <span className="w-2 h-2 bg-emerald-400 rounded-full" />
              AI Online
            </motion.div>

            {/* INFO BUTTON */}
            <button 
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition backdrop-blur"
              title="About Healthcare GenAI"
            >
              <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* MOBILE STATUS */}
      <div className="sm:hidden px-4 pb-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 w-fit">
          <span className="w-2 h-2 bg-emerald-400 rounded-full" />
          AI Online
        </div>
      </div>

    </header>
  )
}

export default Header
