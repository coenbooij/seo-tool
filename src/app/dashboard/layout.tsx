import Sidebar from '@/components/navigation/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-screen flex">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
        {children}
      </main>
    </div>
  )
}
