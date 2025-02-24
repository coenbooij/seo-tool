import { getProjectKeywords } from '@/lib/db/keywords';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { Suspense } from 'react';
import { KeywordsOverview } from './keywords-overview';
import { KeywordsSkeleton } from './keywords-skeleton';

export const metadata = {
  title: 'Keywords Overview',
  description: 'Monitor and track your keyword rankings and performance',
};

interface PageParams {
  id: string;
}

interface KeywordsPageProps {
  params: Promise<PageParams>;
}

export default async function KeywordsPage({
  params
}: KeywordsPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    notFound();
  }

  const { id } = await params;

  const project = await prisma.project.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!project) return notFound();

  const keywords = await getProjectKeywords(id);

  return (
    <Suspense fallback={<KeywordsSkeleton />}>
      <KeywordsOverview
        projectId={id}
        initialKeywords={keywords}
      />
    </Suspense>
  );
}
