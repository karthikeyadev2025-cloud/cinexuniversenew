import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Search, ChevronRight } from 'lucide-react'

const sections = [
  {
    title: 'Getting Started',
    items: [
      { label: 'Quick Start Guide', desc: 'Set up your first project in 5 minutes' },
      { label: 'Account Setup', desc: 'Configure your profile and preferences' },
      { label: 'Project Creation', desc: 'Create and organize your productions' },
      { label: 'Importing Scripts', desc: 'Bring in Final Draft, Fountain, or PDF files' },
    ],
  },
  {
    title: 'Screenwriting',
    items: [
      { label: 'Fountain Format', desc: 'Write using plain-text markup syntax' },
      { label: 'Final Draft Import', desc: 'Import and export .fdx files' },
      { label: 'Auto-Formatting', desc: 'Let AI handle scene headings and transitions' },
      { label: 'Telugu Script Support', desc: 'Write in regional Indian languages' },
    ],
  },
  {
    title: 'Pre-Production',
    items: [
      { label: 'Script Breakdown', desc: 'Auto-tag cast, props, locations, VFX' },
      { label: 'Shot Lists', desc: 'Generate detailed shot planning documents' },
      { label: 'Storyboarding', desc: 'Create visual frames from descriptions' },
      { label: 'Scheduling', desc: 'Plan shoot days with drag-and-drop' },
    ],
  },
  {
    title: 'AI Tools',
    items: [
      { label: 'Pre-Visualization', desc: 'Generate video previews before shooting' },
      { label: 'Script Doctor', desc: 'Analyze pacing, structure, and dialogue' },
      { label: 'Location Scout', desc: 'Find and compare filming locations' },
      { label: 'Lookbook Generator', desc: 'Create mood boards and references' },
    ],
  },
]

export default function Docs() {
  return (
    <div className="bg-[#060606] min-h-[100dvh] text-[#F0F0F0]">
      <Navbar />

      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="font-jetbrains-mono text-xs uppercase tracking-[0.2em] text-[#D4A853] mb-4">Documentation</p>
          <h1 className="font-cinzel text-4xl sm:text-5xl font-bold text-white mb-4">Documentation</h1>
          <p className="font-inter text-base text-[#AAAAAA] max-w-xl mb-8">
            Everything you need to get the most out of Cinex Universe. From first script to final export.
          </p>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B6B6B]" />
            <input
              type="text"
              placeholder="Search documentation..."
              className="w-full bg-[#111111] border border-[#242424] rounded-xl pl-12 pr-4 py-3.5 text-sm text-white placeholder-[#6B6B6B] outline-none focus:border-[#D4A853]"
            />
          </div>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section) => (
            <div key={section.title} className="bg-[#111111] border border-[#242424] rounded-xl p-6">
              <h2 className="font-space-grotesk text-lg font-semibold text-white mb-4">{section.title}</h2>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <Link
                    key={item.label}
                    to="#"
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-[#181818] transition-all group"
                  >
                    <div>
                      <p className="font-inter text-sm text-white group-hover:text-[#D4A853] transition-colors">{item.label}</p>
                      <p className="font-inter text-xs text-[#6B6B6B]">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#6B6B6B] group-hover:text-[#D4A853] transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
