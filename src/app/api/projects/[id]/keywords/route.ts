import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { KeywordAnalyzer } from '@/services/seo/analyzers/keyword-analyzer'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = await Promise.resolve(params.id)
    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 })
    }

    const projectId = parseInt(id)
    if (isNaN(projectId)) {
      return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 })
    }

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: parseInt(session.user.id)
      }
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Ensure domain has proper protocol
    const domain = project.domain.startsWith('http') 
      ? project.domain 
      : `https://${project.domain}`

    try {
      // Fetch the HTML content
      const response = await fetch(domain)
      if (!response.ok) {
        throw new Error(`Failed to fetch ${domain}: ${response.statusText}`)
      }
      const html = await response.text()

      // Analyze keywords
      const analyzer = new KeywordAnalyzer()
      const keywords = await analyzer.analyze(html)

      return NextResponse.json({
        keywords,
        analyzed: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error analyzing keywords:', error)
      return NextResponse.json(
        { error: 'Failed to analyze keywords. Please verify the domain is accessible.' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error in keywords route:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
