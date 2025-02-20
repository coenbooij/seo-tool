import { getServerSession } from 'next-auth'
import authOptions from '@/lib/authOptions'
import { redirect } from 'next/navigation'
import { LanguageProvider } from '@/providers/language-provider'
import LandingContent from '@/components/landing/landing-content'

export default async function Home() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect('/dashboard')
  }

  return (
    <LanguageProvider>
      <LandingContent />
    </LanguageProvider>
  )
}
