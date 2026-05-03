import { Link } from 'react-router-dom'
import { Film, Twitter, Instagram, Youtube, Github } from 'lucide-react'

const footerLinks = {
  Product: [
    { label: 'Screenwriting', path: '/screenwriting' },
    { label: 'Shot List', path: '/shot-list' },
    { label: 'Storyboarding', path: '/storyboarding' },
    { label: 'Scheduling', path: '/scheduling' },
    { label: 'Budgeting', path: '/budgeting' },
  ],
  Resources: [
    { label: 'Documentation', path: '/docs' },
    { label: 'API Reference', path: '/api-reference' },
    { label: 'Tutorials', path: '/tutorials' },
    { label: 'Community', path: '/community' },
  ],
  Company: [
    { label: 'About', path: '/about' },
    { label: 'Blog', path: '/blog' },
    { label: 'Careers', path: '/careers' },
    { label: 'Contact', path: '/contact' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-[#060606] border-t border-[#242424]">
      <div className="container-lg py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Film className="w-5 h-5 text-[#D4A853]" />
              <span className="font-cinzel text-base font-bold text-[#F0F0F0]">Cinex Universe</span>
            </Link>
            <p className="font-inter text-sm text-[#6B6B6B] leading-relaxed">
              The premier AI-powered film pre-production platform. From script to screen, one platform.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-space-grotesk text-sm font-semibold text-[#F0F0F0] uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2">
              {footerLinks.Product.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="font-inter text-sm text-[#6B6B6B] hover:text-[#F0F0F0] hover:translate-x-1 transition-all inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-space-grotesk text-sm font-semibold text-[#F0F0F0] uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.Resources.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="font-inter text-sm text-[#6B6B6B] hover:text-[#F0F0F0] hover:translate-x-1 transition-all inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-space-grotesk text-sm font-semibold text-[#F0F0F0] uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.Company.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="font-inter text-sm text-[#6B6B6B] hover:text-[#F0F0F0] hover:translate-x-1 transition-all inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#242424]">
        <div className="container-lg py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-inter text-xs text-[#6B6B6B]">
            &copy; {new Date().getFullYear()} Cinex Universe. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {[Twitter, Instagram, Youtube, Github].map((Icon, i) => (
              <a key={i} href="#" className="text-[#6B6B6B] hover:text-[#D4A853] transition-colors">
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
