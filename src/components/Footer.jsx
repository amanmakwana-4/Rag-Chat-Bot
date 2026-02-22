/**
 * Premium Healthcare AI Footer
 * UI upgraded — logic untouched
 */

import { motion } from "framer-motion"

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="mt-auto relative border-t border-white/10 bg-[#020617]">

      {/* glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-emerald-900/10 to-cyan-900/20 blur-3xl opacity-40" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* DISCLAIMER */}
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-400/20 rounded-2xl p-6 mb-10 backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-amber-400/10">
              <svg 
                className="w-5 h-5 text-amber-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>

            <div className="text-sm text-amber-200 leading-relaxed">
              <p className="font-semibold text-amber-100 mb-1">
                Medical Responsibility Notice
              </p>
              <p>
                AI-generated content is intended for administrative and educational use only.
                It does not replace professional clinical judgment, diagnosis, or treatment.
              </p>
            </div>
          </div>
        </div>

        {/* FOOTER CORE */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">

          {/* BRAND */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 via-cyan-400 to-emerald-400 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-[#020617]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>

            <div>
              <p className="text-white font-semibold tracking-tight">
                Healthcare GenAI
              </p>
              <p className="text-xs text-gray-400">
                Clinical intelligence platform
              </p>
            </div>
          </motion.div>

          {/* BADGES */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">

            <motion.span 
              whileHover={{ scale: 1.07 }}
              className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300"
            >
              Privacy-First
            </motion.span>

            <motion.span 
              whileHover={{ scale: 1.07 }}
              className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300"
            >
              RAG Powered
            </motion.span>

            <motion.span 
              whileHover={{ scale: 1.07 }}
              className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300"
            >
              HIPAA-Aware
            </motion.span>

          </div>

          {/* COPYRIGHT */}
          <p className="text-sm text-gray-500">
            © {currentYear} Healthcare GenAI Platform
          </p>

        </div>
      </div>
    </footer>
  )
}

export default Footer
