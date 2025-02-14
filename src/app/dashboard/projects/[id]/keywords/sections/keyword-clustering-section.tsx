'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { KeywordData, KeywordIntent, ClusterResponse } from '../types';

interface KeywordClusteringSectionProps {
  projectId: string;
  keywords: KeywordData[];
  onKeywordsUpdate: (keywords: KeywordData[]) => void;
}

interface Cluster {
  name: string;
  keywords: KeywordData[];
  averageVolume: number;
  averageDifficulty: number;
  mainIntent: KeywordIntent;
}

export function KeywordClusteringSection({
  projectId,
  keywords,
  onKeywordsUpdate,
}: KeywordClusteringSectionProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [clusters, setClusters] = useState<Cluster[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
  const [newClusterName, setNewClusterName] = useState('');
  const { toast } = useToast();

  const generateClusters = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch(`/api/projects/${projectId}/keywords/cluster`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: keywords.map(k => ({
            keyword: k.keyword,
            intent: k.intent,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate clusters');
      }

      const data: ClusterResponse = await response.json();
      const newClusters = data.clusters.map(cluster => ({
        name: cluster.name,
        keywords: keywords.filter(k => cluster.keywords.includes(k.keyword)),
        averageVolume: cluster.keywords.reduce((acc, curr) => {
          const kw = keywords.find(k => k.keyword === curr);
          return acc + (kw?.searchVolume || 0);
        }, 0) / cluster.keywords.length,
        averageDifficulty: cluster.keywords.reduce((acc, curr) => {
          const kw = keywords.find(k => k.keyword === curr);
          return acc + (kw?.difficulty || 0);
        }, 0) / cluster.keywords.length,
        mainIntent: cluster.mainIntent,
      }));

      setClusters(newClusters);

      // Update keywords with cluster information
      const updatedKeywords = keywords.map(keyword => {
        const cluster = data.clusters.find(c => 
          c.keywords.includes(keyword.keyword)
        );
        return {
          ...keyword,
          clusterName: cluster?.name,
          clusterScore: cluster?.score,
        };
      });

      onKeywordsUpdate(updatedKeywords);

      toast({
        description: `Generated ${newClusters.length} keyword clusters`,
      });
    } catch (error) {
      console.error('Failed to generate clusters:', error);
      toast({
        variant: 'destructive',
        description: 'Failed to generate keyword clusters',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const createManualCluster = () => {
    if (!newClusterName.trim() || !selectedCluster) return;

    const updatedKeywords = keywords.map(keyword => {
      if (selectedCluster.keywords.some(k => k.id === keyword.id)) {
        return {
          ...keyword,
          clusterName: newClusterName,
        };
      }
      return keyword;
    });

    onKeywordsUpdate(updatedKeywords);
    setNewClusterName('');
    setSelectedCluster(null);

    toast({
      description: `Created new cluster: ${newClusterName}`,
    });
  };

  const getClusterMetrics = (cluster: Cluster) => ({
    averageVolume: Math.round(cluster.keywords.reduce((acc, curr) => acc + curr.searchVolume, 0) / cluster.keywords.length),
    averageDifficulty: Math.round(cluster.keywords.reduce((acc, curr) => acc + curr.difficulty, 0) / cluster.keywords.length),
    totalKeywords: cluster.keywords.length,
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Intent & Clustering</h2>
          <p className="text-sm text-gray-500">
            Group similar keywords and analyze search intent patterns.
          </p>
        </div>
        <Button onClick={generateClusters} disabled={isAnalyzing}>
          {isAnalyzing ? 'Analyzing...' : 'Generate Clusters'}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">Clusters</h3>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {clusters.map((cluster) => {
                  const metrics = getClusterMetrics(cluster);
                  return (
                    <div
                      key={cluster.name}
                      className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                        selectedCluster?.name === cluster.name ? 'bg-gray-100' : ''
                      }`}
                      onClick={() => setSelectedCluster(cluster)}
                    >
                      <div className="font-medium">{cluster.name}</div>
                      <div className="text-xs text-gray-500">
                        {metrics.totalKeywords} keywords • Avg. Volume: {metrics.averageVolume}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-2">
          {selectedCluster ? (
            <div className="space-y-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Cluster Details: {selectedCluster.name}</h3>
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="New cluster name"
                        value={newClusterName}
                        onChange={(e) => setNewClusterName(e.target.value)}
                      />
                      <Button onClick={createManualCluster}>Save As</Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-500">Keywords</div>
                      <div className="text-lg font-semibold">{selectedCluster.keywords.length}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-500">Avg. Volume</div>
                      <div className="text-lg font-semibold">
                        {Math.round(selectedCluster.averageVolume)}
                      </div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded">
                      <div className="text-sm text-gray-500">Avg. Difficulty</div>
                      <div className="text-lg font-semibold">
                        {Math.round(selectedCluster.averageDifficulty)}
                      </div>
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Keyword</TableHead>
                        <TableHead>Intent</TableHead>
                        <TableHead>Volume</TableHead>
                        <TableHead>Difficulty</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedCluster.keywords.map((keyword) => (
                        <TableRow key={keyword.id}>
                          <TableCell>{keyword.keyword}</TableCell>
                          <TableCell>{keyword.intent}</TableCell>
                          <TableCell>{keyword.searchVolume}</TableCell>
                          <TableCell>{keyword.difficulty}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-4 text-center text-gray-500">
                Select a cluster to view details
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}