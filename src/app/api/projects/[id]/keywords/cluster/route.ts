import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';
import { KeywordIntent } from '@prisma/client';

interface KeywordInput {
  keyword: string;
  intent: KeywordIntent;
}

interface ClusterRequestBody {
  keywords: KeywordInput[];
}

function determineIntent(keyword: string): KeywordIntent {
  // Simple intent classification based on keyword patterns
  const keyword_lower = keyword.toLowerCase();
  
  if (keyword_lower.includes('buy') || 
      keyword_lower.includes('price') || 
      keyword_lower.includes('cost') ||
      keyword_lower.includes('purchase')) {
    return KeywordIntent.TRANSACTIONAL;
  }
  
  if (keyword_lower.includes('vs') || 
      keyword_lower.includes('compare') || 
      keyword_lower.includes('best') ||
      keyword_lower.includes('review')) {
    return KeywordIntent.COMMERCIAL;
  }
  
  if (keyword_lower.includes('how') || 
      keyword_lower.includes('what') || 
      keyword_lower.includes('why') ||
      keyword_lower.includes('guide')) {
    return KeywordIntent.INFORMATIONAL;
  }
  
  return KeywordIntent.NAVIGATIONAL;
}

function calculateSimilarity(keyword1: string, keyword2: string): number {
  const words1 = new Set(keyword1.toLowerCase().split(/\s+/));
  const words2 = new Set(keyword2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const projectId = (await params).id;

  // Verify project ownership
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      userId: session.user.id,
    },
  });

  if (!project) {
    return new NextResponse('Project not found', { status: 404 });
  }

  try {
    const body = await request.json() as ClusterRequestBody;
    const { keywords } = body;

    if (!Array.isArray(keywords) || !keywords.every(k => typeof k.keyword === 'string' && k.intent)) {
      return new NextResponse('Invalid keywords format', { status: 400 });
    }

    // Group similar keywords
    const similarityThreshold = 0.3;
    const clusters: Array<{
      name: string;
      keywords: string[];
      mainIntent: KeywordIntent;
      score: number;
    }> = [];

    const processedKeywords = new Set<string>();

    for (const keyword of keywords) {
      if (processedKeywords.has(keyword.keyword)) continue;

      const cluster = {
        name: '',
        keywords: [keyword.keyword],
        mainIntent: determineIntent(keyword.keyword),
        score: 1.0,
      };

      // Find similar keywords
      for (const other of keywords) {
        if (other.keyword === keyword.keyword || processedKeywords.has(other.keyword)) continue;
        
        const similarity = calculateSimilarity(keyword.keyword, other.keyword);
        if (similarity >= similarityThreshold) {
          cluster.keywords.push(other.keyword);
          processedKeywords.add(other.keyword);
        }
      }

      // Determine cluster name and score
      const words = cluster.keywords
        .flatMap(k => k.toLowerCase().split(/\s+/))
        .reduce((acc, word) => {
          acc[word] = (acc[word] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

      const mostCommonWords = Object.entries(words)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([word]) => word);

      cluster.name = mostCommonWords.join(' ');
      cluster.score = cluster.keywords.length / keywords.length;

      // Count intents to determine main intent
      const intentCounts = cluster.keywords.reduce((acc, k) => {
        const intent = determineIntent(k);
        acc[intent] = (acc[intent] || 0) + 1;
        return acc;
      }, {} as Record<KeywordIntent, number>);

      cluster.mainIntent = Object.entries(intentCounts)
        .sort((a, b) => b[1] - a[1])[0][0] as KeywordIntent;

      clusters.push(cluster);
      processedKeywords.add(keyword.keyword);
    }

    // Update keywords with cluster information
    await Promise.all(
      clusters.flatMap(cluster =>
        cluster.keywords.map(keyword =>
          prisma.keyword.updateMany({
            where: {
              projectId,
              keyword,
            },
            data: {
              intent: cluster.mainIntent,
            },
          })
        )
      )
    );

    return NextResponse.json({ clusters });
  } catch (error) {
    console.error('Failed to cluster keywords:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}