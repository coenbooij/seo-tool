'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { KeywordData, ContentStatus } from '../types';

interface KeywordContentSectionProps {
  projectId: string;
  keywords: KeywordData[];
  onKeywordsUpdate: (keywords: KeywordData[]) => void;
}

export function KeywordContentSection({
  projectId,
  keywords,
  onKeywordsUpdate,
}: KeywordContentSectionProps) {
  const [selectedKeyword, setSelectedKeyword] = useState<KeywordData | null>(null);
  const [contentBrief, setContentBrief] = useState('');
  const [contentType, setContentType] = useState('');
  const { toast } = useToast();

  const getKeywordsByStatus = (status: ContentStatus) => {
    return keywords.filter(k => k.contentStatus === status);
  };

  const updateKeywordContent = async (
    keyword: KeywordData,
    updates: Partial<KeywordData>
  ) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/keywords/${keyword.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update keyword content');
      }

      const updatedKeyword = await response.json();
      onKeywordsUpdate(
        keywords.map(k => (k.id === keyword.id ? updatedKeyword : k))
      );

      toast({
        description: 'Content plan updated successfully',
      });
    } catch (error) {
      console.error('Failed to update content plan:', error);
      toast({
        variant: 'destructive',
        description: 'Failed to update content plan',
      });
    }
  };

  const contentTypes = [
    'Blog Post',
    'Product Page',
    'Category Page',
    'Landing Page',
    'Guide',
    'Tutorial',
    'FAQ',
    'Comparison',
    'Review',
  ];

  const handleStatusChange = (keywordId: string, newStatus: ContentStatus) => {
    const keyword = keywords.find(k => k.id === keywordId);
    if (keyword) {
      updateKeywordContent(keyword, { contentStatus: newStatus });
    }
  };

  const handleSaveContentPlan = () => {
    if (!selectedKeyword) return;

    updateKeywordContent(selectedKeyword, {
      contentType,
      contentBrief,
      contentStatus: ContentStatus.PLANNED,
    });

    setSelectedKeyword(null);
    setContentBrief('');
    setContentType('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Content Planning</h2>
        <p className="text-sm text-gray-500">
          Plan and track content creation for your target keywords.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-6">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Content Status</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium">Not Started</div>
                  <div className="text-2xl">{getKeywordsByStatus(ContentStatus.NOT_STARTED).length}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Planned</div>
                  <div className="text-2xl">{getKeywordsByStatus(ContentStatus.PLANNED).length}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">In Progress</div>
                  <div className="text-2xl">{getKeywordsByStatus(ContentStatus.IN_PROGRESS).length}</div>
                </div>
                <div>
                  <div className="text-sm font-medium">Published</div>
                  <div className="text-2xl">{getKeywordsByStatus(ContentStatus.PUBLISHED).length}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">Content Planning</h3>
              <div className="space-y-4">
                <Select 
                  value={selectedKeyword?.id || ''} 
                  onValueChange={(value) => {
                    const keyword = keywords.find(k => k.id === value);
                    setSelectedKeyword(keyword || null);
                    setContentBrief(keyword?.contentBrief || '');
                    setContentType(keyword?.contentType || '');
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a keyword" />
                  </SelectTrigger>
                  <SelectContent>
                    {keywords.map((keyword) => (
                      <SelectItem key={keyword.id} value={keyword.id}>
                        {keyword.keyword}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedKeyword && (
                  <>
                    <Select 
                      value={contentType} 
                      onValueChange={setContentType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Content type" />
                      </SelectTrigger>
                      <SelectContent>
                        {contentTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Textarea
                      placeholder="Content brief..."
                      value={contentBrief}
                      onChange={(e) => setContentBrief(e.target.value)}
                      rows={6}
                    />

                    <Button 
                      onClick={handleSaveContentPlan}
                      disabled={!contentType || !contentBrief}
                    >
                      Save Content Plan
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-2">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-4">Content Tracking</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Keyword</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keywords
                    .filter(k => k.contentStatus !== ContentStatus.NOT_STARTED)
                    .map((keyword) => (
                      <TableRow key={keyword.id}>
                        <TableCell>{keyword.keyword}</TableCell>
                        <TableCell>{keyword.contentType || '-'}</TableCell>
                        <TableCell>
                          <Select 
                            value={keyword.contentStatus} 
                            onValueChange={(value: ContentStatus) => 
                              handleStatusChange(keyword.id, value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(ContentStatus).map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status.replace(/_/g, ' ')}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{keyword.contentPriority}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            onClick={() => setSelectedKeyword(keyword)}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}