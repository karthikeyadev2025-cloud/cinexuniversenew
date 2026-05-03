import { useState } from 'react'
import { useRoleStore } from '../stores/roleStore'

interface RazorpayCheckoutProps {
  planSlug: 'pro' | 'studio'
  billingCycle?: 'monthly' | 'yearly'
  onSuccess?: () => void
}

export default function RazorpayCheckout({ planSlug, billingCycle = 'monthly', onSuccess }: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const token = useRoleStore((s) => s.token)

  const handlePayment = async () => {
    setLoading(true)
    setError('')

    try {
      // Step 1: Create order on backend
      const orderResp = await fetch('/api/trpc/payment.createOrder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          json: { planSlug, billingCycle },
        }),
      })

      const orderData = await orderResp.json()
      const order = orderData?.result?.data?.json

      if (!order?.orderId) {
        throw new Error(orderData?.error?.message || 'Failed to create order')
      }

      // Step 2: Open Razorpay checkout
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Cinex Universe',
        description: `${planSlug.toUpperCase()} Plan - ${billingCycle}`,
        order_id: order.orderId,
        handler: async function (response: any) {
          // Step 3: Verify payment
          try {
            const verifyResp = await fetch('/api/trpc/payment.verifyPayment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                json: {
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                },
              }),
            })

            const verifyData = await verifyResp.json()
            if (verifyData?.result?.data?.json?.success) {
              alert('Payment successful! Your plan is now active.')
              onSuccess?.()
            } else {
              setError('Payment verification failed. Please contact support.')
            }
          } catch (err: any) {
            setError('Verification error: ' + err.message)
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#D4A853',
        },
        modal: {
          ondismiss: function () {
            setLoading(false)
            console.log('Payment modal dismissed')
          },
        },
      }

      // @ts-ignore - Razorpay is loaded via script
      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', function (response: any) {
        setError('Payment failed: ' + (response.error?.description || 'Unknown error'))
        setLoading(false)
      })
      rzp.open()
    } catch (err: any) {
      setError(err.message || 'Payment failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}
      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full py-3 bg-[#D4A853] hover:bg-[#C49A4A] text-[#060606] font-semibold rounded-xl transition-colors disabled:opacity-50"
      >
        {loading ? 'Loading...' : `Pay with Razorpay (${billingCycle})`}
      </button>
    </div>
  )
}
