import { getProjectKeywords } from '@/lib/db/keywords';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { KeywordsClient } from './keywords-client';

export const metadata = {
  title: 'Keyword Management',
  description: 'Manage and optimize your target keywords using a systematic workflow',
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
    <div className="h-full min-h-screen bg-gray-50/50">
      <div className="max-w-screen-2xl mx-1 pt-1">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-32">
              <div className="text-sm text-gray-500">Loading keywords...</div>
            </div>
          }
        >
          <KeywordsClient
            projectId={id}
            initialKeywords={keywords}
          />
        </Suspense>
      </div>
    </div>
  );
}
