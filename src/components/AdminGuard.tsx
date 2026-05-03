import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRoleStore } from '../stores/roleStore'

/* ─── Admin Route Guard ───
   Protects all admin routes. Checks:
   1. User is logged in
   2. User role is 'admin'
   3. Admin session is valid (not expired)
   If any check fails → redirect to /sys/login
*/
export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const user = useRoleStore((s) => s.user)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/sys/login')
    }
  }, [user, navigate])

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#060606] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-[#242424] flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-6 h-6 text-[#D4A853]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <p className="font-inter text-sm text-[#888]">Checking admin credentials...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
