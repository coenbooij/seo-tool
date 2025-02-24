import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import authOptions from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; keywordId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check if project belongs to user
    const project = await prisma.project.findFirst({
      where: {
        id: (await params).id,
        userId: session.user.id,
      },
    });

    if (!project) {
      return new NextResponse("Project not found", { status: 404 });
    }

    // Delete keyword
    await prisma.keyword.delete({
      where: {
        id: (await params).keywordId,
        projectId: (await params).id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting keyword:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
