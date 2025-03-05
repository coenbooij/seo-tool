import { prisma } from "@/lib/prisma";

export async function checkKeywordRanking(keyword: string, domain: string): Promise<number> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    throw new Error("SERPAPI_API_KEY environment variable is required");
  }

  try {
    const response = await fetch(`https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(keyword)}&api_key=${apiKey}&num=100`);
    const data = await response.json();

    if (data.error) {
      throw new Error(`SerpAPI error: ${data.error}`);
    }

    const organicResults = data.organic_results || [];
    
    for (let i = 0; i < organicResults.length; i++) {
      const result = organicResults[i];
      if (result.link && result.link.includes(domain)) {
        return i + 1; // Return 1-based position
      }
    }

    return 0; // Not found in top 100 results
  } catch (error) {
    console.error("Error checking keyword ranking:", error);
    throw error;
  }
}

export async function updateKeywordRanking(keywordId: string, projectDomain: string) {
  try {
    const keyword = await prisma.keyword.findUnique({
      where: { id: keywordId }
    });

    if (!keyword) {
      throw new Error(`Keyword with ID ${keywordId} not found`);
    }

    const rank = await checkKeywordRanking(keyword.keyword, projectDomain);
    
    // Update keyword ranking and history
    await prisma.$transaction([
      prisma.keyword.update({
        where: { id: keywordId },
        data: {
          currentRank: rank,
          bestRank: rank < keyword.bestRank || keyword.bestRank === 0 ? rank : keyword.bestRank,
          lastChecked: new Date(),
        },
      }),
      prisma.keywordHistory.create({
        data: {
          keywordId: keywordId,
          rank: rank,
        },
      }),
    ]);

    return rank;
  } catch (error) {
    console.error("Error updating keyword ranking:", error);
    throw error;
  }
}
