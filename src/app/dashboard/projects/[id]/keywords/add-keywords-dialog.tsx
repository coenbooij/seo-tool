'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { KeywordData, KeywordSource, ContentStatus } from './types';
import { KeywordIntent } from '@prisma/client';

interface AddKeywordsDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (keywords: KeywordData[]) => Promise<void>;
}

export function AddKeywordsDialog({
  open,
  onClose,
  onSubmit,
}: AddKeywordsDialogProps) {
  const [keywordsText, setKeywordsText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const keywordsList = keywordsText
        .split('\n')
        .map(k => k.trim())
        .filter(k => k.length > 0)
        .map(keyword => ({
          id: `temp-${Date.now()}-${Math.random()}`,
          keyword,
          intent: KeywordIntent.INFORMATIONAL,
          searchVolume: 0,
          difficulty: 0,
          competition: 0,
          cpc: 0,
          currentRank: null,
          density: null,
          priority: null,
          notes: null,
          lastChecked: null,
          groups: [],
          source: KeywordSource.MANUAL,
          serpFeatures: [],
          contentStatus: ContentStatus.NOT_STARTED,
          contentPriority: 0,
          projectId: '', // Will be set by the API
        }));

      if (keywordsList.length > 0) {
        await onSubmit(keywordsList);
        setKeywordsText('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add Keywords</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Textarea
              value={keywordsText}
              onChange={(e) => setKeywordsText(e.target.value)}
              placeholder="Enter keywords (one per line)"
              className="min-h-[200px] font-mono text-sm"
            />
            <p className="text-sm text-gray-500">
              Add one keyword per line. Keywords will be analyzed in the workflow.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h3 className="font-medium">Tips for adding keywords:</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Include variations (singular/plural)</li>
              <li>Add long-tail keywords</li>
              <li>Consider user intent</li>
              <li>Include common misspellings</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!keywordsText.trim() || isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-400 text-white"
            >
              {isSubmitting ? 'Adding...' : 'Add Keywords'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
