import Navbar from './Navbar'
import Sidebar from './Sidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-[#060606]">
      <Navbar />
      <Sidebar />
      <main className="lg:ml-[260px] pt-[60px] min-h-[100dvh]">
        {children}
      </main>
    </div>
  )
}
