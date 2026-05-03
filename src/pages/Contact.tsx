import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Mail, MapPin, Phone, Send, Check, MessageCircle, AlertCircle } from 'lucide-react'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.email.includes('@') || !form.message.trim()) {
      setError('Please fill in all required fields.')
      return
    }
    setSent(true)
  }

  return (
    <div className="bg-[#060606] min-h-[100dvh] text-[#F0F0F0]">
      <Navbar />

      <section className="pt-32 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-jetbrains-mono text-xs uppercase tracking-[0.2em] text-[#D4A853] mb-4">Get in Touch</p>
          <h1 className="font-cinzel text-4xl sm:text-5xl font-bold text-white mb-4">Contact Us</h1>
          <p className="font-inter text-base text-[#AAAAAA] max-w-xl mx-auto">
            Have a question, feedback, or partnership inquiry? We'd love to hear from you.
          </p>
        </div>
      </section>

      <section className="px-6 pb-16">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-4">
            {[
              { icon: Mail, label: 'Email', value: 'hello@cinexuniverse.com' },
              { icon: Phone, label: 'Phone', value: '+91 98765 43210' },
              { icon: MapPin, label: 'Office', value: 'Hyderabad, India' },
              { icon: MessageCircle, label: 'Support', value: 'support@cinexuniverse.com' },
            ].map((item) => (
              <div key={item.label} className="bg-[#111111] border border-[#242424] rounded-xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[rgba(212,168,83,0.08)] border border-[rgba(212,168,83,0.2)] flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-4 h-4 text-[#D4A853]" />
                </div>
                <div>
                  <p className="font-inter text-xs text-[#6B6B6B] uppercase">{item.label}</p>
                  <p className="font-inter text-sm text-white mt-0.5">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {!sent ? (
              <form onSubmit={handleSubmit} className="bg-[#111111] border border-[#242424] rounded-xl p-6 sm:p-8">
                <h2 className="font-space-grotesk text-lg font-semibold text-white mb-6">Send a Message</h2>
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-inter flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> {error}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="bg-[#0D0D0D] border border-[#242424] rounded-lg px-4 py-3 text-sm text-white placeholder-[#6B6B6B] outline-none focus:border-[#D4A853]"
                  />
                  <input
                    type="email"
                    placeholder="Your Email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="bg-[#0D0D0D] border border-[#242424] rounded-lg px-4 py-3 text-sm text-white placeholder-[#6B6B6B] outline-none focus:border-[#D4A853]"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Subject"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full bg-[#0D0D0D] border border-[#242424] rounded-lg px-4 py-3 text-sm text-white placeholder-[#6B6B6B] outline-none focus:border-[#D4A853] mb-4"
                />
                <textarea
                  placeholder="Your Message"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-[#0D0D0D] border border-[#242424] rounded-lg px-4 py-3 text-sm text-white placeholder-[#6B6B6B] outline-none focus:border-[#D4A853] mb-6 resize-none h-32"
                />
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-[#D4A853] text-[#060606] px-6 py-3 rounded-lg font-inter text-sm font-medium hover:bg-[#c49a48] transition-colors"
                >
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </form>
            ) : (
              <div className="bg-[#111111] border border-[#242424] rounded-xl p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-[#27AE60]/10 border border-[#27AE60]/20 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-[#27AE60]" />
                </div>
                <h2 className="font-space-grotesk text-xl font-semibold text-white mb-2">Message Sent!</h2>
                <p className="font-inter text-sm text-[#AAAAAA] mb-6">We'll get back to you within 24 hours.</p>
                <button
                  onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
                  className="font-inter text-sm text-[#D4A853] hover:underline"
                >
                  Send another message
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
