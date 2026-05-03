import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Briefcase, MapPin, Clock, DollarSign, ArrowRight, Zap, Heart, Globe } from 'lucide-react'

const jobs = [
  {
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Remote / Hyderabad',
    type: 'Full-time',
    salary: '$80K - $120K',
    description: 'Build the next generation of filmmaking tools using React, TypeScript, and WebGL. Work on features used by thousands of filmmakers daily.',
    requirements: ['5+ years React/TypeScript', 'Experience with Canvas/WebGL', 'Passion for film/media tech'],
  },
  {
    title: 'AI/ML Engineer',
    department: 'Engineering',
    location: 'Remote / Mumbai',
    type: 'Full-time',
    salary: '$90K - $140K',
    description: 'Develop AI models for script analysis, storyboard generation, and shot planning. Work with LLMs, computer vision, and generative AI.',
    requirements: ['3+ years ML/AI experience', 'PyTorch or TensorFlow', 'NLP or Computer Vision background'],
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote / Bangalore',
    type: 'Full-time',
    salary: '$60K - $90K',
    description: 'Design intuitive interfaces for complex filmmaking workflows. Create design systems, prototypes, and user research.',
    requirements: ['4+ years product design', 'Figma expert', 'Experience with B2B/SaaS tools'],
  },
  {
    title: 'Customer Success Manager',
    department: 'Growth',
    location: 'Remote / Anywhere',
    type: 'Full-time',
    salary: '$50K - $75K',
    description: 'Help filmmakers get the most out of Cinex Universe. Onboard teams, gather feedback, and drive retention.',
    requirements: ['3+ years customer success', 'SaaS experience', 'Excellent communication skills'],
  },
]

const benefits = [
  { icon: Zap, title: 'Remote First', desc: 'Work from anywhere in the world. Async-first culture.' },
  { icon: DollarSign, title: 'Competitive Pay', desc: 'Above-market salaries with equity for all full-time roles.' },
  { icon: Heart, title: 'Health & Wellness', desc: 'Comprehensive health insurance and mental health support.' },
  { icon: Globe, title: 'Flexible PTO', desc: 'Unlimited paid time off. Take the breaks you need.' },
]

export default function Careers() {
  return (
    <div className="bg-[#060606] min-h-[100dvh] text-[#F0F0F0]">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-jetbrains-mono text-xs uppercase tracking-[0.2em] text-[#D4A853] mb-4">Join the Team</p>
          <h1 className="font-cinzel text-4xl sm:text-5xl font-bold text-white mb-4">Shape the Future of Filmmaking</h1>
          <p className="font-inter text-base text-[#AAAAAA] max-w-xl mx-auto">
            We're building the most powerful pre-production platform for filmmakers worldwide. Come build it with us.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-6 border-t border-[#242424]">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-space-grotesk text-2xl font-semibold text-white text-center mb-10">Why Work at Cinex?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {benefits.map((b) => (
              <div key={b.title} className="bg-[#111111] border border-[#242424] rounded-xl p-5 text-center hover:border-[#333333] transition-all">
                <b.icon className="w-6 h-6 text-[#D4A853] mx-auto mb-3" />
                <h3 className="font-space-grotesk text-sm font-semibold text-white mb-1">{b.title}</h3>
                <p className="font-inter text-xs text-[#888888]">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-16 px-6 border-t border-[#242424]">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-space-grotesk text-2xl font-semibold text-white mb-8">Open Positions</h2>
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.title} className="bg-[#111111] border border-[#242424] rounded-xl p-6 hover:border-[#333333] transition-all">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-space-grotesk text-lg font-semibold text-white mb-1">{job.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#888888] font-inter">
                      <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {job.department}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {job.type}</span>
                      <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> {job.salary}</span>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 bg-[#D4A853] text-[#060606] px-4 py-2 rounded-lg font-inter text-sm font-medium hover:bg-[#c49a48] transition-colors">
                    Apply Now <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <p className="font-inter text-sm text-[#AAAAAA] mb-3">{job.description}</p>
                <div className="flex flex-wrap gap-2">
                  {job.requirements.map((r) => (
                    <span key={r} className="text-xs px-2 py-1 rounded bg-[#181818] text-[#A3A3A3] border border-[#242424] font-inter">{r}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 border-t border-[#242424]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-space-grotesk text-2xl font-semibold text-white mb-4">Don't see your role?</h2>
          <p className="font-inter text-sm text-[#888888] mb-6">We're always looking for talented people. Send us your resume and tell us what you'd build.</p>
          <Link to="/contact" className="btn-primary px-6 py-3 inline-flex items-center gap-2">
            Get in Touch <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
