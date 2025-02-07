import React from 'react';
import { KeywordData } from './types';

interface CompetitorGapAnalysisProps {
  projectKeywords: KeywordData[];
  competitorKeywords: CompetitorKeywordData[];
}

interface CompetitorKeywordData extends KeywordData {
  competitor: string;
  rank: number;
  opportunity: number;
}

export const CompetitorGapAnalysis: React.FC<CompetitorGapAnalysisProps> = ({
  projectKeywords,
  competitorKeywords,
}) => {
  const opportunities = competitorKeywords.filter(
    (compKeyword) =>
      !projectKeywords.some((projKeyword) => projKeyword.keyword === compKeyword.keyword)
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Competitor Gap Analysis</h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-4">Your Keywords</h3>
          <div className="space-y-2">
            {projectKeywords.map((keyword) => (
              <div key={keyword.keyword} className="p-2 bg-gray-50 rounded">
                <div className="font-medium">{keyword.keyword}</div>
                <div className="text-sm text-gray-600">
                  Volume: {keyword.searchVolume} | CPC: ${keyword.cpc.toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h3 className="text-xl font-semibold mb-4">Competitor Keywords</h3>
          <div className="space-y-2">
            {competitorKeywords.map((keyword) => (
              <div
                key={`${keyword.competitor}-${keyword.keyword}`}
                className="p-2 bg-gray-50 rounded"
              >
                <div className="font-medium">{keyword.keyword}</div>
                <div className="text-sm text-gray-600">
                  Competitor: {keyword.competitor} | Rank: {keyword.rank}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="text-xl font-semibold mb-4">Opportunities</h3>
        <div className="space-y-4">
          {opportunities.map((opportunity) => (
            <div
              key={`${opportunity.competitor}-${opportunity.keyword}`}
              className="border-l-4 border-green-500 pl-4 py-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{opportunity.keyword}</h4>
                  <p className="text-sm text-gray-600">
                    Found in: {opportunity.competitor}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-medium">
                    Opportunity Score: {(opportunity.opportunity * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600">
                    Volume: {opportunity.searchVolume}
                  </div>
                </div>
              </div>
              <div className="mt-2">
                <button
                  className="text-sm text-blue-600 hover:text-blue-800"
                  onClick={() => {
                    // Handle targeting this keyword
                    console.log('Target keyword:', opportunity.keyword);
                  }}
                >
                  Target This Keyword
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CompetitorGapAnalysis;