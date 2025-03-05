import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { updateKeywordRanking } from "@/services/seo/ranking-service"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; keywordId: string }> }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: (await params).id },
      select: { domain: true }
    })

    if (!project?.domain) {
      return NextResponse.json(
        { error: "Project domain not found" },
        { status: 404 }
      )
    }

    const rank = await updateKeywordRanking((await params).keywordId, project.domain)

    return NextResponse.json({ rank })
  } catch (error) {
    console.error("Error checking keyword ranking:", error)
    return NextResponse.json(
      { error: "Failed to check keyword ranking" },
      { status: 500 }
    )
  }
}
