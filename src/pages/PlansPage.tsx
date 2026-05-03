import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Check, Star, ArrowLeft } from 'lucide-react'
import Navbar from '../components/Navbar'
import RazorpayCheckout from '../components/RazorpayCheckout'
import { useRoleStore } from '../stores/roleStore'

interface Plan {
  name: string
  slug: string
  description: string
  monthlyPrice: number
  yearlyPrice: number
  features: string[]
  isPopular: boolean
}

export default function PlansPage() {
  const navigate = useNavigate()
  const isAuthenticated = useRoleStore((s) => s.isAuthenticated)
  const [plans, setPlans] = useState<Plan[]>([
    {
      name: 'Free',
      slug: 'free',
      description: 'Basic access with limited features',
      monthlyPrice: 0,
      yearlyPrice: 0,
      features: ['1 Project', 'Screenwriting', 'Shot List', 'Basic Support'],
      isPopular: false,
    },
    {
      name: 'Pro',
      slug: 'pro',
      description: 'Full pre-production suite with AI tools',
      monthlyPrice: 1999,
      yearlyPrice: 19999,
      features: ['Unlimited Projects', 'AI Storyboarding', 'Pre-Visualization', 'Script Breakdown', 'Priority Support', 'Scheduling', 'Budgeting'],
      isPopular: true,
    },
    {
      name: 'Studio',
      slug: 'studio',
      description: 'Complete studio package with team features',
      monthlyPrice: 4999,
      yearlyPrice: 49999,
      features: ['Everything in Pro', 'Team Collaboration', 'Client Reviews', 'Analytics', 'API Access', 'Dedicated Manager', 'Custom Integrations'],
      isPopular: false,
    },
  ])
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  useEffect(() => {
    // Fetch plans from backend
    fetch('/api/trpc/payment.getPlans')
      .then((r) => r.json())
      .then((data) => {
        if (data?.result?.data?.json) {
          setPlans(data.result.data.json)
        }
      })
      .catch(() => {
        // Use default plans on error
      })
  }, [])

  if (!isAuthenticated) {
    return (
      <div className="min-h-[100dvh] bg-[#060606]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[calc(100dvh-60px)]">
          <div className="text-center p-8">
            <p className="text-[#A3A3A3] font-inter text-lg mb-4">Please sign in to view plans</p>
            <button onClick={() => navigate('/login')} className="btn-primary px-6 py-3">
              Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-[#060606]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <Link to="/dashboard" className="flex items-center gap-1 text-[#6B6B6B] hover:text-[#A3A3A3] font-inter text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="text-center mb-12">
          <h1 className="font-cinzel text-3xl sm:text-4xl font-bold text-[#F0F0F0] mb-3">
            Choose Your Plan
          </h1>
          <p className="font-inter text-[#A3A3A3] max-w-xl mx-auto">
            Start with a 14-day free trial of Pro. Upgrade anytime.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-10">
          <div className="bg-[#0F0F0F] border border-[#242424] rounded-xl p-1 flex gap-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-inter transition-colors ${billingCycle === 'monthly' ? 'bg-[#D4A853] text-[#060606]' : 'text-[#A3A3A3] hover:text-[#F0F0F0]'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-lg text-sm font-inter transition-colors ${billingCycle === 'yearly' ? 'bg-[#D4A853] text-[#060606]' : 'text-[#A3A3A3] hover:text-[#F0F0F0]'}`}
            >
              Yearly <span className="text-[10px] ml-1">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.slug}
              className={`bg-[#0F0F0F] border rounded-2xl p-6 flex flex-col ${plan.isPopular ? 'border-[#D4A853]' : 'border-[#242424]'}`}
            >
              {plan.isPopular && (
                <div className="flex items-center gap-1 text-[#D4A853] text-xs font-inter mb-3">
                  <Star className="w-3 h-3" /> Most Popular
                </div>
              )}
              <h3 className="font-space-grotesk text-xl font-semibold text-[#F0F0F0] mb-1">{plan.name}</h3>
              <p className="font-inter text-xs text-[#6B6B6B] mb-4">{plan.description}</p>
              <div className="mb-4">
                <span className="font-cinzel text-3xl font-bold text-[#F0F0F0]">
                  ₹{billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice}
                </span>
                <span className="text-[#6B6B6B] text-sm font-inter">
                  /{billingCycle === 'yearly' ? 'year' : 'month'}
                </span>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm font-inter text-[#A3A3A3]">
                    <Check className="w-3 h-3 text-[#D4A853] flex-shrink-0" /> {feature}
                  </li>
                ))}
              </ul>

              {plan.slug === 'free' ? (
                <button disabled className="w-full py-3 rounded-xl border border-[#333] text-[#555] text-sm font-inter cursor-default">
                  Current Plan
                </button>
              ) : (
                <button
                  onClick={() => setSelectedPlan(plan.slug)}
                  className={`w-full py-3 rounded-xl text-sm font-inter font-semibold transition-colors ${
                    plan.isPopular
                      ? 'bg-[#D4A853] hover:bg-[#C49A4A] text-[#060606]'
                      : 'border border-[#242424] text-[#F0F0F0] hover:bg-[#181818]'
                  }`}
                >
                  Upgrade to {plan.name}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Payment Modal */}
        {selectedPlan && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelectedPlan(null)}>
            <div className="bg-[#0F0F0F] border border-[#242424] rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-space-grotesk text-xl font-semibold text-[#F0F0F0] mb-2">
                Upgrade to {selectedPlan === 'pro' ? 'Pro' : 'Studio'}
              </h3>
              <p className="text-sm text-[#A3A3A3] font-inter mb-4">
                You will be charged ₹{billingCycle === 'yearly' ? (selectedPlan === 'pro' ? '19999' : '49999') : (selectedPlan === 'pro' ? '1999' : '4999')} per {billingCycle === 'yearly' ? 'year' : 'month'}.
              </p>
              <RazorpayCheckout
                planSlug={selectedPlan as 'pro' | 'studio'}
                billingCycle={billingCycle}
                onSuccess={() => {
                  setSelectedPlan(null)
                  navigate('/dashboard')
                }}
              />
              <button
                onClick={() => setSelectedPlan(null)}
                className="w-full mt-3 py-2 text-sm text-[#6B6B6B] hover:text-[#A3A3A3] font-inter"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
