import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import authOptions from "@/lib/authOptions";
import { KeywordIntent } from "@prisma/client";
import { KeywordData } from "@/app/dashboard/projects/[id]/keywords/types";

type KeywordInput = Pick<KeywordData, "keyword">;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const project = await prisma.project.findFirst({
      where: {
        id: (await params).id,
        userId: session.user.id,
      },
    });

    if (!project) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }

    const { keywords } = await request.json();
    const projectId = (await params).id;

    // Check for existing keywords
    const existingKeywords = await prisma.keyword.findMany({
      where: {
        projectId,
        keyword: {
          in: keywords.map((k: KeywordInput) => k.keyword.toLowerCase())
        }
      },
      select: {
        keyword: true
      }
    });

    if (existingKeywords.length > 0) {
      return NextResponse.json(
        { 
          message: `The following keywords already exist: ${existingKeywords.map(k => 
            k.keyword.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
          ).join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Create new keywords
    const createdKeywords = await prisma.$transaction(
      keywords.map((keyword: KeywordInput) =>
        prisma.keyword.create({
          data: {
            keyword: keyword.keyword.toLowerCase(),
            searchVolume: 0,
            intent: KeywordIntent.INFORMATIONAL,
            currentRank: 0,
            projectId,
          },
        })
      )
    );

    return NextResponse.json(createdKeywords);
  } catch (error) {
    console.error("Error creating keywords:", error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { message: "Failed to add keywords" },
      { status: 500 }
    );
  }
}
