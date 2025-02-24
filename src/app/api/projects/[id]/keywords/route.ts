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
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const project = await prisma.project.findFirst({
      where: {
        id: (await params).id,
        userId: session.user.id,
      },
    });

    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }

    const { keywords } = await request.json();

    const createdKeywords = await prisma.$transaction(
      keywords.map(async (keyword: KeywordInput) =>
        prisma.keyword.create({
          data: {
            keyword: keyword.keyword,
            searchVolume: 0,
            intent: KeywordIntent.INFORMATIONAL,
            currentRank: undefined,
            projectId: (await params).id,
          },
        })
      )
    );

    return NextResponse.json(createdKeywords);
  } catch (error) {
    console.error("Error creating keywords:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
