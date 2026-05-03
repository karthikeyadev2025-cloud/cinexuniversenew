import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Shield } from 'lucide-react'

const endpoints = [
  { method: 'POST', path: '/api/v1/scripts', desc: 'Create a new screenplay', auth: true },
  { method: 'GET', path: '/api/v1/scripts/{id}', desc: 'Retrieve a screenplay by ID', auth: true },
  { method: 'PUT', path: '/api/v1/scripts/{id}', desc: 'Update an existing screenplay', auth: true },
  { method: 'POST', path: '/api/v1/breakdown', desc: 'Run AI script breakdown', auth: true },
  { method: 'POST', path: '/api/v1/storyboard', desc: 'Generate storyboard frames', auth: true },
  { method: 'POST', path: '/api/v1/shotlist', desc: 'Auto-generate shot list', auth: true },
  { method: 'GET', path: '/api/v1/projects', desc: 'List all projects', auth: true },
  { method: 'POST', path: '/api/v1/projects', desc: 'Create a new project', auth: true },
]

export default function ApiReference() {
  return (
    <div className="bg-[#060606] min-h-[100dvh] text-[#F0F0F0]">
      <Navbar />

      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="font-jetbrains-mono text-xs uppercase tracking-[0.2em] text-[#D4A853] mb-4">Developers</p>
          <h1 className="font-cinzel text-4xl sm:text-5xl font-bold text-white mb-4">API Reference</h1>
          <p className="font-inter text-base text-[#AAAAAA] max-w-xl mb-8">
            Build custom integrations with the Cinex Universe API. Available on Studio plans.
          </p>
          <div className="bg-[#111111] border border-[#242424] rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-[#D4A853]" />
              <h2 className="font-space-grotesk text-lg font-semibold text-white">Authentication</h2>
            </div>
            <p className="font-inter text-sm text-[#AAAAAA] mb-3">All API requests require an API key in the Authorization header.</p>
            <div className="bg-[#0D0D0D] border border-[#242424] rounded-lg p-4 font-mono text-xs text-[#CCCCCC] overflow-x-auto">
              Authorization: Bearer YOUR_API_KEY
            </div>
          </div>
          <div className="bg-[#111111] border border-[#242424] rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[#242424]">
              <h2 className="font-space-grotesk text-lg font-semibold text-white">Endpoints</h2>
            </div>
            <div className="divide-y divide-[#1a1a1a]">
              {endpoints.map((ep) => (
                <div key={ep.path} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className={`text-xs font-mono font-bold px-2 py-1 rounded ${ep.method === 'GET' ? 'bg-[#2D9CDB]/10 text-[#2D9CDB]' : 'bg-[#D4A853]/10 text-[#D4A853]'}`}>
                    {ep.method}
                  </span>
                  <code className="font-mono text-sm text-[#CCCCCC]">{ep.path}</code>
                  <span className="sm:ml-auto font-inter text-xs text-[#888888]">{ep.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
