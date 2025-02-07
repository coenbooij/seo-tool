import { getProjectKeywords } from '@/lib/db/keywords';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { KeywordsClient } from './keywords-client';

export default async function KeywordsPage({
  params
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    notFound();
  }

  const { id } = params;

  const project = await prisma.project.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!project) return notFound();

  const keywords = await getProjectKeywords(id);

  return (
    <Suspense fallback={<div>Loading keywords...</div>}>
      <KeywordsClient
        projectId={id}
        initialKeywords={keywords}
      />
    </Suspense>
  );
}
