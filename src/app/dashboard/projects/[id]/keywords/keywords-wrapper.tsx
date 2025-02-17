'use client';

import { useParams } from 'next/navigation';
import { KeywordsClient } from './keywords-client';
import { KeywordData } from './types';

export function KeywordsWrapper({
  initialKeywords,
}: {
  initialKeywords: KeywordData[];
}) {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="h-full min-h-screen bg-gray-50/50">
      <div className="max-w-screen-2xl mx-1 pt-1">
        <KeywordsClient projectId={id} initialKeywords={initialKeywords} />
      </div>
    </div>
  );
}
